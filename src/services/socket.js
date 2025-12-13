import { io } from "socket.io-client";

// Tự động detect URL: Local vs Production (Render)
const API_URL = import.meta.env.VITE_API_URL 
    ? import.meta.env.VITE_API_URL.replace('/api', '') 
    : 'http://localhost:5000';

const socket = io(API_URL, {
    transports: ["websocket"], // Bắt buộc dùng WebSocket để tối ưu tốc độ
    autoConnect: false,        // Chỉ kết nối khi vào phòng xem chung
    reconnectionAttempts: 5,   // Thử lại 5 lần nếu mất mạng
    timeout: 10000             // Timeout kết nối
});

export default socket;