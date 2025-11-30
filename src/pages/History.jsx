import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import Header from '../components/layout/Header';
import { getWatchHistory, getCurrentUser, clearWatchHistory } from '../services/authService';
import { IMG_URL } from '../services/movieService';
import { FaHistory, FaPlayCircle, FaTrashAlt, FaEye } from 'react-icons/fa'; // Đã bỏ FaClock

// --- HÀM XỬ LÝ THỜI GIAN (FIX TIMEZONE) ---
const parseDate = (dateString) => {
    if (!dateString) return new Date();
    let dateStr = String(dateString);
    if (!dateStr.includes('Z') && !dateStr.includes('+')) {
        dateStr = dateStr.replace(' ', 'T') + 'Z';
    }
    return new Date(dateStr);
};

const timeAgo = (dateString) => {
    const date = parseDate(dateString);
    const now = new Date();
    
    // Tính khoảng cách (Giây)
    let seconds = Math.floor((now - date) / 1000);

    // Fix lệch múi giờ 7 tiếng (nếu có)
    if (seconds > 21000 && seconds < 29000) seconds -= 25200;

    if (seconds < 60) return 'Vừa xong';
    
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes} phút trước`;

    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours} giờ trước`;

    const days = Math.floor(hours / 24);
    if (days < 7) return `${days} ngày trước`;
    
    const months = Math.floor(days / 30);
    if (months < 12) return `${months} tháng trước`;

    return `${Math.floor(days / 365)} năm trước`;
};

const History = () => {
  const navigate = useNavigate();
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!getCurrentUser()) { navigate('/login'); return; }
    
    const fetchHistory = async () => {
        const data = await getWatchHistory();
        setHistory(data || []);
        setLoading(false);
    };
    fetchHistory();
  }, [navigate]);

  const handleClear = async () => {
      if (window.confirm('Bạn có chắc muốn xóa toàn bộ lịch sử xem?')) {
          await clearWatchHistory();
          setHistory([]);
      }
  };

  return (
    <div className="min-h-screen text-white font-sans pb-20 selection:bg-red-600 selection:text-white">
      <Helmet>
          <title>Lịch Sử Xem | PhimVietHay</title>
      </Helmet>

      
      <div className="pt-28 px-4 md:px-12 container mx-auto">
          
          <div className="mb-10 border-b border-white/10 pb-6 flex items-end justify-between">
              <h1 className="text-2xl md:text-3xl font-bold uppercase tracking-wide flex items-center gap-3">
                  <span className="text-red-600 border-l-4 border-red-600 pl-3">Lịch Sử Xem</span>
              </h1>
              {history.length > 0 && (
                  <button 
                    onClick={handleClear}
                    className="flex items-center gap-2 bg-white/5 hover:bg-red-900/50 text-gray-400 hover:text-red-500 px-4 py-2 rounded-lg transition border border-white/5 hover:border-red-900/50 text-sm font-bold"
                  >
                      <FaTrashAlt /> Xóa tất cả
                  </button>
              )}
          </div>

          {loading ? (
              <div className="flex justify-center py-40"><div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-red-600"></div></div>
          ) : history.length > 0 ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 gap-y-8">
                  {history.map((item, idx) => (
                      <div 
                        key={idx} 
                        className="relative group cursor-pointer select-none"
                        onClick={() => navigate(`/xem-phim/${item.movie_slug}?tap=${item.episode_slug}`)}
                      >
                          <div className="relative w-full aspect-[2/3] rounded-lg overflow-hidden mb-3 bg-[#1a1a1a] transition-all duration-300 group-hover:scale-[1.03] group-hover:shadow-lg group-hover:shadow-red-900/20 ring-1 ring-white/10 group-hover:ring-red-600">
                              <img 
                                src={`${IMG_URL}${item.movie_thumb}`} 
                                alt={item.movie_name} 
                                className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition duration-500" 
                                loading="lazy" 
                              />
                              
                              {/* Badge Tập Đang Xem */}
                              <div className="absolute top-2 right-2 bg-red-600/90 text-white text-[10px] font-bold px-2 py-1 rounded shadow-md flex items-center gap-1 w-fit z-10">
                                  <FaEye /> Bạn đang xem tập: {item.episode_name || '...'}
                              </div>

                              <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 scale-75 group-hover:scale-100 bg-black/20">
                                  <FaPlayCircle className="text-4xl text-white drop-shadow-xl" />
                              </div>
                              
                              <div className="absolute bottom-0 left-0 w-full h-1 bg-gray-700">
                                  <div className="h-full bg-red-600 w-3/4 shadow-[0_0_10px_rgba(220,38,38,0.8)]"></div>
                              </div>
                          </div>
                          
                          <div className="px-1">
                              <h3 className="font-bold text-sm text-gray-200 line-clamp-1 group-hover:text-red-600 transition-colors">{item.movie_name}</h3>
                              
                              {/* CHỈ CÒN HIỂN THỊ THỜI GIAN TƯƠNG ĐỐI */}
                              <div className="mt-1">
                                  <span className="text-xs text-green-400 font-bold flex items-center gap-1.5">
                                      <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></div>
                                      {timeAgo(item.updated_at)}
                                  </span>
                              </div>
                          </div>
                      </div>
                  ))}
              </div>
          ) : (
              <div className="py-20 text-center border-2 border-dashed border-gray-800 rounded-2xl bg-white/5">
                  <FaHistory className="text-6xl mx-auto mb-4 text-gray-700"/>
                  <p className="text-xl font-bold text-gray-400">Bạn chưa xem phim nào.</p>
                  <button onClick={() => navigate('/')} className="mt-6 bg-red-600 px-8 py-3 rounded-full font-bold hover:bg-red-700 transition text-white shadow-lg">
                      Xem phim ngay
                  </button>
              </div>
          )}
      </div>
    </div>
  );
};

export default History;