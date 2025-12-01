import axios from 'axios';

const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const getAuthHeader = () => {
    const token = localStorage.getItem('token');
    return { headers: { Authorization: `Bearer ${token}` } };
};

export const getComments = async (slug, episode = null) => {
    try {
        const url = episode 
            ? `${BASE_URL}/comments/${slug}?episode=${episode}` 
            : `${BASE_URL}/comments/${slug}`;
        
        // Gửi kèm token để check like (nếu có)
        const token = localStorage.getItem('token');
        const config = token ? { headers: { Authorization: `Bearer ${token}` } } : {};
        
        const res = await axios.get(url, config);
        return res.data;
    } catch (error) { return []; }
};

export const addComment = async (data) => {
    try {
        // Đã xóa console.log rác ở đây
        const res = await axios.post(`${BASE_URL}/comments`, data, getAuthHeader());
        return res.data;
    } catch (error) { throw error; }
};

export const toggleLikeComment = async (commentId) => {
    try {
        await axios.post(`${BASE_URL}/comments/${commentId}/like`, {}, getAuthHeader());
        return true;
    } catch (error) { return false; }
};

export const deleteComment = async (id) => {
    try {
        await axios.delete(`${BASE_URL}/comments/${id}`, getAuthHeader());
        return true;
    } catch (error) { return false; }
};