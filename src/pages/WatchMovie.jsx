import React, { useEffect, useState, useRef } from 'react';
import { useParams, useSearchParams, useNavigate } from 'react-router-dom';
import Header from '../components/layout/Header';
import { getMovieDetail, IMG_URL } from '../services/movieService';
// Thêm icon FaStepForward
import { FaPlay, FaList, FaShareAlt, FaArrowLeft, FaExpand, FaLightbulb, FaStar, FaServer, FaCompress, FaStepForward } from 'react-icons/fa';

const WatchMovie = () => {
  const { slug } = useParams();
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();

  const [movie, setMovie] = useState(null);
  const [episodes, setEpisodes] = useState([]);
  const [currentEpisode, setCurrentEpisode] = useState(null);
  const [currentServer, setCurrentServer] = useState(0); // State lưu server hiện tại
  const [loading, setLoading] = useState(true);
  
  const [isLightOff, setIsLightOff] = useState(false);
  const [isTheater, setIsTheater] = useState(false);

  const currentEpSlug = searchParams.get('tap');
  const playerRef = useRef(null);

  // Load Data
  useEffect(() => {
    if (!currentEpSlug) window.scrollTo(0, 0);
    const fetchData = async () => {
      if (!movie) setLoading(true);
      try {
        const data = await getMovieDetail(slug);
        if (data?.status && data?.movie) {
          setMovie(data.movie);
          setEpisodes(data.episodes || []);
          
          // Mặc định lấy server đầu tiên
          const allEps = data.episodes?.[0]?.server_data || [];
          if (allEps.length > 0) {
            let foundEp = allEps.find(e => e.slug === currentEpSlug);
            if (!foundEp) foundEp = allEps[0];
            setCurrentEpisode(foundEp);
          }
        }
      } catch (error) { console.error(error); } 
      finally { setLoading(false); }
    };
    fetchData();
  }, [slug]);

  // Handle URL changes
  useEffect(() => {
      if (episodes.length > 0 && currentEpSlug) {
          // Tìm tập trong server hiện tại
          const serverData = episodes[currentServer]?.server_data || [];
          const found = serverData.find(e => e.slug === currentEpSlug);
          if (found) setCurrentEpisode(found);
      }
  }, [currentEpSlug, episodes, currentServer]);

  const handleChangeEpisode = (ep) => {
    setCurrentEpisode(ep);
    setSearchParams({ tap: ep.slug });
    // Không cuộn lên để trải nghiệm liền mạch hơn khi bấm next
  };

  // --- LOGIC TÌM TẬP TIẾP THEO ---
  const getNextEpisode = () => {
      if (!episodes || !currentEpisode) return null;
      const serverData = episodes[currentServer]?.server_data || [];
      const currentIndex = serverData.findIndex(e => e.slug === currentEpisode.slug);
      
      // Nếu tìm thấy và không phải tập cuối
      if (currentIndex !== -1 && currentIndex < serverData.length - 1) {
          return serverData[currentIndex + 1];
      }
      return null;
  };

  const nextEp = getNextEpisode();

  // Loading Screen
  if (loading) return (
    <div className="min-h-screen bg-[#080808] flex items-center justify-center relative">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-phim-accent/10 via-transparent to-transparent animate-pulse"></div>
        <div className="flex flex-col items-center gap-4 z-10">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-phim-accent"></div>
            <p className="text-white/60 text-xs font-bold tracking-[0.3em] uppercase animate-pulse">Loading Cinema...</p>
        </div>
    </div>
  );

  if (!movie) return null;

  const bgImage = `${IMG_URL}${movie.poster_url || movie.thumb_url}`;

  return (
    <div className={`min-h-screen font-sans transition-colors duration-700 ${isLightOff ? 'bg-black' : 'bg-[#0a0a0a]'} text-white overflow-x-hidden selection:bg-phim-accent selection:text-white`}>
      
      <div className="fixed inset-0 z-0 pointer-events-none">
          <div className="absolute inset-0 bg-cover bg-center opacity-20 blur-[100px] scale-110 transition-all duration-1000" style={{ backgroundImage: `url(${bgImage})` }} />
          <div className="absolute inset-0 bg-black/60 z-10" />
      </div>

      <div className={`transition-all duration-500 relative z-[100] ${isLightOff ? '-translate-y-full opacity-0' : 'translate-y-0 opacity-100'}`}>
          <Header />
      </div>
      
      <div className={`fixed inset-0 bg-black/95 z-40 transition-opacity duration-700 pointer-events-none ${isLightOff ? 'opacity-100' : 'opacity-0'}`} />

      <div 
        className={`relative z-50 transition-all duration-700 ${isLightOff ? 'pt-10' : 'pt-24 pb-12'} ${isTheater ? 'px-0' : 'container mx-auto px-4 md:px-8'}`}
        ref={playerRef}
      >
        
        <div className={`flex flex-col lg:flex-row gap-8 transition-all duration-500 ${isTheater ? 'items-center justify-center' : ''}`}>
            
            {/* 1. PLAYER */}
            <div className={`relative transition-all duration-700 ease-in-out ${isTheater || isLightOff ? 'w-full lg:w-[90vw]' : 'w-full lg:w-[72%]'} group`}>
                
                <div className={`absolute -inset-1 bg-gradient-to-r from-phim-accent to-purple-600 rounded-2xl blur-[30px] opacity-20 group-hover:opacity-40 transition duration-1000 ${isLightOff ? 'opacity-10' : ''}`}></div>
                
                <div className="relative bg-black rounded-xl overflow-hidden shadow-2xl ring-1 ring-white/10 aspect-video z-10">
                    {currentEpisode ? (
                        <iframe 
                            src={currentEpisode.link_embed} 
                            className="w-full h-full object-fill"
                            allowFullScreen
                            title="Movie Player"
                            frameBorder="0"
                        />
                    ) : (
                        <div className="flex items-center justify-center h-full text-gray-500 bg-gray-900/50">
                            <p>Đang tải nguồn phát...</p>
                        </div>
                    )}
                </div>

                {/* CONTROL BAR */}
                <div className="mt-4 flex flex-wrap items-center justify-between gap-4 bg-[#111]/80 border border-white/5 p-3 rounded-lg backdrop-blur-md relative z-20">
                    
                    <div className="flex items-center gap-4">
                        <div className="flex items-center gap-2 text-phim-accent font-bold">
                            <FaPlay className="text-xs" />
                            <span className="text-sm uppercase tracking-wide">Đang phát tập: <span className="text-white ml-1">{currentEpisode?.name}</span></span>
                        </div>
                        
                        {/* --- NÚT TẬP TIẾP THEO (CHỈ HIỆN KHI CÓ TẬP SAU) --- */}
                        {nextEp && (
                            <>
                                <span className="hidden md:inline w-px h-4 bg-white/10"></span>
                                <button 
                                    onClick={() => handleChangeEpisode(nextEp)}
                                    className="flex items-center gap-2 text-xs font-bold text-white bg-phim-accent hover:bg-red-700 px-3 py-1.5 rounded transition animate-pulse"
                                >
                                    Tập tiếp <FaStepForward />
                                </button>
                            </>
                        )}
                    </div>

                    <div className="flex items-center gap-2">
                        <button 
                            onClick={() => setIsLightOff(!isLightOff)}
                            className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-xs font-bold transition border ${isLightOff ? 'bg-yellow-500/20 text-yellow-400 border-yellow-500/50' : 'bg-white/5 text-gray-400 border-white/5 hover:bg-white/10 hover:text-white'}`}
                        >
                            <FaLightbulb /> {isLightOff ? 'Bật Đèn' : 'Tắt Đèn'}
                        </button>

                        <button 
                            onClick={() => setIsTheater(!isTheater)}
                            className="flex items-center gap-2 px-3 py-1.5 rounded-md text-xs font-bold bg-white/5 text-gray-400 border border-white/5 hover:bg-white/10 hover:text-white transition hidden md:flex"
                        >
                            {isTheater ? <><FaCompress /> Thu Nhỏ</> : <><FaExpand /> Rạp Chiếu</>}
                        </button>

                        <button 
                            onClick={() => navigate(`/phim/${movie.slug}`)}
                            className="flex items-center gap-2 px-3 py-1.5 rounded-md text-xs font-bold bg-white/5 text-gray-400 border border-white/5 hover:bg-white/10 hover:text-white transition"
                        >
                            <FaArrowLeft /> Chi tiết
                        </button>
                    </div>
                </div>
            </div>

            {/* 2. INFO & LIST */}
            {!isTheater && (
                <div className={`w-full lg:w-[28%] flex flex-col gap-6 transition-all duration-700 ${isLightOff ? 'opacity-20 blur-sm hover:opacity-100 hover:blur-0' : 'opacity-100'}`}>
                    
                    {/* DANH SÁCH TẬP */}
                    <div className="bg-[#111]/60 backdrop-blur-md rounded-xl border border-white/5 overflow-hidden flex flex-col h-[400px] shadow-lg">
                        <div className="p-4 bg-white/5 border-b border-white/5 flex justify-between items-center">
                            <h3 className="font-bold text-white flex items-center gap-2">
                                <FaList className="text-phim-accent"/> Chọn Tập
                            </h3>
                            {/* Chuyển đổi Server (Nếu có nhiều server) */}
                            <div className="flex gap-2">
                                {episodes.map((server, idx) => (
                                    <button 
                                        key={idx}
                                        onClick={() => setCurrentServer(idx)}
                                        className={`text-[10px] font-bold px-2 py-1 rounded border ${currentServer === idx ? 'bg-phim-accent border-phim-accent text-white' : 'bg-transparent border-white/20 text-gray-400'}`}
                                    >
                                        {server.server_name}
                                    </button>
                                ))}
                            </div>
                        </div>
                        
                        <div className="flex-1 overflow-y-auto custom-scrollbar p-2">
                            <div className="grid grid-cols-4 gap-2">
                                {episodes[currentServer]?.server_data?.map((ep) => {
                                    const isActive = currentEpisode?.slug === ep.slug;
                                    return (
                                        <button
                                            key={ep.slug}
                                            onClick={() => handleChangeEpisode(ep)}
                                            className={`
                                                relative h-10 rounded-lg text-xs font-bold transition-all duration-300 flex items-center justify-center border
                                                ${isActive 
                                                    ? 'bg-gradient-to-br from-phim-accent to-red-700 text-white border-transparent shadow-[0_0_15px_rgba(229,9,20,0.5)] scale-105 z-10' 
                                                    : 'bg-[#1a1a1a] text-gray-400 border-white/5 hover:bg-[#222] hover:text-white hover:border-white/20'}
                                            `}
                                        >
                                            {ep.name}
                                            {isActive && (
                                                <span className="absolute -top-1 -right-1 w-2 h-2 bg-white rounded-full animate-ping"></span>
                                            )}
                                        </button>
                                    );
                                })}
                            </div>
                        </div>
                    </div>

                    {/* INFO NGẮN */}
                    <div className="bg-[#111]/60 backdrop-blur-md p-5 rounded-xl border border-white/5">
                        <h1 className="text-xl font-black text-white mb-2 tracking-tight truncate">
                            {movie.name}
                        </h1>
                        <div className="flex flex-wrap items-center gap-3 text-xs text-gray-400 mb-3">
                            <span className="bg-phim-accent text-white px-2 py-0.5 rounded font-bold">{movie.quality}</span>
                            <span>{movie.year}</span>
                            <span className="flex items-center gap-1 text-yellow-500"><FaStar /> {movie.vote_average || 8.5}</span>
                        </div>
                        <p className="text-gray-400 text-xs leading-relaxed text-justify line-clamp-4">
                            {movie.content?.replace(/<[^>]*>?/gm, '')}
                        </p>
                    </div>
                </div>
            )}
        </div>
      </div>
    </div>
  );
};

export default WatchMovie;