import { pluginMdxRollup } from './pluginMdxRollup';
import { Plugin } from 'vite';
import { pluginMdxHMR } from './pluginMdxHmr';

// Vite热更新逻辑
// 1.监听文件变动
// 2.构建侧确定热更新的边界模块
// 3.浏览器侧执行更新逻辑

export async function createMdxPlugins() {
  return [await pluginMdxRollup(), pluginMdxHMR()];
}
