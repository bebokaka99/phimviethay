import axios from 'axios';

// --- CẤU HÌNH API ---
const client = axios.create({
    baseURL: 'https://ophim1.com/v1/api',
    headers: { 'Content-Type': 'application/json' }
});

// URL Backend (Lấy từ biến môi trường hoặc mặc định)
const MY_API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

let DYNAMIC_CDN = 'https://img.ophim.live/uploads/movies/';
export const IMG_URL = '';

// --- HELPER FUNCTIONS ---

// Xử lý đường dẫn ảnh (thêm domain nếu thiếu)
const resolveImg = (url) => {
    if (!url || url === "") return 'https://placehold.co/300x450?text=No+Image';
    if (url.startsWith('http')) return url;
    const cleanPath = url.startsWith('/') ? url.slice(1) : url;
    return `${DYNAMIC_CDN}${cleanPath}`;
};

// Hàm chung để xử lý dữ liệu trả về từ OPhim (Cập nhật CDN và map lại link ảnh)
const processResponseData = (resData) => {
    // Cập nhật CDN nếu API trả về domain mới
    if (resData?.data?.APP_DOMAIN_CDN_IMAGE) {
        DYNAMIC_CDN = `${resData.data.APP_DOMAIN_CDN_IMAGE}/uploads/movies/`;
    }

    // Map lại link ảnh cho từng phim trong danh sách
    if (resData?.data?.items) {
        resData.data.items = resData.data.items.map(m => ({
            ...m,
            poster_url: m.poster_url ? resolveImg(m.poster_url) : resolveImg(m.thumb_url),
            thumb_url: resolveImg(m.thumb_url)
        }));
    }
    return resData;
};

// --- OPHIM API SERVICES ---

export const getHomeData = async () => {
    try {
        const response = await client.get('/home');
        return processResponseData(response.data);
    } catch (error) {
        return null;
    }
};

export const getMoviesBySlug = async (slug, page = 1, type = 'danh-sach', filterParams = {}) => {
    try {
        const url = `/${type}/${slug}`;
        const response = await client.get(url, { params: { page, ...filterParams } });
        return processResponseData(response.data);
    } catch (error) {
        return null;
    }
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
    } catch (error) {
        return { theLoai: [], quocGia: [] };
    }
};

export const getMovieDetail = async (slug) => {
    try {
        const cleanSlug = slug.replace(/^player-/, '');
        const response = await client.get(`/phim/${cleanSlug}`);
        const resData = response.data;

        // Cập nhật CDN từ chi tiết phim nếu có
        if (resData?.data?.APP_DOMAIN_CDN_IMAGE) {
            DYNAMIC_CDN = `${resData.data.APP_DOMAIN_CDN_IMAGE}/uploads/movies/`;
        }

        if (resData.status === 'success' && resData.data && resData.data.item) {
            const movieObj = resData.data.item;
            const thumb = resolveImg(movieObj.thumb_url);
            const poster = movieObj.poster_url ? resolveImg(movieObj.poster_url) : thumb;

            movieObj.poster_url = poster;
            movieObj.thumb_url = thumb;
            
            // Đảm bảo object tmdb luôn tồn tại để tránh lỗi undefined
            if (!movieObj.tmdb) movieObj.tmdb = { vote_average: 0, vote_count: 0 };

            return { status: true, movie: movieObj, episodes: movieObj.episodes || [] };
        }
        return { status: false, msg: 'Không tìm thấy phim' };
    } catch (error) {
        return { status: false, msg: 'Lỗi kết nối Server' };
    }
};

export const searchMovies = async (keyword, page = 1) => {
    try {
        const response = await client.get('/tim-kiem', { params: { keyword, page } });
        return processResponseData(response.data);
    } catch (error) {
        return null;
    }
};

export const getMoviePeoples = async (slug) => {
    try {
        const cleanSlug = slug.replace(/^player-/, '');
        const response = await client.get(`/phim/${cleanSlug}/peoples`);
        return response.data?.data?.peoples || [];
    } catch (error) {
        return [];
    }
};

export const getMovieImages = async (slug) => {
    try {
        const cleanSlug = slug.replace(/^player-/, '');
        const response = await client.get(`/phim/${cleanSlug}/images`);
        return response.data?.data || [];
    } catch (error) {
        return [];
    }
};

// --- BACKEND SERVICES (CUSTOM API) ---

export const increaseView = async (movieData) => {
    try {
        if (!movieData || !movieData.slug) return;
        await axios.post(`${MY_API_URL}/movies/view`, movieData);
    } catch (e) {
        console.error("Lỗi tăng view:", e);
    }
};

export const getTrendingMovies = async () => {
    try {
        const res = await axios.get(`${MY_API_URL}/movies/trending`);
        // Map dữ liệu từ Database (snake_case) sang chuẩn của App (camelCase)
        return res.data.map(m => ({
            _id: m.movie_slug,
            slug: m.movie_slug,
            name: m.movie_name,
            thumb_url: m.movie_thumb,
            quality: m.movie_quality || 'HD',
            year: m.movie_year || '2024',
            episode_current: m.episode_current || 'Full',
            vote_average: m.vote_average ? parseFloat(m.vote_average) : 0,
            origin_name: `${m.view_count} lượt xem` // Hiển thị số lượt xem thay cho tên gốc
        }));
    } catch (e) {
        return [];
    }
};