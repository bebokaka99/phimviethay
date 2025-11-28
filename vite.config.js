import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
// XÓA hoặc COMMENT dòng import này nếu có:
// import { VitePWA } from 'vite-plugin-pwa' 

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    // XÓA hoặc COMMENT đoạn VitePWA(...) bên dưới nếu có:
    // VitePWA({ ... }) 
  ],
  server: {
    port: 5173,
  }
})