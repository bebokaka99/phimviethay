// --- QUAN TRỌNG: Import từ file cấu hình của chúng ta ---
import axios from './axiosConfig'; 

// Không cần BASE_URL nữa vì axios đã có sẵn
// Không cần getAuthHeader nữa vì axios tự động gắn token

// --- AUTH API ---

export const register = async (userData) => {
    try {
        const response = await axios.post('/auth/register', userData);
        return response.data;
    } catch (error) {
        throw error.response?.data?.message || 'Lỗi kết nối server';
    }
};

export const login = async (userData) => {
    try {
        const response = await axios.post('/auth/login', userData);
        
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
    window.location.href = '/login'; // Redirect cứng cho sạch
};

export const getCurrentUser = () => {
    const userStr = localStorage.getItem('user');
    if (userStr) return JSON.parse(userStr);
    return null;
};

// --- USER & FAVORITES API ---

export const getFavorites = async () => {
    try {
        // Axios tự gắn token, không cần getAuthHeader()
        const response = await axios.get('/user/favorites');
        return response.data;
    } catch (error) {
        return [];
    }
};

export const checkFavoriteStatus = async (slug) => {
    if (!localStorage.getItem('token')) return false;
    try {
        const response = await axios.get(`/user/favorites/check/${slug}`);
        return response.data.isFavorite;
    } catch (error) { 
        return false; 
    }
};

export const toggleFavorite = async (movie) => {
    if (!localStorage.getItem('token')) throw "Vui lòng đăng nhập để lưu phim!";
    
    try {
        // Gọi lại hàm check đã sửa ở trên
        const isFav = await checkFavoriteStatus(movie.slug);
        
        if (isFav) {
            await axios.delete(`/user/favorites/${movie.slug}`);
            return false; 
        } else {
            await axios.post('/user/favorites', {
                slug: movie.slug,
                name: movie.name,
                thumb: movie.thumb_url,
                quality: movie.quality,
                year: movie.year,
                episode_current: movie.episode_current,
                vote_average: movie.vote_average
            });
            return true; 
        }
    } catch (error) {
        throw "Lỗi kết nối server";
    }
};

export const updateProfile = async (data) => {
    try {
        const response = await axios.put('/user/profile', data);
        if (response.data.user) {
            localStorage.setItem('user', JSON.stringify(response.data.user));
        }
        return response.data;
    } catch (error) {
        throw error.response?.data?.message || 'Lỗi cập nhật';
    }
};

// --- HISTORY API ---

export const setWatchHistory = async (data) => {
    const token = localStorage.getItem('token');
    if (!token) return;

    try {
        await axios.post('/user/history', data);
    } catch (error) {
        console.error("Lỗi ghi lịch sử:", error);
    }
};

export const getWatchHistory = async () => {
    const token = localStorage.getItem('token');
    if (!token) return [];

    try {
        const response = await axios.get('/user/history');
        return response.data;
    } catch (error) {
        return [];
    }
};

export const clearWatchHistory = async () => {
    const token = localStorage.getItem('token');
    if (!token) return;
    
    try {
        await axios.delete('/user/history');
    } catch (error) {
        throw error;
    }
};

export const removeWatchHistoryItem = async (slug) => {
    const token = localStorage.getItem('token');
    if (!token) return;
    try {
        await axios.delete(`/user/history/${slug}`);
    } catch (error) { throw error; }
};