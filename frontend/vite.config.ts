import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  // Base path configuratie
  base: '/',
  
  // Development server configuratie
  server: {
    port: 5173,
    proxy: {
      // Proxy API calls naar FastAPI in development
      '/api': {
        target: 'http://localhost:8000',
        changeOrigin: true,
      },
      '/ws': {
        target: 'ws://localhost:8000',
        ws: true,
      },
      '/uploads': {
        target: 'http://localhost:8000',
        changeOrigin: true,
      }
    }
  },
  
  // Build configuratie
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    // Genereer source maps voor debugging (optioneel)
    sourcemap: false,
  }
})