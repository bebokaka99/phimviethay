import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.svg', 'robots.txt'],
      manifest: {
        name: 'PhimVietHay - Xem Phim HD',
        short_name: 'PhimVietHay',
        description: 'Xem phim online miễn phí chất lượng cao',
        theme_color: '#0a0e17',
        background_color: '#0a0e17',
        display: 'standalone',
        orientation: 'portrait',
        scope: '/',
        start_url: '/',
        icons: [
          {
            src: '/pwa-192x192.png',
            sizes: '192x192',
            type: 'image/png',
            purpose: 'any maskable'
          },
          {
            src: '/pwa-512x512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'any maskable'
          }
        ]
      }
    })
  ],
  // --- CẤU HÌNH PROXY (QUAN TRỌNG) ---
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:5000', // Trỏ về Backend Node.js
        changeOrigin: true,
        secure: false,
      },
    },
  },
  build: {
    // 1. Tắt source map để hacker không xem được code gốc
    sourcemap: false, 
    
    // 2. Tự động xóa console.log và debugger khi build
    minify: 'esbuild',
    esbuild: {
      drop: ['console', 'debugger'], 
    },
  }
})