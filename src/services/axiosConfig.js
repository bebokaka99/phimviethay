import axios from 'axios';

// TỰ ĐỘNG CHỌN URL DỰA TRÊN MÔI TRƯỜNG
const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const instance = axios.create({
    baseURL: BASE_URL, 
    timeout: 50000, 
    headers: { 'Content-Type': 'application/json' },
});

let isRedirecting = false;

// --- 1. REQUEST INTERCEPTOR ---
instance.interceptors.request.use(
    (config) => {
        if (isRedirecting && !config.url.includes('/auth/')) {
            return new Promise(() => {}); 
        }

        // [CẬP NHẬT] Kiểm tra cả 2 key để chắc chắn bắt được Token
        const token = localStorage.getItem('token') || localStorage.getItem('accessToken');
        
        if (token) {
            config.headers['Authorization'] = `Bearer ${token}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

// --- 2. RESPONSE INTERCEPTOR ---
instance.interceptors.response.use(
    (response) => {
        if (response.config.url.includes('/auth/')) {
            isRedirecting = false;
        }
        return response.data; 
    },
    (error) => {
        if (isRedirecting && !error.config?.url.includes('/auth/')) {
            return new Promise(() => {});
        }

        const { response } = error;

        // Bắt lỗi Rate Limit (429)
        if (response && response.status === 429) {
            console.warn("Thao tác quá nhanh, vui lòng chờ giây lát...");
            return Promise.reject(error);
        }

        // Bắt lỗi 401 (Unauthorized)
        if (response && (response.status === 401 || response.status === 403)) {
            
            // Ngoại lệ: Sai pass khi đang login -> Trả lỗi về cho Form
            if (response.config.url.includes('/auth/')) {
                return Promise.reject(error);
            }

            // Token hết hạn thật -> Logout & Redirect
            if (!isRedirecting) {
                isRedirecting = true;
                
                // Dọn dẹp sạch sẽ
                localStorage.removeItem('token');
                localStorage.removeItem('accessToken');
                localStorage.removeItem('refreshToken');
                localStorage.removeItem('user');

                window.location.href = '/login?expired=true';
            }
            
            return new Promise(() => {}); 
        }

        return Promise.reject(error);
    }
);

export default instance;