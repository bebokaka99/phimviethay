import axios from 'axios';

const TMDB_KEY = 'e9e9d8da18ae29fc430845952232787c';
const BASE_URL = 'https://api.themoviedb.org/3';
const IMAGE_BASE = 'https://image.tmdb.org/t/p/w500';
const BACKDROP_BASE = 'https://image.tmdb.org/t/p/original';

// Hàm tìm kiếm nội bộ (Helper)
const searchTMDB = async (query, year = null) => {
    if (!query) return null;
    try {
        const params = { 
            api_key: TMDB_KEY, 
            query: query,
            page: 1,
            include_adult: false
        };
        if (year) params.year = year;

        // Dùng search/multi để tìm cả Movie và TV Show
        const res = await axios.get(`${BASE_URL}/search/multi`, { params });
        
        // Lọc kết quả: Chỉ lấy Movie hoặc TV, bỏ qua Person
        const validResults = res.data.results.filter(item => item.media_type === 'movie' || item.media_type === 'tv');
        
        return validResults.length > 0 ? validResults[0] : null;
    } catch (e) {
        return null;
    }
};

// Hàm lấy chi tiết (Main Function)
export const getTmdbDetails = async (movie) => {
    try {
        let endpoint = '';
        let mediaType = 'movie'; // Mặc định

        // --- BƯỚC 1: TÌM BẰNG ID (ƯU TIÊN CAO NHẤT) ---
        if (movie.tmdb?.id && movie.tmdb.id !== 'null') {
            endpoint = `/movie/${movie.tmdb.id}`;
        } 
        else if (movie.imdb?.id && movie.imdb.id !== 'null') {
             const findRes = await axios.get(`${BASE_URL}/find/${movie.imdb.id}`, {
                params: { api_key: TMDB_KEY, external_source: 'imdb_id' }
             });
             const result = findRes.data.movie_results[0] || findRes.data.tv_results[0];
             if (result) {
                 mediaType = findRes.data.movie_results[0] ? 'movie' : 'tv';
                 endpoint = `/${mediaType}/${result.id}`;
             }
        }

        // --- BƯỚC 2: TÌM BẰNG TÊN (NẾU KHÔNG CÓ ID) ---
        if (!endpoint) {
            const year = movie.year ? parseInt(movie.year) : null;
            
            // 2.1: Tìm Tên Gốc + Năm (Chuẩn nhất)
            // VD: "Bugonia" + 2025
            let result = await searchTMDB(movie.origin_name, year);

            // 2.2: Nếu không ra -> Tìm Tên Gốc (Bỏ năm) -> Fix lỗi lệch năm
            // VD: OPhim ghi 2025, TMDB ghi 2024 -> Bước này sẽ tìm ra "Bugonia"
            if (!result) {
                result = await searchTMDB(movie.origin_name);
            }

            // 2.3: Nếu vẫn không ra -> Tìm Tên Việt + Năm
            // VD: "Bĩ Cực Thái Lai" + 2025
            if (!result) {
                result = await searchTMDB(movie.name, year);
            }

            // 2.4: Nếu vẫn không ra -> Tìm Tên Việt (Bỏ năm)
            if (!result) {
                result = await searchTMDB(movie.name);
            }

            if (result) {
                mediaType = result.media_type || 'movie';
                endpoint = `/${mediaType}/${result.id}`;
            }
        }

        // --- BƯỚC 3: GỌI API CHI TIẾT ĐỂ LẤY DATA ---
        if (!endpoint) return null; // Thua, trả về null để dùng data OPhim

        const response = await axios.get(`${BASE_URL}${endpoint}`, {
            params: { api_key: TMDB_KEY, append_to_response: 'credits,videos' } // Lấy thêm diễn viên & trailer
        });

        const data = response.data;
        
        return {
            rating: data.vote_average ? data.vote_average.toFixed(1) : null,
            vote_count: data.vote_count,
            poster: data.poster_path ? `${IMAGE_BASE}${data.poster_path}` : null,
            backdrop: data.backdrop_path ? `${BACKDROP_BASE}${data.backdrop_path}` : null,
            overview: data.overview, // Mô tả tiếng Anh chuẩn
            // Lấy Trailer (Youtube)
            trailer: data.videos?.results?.find(v => v.site === 'YouTube' && v.type === 'Trailer')?.key,
            
            // Lấy Diễn viên (Có ảnh)
            cast: data.credits?.cast?.filter(c => c.profile_path).slice(0, 12).map(c => ({
                id: c.id,
                name: c.name,
                character: c.character,
                avatar: `${IMAGE_BASE}${c.profile_path}`
            })) || [],

            // Lấy Đạo diễn
            director: data.credits?.crew?.find(c => c.job === 'Director')?.name
        };

    } catch (error) {
        // console.error("TMDB Error:", error);
        return null;
    }
};