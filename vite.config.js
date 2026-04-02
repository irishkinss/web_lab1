import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    // Картинки с cdn.dummyjson.com через тот же origin (обход блокировок CDN / referrer)
    proxy: {
      '/cdn-proxy': {
        target: 'https://cdn.dummyjson.com',
        changeOrigin: true,
        secure: true,
        rewrite: (path) => path.replace(/^\/cdn-proxy/, ''),
      },
    },
  },
  preview: {
    proxy: {
      '/cdn-proxy': {
        target: 'https://cdn.dummyjson.com',
        changeOrigin: true,
        secure: true,
        rewrite: (path) => path.replace(/^\/cdn-proxy/, ''),
      },
    },
  },
})
