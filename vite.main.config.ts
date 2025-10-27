import { defineConfig } from 'vite';
import { builtinModules } from 'node:module';
import path from 'node:path';

export default defineConfig({
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  build: {
    outDir: 'dist',
    lib: {
      entry: path.resolve(__dirname, 'src/main.tsx'),
      formats: ['es'],
      fileName: () => 'main.js',
    },
    rollupOptions: {
      external: [...builtinModules, /^node:/, '@devvit/public-api'],
    },
    sourcemap: true,
    target: 'esnext',
  },
  esbuild: {
    jsx: 'transform',
    jsxFactory: 'Devvit.createElement',
    jsxFragment: 'Devvit.Fragment',
  },
});
