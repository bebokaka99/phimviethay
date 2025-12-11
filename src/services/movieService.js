import axios from 'axios';

// --- CẤU HÌNH API OPHIM (Dùng cho danh sách/tìm kiếm tạm thời) ---
const client = axios.create({
    baseURL: 'https://ophim1.com/v1/api',
    headers: { 'Content-Type': 'application/json' }
});

// --- CẤU HÌNH API BACKEND CỦA MÌNH (QUAN TRỌNG) ---
// Lấy URL từ file .env (Dev: localhost, Prod: onrender.com)
// Nếu không tìm thấy biến môi trường -> Fallback về localhost để tránh lỗi
const MY_API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const MY_API = axios.create({
    baseURL: MY_API_URL,
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

// ... (Phần còn lại của file giữ nguyên không đổi)
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
        // Gọi về API Backend (Tự động theo môi trường)
        const response = await MY_API.get(`/movies/phim/${cleanSlug}`);
        const resData = response.data;

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
        const res = await MY_API.get(`/movies/trending`);
        return res.data.map(m => ({
            ...m,
            thumb_url: resolveImg(m.thumb_url),
            poster_url: resolveImg(m.poster_url),
            origin_name: `${m.view_count || 0} lượt xem`
        }));
    } catch (e) {
        return [];
    }
};

// ... (Các hàm getHomeData, getMoviesBySlug... gọi Ophim giữ nguyên)
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