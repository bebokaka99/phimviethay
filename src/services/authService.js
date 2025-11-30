import axios from 'axios';

// Vite sẽ tự động chọn link localhost hay link thật dựa vào môi trường chạy
const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const AUTH_URL = `${BASE_URL}/auth`;
const USER_URL = `${BASE_URL}/user`;

// Helper lấy header
const getAuthHeader = () => {
    const token = localStorage.getItem('token');
    return { 
        headers: { 
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json' // <--- THÊM DÒNG NÀY CHO CHẮC
        } 
    };
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
            // Gửi full data phim lên server
            await axios.post(`${USER_URL}/favorites`, {
                slug: movie.slug,
                name: movie.name,
                thumb: movie.thumb_url,
                quality: movie.quality,
                year: movie.year,
                episode_current: movie.episode_current,
                vote_average: movie.vote_average
            }, getAuthHeader());
            return true; 
        }
    } catch (error) {
        throw "Lỗi kết nối server";
    }
};

export const updateProfile = async (data) => {
    try {
        const response = await axios.put(`${USER_URL}/profile`, data, getAuthHeader());
        if (response.data.user) {
            localStorage.setItem('user', JSON.stringify(response.data.user));
        }
        return response.data;
    } catch (error) {
        throw error.response?.data?.message || 'Lỗi cập nhật';
    }
};

// --- HISTORY API (CHỈ GIỮ 1 HÀM DUY NHẤT NÀY) ---

export const setWatchHistory = async (data) => { // <--- Nhận object data
    const token = localStorage.getItem('token');
    if (!token) return;

    try {
        // Gửi nguyên cục object data lên server
        await axios.post(`${USER_URL}/history`, data, getAuthHeader());
    } catch (error) {
        console.error("Lỗi ghi lịch sử:", error);
    }
};

export const getWatchHistory = async () => {
    const token = localStorage.getItem('token');
    if (!token) return [];

    try {
        const response = await axios.get(`${USER_URL}/history`, getAuthHeader());
        return response.data;
    } catch (error) {
        return [];
    }
};

export const clearWatchHistory = async () => {
    const token = localStorage.getItem('token');
    if (!token) return;
    
    try {
        await axios.delete(`${USER_URL}/history`, getAuthHeader());
    } catch (error) {
        throw error;
    }
};