import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import Header from '../components/layout/Header';
import { searchMovies, IMG_URL } from '../services/movieService';
import { FaPlayCircle, FaSearch, FaFilm, FaStar } from 'react-icons/fa';

const SearchPage = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const keyword = searchParams.get('keyword');
  
  const [movies, setMovies] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    window.scrollTo(0, 0);
    if (!keyword) return;
    
    const fetchSearch = async () => {
        setLoading(true);
        try {
            const data = await searchMovies(keyword);
            if (data?.data?.items) {
                setMovies(data.data.items);
            } else {
                setMovies([]);
            }
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };
    fetchSearch();
  }, [keyword]);

  return (
    <div className="bg-phim-dark min-h-screen text-white font-sans">
      <Header />
      
      <div className="pt-28 px-4 md:px-12 container mx-auto pb-20">
          
          {/* Header Kết quả */}
          <div className="mb-10 border-b border-gray-800 pb-6">
              <h2 className="text-2xl md:text-3xl font-bold flex items-center gap-3">
                  <span className="bg-phim-accent p-3 rounded-full">
                    <FaSearch className="text-white text-xl" />
                  </span>
                  Kết quả cho: <span className="text-phim-accent italic">"{keyword}"</span>
              </h2>
              {!loading && (
                  <p className="text-gray-400 mt-2 ml-14">
                      Tìm thấy <strong className="text-white">{movies.length}</strong> bộ phim phù hợp
                  </p>
              )}
          </div>

          {/* Loading State */}
          {loading && (
              <div className="flex flex-col items-center justify-center py-20 gap-4">
                  <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-phim-accent"></div>
                  <p className="text-gray-500 animate-pulse">Đang quét kho phim...</p>
              </div>
          )}

          {/* Grid Kết quả (STYLE MỚI GIỐNG HOME) */}
          {!loading && movies.length > 0 && (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-x-4 gap-y-8">
                  {movies.map((movie) => (
                      <div 
                        key={movie._id} 
                        className="relative group cursor-pointer select-none"
                        onClick={() => navigate(`/phim/${movie.slug}`)}
                      >
                          {/* Card Ảnh */}
                          <div className="relative w-full aspect-[2/3] rounded-lg overflow-hidden mb-3 bg-gray-900 transition-all duration-300 group-hover:scale-[1.03] group-hover:shadow-lg group-hover:shadow-black/60 ring-1 ring-white/10 group-hover:ring-phim-accent/50">
                              <img 
                                src={`${IMG_URL}${movie.thumb_url}`} 
                                alt={movie.name} 
                                className="w-full h-full object-cover transform group-hover:brightness-75 transition-all duration-500"
                                loading="lazy"
                              />
                              
                              {/* Badges Top */}
                              <div className="absolute top-2 left-2 right-2 flex items-center justify-between z-10"> 
                                  <span className="bg-red-600 text-white text-[9px] font-bold px-1.5 py-0.5 rounded shadow-sm">
                                      {movie.quality || 'HD'}
                                  </span>
                                  <span className="bg-yellow-500 text-black text-[9px] font-bold px-1.5 py-0.5 rounded shadow-sm flex items-center gap-1">
                                      {movie.vote_average || '8.5'} <FaStar size={8} /> 
                                  </span>
                              </div>

                              {/* Badge Bottom (Số tập) */}
                              <div className="absolute bottom-2 right-2 z-10">
                                  <span className="bg-black/60 backdrop-blur-sm text-white text-[10px] font-bold px-2 py-0.5 rounded border border-white/10">
                                      {movie.episode_current || 'Full'}
                                  </span>
                              </div>

                              {/* Play Icon Center */}
                              <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 scale-75 group-hover:scale-100">
                                  <FaPlayCircle className="text-4xl text-white drop-shadow-xl" />
                              </div>
                          </div>
                          
                          {/* Info */}
                          <div className="px-1">
                              <h3 className="font-bold text-sm text-gray-200 line-clamp-1 group-hover:text-phim-accent transition-colors">
                                  {movie.name}
                              </h3>
                              <div className="flex items-center justify-between text-xs text-gray-500 mt-1">
                                  <span className="line-clamp-1 max-w-[60%]">{movie.origin_name}</span>
                                  <span className="text-gray-400 border border-gray-700 px-1 rounded">{movie.year}</span>
                              </div>
                          </div>
                      </div>
                  ))}
              </div>
          )}

          {/* Không tìm thấy (Empty State) */}
          {!loading && movies.length === 0 && (
              <div className="flex flex-col items-center justify-center py-20 text-gray-500 opacity-60 border-2 border-dashed border-gray-800 rounded-2xl bg-white/5">
                  <FaFilm className="text-6xl mb-4" />
                  <p className="text-xl font-medium">Không tìm thấy phim nào.</p>
                  <p className="text-sm mt-2">Hãy thử tìm bằng tên tiếng Anh hoặc từ khóa ngắn hơn.</p>
              </div>
          )}
      </div>
    </div>
  );
};

export default SearchPage;