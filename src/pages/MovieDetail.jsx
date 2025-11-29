import React, { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import Header from '../components/layout/Header';
import MovieRow from '../components/movies/MovieRow'; 
import { getMovieDetail, getMoviesBySlug, getMoviePeoples, getMovieImages, IMG_URL } from '../services/movieService'; 
import { checkFavoriteStatus, toggleFavorite } from '../services/authService';
import { DetailSkeleton } from '../components/common/Skeleton'; // <--- IMPORT SKELETON
import { FaPlay, FaClock, FaGlobe, FaStar, FaShareAlt, FaHeart, FaChevronDown, FaChevronUp, FaChevronLeft, FaChevronRight, FaCamera, FaUserEdit, FaSignOutAlt, FaCheckCircle, FaCloudUploadAlt, FaTrashAlt, FaYoutube } from 'react-icons/fa';

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
  const [casts, setCasts] = useState([]);
  const [gallery, setGallery] = useState([]);
  const [relatedMovies, setRelatedMovies] = useState([]);

  const [loading, setLoading] = useState(true);
  const [isExpanded, setIsExpanded] = useState(false);
  const [toastMsg, setToastMsg] = useState('');
  const [isFavorite, setIsFavorite] = useState(false);
  
  const castRef = useRef(null);
  const galleryRef = useRef(null);

  useEffect(() => { window.scrollTo(0, 0); }, [slug]);

  useEffect(() => {
    const fetchDetail = async () => {
        setLoading(true);
        setRelatedMovies([]); 

        try {
            const data = await getMovieDetail(slug);

            if (data?.status && data?.movie) {
                setMovie(data.movie);
                
                // Gọi API phụ (chạy ngầm)
                getMoviePeoples(slug).then(res => { if(res && res.length > 0) setCasts(res); });
                getMovieImages(slug).then(res => { if(res && res.length > 0) setGallery(res); });

                if (data.movie.category && data.movie.category.length > 0) {
                    const randomCat = data.movie.category[Math.floor(Math.random() * data.movie.category.length)];
                    getMoviesBySlug(randomCat.slug, 1, 'the-loai').then(res => {
                        if (res?.data?.items) {
                            const related = res.data.items.filter(m => m.slug !== data.movie.slug).sort(() => 0.5 - Math.random());
                            setRelatedMovies(related.slice(0, 10));
                        }
                    });
                }

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

  // ... (Giữ nguyên các hàm handlers handleToggleFavorite, handleWatchNow...) ...
  const showToast = (msg) => setToastMsg(msg);
  const scrollCast = (ref, direction) => { if (ref.current) { const amount = direction === 'left' ? -200 : 200; ref.current.scrollBy({ left: amount, behavior: 'smooth' }); } };
  const handleToggleFavorite = async () => {
      try {
          const newStatus = await toggleFavorite({
              slug: movie.slug, name: movie.name, thumb_url: movie.thumb_url, quality: movie.quality, year: movie.year, episode_current: movie.episode_current, vote_average: movie.tmdb?.vote_average || 0
          });
          setIsFavorite(newStatus);
          showToast(newStatus ? 'Đã thêm vào yêu thích ❤️' : 'Đã xóa khỏi yêu thích 💔');
      } catch (error) {
          showToast(error.toString());
          if (error === "Vui lòng đăng nhập để lưu phim!") setTimeout(() => navigate('/login'), 1500);
      }
  };
  const handleWatchNow = () => {
      if (episodes.length > 0 && episodes[0].server_data.length > 0) {
          const firstEp = episodes[0].server_data[0];
          navigate(`/xem-phim/${movie.slug}?tap=${firstEp.slug}`);
      } else { showToast('Phim đang cập nhật...'); }
  };
  const handleShare = () => { navigator.clipboard.writeText(window.location.href); showToast('Đã sao chép liên kết!'); };
  const handleWatchTrailer = () => {
      if (movie.trailer_url && movie.trailer_url.includes('youtube')) window.open(movie.trailer_url, '_blank');
      else showToast('Chưa có trailer');
  };
  const getInitials = (name) => { if (!name) return "?"; const p = name.trim().split(' '); if (p.length === 1) return p[0].charAt(0); return (p[0].charAt(0) + p[p.length - 1].charAt(0)).toUpperCase(); };
  const getRandomGradient = () => 'from-gray-700 to-gray-900';
  const getActorImg = (path) => { if (!path) return null; if (path.startsWith('http')) return path; return `https://image.tmdb.org/t/p/w200${path}`; };
  const getGalleryImg = (path) => path ? `https://image.tmdb.org/t/p/original${path}` : null;
  const stripHtml = (html) => html ? html.replace(/<[^>]*>?/gm, '') : '';

  // --- THAY THẾ LOADING BẰNG SKELETON ---
  if (loading) return <DetailSkeleton />;
  if (!movie) return <div className="min-h-screen bg-phim-dark text-white flex flex-col items-center justify-center gap-4">Không tìm thấy phim</div>;

  const backdropImg = `${IMG_URL}${movie.poster_url}` || `${IMG_URL}${movie.thumb_url}`;
  const posterImg = `${IMG_URL}${movie.thumb_url}`;
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
      
      {/* HERO */}
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
                          <span>{movie.year}</span>
                      </div>
                      <div>
                          <h1 className="text-2xl md:text-4xl lg:text-5xl font-black leading-tight text-white drop-shadow-xl line-clamp-2" title={movie.name}>{movie.name}</h1>
                          <h2 className="text-sm md:text-lg text-gray-400 font-medium mt-5 line-clamp-1">{movie.origin_name}</h2>
                      </div>
                      <div className="flex flex-wrap justify-center md:justify-start items-center gap-4 md:gap-6 text-xs md:text-sm font-bold text-gray-300">
                          <div className="flex items-center gap-1 text-yellow-400 text-base"><FaStar /> <span>{rating > 0 ? rating : 'N/A'}</span> <span className="text-xs text-gray-500 font-normal">({voteCount} votes)</span></div>
                          <div className="flex items-center gap-2 bg-black/30 px-3 py-1.5 rounded-full border border-white/5"><FaClock className="text-phim-accent"/> <span>{movie.time}</span></div>
                          <div className="flex items-center gap-2 bg-black/30 px-3 py-1.5 rounded-full border border-white/5"><FaGlobe className="text-phim-accent"/> <span>{movie.country?.[0]?.name}</span></div>
                      </div>
                      <div className="flex flex-wrap justify-center md:justify-start gap-2">
                          {movie.category?.map(c => (<span key={c.id} className="text-[10px] md:text-xs font-bold text-gray-300 bg-white/5 hover:bg-phim-accent hover:text-white px-2.5 py-1 rounded transition cursor-pointer border border-white/10">{c.name}</span>))}
                      </div>
                      <div className="text-sm md:text-base text-gray-300 leading-loose max-w-3xl mx-auto md:mx-0">
                          <p className={isExpanded ? '' : 'line-clamp-3 md:line-clamp-4'}>{movieContentClean}</p>
                          <button onClick={() => setIsExpanded(!isExpanded)} className="text-phim-accent font-bold mt-2 hover:underline text-xs flex items-center gap-1 justify-center md:justify-start w-full md:w-auto">{isExpanded ? 'Thu gọn' : 'Xem thêm'} <FaChevronDown/></button>
                      </div>
                      <div className="flex flex-wrap justify-center md:justify-start gap-3 pt-3">
                          <button onClick={handleWatchNow} className="bg-phim-accent text-white px-8 py-3 rounded-full font-bold flex items-center gap-2 hover:bg-red-700 transition shadow-lg shadow-red-900/30 transform active:scale-95"><FaPlay /> XEM NGAY</button>
                          {movie.trailer_url && <button onClick={handleWatchTrailer} className="bg-white/10 text-white px-6 py-3 rounded-full font-bold flex items-center gap-2 hover:bg-red-600 hover:border-red-600 transition border border-white/10"><FaYoutube /> Trailer</button>}
                          <button onClick={handleToggleFavorite} className={`p-3.5 rounded-full transition border ${isFavorite ? 'bg-red-600 border-red-600 text-white shadow-lg shadow-red-900/40' : 'bg-white/10 text-white border-white/10 hover:bg-white/20'}`}><FaHeart /></button>
                          <button onClick={handleShare} className="bg-white/10 text-white p-3.5 rounded-full hover:bg-white/20 transition border border-white/10"><FaShareAlt /></button>
                      </div>
                  </div>
              </div>
          </div>
      </div>

      <div className="container mx-auto max-w-7xl px-4 md:px-12 -mt-6 relative z-30 space-y-10">
          {/* CAST SECTION */}
          {casts && casts.length > 0 && (
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
                    {casts.map((person, idx) => (
                        <div key={idx} className="flex flex-col items-center min-w-[90px] snap-start group/actor">
                            <div className="w-16 h-16 md:w-20 md:h-20 rounded-full overflow-hidden shadow-md mb-2 border-2 border-transparent group-hover/actor:border-phim-accent transition bg-gray-800">
                                {person.profile_path ? (
                                    <img src={getActorImg(person.profile_path)} alt={person.name} className="w-full h-full object-cover" loading="lazy" />
                                ) : (
                                    <div className={`w-full h-full flex items-center justify-center text-sm font-bold text-gray-300 bg-gradient-to-br ${getRandomGradient()}`}>{getInitials(person.name)}</div>
                                )}
                            </div>
                            <p className="text-xs font-bold text-center text-white line-clamp-1 w-full group-hover/actor:text-phim-accent transition">{person.name}</p>
                            <p className="text-[10px] text-gray-500 text-center truncate w-full">{person.character || 'Diễn viên'}</p>
                        </div>
                    ))}
                </div>
            </section>
          )}
          
          {/* Fallback Cast */}
          {(!casts || casts.length === 0) && movie.actor && (
               <section className="relative group/cast">
                  <h3 className="text-lg md:text-xl font-bold mb-4 text-white border-l-4 border-phim-accent pl-3">Diễn viên</h3>
                  <div className="flex overflow-x-auto gap-4 pb-4 scrollbar-hide">
                      {movie.actor.map((act, idx) => (
                          <div key={idx} className="flex flex-col items-center min-w-[80px]">
                              <div className={`w-14 h-14 rounded-full flex items-center justify-center text-sm font-bold bg-gray-800 border border-white/10`}>{getInitials(act)}</div>
                              <p className="text-xs font-bold text-center text-white mt-1">{act}</p>
                          </div>
                      ))}
                  </div>
               </section>
          )}

          {/* GALLERY */}
          {gallery && gallery.length > 0 && (
              <section className="relative group/gallery">
                  <h3 className="text-lg md:text-xl font-bold mb-4 text-white border-l-4 border-phim-accent pl-3">Hình ảnh phim</h3>
                  <button onClick={() => scrollCast(galleryRef, 'left')} className="absolute left-0 top-1/2 z-10 bg-black/70 p-2 rounded-full text-white opacity-0 group-hover/gallery:opacity-100 hover:bg-phim-accent transition hidden md:block -ml-4 shadow-lg"><FaChevronLeft /></button>
                  <button onClick={() => scrollCast(galleryRef, 'right')} className="absolute right-0 top-1/2 z-10 bg-black/70 p-2 rounded-full text-white opacity-0 group-hover/gallery:opacity-100 hover:bg-phim-accent transition hidden md:block -mr-4 shadow-lg"><FaChevronRight /></button>
                  <div ref={galleryRef} className="flex overflow-x-auto gap-4 pb-4 scrollbar-hide snap-x scroll-smooth">
                      {gallery.map((img, idx) => (
                          <div key={idx} className="flex-shrink-0 w-[200px] md:w-[280px] aspect-video rounded-lg overflow-hidden shadow-lg border border-white/5 group/img snap-start">
                              <img src={getGalleryImg(img.file_path)} alt="Scene" className="w-full h-full object-cover transform group-hover/img:scale-110 transition duration-500" loading="lazy" />
                          </div>
                      ))}
                  </div>
              </section>
          )}

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

          {/* RELATES */}
          {relatedMovies.length > 0 && (
             <div className="mt-12 border-t border-white/10 pt-8 pb-10">
                 <MovieRow title="Có thể bạn muốn xem" movies={relatedMovies} slug={movie.category?.[0]?.slug} type="the-loai" />
             </div>
          )}
      </div>
    </div>
  );
};

export default MovieDetail;