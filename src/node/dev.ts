import { createServer as createViteDevServer } from 'vite';
import { pluginIndexHtml } from './plugin-island/indexHtml';
import pluginReact from '@vitejs/plugin-react';
import { PACKAGE_ROOT } from './constants/index';
import { resolveConfig } from './config';
import { pluginConfig } from './plugin-island/config';
import { pluginRoutes } from './plugin-routes/index';

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
    plugins: [
      pluginIndexHtml(),
      pluginReact(),
      pluginConfig(config, dependences, restart),
      pluginRoutes({ root: config.root })
    ],
    // 允许访问不在根目录下的文件夹
    server: {
      fs: {
        allow: [PACKAGE_ROOT]
      }
    }
  });
}
