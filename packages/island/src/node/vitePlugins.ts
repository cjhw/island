import { pluginIndexHtml } from './plugin-island/indexHtml';
import { SiteConfig } from '../shared/types/index';
import { pluginConfig } from './plugin-island/config';
import { pluginRoutes } from './plugin-routes';
import pluginReact from '@vitejs/plugin-react';
import { createMdxPlugins } from './plugin-mdx/index';
import { Plugin } from 'vite';
import pluginUnocss from 'unocss/vite';
import unocssOptions from './unocssOptions';
import path from 'path';
import { ISLAND_JSX_RUNTIME_PATH, PACKAGE_ROOT } from './constants';
import babelPluginIsland from './babel-plugin-island';
import { pluginIsland } from './plugin-island';

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
