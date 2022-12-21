import { createServer as createViteDevServer } from 'vite';

import { PACKAGE_ROOT } from './constants/index';
import { resolveConfig } from './config';
import { createVitePlugins } from './vitePlugins';

export async function createDevServer(
  root: string,
  restart: () => Promise<void>
) {
  const [config, dependences] = await resolveConfig(
    root,
    'serve',
    'development'
  );
  console.log(config);

  return createViteDevServer({
    root: PACKAGE_ROOT,
    plugins: createVitePlugins(config, dependences, restart),
    // 允许访问不在根目录下的文件夹
    server: {
      fs: {
        allow: [PACKAGE_ROOT]
      }
    }
  });
}
