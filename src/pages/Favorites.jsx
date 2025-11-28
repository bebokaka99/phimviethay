import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../components/layout/Header';
import { getFavorites, getCurrentUser } from '../services/authService';
import { FaPlayCircle, FaHeart, FaFilm } from 'react-icons/fa';

const Favorites = () => {
  const navigate = useNavigate();
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!getCurrentUser()) { navigate('/login'); return; }
    
    const fetchFavs = async () => {
        const data = await getFavorites();
        setFavorites(data || []);
        setLoading(false);
    };
    fetchFavs();
  }, [navigate]);

  return (
    <div className="bg-phim-dark min-h-screen text-white font-sans pb-20">
      <Header />
      <div className="pt-32 px-4 md:px-12 container mx-auto">
          <h1 className="text-3xl font-bold mb-8 border-l-4 border-phim-accent pl-4 uppercase flex items-center gap-3">
              <FaHeart className="text-red-600" /> Tủ Phim Của Tôi
          </h1>

          {loading ? (
              <div className="flex justify-center py-20">
                  <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-phim-accent"></div>
              </div>
          ) : favorites.length > 0 ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
                  {favorites.map((movie) => (
                      <div key={movie.id} className="relative group cursor-pointer select-none" onClick={() => navigate(`/phim/${movie.movie_slug}`)}>
                          <div className="relative w-full aspect-[2/3] rounded-lg overflow-hidden mb-3 bg-gray-900 transition-all duration-300 group-hover:scale-[1.03] group-hover:shadow-lg group-hover:shadow-red-900/20 ring-1 ring-white/10 group-hover:ring-red-600">
                              <img src={movie.movie_thumb} alt={movie.movie_name} className="w-full h-full object-cover transform group-hover:brightness-75 transition-all duration-500" loading="lazy" />
                              <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 scale-75 group-hover:scale-100">
                                  <FaPlayCircle className="text-4xl text-white drop-shadow-xl" />
                              </div>
                          </div>
                          <div className="px-1">
                              <h3 className="font-bold text-sm text-gray-200 line-clamp-2 group-hover:text-red-500 transition-colors">{movie.movie_name}</h3>
                          </div>
                      </div>
                  ))}
              </div>
          ) : (
              <div className="py-20 text-center border-2 border-dashed border-gray-800 rounded-2xl bg-white/5">
                  <FaFilm className="text-5xl mx-auto mb-4 opacity-50"/>
                  <p className="text-xl text-gray-400">Chưa có phim nào trong tủ.</p>
                  <button onClick={() => navigate('/')} className="mt-4 text-phim-accent hover:underline font-bold">Khám phá phim ngay</button>
              </div>
          )}
      </div>
    </div>
  );
};

export default Favorites;