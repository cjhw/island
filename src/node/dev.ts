import { createServer as createViteDevServer } from 'vite';
import { pluginIndexHtml } from './plugin-island/indexHtml';
import pluginReact from '@vitejs/plugin-react';
import { PACKAGE_ROOT } from './constants/index';
import { resolveConfig } from './config';

export async function createDevServer(root = process.cwd()) {
  const config = await resolveConfig(root, 'serve', 'development');
  console.log(config);

  return createViteDevServer({
    root,
    plugins: [pluginIndexHtml(), pluginReact()],
    // 允许访问不在根目录下的文件夹
    server: {
      fs: {
        allow: [PACKAGE_ROOT]
      }
    }
  });
}
