import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    host: true, // For external access
    port: 4173, // Your preview port
  },
  build: {
    rollupOptions: {
      output: {
        // Ensure SPA fallback for all routes
        manualChunks: undefined,
      },
    },
  },
  // SPA fallback for preview/prod
  preview: {
    open: true,
    host: true,
    port: 4173,
  },
})
