import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(),
  tailwindcss(),
  ],
  server: {
    proxy: {
      // всі запити на /lessons підуть на бекенд
      '/lessons': {
        target: 'http://localhost:3000',
        changeOrigin: true,
        secure: false
      },
      '/lessons-list': {
        target: 'http://localhost:3000',
        changeOrigin: true,
        secure: false
      },
      '/search': {
        target: 'http://localhost:3000',
        changeOrigin: true,
        secure: false
      },
      '/login': {
        target: 'http://localhost:3000',
        changeOrigin: true,
        secure: false
      }
    }
  }
})
