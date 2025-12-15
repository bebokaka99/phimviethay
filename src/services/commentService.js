import axios from './axiosConfig'; // Dùng instance chuẩn

// GET Comments
export const getComments = async (slug, episode = null) => {
    try {
        const url = episode 
            ? `/comments/${slug}?episode=${episode}` 
            : `/comments/${slug}`;
        
        const data = await axios.get(url);
        return data; 
    } catch (error) { return []; }
};

// ADD Comment
export const addComment = async (data) => {
    try {
        const res = await axios.post(`/comments`, data);
        return res; 
    } catch (error) { throw error; }
};

// LIKE
export const toggleLikeComment = async (commentId) => {
    try {
        await axios.post(`/comments/${commentId}/like`);
        return true;
    } catch (error) { return false; }
};

// DELETE
export const deleteComment = async (id) => {
    try {
        await axios.delete(`/comments/${id}`);
        return true;
    } catch (error) { return false; }
};

// [NEW] PIN (Ghim)
export const togglePinComment = async (commentId) => {
    try {
        await axios.post(`/comments/${commentId}/pin`);
        return true;
    } catch (error) { return false; }
};