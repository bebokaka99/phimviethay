import React, { useEffect, useState } from 'react';
import { getMovieDetail } from '../../services/movieService'; 
import { FaEdit, FaFilm, FaImage } from 'react-icons/fa';
import { Skeleton } from '../common/Skeleton'; 

const MovieIntroCard = ({ stats, onClick }) => {
    const [movie, setMovie] = useState(null);
    const [loading, setLoading] = useState(true);
    const [imageError, setImageError] = useState(false);

    useEffect(() => {
        const fetchMeta = async () => {
            try {
                // Gọi API lấy chi tiết phim
                const res = await getMovieDetail(stats.movie_slug);
                
                // --- SỬA LỖI Ở ĐÂY: CHECK KỸ CẤU TRÚC TRẢ VỀ ---
                if (res && res.status && res.movie) {
                    setMovie(res.movie); // Lấy object phim thực sự nằm bên trong res.movie
                } else {
                    // Fallback nếu API lỗi hoặc không tìm thấy phim
                    setMovie({
                        name: stats.movie_slug, // Dùng tạm slug làm tên
                        origin_name: 'Không tìm thấy thông tin',
                        thumb_url: '',
                        poster_url: ''
                    });
                }
            } catch (error) {
                console.error("Lỗi lấy info phim:", stats.movie_slug);
            } finally {
                setLoading(false);
            }
        };
        fetchMeta();
    }, [stats.movie_slug]);

    if (loading) {
        return (
            <div className="w-full aspect-[2/3] bg-[#111] rounded-lg overflow-hidden border border-white/5 animate-pulse relative">
                 <Skeleton className="w-full h-full" />
            </div>
        );
    }

    // Logic lấy ảnh: Ưu tiên poster -> thumb
    // Lưu ý: getMovieDetail đã tự xử lý resolveImg rồi nên link ở đây là link full
    const posterSrc = movie?.poster_url || movie?.thumb_url;
    
    return (
        <div 
            onClick={onClick}
            className="group relative w-full bg-[#111] rounded-lg overflow-hidden cursor-pointer transition-all duration-300 hover:scale-105 hover:shadow-xl hover:shadow-red-900/20 hover:ring-2 hover:ring-red-600 ring-offset-2 ring-offset-[#0a0a0a]"
        >
            {/* --- HÌNH ẢNH --- */}
            <div className="relative w-full aspect-[2/3] overflow-hidden bg-gray-900">
                {!imageError && posterSrc ? (
                    <img 
                        src={posterSrc} 
                        alt={movie?.name} 
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                        onError={() => setImageError(true)}
                        loading="lazy"
                    />
                ) : (
                    // Fallback khi lỗi ảnh
                    <div className="w-full h-full flex flex-col items-center justify-center text-gray-600 bg-[#1a1a1a] p-4 text-center">
                        <FaImage size={32} className="mb-2 opacity-50" />
                        <span className="text-xs font-bold uppercase tracking-widest opacity-50">No Image</span>
                    </div>
                )}

                {/* Overlay gradient */}
                <div className="absolute inset-x-0 bottom-0 h-2/3 bg-gradient-to-t from-black via-black/60 to-transparent opacity-90"></div>
                
                {/* Badge số tập */}
                <div className="absolute top-2 right-2 bg-red-600 text-white text-[10px] font-bold px-2 py-0.5 rounded shadow-md z-10">
                    {stats.total_intros} EP
                </div>

                {/* Hover Action */}
                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-20 bg-black/40 backdrop-blur-[2px]">
                    <button className="bg-red-600 text-white px-4 py-2 rounded-full font-bold text-xs flex items-center gap-2 transform translate-y-4 group-hover:translate-y-0 transition-transform duration-300 shadow-lg">
                        <FaEdit /> Quản lý
                    </button>
                </div>
            </div>

            {/* --- THÔNG TIN --- */}
            <div className="absolute bottom-0 left-0 w-full p-3 z-10">
                <h3 className="text-white font-bold text-sm truncate leading-tight mb-1 drop-shadow-md" title={movie?.name || stats.movie_slug}>
                    {movie?.name || stats.movie_slug}
                </h3>
                <p className="text-gray-300 text-[10px] truncate opacity-80">
                    {movie?.origin_name || "Đang cập nhật..."}
                </p>
            </div>
        </div>
    );
};

export default MovieIntroCard;