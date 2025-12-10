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
    } catch (error) { 
        // Ném lỗi ra để UI hiển thị alert
        throw error.response?.data?.message || 'Lỗi xóa user'; 
    }
};

// [MỚI] Nâng/Hạ quyền User
export const updateUserRole = async (id, role) => {
    try {
        await axios.put(`${BASE_URL}/admin/users/${id}/role`, { role }, getAuthHeader());
        return true;
    } catch (error) {
        alert(error.response?.data?.message || 'Lỗi cập nhật quyền');
        return false;
    }
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
        const response = await axios.post(`${BASE_URL}/analytics/admin/force`, data, getAuthHeader());
        return response.data;
    } catch (error) {
        throw error.response?.data?.message || 'Lỗi lưu Intro';
    }
};

// 5. Lấy danh sách Intro
export const getIntrosList = async (page = 1, limit = 20, search = '', exactMovie = null) => {
    try {
        const params = { page, limit };
        if (exactMovie) {
            params.exact_movie = exactMovie; 
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

// 6. Xóa dữ liệu Intro
export const deleteIntroData = async (id) => {
    try {
        await axios.delete(`${BASE_URL}/analytics/admin/${id}`, getAuthHeader());
        return true;
    } catch (error) {
        throw error.response?.data?.message || 'Lỗi xóa';
    }
};
export const banUser = async (id, days) => {
    try {
        await axios.put(`${BASE_URL}/admin/users/${id}/ban`, { days }, getAuthHeader());
        return true;
    } catch (error) {
        alert(error.response?.data?.message || 'Lỗi xử lý');
        return false;
    }
};