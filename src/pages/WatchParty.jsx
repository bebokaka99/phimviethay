import React, { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { FaPaperPlane, FaUserFriends, FaCopy, FaPlay, FaSearch, FaTimes, FaLock, FaPowerOff, FaSpinner, FaCrown, FaTrash, FaChevronDown, FaChevronUp } from 'react-icons/fa';
import socket from '../services/socket';
import WatchPartyPlayer from '../components/movies/WatchPartyPlayer'; 
import { getMovieDetail, searchMovies, IMG_URL } from '../services/movieService';
import { getCurrentUser } from '../services/authService';

// --- SUB COMPONENTS (Giữ nguyên logic hiển thị) ---
const ChatMessage = ({ msg, isMe, isHost, onDelete }) => { 
    const avatarUrl = msg.user?.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(msg.user?.name || 'K')}&background=random&color=fff&size=128`; 
    return (
        <div className={`flex items-start gap-3 mb-4 animate-fade-in-up group ${isMe ? 'flex-row-reverse' : 'flex-row'}`}>
            <div className="flex-shrink-0 relative">
                <img src={avatarUrl} alt="Avt" className={`w-9 h-9 rounded-full border-2 shadow-sm object-cover ${msg.user?.isHost ? 'border-yellow-500' : 'border-white/10'}`} />
                {msg.user?.isHost && <div className="absolute -top-1 -right-1 bg-yellow-500 text-black text-[8px] p-0.5 rounded-full"><FaCrown/></div>}
            </div>
            <div className={`flex flex-col max-w-[75%] ${isMe ? 'items-end' : 'items-start'}`}>
                <div className="flex items-center gap-2 mb-1">
                    {!isMe && <span className={`text-[11px] font-bold ${msg.user?.isHost ? 'text-yellow-500' : 'text-gray-400'}`}>{msg.user?.name}</span>}
                    {msg.user?.isHost && !isMe && <span className="text-[9px] bg-yellow-500/20 text-yellow-500 px-1 rounded border border-yellow-500/30">HOST</span>}
                </div>
                <div className="relative group/msg">
                    <div className={`px-4 py-2.5 text-sm shadow-md break-words leading-relaxed ${isMe ? 'bg-gradient-to-br from-red-600 to-red-700 text-white rounded-2xl rounded-tr-none' : 'bg-[#1a1d26] text-gray-200 border border-white/5 rounded-2xl rounded-tl-none'}`}>{msg.text}</div>
                    {isHost && (<button onClick={() => onDelete(msg.id)} className={`absolute top-1/2 -translate-y-1/2 p-1.5 text-gray-500 hover:text-red-500 bg-black/50 rounded-full opacity-0 group-hover/msg:opacity-100 transition-all ${isMe ? '-left-8' : '-right-8'}`} title="Xóa tin nhắn"><FaTrash size={10} /></button>)}
                </div>
            </div>
        </div>
    ); 
};

const ViewerList = ({ viewers, onClose }) => {
    return (
        <div className="absolute top-14 left-0 right-0 z-50 mx-4 bg-[#12141a] border border-white/10 rounded-xl shadow-2xl animate-slide-up overflow-hidden max-h-64 flex flex-col">
            <div className="p-3 bg-white/5 border-b border-white/5 flex justify-between items-center"><span className="text-xs font-bold text-gray-300 uppercase tracking-wider">Đang xem ({viewers.length})</span><FaTimes className="text-gray-500 cursor-pointer hover:text-white" onClick={onClose} /></div>
            <div className="overflow-y-auto custom-scrollbar p-2">{viewers.map((v, i) => (<div key={i} className="flex items-center gap-3 p-2 hover:bg-white/5 rounded-lg transition-colors"><img src={v.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(v.name)}&background=random&color=fff`} className={`w-8 h-8 rounded-full object-cover border ${v.isHost ? 'border-yellow-500' : 'border-transparent'}`} alt=""/><div className="flex-1 min-w-0"><div className="flex items-center gap-2"><span className={`text-sm font-bold truncate ${v.isHost ? 'text-yellow-500' : 'text-gray-300'}`}>{v.name}</span>{v.isHost && <FaCrown className="text-yellow-500 text-[10px]" />}</div></div></div>))}</div>
        </div>
    );
};

