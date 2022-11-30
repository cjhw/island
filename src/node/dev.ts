import { createServer as createViteDevServer } from 'vite';
import { pluginIndexHtml } from './plugin-island/indexHtml';
import pluginReact from '@vitejs/plugin-react';
import { PACKAGE_ROOT } from './constants/index';

export async function createDevServer(root = process.cwd()) {
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
