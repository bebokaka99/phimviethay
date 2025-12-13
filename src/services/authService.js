import axios from './axiosConfig'; 

// --- AUTH API ---

export const register = async (userData) => {
    try {
        const data = await axios.post('/auth/register', userData);
        return data; // AxiosConfig đã trả về data rồi
    } catch (error) {
        throw error.response?.data?.message || 'Lỗi kết nối server';
    }
};

export const login = async (userData) => {
    try {
        const res = await axios.post('/auth/login', userData);
        
        if (res.token) {
            localStorage.setItem('user', JSON.stringify(res.user));
            localStorage.setItem('token', res.token);
        }
        
        return res;
    } catch (error) {
        throw error.response?.data?.message || 'Sai email hoặc mật khẩu';
    }
};

export const logout = () => {
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    window.location.href = '/login'; 
};

export const getCurrentUser = () => {
    const userStr = localStorage.getItem('user');
    if (userStr) return JSON.parse(userStr);
    return null;
};

// --- USER & FAVORITES API ---

export const getFavorites = async () => {
    try {
        const data = await axios.get('/user/favorites');
        return data; // [SỬA] Bỏ .data
    } catch (error) { return []; }
};

export const checkFavoriteStatus = async (slug) => {
    if (!localStorage.getItem('token')) return false;
    try {
        const res = await axios.get(`/user/favorites/check/${slug}`);
        return res.isFavorite;
    } catch (error) { return false; }
};

export const toggleFavorite = async (movie) => {
    if (!localStorage.getItem('token')) throw "Vui lòng đăng nhập!";
    try {
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
    } catch (error) { throw "Lỗi kết nối server"; }
};

export const updateProfile = async (data) => {
    try {
        const res = await axios.put('/user/profile', data);
        if (res.user) {
            localStorage.setItem('user', JSON.stringify(res.user));
        }
        return res; // [SỬA] Bỏ .data
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
    } catch (error) { console.error("History Error", error); }
};

export const getWatchHistory = async () => {
    const token = localStorage.getItem('token');
    if (!token) return [];
    try {
        const data = await axios.get('/user/history');
        return data; // [SỬA] Bỏ .data
    } catch (error) { return []; }
};

export const clearWatchHistory = async () => {
    const token = localStorage.getItem('token');
    if (!token) return;
    try { await axios.delete('/user/history'); } catch (e) { throw e; }
};

export const removeWatchHistoryItem = async (slug) => {
    const token = localStorage.getItem('token');
    if (!token) return;
    try { await axios.delete(`/user/history/${slug}`); } catch (e) { throw e; }
};