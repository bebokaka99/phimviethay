/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Đổi màu nền chính thành trong suốt để thấy background body
        'phim-dark': 'transparent', 
        
        // Màu đỏ thương hiệu
        'phim-accent': '#e50914',
        
        // Thêm màu nền phụ cho các khối (Card, Sidebar...)
        // Màu đen pha chút xám, có độ trong suốt
        'phim-card': 'rgba(20, 20, 20, 0.7)', 
      },
      animation: {
        'fade-in-down': 'fadeInDown 0.5s ease-out',
        'fade-in-up': 'fadeInUp 0.5s ease-out',
      },
      keyframes: {
        fadeInDown: {
            '0%': { opacity: '0', transform: 'translateY(-20px)' },
            '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        fadeInUp: {
            '0%': { opacity: '0', transform: 'translateY(20px)' },
            '100%': { opacity: '1', transform: 'translateY(0)' },
        }
      }
    },
  },
  plugins: [],
}