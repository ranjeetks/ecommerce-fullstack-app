import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import path from "path";

import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Where the dev server forwards /api and /media. Set by docker-compose
// (VITE_PROXY_TARGET=http://backend:8000); there is intentionally no fallback.
const PROXY_TARGET = process.env.VITE_PROXY_TARGET;
if (!PROXY_TARGET) {
  console.warn("[vite] VITE_PROXY_TARGET is not set: /api and /media requests will not be proxied");
}

// keep the browser's Host (localhost:5173) so Django builds image URLs the browser can reach,
// instead of the Docker-internal http://backend:8000
const proxyRule = PROXY_TARGET
  ? { target: PROXY_TARGET, changeOrigin: false, secure: false }
  : undefined;

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173, // frontend dev server
    proxy: proxyRule && {
      '/api': proxyRule,   // API calls -> Django
      '/media': proxyRule, // uploaded images (dev: served by Django from backend/media)
    },
  },
  test: {
    environment: 'happy-dom',
    globals: true,
    setupFiles: './src/test/setup.ts',
    css: false,
  },
  resolve: {
    alias: {
      "@assets": path.resolve(__dirname, "src/assets"),
      "@components": path.resolve(__dirname, "src/components"),
      "@context": path.resolve(__dirname, "src/context"),
      "@hooks": path.resolve(__dirname, "src/hooks"),
      "@pages": path.resolve(__dirname, "src/pages"),
      "@routes": path.resolve(__dirname, "src/routes"),
      "@services": path.resolve(__dirname, "src/services"),
      "@interfaces": path.resolve(__dirname, "src/interfaces"),
      "@utils": path.resolve(__dirname, "src/utils"),
      "@constants": path.resolve(__dirname, "src/constants"),
      "@businessLogic": path.resolve(__dirname, "src/businessLogic"),
    },
  },
});
