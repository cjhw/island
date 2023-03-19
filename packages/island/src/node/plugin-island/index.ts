import { SiteConfig } from 'shared/types';
import { pluginConfig } from './config';
import { pluginIndexHtml } from './indexHtml';
import type { Plugin } from 'vite';
import { pluginIslandTransform } from './islandTransform';

export function pluginIsland(
  config: SiteConfig,
  dependences?: string[],
  restartServer?: () => Promise<void>,
  isSSR?: boolean
): Plugin[] {
  return [
    pluginConfig(config, dependences, restartServer),
    pluginIndexHtml(),
    pluginIslandTransform(config, isSSR)
  ];
}
