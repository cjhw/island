import { pluginMdxRollup } from './pluginMdxRollup';
import { Plugin } from 'vite';

export async function createMdxPlugins() {
  return [await pluginMdxRollup()];
}
