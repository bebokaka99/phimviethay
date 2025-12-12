import React, { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { FaPaperPlane, FaUserFriends, FaCopy, FaPlay, FaSearch, FaTimes, FaHome, FaAngleRight, FaSync } from 'react-icons/fa';
import socket from '../services/socket';
import VideoPlayer from '../components/movies/VideoPlayer';
import { getMovieDetail, searchMovies, IMG_URL } from '../services/movieService';
import { getCurrentUser } from '../services/authService';

// --- SUB-COMPONENT: Chat Message ---
const ChatMessage = ({ msg, isMe }) => {
    const avatarUrl = msg.user?.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(msg.user?.name || 'K')}&background=random&color=fff&size=128`;
    return (
        <div className={`flex items-end gap-2 mb-4 ${isMe ? 'flex-row-reverse' : 'flex-row'}`}>
            <div className="flex-shrink-0">
                <img src={avatarUrl} alt="Avt" className="w-8 h-8 rounded-full border border-white/20 shadow-sm object-cover"/>
            </div>
            <div className={`flex flex-col max-w-[75%] ${isMe ? 'items-end' : 'items-start'}`}>
                {!isMe && <span className="text-[10px] text-gray-400 ml-1 mb-0.5">{msg.user?.name || 'Khách'}</span>}
                <div className={`px-3 py-2 rounded-2xl text-sm shadow-md break-words ${isMe ? 'bg-gradient-to-r from-red-600 to-red-700 text-white rounded-br-none' : 'bg-white/10 text-gray-200 border border-white/5 rounded-bl-none'}`}>
                    {msg.text}
                </div>
            </div>
        </div>
    );
};

const WatchParty = () => {
    const { roomId } = useParams();
    const navigate = useNavigate();
    
    const [currentUser] = useState(() => {
        const user = getCurrentUser();
        return user ? { name: user.name, avatar: user.avatar } : { name: `Khách ${Math.floor(Math.random() * 1000)}`, avatar: null };
    });

    const [messages, setMessages] = useState([]);
    const [inputMsg, setInputMsg] = useState('');
    
    const [movie, setMovie] = useState(null);
    const [episodes, setEpisodes] = useState([]);
    const [currentEpisode, setCurrentEpisode] = useState(null);
    const [currentServer, setCurrentServer] = useState(0);

    // Refs để lưu state mới nhất cho Socket đọc (tránh stale closure)
    const currentMovieRef = useRef(null); 
    const currentEpisodeRef = useRef(null); 
    
    // [FIX] Ref lưu thời gian cần tua sau khi load phim xong
    const pendingSeekTimeRef = useRef(null);
    const pendingPlayStateRef = useRef(null); // Lưu trạng thái play/pause cần set

    useEffect(() => { currentMovieRef.current = movie; }, [movie]);
    useEffect(() => { currentEpisodeRef.current = currentEpisode; }, [currentEpisode]);

    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState([]);
    const [showDropdown, setShowDropdown] = useState(false);
    const [isSearching, setIsSearching] = useState(false);
    const searchTimeoutRef = useRef(null);

    const artInstanceRef = useRef(null);
    const isRemoteUpdate = useRef(false);

    const messagesContainerRef = useRef(null);
    const scrollToBottom = () => {
        if (messagesContainerRef.current) {
            const { scrollHeight, clientHeight } = messagesContainerRef.current;
            if (scrollHeight > clientHeight) {
                messagesContainerRef.current.scrollTo({ top: scrollHeight, behavior: 'smooth' });
            }
        }
    };
    useEffect(scrollToBottom, [messages]);

    // 1. KẾT NỐI SOCKET
    useEffect(() => {
        if (!roomId) {
            const randomId = Math.random().toString(36).substring(7);
            navigate(`/watch-party/${randomId}`);
            return;
        }

        socket.connect();
        socket.emit("join_room", roomId);

        // --- NHẬN LỆNH TỪ SERVER ---
        socket.on("receive_video_action", (data) => {
            const art = artInstanceRef.current;
            
            // Đánh dấu lệnh từ xa để không gửi ngược lại
            if (data.action !== 'request_sync') {
                isRemoteUpdate.current = true;
            }

            console.log(`[Socket] Receive: ${data.action}`, data);

            switch (data.action) {
                case 'play':
                    if (art) {
                        art.play();
                        // Đồng bộ thời gian nếu lệch quá 2s
                        if (Math.abs(art.currentTime - data.time) > 2) art.currentTime = data.time;
                    }
                    break;
                case 'pause':
                    if (art) {
                        art.pause();
                        art.currentTime = data.time; // Sync chính xác khi pause
                    }
                    break;
                case 'seek':
                    if (art) art.currentTime = data.time;
                    break;
                
                // [FIX] Xử lý khi chủ phòng đổi phim
                case 'change_movie':
                    if (data.slug !== currentMovieRef.current?.slug) {
                        loadMovieData(data.slug);
                    }
                    break;

                // [FIX] Xử lý đồng bộ toàn bộ (Sync Full State)
                case 'sync_current_state':
                    // 1. Lưu thời gian cần tua vào Ref
                    pendingSeekTimeRef.current = data.time;
                    pendingPlayStateRef.current = data.isPlaying;

                    // 2. Nếu phim khác phim hiện tại -> Load phim mới
                    if (data.slug !== currentMovieRef.current?.slug) {
                        console.log("[Sync] Phim khác, đang load lại...");
                        loadMovieData(data.slug); 
                        // Khi load xong, VideoPlayer sẽ mount lại và gọi onArtReady -> lúc đó sẽ check pendingSeekTimeRef
                    } else {
                        // 3. Nếu phim giống nhau -> Chỉ cần Seek và Set trạng thái
                        console.log("[Sync] Phim giống nhau, đang tua...");
                        if (art) {
                            art.currentTime = data.time;
                            if (data.isPlaying) art.play(); else art.pause();
                            pendingSeekTimeRef.current = null; // Clear sau khi dùng
                        }
                    }
                    break;

                // Ai đó (Người mới) yêu cầu Sync -> Mình (Chủ phòng/Người cũ) gửi trạng thái
                case 'request_sync':
                    if (currentMovieRef.current && art) {
                        console.log("[Host] Gửi trạng thái sync cho người mới...");
                        socket.emit("video_action", {
                            roomId,
                            action: 'sync_current_state', // Dùng action này để gửi full info
                            slug: currentMovieRef.current.slug,
                            time: art.currentTime,
                            isPlaying: art.playing
                        });
                    }
                    break;
                default: break;
            }
            
            // Mở khóa sau 500ms
            setTimeout(() => { isRemoteUpdate.current = false; }, 500);
        });

        socket.on("receive_message", (data) => {
            setMessages((prev) => [...prev, { ...data, isMe: false }]);
        });

        socket.on("user_joined", () => {
            setMessages((prev) => [...prev, { text: "👋 Một người bạn vừa vào phòng!", system: true }]);
            // [TỰ ĐỘNG SYNC] Khi có người vào, gửi ngay trạng thái hiện tại
            if (currentMovieRef.current && artInstanceRef.current) {
                socket.emit("video_action", {
                    roomId,
                    action: 'sync_current_state',
                    slug: currentMovieRef.current.slug,
                    time: artInstanceRef.current.currentTime,
                    isPlaying: artInstanceRef.current.playing
                });
            }
        });

        // [TỰ ĐỘNG SYNC] Khi mình vừa vào, hét lên yêu cầu sync ngay
        setTimeout(() => {
            socket.emit("video_action", { roomId, action: 'request_sync' });
        }, 1500); // Đợi 1.5s cho chắc

        return () => {
            socket.off("receive_video_action");
            socket.off("receive_message");
            socket.off("user_joined");
            socket.disconnect();
        };
    }, [roomId]); 

    // --- SEARCH LOGIC (Giữ nguyên) ---
    useEffect(() => {
        if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current);
        if (!searchQuery.trim()) { setSearchResults([]); setShowDropdown(false); return; }
        searchTimeoutRef.current = setTimeout(async () => {
            setIsSearching(true);
            try {
                const res = await searchMovies(searchQuery, 1);
                if (res?.data?.items) { setSearchResults(res.data.items); setShowDropdown(true); }
            } catch (error) { console.error(error); } finally { setIsSearching(false); }
        }, 500);
        return () => clearTimeout(searchTimeoutRef.current);
    }, [searchQuery]);

    const handleSelectMovie = (selectedMovie) => {
        setSearchQuery('');
        setShowDropdown(false);
        loadMovieData(selectedMovie.slug);
        socket.emit("video_action", { roomId, action: 'change_movie', slug: selectedMovie.slug });
    };

    const loadMovieData = async (slugToLoad) => {
        try {
            const data = await getMovieDetail(slugToLoad);
            if (data?.status && data?.movie) {
                setMovie(data.movie);
                setEpisodes(data.episodes || []);
                const serverData = data.episodes?.[0]?.server_data || [];
                if (serverData.length > 0) setCurrentEpisode(serverData[0]);
                setMessages(prev => [...prev, { text: `🎥 Đang chiếu: ${data.movie.name}`, system: true }]);
            }
        } catch (error) { console.error(error); }
    };

    const handleRequestSync = () => {
        socket.emit("video_action", { roomId, action: 'request_sync' });
        // alert("Đã gửi yêu cầu đồng bộ!"); // Bỏ alert cho đỡ phiền
    };

    // --- [FIX] PLAYER EVENTS & INITIAL SYNC ---
    const onArtReady = (art) => {
        artInstanceRef.current = art;

        // [FIX QUAN TRỌNG] Kiểm tra xem có lệnh Seek đang chờ không (Do lệnh Sync tạo ra)
        if (pendingSeekTimeRef.current !== null) {
            console.log(`[Player] Thực hiện pending seek tới: ${pendingSeekTimeRef.current}`);
            
            // Delay nhẹ để đảm bảo video load metadata xong
            setTimeout(() => {
                art.currentTime = pendingSeekTimeRef.current;
                if (pendingPlayStateRef.current) art.play(); else art.pause();
                
                // Reset pending
                pendingSeekTimeRef.current = null;
                pendingPlayStateRef.current = null;
            }, 800);
        }

        // Gửi sự kiện khi mình thao tác
        art.on('play', () => { if (!isRemoteUpdate.current) socket.emit("video_action", { roomId, action: 'play', time: art.currentTime }); });
        art.on('pause', () => { if (!isRemoteUpdate.current) socket.emit("video_action", { roomId, action: 'pause', time: art.currentTime }); });
        art.on('seek', (time) => { if (!isRemoteUpdate.current) socket.emit("video_action", { roomId, action: 'seek', time: time }); });
    };

    const handleSend = (e) => {
        e.preventDefault();
        if (!inputMsg.trim()) return;
        const msgData = { roomId, text: inputMsg, user: currentUser };
        socket.emit("send_message", msgData);
        setMessages((prev) => [...prev, { text: inputMsg, user: currentUser, isMe: true }]);
        setInputMsg('');
    };

    const copyLink = () => {
        navigator.clipboard.writeText(window.location.href);
        alert("Đã sao chép link phòng!");
    };

    return (
        <div className="w-full min-h-screen pt-24 pb-8 px-4 font-sans">
            
            {/* HEADER */}
            <div className="max-w-[1400px] mx-auto mb-6 flex flex-col md:flex-row gap-4 justify-between items-start md:items-center bg-white/5 backdrop-blur-md p-4 rounded-2xl border border-white/10 shadow-lg relative z-50">
                <div className="flex items-center gap-3">
                    <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse shadow-[0_0_12px_#22c55e]"></div>
                    <div>
                        <h1 className="font-bold text-lg text-white uppercase tracking-widest leading-none">Watch Party</h1>
                        <span className="text-xs text-gray-400 font-mono">ID: {roomId}</span>
                    </div>
                </div>

                {/* Search Box */}
                <div className="relative w-full md:w-[400px]">
                    <div className="flex items-center bg-black/40 border border-white/10 rounded-full px-4 py-2.5 focus-within:border-red-500/50 focus-within:bg-black/60 transition-all shadow-inner">
                        <FaSearch className="text-gray-400 mr-3" />
                        <input type="text" placeholder="Tìm phim (VD: Mai, Conan...)" value={searchQuery} onChange={e => setSearchQuery(e.target.value)} className="bg-transparent border-none text-sm text-white focus:outline-none w-full placeholder-gray-500" />
                        {isSearching && <div className="animate-spin h-3 w-3 border-2 border-red-500 rounded-full border-t-transparent"></div>}
                        {searchQuery && !isSearching && <FaTimes className="text-gray-500 cursor-pointer hover:text-red-500 transition-colors" onClick={() => {setSearchQuery(''); setShowDropdown(false);}} />}
                    </div>
                    {showDropdown && searchResults.length > 0 && (
                        <div className="absolute top-full left-0 right-0 mt-3 bg-[#151922] border border-white/10 rounded-xl shadow-2xl max-h-96 overflow-y-auto custom-scrollbar z-[100] animate-fade-in-down">
                            {searchResults.map((item) => (
                                <div key={item._id} onClick={() => handleSelectMovie(item)} className="flex items-center gap-4 p-3 hover:bg-white/5 cursor-pointer transition-colors border-b border-white/5 last:border-0 group">
                                    <div className="w-10 h-14 bg-gray-800 rounded-md overflow-hidden flex-shrink-0 shadow-md group-hover:scale-105 transition-transform duration-300">
                                        <img src={`${IMG_URL}${item.thumb_url}`} alt={item.name} className="w-full h-full object-cover" onError={(e) => e.target.src = 'https://via.placeholder.com/40x56?text=No+Img'} />
                                    </div>
                                    <div className="min-w-0">
                                        <h4 className="text-sm font-bold text-gray-200 group-hover:text-red-500 transition-colors truncate">{item.name}</h4>
                                        <p className="text-xs text-gray-500 truncate">{item.origin_name} • {item.year}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                <button onClick={copyLink} className="flex items-center gap-2 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 px-5 py-2.5 rounded-full text-sm font-bold text-white transition-all shadow-lg hover:shadow-red-600/30 active:scale-95 whitespace-nowrap">
                    <FaCopy /> Mời bạn bè
                </button>
            </div>

            <div className="max-w-[1400px] mx-auto grid grid-cols-1 lg:grid-cols-4 gap-6 h-[calc(100vh-200px)] min-h-[500px]">
                {/* CỘT TRÁI: PLAYER */}
                <div className="lg:col-span-3 bg-black rounded-2xl overflow-hidden border border-white/10 relative group shadow-2xl flex items-center justify-center ring-1 ring-white/5">
                    {movie && currentEpisode ? (
                        <div className="w-full h-full">
                            <VideoPlayer
                                key={currentEpisode.slug}
                                movieSlug={movie.slug}
                                episodes={episodes[currentServer]?.server_data || []}
                                servers={episodes}
                                currentEp={currentEpisode}
                                currentServerIndex={currentServer}
                                onEpChange={setCurrentEpisode}
                                onServerChange={setCurrentServer}
                                onArtReady={onArtReady} 
                                option={{
                                    id: currentEpisode.slug,
                                    url: currentEpisode.link_m3u8,
                                    autoplay: true,
                                    theme: '#dc2626',
                                }}
                                style={{ width: '100%', height: '100%' }}
                            />
                        </div>
                    ) : (
                        <div className="text-center p-8 flex flex-col items-center">
                            <div className="w-24 h-24 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-6 border border-white/10">
                                <FaPlay className="text-white/20 text-4xl ml-2" />
                            </div>
                            <h2 className="text-3xl font-bold text-white mb-2">Rạp đang chờ phim</h2>
                            <p className="text-gray-400 mb-4">Chủ phòng hãy chọn phim để bắt đầu.</p>
                            
                            {/* Nút thủ công nếu không tự sync được */}
                            <button 
                                onClick={handleRequestSync}
                                className="flex items-center gap-2 bg-white/10 hover:bg-white/20 px-4 py-2 rounded-lg text-sm text-gray-300 transition-all border border-white/10"
                            >
                                <FaSync /> Đồng bộ ngay
                            </button>
                        </div>
                    )}
                </div>

                {/* CỘT PHẢI: CHAT */}
                <div className="lg:col-span-1 bg-[#121620]/80 backdrop-blur-xl rounded-2xl border border-white/10 flex flex-col overflow-hidden shadow-xl ring-1 ring-white/5">
                    <div className="p-4 border-b border-white/10 bg-white/5 flex items-center justify-between">
                        <div className="flex items-center gap-2 text-white font-bold">
                            <FaUserFriends className="text-red-500" />
                            <span>Trò chuyện</span>
                        </div>
                        <span className="text-[10px] px-2 py-0.5 bg-green-500/20 text-green-400 border border-green-500/20 rounded-full">Live</span>
                    </div>

                    <div ref={messagesContainerRef} className="flex-1 overflow-y-auto p-4 custom-scrollbar space-y-1 scroll-smooth">
                        {messages.length === 0 && <div className="flex flex-col items-center justify-center h-full text-gray-500 opacity-50"><FaUserFriends className="text-4xl mb-2" /><p className="text-xs">Chưa có tin nhắn nào</p></div>}
                        {messages.map((m, idx) => (
                            m.system ? (
                                <div key={idx} className="flex items-center gap-2 justify-center my-3">
                                    <div className="h-[1px] bg-white/10 w-8"></div>
                                    <span className="text-[10px] text-gray-400 italic">{m.text}</span>
                                    <div className="h-[1px] bg-white/10 w-8"></div>
                                </div>
                            ) : <ChatMessage key={idx} msg={m} isMe={m.isMe} />
                        ))}
                    </div>

                    <form onSubmit={handleSend} className="p-3 bg-white/5 border-t border-white/10 flex gap-2">
                        <input type="text" value={inputMsg} autoFocus onChange={(e) => setInputMsg(e.target.value)} placeholder="Nhập tin nhắn..." className="flex-1 bg-black/40 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-red-500/50 focus:bg-black/60 transition-all placeholder-gray-600" />
                        <button type="submit" className="bg-red-600 hover:bg-red-700 text-white p-3 rounded-xl transition-all shadow-lg active:scale-95"><FaPaperPlane size={14} /></button>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default WatchParty;