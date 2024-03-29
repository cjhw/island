import { build as viteBuild, InlineConfig } from 'vite';
import type { RollupOutput } from 'rollup';
import {
  CLIENT_ENTRY_PATH,
  EXTERNALS,
  MASK_SPLITTER,
  PACKAGE_ROOT,
  SERVER_ENTRY_PATH,
  TEMP_PATH
} from './constants';
import path, { dirname, join } from 'path';
import fs from 'fs-extra';
import ora from 'ora';
import { resolvePath } from '../utils';
import { SiteConfig } from '../shared/types/index';
import { createVitePlugins } from './vitePlugins';
import { Route } from './plugin-routes';
import { RenderResult } from 'runtime/ssr-entry';
import { HelmetData } from 'react-helmet-async';
import { pathToFileURL } from 'url';

const spinner = ora();

const CLIENT_OUTPUT = 'build';

export async function bundle(root: string, config: SiteConfig) {
  const resolveViteConfig = async (
    isServer: boolean
  ): Promise<InlineConfig> => ({
    mode: 'production',
    root,
    plugins: await createVitePlugins(config, undefined, undefined, isServer),
    ssr: {},
    // 防止esbuild提前编译tsx
    esbuild: {
      jsx: 'preserve'
    },
    build: {
      ssr: isServer,
      outDir: isServer ? join(TEMP_PATH, 'ssr') : join(root, CLIENT_OUTPUT),
      rollupOptions: {
        input: isServer ? SERVER_ENTRY_PATH : CLIENT_ENTRY_PATH,
        output: {
          format: 'es'
        },
        external: EXTERNALS
      }
    }
  });

  spinner.start('Building client + server bundles...');

  try {
    const [clientBundle, serverBundle] = await Promise.all([
      // client build
      viteBuild(await resolveViteConfig(false)),
      // server build
      viteBuild(await resolveViteConfig(true))
    ]);
    spinner.succeed('Build client + server bundles success');
    const publicDir = join(root, 'public');
    if (fs.pathExistsSync(publicDir)) {
      await fs.copy(publicDir, join(root, CLIENT_OUTPUT));
    }
    await fs.copy(join(PACKAGE_ROOT, 'vendors'), join(root, CLIENT_OUTPUT));
    return [clientBundle, serverBundle] as [RollupOutput, RollupOutput];
  } catch (error) {
    console.log(error);
    spinner.fail('Build client + server bundles fail');
  }
}

export async function build(root: string = process.cwd(), config: SiteConfig) {
  // 1. bundle - client 端 + server 端
  const [clientBundle] = await bundle(root, config);
  // 2. 引入 server-entry 模块
  const serverEntryPath = join(TEMP_PATH, 'ssr', 'ssr-entry.mjs');

  const { render, routes } = await import(
    pathToFileURL(serverEntryPath) as unknown as string
  );
  // 3. 服务端渲染，产出 HTML
  await renderPage(render, root, clientBundle, routes);
}

async function buildIslands(
  root: string,
  islandToPathMap: Record<string, string>
) {
  // 效果如下
  // import { Aside } from 'some-path';
  // 全局注册 Islands 组件
  // window.ISLANDS = { Aside };
  // 注册 Islands 组件的 props 数据
  // window.ISLAND_PROPS = JSON.parse(
  //   document.getElementById('island-props').textContent
  // );
  // 根据 islandPathToMap 拼接模块代码内容
  const islandsInjectCode = `
    ${Object.entries(islandToPathMap)
      .map(
        ([islandName, islandPath]) =>
          `import { ${islandName} } from '${islandPath}';`
      )
      .join('')}
window.ISLANDS = { ${Object.keys(islandToPathMap).join(', ')} };
window.ISLAND_PROPS = JSON.parse(
  document.getElementById('island-props').textContent
);
  `;

  const injectId = 'island:inject';

  return viteBuild({
    mode: 'production',
    esbuild: {
      jsx: 'automatic'
    },
    build: {
      // 输出目录
      outDir: path.join(TEMP_PATH, 'ssr'),
      rollupOptions: {
        input: injectId,
        external: EXTERNALS
      }
    },
    plugins: [
      {
        name: 'island:inject',
        enforce: 'post',
        resolveId(id) {
          if (id.includes(MASK_SPLITTER)) {
            const [originId, importer] = id.split(MASK_SPLITTER);
            return this.resolve(originId, importer, { skipSelf: true });
          }

          if (id === injectId) {
            return id;
          }
        },
        load(id) {
          if (id === injectId) {
            return islandsInjectCode;
          }
        },
        // 对于 Islands Bundle，我们只需要 JS 即可，其它资源文件可以删除
        generateBundle(_, bundle) {
          for (const name in bundle) {
            if (bundle[name].type === 'asset') {
              delete bundle[name];
            }
          }
        }
      }
    ]
  });
}

export async function renderPage(
  render: (
    pagePath: string,
    helmetContext: Record<string, unknown>
  ) => RenderResult,
  root: string,
  clientBundle: RollupOutput,
  routes: Route[]
) {
  const clientChunk = clientBundle.output.find(
    (chunk) => chunk.type === 'chunk' && chunk.isEntry
  );
  spinner.info('Rendering page in server side...');
  await Promise.all(
    [...routes, { path: '/404' }].map(async (route) => {
      const routePath = route.path;
      const helmetContext = {
        context: {}
      } as HelmetData;
      const {
        appHtml,
        islandToPathMap,
        islandProps = []
      } = await render(routePath, helmetContext.context);
      const styleAssets = clientBundle.output.filter(
        (chunk) => chunk.type === 'asset' && chunk.fileName.endsWith('.css')
      );
      const islandBundle = await buildIslands(root, islandToPathMap);
      const islandsCode = (islandBundle as RollupOutput).output[0].code;
      const { helmet } = helmetContext.context;
      const normalizeVendorFilename = (fileName: string) =>
        fileName.replace(/\//g, '_') + '.js';
      const html = `
<!DOCTYPE html>
<html>
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width,initial-scale=1">
    ${helmet?.title?.toString() || ''}
    ${helmet?.meta?.toString() || ''}
    ${helmet?.link?.toString() || ''}
    ${helmet?.style?.toString() || ''}
    <meta name="description" content="xxx">
    ${styleAssets
      .map((item) => `<link rel="stylesheet" href="/${item.fileName}">`)
      .join('\n')}
      <script type="importmap">
      {
        "imports": {
          ${EXTERNALS.map(
            (name) => `"${name}": "/${normalizeVendorFilename(name)}"`
          ).join(',')}
      }
  }
</script>
  </head>
  <body>
    <div id="root">${appHtml}</div>
    <script type="module">${islandsCode}</script>
    <script type="module" src="/${clientChunk?.fileName}"></script>
    <script id="island-props">${JSON.stringify(islandProps)}</script>
  </body>
</html>`.trim();
      const fileName = routePath.endsWith('/')
        ? `${routePath}index.html`
        : `${routePath}.html`;
      await fs.ensureDir(join(root, 'build', dirname(fileName)));
      await fs.writeFile(join(root, 'build', fileName), html);
    })
  );
  // await fs.remove(join(root, '.temp'));
}
