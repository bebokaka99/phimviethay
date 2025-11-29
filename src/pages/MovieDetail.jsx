import React, { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Header from '../components/layout/Header';
import { getMovieDetail, IMG_URL } from '../services/movieService';
import { checkFavoriteStatus, toggleFavorite } from '../services/authService'; 
import { FaPlay, FaClock, FaGlobe, FaStar, FaShareAlt, FaHeart, FaChevronDown, FaChevronUp, FaChevronLeft, FaChevronRight } from 'react-icons/fa';

// --- TOAST COMPONENT ---
const Toast = ({ message, onClose }) => {
    useEffect(() => {
        const timer = setTimeout(onClose, 3000);
        return () => clearTimeout(timer);
    }, [onClose]);

    return (
        <div className="fixed top-20 right-4 z-[200] bg-black/90 border-l-4 border-phim-accent text-white px-4 py-3 rounded shadow-2xl flex items-center gap-3 animate-fade-in-down max-w-[90vw]">
            <div className="bg-phim-accent p-1 rounded-full">
                <FaHeart className="text-white text-[10px]" />
            </div>
            <span className="text-sm font-medium line-clamp-1">{message}</span>
        </div>
    );
};

const MovieDetail = () => {
  const { slug } = useParams();
  const navigate = useNavigate();
  const [movie, setMovie] = useState(null);
  const [episodes, setEpisodes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isExpanded, setIsExpanded] = useState(false);
  const [toastMsg, setToastMsg] = useState('');
  
  const [isFavorite, setIsFavorite] = useState(false);

  const castRef = useRef(null);

  // --- HÀM TIỆN ÍCH (FIX: ĐÃ KHÔI PHỤC) ---
  const getInitials = (name) => {
      if (!name) return "?";
      const parts = name.trim().split(' ');
      if (parts.length === 1) return parts[0].charAt(0).toUpperCase();
      return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
  };

  const getRandomGradient = (name) => {
      const gradients = [
        'from-red-600 to-rose-900', 'from-blue-600 to-indigo-900', 
        'from-emerald-600 to-teal-900', 'from-violet-600 to-purple-900',
        'from-amber-500 to-orange-900'
      ];
      let hash = 0;
      for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash);
      return gradients[Math.abs(hash) % gradients.length];
  };

  const stripHtml = (html) => html ? html.replace(/<[^>]*>?/gm, '') : '';
  // ------------------------------------------

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [slug]);

  // 1. Lấy chi tiết phim
  useEffect(() => {
    const fetchDetail = async () => {
        setLoading(true);
        try {
            const data = await getMovieDetail(slug);

            if (data?.status && data?.movie) {
                setMovie(data.movie);
                
                const favStatus = await checkFavoriteStatus(data.movie.slug);
                setIsFavorite(favStatus);

                const eps = data.episodes || [];
                setEpisodes(eps);
            } else {
                console.error("API Error:", data?.msg);
            }
        } catch (error) {
            console.error("Error:", error);
        } finally {
            setLoading(false);
        }
    };
    if (slug) fetchDetail();
  }, [slug]);

  const showToast = (msg) => setToastMsg(msg);

  const scrollCast = (direction) => {
      if (castRef.current) {
          const { current } = castRef;
          const scrollAmount = direction === 'left' ? -200 : 200;
          current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
      }
  };

  const handleToggleFavorite = async () => {
      try {
          const newStatus = await toggleFavorite({
              slug: movie.slug,
              name: movie.name,
              thumb_url: movie.thumb_url
          });
          
          setIsFavorite(newStatus);
          showToast(newStatus ? 'Đã thêm vào danh sách yêu thích ❤️' : 'Đã xóa khỏi danh sách yêu thích 💔');
      } catch (error) {
          showToast(error.toString());
          if (error === "Vui lòng đăng nhập để lưu phim!") {
              setTimeout(() => navigate('/login'), 1500);
          }
      }
  };

  const handleWatchNow = () => {
      if (episodes.length > 0 && episodes[0].server_data.length > 0) {
          const firstEp = episodes[0].server_data[0];
          navigate(`/xem-phim/${movie.slug}?tap=${firstEp.slug}`);
      } else {
          showToast('Phim đang cập nhật, vui lòng quay lại sau!');
      }
  };

  const handleShare = () => {
      navigator.clipboard.writeText(window.location.href);
      showToast('Đã sao chép đường dẫn phim!');
  };

  if (loading) return (
      <div className="min-h-screen bg-phim-dark flex items-center justify-center text-white">
          <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-phim-accent"></div>
      </div>
  );

  if (!movie) return (
    <div className="min-h-screen bg-phim-dark text-white flex flex-col items-center justify-center gap-4">
        <h2 className="text-xl font-bold">Không tìm thấy phim</h2>
        <button onClick={() => navigate('/')} className="bg-phim-accent px-6 py-2 rounded-full text-sm">Về trang chủ</button>
    </div>
  );

  const backdropImg = movie.poster_url ? `${IMG_URL}${movie.poster_url}` : `${IMG_URL}${movie.thumb_url}`;
  const posterImg = `${IMG_URL}${movie.thumb_url}`;

  return (
    <div className="bg-phim-dark min-h-screen text-white pb-10 font-sans overflow-x-hidden">
      <Header />
      {toastMsg && <Toast message={toastMsg} onClose={() => setToastMsg('')} />}
      
      <div className="relative w-full min-h-[100vh] md:min-h-[800px] flex items-end md:items-center">
          <div className="absolute inset-0 bg-cover bg-center md:bg-top" style={{ backgroundImage: `url(${backdropImg})` }}>
              <div className="absolute inset-0 bg-phim-dark/70 md:bg-phim-dark/50 backdrop-blur-[2px]" />
          </div>
          <div className="absolute inset-0 bg-gradient-to-t from-phim-dark via-phim-dark/30 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-r from-phim-dark via-phim-dark/50 to-transparent" />

          <div className="relative w-full container mx-auto px-4 md:px-12 pt-24 pb-12">
              <div className="flex flex-col md:flex-row gap-6 md:gap-14 items-center md:items-start">
                  
                  <div className="w-[150px] md:w-[320px] flex-shrink-0 relative z-20 shadow-2xl rounded-lg overflow-hidden border border-white/20 group">
                      <img src={posterImg} alt={movie.name} className="w-full h-full object-cover transform group-hover:scale-105 transition duration-500" />
                      <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer md:hidden" onClick={handleWatchNow}>
                          <FaPlay className="text-4xl text-white drop-shadow-lg" />
                      </div>
                  </div>

                  <div className="flex-1 space-y-5 md:space-y-7 z-20 text-center md:text-left w-full">
                      
                      <div className="flex flex-wrap justify-center md:justify-start items-center gap-2 md:gap-3 text-xs md:text-sm font-medium text-gray-400">
                          <span className="bg-red-600 text-white px-2.5 py-0.5 rounded font-bold border-none shadow-sm">{movie.quality}</span>
                          <span className="uppercase border border-gray-600 px-2 py-0.5 rounded">{movie.lang}</span>
                          <span className="hidden md:inline">•</span>
                          <span>{movie.year}</span>
                      </div>

                      <div>
                          <h1 className="text-2xl md:text-4xl lg:text-5xl font-black leading-tight text-white drop-shadow-xl line-clamp-2" title={movie.name}>
                              {movie.name}
                          </h1>
                          <h2 className="text-sm md:text-lg text-gray-400 font-medium mt-5 line-clamp-1">{movie.origin_name}</h2>
                      </div>

                      <div className="flex flex-wrap justify-center md:justify-start items-center gap-4 md:gap-6 text-xs md:text-sm font-bold text-gray-300">
                          <div className="flex items-center gap-1 text-yellow-400 text-base">
                              <FaStar /> <span>{movie.vote_average || 8.5}</span>
                          </div>
                          <div className="flex items-center gap-2 bg-black/30 px-3 py-1.5 rounded-full border border-white/5">
                              <FaClock className="text-phim-accent"/> <span>{movie.time}</span>
                          </div>
                          <div className="flex items-center gap-2 bg-black/30 px-3 py-1.5 rounded-full border border-white/5">
                              <FaGlobe className="text-phim-accent"/> <span>{movie.country?.[0]?.name}</span>
                          </div>
                      </div>

                      <div className="flex flex-wrap justify-center md:justify-start gap-2">
                          {movie.category?.map(c => (
                              <span key={c.id} className="text-[10px] md:text-xs font-bold text-gray-300 bg-white/5 hover:bg-phim-accent hover:text-white px-2.5 py-1 rounded transition cursor-pointer border border-white/10">
                                  {c.name}
                              </span>
                          ))}
                      </div>

                      <div className="text-sm md:text-base text-gray-300 leading-loose max-w-3xl mx-auto md:mx-0">
                          <p className={isExpanded ? '' : 'line-clamp-3 md:line-clamp-4'}>
                              {stripHtml(movie.content)}
                          </p>
                          <button onClick={() => setIsExpanded(!isExpanded)} className="text-phim-accent font-bold mt-2 hover:underline text-xs flex items-center gap-1 justify-center md:justify-start w-full md:w-auto">
                              {isExpanded ? 'Thu gọn' : 'Xem thêm'} <FaChevronDown className={`transform transition ${isExpanded ? 'rotate-180' : ''}`}/>
                          </button>
                      </div>

                      <div className="flex flex-wrap justify-center md:justify-start gap-3 pt-3">
                          <button 
                            onClick={handleWatchNow} 
                            className="bg-phim-accent text-white px-8 py-3 rounded-full font-bold flex items-center gap-2 hover:bg-red-700 transition shadow-lg shadow-red-900/30 transform active:scale-95"
                          >
                              <FaPlay /> XEM NGAY
                          </button>
                          
                          <button 
                            onClick={handleToggleFavorite} 
                            className={`p-3.5 rounded-full transition border ${isFavorite ? 'bg-red-600 border-red-600 text-white shadow-lg shadow-red-900/40' : 'bg-white/10 text-white border-white/10 hover:bg-white/20'}`}
                          >
                              <FaHeart />
                          </button>
                          
                          <button 
                            onClick={handleShare} 
                            className="bg-white/10 text-white p-3.5 rounded-full hover:bg-white/20 transition border border-white/10"
                          >
                              <FaShareAlt />
                          </button>
                      </div>
                  </div>
              </div>
          </div>
      </div>

      <div className="container mx-auto max-w-7xl px-4 md:px-12 -mt-6 relative z-30 space-y-10">
          
          <section className="relative group/cast">
              <h3 className="text-lg md:text-xl font-bold mb-4 text-white border-l-4 border-phim-accent pl-3">Diễn viên & Đạo diễn</h3>
              <button onClick={() => scrollCast('left')} className="absolute left-0 top-1/2 z-10 bg-black/70 p-2 rounded-full text-white opacity-0 group-hover/cast:opacity-100 hover:bg-phim-accent transition hidden md:block -ml-4 shadow-lg"><FaChevronLeft /></button>
              <button onClick={() => scrollCast('right')} className="absolute right-0 top-1/2 z-10 bg-black/70 p-2 rounded-full text-white opacity-0 group-hover/cast:opacity-100 hover:bg-phim-accent transition hidden md:block -mr-4 shadow-lg"><FaChevronRight /></button>
              <div ref={castRef} className="flex overflow-x-auto gap-4 pb-4 scrollbar-hide snap-x scroll-smooth">
                  {movie.director?.map((dir, idx) => (
                      <div key={`dir-${idx}`} className="flex flex-col items-center min-w-[80px] snap-start">
                          <div className="w-14 h-14 md:w-16 md:h-16 rounded-full flex items-center justify-center text-sm font-bold shadow-md mb-2 border border-gray-600 bg-gray-800 text-gray-400">
                              {getInitials(dir)}
                          </div>
                          <p className="text-xs font-bold text-center text-white line-clamp-1 w-full">{dir}</p>
                          <p className="text-[10px] text-gray-500 uppercase">Đạo diễn</p>
                      </div>
                  ))}
                  {movie.actor?.map((act, idx) => (
                      <div key={`act-${idx}`} className="flex flex-col items-center min-w-[80px] snap-start">
                          <div className={`w-14 h-14 md:w-16 md:h-16 rounded-full flex items-center justify-center text-sm font-bold shadow-md mb-2 border border-transparent bg-gradient-to-br ${getRandomGradient(act)}`}>
                              {getInitials(act)}
                          </div>
                          <p className="text-xs font-bold text-center text-white line-clamp-1 w-full">{act}</p>
                          <p className="text-[10px] text-gray-500 uppercase">Diễn viên</p>
                      </div>
                  ))}
              </div>
          </section>

          <section id="episodes-section" className="bg-gray-900/50 p-4 md:p-8 rounded-xl border border-white/5">
              <h3 className="text-lg md:text-xl font-bold mb-5 flex items-center gap-2"><FaPlay className="text-phim-accent text-sm" /> Danh sách tập</h3>
              {episodes.length > 0 ? (
                  episodes.map((server, idx) => (
                      <div key={idx} className="mb-6 last:mb-0">
                          <h4 className="text-gray-400 font-bold uppercase text-xs mb-3 flex items-center gap-2">
                              <span className="w-1.5 h-1.5 bg-green-500 rounded-full"></span> {server.server_name}
                          </h4>
                          <div className="grid grid-cols-3 sm:grid-cols-5 md:grid-cols-8 lg:grid-cols-12 gap-2">
                              {server.server_data.map((ep) => (
                                  <button key={ep.slug} 
                                          className="bg-gray-800 hover:bg-phim-accent text-gray-300 hover:text-white py-2 px-1 rounded font-medium text-xs transition-all border border-gray-700 hover:border-phim-accent truncate"
                                          onClick={() => navigate(`/xem-phim/${movie.slug}?tap=${ep.slug}`)}>
                                      {ep.name}
                                  </button>
                              ))}
                          </div>
                      </div>
                  ))
              ) : (
                  <div className="text-center py-8 text-gray-500 border border-dashed border-gray-700 rounded"><p className="text-sm">Chưa có tập phim nào.</p></div>
              )}
          </section>
      </div>
    </div>
  );
};

export default MovieDetail;