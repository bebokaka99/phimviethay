import axios from 'axios';

// 1. CẤU HÌNH CLIENT
const client = axios.create({
    baseURL: 'https://ophim1.com/v1/api',
    headers: { 'Content-Type': 'application/json' }
});

// Biến lưu domain ảnh (Mặc định, sẽ tự cập nhật khi gọi API)
let DYNAMIC_CDN = 'https://img.ophim.live/uploads/movies/'; 

// Export rỗng để component không tự ghép link
export const IMG_URL = ''; 

// --- HÀM XỬ LÝ ẢNH (CORE) ---
const resolveImg = (url) => {
    // 1. Nếu không có ảnh -> Trả về ảnh giữ chỗ
    if (!url) return 'https://placehold.co/300x450?text=No+Image';
    
    // 2. Nếu là link full (http/https) -> Giữ nguyên
    if (url.startsWith('http')) return url;

    // 3. Xử lý đường dẫn tương đối (loại bỏ dấu / ở đầu nếu có)
    const cleanPath = url.startsWith('/') ? url.slice(1) : url;

    // 4. Ghép với Domain động lấy từ API
    return `${DYNAMIC_CDN}${cleanPath}`;
};

// ============================================================

// 1. API TRANG CHỦ (/home)
export const getHomeData = async () => {
    try {
        const response = await client.get('/home');
        const resData = response.data;

        if (resData?.data?.APP_DOMAIN_CDN_IMAGE) {
            DYNAMIC_CDN = `${resData.data.APP_DOMAIN_CDN_IMAGE}/uploads/movies/`;
        }

        if (resData?.data?.items) {
            resData.data.items = resData.data.items.map(m => {
                const thumb = resolveImg(m.thumb_url);
                const poster = m.poster_url ? resolveImg(m.poster_url) : thumb;
                
                return {
                    ...m,
                    poster_url: poster,
                    thumb_url: thumb
                };
            });
        }
        return resData;
    } catch (error) {
        console.error("Lỗi Home:", error);
        return null;
    }
};

// 2. LẤY DANH SÁCH (NÂNG CẤP ĐỂ HỖ TRỢ LỌC & SẮP XẾP)
export const getMoviesBySlug = async (slug, page = 1, type = 'danh-sach', filterParams = {}) => {
    try {
        const url = `/${type}/${slug}`;
                
        // Gộp params phân trang và params lọc (sort, year, etc...)
        const response = await client.get(url, {
            params: { 
                page: page,
                ...filterParams // Truyền thêm sort_field, year... vào đây
            }
        });
        const resData = response.data;

        if (resData?.data?.APP_DOMAIN_CDN_IMAGE) {
            DYNAMIC_CDN = `${resData.data.APP_DOMAIN_CDN_IMAGE}/uploads/movies/`;
        }

        if (resData?.data?.items) {
            resData.data.items = resData.data.items.map(m => {
                const thumb = resolveImg(m.thumb_url);
                return {
                    ...m,
                    poster_url: m.poster_url ? resolveImg(m.poster_url) : thumb,
                    thumb_url: thumb
                };
            });
        }
        return resData;
    } catch (error) {
        return null;
    }
}

// 3. API MENU
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

// 4. API CHI TIẾT PHIM
export const getMovieDetail = async (slug) => {
    try {
        const cleanSlug = slug.replace(/^player-/, '');
        
        const response = await client.get(`/phim/${cleanSlug}`);
        const resData = response.data;

        if (resData?.data?.APP_DOMAIN_CDN_IMAGE) {
            DYNAMIC_CDN = `${resData.data.APP_DOMAIN_CDN_IMAGE}/uploads/movies/`;
        }

        if (resData.status === 'success' && resData.data && resData.data.item) {
            const movieObj = resData.data.item;
            
            const thumb = resolveImg(movieObj.thumb_url);
            const poster = movieObj.poster_url ? resolveImg(movieObj.poster_url) : thumb;

            movieObj.poster_url = poster;
            movieObj.thumb_url = thumb;

            const episodes = movieObj.episodes || [];

            return {
                status: true,
                movie: movieObj,
                episodes: episodes
            };
        }
        return { status: false, msg: 'Không tìm thấy phim' };
    } catch (error) {
        return { status: false, msg: 'Lỗi kết nối Server' };
    }
};

// 5. API TÌM KIẾM
export const searchMovies = async (keyword) => {
    try {
        const response = await client.get('/tim-kiem', { params: { keyword } });
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