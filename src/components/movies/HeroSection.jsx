import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { IMG_URL } from '../../services/movieService';
import { FaPlay, FaInfoCircle, FaStar } from 'react-icons/fa';

const HeroSection = ({ movies }) => {
  const navigate = useNavigate();
  const [currentIndex, setCurrentIndex] = useState(0);
  const heroMovies = movies ? movies.slice(0, 5) : [];

  useEffect(() => {
    if (heroMovies.length === 0) return;
    const interval = setInterval(() => {
        setCurrentIndex(prev => (prev === heroMovies.length - 1 ? 0 : prev + 1));
    }, 8000);
    return () => clearInterval(interval);
  }, [currentIndex, heroMovies]);

  if (heroMovies.length === 0) return null;

  const movie = heroMovies[currentIndex];
  const backdropImg = `${IMG_URL}${movie.poster_url || movie.thumb_url}`;
  const posterImg = `${IMG_URL}${movie.thumb_url}`;

  const handleNavigate = () => {
      navigate(`/phim/${movie.slug}`);
  };

  const stripHtml = (html) => {
      if (!html) return "";
      return html.replace(/<[^>]*>?/gm, '');
  }

  return (
    <div className="relative h-[500px] md:h-[700px] w-full text-white overflow-hidden group">
      
      {/* BACKGROUND - Thêm key để transition mượt khi đổi ảnh */}
      <div 
        key={movie._id + '-bg'} 
        className="absolute inset-0 bg-cover bg-center transition-all duration-1000 ease-in-out"
        style={{ backgroundImage: `url(${backdropImg})` }}
      >
         <div className="absolute inset-0 bg-phim-dark/30 backdrop-blur-[2px]" /> 
      </div>
      
      <div className="absolute inset-0 bg-gradient-to-t from-phim-dark via-phim-dark/20 to-transparent" />
      <div className="absolute inset-0 bg-gradient-to-r from-phim-dark via-phim-dark/50 to-transparent" />
      <div className="absolute inset-0 bg-gradient-to-l from-phim-dark/80 via-transparent to-transparent" />

      {/* MAIN CONTENT */}
      <div className="absolute inset-0 flex items-center justify-center pb-8 md:pb-0">
        <div className="w-full max-w-[1500px] mx-auto px-6 md:px-16 flex flex-col md:flex-row items-center justify-between gap-8 md:gap-12 mt-10 md:mt-0">
            
            {/* CỘT TRÁI: TEXT - Thêm key để re-render animation */}
            <div key={movie._id + '-text'} className="w-full md:w-[60%] space-y-6 z-10 animate-fade-up-custom">
                
                <h1 
                    onClick={handleNavigate}
                    className="text-3xl md:text-5xl font-black leading-snug drop-shadow-2xl text-transparent bg-clip-text bg-gradient-to-r from-white to-gray-300 py-2 cursor-pointer hover:opacity-80 transition line-clamp-2"
                    title={movie.name} 
                >
                  {movie.name}
                </h1>
                
                <div className="flex flex-wrap items-center gap-3 text-sm md:text-base font-medium text-gray-200">
                    <span className="flex items-center gap-1 text-yellow-400 font-bold text-lg">
                        <FaStar /> {movie.vote_average || '8.8'}
                    </span>
                    <span className="bg-white/20 px-3 py-1 rounded">
                        {movie.year}
                    </span>
                    <span className="bg-phim-accent px-3 py-1 rounded text-white font-bold uppercase tracking-wider shadow-lg shadow-red-600/20">
                        {movie.quality || 'HD'}
                    </span>
                     <span className="text-gray-300 border border-gray-500 px-3 py-1 rounded uppercase">
                        {movie.lang}
                    </span>
                </div>

                <p className="text-gray-300 text-base md:text-lg line-clamp-3 leading-relaxed max-w-xl drop-shadow-md pb-2">
                   {stripHtml(movie.content) || `Trải nghiệm điện ảnh đỉnh cao với ${movie.name}. Một tác phẩm xuất sắc đến từ ${movie.origin_name}.`}
                </p>

                <div className="flex gap-4 pt-2">
                    <button 
                        onClick={handleNavigate}
                        className="bg-phim-accent text-white px-8 py-3 md:px-10 md:py-4 rounded-full hover:bg-red-700 transition font-bold flex items-center gap-3 shadow-xl shadow-red-900/40 transform hover:scale-105 text-base md:text-lg"
                    >
                        <FaPlay /> XEM NGAY
                    </button>
                    <button 
                        onClick={handleNavigate}
                        className="bg-white/10 text-white px-8 py-3 md:px-10 md:py-4 rounded-full hover:bg-white/20 transition backdrop-blur-md font-bold flex items-center gap-3 border border-white/20 text-base md:text-lg"
                    >
                        <FaInfoCircle /> CHI TIẾT
                    </button>
                </div>
            </div>

            {/* CỘT PHẢI: POSTER - Thêm key để re-render animation */}
            <div key={movie._id + '-poster'} className="hidden md:flex w-full md:w-[40%] justify-end relative z-10 animate-poster-custom pr-8">
                <div 
                    onClick={handleNavigate}
                    className="w-[260px] aspect-[2/3] rounded-2xl overflow-hidden shadow-[0_20px_50px_rgba(0,0,0,0.6)] border border-white/10 transform rotate-3 hover:rotate-0 transition duration-700 ease-out group-hover:scale-105 cursor-pointer"
                >
                     <img src={posterImg} alt={movie.name} className="w-full h-full object-cover" />
                </div>
            </div>
        </div>
      </div>

      {/* THUMBNAIL NAVIGATION */}
      <div className="absolute bottom-8 right-12 z-20 hidden xl:flex items-center gap-4">
          {heroMovies.map((m, idx) => (
            <div 
                key={m._id}
                onClick={() => setCurrentIndex(idx)}
                className={`relative w-28 h-16 rounded-lg overflow-hidden cursor-pointer transition-all duration-500 ease-out ${
                    idx === currentIndex 
                    ? 'scale-110 -translate-y-2 shadow-2xl shadow-black/80 ring-1 ring-white/50 z-10 opacity-100' 
                    : 'opacity-50 hover:opacity-100 hover:scale-105 grayscale hover:grayscale-0'
                }`}
            >
                <img 
                    src={`${IMG_URL}${m.thumb_url}`} 
                    alt="" 
                    className="w-full h-full object-cover"
                />
                 {idx === currentIndex && (
                    <div className="absolute bottom-0 left-0 h-[2px] bg-phim-accent animate-[loading_8s_linear_infinite]" style={{width: '100%'}}></div>
                )}
            </div>
          ))}
      </div>
    </div>
  );
};

export default HeroSection;