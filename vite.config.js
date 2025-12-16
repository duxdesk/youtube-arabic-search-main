import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'
import path from 'path'  // For alias resolution

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),  // Maps @/ to ./src/ (fixes TS2307)
    },
  },
  server: {
    host: true,  // For external access (e.g., http://192.168.0.8:4173)
    port: 4173,
  },
  preview: {
    open: true,
    host: true,
    port: 4173,
  },
  build: {
    base: './',  // Relative paths for SPA deployment
    rollupOptions: {
      output: {
        // SPA fallback: Handles all routes via index.html
        manualChunks: undefined,  // Optional: Keeps it simple
      },
    },
  },
})
