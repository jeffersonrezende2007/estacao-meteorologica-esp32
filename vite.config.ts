import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { fileURLToPath, URL } from 'node:url'

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')

  return {
    plugins: [react(), tailwindcss()],
    resolve: {
      alias: {
        '@': fileURLToPath(new URL('./src', import.meta.url)),
      },
    },
    server: {
      // Repassa /api/* para o ESP32 (resolve o CORS no desenvolvimento)
      proxy: {
        '/api': {
          target: env.ESP32_URL || 'http://192.168.0.100',
          changeOrigin: true,
        },
      },
    },
  }
})