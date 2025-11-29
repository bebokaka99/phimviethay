import axios from 'axios';

const client = axios.create({
    baseURL: 'https://ophim1.com/v1/api',
    headers: { 'Content-Type': 'application/json' }
});

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

            return { status: true, movie: movieObj, episodes: movieObj.episodes || [] };
        }
        return { status: false, msg: 'Không tìm thấy phim' };
    } catch (error) { return { status: false, msg: 'Lỗi kết nối Server' }; }
};

// 5. SEARCH
export const searchMovies = async (keyword) => {
    try {
        const response = await client.get('/tim-kiem', { params: { keyword } });
        const resData = response.data;
        if (resData?.data?.APP_DOMAIN_CDN_IMAGE) DYNAMIC_CDN = `${resData.data.APP_DOMAIN_CDN_IMAGE}/uploads/movies/`;
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

// --- [QUAN TRỌNG] API PHỤ TRỢ CỦA OPHIM ---

// 6. Lấy Diễn viên (Có ảnh)
export const getMoviePeoples = async (slug) => {
    try {
        const cleanSlug = slug.replace(/^player-/, '');
        const response = await client.get(`/phim/${cleanSlug}/peoples`);
        
        // Cấu trúc JSON: { data: { peoples: [...] } }
        if (response.data?.data?.peoples) {
             return response.data.data.peoples; 
        }
        return [];
    } catch (error) {
        return [];
    }
};

// 7. API LẤY HÌNH ẢNH
export const getMovieImages = async (slug) => {
    try {
        const cleanSlug = slug.replace(/^player-/, '');
        const response = await client.get(`/phim/${cleanSlug}/images`);
        // Thường cấu trúc images cũng tương tự
        return response.data?.data || []; 
    } catch (error) { return []; }
};