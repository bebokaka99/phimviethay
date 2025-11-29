import React from 'react';
import { useNavigate } from 'react-router-dom';
import { IMG_URL } from '../../services/movieService';
import { FaPlayCircle, FaStar } from 'react-icons/fa';

const MovieCard = ({ movie }) => {
  const navigate = useNavigate();

  // --- LOGIC LẤY DATA CHUẨN TỪ OPHIM ---
  
  // 1. Rating: Ưu tiên lấy trong object tmdb (thường có data chuẩn hơn)
  // Nếu không có thì lấy ở ngoài. Nếu = 0 thì hiện N/A
  const ratingVal = movie.tmdb?.vote_average || movie.vote_average || 0;
  const displayRating = ratingVal > 0 ? ratingVal.toFixed(1) : 'N/A';

  // 2. Năm phát hành
  const year = movie.year || movie.category?.[0]?.name || 'Unknown';

  return (
    <div 
      className="relative group cursor-pointer select-none h-full flex flex-col"
      onClick={() => navigate(`/phim/${movie.slug}`)}
    >
        {/* --- CARD IMAGE --- */}
        <div className="relative w-full aspect-[2/3] rounded-xl overflow-hidden mb-3 bg-[#1a1a1a] shadow-lg transition-all duration-300 group-hover:scale-[1.03] group-hover:shadow-red-900/20 ring-1 ring-white/10 group-hover:ring-red-600">
            <img 
                src={`${IMG_URL}${movie.thumb_url}`} 
                alt={movie.name} 
                className="w-full h-full object-cover transform group-hover:brightness-75 transition-all duration-500" 
                loading="lazy" 
            />
            
            {/* Badge: Chất lượng (Góc trái trên) */}
            <div className="absolute top-2 left-2"> 
                <span className="bg-red-600 text-white text-[9px] font-bold px-2 py-0.5 rounded shadow-md shadow-red-900/50 uppercase">
                    {movie.quality || 'HD'}
                </span>
            </div>

            {/* Badge: Rating (Góc phải trên) - ĐÃ SỬA LOGIC */}
            <div className="absolute top-2 right-2">
                <span className="bg-yellow-500 text-black text-[9px] font-bold px-1.5 py-0.5 rounded shadow-md flex items-center gap-1">
                    {displayRating} <FaStar size={8} /> 
                </span>
            </div>

            {/* Badge: Tập phim (Góc trái dưới) */}
            <div className="absolute bottom-2 right-2 z-10">
                <span className="bg-black/60 backdrop-blur-md text-white text-[10px] font-bold px-2 py-0.5 rounded border border-white/10">
                    {movie.episode_current || 'Full'}
                </span>
            </div>

            {/* Icon Play (Hiện khi hover) */}
            <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 scale-75 group-hover:scale-100">
                <FaPlayCircle className="text-5xl text-white drop-shadow-[0_4px_6px_rgba(0,0,0,0.5)]" />
            </div>
        </div>
        
        {/* --- CARD INFO --- */}
        <div className="px-1">
            {/* Tên chính */}
            <h3 className="font-bold text-sm text-gray-200 line-clamp-1 group-hover:text-red-600 transition-colors">
                {movie.name}
            </h3>
            
            {/* Tên gốc & Năm */}
            <div className="flex items-center justify-between text-xs text-gray-500 mt-1">
                <span className="line-clamp-1 max-w-[70%] truncate" title={movie.origin_name}>
                    {movie.origin_name}
                </span>
                <span className="text-gray-400 border border-gray-700 px-1.5 rounded-[4px] bg-[#1a1a1a]">
                    {year}
                </span>
            </div>
        </div>
    </div>
  );
};

export default MovieCard;