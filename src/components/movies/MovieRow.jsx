import React, { useRef } from 'react';
import { useNavigate } from 'react-router-dom'; 
import { IMG_URL } from '../../services/movieService';
import { FaChevronLeft, FaChevronRight, FaPlayCircle, FaStar } from 'react-icons/fa';

// Thêm prop `slug` và `type` (mặc định type='danh-sach')
const MovieRow = ({ title, movies, slug, type = 'danh-sach' }) => {
  const navigate = useNavigate();
  const rowRef = useRef(null);

  const scroll = (direction) => {
    const { current } = rowRef;
    if (current) {
        const width = current.offsetWidth; 
        const scrollAmount = direction === 'left' ? -(width * 0.8) : (width * 0.8);
        current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
  };

  // Hàm chuyển hướng khi bấm Xem tất cả
  const handleViewAll = () => {
      // Nếu type là 'quoc-gia' -> /quoc-gia/han-quoc
      // Nếu type là 'the-loai' -> /the-loai/hanh-dong
      // Mặc định -> /danh-sach/phim-le
      if (slug) navigate(`/${type}/${slug}`);
  };

  if (!movies || movies.length === 0) return null;

  return (
    <div className="px-4 md:px-16 py-8 group/row relative">
      <div className="flex items-end justify-between mb-5 px-1">
          <h2 
            className="text-xl md:text-2xl font-bold text-white border-l-4 border-phim-accent pl-3 uppercase tracking-wide cursor-pointer hover:text-phim-accent transition"
            onClick={handleViewAll}
          >
            {title}
          </h2>
          
          <span 
            className="text-xs font-semibold text-gray-400 hover:text-phim-accent cursor-pointer flex items-center gap-1 transition-colors"
            onClick={handleViewAll}
          >
             Xem tất cả <FaChevronRight size={10} />
          </span>
      </div>
      
      <div className="relative group/list">
        <button 
            onClick={() => scroll('left')}
            className="absolute left-[-40px] top-0 bottom-0 z-30 w-16 flex items-center justify-center text-white/50 hover:text-white hover:scale-125 transition-all duration-200 hidden md:flex opacity-0 group-hover/row:opacity-100"
        >
            <FaChevronLeft size={40} className="drop-shadow-lg" />
        </button>

        <div 
            ref={rowRef}
            className="flex overflow-x-auto scrollbar-hide gap-3 md:gap-5 pb-4 scroll-smooth"
            style={{ scrollBehavior: 'smooth' }}
        >
          {movies.map((movie) => (
            <div 
              key={movie._id} 
              onClick={() => navigate(`/phim/${movie.slug}`)} 
              className="relative flex-none w-[160px] md:w-[200px] group cursor-pointer select-none"
            >
              <div className="relative w-full aspect-[2/3] rounded-lg overflow-hidden mb-3 bg-gray-900 transition-all duration-300 group-hover:scale-[1.03] group-hover:shadow-lg group-hover:shadow-black/60">
                 <img 
                    src={`${IMG_URL}${movie.thumb_url}`} 
                    alt={movie.name}
                    className="w-full h-full object-cover transform group-hover:brightness-75 transition-all duration-500"
                    loading="lazy" 
                 />
                 <div className="absolute top-2 left-2 right-2 flex items-center justify-between z-10"> 
                     <span className="bg-phim-accent text-white text-[10px] font-bold px-2 py-0.5 rounded shadow-sm">
                        {movie.episode_current || 'Full'}
                     </span>
                     <span className="bg-yellow-400/90 text-black text-[10px] font-bold px-1.5 py-0.5 rounded shadow-sm flex items-center gap-1">
                        {movie.vote_average || '8.5'} <FaStar size={8} /> 
                     </span>
                 </div>
                 <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 scale-75 group-hover:scale-100">
                    <FaPlayCircle className="text-5xl text-white drop-shadow-xl" />
                 </div>
              </div>

              <div className="px-1">
                  <h3 className="font-bold text-sm text-gray-200 line-clamp-1 group-hover:text-phim-accent transition-colors">
                      {movie.name}
                  </h3>
                  <div className="flex items-center justify-between text-xs text-gray-500 mt-1">
                      <span className="line-clamp-1 max-w-[70%]">{movie.origin_name}</span>
                      <span className="text-gray-400">{movie.year}</span>
                  </div>
              </div>
            </div>
          ))}
        </div>

        <button 
            onClick={() => scroll('right')}
            className="absolute right-[-40px] top-0 bottom-0 z-30 w-16 flex items-center justify-center text-white/50 hover:text-white hover:scale-125 transition-all duration-200 hidden md:flex opacity-0 group-hover/row:opacity-100"
        >
            <FaChevronRight size={40} className="drop-shadow-lg" />
        </button>
      </div>
    </div>
  );
};

export default MovieRow;