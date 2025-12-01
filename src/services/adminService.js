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