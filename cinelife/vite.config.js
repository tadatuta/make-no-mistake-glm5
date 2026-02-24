import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  // Base path for deployment - can be set via BASE_PATH env var
  // Example: BASE_PATH=/cinelife for deployment at https://example.com/cinelife/
  base: process.env.BASE_PATH || '/',
  plugins: [react()],
  build: {
    outDir: 'dist',
    sourcemap: true,
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom', 'react-router-dom'],
        }
      }
    }
  },
  server: {
    port: 3000,
    open: true
  }
})
