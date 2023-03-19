import { defineConfig } from 'tsup';

export default defineConfig({
  entryPoints: [
    './src/node/cli.ts',
    './src/node/index.ts',
    './src/node/dev.ts'
  ],
  bundle: true,
  splitting: true,
  minify: process.env.NODE_ENV === 'production',
  outDir: 'dist',
  format: ['cjs', 'esm'],
  dts: true,
  // 打入pollyfill
  shims: true,
  clean: true
});
