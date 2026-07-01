import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, '.', '');
  const target = env.VITE_API_URL || 'http://localhost:8080';

  return {
    plugins: [react(), tailwindcss()],
    resolve: {
      alias: { '@': '/src' },
    },
    server: {
      proxy: [
        {
          context: [
            '/api', '/auth', '/products', '/categories', '/cart',
            '/orders', '/order-items', '/reviews', '/notifications',
            '/transactions', '/shipments', '/bug-reports',
            '/payment-methods', '/exchange-rate', '/users',
          ],
          target,
          changeOrigin: true,
        },
      ],
      headers: {
        'Cross-Origin-Opener-Policy': 'same-origin-allow-popups',
      },
    },
  };
});
