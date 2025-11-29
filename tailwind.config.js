/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // 1. Nền chính trong suốt để ăn theo Gradient của Body
        'phim-dark': 'transparent', 

        // 2. Màu đỏ thương hiệu (Netflix Red)
        'phim-accent': '#e50914',

        // 3. Các màu nền phụ cho Card, Modal, Sidebar (Bán trong suốt)
        // Dùng màu đen pha chút xanh than để đồng bộ với body
        'phim-card': 'rgba(15, 23, 42, 0.6)',       // Nền card phim (Slate-900 alpha)
        'phim-modal': 'rgba(11, 13, 20, 0.95)',     // Nền Modal đậm hơn
        'phim-glass': 'rgba(255, 255, 255, 0.05)',  // Hiệu ứng kính sáng nhẹ
      },
      
      // 4. Animation mượt mà hơn
      animation: {
        'fade-in': 'fadeIn 0.5s ease-out forwards',
        'fade-in-down': 'fadeInDown 0.5s cubic-bezier(0.2, 0.8, 0.2, 1) forwards',
        'fade-in-up': 'fadeInUp 0.5s cubic-bezier(0.2, 0.8, 0.2, 1) forwards',
        'pulse-slow': 'pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite', // Dùng cho background
        'shake': 'shake 0.3s ease-in-out',
      },

      // 5. Keyframes chi tiết
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        fadeInDown: {
            '0%': { opacity: '0', transform: 'translateY(-20px)' },
            '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        fadeInUp: {
            '0%': { opacity: '0', transform: 'translateY(30px)' }, // Tăng khoảng cách trượt lên
            '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        shake: {
            '0%, 100%': { transform: 'translateX(0)' },
            '25%': { transform: 'translateX(-5px)' },
            '75%': { transform: 'translateX(5px)' },
        }
      }
    },
  },
  plugins: [],
}