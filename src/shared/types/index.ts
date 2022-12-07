import { UserConfig as ViteConfiguration } from 'vite';

export type NavItemWithLink = {
  text: string;
  link: string;
};

export interface SidebarGroup {
  text: string;
  items: SidebarItem[];
}

export type SidebarItem = {
  text: string;
  link: string;
};

export interface Sidebar {
  [path: string]: SidebarGroup[];
}

export interface Footer {
  message: string;
}

export interface ThemeConfig {
  nav?: NavItemWithLink[];
  sidebar?: Sidebar;
  footer?: Footer;
}

export interface UserConfig {
  title: string;
  descriptiion: string;
  themeConfig: any;
  vite: ViteConfiguration;
}
