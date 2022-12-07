import { resolve } from 'path';
import fs from 'fs-extra';
import { loadConfigFromFile } from 'vite';
import { SiteConfig, UserConfig } from 'shared/types/index';

type RawConfig =
  | UserConfig
  | Promise<UserConfig>
  | (() => UserConfig | Promise<UserConfig>);

function getUserConfigPath(root: string) {
  try {
    const supportConfigFiles = ['config.ts', 'config.js'];
    const configPath = supportConfigFiles
      .map((file) => resolve(root, file))
      .find(fs.pathExistsSync);
    return configPath;
  } catch (e) {
    console.log('Failed to load user config');
    throw e;
  }
}

export async function resolveUserConfig(
  root: string,
  command: 'serve' | 'build',
  mode: 'production' | 'development'
) {
  // 1. 获取配置文件路径
  const configPath = getUserConfigPath(root);
  // 2. 读取配置文件的内容
  const result = await loadConfigFromFile({ command, mode }, configPath, root);
  if (result) {
    const { config: rawConfig = {} as RawConfig, dependencies } = result;
    // 三种情况:
    // 1. object
    // 2. promise
    // 3. function
    const userConfig = await (typeof rawConfig === 'function'
      ? rawConfig()
      : rawConfig);
    return [configPath, userConfig, dependencies] as const;
  } else {
    return [configPath, {} as UserConfig, []] as const;
  }
}

function resolveSiteData(userConfig: UserConfig) {
  return {
    title: userConfig.title || 'Island.js',
    description: userConfig.description || 'SSG Framework',
    themeConfig: userConfig.themeConfig || {},
    vite: userConfig.vite || {}
  };
}

export async function resolveConfig(
  root: string,
  command: 'serve' | 'build',
  mode: 'development' | 'production'
): Promise<[SiteConfig, string[]]> {
  const [configPath, userConfig, dependences] = await resolveUserConfig(
    root,
    command,
    mode
  );
  const siteConfig: SiteConfig = {
    root,
    configPath,
    siteData: resolveSiteData(userConfig as UserConfig)
  };
  return [siteConfig, dependences as string[]];
}

export function defineConfig(config: UserConfig): UserConfig {
  return config;
}
