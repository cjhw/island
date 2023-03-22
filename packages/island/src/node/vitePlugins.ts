import { SiteConfig } from '../shared/types/index';
import { pluginRoutes } from './plugin-routes';
import pluginReact from '@vitejs/plugin-react';
import { createMdxPlugins } from './plugin-mdx/index';
import { Plugin } from 'vite';
import pluginUnocss from 'unocss/vite';
import unocssOptions from './unocssOptions';
import babelPluginIsland from './babel-plugin-island';
import { pluginIsland } from './plugin-island';
import { ISLAND_JSX_RUNTIME_PATH } from './constants';

export async function createVitePlugins(
  config: SiteConfig,
  dependences?: string[],
  restartServer?: () => Promise<void>,
  isSSR = false
) {
  return [
    pluginUnocss(unocssOptions),
    await createMdxPlugins(),
    pluginIsland(config, dependences, restartServer, isSSR),
    isSSR
      ? []
      : pluginReact({
          jsxRuntime: 'automatic',
          jsxImportSource: isSSR ? ISLAND_JSX_RUNTIME_PATH : 'react',
          babel: {
            plugins: [babelPluginIsland]
          }
        }),
    pluginRoutes({ root: config.root, isSSR })
  ] as Plugin[];
}
