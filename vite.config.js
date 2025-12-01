import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate', // Tự động cập nhật khi có code mới
      includeAssets: ['favicon.svg', 'robots.txt'], // Các file tĩnh cần cache
      manifest: {
        name: 'PhimVietHay - Xem Phim HD',
        short_name: 'PhimVietHay',
        description: 'Xem phim online miễn phí chất lượng cao',
        theme_color: '#0a0e17', // Màu thanh trạng thái trùng với nền web
        background_color: '#0a0e17',
        display: 'standalone', // Chế độ toàn màn hình (mất thanh URL)
        orientation: 'portrait',
        scope: '/',
        start_url: '/',
        icons: [
          {
            src: '/pwa-192x192.png', // Icon nhỏ cho điện thoại
            sizes: '192x192',
            type: 'image/png',
            purpose: 'any maskable'
          },
          {
            src: '/pwa-512x512.png', // Icon lớn (Splash screen)
            sizes: '512x512',
            type: 'image/png',
            purpose: 'any maskable'
          }
        ]
      }
    })
  ],
})