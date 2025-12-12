import React, { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { FaPaperPlane, FaUserFriends, FaCopy, FaPlay, FaSearch, FaTimes, FaHome, FaAngleRight } from 'react-icons/fa';
import socket from '../services/socket';
import VideoPlayer from '../components/movies/VideoPlayer';
import { getMovieDetail, searchMovies, IMG_URL } from '../services/movieService';
import { getCurrentUser } from '../services/authService';

// --- SUB-COMPONENT: Chat Message (Có Avatar) ---
const ChatMessage = ({ msg, isMe }) => {
    // Tạo Avatar mặc định theo tên nếu không có ảnh
    const avatarUrl = msg.user?.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(msg.user?.name || 'K')}&background=random&color=fff&size=128`;

    return (
        <div className={`flex items-end gap-2 mb-4 ${isMe ? 'flex-row-reverse' : 'flex-row'}`}>
            {/* AVATAR */}
            <div className="flex-shrink-0">
                <img 
                    src={avatarUrl} 
                    alt="Avt" 
                    className="w-8 h-8 rounded-full border border-white/20 shadow-sm object-cover"
                />
            </div>

            {/* BUBBLE */}
            <div className={`flex flex-col max-w-[75%] ${isMe ? 'items-end' : 'items-start'}`}>
                {/* Tên người gửi (Chỉ hiện cho người lạ) */}
                {!isMe && <span className="text-[10px] text-gray-400 ml-1 mb-0.5">{msg.user?.name || 'Khách'}</span>}
                
                <div className={`px-3 py-2 rounded-2xl text-sm shadow-md break-words ${
                    isMe 
                        ? 'bg-gradient-to-r from-red-600 to-red-700 text-white rounded-br-none' 
                        : 'bg-white/10 text-gray-200 border border-white/5 rounded-bl-none'
                }`}>
                    {msg.text}
                </div>
            </div>
        </div>
    );
};

const WatchParty = () => {
    const { roomId } = useParams();
    const navigate = useNavigate();
    
    // User Info (Tự tạo nếu là khách)
    const [currentUser] = useState(() => {
        const user = getCurrentUser();
        return user ? { name: user.name, avatar: user.avatar } : { name: `Khách ${Math.floor(Math.random() * 1000)}`, avatar: null };
    });

    // Chat State
    const [messages, setMessages] = useState([]);
    const [inputMsg, setInputMsg] = useState('');
    
    // Movie State
    const [movie, setMovie] = useState(null);
    const [episodes, setEpisodes] = useState([]);
    const [currentEpisode, setCurrentEpisode] = useState(null);
    const [currentServer, setCurrentServer] = useState(0);

    // Search State
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState([]);
    const [showDropdown, setShowDropdown] = useState(false);
    const [isSearching, setIsSearching] = useState(false);
    const searchTimeoutRef = useRef(null);

    // Player Ref
    const artInstanceRef = useRef(null);
    const isRemoteUpdate = useRef(false);

    // [FIX SCROLL] Ref cho khung chứa tin nhắn thay vì thẻ div cuối cùng
    const messagesContainerRef = useRef(null);

    // [FIX SCROLL] Hàm cuộn êm ái chỉ trong khung chat
    const scrollToBottom = () => {
        if (messagesContainerRef.current) {
            const { scrollHeight, clientHeight } = messagesContainerRef.current;
            // Chỉ cuộn nếu nội dung dài hơn khung nhìn
            if (scrollHeight > clientHeight) {
                messagesContainerRef.current.scrollTo({
                    top: scrollHeight,
                    behavior: 'smooth'
                });
            }
        }
    };

    // Gọi scroll khi có tin nhắn mới
    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    // 1. KẾT NỐI SOCKET
    useEffect(() => {
        if (!roomId) {
            const randomId = Math.random().toString(36).substring(7);
            navigate(`/watch-party/${randomId}`);
            return;
        }

        socket.connect();
        socket.emit("join_room", roomId);

        socket.on("receive_video_action", (data) => {
            const art = artInstanceRef.current;
            if (!art) return;
            isRemoteUpdate.current = true;

            switch (data.action) {
                case 'play':
                    art.play();
                    if (Math.abs(art.currentTime - data.time) > 2) art.currentTime = data.time;
                    break;
                case 'pause':
                    art.pause();
                    break;
                case 'seek':
                    art.currentTime = data.time;
                    break;
                case 'change_movie':
                    if (data.slug !== movie?.slug) loadMovieData(data.slug);
                    break;
                default: break;
            }
            setTimeout(() => { isRemoteUpdate.current = false; }, 500);
        });

        socket.on("receive_message", (data) => {
            setMessages((prev) => [...prev, { ...data, isMe: false }]);
        });

        socket.on("user_joined", () => {
            setMessages((prev) => [...prev, { text: "👋 Một người bạn vừa vào phòng!", system: true }]);
            if (movie && artInstanceRef.current) {
                socket.emit("video_action", {
                    roomId, action: 'change_movie', slug: movie.slug, time: artInstanceRef.current.currentTime
                });
            }
        });

        return () => {
            socket.off("receive_video_action");
            socket.off("receive_message");
            socket.off("user_joined");
            socket.disconnect();
        };
    }, [roomId, movie]);

    // --- SEARCH LOGIC ---
    useEffect(() => {
        if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current);
        if (!searchQuery.trim()) { setSearchResults([]); setShowDropdown(false); return; }

        searchTimeoutRef.current = setTimeout(async () => {
            setIsSearching(true);
            try {
                const res = await searchMovies(searchQuery, 1);
                if (res?.data?.items) {
                    setSearchResults(res.data.items);
                    setShowDropdown(true);
                }
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

    // --- PLAYER EVENTS ---
    const onArtReady = (art) => {
        artInstanceRef.current = art;
        art.on('play', () => { if (!isRemoteUpdate.current) socket.emit("video_action", { roomId, action: 'play', time: art.currentTime }); });
        art.on('pause', () => { if (!isRemoteUpdate.current) socket.emit("video_action", { roomId, action: 'pause', time: art.currentTime }); });
        art.on('seek', (time) => { if (!isRemoteUpdate.current) socket.emit("video_action", { roomId, action: 'seek', time: time }); });
    };

    // --- CHAT SEND ---
    const handleSend = (e) => {
        e.preventDefault();
        if (!inputMsg.trim()) return;
        
        // Gửi cả thông tin user kèm tin nhắn
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
            
            {/* HEADER & SEARCH TOOLBAR */}
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
                        <input 
                            type="text" 
                            placeholder="Tìm phim để chiếu (VD: Mai, Conan...)" 
                            value={searchQuery}
                            onChange={e => setSearchQuery(e.target.value)}
                            className="bg-transparent border-none text-sm text-white focus:outline-none w-full placeholder-gray-500"
                        />
                        {isSearching && <div className="animate-spin h-3 w-3 border-2 border-red-500 rounded-full border-t-transparent"></div>}
                        {searchQuery && !isSearching && (
                            <FaTimes className="text-gray-500 cursor-pointer hover:text-red-500 transition-colors" onClick={() => {setSearchQuery(''); setShowDropdown(false);}} />
                        )}
                    </div>

                    {/* Search Dropdown */}
                    {showDropdown && searchResults.length > 0 && (
                        <div className="absolute top-full left-0 right-0 mt-3 bg-[#151922] border border-white/10 rounded-xl shadow-2xl max-h-96 overflow-y-auto custom-scrollbar z-[100] animate-fade-in-down">
                            {searchResults.map((item) => (
                                <div 
                                    key={item._id}
                                    onClick={() => handleSelectMovie(item)}
                                    className="flex items-center gap-4 p-3 hover:bg-white/5 cursor-pointer transition-colors border-b border-white/5 last:border-0 group"
                                >
                                    <div className="w-10 h-14 bg-gray-800 rounded-md overflow-hidden flex-shrink-0 shadow-md group-hover:scale-105 transition-transform duration-300">
                                        <img 
                                            src={`${IMG_URL}${item.thumb_url}`} 
                                            alt={item.name} 
                                            className="w-full h-full object-cover"
                                            onError={(e) => e.target.src = 'https://via.placeholder.com/40x56?text=No+Img'}
                                        />
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
                        <div className="text-center p-8">
                            <div className="w-24 h-24 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-6 border border-white/10">
                                <FaPlay className="text-white/20 text-4xl ml-2" />
                            </div>
                            <h2 className="text-3xl font-bold text-white mb-2">Rạp đang chờ phim</h2>
                            <p className="text-gray-400">Chủ phòng hãy tìm và chọn phim để bắt đầu buổi chiếu.</p>
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

                    {/* [FIX SCROLL] GẮN REF CONTAINER */}
                    <div 
                        ref={messagesContainerRef} 
                        className="flex-1 overflow-y-auto p-4 custom-scrollbar space-y-1 scroll-smooth"
                    >
                        {messages.length === 0 && (
                            <div className="flex flex-col items-center justify-center h-full text-gray-500 opacity-50">
                                <FaUserFriends className="text-4xl mb-2" />
                                <p className="text-xs">Chưa có tin nhắn nào</p>
                            </div>
                        )}
                        {messages.map((m, idx) => (
                            m.system ? (
                                <div key={idx} className="flex items-center gap-2 justify-center my-3">
                                    <div className="h-[1px] bg-white/10 w-8"></div>
                                    <span className="text-[10px] text-gray-400 italic">{m.text}</span>
                                    <div className="h-[1px] bg-white/10 w-8"></div>
                                </div>
                            ) : (
                                <ChatMessage key={idx} msg={m} isMe={m.isMe} />
                            )
                        ))}
                    </div>

                    {/* Input Chat */}
                    <form onSubmit={handleSend} className="p-3 bg-white/5 border-t border-white/10 flex gap-2">
                        <input
                            type="text"
                            value={inputMsg}
                            autoFocus
                            onChange={(e) => setInputMsg(e.target.value)}
                            placeholder="Nhập tin nhắn..."
                            className="flex-1 bg-black/40 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-red-500/50 focus:bg-black/60 transition-all placeholder-gray-600"
                        />
                        <button type="submit" className="bg-red-600 hover:bg-red-700 text-white p-3 rounded-xl transition-all shadow-lg active:scale-95">
                            <FaPaperPlane size={14} />
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default WatchParty;