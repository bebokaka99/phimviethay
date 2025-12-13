import axios from './axiosConfig';

// Lấy dữ liệu Intro (Skip Intro)
export const getEpisodeIntelligence = async (movieSlug, episodeSlug) => {
    try {
        // [SỬA] axiosConfig trả về data trực tiếp
        const data = await axios.get(`/analytics/data`, {
            params: { movie_slug: movieSlug, episode_slug: episodeSlug }
        });
        return data; 
    } catch (error) { return null; }
};

// Gửi Log
export const logUserBehavior = async (data) => {
    try {
        await axios.post('/analytics/log', data);
    } catch (error) { /* Silent fail */ }
};

// Admin: Lưu Intro cưỡng ép
export const forceIntroData = async (data) => {
    try {
        const res = await axios.post('/analytics/admin/force', data);
        return res;
    } catch (error) { throw error; }
};