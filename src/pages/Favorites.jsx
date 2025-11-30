import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import Header from '../components/layout/Header';
import { getFavorites, getCurrentUser, toggleFavorite } from '../services/authService';
import { FaHeart, FaPlayCircle, FaTrashAlt, FaStar, FaFilm, FaExclamationTriangle } from 'react-icons/fa';

const Favorites = () => {
  const navigate = useNavigate();
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // State cho Modal Xóa
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [movieToDelete, setMovieToDelete] = useState(null);

  // 1. LOAD DATA & MAP
  const fetchFavs = async () => {
      const data = await getFavorites();
      
      // Map dữ liệu từ Database (snake_case) sang chuẩn hiển thị
      const mappedData = data.map(item => ({
          id: item.id, // ID record
          slug: item.movie_slug,
          name: item.movie_name,
          thumb_url: item.movie_thumb,
          // Các thông số chi tiết (Lấy từ DB đã nâng cấp)
          quality: item.movie_quality || 'HD',
          year: item.movie_year || '2024',
          episode_current: item.episode_current || 'Full',
          vote_average: item.vote_average ? parseFloat(item.vote_average) : 0,
      }));

      setFavorites(mappedData || []);
      setLoading(false);
  };

  useEffect(() => {
    // Kiểm tra đăng nhập
    if (!getCurrentUser()) { navigate('/login'); return; }
    fetchFavs();
  }, [navigate]);

  // 2. XỬ LÝ XÓA
  const requestDelete = (e, movie) => {
      e.stopPropagation();
      setMovieToDelete(movie);
      setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
      if (movieToDelete) {
          await toggleFavorite({ slug: movieToDelete.slug });
          fetchFavs(); // Load lại danh sách sau khi xóa
          setShowDeleteModal(false);
          setMovieToDelete(null);
      }
  };

  return (
    <div className="bg-phim-dark min-h-screen text-white font-sans pb-20 selection:bg-red-600 selection:text-white">
      <Helmet>
          <title>Tủ Phim Của Tôi | PhimVietHay</title>
      </Helmet>

      
      <div className="pt-28 px-4 md:px-12 container mx-auto">
          
          {/* Header Tủ Phim */}
          <div className="mb-10 border-b border-white/10 pb-6 flex items-end justify-between">
              <h1 className="text-2xl md:text-3xl font-bold uppercase tracking-wide flex items-center gap-3">
                  <span className="text-red-600 border-l-4 border-red-600 pl-3">Tủ Phim Của Tôi</span>
              </h1>
              <span className="text-gray-400 font-bold bg-white/5 px-3 py-1 rounded-lg border border-white/5">
                  {favorites.length} phim
              </span>
          </div>

          {/* Nội dung */}
          {loading ? (
              <div className="flex justify-center py-40">
                  <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-red-600"></div>
              </div>
          ) : favorites.length > 0 ? (
              
              // --- GRID PHIM (Code tay để thêm nút Xóa, nhưng style giống hệt MovieCard) ---
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 gap-y-8">
                  {favorites.map((movie) => (
                      <div 
                        key={movie.id} 
                        className="relative group cursor-pointer select-none"
                        onClick={() => navigate(`/phim/${movie.slug}`)}
                      >
                          {/* Card Image */}
                          <div className="relative w-full aspect-[2/3] rounded-lg overflow-hidden mb-3 bg-[#1a1a1a] transition-all duration-300 group-hover:scale-[1.03] group-hover:shadow-lg group-hover:shadow-red-900/20 ring-1 ring-white/10 group-hover:ring-red-600">
                              <img 
                                src={movie.thumb_url} 
                                alt={movie.name} 
                                className="w-full h-full object-cover transform group-hover:brightness-75 transition-all duration-500" 
                                loading="lazy" 
                              />
                              
                              {/* Badge Quality */}
                              <div className="absolute top-2 left-2"> 
                                  <span className="bg-red-600 text-white text-[9px] font-bold px-2 py-0.5 rounded shadow-md uppercase">{movie.quality}</span>
                              </div>

                              {/* Badge Rating */}
                              <div className="absolute top-2 right-2">
                                  <span className="bg-yellow-500 text-black text-[9px] font-bold px-1.5 py-0.5 rounded shadow-md flex items-center gap-1">
                                      {movie.vote_average || 'N/A'} <FaStar size={8} />
                                  </span>
                              </div>

                              {/* Nút Xóa Nhanh (Thùng rác - Chỉ hiện ở trang này) */}
                              <div 
                                onClick={(e) => requestDelete(e, movie)}
                                className="absolute bottom-2 right-2 bg-black/60 text-red-500 p-1.5 rounded-md hover:bg-red-600 hover:text-white transition z-30 opacity-0 group-hover:opacity-100 cursor-pointer border border-red-500/30 shadow-lg"
                                title="Xóa khỏi tủ"
                              >
                                  <FaTrashAlt size={12} />
                              </div>

                              {/* Badge Tập */}
                              <div className="absolute bottom-2 left-2 z-10">
                                  <span className="bg-black/60 backdrop-blur-sm text-white text-[10px] font-bold px-2 py-0.5 rounded border border-white/10">
                                      {movie.episode_current}
                                  </span>
                              </div>

                              {/* Nút Play */}
                              <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 scale-75 group-hover:scale-100 bg-black/20">
                                  <FaPlayCircle className="text-4xl text-white drop-shadow-xl" />
                              </div>
                          </div>
                          
                          {/* Info */}
                          <div className="px-1">
                              <h3 className="font-bold text-sm text-gray-200 line-clamp-1 group-hover:text-red-600 transition-colors">
                                  {movie.name}
                              </h3>
                              <div className="flex items-center justify-between text-xs text-gray-500 mt-1">
                                  <span className="line-clamp-1 max-w-[60%] text-gray-600">Đã lưu</span>
                                  <span className="text-gray-400 border border-gray-700 px-1 rounded">{movie.year}</span>
                              </div>
                          </div>
                      </div>
                  ))}
              </div>
          ) : (
              // Empty State
              <div className="flex flex-col items-center justify-center py-32 text-gray-500 border-2 border-dashed border-gray-800 rounded-2xl bg-white/5">
                  <FaHeart className="text-6xl mb-4 text-gray-700 animate-pulse"/>
                  <p className="text-xl font-bold text-gray-400">Tủ phim trống trơn</p>
                  <p className="text-sm text-gray-600 mt-2 mb-6">Lưu lại những bộ phim hay để xem sau nhé!</p>
                  <button onClick={() => navigate('/')} className="bg-red-600 px-8 py-3 rounded-full font-bold hover:bg-red-700 transition text-white shadow-lg shadow-red-900/20">
                      Khám phá ngay
                  </button>
              </div>
          )}
      </div>

      {/* --- MODAL XÓA PHIM (Style Kính Mờ) --- */}
      {showDeleteModal && (
          <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/90 backdrop-blur-sm animate-fade-in">
              <div className="bg-[#1a1a1a] border border-white/10 p-6 rounded-2xl shadow-2xl w-full max-w-sm text-center transform scale-100 transition-all">
                  <div className="w-16 h-16 bg-red-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                      <FaExclamationTriangle className="text-3xl text-red-500" />
                  </div>
                  <h3 className="text-xl font-bold text-white mb-2">Xóa khỏi tủ phim?</h3>
                  <p className="text-gray-400 text-sm mb-6">
                      Bạn có chắc chắn muốn xóa <span className="text-white font-bold">"{movieToDelete?.name}"</span> khỏi danh sách yêu thích không?
                  </p>
                  <div className="flex gap-3">
                      <button 
                        onClick={() => setShowDeleteModal(false)}
                        className="flex-1 py-2.5 rounded-xl font-bold text-gray-400 bg-[#222] hover:bg-[#333] transition"
                      >
                          Hủy bỏ
                      </button>
                      <button 
                        onClick={confirmDelete}
                        className="flex-1 py-2.5 rounded-xl font-bold text-white bg-red-600 hover:bg-red-700 transition shadow-lg"
                      >
                          Xóa ngay
                      </button>
                  </div>
              </div>
          </div>
      )}
    </div>
  );
};

export default Favorites;