import axios from 'axios';

// Tạo instance
const instance = axios.create({
    baseURL: 'http://localhost:5000/api', 
    timeout: 10000,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Biến cờ ngăn chặn redirect liên tục
let isRedirecting = false;

// --- 1. REQUEST INTERCEPTOR ---
instance.interceptors.request.use(
    (config) => {
        // Nếu đang trong quá trình bị đá ra (redirect), chặn tất cả request khác để tránh lỗi chồng chéo
        // (Ngoại trừ request Login/Register để người dùng còn đăng nhập lại được)
        if (isRedirecting && !config.url.includes('/auth/')) {
            return new Promise(() => {}); // Treo request vĩnh viễn
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
        // Nếu gọi API Login thành công -> Mở khóa hệ thống
        if (response.config.url.includes('/auth/')) {
            isRedirecting = false;
        }
        return response;
    },
    (error) => {
        // Nếu đang redirect thì lờ đi mọi lỗi khác
        if (isRedirecting && !error.config?.url.includes('/auth/')) {
            return new Promise(() => {});
        }

        const { response } = error;

        // Bắt lỗi 401 (Unauthorized) hoặc 403 (Forbidden)
        if (response && (response.status === 401 || response.status === 403)) {
            
            // Trường hợp ngoại lệ: Đang ở trang Login mà nhập sai mật khẩu (cũng bị 401)
            // Thì phải trả lỗi về để Form hiện thông báo "Sai mật khẩu"
            if (response.config.url.includes('/auth/')) {
                return Promise.reject(error);
            }

            // Các trường hợp khác: Token hết hạn thật -> Xử lý logout
            if (!isRedirecting) {
                isRedirecting = true; // Khóa hệ thống ngay lập tức
                
                // Dọn dẹp dữ liệu rác
                localStorage.removeItem('token');
                localStorage.removeItem('user');

                // Chuyển hướng cứng về Login kèm thông báo
                window.location.href = '/login?expired=true';
            }
            
            // Treo Promise để component gọi API không bị crash
            return new Promise(() => {}); 
        }

        return Promise.reject(error);
    }
);

export default instance;