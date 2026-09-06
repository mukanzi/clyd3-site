import { defineConfig } from 'vite';
import { resolve } from 'node:path';

export default defineConfig({
  base: '/',
  build: {
    outDir: 'dist',
    emptyOutDir: true,
    rollupOptions: {
      input: {
        home: resolve(__dirname, 'index.html'),
        fut: resolve(__dirname, 'fut/index.html'),
        music: resolve(__dirname, 'music/index.html')
      }
    }
  }
});
