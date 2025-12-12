import { io } from "socket.io-client";

// Tự động chọn URL: Localhost khi dev, Render khi deploy
const API_URL = import.meta.env.VITE_API_URL 
    ? import.meta.env.VITE_API_URL.replace('/api', '') // Bỏ đuôi /api vì socket connect vào root
    : 'http://localhost:5000';

const socket = io(API_URL, {
    transports: ["websocket"], // Ép dùng websocket cho nhanh
    autoConnect: false // Chỉ kết nối khi cần
});

export default socket;