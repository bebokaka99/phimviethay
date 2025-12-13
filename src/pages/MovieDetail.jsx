import React, { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { 
    FaPlay, FaClock, FaGlobe, FaStar, FaShareAlt, 
    FaHeart, FaChevronDown, FaChevronLeft, FaChevronRight, 
    FaYoutube, FaHistory, FaList, FaPlayCircle
} from 'react-icons/fa';

import MovieRow from '../components/movies/MovieRow';
import CommentSection from '../components/comments/CommentSection';
import { FaList as FaListIcon } from 'react-icons/fa'; 

import { getMovieDetail, getMoviesBySlug, getMoviePeoples, getMovieImages, IMG_URL } from '../services/movieService';
import { checkFavoriteStatus, toggleFavorite, getWatchHistory, getCurrentUser } from '../services/authService';
import { getTmdbDetails } from '../services/tmdbService';

// --- 1. SKELETON LOADING (Hiệu ứng xương mờ ảo) ---
const DetailSkeleton = () => {
    return (
        <div className="min-h-screen bg-[#0a0e17] relative overflow-hidden animate-pulse">
            {/* Fake Backdrop */}
            <div className="absolute inset-0 bg-gray-800/30" />
            
            <div className="container mx-auto px-4 md:px-12 pt-28 pb-20 relative z-10">
                <div className="flex flex-col md:flex-row gap-8 md:gap-16 items-start">
                    {/* Poster Skeleton */}
                    <div className="w-[180px] md:w-[350px] aspect-[2/3] bg-gray-800 rounded-2xl mx-auto md:mx-0 shadow-2xl border border-white/5" />
                    
                    {/* Info Skeleton */}
                    <div className="flex-1 w-full space-y-6">
                        <div className="h-4 w-24 bg-gray-700 rounded-full" />
                        <div className="space-y-3">
                            <div className="h-10 md:h-16 w-3/4 bg-gray-700 rounded-lg" />
                            <div className="h-6 w-1/2 bg-gray-800 rounded-lg" />
                        </div>
                        <div className="flex gap-3">
                            <div className="h-8 w-20 bg-gray-800 rounded-full" />
                            <div className="h-8 w-20 bg-gray-800 rounded-full" />
                            <div className="h-8 w-20 bg-gray-800 rounded-full" />
                        </div>
                        <div className="h-32 w-full bg-gray-800/50 rounded-xl" />
                        <div className="flex gap-4 pt-2">
                            <div className="h-12 w-40 bg-gray-700 rounded-full" />
                            <div className="h-12 w-32 bg-gray-800 rounded-full" />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

// --- TOAST NOTIFICATION (Giữ nguyên) ---
const Toast = ({ message, onClose }) => {
    useEffect(() => {
        const t = setTimeout(onClose, 3000);
        return () => clearTimeout(t);
    }, [onClose]);

    return (
        <div className="fixed top-20 right-4 z-[200] bg-black/80 backdrop-blur-md border-l-4 border-red-600 text-white px-6 py-4 rounded-lg shadow-2xl flex items-center gap-3 animate-fade-in-down max-w-[90vw]">
            <div className="bg-red-600 p-1.5 rounded-full"><FaHeart className="text-white text-xs" /></div>
            <span className="text-sm font-bold">{message}</span>
        </div>
    );
};

// --- HELPER FUNCTIONS (Giữ nguyên) ---
const getInitials = (name) => {
    if (!name) return "?";
    const p = name.trim().split(' ');
    if (p.length === 1) return p[0].charAt(0);
    return (p[0].charAt(0) + p[p.length - 1].charAt(0)).toUpperCase();
};
const getActorImg = (path) => {
    if (!path) return null;
    if (path.startsWith('http')) return path;
    return `https://image.tmdb.org/t/p/w200${path}`;
};
const getGalleryImg = (path) => path ? `https://image.tmdb.org/t/p/original${path}` : null;
const stripHtml = (html) => html ? html.replace(/<[^>]*>?/gm, '') : '';

// --- MAIN COMPONENT ---
const MovieDetail = () => {
    const { slug } = useParams();
    const navigate = useNavigate();
    
    // State logic (Giữ nguyên)
    const [movie, setMovie] = useState(null);
    const [episodes, setEpisodes] = useState([]);
    const [tmdbData, setTmdbData] = useState(null);
    const [relatedMovies, setRelatedMovies] = useState([]);
    const [casts, setCasts] = useState([]);
    const [gallery, setGallery] = useState([]);
    
    const [loading, setLoading] = useState(true);
    const [isExpanded, setIsExpanded] = useState(false);
    const [toastMsg, setToastMsg] = useState('');
    const [isFavorite, setIsFavorite] = useState(false);
    const [continueEp, setContinueEp] = useState(null);

    const castRef = useRef(null);
    const galleryRef = useRef(null);

    useEffect(() => { window.scrollTo(0, 0); }, [slug]);

    // --- API CALLS (Giữ nguyên 100%) ---
    useEffect(() => {
        let isMounted = true;
        const fetchDetail = async () => {
            setLoading(true);
            setTmdbData(null);
            setRelatedMovies([]); 
            setContinueEp(null);

            try {
                const data = await getMovieDetail(slug);
                if (!isMounted) return;
                
                if (data?.status && data?.movie) {
                    setMovie(data.movie);
                    setEpisodes(data.episodes || []);

                    const { tmdb, imdb, origin_name, year } = data.movie;
                    const promises = [
                        getTmdbDetails(tmdb?.id, imdb?.id, origin_name, year),
                        getMoviePeoples(slug),
                        getMovieImages(slug),
                        data.movie.category?.length ? getMoviesBySlug(data.movie.category[0].slug, 1, 'the-loai') : null,
                    ];

                    const currentUser = getCurrentUser();
                    if (currentUser) {
                        promises.push(checkFavoriteStatus(data.movie.slug));
                        promises.push(getWatchHistory());
                    }
                    
                    const settledResults = await Promise.allSettled(promises);
                    if (!isMounted) return;

                    let nextPromiseIndex = 0;
                    if (settledResults[nextPromiseIndex]?.status === 'fulfilled') setTmdbData(settledResults[nextPromiseIndex].value);
                    nextPromiseIndex++;
                    if (settledResults[nextPromiseIndex]?.status === 'fulfilled') setCasts(settledResults[nextPromiseIndex].value || []);
                    nextPromiseIndex++;
                    if (settledResults[nextPromiseIndex]?.status === 'fulfilled') setGallery(settledResults[nextPromiseIndex].value || []);
                    nextPromiseIndex++;
                    if (settledResults[nextPromiseIndex]?.status === 'fulfilled' && settledResults[nextPromiseIndex].value?.data?.items) {
                        const related = settledResults[nextPromiseIndex].value.data.items.filter(m => m.slug !== data.movie.slug).sort(() => 0.5 - Math.random());
                        setRelatedMovies(related.slice(0, 10));
                    }
                    nextPromiseIndex++;

                    if (currentUser) {
                        if (settledResults[nextPromiseIndex]?.status === 'fulfilled') setIsFavorite(settledResults[nextPromiseIndex].value);
                        nextPromiseIndex++;
                        if (settledResults[nextPromiseIndex]?.status === 'fulfilled' && settledResults[nextPromiseIndex].value) {
                            const histories = settledResults[nextPromiseIndex].value;
                            const historyItem = histories.find(h => h.movie_slug === data.movie.slug);
                            if (historyItem) {
                                setContinueEp({ slug: historyItem.episode_slug, name: historyItem.episode_name });
                            }
                        }
                    }
                }
            } catch (error) { 
                console.error("Error fetching movie detail:", error); 
            } finally { 
                if (isMounted) setLoading(false); 
            }
        };
        if (slug) fetchDetail();
        return () => { isMounted = false; };
    }, [slug]);

    // Handlers (Giữ nguyên)
    const showToast = (msg) => setToastMsg(msg);
    const scrollCast = (ref, direction) => { 
        if (ref.current) { 
            const amount = direction === 'left' ? -200 : 200; 
            ref.current.scrollBy({ left: amount, behavior: 'smooth' }); 
        } 
    };
    const handleToggleFavorite = async () => {
        try {
            const ratingToSave = tmdbData?.rating || movie.tmdb?.vote_average || movie.vote_average || 0;
            const newStatus = await toggleFavorite({
                slug: movie.slug, name: movie.name, thumb_url: movie.thumb_url, 
                quality: movie.quality, year: movie.year, episode_current: movie.episode_current, 
                vote_average: ratingToSave
            });
            setIsFavorite(newStatus);
            showToast(newStatus ? 'Đã thêm vào danh sách yêu thích ❤️' : 'Đã xóa khỏi danh sách yêu thích 💔');
        } catch (error) {
             if (error.response?.status === 401 || error.toString().includes("đăng nhập")) {
                 showToast("Vui lòng đăng nhập lại!");
             } else {
                 showToast("Có lỗi xảy ra, thử lại sau!");
             }
        }
    };
    const handleWatchNow = () => {
        if (episodes.length > 0 && episodes[0].server_data.length > 0) {
            const targetEp = continueEp ? continueEp.slug : episodes[0].server_data[0].slug;
            navigate(`/xem-phim/${movie.slug}?tap=${targetEp}`);
        } else { showToast('Phim đang cập nhật...'); }
    };
    const handleShare = () => { navigator.clipboard.writeText(window.location.href); showToast('Đã sao chép liên kết!'); };
    const handleWatchTrailer = () => {
        if (tmdbData?.trailer) window.open(`https://www.youtube.com/watch?v=${tmdbData.trailer}`, '_blank');
        else if (movie.trailer_url && movie.trailer_url.includes('youtube')) window.open(movie.trailer_url, '_blank');
        else showToast('Chưa có trailer');
    };

    // --- RENDER ---
    
    // 1. Dùng Skeleton thay cho Spinner
    if (loading) return <DetailSkeleton />;
    
    if (!movie) return <div className="min-h-screen bg-[#0a0e17] text-white flex items-center justify-center font-bold text-xl">Không tìm thấy phim</div>;

    const backdropImg = tmdbData?.backdrop || (movie.poster_url ? `${IMG_URL}${movie.poster_url}` : `${IMG_URL}${movie.thumb_url}`);
    const posterImg = `${IMG_URL}${movie.thumb_url}`;
    const ratingVal = tmdbData?.rating || movie.tmdb?.vote_average || movie.vote_average || 0;
    const displayRating = ratingVal > 0 ? Number(ratingVal).toFixed(1) : 'N/A';
    const displayVotes = tmdbData?.vote_count ? `(${tmdbData.vote_count} votes)` : (movie.tmdb?.vote_count ? `(${movie.tmdb.vote_count} votes)` : '');
    const movieContentClean = stripHtml(movie.content);
    const pageTitle = `${movie.name} (${movie.year}) - Xem Phim HD`;

    return (
        <div className="bg-[#0a0e17] min-h-screen text-white font-sans overflow-x-hidden relative">
            <Helmet>
                <title>{pageTitle}</title>
                <meta name="description" content={movieContentClean.substring(0, 150)} />
                <meta property="og:title" content={pageTitle} />
                <meta property="og:image" content={posterImg} />
                <meta property="og:type" content="video.movie" />
            </Helmet>

            {toastMsg && <Toast message={toastMsg} onClose={() => setToastMsg('')} />}
            
            {/* FIXED BACKDROP */}
            <div className="fixed inset-0 z-0 pointer-events-none">
                <div className="absolute inset-0 bg-cover bg-center md:bg-top opacity-30 scale-105 blur-[2px]" style={{ backgroundImage: `url(${backdropImg})` }} />
                <div className="absolute inset-0 bg-gradient-to-t from-[#0a0e17] via-[#0a0e17]/80 to-transparent" />
                <div className="absolute inset-0 bg-gradient-to-r from-[#0a0e17] via-[#0a0e17]/60 to-transparent" />
            </div>

            <div className="relative z-10 container mx-auto px-4 md:px-12 pt-28 pb-20">
                
                {/* HERO DETAIL */}
                <div className="flex flex-col md:flex-row gap-8 md:gap-16 items-start">
                    
                    {/* POSTER */}
                    <div className="w-[180px] md:w-[350px] flex-shrink-0 mx-auto md:mx-0 relative group perspective-1000">
                        <div className="rounded-2xl overflow-hidden shadow-[0_20px_60px_rgba(0,0,0,0.8)] border border-white/10 transform transition-transform duration-500 hover:rotate-y-6 hover:scale-105 bg-black/20 backdrop-blur-sm">
                            <img src={posterImg} alt={movie.name} className="w-full h-full object-cover" />
                            <div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 group-hover:opacity-100 md:hidden transition-opacity cursor-pointer" onClick={handleWatchNow}>
                                <FaPlayCircle className="text-6xl text-red-600 drop-shadow-lg" />
                            </div>
                        </div>
                    </div>

                    {/* INFO */}
                    <div className="flex-1 w-full space-y-6 text-center md:text-left">
                        <div>
                            <div className="flex flex-wrap justify-center md:justify-start gap-2 mb-3">
                                <span className="px-2.5 py-1 rounded bg-red-600 text-white text-[10px] font-bold uppercase tracking-widest shadow-lg shadow-red-900/50">{movie.quality || 'HD'}</span>
                                <span className="px-2.5 py-1 rounded border border-white/20 bg-white/5 text-gray-300 text-[10px] font-bold uppercase">{movie.lang}</span>
                            </div>
                            <h1 className="text-4xl md:text-6xl font-black leading-none tracking-tight text-white drop-shadow-2xl text-transparent bg-clip-text bg-gradient-to-br from-white to-gray-400">
                                {movie.name}
                            </h1>
                            <h2 className="text-lg md:text-2xl text-gray-400 font-medium mt-2 italic">{movie.origin_name} ({movie.year})</h2>
                        </div>

                        <div className="flex flex-wrap justify-center md:justify-start items-center gap-4 text-sm font-semibold text-gray-300">
                            <div className="flex items-center gap-1.5 text-yellow-400 bg-yellow-400/10 px-3 py-1.5 rounded-full border border-yellow-400/20">
                                <FaStar /> <span className="text-white">{displayRating}</span> <span className="text-xs font-normal opacity-70">{displayVotes}</span>
                            </div>
                            <div className="flex items-center gap-1.5 bg-white/5 px-3 py-1.5 rounded-full border border-white/10">
                                <FaClock className="text-red-500" /> <span>{movie.time}</span>
                            </div>
                            <div className="flex items-center gap-1.5 bg-white/5 px-3 py-1.5 rounded-full border border-white/10">
                                <FaGlobe className="text-blue-500" /> <span>{movie.country?.[0]?.name}</span>
                            </div>
                        </div>

                        {/* TAGS */}
                        <div className="flex flex-wrap justify-center md:justify-start gap-2">
                            {movie.category?.map(c => (
                                <span key={c.id} className="text-xs font-bold text-gray-400 bg-white/5 hover:bg-white/20 hover:text-white px-3 py-1.5 rounded-full transition cursor-pointer border border-white/5">
                                    {c.name}
                                </span>
                            ))}
                        </div>

                        {/* DESCRIPTION */}
                        <div className="bg-white/5 backdrop-blur-md rounded-2xl p-5 border border-white/5 text-gray-300 leading-relaxed text-sm md:text-base text-justify shadow-inner">
                            <p className={isExpanded ? '' : 'line-clamp-4'}>{movieContentClean}</p>
                            <button onClick={() => setIsExpanded(!isExpanded)} className="text-red-500 font-bold mt-2 hover:text-red-400 text-xs flex items-center gap-1 ml-auto">
                                {isExpanded ? 'Thu gọn' : 'Đọc tiếp'} <FaChevronDown className={`transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
                            </button>
                        </div>

                        {/* 2. [FIX] BUTTONS: SLEEK & ROUNDED */}
                        <div className="flex flex-wrap justify-center md:justify-start gap-3">
                            <button 
                                onClick={handleWatchNow} 
                                className="flex-1 md:flex-none bg-gradient-to-r from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 text-white px-8 py-3.5 rounded-full font-bold text-base flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(220,38,38,0.4)] transition-all hover:-translate-y-0.5 active:translate-y-0"
                            >
                                {continueEp ? <><FaHistory /> Xem Tiếp {continueEp.name}</> : <><FaPlay /> Xem Ngay</>}
                            </button>

                            {(tmdbData?.trailer || movie.trailer_url) && (
                                <button onClick={handleWatchTrailer} className="flex-1 md:flex-none bg-white/10 hover:bg-white/20 text-white px-6 py-3.5 rounded-full font-bold flex items-center justify-center gap-2 border border-white/10 backdrop-blur-md transition-all">
                                    <FaYoutube className="text-lg" /> Trailer
                                </button>
                            )}
                            
                            <div className="flex gap-2 w-full md:w-auto justify-center">
                                <button onClick={handleToggleFavorite} className={`w-12 h-12 flex items-center justify-center rounded-full border transition-all ${isFavorite ? 'bg-pink-500/20 border-pink-500 text-pink-500' : 'bg-white/5 border-white/10 text-gray-400 hover:text-white hover:bg-white/10'}`}>
                                    <FaHeart className={isFavorite ? "animate-pulse" : ""} />
                                </button>
                                <button onClick={handleShare} className="w-12 h-12 flex items-center justify-center rounded-full bg-white/5 border border-white/10 text-gray-400 hover:text-white hover:bg-white/10 transition-all">
                                    <FaShareAlt />
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                {/* CASTS */}
                {casts && casts.length > 0 && (
                    <div className="mt-16 relative">
                        <h3 className="text-xl font-bold mb-6 flex items-center gap-2 text-white"><span className="w-1 h-6 bg-red-600 rounded-full"></span> Diễn viên nổi bật</h3>
                        <div className="relative group/list">
                            <button onClick={() => scrollCast(castRef, 'left')} className="absolute left-0 top-1/2 -translate-y-1/2 z-20 bg-black/60 p-3 rounded-full text-white opacity-0 group-hover/list:opacity-100 hover:bg-red-600 transition -ml-5 backdrop-blur-sm"><FaChevronLeft /></button>
                            <div ref={castRef} className="flex overflow-x-auto gap-4 pb-4 scrollbar-hide snap-x scroll-smooth">
                                {casts.map((person, idx) => (
                                    <div key={idx} className="flex-shrink-0 w-[100px] md:w-[120px] snap-start flex flex-col items-center group/actor">
                                        <div className="w-20 h-20 md:w-24 md:h-24 rounded-full overflow-hidden border-2 border-white/5 group-hover/actor:border-red-500 transition-all duration-300 shadow-lg bg-[#1a1a1a]">
                                            {person.profile_path ? (
                                                <img src={getActorImg(person.profile_path)} alt={person.name} className="w-full h-full object-cover" loading="lazy"/>
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center text-xl font-bold text-gray-600">{getInitials(person.name)}</div>
                                            )}
                                        </div>
                                        <p className="mt-3 text-sm font-bold text-center text-white line-clamp-1 group-hover/actor:text-red-400 transition">{person.name}</p>
                                        <p className="text-xs text-gray-400 text-center line-clamp-1">{person.character}</p>
                                    </div>
                                ))}
                            </div>
                            <button onClick={() => scrollCast(castRef, 'right')} className="absolute right-0 top-1/2 -translate-y-1/2 z-20 bg-black/60 p-3 rounded-full text-white opacity-0 group-hover/list:opacity-100 hover:bg-red-600 transition -mr-5 backdrop-blur-sm"><FaChevronRight /></button>
                        </div>
                    </div>
                )}

                {/* EPISODES */}
                <div id="episodes-section" className="mt-12 bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6 md:p-8 shadow-2xl">
                    <h3 className="text-lg font-bold mb-6 flex items-center gap-2 text-white border-b border-white/10 pb-4">
                        <FaListIcon className="text-red-500" /> Danh sách tập phim
                    </h3>
                    
                    {episodes.length > 0 ? (
                        episodes.map((server, idx) => (
                            <div key={idx} className="mb-8 last:mb-0">
                                <h4 className="text-gray-400 font-bold uppercase text-xs mb-4 flex items-center gap-2 bg-black/20 w-fit px-3 py-1 rounded-full">
                                    <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span> {server.server_name}
                                </h4>
                                <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 xl:grid-cols-10 gap-2.5">
                                    {server.server_data.map((ep) => (
                                        <button 
                                            key={ep.slug} 
                                            className="bg-[#1a1a1a] hover:bg-red-600 text-gray-300 hover:text-white py-2 px-2 rounded-lg font-medium text-xs transition-all border border-white/5 hover:border-red-500 shadow-sm truncate active:scale-95" 
                                            onClick={() => navigate(`/xem-phim/${movie.slug}?tap=${ep.slug}`)}
                                        >
                                            {ep.name}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className="text-center py-8 text-gray-500 border-2 border-dashed border-white/10 rounded-xl">
                            <p className="text-sm">Chưa có tập phim nào.</p>
                        </div>
                    )}
                </div>

                {/* GALLERY */}
                {gallery && gallery.length > 0 && (
                    <div className="mt-16 relative group/gallery">
                         <h3 className="text-xl font-bold mb-6 flex items-center gap-2 text-white"><span className="w-1 h-6 bg-blue-500 rounded-full"></span> Hình ảnh</h3>
                         <div ref={galleryRef} className="flex overflow-x-auto gap-4 pb-4 scrollbar-hide snap-x">
                            {gallery.map((img, idx) => (
                                <div key={idx} className="flex-shrink-0 w-[240px] md:w-[320px] aspect-video rounded-xl overflow-hidden shadow-lg border border-white/10 group/img snap-start cursor-pointer">
                                    <img src={getGalleryImg(img.file_path)} alt="Scene" className="w-full h-full object-cover transform group-hover/img:scale-110 transition duration-700" loading="lazy"/>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* 3. [FIX] COMMENTS: FULL WIDTH + CLEAN LAYOUT */}
                <div className="mt-16">
                    <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-6 md:p-8">
                        <h3 className="text-xl font-bold mb-6 text-white flex items-center gap-2">
                            <span className="w-1 h-6 bg-purple-500 rounded-full"></span> Bình luận cộng đồng
                        </h3>
                        {/* Comment section chiếm trọn chiều ngang, không còn cột bên phải */}
                        <div className="w-full">
                            <CommentSection movieSlug={slug} />
                        </div>
                    </div>
                </div>

                {relatedMovies.length > 0 && (
                    <div className="mt-16 pt-8 border-t border-white/10">
                        <MovieRow title="Có thể bạn muốn xem" movies={relatedMovies} slug={movie.category?.[0]?.slug} type="the-loai" />
                    </div>
                )}
            </div>
        </div>
    );
};

export default MovieDetail;