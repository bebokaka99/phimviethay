import React, { useEffect, useState, useRef } from 'react';
import { useParams, useSearchParams, useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import Header from '../components/layout/Header';
import MovieRow from '../components/movies/MovieRow';
import { getMovieDetail, getMoviesBySlug, getMoviePeoples, IMG_URL } from '../services/movieService';
import { setWatchHistory } from '../services/authService';
import { FaPlay, FaList, FaLightbulb, FaStar, FaServer, FaStepForward, FaArrowLeft, FaExpand, FaCompress, FaClock, FaGlobe, FaUsers } from 'react-icons/fa';

const WatchMovie = () => {
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

  const currentEpSlug = searchParams.get('tap');
  const playerRef = useRef(null);

  // 1. FETCH DATA
  useEffect(() => {
    if (!currentEpSlug) window.scrollTo(0, 0);

    const fetchData = async () => {
      if (!movie) setLoading(true);
      try {
        const data = await getMovieDetail(slug);
        if (data?.status && data?.movie) {
          setMovie(data.movie);
          setEpisodes(data.episodes || []);
          
          const allEps = data.episodes?.[0]?.server_data || [];
          if (allEps.length > 0) {
            let foundEp = allEps.find(e => e.slug === currentEpSlug);
            if (!foundEp) foundEp = allEps[0];
            setCurrentEpisode(foundEp);
          }

          getMoviePeoples(slug).then(res => setCasts(res || []));

          if (data.movie.category?.[0]) {
              const catSlug = data.movie.category[0].slug;
              const relatedData = await getMoviesBySlug(catSlug, 1, 'the-loai');
              if (relatedData?.data?.items) {
                  setRelatedMovies(relatedData.data.items.filter(m => m.slug !== data.movie.slug));
              }
          }
        }
      } catch (error) { console.error(error); } 
      finally { setLoading(false); }
    };
    fetchData();
  }, [slug]);

  // 2. SYNC EPISODE
  useEffect(() => {
      if (episodes.length > 0 && currentEpSlug) {
          const serverData = episodes[currentServer]?.server_data || [];
          const found = serverData.find(e => e.slug === currentEpSlug);
          if (found) {
              setCurrentEpisode(found);
              if (movie) setWatchHistory(movie.slug, found.slug);
          }
      }
  }, [currentEpSlug, episodes, currentServer, movie]);

  const handleChangeEpisode = (ep) => {
    setCurrentEpisode(ep);
    setSearchParams({ tap: ep.slug });
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

  if (loading) return (
    <div className="min-h-screen bg-transparent flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-red-600"></div>
    </div>
  );

  if (!movie) return null;

  // const bgImage = ... (Không cần dùng ảnh nền mờ nữa)
  const pageTitle = `Xem phim ${movie.name} - Tập ${currentEpisode?.name} | PhimVietHay`;
  
  const rating = movie.tmdb?.vote_average || movie.vote_average || 0;
  const voteCount = movie.tmdb?.vote_count || 0;

  return (
    <div className={`min-h-screen font-sans transition-colors duration-700 ${isLightOff ? 'bg-black' : 'bg-transparent'} text-white overflow-x-hidden selection:bg-red-600 selection:text-white`}>
      
      <Helmet>
          <title>{pageTitle}</title>
          <meta name="description" content={`Xem phim ${movie.name} tập ${currentEpisode?.name} chất lượng cao.`} />
      </Helmet>

      {/* --- ĐÃ XÓA PHẦN AMBIENT BACKGROUND Ở ĐÂY --- */}
      {/* Bây giờ nó sẽ hiện nền của body (index.css) */}

      <div className={`transition-all duration-500 relative z-[100] ${isLightOff ? '-translate-y-full opacity-0' : 'translate-y-0 opacity-100'}`}>
      </div>
      
      <div className={`fixed inset-0 bg-black/95 z-40 transition-opacity duration-700 pointer-events-none ${isLightOff ? 'opacity-100' : 'opacity-0'}`} />

      <div className={`relative z-50 transition-all duration-700 ${isLightOff ? 'pt-10' : 'pt-24 pb-12'} container mx-auto px-0 md:px-4`} ref={playerRef}>
        
        <div className={`flex flex-col lg:flex-row gap-6 ${isTheater ? 'justify-center' : ''}`}>
            
            {/* --- CỘT TRÁI: PLAYER --- */}
            <div className={`w-full ${isTheater || isLightOff ? 'lg:w-[100%]' : 'lg:w-[75%]'} transition-all duration-500`}>
                
                <div className="relative w-full aspect-video bg-black md:rounded-xl overflow-hidden shadow-2xl ring-1 ring-white/10 group">
                    {currentEpisode ? (
                        <iframe 
                            src={currentEpisode.link_embed} 
                            className="w-full h-full object-fill"
                            allowFullScreen
                            title="Movie Player"
                            frameBorder="0"
                        />
                    ) : (
                        <div className="flex items-center justify-center h-full text-gray-500 bg-gray-900"><p>Đang tải...</p></div>
                    )}
                </div>

                <div className="mt-0 md:mt-4 bg-black/60 border-b md:border border-white/10 p-3 md:rounded-lg backdrop-blur-md flex flex-wrap items-center justify-between gap-3">
                    <div className="flex items-center gap-4">
                        <div className="flex items-center gap-2 text-red-600 font-bold">
                            <FaPlay className="text-xs" />
                            <span className="text-sm uppercase tracking-wide">Tập: <span className="text-white ml-1">{currentEpisode?.name}</span></span>
                        </div>
                        {nextEp && (
                            <button onClick={() => handleChangeEpisode(nextEp)} className="flex items-center gap-1 text-xs font-bold text-white bg-red-600 hover:bg-red-700 px-3 py-1.5 rounded transition animate-pulse">
                                Tiếp theo <FaStepForward />
                            </button>
                        )}
                    </div>

                    <div className="flex items-center gap-2">
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
                            
                            <p className="text-gray-300 text-sm leading-relaxed line-clamp-4">
                                {movie.content?.replace(/<[^>]*>?/gm, '')}
                            </p>
                        </div>
                    </div>
                )}
            </div>

            {/* --- CỘT PHẢI: DANH SÁCH TẬP & DIỄN VIÊN --- */}
            {!isTheater && !isLightOff && (
                <div className={`w-full lg:w-[25%] flex flex-col gap-6 transition-all duration-700 ${isLightOff ? 'opacity-20 blur-sm' : 'opacity-100'} px-4 md:px-0`}>
                    
                    {/* 1. DANH SÁCH TẬP */}
                    <div className="bg-white/5 backdrop-blur-md rounded-xl border border-white/10 overflow-hidden flex flex-col max-h-[400px] shadow-lg">
                        <div className="p-4 bg-white/5 border-b border-white/5 flex justify-between items-center">
                            <h3 className="font-bold text-white flex items-center gap-2 text-sm"><FaList className="text-red-600"/> Chọn Tập</h3>
                            {episodes.length > 1 && (
                                <select 
                                    className="bg-black border border-white/20 text-xs rounded px-2 py-1 outline-none text-gray-300"
                                    onChange={(e) => setCurrentServer(Number(e.target.value))}
                                >
                                    {episodes.map((s, i) => <option key={i} value={i}>{s.server_name}</option>)}
                                </select>
                            )}
                        </div>
                        <div className="flex-1 overflow-y-auto custom-scrollbar p-2">
                            <div className="grid grid-cols-4 lg:grid-cols-4 gap-2">
                                {episodes[currentServer]?.server_data?.map((ep) => {
                                    const isActive = currentEpisode?.slug === ep.slug;
                                    return (
                                        <button
                                            key={ep.slug}
                                            onClick={() => handleChangeEpisode(ep)}
                                            className={`
                                                relative h-9 rounded text-xs font-bold transition-all border
                                                ${isActive 
                                                    ? 'bg-red-600 text-white border-red-600 shadow-lg' 
                                                    : 'bg-white/5 text-gray-400 border-white/10 hover:bg-white/10 hover:text-white'}
                                            `}
                                        >
                                            {ep.name}
                                        </button>
                                    );
                                })}
                            </div>
                        </div>
                    </div>

                    {/* 2. DIỄN VIÊN */}
                    {casts.length > 0 && (
                        <div className="bg-white/5 backdrop-blur-md rounded-xl border border-white/10 overflow-hidden shadow-lg">
                            <div className="p-4 bg-white/5 border-b border-white/5">
                                <h3 className="font-bold text-white flex items-center gap-2 text-sm"><FaUsers className="text-red-600"/> Diễn viên</h3>
                            </div>
                            <div className="p-3 max-h-[300px] overflow-y-auto custom-scrollbar">
                                <div className="grid grid-cols-2 gap-3">
                                    {casts.map((actor, idx) => (
                                        <div key={idx} className="flex items-center gap-2 group cursor-pointer p-1.5 rounded hover:bg-white/5 transition border border-transparent hover:border-white/5">
                                            <div className="w-9 h-9 rounded-full overflow-hidden border border-white/20 flex-shrink-0 bg-gray-800">
                                                {actor.profile_path ? (
                                                    <img src={getActorImg(actor.profile_path)} alt={actor.name} className="w-full h-full object-cover" loading="lazy" />
                                                ) : (
                                                    <div className="w-full h-full flex items-center justify-center text-xs text-gray-400 font-bold">{actor.name.charAt(0)}</div>
                                                )}
                                            </div>
                                            <div className="min-w-0">
                                                <p className="text-xs font-bold text-gray-200 truncate group-hover:text-red-500 transition">{actor.name}</p>
                                                <p className="text-[9px] text-gray-500 truncate">{actor.character || 'Diễn viên'}</p>
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

        {/* PHIM LIÊN QUAN */}
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