import assert from 'assert';
import { Plugin } from 'vite';

export function pluginMdxHMR(): Plugin {
  let viteReactPlugin: Plugin;
  return {
    name: 'vite-plugin-mdx-hmr',
    // 只在开发阶段使用
    apply: 'serve',
    configResolved(config) {
      viteReactPlugin = config.plugins.find(
        (plugin) => plugin.name === 'vite:react-babel'
      ) as Plugin;
    },
    async transform(code, id, options) {
      if (/\.mdx?$/.test(id)) {
        assert(typeof viteReactPlugin.transform === 'function');
        const result = await viteReactPlugin.transform.call(
          this,
          code,
          // 让react的插件编译mdx模块
          id + '?.jsx',
          options
        );
        if (
          result &&
          typeof result === 'object' &&
          !result.code?.includes('import.meta.hot.accept()')
        ) {
          result.code += 'import.meta.hot.accept()';
        }
        return result;
      }
    }
  };
}
