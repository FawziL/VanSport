import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': '/src',
    },
  },
  server: {
    proxy: {
      '/api': { target: 'http://127.0.0.1:8000', changeOrigin: true, secure: false },
      '/admin': { target: 'http://127.0.0.1:8000', changeOrigin: true, secure: false },
      '/auth':  { target: 'http://127.0.0.1:8000', changeOrigin: true, secure: false },
      '/media': { target: 'http://127.0.0.1:8000', changeOrigin: true, secure: false },
    },
  },
});
