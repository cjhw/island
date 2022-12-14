import { pluginIndexHtml } from './plugin-island/indexHtml';
import { SiteConfig } from '../shared/types/index';
import { pluginConfig } from './plugin-island/config';
import { pluginRoutes } from './plugin-routes';
import pluginReact from '@vitejs/plugin-react';
import { createMdxPlugins } from './plugin-mdx/index';
import { Plugin } from 'vite';

export async function createVitePlugins(
  config: SiteConfig,
  dependences?: string[],
  restartServer?: () => Promise<void>,
  isSSR = false
) {
  return [
    pluginIndexHtml(),
    pluginReact({ jsxRuntime: 'automatic' }),
    pluginConfig(config, dependences, restartServer),
    pluginRoutes({ root: config.root, isSSR }),
    createMdxPlugins()
  ] as Plugin[];
}
