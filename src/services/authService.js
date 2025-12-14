import axios from './axiosConfig'; 

// --- AUTH API ---

export const register = async (userData) => {
    try {
        const data = await axios.post('/auth/register', userData);
        return data; 
    } catch (error) {
        throw error.response?.data?.message || 'Lỗi kết nối server';
    }
};

export const login = async (userData) => {
    try {
        const res = await axios.post('/auth/login', userData);
        
        if (res.token) {
            localStorage.setItem('user', JSON.stringify(res.user));
            // Lưu key 'token' để đồng bộ với axiosConfig của bạn
            localStorage.setItem('token', res.token);
        }
        
        return res;
    } catch (error) {
        throw error.response?.data?.message || 'Sai email hoặc mật khẩu';
    }
};

// [MỚI] Hàm lấy thông tin user sau khi có Token (Dùng cho Google Login)
export const getMe = async () => {
    try {
        const res = await axios.get('/auth/me');
        // res chính là object user trả về từ server
        if (res) {
            localStorage.setItem('user', JSON.stringify(res));
        }
        return res;
    } catch (error) {
        console.error("Lỗi lấy thông tin user:", error);
        return null;
    }
};

export const logout = () => {
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    localStorage.removeItem('accessToken'); // Xóa sạch các loại key
    localStorage.removeItem('refreshToken');
    window.location.href = '/login'; 
};

export const getCurrentUser = () => {
    const userStr = localStorage.getItem('user');
    if (userStr) return JSON.parse(userStr);
    return null;
};

// --- USER & FAVORITES API (GIỮ NGUYÊN CODE CŨ CỦA BẠN) ---

export const getFavorites = async () => {
    try {
        const data = await axios.get('/user/favorites');
        return data; 
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
        return res;
    } catch (error) {
        throw error.response?.data?.message || 'Lỗi cập nhật';
    }
};

// --- HISTORY API (GIỮ NGUYÊN) ---

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
        return data; 
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