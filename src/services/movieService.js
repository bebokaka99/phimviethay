import axios from 'axios';
import axiosInstance from './axiosConfig'; // [MỚI] Dùng instance đã cấu hình chuẩn

// --- CẤU HÌNH API OPHIM (Giữ nguyên vì gọi sang domain khác) ---
const client = axios.create({
    baseURL: 'https://ophim1.com/v1/api',
    headers: { 'Content-Type': 'application/json' }
});

export let DYNAMIC_CDN = 'https://img.ophim.live/uploads/movies/';
export const IMG_URL = '';

// --- HELPER FUNCTIONS ---
const resolveImg = (url) => {
    if (!url || url === "") return 'https://placehold.co/300x450?text=No+Image';
    if (url.startsWith('http')) return url;
    const cleanPath = url.startsWith('/') ? url.slice(1) : url;
    return `${DYNAMIC_CDN}${cleanPath}`;
};

const processResponseData = (resData) => {
    if (resData?.data?.APP_DOMAIN_CDN_IMAGE) {
        DYNAMIC_CDN = `${resData.data.APP_DOMAIN_CDN_IMAGE}/uploads/movies/`;
    }
    if (resData?.data?.items) {
        resData.data.items = resData.data.items.map(m => ({
            ...m,
            poster_url: m.poster_url ? resolveImg(m.poster_url) : resolveImg(m.thumb_url),
            thumb_url: resolveImg(m.thumb_url)
        }));
    }
    return resData;
};

// --- CORE SERVICES (LAZY SYNC VỚI BACKEND) ---

// 1. Lấy chi tiết phim từ Backend mình
export const getMovieDetail = async (slug) => {
    try {
        const cleanSlug = slug.replace(/^player-/, '');
        
        // [SỬA] Dùng axiosInstance thay vì MY_API tự tạo
        // axiosInstance đã tự trả về .data rồi, nên ở đây nhận thẳng kết quả
        const resData = await axiosInstance.get(`/movies/phim/${cleanSlug}`);

        if (resData?.data?.APP_DOMAIN_CDN_IMAGE) {
            DYNAMIC_CDN = `${resData.data.APP_DOMAIN_CDN_IMAGE}/uploads/movies/`;
        }

        if (resData.status && resData.movie) {
            const movieObj = resData.movie;
            const thumb = resolveImg(movieObj.thumb_url);
            const poster = movieObj.poster_url ? resolveImg(movieObj.poster_url) : thumb;

            movieObj.poster_url = poster;
            movieObj.thumb_url = thumb;
            
            if (!movieObj.tmdb) movieObj.tmdb = { vote_average: 0, vote_count: 0 };

            return { status: true, movie: movieObj, episodes: resData.episodes || [] };
        }
        return { status: false, msg: 'Không tìm thấy phim' };
    } catch (error) {
        console.error("Lỗi lấy chi tiết phim:", error);
        return { status: false, msg: 'Lỗi kết nối Server' };
    }
};

// 2. Lấy Trending từ Backend mình
export const getTrendingMovies = async () => {
    try {
        // [SỬA] Dùng axiosInstance.get trả về mảng luôn
        const data = await axiosInstance.get(`/movies/trending`);
        
        // Vì axiosInstance trả về data trực tiếp, nên data chính là mảng phim
        return data.map(m => ({
            ...m,
            thumb_url: resolveImg(m.thumb_url),
            poster_url: resolveImg(m.poster_url),
            origin_name: `${m.view_count || 0} lượt xem`
        }));
    } catch (e) {
        return [];
    }
};

// ... (Các hàm gọi OPhim giữ nguyên vì dùng client riêng)
export const getHomeData = async () => {
    try {
        const response = await client.get('/home');
        return processResponseData(response.data);
    } catch (error) { return null; }
};

export const getMoviesBySlug = async (slug, page = 1, type = 'danh-sach', filterParams = {}) => {
    try {
        const url = `/${type}/${slug}`;
        const response = await client.get(url, { params: { page, ...filterParams } });
        return processResponseData(response.data);
    } catch (error) { return null; }
};

export const getMenuData = async () => {
    try {
        const [theLoai, quocGia] = await Promise.all([
            client.get('/the-loai'), 
            client.get('/quoc-gia')
        ]);
        return { 
            theLoai: theLoai.data.data.items || [], 
            quocGia: quocGia.data.data.items || [] 
        };
    } catch (error) { return { theLoai: [], quocGia: [] }; }
};

export const searchMovies = async (keyword, page = 1) => {
    try {
        const response = await client.get('/tim-kiem', { params: { keyword, page } });
        return processResponseData(response.data);
    } catch (error) { return null; }
};

export const getMoviePeoples = async (slug) => {
    try {
        const cleanSlug = slug.replace(/^player-/, '');
        const response = await client.get(`/phim/${cleanSlug}/peoples`);
        return response.data?.data?.peoples || [];
    } catch (error) { return []; }
};

export const getMovieImages = async (slug) => {
    try {
        const cleanSlug = slug.replace(/^player-/, '');
        const response = await client.get(`/phim/${cleanSlug}/images`);
        return response.data?.data || [];
    } catch (error) { return []; }
};