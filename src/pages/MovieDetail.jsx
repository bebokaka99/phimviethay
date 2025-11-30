import React, { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import Header from '../components/layout/Header';
import { getMovieDetail, getMoviesBySlug, getMoviePeoples, IMG_URL } from '../services/movieService'; // Giữ nguyên import
import { checkFavoriteStatus, toggleFavorite } from '../services/authService';
// Bỏ import getTmdbDetails vì ta đã chốt không dùng nữa
import { FaPlay, FaList, FaLightbulb, FaStar, FaServer, FaStepForward, FaArrowLeft, FaExpand, FaCompress, FaClock, FaGlobe, FaUsers, FaHeart, FaShareAlt, FaChevronDown, FaChevronLeft, FaChevronRight, FaYoutube } from 'react-icons/fa';

// Toast (Giữ nguyên)
const Toast = ({ message, onClose }) => {
    useEffect(() => { const t = setTimeout(onClose, 3000); return () => clearTimeout(t); }, [onClose]);
    return (
        <div className="fixed top-20 right-4 z-[200] bg-black/90 border-l-4 border-phim-accent text-white px-4 py-3 rounded shadow-2xl flex items-center gap-3 animate-fade-in-down max-w-[90vw]">
            <div className="bg-phim-accent p-1 rounded-full"><FaHeart className="text-white text-[10px]" /></div>
            <span className="text-sm font-medium line-clamp-1">{message}</span>
        </div>
    );
};

const MovieDetail = () => {
  const { slug } = useParams();
  const navigate = useNavigate();
  
  const [movie, setMovie] = useState(null);
  const [episodes, setEpisodes] = useState([]);
  const [currentEpisode, setCurrentEpisode] = useState(null); // Thêm state này nếu bạn dùng để chiếu phim, nếu chỉ detail thì ko cần
  
  const [casts, setCasts] = useState([]);
  const [relatedMovies, setRelatedMovies] = useState([]); // Nếu có logic related

  const [loading, setLoading] = useState(true);
  const [isExpanded, setIsExpanded] = useState(false);
  const [toastMsg, setToastMsg] = useState('');
  const [isFavorite, setIsFavorite] = useState(false);
  
  const castRef = useRef(null);

  useEffect(() => { window.scrollTo(0, 0); }, [slug]);

  // 1. FETCH DATA
  useEffect(() => {
    const fetchDetail = async () => {
        setLoading(true);
        try {
            const data = await getMovieDetail(slug);

            if (data?.status && data?.movie) {
                setMovie(data.movie);
                
                // Gọi API phụ lấy diễn viên (OPhim)
                getMoviePeoples(slug).then(res => setCasts(res || []));

                // Logic Favorite
                const favStatus = await checkFavoriteStatus(data.movie.slug);
                setIsFavorite(favStatus);

                const eps = data.episodes || [];
                setEpisodes(eps);
            }
        } catch (error) { console.error("Error:", error); } 
        finally { setLoading(false); }
    };
    if (slug) fetchDetail();
  }, [slug]);

  const showToast = (msg) => setToastMsg(msg);
  const scrollCast = (dir) => { if (castRef.current) { const amount = dir === 'left' ? -200 : 200; castRef.current.scrollBy({ left: amount, behavior: 'smooth' }); } };

  // --- [QUAN TRỌNG] SỬA LOGIC LƯU PHIM ---
  const handleToggleFavorite = async () => {
      try {
          // 1. Lấy Rating chuẩn: Ưu tiên tmdb.vote_average
          const ratingRaw = movie.tmdb?.vote_average || movie.vote_average || 0;
          
          // 2. Lấy tập hiện tại chuẩn
          // API OPhim trả về field "episode_current" (VD: "Tập 1", "Full", "Trailer")
          const currentEp = movie.episode_current || 'Full';

          const newStatus = await toggleFavorite({
              slug: movie.slug,
              name: movie.name,
              thumb_url: movie.thumb_url,
              // Gửi đúng các trường này về Backend
              quality: movie.quality || 'HD',
              year: movie.year,
              episode_current: currentEp, // <-- Gửi đúng cái này
              vote_average: ratingRaw     // <-- Gửi đúng cái này
          });
          
          setIsFavorite(newStatus);
          showToast(newStatus ? 'Đã thêm vào danh sách yêu thích ❤️' : 'Đã xóa khỏi danh sách yêu thích 💔');
      } catch (error) {
          showToast(error.toString());
          if (error === "Vui lòng đăng nhập để lưu phim!") setTimeout(() => navigate('/login'), 1500);
      }
  };
  // ----------------------------------------

  const handleWatchNow = () => {
      if (episodes.length > 0 && episodes[0].server_data.length > 0) {
          const firstEp = episodes[0].server_data[0];
          navigate(`/xem-phim/${movie.slug}?tap=${firstEp.slug}`);
      } else {
          showToast('Phim đang cập nhật...');
      }
  };
  
  const handleShare = () => { navigator.clipboard.writeText(window.location.href); showToast('Đã sao chép liên kết!'); };
  
  const getInitials = (name) => { if (!name) return "?"; const p = name.trim().split(' '); if (p.length === 1) return p[0].charAt(0); return (p[0].charAt(0) + p[p.length - 1].charAt(0)).toUpperCase(); };
  const getRandomGradient = () => 'from-gray-700 to-gray-900';
  const getActorImg = (path) => { if (!path) return null; if (path.startsWith('http')) return path; return `https://image.tmdb.org/t/p/w200${path}`; };
  const stripHtml = (html) => html ? html.replace(/<[^>]*>?/gm, '') : '';

  if (loading) return <div className="min-h-screen bg-phim-dark flex items-center justify-center text-white"><div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-phim-accent"></div></div>;
  if (!movie) return <div className="min-h-screen bg-phim-dark text-white flex flex-col items-center justify-center gap-4"><h2 className="text-xl font-bold">Không tìm thấy phim</h2><button onClick={() => navigate('/')} className="bg-phim-accent px-6 py-2 rounded-full text-sm">Về trang chủ</button></div>;

  const backdropImg = `${IMG_URL}${movie.poster_url}` || `${IMG_URL}${movie.thumb_url}`;
  const posterImg = `${IMG_URL}${movie.thumb_url}`;
  
  // Hiển thị Rating trên UI
  const rating = movie.tmdb?.vote_average || movie.vote_average || 0;
  const voteCount = movie.tmdb?.vote_count || 0;

  const movieContentClean = stripHtml(movie.content);
  const pageTitle = `${movie.name} (${movie.year}) - Xem Phim HD`;

  return (
    <div className="bg-phim-dark min-h-screen text-white pb-10 font-sans overflow-x-hidden">
      <Helmet>
        <title>{pageTitle}</title>
        <meta name="description" content={movieContentClean.substring(0, 150)} />
        <meta property="og:title" content={pageTitle} />
        <meta property="og:image" content={posterImg} />
      </Helmet>

      {toastMsg && <Toast message={toastMsg} onClose={() => setToastMsg('')} />}
      
      {/* HERO BANNER */}
      <div className="relative w-full min-h-[100vh] md:min-h-[800px] flex items-end md:items-center">
          <div className="absolute inset-0 bg-cover bg-center md:bg-top" style={{ backgroundImage: `url(${backdropImg})` }}>
              <div className="absolute inset-0 bg-phim-dark/70 md:bg-phim-dark/50 backdrop-blur-[2px]" />
          </div>
          <div className="absolute inset-0 bg-gradient-to-t from-phim-dark via-phim-dark/30 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-r from-phim-dark via-phim-dark/50 to-transparent" />

          <div className="relative w-full container mx-auto px-4 md:px-12 pt-24 pb-12">
              <div className="flex flex-col md:flex-row gap-6 md:gap-14 items-center md:items-start">
                  {/* Poster */}
                  <div className="w-[150px] md:w-[320px] flex-shrink-0 relative z-20 shadow-2xl rounded-lg overflow-hidden border border-white/20 group">
                      <img src={posterImg} alt={movie.name} className="w-full h-full object-cover transform group-hover:scale-105 transition duration-500" />
                      <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer md:hidden" onClick={handleWatchNow}>
                          <FaPlay className="text-4xl text-white drop-shadow-lg" />
                      </div>
                  </div>

                  {/* Info */}
                  <div className="flex-1 space-y-5 md:space-y-7 z-20 text-center md:text-left w-full">
                      <div className="flex flex-wrap justify-center md:justify-start items-center gap-2 md:gap-3 text-xs md:text-sm font-medium text-gray-400">
                          <span className="bg-red-600 text-white px-2.5 py-0.5 rounded font-bold border-none shadow-sm">{movie.quality}</span>
                          <span className="uppercase border border-gray-600 px-2 py-0.5 rounded">{movie.lang}</span>
                          <span>{movie.year}</span>
                      </div>

                      <div>
                          <h1 className="text-2xl md:text-4xl lg:text-5xl font-black leading-tight text-white drop-shadow-xl line-clamp-2" title={movie.name}>{movie.name}</h1>
                          <h2 className="text-sm md:text-lg text-gray-400 font-medium mt-5 line-clamp-1">{movie.origin_name}</h2>
                      </div>

                      <div className="flex flex-wrap justify-center md:justify-start items-center gap-4 md:gap-6 text-xs md:text-sm font-bold text-gray-300">
                          <div className="flex items-center gap-1 text-yellow-400 text-base">
                              {/* Hiển thị rating chuẩn */}
                              <FaStar /> <span>{rating > 0 ? rating : 'N/A'}</span> <span className="text-xs text-gray-500 font-normal">({voteCount} votes)</span>
                          </div>
                          <div className="flex items-center gap-2 bg-black/30 px-3 py-1.5 rounded-full border border-white/5"><FaClock className="text-phim-accent"/> <span>{movie.time}</span></div>
                          <div className="flex items-center gap-2 bg-black/30 px-3 py-1.5 rounded-full border border-white/5"><FaGlobe className="text-phim-accent"/> <span>{movie.country?.[0]?.name}</span></div>
                      </div>

                      <div className="flex flex-wrap justify-center md:justify-start gap-2">
                          {movie.category?.map(c => (
                              <span key={c.id} className="text-[10px] md:text-xs font-bold text-gray-300 bg-white/5 hover:bg-phim-accent hover:text-white px-2.5 py-1 rounded transition cursor-pointer border border-white/10">{c.name}</span>
                          ))}
                      </div>

                      <div className="text-sm md:text-base text-gray-300 leading-loose max-w-3xl mx-auto md:mx-0">
                          <p className={isExpanded ? '' : 'line-clamp-3 md:line-clamp-4'}>{movieContentClean}</p>
                          <button onClick={() => setIsExpanded(!isExpanded)} className="text-phim-accent font-bold mt-2 hover:underline text-xs flex items-center gap-1 justify-center md:justify-start w-full md:w-auto">
                              {isExpanded ? 'Thu gọn' : 'Xem thêm'} <FaChevronDown className={`transform transition ${isExpanded ? 'rotate-180' : ''}`}/>
                          </button>
                      </div>

                      <div className="flex flex-wrap justify-center md:justify-start gap-3 pt-3">
                          <button onClick={handleWatchNow} className="bg-phim-accent text-white px-8 py-3 rounded-full font-bold flex items-center gap-2 hover:bg-red-700 transition shadow-lg shadow-red-900/30 transform active:scale-95"><FaPlay /> XEM NGAY</button>
                          
                          {movie.trailer_url && <button onClick={() => window.open(movie.trailer_url, '_blank')} className="bg-white/10 text-white px-6 py-3 rounded-full font-bold flex items-center gap-2 hover:bg-red-600 hover:border-red-600 transition border border-white/10"><FaYoutube /> Trailer</button>}

                          <button onClick={handleToggleFavorite} className={`p-3.5 rounded-full transition border ${isFavorite ? 'bg-red-600 border-red-600 text-white shadow-lg shadow-red-900/40' : 'bg-white/10 text-white border-white/10 hover:bg-white/20'}`}><FaHeart /></button>
                          <button onClick={handleShare} className="bg-white/10 text-white p-3.5 rounded-full hover:bg-white/20 transition border border-white/10"><FaShareAlt /></button>
                      </div>
                  </div>
              </div>
          </div>
      </div>

      <div className="container mx-auto max-w-7xl px-4 md:px-12 -mt-6 relative z-30 space-y-10">
          
          {/* CAST SECTION */}
          <section className="relative group/cast">
              <h3 className="text-lg md:text-xl font-bold mb-4 text-white border-l-4 border-phim-accent pl-3">Diễn viên & Đạo diễn</h3>
              <button onClick={() => scrollCast(castRef, 'left')} className="absolute left-0 top-1/2 z-10 bg-black/70 p-2 rounded-full text-white opacity-0 group-hover/cast:opacity-100 hover:bg-phim-accent transition hidden md:block -ml-4 shadow-lg"><FaChevronLeft /></button>
              <button onClick={() => scrollCast(castRef, 'right')} className="absolute right-0 top-1/2 z-10 bg-black/70 p-2 rounded-full text-white opacity-0 group-hover/cast:opacity-100 hover:bg-phim-accent transition hidden md:block -mr-4 shadow-lg"><FaChevronRight /></button>
              
              <div ref={castRef} className="flex overflow-x-auto gap-4 pb-4 scrollbar-hide snap-x scroll-smooth">
                  {movie.director?.map((dir, idx) => (
                      <div key={`dir-${idx}`} className="flex flex-col items-center min-w-[80px] snap-start">
                          <div className="w-14 h-14 md:w-16 md:h-16 rounded-full flex items-center justify-center text-sm font-bold shadow-md mb-2 border border-gray-600 bg-gray-800 text-gray-400">DIR</div>
                          <p className="text-xs font-bold text-center text-white line-clamp-1 w-full">{dir}</p>
                          <p className="text-[10px] text-gray-500 uppercase">Đạo diễn</p>
                      </div>
                  ))}

                  {casts.length > 0 ? (
                      casts.map((actor, idx) => (
                          <div key={idx} className="flex flex-col items-center min-w-[90px] snap-start group/actor">
                              <div className="w-16 h-16 md:w-20 md:h-20 rounded-full overflow-hidden shadow-md mb-2 border-2 border-transparent group-hover/actor:border-phim-accent transition bg-gray-800">
                                  {actor.profile_path ? <img src={getActorImg(actor.profile_path)} alt={actor.name} className="w-full h-full object-cover" loading="lazy"/> : <div className="w-full h-full flex items-center justify-center text-xs text-gray-400">No Img</div>}
                              </div>
                              <p className="text-xs font-bold text-center text-white line-clamp-1 w-full group-hover/actor:text-phim-accent transition">{actor.name}</p>
                              <p className="text-[10px] text-gray-500 text-center truncate w-full">{actor.character || 'Diễn viên'}</p>
                          </div>
                      ))
                  ) : (
                      movie.actor?.map((act, idx) => (
                          <div key={`act-${idx}`} className="flex flex-col items-center min-w-[80px] snap-start">
                              <div className={`w-14 h-14 md:w-16 md:h-16 rounded-full flex items-center justify-center text-sm font-bold shadow-md mb-2 border border-transparent bg-gradient-to-br ${getRandomGradient()}`}>{getInitials(act)}</div>
                              <p className="text-xs font-bold text-center text-white line-clamp-1 w-full">{act}</p>
                              <p className="text-[10px] text-gray-500 uppercase">Diễn viên</p>
                          </div>
                      ))
                  )}
              </div>
          </section>

          {/* EPISODES */}
          <section id="episodes-section" className="bg-gray-900/50 p-4 md:p-8 rounded-xl border border-white/5">
               <h3 className="text-lg md:text-xl font-bold mb-5 flex items-center gap-2"><FaPlay className="text-phim-accent text-sm" /> Danh sách tập</h3>
               {episodes.length > 0 ? (
                  episodes.map((server, idx) => (
                      <div key={idx} className="mb-6 last:mb-0">
                          <h4 className="text-gray-400 font-bold uppercase text-xs mb-3 flex items-center gap-2"><span className="w-1.5 h-1.5 bg-green-500 rounded-full"></span> {server.server_name}</h4>
                          <div className="grid grid-cols-3 sm:grid-cols-5 md:grid-cols-8 lg:grid-cols-12 gap-2">
                              {server.server_data.map((ep) => (
                                  <button key={ep.slug} className="bg-gray-800 hover:bg-phim-accent text-gray-300 hover:text-white py-2 px-1 rounded font-medium text-xs transition-all border border-gray-700 hover:border-phim-accent truncate" onClick={() => navigate(`/xem-phim/${movie.slug}?tap=${ep.slug}`)}>{ep.name}</button>
                              ))}
                          </div>
                      </div>
                  ))
               ) : (<div className="text-center py-8 text-gray-500 border border-dashed border-gray-700 rounded"><p className="text-sm">Chưa có tập phim nào.</p></div>)}
          </section>
      </div>
    </div>
  );
};

export default MovieDetail;