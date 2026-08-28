import { defineConfig } from 'vite';

export default defineConfig({
  build: {
    target: 'es2022',
    cssCodeSplit: false,
    rollupOptions: {
      output: {
        entryFileNames: 'assets/app.js',
        chunkFileNames: 'assets/[name].js',
        assetFileNames: (asset) => asset.names.some((name) => name.endsWith('.css'))
          ? 'assets/style.css'
          : 'assets/[name][extname]'
      }
    }
  }
});
