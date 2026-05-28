import { defineConfig } from 'tsup';

export default defineConfig({
  entry: ['src/index.ts'],
  format: ['cjs'],
  target: 'node18',
  bundle: true,
  clean: true,
  shims: true,
  banner: {
    js: '#!/usr/bin/env node',
  },
});
