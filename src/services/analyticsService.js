import axios from './axiosConfig';

// 1. Lấy dữ liệu Intro/Ending (Để hiển thị nút Skip)
export const getEpisodeIntelligence = async (movieSlug, episodeSlug) => {
    try {
        const response = await axios.get(`/analytics/data`, {
            params: { movie_slug: movieSlug, episode_slug: episodeSlug }
        });
        return response.data; // { intro_start, intro_end, credits_start, ... }
    } catch (error) {
        return null;
    }
};

// 2. Gửi Log hành vi (Để máy học)
export const logUserBehavior = async (data) => {
    // data: { movie_slug, episode_slug, action_type, timestamp }
    try {
        await axios.post('/analytics/log', data);
    } catch (error) {
        // Log ngầm, không báo lỗi ra UI
    }
};