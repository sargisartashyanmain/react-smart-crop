import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { resolve } from 'path';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  base: '/react-smart-crop/', 
  resolve: {
    alias: {
      'react': resolve(__dirname, 'node_modules/react'),
      'react-dom': resolve(__dirname, 'node_modules/react-dom'),
      '@sargis-artashyan/react-smart-crop': resolve(__dirname, '../src/index.ts')
    }
  },
  build: {
    outDir: 'dist',
    emptyOutDir: true
  },
  server:{
    fs: {
      allow: [
        // разрешаем доступ к родительской папке библиотеки
        resolve(__dirname, '../')
      ]
    }
  }
});