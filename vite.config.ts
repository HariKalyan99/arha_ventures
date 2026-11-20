import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    /* ngrok / LAN previews send a foreign Host header — allow tunnel domains */
    allowedHosts: ['.ngrok-free.dev', '.ngrok-free.app', '.ngrok.app', '.ngrok.io'],
  },
  build: {
    target: 'es2022',
    chunkSizeWarningLimit: 1200,
  },
})
