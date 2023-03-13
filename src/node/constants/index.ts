import { join } from 'path';

export const TS_REGEX = /(c|m)?tsx?$/;

export const MD_REGEX = /\.mdx?$/;

export const PACKAGE_ROOT = join(__dirname, '..');

export const RUNTIME_PATH = join(PACKAGE_ROOT, 'src', 'runtime');

export const ISLAND_JSX_RUNTIME_PATH = RUNTIME_PATH;

export const CLIENT_ENTRY_PATH = join(RUNTIME_PATH, 'client-entry.tsx');

export const SERVER_ENTRY_PATH = join(RUNTIME_PATH, 'ssr-entry.tsx');

export const TEMP_PATH = join(PACKAGE_ROOT, 'node_modules', '.island');

export const DEFAULT_HTML_PATH = join(PACKAGE_ROOT, 'template.html');

export const MASK_SPLITTER = '!!ISLAND!!';

export const EXTERNALS = [
  'react',
  'react-dom',
  'react-dom/client',
  'react/jsx-runtime'
];
