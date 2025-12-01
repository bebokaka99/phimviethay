import React, { useEffect, useState, useRef } from 'react';
import { useParams, useSearchParams, useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import Header from '../components/layout/Header';
import MovieRow from '../components/movies/MovieRow';
import { getMovieDetail, getMoviesBySlug, getMoviePeoples, IMG_URL, increaseView } from '../services/movieService';
import { setWatchHistory, checkFavoriteStatus, toggleFavorite } from '../services/authService';
import CommentSection from '../components/comments/CommentSection';
import { FaPlay, FaList, FaLightbulb, FaStar, FaServer, FaStepForward, FaArrowLeft, FaExpand, FaClock, FaGlobe, FaUsers, FaHeart } from 'react-icons/fa';

const Toast = ({ message, onClose }) => {
    useEffect(() => { const t = setTimeout(onClose, 3000); return () => clearTimeout(t); }, [onClose]);
    return (
        <div className="fixed top-20 right-4 z-[200] bg-black/90 border-l-4 border-phim-accent text-white px-4 py-3 rounded shadow-2xl flex items-center gap-3 animate-fade-in-down max-w-[90vw]">
            <div className="bg-phim-accent p-1 rounded-full"><FaHeart className="text-white text-[10px]" /></div>
            <span className="text-sm font-medium line-clamp-1">{message}</span>
        </div>
    );
};

const WatchMovie = () => {
    const viewCountedRef = useRef(false);
    const { slug } = useParams();
    const [searchParams, setSearchParams] = useSearchParams();
    const navigate = useNavigate();

    const [movie, setMovie] = useState(null);
    const [episodes, setEpisodes] = useState([]);
    const [currentEpisode, setCurrentEpisode] = useState(null);
    const [currentServer, setCurrentServer] = useState(0);

    const [casts, setCasts] = useState([]);
    const [relatedMovies, setRelatedMovies] = useState([]);

    const [loading, setLoading] = useState(true);
    const [isLightOff, setIsLightOff] = useState(false);
    const [isTheater, setIsTheater] = useState(false);

    const [isFavorite, setIsFavorite] = useState(false);
    const [toastMsg, setToastMsg] = useState('');
    const [watchedEpisodes, setWatchedEpisodes] = useState([]); // State lưu các tập đã xem

    const currentEpSlug = searchParams.get('tap');
    const playerRef = useRef(null);

    const showToast = (msg) => setToastMsg(msg);

    // 1. FETCH DATA & INIT
    useEffect(() => {
        if (!currentEpSlug) window.scrollTo(0, 0);

        const fetchData = async () => {
            if (!movie) setLoading(true);
            try {
                const data = await getMovieDetail(slug);
                if (data?.status && data?.movie) {
                    setMovie(data.movie);
                    setEpisodes(data.episodes || []);

                    // Tìm tập hiện tại
                    const allEps = data.episodes?.[0]?.server_data || [];
                    if (allEps.length > 0) {
                        let foundEp = allEps.find(e => e.slug === currentEpSlug);
                        if (!foundEp) foundEp = allEps[0];
                        setCurrentEpisode(foundEp);
                    }

                    // --- TĂNG VIEW NGAY KHI LOAD PHIM ---
                    if (!viewCountedRef.current) {
                        // Lấy rating chuẩn để lưu
                        const ratingToSave = data.movie.tmdb?.vote_average || data.movie.vote_average || 0;

                        increaseView({
                            slug: data.movie.slug,
                            name: data.movie.name,
                            thumb: data.movie.thumb_url,
                            quality: data.movie.quality,
                            year: data.movie.year,
                            episode_current: data.movie.episode_current,
                            vote_average: ratingToSave // Gửi rating chuẩn đi
                        });

                        viewCountedRef.current = true; // Đánh dấu đã tăng
                    }

                    getMoviePeoples(slug).then(res => setCasts(res || []));
                    const favStatus = await checkFavoriteStatus(data.movie.slug);
                    setIsFavorite(favStatus);

                    if (data.movie.category?.[0]) {
                        const catSlug = data.movie.category[0].slug;
                        const relatedData = await getMoviesBySlug(catSlug, 1, 'the-loai');
                        if (relatedData?.data?.items) {
                            setRelatedMovies(relatedData.data.items.filter(m => m.slug !== data.movie.slug));
                        }
                    }

                    // --- LOAD LOCALSTORAGE (QUAN TRỌNG) ---
                    // Lấy danh sách đã xem từ bộ nhớ máy
                    const key = `watched_${data.movie._id}`;
                    const saved = JSON.parse(localStorage.getItem(key)) || [];
                    setWatchedEpisodes(saved);
                }
            } catch (error) { console.error(error); }
            finally { setLoading(false); }
        };
        fetchData();
    }, [slug]);

    // 2. SYNC EPISODE (KHI ĐỔI TẬP HOẶC F5)
    useEffect(() => {
        if (episodes.length > 0 && currentEpSlug) {
            const serverData = episodes[currentServer]?.server_data || [];
            const found = serverData.find(e => e.slug === currentEpSlug);
            if (found) {
                setCurrentEpisode(found);

                if (movie) {
                    // Ghi lịch sử Backend
                    setWatchHistory({
                        movieSlug: movie.slug,
                        episodeSlug: found.slug,
                        movieName: movie.name,
                        movieThumb: movie.thumb_url,
                        episodeName: found.name
                    });

                    // --- LƯU LOCALSTORAGE NGAY TẠI ĐÂY ---
                    // Để đảm bảo khi F5 lại, nó đã được lưu rồi
                    const key = `watched_${movie._id}`;
                    const currentList = JSON.parse(localStorage.getItem(key)) || [];
                    if (!currentList.includes(found.slug)) {
                        const newList = [...currentList, found.slug];
                        localStorage.setItem(key, JSON.stringify(newList));
                        setWatchedEpisodes(newList);
                    }
                    // -------------------------------------
                }
            }
        }
    }, [currentEpSlug, episodes, currentServer, movie]);

    // Hàm chuyển tập
    const handleChangeEpisode = (ep) => {
        setCurrentEpisode(ep);
        setSearchParams({ tap: ep.slug });
        // Logic lưu đã được xử lý tự động ở useEffect số 2
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
        if (!episodes || !currentEpisode) return null;
        const serverData = episodes[currentServer]?.server_data || [];
        const currentIndex = serverData.findIndex(e => e.slug === currentEpisode.slug);
        if (currentIndex !== -1 && currentIndex < serverData.length - 1) {
            return serverData[currentIndex + 1];
        }
        return null;
    };

    const getActorImg = (path) => {
        if (!path) return null;
        return `https://image.tmdb.org/t/p/w200${path}`;
    };

    const nextEp = getNextEpisode();

    if (loading) return <div className="min-h-screen bg-transparent flex items-center justify-center"><div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-red-600"></div></div>;
    if (!movie) return null;

    const bgImage = `${IMG_URL}${movie.poster_url || movie.thumb_url}`;
    const pageTitle = `Xem phim ${movie.name} - Tập ${currentEpisode?.name} | PhimVietHay`;
    const rating = movie.tmdb?.vote_average || movie.vote_average || 0;
    const voteCount = movie.tmdb?.vote_count || 0;

    return (
        <div className={`min-h-screen font-sans transition-colors duration-700 ${isLightOff ? 'bg-black' : 'bg-transparent'} text-white overflow-x-hidden selection:bg-red-600 selection:text-white`}>
            <Helmet><title>{pageTitle}</title><meta name="description" content={`Xem phim ${movie.name} tập ${currentEpisode?.name} chất lượng cao.`} /></Helmet>

            {!isLightOff && (
                <div className="fixed inset-0 z-0 pointer-events-none">
                    <div className="absolute inset-0 bg-cover bg-center opacity-10 blur-[100px] scale-110 transition-all duration-1000" style={{ backgroundImage: `url(${bgImage})` }} />
                    <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-black/20 to-black/80 z-10" />
                </div>
            )}

            <div className={`transition-all duration-500 relative z-[100] ${isLightOff ? '-translate-y-full opacity-0' : 'translate-y-0 opacity-100'}`}></div>
            {toastMsg && <div className="fixed top-20 right-4 z-[200] bg-black/90 border-l-4 border-red-600 text-white px-4 py-3 rounded shadow-2xl flex items-center gap-3 animate-fade-in-down"><FaHeart className="text-red-600" />{toastMsg}</div>}
            <div className={`fixed inset-0 bg-black/95 z-40 transition-opacity duration-700 pointer-events-none ${isLightOff ? 'opacity-100' : 'opacity-0'}`} />

            <div className={`relative z-50 transition-all duration-700 ${isLightOff ? 'pt-10' : 'pt-24 pb-12'} container mx-auto px-0 md:px-4`} ref={playerRef}>
                <div className={`flex flex-col lg:flex-row gap-6 ${isTheater ? 'justify-center' : ''}`}>

                    <div className={`w-full ${isTheater || isLightOff ? 'lg:w-[100%]' : 'lg:w-[75%]'} transition-all duration-500`}>
                        <div className="relative w-full aspect-video bg-black md:rounded-xl overflow-hidden shadow-2xl ring-1 ring-white/10 group">
                            {currentEpisode ? <iframe src={currentEpisode.link_embed} className="w-full h-full object-fill" allowFullScreen title="Movie Player" frameBorder="0" /> : <div className="flex items-center justify-center h-full text-gray-500 bg-gray-900"><p>Đang tải...</p></div>}
                        </div>
                        <div className="mt-0 md:mt-4 bg-black/60 border-b md:border border-white/10 p-3 md:rounded-lg backdrop-blur-md flex flex-wrap items-center justify-between gap-3">
                            <div className="flex items-center gap-4">
                                <div className="flex items-center gap-2 text-red-600 font-bold"><FaPlay className="text-xs" /><span className="text-sm uppercase tracking-wide">Tập: <span className="text-white ml-1">{currentEpisode?.name}</span></span></div>
                                {nextEp && <button onClick={() => handleChangeEpisode(nextEp)} className="flex items-center gap-1 text-xs font-bold text-white bg-red-600 hover:bg-red-700 px-3 py-1.5 rounded transition animate-pulse">Tiếp theo <FaStepForward /></button>}
                            </div>
                            <div className="flex items-center gap-2">
                                <button onClick={handleToggleFavorite} className={`p-2 rounded transition ${isFavorite ? 'text-red-500 hover:bg-red-500/10' : 'text-gray-300 hover:bg-white/10 hover:text-white'}`} title={isFavorite ? "Bỏ theo dõi" : "Theo dõi phim"}><FaHeart /></button>
                                <button onClick={() => setIsLightOff(!isLightOff)} className="p-2 rounded hover:bg-white/10 text-gray-300" title="Tắt đèn"><FaLightbulb /></button>
                                <button onClick={() => setIsTheater(!isTheater)} className="p-2 rounded hover:bg-white/10 text-gray-300 hidden md:block" title="Rạp chiếu"><FaExpand /></button>
                                <button onClick={() => navigate(`/phim/${movie.slug}`)} className="p-2 rounded hover:bg-white/10 text-gray-300" title="Chi tiết"><FaArrowLeft /></button>
                            </div>
                        </div>
                        {!isLightOff && (
                            <div className="mt-6 space-y-6 px-4 md:px-0">
                                <div className="bg-black/40 p-6 rounded-xl border border-white/10 backdrop-blur-sm">
                                    <h1 className="text-2xl md:text-3xl font-bold text-white mb-3">{movie.name}</h1>
                                    <div className="flex flex-wrap items-center gap-4 text-sm text-gray-300 mb-4">
                                        <span className="bg-red-600 text-white px-2.5 py-0.5 rounded font-bold text-xs shadow-sm shadow-red-900/20">{movie.quality || 'HD'}</span>
                                        <span className="flex items-center gap-1 text-yellow-500 font-bold"><FaStar /> {rating > 0 ? rating.toFixed(1) : 'N/A'} <span className="text-gray-500 font-normal text-xs ml-1">({voteCount})</span></span>
                                        <span className="flex items-center gap-1 text-gray-400"><FaClock className="text-red-600" /> {movie.time}</span>
                                        <span>{movie.year}</span>
                                        <span className="flex items-center gap-1"><FaGlobe className="text-red-600" /> {movie.country?.[0]?.name}</span>
                                    </div>
                                    <h2 className="text-sm text-gray-500 italic mb-4 border-b border-white/5 pb-4">{movie.origin_name}</h2>
                                    <p className="text-gray-300 text-sm leading-relaxed line-clamp-4">{movie.content?.replace(/<[^>]*>?/gm, '')}</p>
                                </div>
                                {movie && currentEpisode && <CommentSection movieSlug={movie.slug} episodeSlug={currentEpisode.slug} />}
                            </div>
                        )}
                    </div>

                    {/* --- CỘT PHẢI: SIDEBAR (Nút Server đã sửa lại thành Button) --- */}
                    {!isTheater && !isLightOff && (
                        <div className={`w-full lg:w-[28%] flex flex-col gap-6 transition-all duration-700 ${isLightOff ? 'opacity-20 blur-sm' : 'opacity-100'} px-4 md:px-0`}>

                            {/* 1. DANH SÁCH TẬP */}
                            <div className="bg-white/5 backdrop-blur-md rounded-xl border border-white/10 overflow-hidden flex flex-col max-h-[400px] shadow-lg">
                                <div className="p-4 bg-white/5 border-b border-white/5 flex flex-col gap-3">
                                    <div className="flex justify-between items-center">
                                        <h3 className="font-bold text-white flex items-center gap-2 text-sm"><FaList className="text-red-600" /> Chọn Tập</h3>
                                        <span className="text-xs text-gray-400">{episodes[currentServer]?.server_data?.length} tập</span>
                                    </div>
                                    {/* Nút Server */}
                                    {episodes.length > 1 && (
                                        <div className="flex flex-wrap gap-2">
                                            {episodes.map((s, i) => (
                                                <button
                                                    key={i}
                                                    onClick={() => setCurrentServer(i)}
                                                    className={`px-3 py-1.5 text-[10px] font-bold rounded border transition-all duration-200
                                                ${currentServer === i
                                                            ? 'bg-red-600 border-red-600 text-white shadow-md'
                                                            : 'bg-black/40 text-gray-400 border-white/10 hover:border-white/30 hover:text-white'}
                                            `}
                                                >
                                                    {s.server_name}
                                                </button>
                                            ))}
                                        </div>
                                    )}
                                </div>
                                <div className="flex-1 overflow-y-auto custom-scrollbar p-2">
                                    <div className="grid grid-cols-4 lg:grid-cols-4 gap-2">
                                        {episodes[currentServer]?.server_data?.map((ep) => {
                                            const isActive = currentEpisode?.slug === ep.slug;
                                            const isWatched = watchedEpisodes.includes(ep.slug);

                                            return (
                                                <button
                                                    key={ep.slug}
                                                    onClick={() => handleChangeEpisode(ep)}
                                                    className={`
                                                relative h-9 rounded text-xs font-bold transition-all border
                                                ${isActive
                                                            ? 'bg-red-600 text-white border-red-600 shadow-lg z-10' // Đang xem (Đỏ)
                                                            : isWatched
                                                                ? 'bg-[#333] text-gray-500 border-[#444]' // Đã xem (Xám tối)
                                                                : 'bg-white/5 text-gray-300 border-white/10 hover:bg-white/10 hover:text-white' // Chưa xem
                                                        }
                                            `}
                                                >
                                                    {ep.name}
                                                </button>
                                            );
                                        })}
                                    </div>
                                </div>
                            </div>

                            {/* 2. DIỄN VIÊN (Giữ nguyên) */}
                            {casts.length > 0 && (
                                <div className="bg-white/5 backdrop-blur-md rounded-xl border border-white/10 overflow-hidden shadow-lg">
                                    <div className="p-4 bg-white/5 border-b border-white/5"><h3 className="font-bold text-white flex items-center gap-2 text-sm"><FaUsers className="text-red-600" /> Diễn viên</h3></div>
                                    <div className="p-3 max-h-[300px] overflow-y-auto custom-scrollbar">
                                        <div className="grid grid-cols-2 gap-3">
                                            {casts.map((actor, idx) => (
                                                <div key={idx} className="flex items-center gap-2 group cursor-pointer p-1.5 rounded hover:bg-white/5 transition border border-transparent hover:border-white/5">
                                                    <div className="w-9 h-9 rounded-full overflow-hidden border border-white/20 flex-shrink-0 bg-gray-800">{actor.profile_path ? <img src={getActorImg(actor.profile_path)} alt={actor.name} className="w-full h-full object-cover" loading="lazy" /> : <div className="w-full h-full flex items-center justify-center text-xs text-gray-400 font-bold">{actor.name.charAt(0)}</div>}</div>
                                                    <div className="min-w-0"><p className="text-xs font-bold text-gray-200 truncate group-hover:text-red-500 transition">{actor.name}</p><p className="text-[9px] text-gray-500 truncate">{actor.character || 'Diễn viên'}</p></div>
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
                    <div className="mt-12 border-t border-white/10 pt-8"><MovieRow title="Phim tương tự" movies={relatedMovies} slug={movie.category?.[0]?.slug} type="the-loai" /></div>
                )}
            </div>
        </div>
    );
};

export default WatchMovie;