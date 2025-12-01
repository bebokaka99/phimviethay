import axios from 'axios';

// 1. CẤU HÌNH CLIENT CHO OPHIM
const client = axios.create({
    baseURL: 'https://ophim1.com/v1/api',
    headers: { 'Content-Type': 'application/json' }
});

// URL Backend của bạn (Lấy từ biến môi trường hoặc mặc định localhost)
const MY_API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

let DYNAMIC_CDN = 'https://img.ophim.live/uploads/movies/'; 
export const IMG_URL = ''; 

// Helper xử lý ảnh
const resolveImg = (url) => {
    if (!url || url === "") return 'https://placehold.co/300x450?text=No+Image';
    if (url.startsWith('http')) return url;
    const cleanPath = url.startsWith('/') ? url.slice(1) : url;
    return `${DYNAMIC_CDN}${cleanPath}`;
};

// 1. HOME
export const getHomeData = async () => {
    try {
        const response = await client.get('/home');
        const resData = response.data;
        if (resData?.data?.APP_DOMAIN_CDN_IMAGE) DYNAMIC_CDN = `${resData.data.APP_DOMAIN_CDN_IMAGE}/uploads/movies/`;
        if (resData?.data?.items) {
            resData.data.items = resData.data.items.map(m => ({
                ...m,
                poster_url: m.poster_url ? resolveImg(m.poster_url) : resolveImg(m.thumb_url),
                thumb_url: resolveImg(m.thumb_url)
            }));
        }
        return resData;
    } catch (error) { return null; }
};

// 2. LIST
export const getMoviesBySlug = async (slug, page = 1, type = 'danh-sach', filterParams = {}) => {
    try {
        const url = `/${type}/${slug}`;
        const response = await client.get(url, { params: { page, ...filterParams } });
        const resData = response.data;
        if (resData?.data?.APP_DOMAIN_CDN_IMAGE) DYNAMIC_CDN = `${resData.data.APP_DOMAIN_CDN_IMAGE}/uploads/movies/`;
        if (resData?.data?.items) {
            resData.data.items = resData.data.items.map(m => ({
                ...m,
                poster_url: m.poster_url ? resolveImg(m.poster_url) : resolveImg(m.thumb_url),
                thumb_url: resolveImg(m.thumb_url)
            }));
        }
        return resData;
    } catch (error) { return null; }
}

// 3. MENU
export const getMenuData = async () => {
    try {
        const [theLoai, quocGia] = await Promise.all([client.get('/the-loai'), client.get('/quoc-gia')]);
        return { theLoai: theLoai.data.data.items || [], quocGia: quocGia.data.data.items || [] };
    } catch (error) { return { theLoai: [], quocGia: [] }; }
};

// 4. DETAIL
export const getMovieDetail = async (slug) => {
    try {
        const cleanSlug = slug.replace(/^player-/, '');
        const response = await client.get(`/phim/${cleanSlug}`);
        const resData = response.data;

        if (resData?.data?.APP_DOMAIN_CDN_IMAGE) DYNAMIC_CDN = `${resData.data.APP_DOMAIN_CDN_IMAGE}/uploads/movies/`;

        if (resData.status === 'success' && resData.data && resData.data.item) {
            const movieObj = resData.data.item;
            const thumb = resolveImg(movieObj.thumb_url);
            const poster = movieObj.poster_url ? resolveImg(movieObj.poster_url) : thumb;

            movieObj.poster_url = poster;
            movieObj.thumb_url = thumb;
            if (!movieObj.tmdb) movieObj.tmdb = { vote_average: 0, vote_count: 0 };

            return { status: true, movie: movieObj, episodes: movieObj.episodes || [] };
        }
        return { status: false, msg: 'Không tìm thấy phim' };
    } catch (error) { return { status: false, msg: 'Lỗi kết nối Server' }; }
};

// 5. SEARCH
export const searchMovies = async (keyword, page = 1) => {
    try {
        // Không truyền limit nữa, chỉ truyền page
        const response = await client.get('/tim-kiem', { params: { keyword, page } });
        const resData = response.data;

        if (resData?.data?.APP_DOMAIN_CDN_IMAGE) {
            DYNAMIC_CDN = `${resData.data.APP_DOMAIN_CDN_IMAGE}/uploads/movies/`;
        }

        if (resData?.data?.items) {
            resData.data.items = resData.data.items.map(m => ({
                ...m,
                poster_url: resolveImg(m.poster_url || m.thumb_url),
                thumb_url: resolveImg(m.thumb_url)
            }));
        }
        return resData;
    } catch (error) { return null; }
};

// 6. PEOPLES
export const getMoviePeoples = async (slug) => {
    try {
        const cleanSlug = slug.replace(/^player-/, '');
        const response = await client.get(`/phim/${cleanSlug}/peoples`);
        if (response.data?.data?.peoples) return response.data.data.peoples; 
        return [];
    } catch (error) { return []; }
};

// 7. IMAGES
export const getMovieImages = async (slug) => {
    try {
        const cleanSlug = slug.replace(/^player-/, '');
        const response = await client.get(`/phim/${cleanSlug}/images`);
        return response.data?.data || []; 
    } catch (error) { return []; }
};

// --- API CỦA RIÊNG BẠN (BACKEND) ---
// 8. Tăng view (Giữ nguyên, chỉ cần đảm bảo truyền đủ data)
export const increaseView = async (movieData) => {
    try {
        if (!movieData || !movieData.slug) return;
        await axios.post(`${MY_API_URL}/movies/view`, movieData);
    } catch (e) { console.error("Lỗi tăng view:", e); }
};

// 9. Lấy Trending (CẬP NHẬT MAPPING)
export const getTrendingMovies = async () => {
    try {
        const res = await axios.get(`${MY_API_URL}/movies/trending`);
        // Map từ DB (snake_case) sang App (camelCase)
        return res.data.map(m => ({
            _id: m.movie_slug,
            slug: m.movie_slug,
            name: m.movie_name,
            thumb_url: m.movie_thumb,
            
            // Map đúng các cột này
            quality: m.movie_quality || 'HD',
            year: m.movie_year || '2024',
            episode_current: m.episode_current || 'Full',
            vote_average: m.vote_average ? parseFloat(m.vote_average) : 0,

            origin_name: `${m.view_count} lượt xem` // Hiển thị view thay tên gốc
        }));
    } catch (e) { return []; }
};