const Toast = ({ msg }) => { if (!msg) return null; return <div className="fixed top-24 left-1/2 -translate-x-1/2 z-[300] bg-white/10 backdrop-blur-md border border-red-500/50 text-white px-6 py-3 rounded-full shadow-[0_0_20px_rgba(220,38,38,0.4)] flex items-center gap-3 animate-bounce font-bold pointer-events-none"><FaLock className="text-red-500"/> {msg}</div>; };

const WatchParty = () => {
    const { roomId } = useParams();
    const navigate = useNavigate();
    
    const [currentUser] = useState(() => { 
        const user = getCurrentUser(); 
        if (user) return { id: user.id || user._id, name: user.fullname || user.name || user.username, avatar: user.avatar };
        let guestId = localStorage.getItem('wp_guest_id');
        if (!guestId) { guestId = `guest_${Math.floor(Math.random() * 1000000)}`; localStorage.setItem('wp_guest_id', guestId); }
        return { id: guestId, name: `Khách ${guestId.split('_')[1]}`, avatar: null };
    });

    const [isHost, setIsHost] = useState(false);
    const [isJoined, setIsJoined] = useState(false); 
    const [messages, setMessages] = useState([]);
    const [inputMsg, setInputMsg] = useState('');
    const [viewers, setViewers] = useState([]); 
    const [showViewerList, setShowViewerList] = useState(false); 
    const [movie, setMovie] = useState(null);
    const [episodes, setEpisodes] = useState([]);
    const [currentEpisode, setCurrentEpisode] = useState(null);
    const [initialTime, setInitialTime] = useState(0); 
    const [hostCurrentTime, setHostCurrentTime] = useState(0); 
    const [isReadyToWatch, setIsReadyToWatch] = useState(false); 
    const [isSyncing, setIsSyncing] = useState(false);
    const [isHostPaused, setIsHostPaused] = useState(false);
    const [toastMsg, setToastMsg] = useState('');
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState([]);
    const [showDropdown, setShowDropdown] = useState(false);
    
    const currentMovieRef = useRef(null); 
    const artInstanceRef = useRef(null);
    const isRemoteUpdate = useRef(false);
    const searchTimeoutRef = useRef(null);
    const messagesContainerRef = useRef(null);

    useEffect(() => { currentMovieRef.current = movie; }, [movie]);
    const scrollToBottom = () => { if (messagesContainerRef.current) { const { scrollHeight, clientHeight } = messagesContainerRef.current; if (scrollHeight > clientHeight) messagesContainerRef.current.scrollTo({ top: scrollHeight, behavior: 'smooth' }); } };
    useEffect(scrollToBottom, [messages]);
    const showWarning = (msg) => { setToastMsg(msg); setTimeout(() => setToastMsg(''), 3000); };

    // --- SOCKET LOGIC ---
    useEffect(() => {
        if (!roomId) return;
        socket.connect();
        
        socket.emit("join_room", { roomId, userId: currentUser.id, userInfo: currentUser });

        socket.on("error_join", (msg) => { alert(msg); navigate('/watch-party'); });
        
        socket.on("joined_success", (data) => {
            setIsJoined(true);
            setIsHost(data.isHost);
            if (data.movie) loadMovieData(data.movie.slug);
            if (data.isHost) setIsReadyToWatch(true);
        });

        socket.on("role_update", (data) => { setIsHost(data.isHost); if (data.isHost) setIsReadyToWatch(true); showWarning("👑 Bạn đã trở thành Chủ phòng!"); });
        socket.on("room_destroyed", (reason) => { alert(reason); navigate('/watch-party'); });
        socket.on("update_viewers", (data) => { setViewers(data); });

        socket.on("receive_video_action", (data) => {
            const art = artInstanceRef.current;
            if (data.action !== 'request_sync') isRemoteUpdate.current = true;
            if (data.time) setHostCurrentTime(data.time); 

            switch (data.action) {
                case 'play': setIsHostPaused(false); if (art && !art.playing) art.play(); break;
                case 'pause': setIsHostPaused(true); if (art) { art.pause(); art.currentTime = data.time; } break;
                case 'seek': if (art) art.currentTime = data.time; break;
                case 'change_movie': 
                    if (data.slug !== currentMovieRef.current?.slug) {
                        setIsReadyToWatch(false); setInitialTime(0); setIsHostPaused(false);
                        loadMovieData(data.slug); 
                    }
                    break;
                case 'sync_current_state':
                    setIsSyncing(false);
                    setInitialTime(data.time);
                    setHostCurrentTime(data.time);
                    setIsHostPaused(!data.isPlaying); 
                    if (data.slug !== currentMovieRef.current?.slug) {
                        loadMovieData(data.slug);
                    } else if (art) {
                        art.currentTime = data.time;
                        if (data.isPlaying) art.play(); else art.pause();
                    }
                    setIsReadyToWatch(true); 
                    break;
                case 'request_sync':
                    if (isHost && currentMovieRef.current && art) {
                        socket.emit("video_action", { roomId, action: 'sync_current_state', slug: currentMovieRef.current.slug, time: art.currentTime, isPlaying: art.playing });
                    }
                    break;
                default: break;
            }
            setTimeout(() => { isRemoteUpdate.current = false; }, 800);
        });

        const handleMsg = (data) => setMessages((prev) => [...prev, { ...data, isMe: false }]);
        socket.on("receive_message", handleMsg);
        socket.on("message_deleted", ({ messageId }) => { setMessages(prev => prev.filter(m => m.id !== messageId)); });

        return () => { 
            socket.off("receive_message"); socket.off("update_viewers"); socket.off("message_deleted");
            socket.off("error_join"); socket.off("joined_success"); socket.off("room_destroyed"); 
            socket.off("role_update"); socket.off("receive_video_action"); socket.disconnect(); 
        };
    }, [roomId, isHost, currentUser.id]); 

    // --- LEAVE ROOM LOGIC (HOST) ---
    useEffect(() => {
        let isPageReload = false;
        const handleBeforeUnload = () => { isPageReload = true; };
        window.addEventListener('beforeunload', handleBeforeUnload);

        return () => {
            window.removeEventListener('beforeunload', handleBeforeUnload);
            if (isHost && !isPageReload) {
                socket.emit("end_room", { roomId, userId: currentUser.id });
            }
        };
    }, [isHost, roomId, currentUser.id]);

    // Search Logic
    useEffect(() => {
        if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current);
        if (!searchQuery.trim()) { setSearchResults([]); setShowDropdown(false); return; }
        searchTimeoutRef.current = setTimeout(async () => {
            try {
                const res = await searchMovies(searchQuery, 1);
                if (res?.data?.items) { setSearchResults(res.data.items); setShowDropdown(true); }
            } catch (error) { }
        }, 500);
        return () => clearTimeout(searchTimeoutRef.current);
    }, [searchQuery]);
    
    const handleSelectMovie = (item) => { setSearchQuery(''); setShowDropdown(false); loadMovieData(item.slug); socket.emit("video_action", { roomId, action: 'change_movie', slug: item.slug, name: item.name, thumb: item.thumb_url }); };
    const loadMovieData = async (slug) => { try { const data = await getMovieDetail(slug); if (data?.status) { setMovie(data.movie); setEpisodes(data.episodes || []); if (data.episodes?.[0]?.server_data?.length) setCurrentEpisode(data.episodes[0].server_data[0]); } } catch (err) {} };
    
    // Actions
    const handleJoinSession = () => { setIsSyncing(true); socket.emit("video_action", { roomId, action: 'request_sync' }); };
    const handleForceSync = () => { socket.emit("video_action", { roomId, action: 'request_sync' }); };
    const handleSend = (e) => { e.preventDefault(); if (!inputMsg.trim()) return; const msgData = { id: Date.now().toString(), roomId, text: inputMsg, user: { ...currentUser, isHost } }; socket.emit("send_message", msgData); setMessages(prev => [...prev, { ...msgData, isMe: true }]); setInputMsg(''); };
    const handleDeleteMessage = (messageId) => { if (confirm("Bạn muốn xóa tin nhắn này?")) { socket.emit("delete_message", { roomId, messageId }); } };
    const copyLink = () => { navigator.clipboard.writeText(window.location.href); alert("Đã sao chép link phòng!"); };
    const handleEndRoom = () => { if (confirm("Bạn có chắc muốn giải tán phòng không?")) socket.emit("end_room", { roomId, userId: currentUser.id }); };
    
    const onArtReady = (art) => {
        artInstanceRef.current = art;
        art.on('play', () => { if (isHost && !isRemoteUpdate.current) socket.emit("video_action", { roomId, action: 'play', time: art.currentTime }); });
        art.on('pause', () => { if (isHost && !isRemoteUpdate.current) socket.emit("video_action", { roomId, action: 'pause', time: art.currentTime }); });
        art.on('seek', (time) => { if (isHost && !isRemoteUpdate.current) socket.emit("video_action", { roomId, action: 'seek', time: time }); });
        art.on('video:timeupdate', () => { if (isHost) setHostCurrentTime(art.currentTime); });
    };

    if (!isJoined) return <div className="w-full h-screen flex items-center justify-center"><div className="text-white animate-pulse flex flex-col items-center gap-3"><FaSpinner className="animate-spin text-3xl"/><span>Đang vào phòng...</span></div></div>;

    const pageTitle = movie ? `Đang chiếu: ${movie.name} | Watch Party` : `Phòng ${roomId} | Watch Party`;
    const pageDesc = movie ? `Tham gia ngay để xem phim ${movie.name} cùng bạn bè tại phòng ${roomId}.` : `Tham gia phòng xem chung ${roomId} để cùng thưởng thức các bộ phim hay.`;
    const pageImage = movie ? `${IMG_URL}${movie.thumb_url}` : 'https://i.imgur.com/YOUR_DEFAULT_BANNER.jpg';

    return (
        <div className="w-full min-h-screen pt-24 pb-4 px-4 font-sans flex flex-col">
            <Helmet>
                <title>{pageTitle}</title>
                <meta name="description" content={pageDesc} />
                <meta property="og:title" content={pageTitle} />
                <meta property="og:description" content={pageDesc} />
                <meta property="og:image" content={pageImage} />
            </Helmet>

            {toastMsg && <Toast msg={toastMsg} />}
            
            {/* Header (Giữ nguyên) */}
            <div className="max-w-[1500px] mx-auto w-full mb-6 flex flex-col lg:flex-row gap-4 justify-between items-center bg-white/5 backdrop-blur-xl border border-white/10 p-3 rounded-2xl shadow-lg relative z-[50]">
                {/* ... Header Content ... */}
                <div className="flex items-center gap-4 px-2"><div className={`w-3 h-3 rounded-full animate-pulse shadow-[0_0_12px] ${isHost ? 'bg-green-500 shadow-green-500' : 'bg-blue-500 shadow-blue-500'}`}></div><div><h1 className="font-black text-white uppercase tracking-wider text-sm md:text-base flex items-center gap-2">ROOM #{roomId.substring(0,6)}{isHost && <span className="bg-yellow-500/20 text-yellow-400 border border-yellow-500/30 text-[10px] px-2 py-0.5 rounded flex items-center gap-1"><FaCrown/> HOST</span>}</h1></div></div>
                {isHost ? (<div className="relative w-full lg:w-[500px] group z-[60]"><div className="flex items-center bg-[#0a0e17]/60 border border-white/10 rounded-xl px-4 py-2.5 focus-within:border-red-500/50 focus-within:ring-1 focus-within:ring-red-500/50 transition-all"><FaSearch className="text-gray-500 mr-3 group-focus-within:text-white" /><input type="text" placeholder="Tìm phim để chiếu..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)} className="bg-transparent border-none text-sm text-white focus:outline-none w-full placeholder-gray-500" />{searchQuery && <FaTimes className="text-gray-500 cursor-pointer hover:text-red-500" onClick={() => {setSearchQuery(''); setShowDropdown(false);}} />}</div>{showDropdown && searchResults.length > 0 && (<div className="absolute top-full left-0 right-0 mt-2 bg-[#1a1d26] border border-white/10 rounded-xl shadow-2xl max-h-96 overflow-y-auto custom-scrollbar animate-slide-up overflow-hidden">{searchResults.map((item) => (<div key={item._id} onClick={() => handleSelectMovie(item)} className="flex items-center gap-4 p-3 hover:bg-white/10 cursor-pointer transition-colors border-b border-white/5 last:border-0"><img src={`${IMG_URL}${item.thumb_url}`} alt={item.name} className="w-10 h-14 object-cover rounded bg-gray-800" /><div className="min-w-0"><h4 className="text-sm font-bold text-gray-100 truncate">{item.name}</h4><p className="text-xs text-gray-500 truncate">{item.origin_name}</p></div></div>))}</div>)}</div>) : <div className="hidden lg:block text-gray-500 text-xs italic">Đang chờ chủ phòng chọn phim...</div>}
                <div className="flex gap-2 w-full lg:w-auto justify-end"><button onClick={copyLink} className="flex items-center gap-2 bg-white/5 hover:bg-white/10 border border-white/10 px-4 py-2.5 rounded-xl text-xs font-bold text-gray-300 transition-all"><FaCopy /> ID: {roomId}</button>{isHost && <button onClick={handleEndRoom} className="flex items-center gap-2 bg-red-600/10 hover:bg-red-600 border border-red-600/30 hover:border-red-600 text-red-500 hover:text-white px-4 py-2.5 rounded-xl text-xs font-bold transition-all"><FaPowerOff /> End</button>}</div>
            </div>

            {/* Content Grid - [FIXED FOR MOBILE] */}
            <div className="max-w-[1500px] mx-auto w-full grid grid-cols-1 lg:grid-cols-4 gap-6 flex-1 h-[calc(100vh-180px)] lg:h-[calc(100vh-180px)]">
                
                {/* 1. Player Column (Chiếm 100% trên Mobile) */}
                {/* Thêm class w-full trên mobile để đảm bảo full width */}
                <div className="lg:col-span-3 bg-black rounded-3xl overflow-hidden border border-white/10 relative shadow-[0_0_40px_rgba(0,0,0,0.5)] ring-1 ring-white/5 group w-full h-[60vh] lg:h-full">
                    {movie ? (
                        <>
                            {!isHost && !isReadyToWatch ? (
                                <div className="absolute inset-0 z-40 flex flex-col items-center justify-center bg-black/80 backdrop-blur-sm">
                                    <div className="absolute inset-0 opacity-40 blur-xl"><img src={`${IMG_URL}${movie.poster_url || movie.thumb_url}`} className="w-full h-full object-cover" alt="" /></div>
                                    <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent"></div>
                                    <div className="relative z-10 text-center p-8 max-w-lg">
                                        <div className="w-32 h-48 mx-auto mb-6 rounded-lg overflow-hidden shadow-2xl border border-white/20 transform rotate-3"><img src={`${IMG_URL}${movie.thumb_url}`} className="w-full h-full object-cover" alt="" /></div>
                                        <h3 className="text-3xl font-black mb-2 text-white drop-shadow-xl">{movie.name}</h3>
                                        <p className="text-gray-300 mb-8 text-sm">Chủ phòng đang chiếu. Hãy đồng bộ để xem cùng!</p>
                                        {isSyncing ? (<button disabled className="bg-white/10 text-white px-8 py-3 rounded-full font-bold flex items-center gap-3 cursor-wait border border-white/10"><FaSpinner className="animate-spin"/> Đang đồng bộ...</button>) : (<button onClick={handleJoinSession} className="bg-red-600 hover:bg-red-700 text-white pl-8 pr-10 py-4 rounded-full font-bold text-lg flex items-center gap-3 transition-all hover:scale-105 shadow-[0_0_25px_rgba(220,38,38,0.6)] group"><div className="w-8 h-8 bg-white text-red-600 rounded-full flex items-center justify-center"><FaPlay className="ml-1" size={12}/></div>VÀO RẠP NGAY</button>)}
                                    </div>
                                </div>
                            ) : (
                                <div className="w-full h-full">
                                    {currentEpisode && (
                                        <WatchPartyPlayer
                                            key={currentEpisode.slug} movieSlug={movie.slug}
                                            episodes={episodes[0]?.server_data || []} servers={episodes}
                                            currentEp={currentEpisode} currentServerIndex={0}
                                            onEpChange={(ep) => { setCurrentEpisode(ep); if (isHost) socket.emit("video_action", { roomId, action: 'change_ep', slug: movie.slug, epSlug: ep.slug }); }}
                                            onArtReady={onArtReady} 
                                            isGuest={!isHost} startTime={initialTime} hostCurrentTime={hostCurrentTime}
                                            onSyncClick={handleForceSync} isHostPaused={isHostPaused}
                                            option={{ id: currentEpisode.slug, url: currentEpisode.link_m3u8, autoplay: true, theme: '#dc2626' }}
                                            style={{ width: '100%', height: '100%' }}
                                        />
                                    )}
                                </div>
                            )}
                        </>
                    ) : (
                        <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-6 bg-[#0a0e17]"><div className="w-24 h-24 bg-white/5 rounded-full flex items-center justify-center mb-6 border border-white/5 shadow-inner"><FaPlay className="text-white/10 text-4xl ml-2" /></div><h2 className="text-2xl font-bold text-gray-200 mb-2 tracking-wide">PHÒNG CHIẾU TRỐNG</h2><p className="text-gray-500 text-sm max-w-xs">{isHost ? "Hãy dùng thanh tìm kiếm bên trên để chọn phim." : "Chủ phòng đang chọn phim, vui lòng đợi..."}</p></div>
                    )}
                </div>
                
                {/* 2. Chat Column (Chiều cao giới hạn trên Mobile) */}
                {/* Thêm class w-full trên mobile để đảm bảo full width */}
                <div className="lg:col-span-1 bg-white/5 backdrop-blur-xl rounded-3xl border border-white/10 flex flex-col overflow-hidden shadow-xl ring-1 ring-white/5 w-full h-[600px] lg:h-full">
                    <div className="p-4 border-b border-white/5 bg-black/20 flex items-center justify-between cursor-pointer hover:bg-white/5 transition-colors select-none" onClick={() => setShowViewerList(!showViewerList)}>
                        <div className="flex items-center gap-2 text-white font-bold text-sm uppercase tracking-wider"><FaUserFriends className="text-red-500" /> <span>Trò chuyện <span className="text-gray-500 text-xs">({viewers.length})</span></span></div>
                        <div className="text-gray-400">{showViewerList ? <FaChevronUp size={12}/> : <FaChevronDown size={12}/>}</div>
                    </div>
                    {showViewerList && <ViewerList viewers={viewers} onClose={() => setShowViewerList(false)} />}
                    <div ref={messagesContainerRef} className="flex-1 overflow-y-auto p-4 custom-scrollbar scroll-smooth bg-gradient-to-b from-transparent to-black/20">
                        {messages.length === 0 && <div className="flex flex-col items-center justify-center h-full text-gray-600 opacity-60"><FaUserFriends className="text-3xl mb-2" /><p className="text-xs font-medium">Bắt đầu trò chuyện đi nào!</p></div>}
                        {messages.map((m, idx) => (<ChatMessage key={idx} msg={m} isMe={m.isMe} isHost={isHost} onDelete={handleDeleteMessage}/>))}
                    </div>
                    <div className="p-3 bg-black/20 border-t border-white/5"><form onSubmit={handleSend} className="relative group"><input type="text" value={inputMsg} autoFocus onChange={(e) => setInputMsg(e.target.value)} placeholder="Nhập tin nhắn..." className="w-full bg-[#0a0e17]/80 border border-white/10 rounded-2xl pl-4 pr-12 py-3.5 text-sm text-white focus:outline-none focus:border-red-500/50 focus:ring-1 focus:ring-red-500/50 transition-all placeholder-gray-600" /><button type="submit" disabled={!inputMsg.trim()} className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 flex items-center justify-center bg-red-600 hover:bg-red-500 disabled:bg-gray-700 disabled:cursor-not-allowed text-white rounded-xl transition-all shadow-lg active:scale-95"><FaPaperPlane size={12} /></button></form></div>
                </div>
            </div>
        </div>
    );
};

export default WatchParty;