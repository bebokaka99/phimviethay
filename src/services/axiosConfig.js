import axios from 'axios';

// TỰ ĐỘNG CHỌN URL DỰA TRÊN MÔI TRƯỜNG
const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const instance = axios.create({
    baseURL: BASE_URL, 
    // [TỐI ƯU] Tăng lên 50s để chờ Server Render "tỉnh ngủ" (Cold Start)
    timeout: 50000, 
    headers: { 'Content-Type': 'application/json' },
});

// Biến cờ ngăn chặn redirect liên tục (Logic cũ của bạn rất tốt, giữ nguyên)
let isRedirecting = false;

// --- 1. REQUEST INTERCEPTOR ---
instance.interceptors.request.use(
    (config) => {
        // Chặn request chồng chéo khi đang bị đá văng
        if (isRedirecting && !config.url.includes('/auth/')) {
            return new Promise(() => {}); // Treo request
        }

        const token = localStorage.getItem('token'); 
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
        // Mở khóa nếu login thành công
        if (response.config.url.includes('/auth/')) {
            isRedirecting = false;
        }
        // [TỐI ƯU] Trả về thẳng data để code trong Component gọn hơn (bỏ bớt .data)
        return response.data; 
    },
    (error) => {
        // Nếu đang redirect thì lờ đi mọi lỗi khác
        if (isRedirecting && !error.config?.url.includes('/auth/')) {
            return new Promise(() => {});
        }

        const { response } = error;

        // [MỚI] Bắt lỗi Rate Limit (429) từ Server
        if (response && response.status === 429) {
            console.warn("Bạn đang thao tác quá nhanh, vui lòng chậm lại!");
            // Có thể return Promise.reject để UI hiện thông báo riêng nếu cần
            return Promise.reject(error);
        }

        // Bắt lỗi 401 (Unauthorized) hoặc 403 (Forbidden)
        if (response && (response.status === 401 || response.status === 403)) {
            
            // Ngoại lệ: Sai pass khi đang login -> Trả lỗi về cho Form xử lý
            if (response.config.url.includes('/auth/')) {
                return Promise.reject(error);
            }

            // Token hết hạn thật -> Logout & Redirect
            if (!isRedirecting) {
                isRedirecting = true;
                
                // Dọn dẹp
                localStorage.removeItem('token');
                localStorage.removeItem('user');

                // Redirect cứng
                window.location.href = '/login?expired=true';
            }
            
            return new Promise(() => {}); 
        }

        return Promise.reject(error);
    }
);

export default instance;