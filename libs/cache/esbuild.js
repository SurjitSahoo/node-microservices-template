/* eslint-disable import/no-extraneous-dependencies */
import { build } from 'esbuild';

await build({
  entryPoints: ['./src/index.js'],
  outfile: './dist/index.js',
  bundle: true,
  minify: true,
  target: ['esnext'],
  logLevel: 'info',
  treeShaking: true, // Remove unused code
});
