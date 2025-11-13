import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from "path";

import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Change port if needed
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173, // frontend dev server
    proxy: {
      '/api': {
        target: 'http://127.0.0.1:8000', // Django backend
        changeOrigin: true,
        secure: false,
      },
    },
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
