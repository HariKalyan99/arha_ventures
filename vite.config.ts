import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { defineConfig } from 'vite'

// https://vite.dev/config/
/** Set when previewing via HTTPS tunnel so HMR uses wss:443 instead of :5173 */
const tunnelHost = process.env.VITE_TUNNEL_HOST?.replace(/^https?:\/\//, '')

export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    /* LAN + tablet/phone on the same Wi‑Fi */
    host: true,
    /* ngrok / cloudflare / LAN Host headers */
    allowedHosts: ['.ngrok-free.dev', '.ngrok-free.app', '.ngrok.app', '.ngrok.io', '.trycloudflare.com'],
    ...(tunnelHost
      ? {
          hmr: {
            protocol: 'wss' as const,
            host: tunnelHost,
            clientPort: 443,
          },
        }
      : {}),
  },
  build: {
    target: 'es2022',
    chunkSizeWarningLimit: 1200,
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (!id.includes('node_modules')) return
          if (id.includes('/three/') || id.includes('/three-stdlib/')) return 'three-vendor'
          if (id.includes('@react-three/')) return 'three-vendor'
        },
      },
    },
  },
})
