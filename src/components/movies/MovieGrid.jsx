import React from 'react';
import MovieCard from './MovieCard';

const MovieGrid = ({ movies }) => {
  if (!movies || movies.length === 0) return null;

  return (
    <>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-x-4 gap-y-8">
        {movies.map((movie, index) => (
          <div 
            key={movie._id} 
            className="animate-fade-up-stagger opacity-0" // Mặc định ẩn để chờ animation
            style={{ animationDelay: `${index * 50}ms` }} // Mỗi card hiện chậm hơn 50ms
          >
            <MovieCard movie={movie} />
          </div>
        ))}
      </div>
      
      {/* CSS Animation nội bộ */}
      <style>{`
        @keyframes fadeUpStagger {
          from { opacity: 0; transform: translateY(30px) scale(0.95); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }
        .animate-fade-up-stagger {
          animation: fadeUpStagger 0.6s cubic-bezier(0.2, 0.8, 0.2, 1) forwards;
        }
      `}</style>
    </>
  );
};

export default MovieGrid;