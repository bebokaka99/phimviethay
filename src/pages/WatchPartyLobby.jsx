import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async'; // [SEO] Import Helmet
import { FaPlus, FaUsers, FaGlobe, FaPlay, FaFilm, FaTimes, FaLock, FaMagic, FaSearch } from 'react-icons/fa';
import socket from '../services/socket';
import { IMG_URL } from '../services/movieService';
import { getCurrentUser } from '../services/authService';

const WatchPartyLobby = () => {
    const navigate = useNavigate();
    const [rooms, setRooms] = useState([]);
    const [isCreating, setIsCreating] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [newRoomName, setNewRoomName] = useState('');
    const [isPublic, setIsPublic] = useState(true);

    const getUserId = () => {
        const user = getCurrentUser();
        if (user) return user.id || user._id;
        let guestId = localStorage.getItem('wp_guest_id');
        if (!guestId) {
            guestId = `guest_${Math.floor(Math.random() * 100000)}`;
            localStorage.setItem('wp_guest_id', guestId);
        }
        return guestId;
    };

    useEffect(() => {
        socket.connect();
        socket.emit("get_rooms");
        socket.on("list_rooms", (data) => setRooms(data));
        socket.on("update_room_list", () => socket.emit("get_rooms"));
        socket.on("room_created", ({ roomId }) => navigate(`/watch-party/${roomId}`));
        return () => {
            socket.off("list_rooms");
            socket.off("update_room_list");
            socket.off("room_created");
        };
    }, [navigate]);

    const handleCreateRoom = () => {
        if (!newRoomName.trim()) return alert("Vui lòng nhập tên phòng!");
        const roomId = Math.random().toString(36).substring(2, 8);
        const userId = getUserId(); 
        socket.emit("create_room", { roomId, roomName: newRoomName, isPublic, userId });
    };

    const filteredRooms = rooms.filter(room => 
        room.roomName.toLowerCase().includes(searchTerm.toLowerCase()) || 
        room.id.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="min-h-screen pt-28 pb-12 px-4 font-sans bg-[#0f1014] text-white relative overflow-hidden selection:bg-red-500 selection:text-white">
            {/* --- [SEO CONFIG] --- */}
            <Helmet>
                <title>Rạp Chiếu Online - Xem Phim Cùng Bạn Bè | PhimVietHay</title>
                <meta name="description" content="Tạo phòng xem phim chung miễn phí. Chat thời gian thực, đồng bộ video, xem phim cùng người yêu và bạn bè online mượt mà." />
                <meta name="keywords" content="watch party, xem chung, rạp phim online, stream phim, xem phim cùng bạn bè" />
                
                {/* Facebook / Open Graph */}
                <meta property="og:type" content="website" />
                <meta property="og:url" content={window.location.href} />
                <meta property="og:title" content="Rạp Chiếu Online - Watch Party" />
                <meta property="og:description" content="Tạo phòng, mời bạn bè và cùng xem những bộ phim bom tấn ngay bây giờ!" />
                <meta property="og:image" content="https://i.imgur.com/YOUR_DEFAULT_BANNER.jpg" /> {/* Thay link ảnh banner web của bạn */}

                {/* Twitter */}
                <meta property="twitter:card" content="summary_large_image" />
                <meta property="twitter:title" content="Rạp Chiếu Online - Watch Party" />
                <meta property="twitter:description" content="Xem phim cùng bạn bè mọi lúc mọi nơi." />
            </Helmet>
            {/* --- [END SEO] --- */}

            <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-red-600/10 rounded-full blur-[120px] pointer-events-none"></div>
            <div className="absolute bottom-0 right-1/4 w-[400px] h-[400px] bg-blue-600/10 rounded-full blur-[100px] pointer-events-none"></div>

            <div className="max-w-7xl mx-auto relative z-10">
                <div className="flex flex-col lg:flex-row justify-between items-end lg:items-center mb-10 gap-6">
                    <div className="flex-1">
                        <h1 className="text-4xl md:text-5xl font-black text-white mb-2 tracking-tight flex items-center gap-3">
                            WATCH <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-500 to-orange-600">PARTY</span>
                        </h1>
                        <p className="text-gray-400 text-sm md:text-base font-medium max-w-lg">
                            Rạp chiếu phim online. Xem cùng bạn bè, chat thời gian thực.
                        </p>
                    </div>

                    <div className="flex-1 w-full lg:max-w-md relative group z-20">
                        <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-red-500 transition-colors" />
                        <input 
                            type="text" 
                            placeholder="Tìm phòng theo tên hoặc ID..." 
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full bg-[#1a1d26] border border-white/10 rounded-full py-3.5 pl-12 pr-10 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-red-500/50 focus:ring-1 focus:ring-red-500/50 transition-all shadow-lg"
                        />
                        {searchTerm && (
                            <button onClick={() => setSearchTerm('')} className="absolute right-3 top-1/2 -translate-y-1/2 p-1.5 hover:bg-white/10 rounded-full text-gray-500 hover:text-white transition-colors">
                                <FaTimes size={12} />
                            </button>
                        )}
                    </div>
                    
                    <button 
                        onClick={() => setIsCreating(true)} 
                        className="group relative px-6 py-3.5 bg-white text-black rounded-full font-bold text-sm uppercase tracking-wider overflow-hidden shadow-[0_0_20px_rgba(255,255,255,0.3)] hover:shadow-[0_0_30px_rgba(220,38,38,0.6)] transition-all duration-300 active:scale-95 shrink-0"
                    >
                        <span className="relative z-10 flex items-center gap-2 group-hover:text-red-600 transition-colors">
                            <FaPlus /> Tạo Phòng
                        </span>
                        <div className="absolute inset-0 bg-white group-hover:bg-gray-100 transition-colors"></div>
                    </button>
                </div>

                {isCreating && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md animate-fade-in">
                        <div className="bg-[#1a1d26] border border-white/10 w-full max-w-md p-8 rounded-3xl shadow-2xl relative animate-slide-up">
                            <button onClick={() => setIsCreating(false)} className="absolute top-4 right-4 text-gray-500 hover:text-white transition-colors bg-white/5 p-2 rounded-full"><FaTimes /></button>
                            
                            <h3 className="text-2xl font-bold text-white mb-1 flex items-center gap-2"><FaMagic className="text-red-500"/> Tạo phòng mới</h3>
                            <p className="text-gray-400 text-sm mb-6">Thiết lập không gian xem phim của bạn.</p>
                            
                            <div className="space-y-5">
                                <div>
                                    <label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 block">Tên phòng</label>
                                    <input type="text" placeholder="VD: Hội xem phim kinh dị..." value={newRoomName} onChange={(e) => setNewRoomName(e.target.value)} className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3.5 text-white outline-none focus:border-red-500/50 focus:ring-1 focus:ring-red-500/50 transition-all placeholder-gray-600 font-medium" autoFocus />
                                </div>
                                <div>
                                    <label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3 block">Quyền riêng tư</label>
                                    <div className="grid grid-cols-2 gap-3">
                                        <div onClick={() => setIsPublic(true)} className={`cursor-pointer border rounded-xl p-3 flex flex-col items-center gap-2 transition-all ${isPublic ? 'bg-red-600/10 border-red-600 text-red-500' : 'bg-white/5 border-transparent text-gray-400 hover:bg-white/10'}`}>
                                            <FaGlobe size={20} /> <span className="text-xs font-bold">Công khai</span>
                                        </div>
                                        <div onClick={() => setIsPublic(false)} className={`cursor-pointer border rounded-xl p-3 flex flex-col items-center gap-2 transition-all ${!isPublic ? 'bg-yellow-600/10 border-yellow-600 text-yellow-500' : 'bg-white/5 border-transparent text-gray-400 hover:bg-white/10'}`}>
                                            <FaLock size={20} /> <span className="text-xs font-bold">Riêng tư</span>
                                        </div>
                                    </div>
                                </div>
                                <button onClick={handleCreateRoom} className="w-full bg-gradient-to-r from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 text-white font-bold py-4 rounded-xl shadow-lg shadow-red-900/30 transition-all active:scale-[0.98] mt-2">🚀 BẮT ĐẦU NGAY</button>
                            </div>
                        </div>
                    </div>
                )}

                {rooms.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-24 bg-white/5 rounded-3xl border border-white/5 border-dashed">
                        <div className="w-20 h-20 bg-white/5 rounded-full flex items-center justify-center mb-6 animate-pulse"><FaFilm className="text-3xl text-gray-600" /></div>
                        <h3 className="text-xl font-bold text-gray-300">Chưa có phòng nào hoạt động</h3>
                        <p className="text-gray-500 mt-2">Hãy là người đầu tiên tạo phòng chiếu!</p>
                    </div>
                ) : filteredRooms.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-24 bg-white/5 rounded-3xl border border-white/5 border-dashed">
                        <div className="w-20 h-20 bg-white/5 rounded-full flex items-center justify-center mb-6"><FaSearch className="text-3xl text-gray-600" /></div>
                        <h3 className="text-xl font-bold text-gray-300">Không tìm thấy phòng nào</h3>
                        <p className="text-gray-500 mt-2">Thử tìm bằng tên phòng hoặc ID khác xem sao.</p>
                        <button onClick={() => setSearchTerm('')} className="mt-4 text-red-500 hover:text-red-400 font-bold text-sm">Xóa bộ lọc</button>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        {filteredRooms.map((room) => (
                            <div key={room.id} onClick={() => navigate(`/watch-party/${room.id}`)} className="group bg-[#181b24] border border-white/5 rounded-2xl overflow-hidden cursor-pointer hover:border-white/20 hover:shadow-2xl hover:shadow-red-900/10 transition-all duration-300 relative flex flex-col h-full">
                                <div className="aspect-video bg-black relative overflow-hidden">
                                    {room.movie ? (
                                        <>
                                            <img src={`${IMG_URL}${room.movie.thumb}`} className="w-full h-full object-cover opacity-60 group-hover:opacity-100 group-hover:scale-110 transition-all duration-700 ease-out" alt={room.movie.name} />
                                            <div className="absolute inset-0 bg-gradient-to-t from-[#181b24] via-transparent to-transparent"></div>
                                        </>
                                    ) : (
                                        <div className="w-full h-full flex flex-col items-center justify-center bg-[#12141a]"><FaFilm className="text-4xl text-gray-700 mb-2 group-hover:text-gray-500 transition-colors"/><span className="text-xs font-bold text-gray-600 uppercase tracking-wider">Đang chọn phim</span></div>
                                    )}
                                    <div className="absolute top-3 right-3 flex gap-2"><div className="bg-black/60 backdrop-blur-md text-white text-[10px] font-bold px-2 py-1 rounded flex items-center gap-1.5 border border-white/10"><span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></span>{room.viewerCount} đang xem</div></div>
                                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300"><div className="w-12 h-12 bg-red-600/90 rounded-full flex items-center justify-center shadow-lg transform scale-50 group-hover:scale-100 transition-transform duration-300"><FaPlay className="text-white ml-1" /></div></div>
                                </div>
                                <div className="p-5 flex-1 flex flex-col">
                                    <h4 className="font-bold text-lg text-gray-100 line-clamp-1 group-hover:text-red-500 transition-colors mb-1">{room.roomName}</h4>
                                    {room.movie && <p className="text-xs font-medium text-gray-400 line-clamp-1 mb-4 flex items-center gap-1.5"><FaFilm className="text-gray-600"/> {room.movie.name}</p>}
                                    <div className="mt-auto pt-4 border-t border-white/5 flex justify-between items-center">
                                        <div className="flex -space-x-2">{[...Array(Math.min(3, room.viewerCount))].map((_, i) => (<div key={i} className="w-6 h-6 rounded-full bg-gray-700 border-2 border-[#181b24] flex items-center justify-center text-[8px] text-gray-400"><FaUsers /></div>))}{room.viewerCount > 3 && (<div className="w-6 h-6 rounded-full bg-gray-800 border-2 border-[#181b24] flex items-center justify-center text-[8px] text-gray-400 font-bold">+{room.viewerCount - 3}</div>)}</div>
                                        <span className="text-[10px] font-mono text-gray-500 bg-white/5 px-2 py-1 rounded border border-white/5">ID: {room.id}</span>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default WatchPartyLobby;