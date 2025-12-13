import React, { useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
    FaChevronRight, FaChevronLeft, FaArrowRight, 
    FaFire, FaClock, FaStar, FaFilm, FaTv, FaMagic, 
    FaGhost, FaLaughSquint, FaFistRaised, FaHeart,
    FaDragon, FaGem, FaMicrophoneAlt, FaGlobeAmericas
} from 'react-icons/fa';
import MovieCard from './MovieCard';

// --- CẤU HÌNH THEME (Khớp chính xác với slug bên Home.jsx) ---
const SECTION_THEMES = {
    // 1. Phim Lẻ (Rose/Red - Màu chủ đạo web)
    'phim-le': {
        gradient: 'from-[#be123c] to-black', 
        accent: 'text-rose-500', 
        border: 'border-rose-600',
        shadow: 'shadow-rose-900/40',
        desc: 'Tuyển tập bom tấn điện ảnh mới nhất, chất lượng HD cực nét.',
        icon: <FaFilm />
    },
    // 2. Phim Bộ (Purple - Sang trọng, cày cuốc)
    'phim-bo': {
        gradient: 'from-[#7e22ce] to-black', 
        accent: 'text-purple-500',
        border: 'border-purple-600',
        shadow: 'shadow-purple-900/40',
        desc: 'Marathon phim truyền hình thả ga, drama kịch tính không hồi kết.',
        icon: <FaTv />
    },
    // 3. Phim Hành Động (Red - Cháy nổ)
    'hanh-dong': {
        gradient: 'from-[#b91c1c] to-black', 
        accent: 'text-red-600',
        border: 'border-red-600',
        shadow: 'shadow-red-900/40',
        desc: 'Những pha hành động mãn nhãn và những cuộc đối đầu nghẹt thở.',
        icon: <FaFire />
    },
    // 4. Phim Tình Cảm (Pink - Lãng mạn)
    'tinh-cam': {
        gradient: 'from-[#be185d] to-black', 
        accent: 'text-pink-500',
        border: 'border-pink-600',
        shadow: 'shadow-pink-900/40',
        desc: 'Những câu chuyện tình yêu lãng mạn, ngọt ngào và đầy cảm xúc.',
        icon: <FaHeart />
    },
    // 5. Phim Hàn Quốc (Blue - Tone lạnh, hiện đại)
    'han-quoc': {
        gradient: 'from-[#2563eb] to-black', 
        accent: 'text-blue-500',
        border: 'border-blue-600',
        shadow: 'shadow-blue-900/40',
        desc: 'Làn sóng Hallyu với dàn diễn viên đình đám và kịch bản lôi cuốn.',
        icon: <FaGem />
    },
    // 6. Phim Trung Quốc (Amber/Gold - Kiếm hiệp, Tiên hiệp, Hoàng gia)
    'trung-quoc': {
        gradient: 'from-[#b45309] to-black', 
        accent: 'text-amber-500',
        border: 'border-amber-600',
        shadow: 'shadow-amber-900/40',
        desc: 'Thế giới Tiên hiệp kỳ ảo, Kiếm hiệp và Ngôn tình hoa ngữ đặc sắc.',
        icon: <FaDragon />
    },
    // 7. Hoạt Hình (Emerald/Green - Sôi động, Tươi mới)
    'hoat-hinh': {
        gradient: 'from-[#059669] to-black', 
        accent: 'text-emerald-500',
        border: 'border-emerald-600',
        shadow: 'shadow-emerald-900/40',
        desc: 'Thế giới sắc màu của Anime và hoạt hình dành cho mọi lứa tuổi.',
        icon: <FaMagic />
    },
    // 8. TV Shows (Sky - Giải trí nhẹ nhàng)
    'tv-shows': {
        gradient: 'from-[#0284c7] to-black', 
        accent: 'text-sky-500',
        border: 'border-sky-600',
        shadow: 'shadow-sky-900/40',
        desc: 'Gameshow và truyền hình thực tế giải trí đỉnh cao.',
        icon: <FaMicrophoneAlt />
    },
    
    // Fallback cho các loại khác
    'default': {
        gradient: 'from-[#3f3f46] to-black',
        accent: 'text-gray-400',
        border: 'border-gray-500',
        shadow: 'shadow-gray-900/40',
        desc: 'Khám phá kho tàng điện ảnh đa dạng.',
        icon: <FaArrowRight />
    }
};

