import { ISLAND_JSX_RUNTIME_PATH, TS_REGEX, MD_REGEX } from '../constants';
import { Plugin, transformWithEsbuild } from 'vite';
import { transformAsync } from '@babel/core';
import babelPluginIsland from '../babel-plugin-island';
import { SiteConfig } from 'shared/types/index';

export function pluginIslandTransform(
  config: SiteConfig,
  isSSR: boolean
): Plugin {
  return {
    name: 'island:vite-plugin-internal',
    async transform(code, id, options) {
      // Note: @vitejs/plugin-react 无法编译node_modules中的文件，需要手动编译
      // 在生产中，我们应该转换__island道具来收集孤岛组件
      if (options?.ssr && (TS_REGEX.test(id) || MD_REGEX.test(id))) {
        const strippedTypes = await transformWithEsbuild(code, id, {
          jsx: 'preserve',
          loader: 'tsx'
        });

        // console.log((await strippedTypes).code);

        const result = await transformAsync((await strippedTypes).code, {
          filename: id,
          presets: [
            [
              '@babel/preset-react',
              {
                runtime: 'automatic',
                importSource: isSSR ? ISLAND_JSX_RUNTIME_PATH : 'react'
              }
            ]
          ],
          plugins: [babelPluginIsland]
        });
        return {
          code: result?.code || code,
          map: result?.map
        };
      }
    }
  };
}
