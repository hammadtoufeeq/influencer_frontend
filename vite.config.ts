import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    port: 3000,
    // Local development: /api wali requests backend (port 5000) pe bhejo
    proxy: {
      '/api': 'http://localhost:5000',
    },
  },
})