const MovieRow = ({ title, movies, slug, type = 'danh-sach' }) => {
    const navigate = useNavigate();
    const rowRef = useRef(null);

    // FIX QUAN TRỌNG: Ưu tiên lấy theme theo 'slug' chính xác từ Home.jsx
    // Nếu không tìm thấy slug, mới fallback sang type hoặc default
    const themeKey = SECTION_THEMES[slug] ? slug : (SECTION_THEMES[type] ? type : 'default');
    const theme = SECTION_THEMES[themeKey] || SECTION_THEMES['default'];

    const scroll = (amount) => {
        if (rowRef.current) {
            rowRef.current.scrollBy({ left: amount, behavior: 'smooth' });
        }
    };

    const handleViewAll = () => { if (slug) navigate(`/${type}/${slug}`); };
    
    if (!movies || movies.length === 0) return null;

    // Lấy ảnh nền poster
    const bgImage = movies[0]?.thumb_url;

    return (
        <div className="py-8 md:py-12 group/row relative overflow-hidden">
            
            {/* --- MOBILE: BANNER NGANG --- */}
            <div className="md:hidden px-4 mb-4">
                <div 
                    onClick={handleViewAll}
                    className={`relative w-full h-24 rounded-xl overflow-hidden shadow-lg border-l-4 ${theme.border} cursor-pointer`}
                >
                    <div className="absolute inset-0 bg-cover bg-center opacity-60" style={{ backgroundImage: `url(${bgImage})` }} />
                    <div className={`absolute inset-0 bg-gradient-to-r ${theme.gradient} opacity-90`} />
                    
                    <div className="absolute inset-0 flex items-center justify-between px-5">
                        <div className="flex-1 pr-4">
                            <h2 className="text-lg font-black text-white uppercase tracking-tight drop-shadow-md flex items-center gap-2">
                                {title} <span className={`${theme.accent} text-sm`}>{theme.icon}</span>
                            </h2>
                            <p className="text-[10px] text-gray-300 font-medium mt-1 opacity-90 line-clamp-2 leading-tight">{theme.desc}</p>
                        </div>
                        <div className={`w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-white flex-shrink-0`}>
                            <FaChevronRight size={12} />
                        </div>
                    </div>
                </div>
            </div>

            <div className="flex flex-col md:flex-row items-stretch gap-0 md:gap-8 pl-0 md:pl-12">
                
                {/* --- DESKTOP: KHỐI POSTER TẠP CHÍ --- */}
                <div 
                    onClick={handleViewAll}
                    className={`hidden md:block relative flex-shrink-0 w-[240px] lg:w-[260px] rounded-2xl overflow-hidden cursor-pointer group/cat transition-all duration-500 hover:shadow-2xl hover:shadow-${theme.shadow.replace('shadow-', '')} hover:-translate-y-1 bg-[#0a0e17] border border-white/5`}
                >
                    {/* Background Art */}
                    <div 
                        className="absolute inset-0 bg-cover bg-center transition-all duration-1000 group-hover/cat:scale-110 opacity-80 group-hover/cat:opacity-100"
                        style={{ backgroundImage: `url(${bgImage})` }}
                    />
                    
                    {/* Gradient Overlay */}
                    <div className={`absolute inset-0 bg-gradient-to-b ${theme.gradient} opacity-80 group-hover/cat:opacity-60 transition-opacity duration-500`} />
                    
                    {/* Border Accent Top */}
                    <div className={`absolute top-0 left-0 w-full h-1 bg-${theme.border.replace('border-', '')}`} />

                    {/* CONTENT */}
                    <div className="absolute inset-0 p-6 flex flex-col z-10">
                        {/* 1. Header */}
                        <div className="mb-3 transform translate-y-0 transition-transform duration-300">
                            <div className={`text-3xl mb-3 ${theme.accent} drop-shadow-md`}>
                                {theme.icon}
                            </div>
                            <h2 className="text-2xl lg:text-3xl font-black text-white leading-none uppercase drop-shadow-xl break-words">
                                {title}
                            </h2>
                        </div>

                        {/* 2. Description */}
                        <div className="flex-1 relative overflow-hidden">
                            <div className={`h-1 w-12 rounded-full bg-white/30 mb-3`} />
                            <p className="text-sm text-gray-200 font-medium opacity-90 line-clamp-5 leading-relaxed text-shadow-sm">
                                {theme.desc}
                            </p>
                        </div>

                        {/* 3. Footer */}
                        <div className="pt-4 mt-auto border-t border-white/10 flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-white hover:text-white transition-colors group/link">
                            Xem tất cả 
                            <span className={`w-6 h-6 rounded-full border border-white/40 flex items-center justify-center bg-white/10 group-hover/cat:bg-${theme.border.replace('border-', '')} transition-colors`}>
                                <FaArrowRight size={8}/>
                            </span>
                        </div>
                    </div>
                </div>

                {/* --- RIGHT: SLIDER --- */}
                <div className="flex-1 min-w-0 relative z-20">
                    <div 
                        ref={rowRef}
                        className="flex overflow-x-auto gap-4 px-4 md:px-0 pb-8 pt-2 scrollbar-hide scroll-smooth items-center"
                        style={{ perspective: '1000px' }}
                    >
                        {movies.map((movie) => (
                            <div key={movie._id} className="flex-none w-[150px] md:w-[200px]">
                                <MovieCard movie={movie} />
                            </div>
                        ))}
                        
                        {/* Mobile View More */}
                        <div onClick={handleViewAll} className="md:hidden flex-none w-[100px] aspect-[2/3] rounded-xl bg-white/5 border border-white/10 flex flex-col items-center justify-center gap-3 cursor-pointer active:scale-95 transition-transform">
                            <div className={`w-10 h-10 rounded-full ${theme.accent} bg-white/10 border border-current flex items-center justify-center shadow-lg`}><FaArrowRight /></div>
                            <span className="text-xs text-gray-400 font-bold uppercase text-center px-2">Xem thêm</span>
                        </div>
                    </div>

                    {/* Navigation Buttons */}
                    <button 
                        onClick={() => scroll(-300)}
                        className="absolute left-0 top-1/2 -translate-y-1/2 -ml-6 w-14 h-14 bg-[#0a0e17]/80 backdrop-blur-xl border border-white/10 rounded-full text-white flex items-center justify-center opacity-0 group-hover/row:opacity-100 hover:bg-white hover:text-black transition-all shadow-2xl z-30 hidden md:flex"
                    >
                        <FaChevronLeft />
                    </button>
                    <button 
                        onClick={() => scroll(300)}
                        className="absolute right-4 top-1/2 -translate-y-1/2 w-14 h-14 bg-[#0a0e17]/80 backdrop-blur-xl border border-white/10 rounded-full text-white flex items-center justify-center opacity-0 group-hover/row:opacity-100 hover:bg-white hover:text-black transition-all shadow-2xl z-30 hidden md:flex"
                    >
                        <FaChevronRight />
                    </button>
                </div>
            </div>
        </div>
    );
};

export default MovieRow;