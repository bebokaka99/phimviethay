import axios from 'axios';

// Vite tự động lấy link localhost hoặc link thật
const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const getAuthHeader = () => {
    const token = localStorage.getItem('token');
    return { headers: { Authorization: `Bearer ${token}` } };
};

// 1. Thống kê Dashboard
export const getAdminStats = async () => {
    try {
        const res = await axios.get(`${BASE_URL}/admin/stats`, getAuthHeader());
        return res.data;
    } catch (error) { throw error; }
};

// 2. Quản lý User
export const getAllUsers = async () => {
    try {
        const res = await axios.get(`${BASE_URL}/admin/users`, getAuthHeader());
        return res.data;
    } catch (error) { return []; }
};

export const deleteUser = async (id) => {
    try {
        await axios.delete(`${BASE_URL}/admin/users/${id}`, getAuthHeader());
        return true;
    } catch (error) { return false; }
};

// 3. Quản lý Comment
export const getAllComments = async () => {
    try {
        const res = await axios.get(`${BASE_URL}/admin/comments`, getAuthHeader());
        return res.data;
    } catch (error) { return []; }
};

export const deleteAdminComment = async (id) => {
    try {
        await axios.delete(`${BASE_URL}/admin/comments/${id}`, getAuthHeader());
        return true;
    } catch (error) { return false; }
};
// 4. Analytics / God Mode
export const forceIntroData = async (data) => {
    try {
        // Gọi axios instance hoặc axios thường đều được, nhưng dùng instance trong axiosConfig tốt hơn
        // Ở đây mình dùng axios thường theo style file cũ của bạn
        const response = await axios.post(`${BASE_URL}/analytics/admin/force`, data, getAuthHeader());
        return response.data;
    } catch (error) {
        throw error.response?.data?.message || 'Lỗi lưu Intro';
    }
};
// 5. Lấy danh sách Intro (Cập nhật)
export const getIntrosList = async (page = 1, limit = 20, search = '', exactMovie = null) => {
    try {
        const params = { page, limit };
        if (exactMovie) {
            params.exact_movie = exactMovie; // Ưu tiên lọc chính xác
        } else if (search) {
            params.search = search;
        }

        const response = await axios.get(`${BASE_URL}/analytics/admin/list`, {
            headers: getAuthHeader().headers,
            params: params
        });
        return response.data;
    } catch (error) {
        return { data: [], pagination: {} };
    }
};

// 6. Xóa dữ liệu Intro (MỚI)
export const deleteIntroData = async (id) => {
    try {
        await axios.delete(`${BASE_URL}/analytics/admin/${id}`, getAuthHeader());
        return true;
    } catch (error) {
        throw error.response?.data?.message || 'Lỗi xóa';
    }
};