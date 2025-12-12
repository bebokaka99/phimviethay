import React, { useEffect, useState, useRef } from 'react';
import { useParams, useSearchParams, useNavigate, Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import {
    FaPlay, FaList, FaLightbulb, FaStar, FaStepForward,
    FaArrowLeft, FaExpand, FaClock, FaGlobe, FaUsers, FaHeart,
    FaHome, FaAngleRight
} from 'react-icons/fa';

import MovieRow from '../components/movies/MovieRow';
import CommentSection from '../components/comments/CommentSection';
import VideoPlayer from '../components/movies/VideoPlayer';

import { getMovieDetail, getMoviesBySlug, getMoviePeoples, IMG_URL } from '../services/movieService';
import { setWatchHistory, checkFavoriteStatus, toggleFavorite } from '../services/authService';

// --- SUB-COMPONENT: TOAST NOTIFICATION (Giữ nguyên) ---
const Toast = ({ message, onClose }) => {
    useEffect(() => {
        const t = setTimeout(onClose, 3000);
        return () => clearTimeout(t);
    }, [onClose]);

    return (
        <div className="fixed top-20 right-4 z-[200] bg-black/90 border-l-4 border-red-600 text-white px-4 py-3 rounded shadow-2xl flex items-center gap-3 animate-fade-in-down max-w-[90vw]">
            <div className="bg-red-600 p-1 rounded-full"><FaHeart className="text-white text-[10px]" /></div>
            <span className="text-sm font-medium line-clamp-1">{message}</span>
        </div>
    );
};

// --- MAIN COMPONENT ---
const WatchMovie = () => {
    // ... (Toàn bộ Logic State, Effect, Handler GIỮ NGUYÊN 100% như bản trước) ...
    const { slug } = useParams();
    const [searchParams, setSearchParams] = useSearchParams();
    const navigate = useNavigate();

    const currentEpSlug = searchParams.get('tap');
    const playerRef = useRef(null);

    const [movie, setMovie] = useState(null);
    const [episodes, setEpisodes] = useState([]);
    const [currentEpisode, setCurrentEpisode] = useState(null);

    const [currentServer, setCurrentServer] = useState(() => {
        try {
            const savedServer = localStorage.getItem('preferred_server');
            return savedServer ? parseInt(savedServer) : 0;
        } catch (e) {
            return 0;
        }
    });

    useEffect(() => {
        localStorage.setItem('preferred_server', currentServer);
    }, [currentServer]);

    const [casts, setCasts] = useState([]);
    const [relatedMovies, setRelatedMovies] = useState([]);

    const [loading, setLoading] = useState(true);
    const [isLightOff, setIsLightOff] = useState(false);
    const [isTheater, setIsTheater] = useState(false);
    const [toastMsg, setToastMsg] = useState('');

    const [isFavorite, setIsFavorite] = useState(false);
    const [watchedEpisodes, setWatchedEpisodes] = useState([]);

    const showToast = (msg) => setToastMsg(msg);
    const getActorImg = (path) => path ? `https://image.tmdb.org/t/p/w200${path}` : null;

    useEffect(() => {
        if (!currentEpSlug) window.scrollTo(0, 0);
        const fetchData = async () => {
            if (!movie) setLoading(true);
            try {
                const data = await getMovieDetail(slug);
                if (data?.status && data?.movie) {
                    setMovie(data.movie);
                    setEpisodes(data.episodes || []);
                    const validServerIndex = (data.episodes && data.episodes[currentServer]) ? currentServer : 0;
                    if (validServerIndex !== currentServer) setCurrentServer(0);
                    const serverData = data.episodes?.[validServerIndex]?.server_data || [];
                    if (serverData.length > 0) {
                        let foundEp = serverData.find(e => e.slug === currentEpSlug);
                        if (!foundEp) foundEp = serverData[0];
                        setCurrentEpisode(foundEp);
                    }
                    getMoviePeoples(slug).then(res => setCasts(res || []));
                    const favStatus = await checkFavoriteStatus(data.movie.slug);
                    setIsFavorite(favStatus);
                    if (data.movie.category?.[0]) {
                        const catSlug = data.movie.category[0].slug;
                        const randomPage = Math.floor(Math.random() * 5) + 1;
                        const relatedData = await getMoviesBySlug(catSlug, randomPage, 'the-loai');
                        if (relatedData?.data?.items) {
                            let items = relatedData.data.items.filter(m => m.slug !== data.movie.slug);
                            items = items.sort(() => Math.random() - 0.5);
                            setRelatedMovies(items);
                        }
                    }
                    const key = `watched_${data.movie._id}`;
                    const saved = JSON.parse(localStorage.getItem(key)) || [];
                    setWatchedEpisodes(saved);
                }
            } catch (error) {
                console.error(error);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [slug]);

    useEffect(() => {
        if (episodes.length > 0) {
            const safeServerIndex = episodes[currentServer] ? currentServer : 0;
            const serverData = episodes[safeServerIndex]?.server_data || [];
            if (currentEpSlug) {
                const found = serverData.find(e => e.slug === currentEpSlug);
                if (found) {
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                    setCurrentEpisode(found);
                    if (movie) {
                        setWatchHistory({
                            movieSlug: movie.slug, episodeSlug: found.slug, movieName: movie.name, movieThumb: movie.thumb_url, episodeName: found.name
                        });
                        const key = `watched_${movie._id}`;
                        const currentList = JSON.parse(localStorage.getItem(key)) || [];
                        if (!currentList.includes(found.slug)) {
                            const newList = [...currentList, found.slug];
                            localStorage.setItem(key, JSON.stringify(newList));
                            setWatchedEpisodes(newList);
                        }
                    }
                }
            }
        }
    }, [currentEpSlug, episodes, currentServer, movie]);

    useEffect(() => {
        if (movie && episodes.length > 0 && currentEpisode) {
            const currentEpName = currentEpisode.name;
            const newServerData = episodes[currentServer]?.server_data;
            if (!newServerData || newServerData.length === 0) return;
            let foundEp = newServerData.find(e => e.name === currentEpName);
            if (!foundEp) {
                let oldIndex = -1;
                for (const sv of episodes) {
                    const idx = sv.server_data.findIndex(e => e.slug === currentEpisode.slug);
                    if (idx !== -1) { oldIndex = idx; break; }
                }
                if (oldIndex !== -1 && newServerData[oldIndex]) { foundEp = newServerData[oldIndex]; } else { foundEp = newServerData[0]; }
            }
            if (foundEp && foundEp.slug !== currentEpisode.slug) {
                setCurrentEpisode(foundEp);
                setSearchParams({ tap: foundEp.slug });
            }
        }
    }, [currentServer, episodes, movie, currentEpisode, setSearchParams]);

    const handleChangeEpisode = (ep) => {
        setCurrentEpisode(ep);
        setSearchParams({ tap: ep.slug });
    };

    const handleToggleFavorite = async () => {
        try {
            const rating = movie.tmdb?.vote_average || movie.vote_average || 0;
            const currentEpName = currentEpisode?.name || 'Full';
            const newStatus = await toggleFavorite({
                slug: movie.slug, name: movie.name, thumb_url: movie.thumb_url, quality: movie.quality, year: movie.year, episode_current: currentEpName, vote_average: rating
            });
            setIsFavorite(newStatus);
            showToast(newStatus ? 'Đã thêm vào tủ phim ❤️' : 'Đã xóa khỏi tủ phim 💔');
        } catch (error) {
            showToast(error.toString());
            if (error === "Vui lòng đăng nhập để lưu phim!") setTimeout(() => navigate('/login'), 1500);
        }
    };

    const getNextEpisode = () => {
        if (!episodes || episodes.length === 0 || !currentEpisode) return null;
        const safeServerIndex = episodes[currentServer] ? currentServer : 0;
        const serverData = episodes[safeServerIndex]?.server_data || [];
        if (serverData.length === 0) return null;
        const currentIndex = serverData.findIndex(e => e.slug === currentEpisode.slug);
        if (currentIndex !== -1 && currentIndex < serverData.length - 1) { return serverData[currentIndex + 1]; }
        return null;
    };

    // --- RENDER (Bắt đầu phần UI được nâng cấp) ---
    if (loading) return <div className="min-h-screen bg-transparent flex items-center justify-center"><div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-red-600"></div></div>;
    if (!movie) return null;

    const nextEp = getNextEpisode();
    const bgImage = `${IMG_URL}${movie.poster_url || movie.thumb_url}`;
    const pageTitle = `Xem phim ${movie.name} - Tập ${currentEpisode?.name} | PhimVietHay`;
    const ratingVal = movie.tmdb?.vote_average || movie.vote_average || 0;
    const voteCount = movie.tmdb?.vote_count || 0;
    const displayEpisodes = episodes[currentServer] ? episodes[currentServer] : episodes[0];

    return (
        <div className={`min-h-screen font-sans transition-colors duration-700 ${isLightOff ? '' : ''} text-white overflow-x-hidden selection:bg-red-600 selection:text-white`}>
            <Helmet>
                <title>{pageTitle}</title>
                <meta name="description" content={`Xem phim ${movie.name} tập ${currentEpisode?.name} chất lượng cao.`} />
            </Helmet>

            {/* Background đẹp hơn với gradient sâu hơn */}
            {!isLightOff && (
                <div className="fixed inset-0 z-0 pointer-events-none">
                    <div className="absolute inset-0 bg-cover bg-center opacity-20 blur-[120px] scale-110 transition-all duration-1000" style={{ backgroundImage: `url(${bgImage})` }} />
                    <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/80 to-black z-10" />
                </div>
            )}

            <div className={`transition-all duration-500 relative z-[100] ${isLightOff ? '-translate-y-full opacity-0' : 'translate-y-0 opacity-100'}`}></div>

            {toastMsg && <Toast message={toastMsg} onClose={() => setToastMsg('')} />}

            {/* Lớp phủ tắt đèn tối hơn */}
            <div className={`fixed inset-0 bg-black/98 z-40 transition-opacity duration-700 pointer-events-none ${isLightOff ? 'opacity-100' : 'opacity-0'}`} />

            <div className={`relative z-50 transition-all duration-700 ${isLightOff ? 'pt-10' : 'pt-24 pb-12'} container mx-auto px-0 md:px-4`} ref={playerRef}>
                
                {/* BREADCRUMB (Giữ nguyên) */}
                <div className={`flex items-center gap-2 text-xs md:text-sm text-gray-400 mb-4 px-4 md:px-0 transition-opacity duration-500 ${isLightOff ? 'opacity-0 pointer-events-none' : 'opacity-100'}`}>
                    <Link to="/" className="hover:text-red-500 transition-colors flex items-center gap-1"><FaHome /> Trang chủ</Link>
                    <FaAngleRight className="text-gray-600 text-[10px]" />
                    {movie && <><Link to={`/phim/${movie.slug}`} className="hover:text-red-500 transition-colors line-clamp-1 max-w-[120px] md:max-w-none" title={movie.name}>{movie.name}</Link><FaAngleRight className="text-gray-600 text-[10px]" /></>}
                    <span className="text-white font-medium line-clamp-1 text-red-500">{currentEpisode?.name ? `Đang xem Tập ${currentEpisode.name}` : 'Đang tải...'}</span>
                </div>

                <div className={`flex flex-col lg:flex-row gap-6 ${isTheater ? 'justify-center' : ''}`}>

                    {/* --- LEFT COLUMN --- */}
                    <div className={`w-full ${isTheater || isLightOff ? 'lg:w-[100%]' : 'lg:w-[75%]'} transition-all duration-500`}>

                        {/* VIDEO PLAYER CONTAINER (Thêm hiệu ứng Glow và Shadow sâu hơn) */}
                        <div className="relative w-full aspect-video bg-black md:rounded-xl overflow-hidden shadow-[0_0_50px_rgba(220,38,38,0.15)] ring-1 ring-white/10 md:ring-red-500/20 group z-20">
                            {currentEpisode ? (
                                <VideoPlayer
                                    key={currentEpisode.slug}
                                    movieSlug={movie.slug}
                                    episodes={episodes[currentServer]?.server_data || []}
                                    servers={episodes}
                                    currentEp={currentEpisode}
                                    currentServerIndex={currentServer}
                                    onEpChange={(ep) => handleChangeEpisode(ep)}
                                    onServerChange={(index) => setCurrentServer(index)}
                                    hasNextEp={!!nextEp}
                                    onNextEp={() => { if (nextEp) handleChangeEpisode(nextEp); }}
                                    option={{
                                        id: currentEpisode.slug,
                                        url: currentEpisode.link_m3u8,
                                        autoplay: true,
                                        volume: 1.0,
                                        isLive: false,
                                        muted: false,
                                        poster: bgImage,
                                        theme: '#dc2626',
                                    }}
                                    style={{ width: '100%', height: '100%' }}
                                />
                            ) : (
                                <div className="flex items-center justify-center h-full text-gray-500 bg-gray-900"><p>Đang tải...</p></div>
                            )}
                        </div>

                        {/* CONTROL BAR DƯỚI PLAYER (Trau chuốt hơn với Gradient và hiệu ứng nút) */}
                        <div className="mt-0 md:mt-4 bg-gradient-to-r from-black/80 to-black/60 border-b md:border border-white/10 border-t-white/5 p-3 md:rounded-lg backdrop-blur-xl flex flex-wrap items-center justify-between gap-3 shadow-lg">
                            <div className="flex items-center gap-4">
                                <div className="flex items-center gap-2 text-red-500 font-bold drop-shadow-[0_0_10px_rgba(220,38,38,0.5)]">
                                    <FaPlay className="text-sm" />
                                    <span className="text-sm uppercase tracking-wide">Tập: <span className="text-white ml-1">{currentEpisode?.name}</span></span>
                                </div>
                                {nextEp && (
                                    <button onClick={() => handleChangeEpisode(nextEp)} className="flex items-center gap-1 text-xs font-bold text-white bg-gradient-to-r from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 px-4 py-2 rounded-full transition-all shadow-md hover:shadow-red-600/30 animate-pulse-slow">
                                        Tiếp theo <FaStepForward />
                                    </button>
                                )}
                            </div>
                            <div className="flex items-center gap-2">
                                <button onClick={handleToggleFavorite} className={`p-2.5 rounded-full transition-all ${isFavorite ? 'text-red-500 bg-red-500/10 hover:bg-red-500/20' : 'text-gray-300 hover:bg-white/10 hover:text-white'}`} title={isFavorite ? "Bỏ theo dõi" : "Theo dõi phim"}><FaHeart /></button>
                                <button onClick={() => setIsLightOff(!isLightOff)} className="p-2.5 rounded-full hover:bg-white/10 text-gray-300 transition-all" title="Tắt đèn"><FaLightbulb /></button>
                                <button onClick={() => setIsTheater(!isTheater)} className="p-2.5 rounded-full hover:bg-white/10 text-gray-300 hidden md:block transition-all" title="Rạp chiếu"><FaExpand /></button>
                                <button onClick={() => navigate(`/phim/${movie.slug}`)} className="p-2.5 rounded-full hover:bg-white/10 text-gray-300 transition-all" title="Chi tiết"><FaArrowLeft /></button>
                            </div>
                        </div>

                        {!isLightOff && (
                            <div className="mt-8 space-y-8 px-4 md:px-0">
                                {/* MOVIE INFO CARD (Thiết kế lại sạch sẽ hơn) */}
                                <div className="bg-black/40 p-6 md:p-8 rounded-2xl border border-white/10 backdrop-blur-xl shadow-2xl relative overflow-hidden">
                                    {/* Background gradient nhẹ bên trong thẻ */}
                                    <div className="absolute top-0 right-0 -mt-20 -mr-20 w-64 h-64 bg-red-600/10 rounded-full blur-[80px] pointer-events-none"></div>

                                    <h1 className="text-3xl md:text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-white to-gray-300 mb-4">{movie.name}</h1>
                                    
                                    {/* Metadata Badges đẹp hơn */}
                                    <div className="flex flex-wrap items-center gap-3 text-sm mb-5">
                                        <span className="bg-gradient-to-r from-red-600 to-red-700 text-white px-3 py-1 rounded-md font-bold text-xs shadow-lg shadow-red-900/20 uppercase tracking-wider">{movie.quality || 'HD'}</span>
                                        <span className="flex items-center gap-1 bg-yellow-500/20 text-yellow-500 px-3 py-1 rounded-md font-bold border border-yellow-500/20"><FaStar /> {ratingVal > 0 ? ratingVal.toFixed(1) : 'N/A'} <span className="text-yellow-300/70 font-normal text-xs ml-1">({voteCount})</span></span>
                                        <span className="flex items-center gap-1 text-gray-300 bg-white/5 px-3 py-1 rounded-md border border-white/10"><FaClock className="text-red-500" /> {movie.time}</span>
                                        <span className="text-gray-300 bg-white/5 px-3 py-1 rounded-md border border-white/10">{movie.year}</span>
                                        <span className="flex items-center gap-1 text-gray-300 bg-white/5 px-3 py-1 rounded-md border border-white/10"><FaGlobe className="text-red-500" /> {movie.country?.[0]?.name}</span>
                                    </div>
                                    
                                    <h2 className="text-base text-gray-400 italic mb-5 border-b border-white/5 pb-4 font-medium">{movie.origin_name}</h2>
                                    <p className="text-gray-200 text-sm leading-relaxed line-clamp-4 md:line-clamp-none">{movie.content?.replace(/<[^>]*>?/gm, '')}</p>
                                </div>
                                {movie && currentEpisode && <CommentSection movieSlug={movie.slug} episodeSlug={currentEpisode.slug} />}
                            </div>
                        )}
                    </div>

                    {/* --- RIGHT COLUMN: SIDEBAR --- */}
                    {!isTheater && !isLightOff && (
                        <div className={`w-full lg:w-[28%] flex flex-col gap-6 transition-all duration-700 ${isLightOff ? 'opacity-20 blur-sm' : 'opacity-100'} px-4 md:px-0`}>

                            {/* 1. EPISODE LIST (Glassmorphism và nút đẹp hơn) */}
                            <div className="bg-black/40 backdrop-blur-xl rounded-2xl border border-white/10 overflow-hidden flex flex-col max-h-[500px] shadow-2xl">
                                <div className="p-4 bg-white/5 border-b border-white/10 flex flex-col gap-3">
                                    <div className="flex justify-between items-center">
                                        <h3 className="font-bold text-white flex items-center gap-2 text-sm uppercase tracking-wider"><FaList className="text-red-600" /> Chọn Tập</h3>
                                        <span className="text-xs text-gray-400 bg-white/10 px-2 py-0.5 rounded-full">{displayEpisodes?.server_data?.length || 0} tập</span>
                                    </div>
                                    {episodes.length > 1 && (
                                        <div className="flex flex-wrap gap-2 p-1 bg-black/20 rounded-lg">
                                            {episodes.map((s, i) => (
                                                <button
                                                    key={i}
                                                    onClick={() => setCurrentServer(i)}
                                                    className={`px-3 py-1.5 text-[10px] font-bold rounded-md transition-all duration-300 flex-1
                                                        ${currentServer === i
                                                            ? 'bg-gradient-to-r from-red-600 to-red-700 text-white shadow-md'
                                                            : 'text-gray-400 hover:bg-white/10 hover:text-white'}
                                                    `}
                                                >
                                                    {s.server_name}
                                                </button>
                                            ))}
                                        </div>
                                    )}
                                </div>

                                <div className="flex-1 overflow-y-auto custom-scrollbar p-3 bg-black/20">
                                    <div className="grid grid-cols-4 gap-2">
                                        {displayEpisodes?.server_data?.map((ep, idx) => {
                                            const isActive = currentEpisode?.slug === ep.slug;
                                            const isWatched = watchedEpisodes.includes(ep.slug);
                                            const uniqueKey = `${ep.slug}-${idx}`;

                                            return (
                                                <button
                                                    key={uniqueKey}
                                                    onClick={() => handleChangeEpisode(ep)}
                                                    className={`
                                                        relative h-10 rounded-lg text-xs font-bold transition-all duration-300 border overflow-hidden group
                                                        ${isActive
                                                            ? 'bg-gradient-to-r from-red-600 to-red-700 text-white border-red-500/50 shadow-[0_0_15px_rgba(220,38,38,0.4)] scale-105 z-10'
                                                            : isWatched
                                                                ? 'bg-gray-800/50 text-gray-500 border-white/5 hover:bg-gray-700/50'
                                                                : 'bg-white/5 text-gray-300 border-white/10 hover:bg-white/10 hover:text-white hover:border-white/30'
                                                        }
                                                    `}
                                                >
                                                    {/* Hiệu ứng sóng nhẹ khi active */}
                                                    {isActive && <span className="absolute inset-0 bg-white/20 animate-pulse-slow mix-blend-overlay"></span>}
                                                    {ep.name}
                                                </button>
                                            );
                                        })}
                                    </div>
                                </div>
                            </div>

                            {/* 2. CAST LIST (Tương tự Episode List) */}
                            {casts.length > 0 && (
                                <div className="bg-black/40 backdrop-blur-xl rounded-2xl border border-white/10 overflow-hidden shadow-2xl">
                                    <div className="p-4 bg-white/5 border-b border-white/10">
                                        <h3 className="font-bold text-white flex items-center gap-2 text-sm uppercase tracking-wider"><FaUsers className="text-red-600" /> Diễn viên</h3>
                                    </div>
                                    <div className="p-3 max-h-[350px] overflow-y-auto custom-scrollbar bg-black/20">
                                        <div className="grid grid-cols-2 gap-3">
                                            {casts.map((actor, idx) => (
                                                <div key={idx} className="flex items-center gap-3 group cursor-pointer p-2 rounded-xl hover:bg-white/5 transition-all border border-transparent hover:border-white/10">
                                                    <div className="w-10 h-10 rounded-full overflow-hidden border-2 border-white/10 group-hover:border-red-500/50 transition-all flex-shrink-0 bg-gray-800 shadow-sm">
                                                        {actor.profile_path ? (
                                                            <img src={getActorImg(actor.profile_path)} alt={actor.name} className="w-full h-full object-cover filter group-hover:brightness-110 transition-all" loading="lazy" />
                                                        ) : (
                                                            <div className="w-full h-full flex items-center justify-center text-xs text-gray-400 font-bold">{actor.name.charAt(0)}</div>
                                                        )}
                                                    </div>
                                                    <div className="min-w-0">
                                                        <p className="text-xs font-bold text-gray-200 truncate group-hover:text-red-400 transition-colors">{actor.name}</p>
                                                        <p className="text-[10px] text-gray-500 truncate">{actor.character || 'Diễn viên'}</p>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
                </div>

                {!isLightOff && relatedMovies.length > 0 && (
                    <div className="mt-12 border-t border-white/10 pt-8">
                        <MovieRow title="Phim tương tự" movies={relatedMovies} slug={movie.category?.[0]?.slug} type="the-loai" />
                    </div>
                )}
            </div>
        </div>
    );
};

export default WatchMovie;