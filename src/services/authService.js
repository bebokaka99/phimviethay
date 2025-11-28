import axios from 'axios';

// Vite sẽ tự động chọn link localhost hay link thật dựa vào môi trường chạy
const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// URL Auth
const AUTH_URL = `${BASE_URL}/auth`;
// URL User (Profile/Favorites)
const USER_URL = `${BASE_URL}/user`;

// Helper lấy header chứa Token
const getAuthHeader = () => {
    const token = localStorage.getItem('token');
    return { headers: { Authorization: `Bearer ${token}` } };
};

// --- AUTH API ---

export const register = async (userData) => {
    try {
        const response = await axios.post(`${AUTH_URL}/register`, userData);
        return response.data;
    } catch (error) {
        throw error.response?.data?.message || 'Lỗi kết nối server';
    }
};

export const login = async (userData) => {
    try {
        const response = await axios.post(`${AUTH_URL}/login`, userData);
        
        if (response.data.token) {
            localStorage.setItem('user', JSON.stringify(response.data.user));
            localStorage.setItem('token', response.data.token);
        }
        
        return response.data;
    } catch (error) {
        throw error.response?.data?.message || 'Sai email hoặc mật khẩu';
    }
};

export const logout = () => {
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    window.location.reload();
};

export const getCurrentUser = () => {
    const userStr = localStorage.getItem('user');
    if (userStr) return JSON.parse(userStr);
    return null;
};

// --- USER & FAVORITES API ---

export const getFavorites = async () => {
    try {
        const response = await axios.get(`${USER_URL}/favorites`, getAuthHeader());
        return response.data;
    } catch (error) {
        return [];
    }
};

export const checkFavoriteStatus = async (slug) => {
    if (!localStorage.getItem('token')) return false;
    try {
        const response = await axios.get(`${USER_URL}/favorites/check/${slug}`, getAuthHeader());
        return response.data.isFavorite;
    } catch (error) { return false; }
};

export const toggleFavorite = async (movie) => {
    if (!localStorage.getItem('token')) throw "Vui lòng đăng nhập để lưu phim!";
    
    try {
        const isFav = await checkFavoriteStatus(movie.slug);
        
        if (isFav) {
            await axios.delete(`${USER_URL}/favorites/${movie.slug}`, getAuthHeader());
            return false; 
        } else {
            await axios.post(`${USER_URL}/favorites`, {
                slug: movie.slug,
                name: movie.name,
                thumb: movie.thumb_url
            }, getAuthHeader());
            return true; 
        }
    } catch (error) {
        throw "Lỗi kết nối server";
    }
};

// --- HÀM MỚI: UPDATE PROFILE ---
export const updateProfile = async (data) => {
    try {
        const response = await axios.put(`${USER_URL}/profile`, data, getAuthHeader());
        
        // Nếu server trả về thông tin user mới, cập nhật ngay vào localStorage
        // Để Header và các trang khác hiển thị thông tin mới mà không cần đăng nhập lại
        if (response.data.user) {
            localStorage.setItem('user', JSON.stringify(response.data.user));
        }
        return response.data;
    } catch (error) {
        throw error.response?.data?.message || 'Lỗi cập nhật';
    }
};