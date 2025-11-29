import React, { useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaChevronLeft, FaChevronRight } from 'react-icons/fa';
import MovieCard from './MovieCard'; // Import Card chuẩn

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

  const handleViewAll = () => {
      if (slug) navigate(`/${type}/${slug}`);
  };

  if (!movies || movies.length === 0) return null;

  return (
    <div className="px-4 md:px-16 py-8 group/row relative">
      {/* Header Title */}
      <div className="flex items-end justify-between mb-5 px-1">
          <h2 
            className="text-xl md:text-2xl font-bold text-white border-l-4 border-red-600 pl-3 uppercase tracking-wide cursor-pointer hover:text-red-600 transition"
            onClick={handleViewAll}
          >
            {title}
          </h2>
          
          <span 
            className="text-xs font-semibold text-gray-400 hover:text-red-600 cursor-pointer flex items-center gap-1 transition-colors"
            onClick={handleViewAll}
          >
             Xem tất cả <FaChevronRight size={10} />
          </span>
      </div>
      
      {/* Slider */}
      <div className="relative group/list">
        <button 
            onClick={() => scroll('left')}
            className="absolute left-[-40px] top-0 bottom-0 z-30 w-16 flex items-center justify-center text-white/50 hover:text-white hover:scale-125 transition-all duration-200 hidden md:flex opacity-0 group-hover/row:opacity-100"
        >
            <FaChevronLeft size={40} className="drop-shadow-lg" />
        </button>

        <div 
            ref={rowRef}
            className="flex overflow-x-auto scrollbar-hide gap-4 pb-4 scroll-smooth"
            style={{ scrollBehavior: 'smooth' }}
        >
          {movies.map((movie) => (
            // Wrapper định hình kích thước cho Card trong Slider
            <div key={movie._id} className="flex-none w-[160px] md:w-[200px]">
               <MovieCard movie={movie} />
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