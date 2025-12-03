// vite.config.ts
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
 plugins: [react()],

 server: {
  host: true,
  port: 5173,
  strictPort: true,
  cors: true,

  // 🔥 Proxy recomendado (puedes usarlo, pero no es obligatorio)
  proxy: {
   "/api": {
    target: "http://localhost:4000",
    changeOrigin: true,
    rewrite: (path) => path.replace(/^\/api/, "")
   }
  }
 }
});
