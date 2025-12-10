import React, { memo, useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import { createPortal } from 'react-dom';
import { FaPlay, FaStar, FaInfoCircle, FaPlayCircle } from 'react-icons/fa';
import { IMG_URL, getMovieDetail } from '../../services/movieService';

const MovieCard = memo(({ movie }) => {
    // --- STATE & REFS ---
    const [isHovered, setIsHovered] = useState(false);
    const [coords, setCoords] = useState({ top: 0, left: 0, width: 0 });
    const [detailData, setDetailData] = useState(null); 
    
    const cardRef = useRef(null);
    const entryTimer = useRef(null);
    const exitTimer = useRef(null);

    // --- DATA ---
    const ratingVal = movie.tmdb?.vote_average || movie.vote_average || 0;
    const displayRating = ratingVal > 0 ? ratingVal.toFixed(1) : 'N/A';
    const year = movie.year || movie.category?.[0]?.name || 'Unknown';
    const posterUrl = `${IMG_URL}${movie.thumb_url}`;
    const backdropUrl = movie.poster_url && movie.poster_url.includes('http') 
        ? movie.poster_url 
        : posterUrl;

    const stripHtml = (html) => {
        if (!html) return "";
        const doc = new DOMParser().parseFromString(html, 'text/html');
        return doc.body.textContent || "";
    };

    // --- MOUSE EVENTS ---
    const handleMouseEnter = () => {
        // [QUAN TRỌNG] Tắt tính năng này trên Mobile/Tablet (Màn hình < 1024px)
        // Để trải nghiệm chạm (touch) được mượt mà, vào phim ngay lập tức
        if (window.innerWidth < 1024) return;

        if (exitTimer.current) clearTimeout(exitTimer.current);
        
        if (!isHovered) {
            entryTimer.current = setTimeout(async () => {
                if (cardRef.current) {
                    const rect = cardRef.current.getBoundingClientRect();
                    setCoords({
                        top: rect.top + window.scrollY,
                        left: rect.left + window.scrollX,
                        width: rect.width
                    });
                    
                    setIsHovered(true);

                    if (!detailData) {
                        try {
                            const res = await getMovieDetail(movie.slug);
                            if (res.status && res.movie) {
                                setDetailData(res.movie);
                            }
                        } catch (err) {
                            console.error(err);
                        }
                    }
                }
            }, 500);
        }
    };

    const handleMouseLeave = () => {
        if (entryTimer.current) clearTimeout(entryTimer.current);
        exitTimer.current = setTimeout(() => {
            setIsHovered(false);
        }, 300);
    };

    // --- MINI HERO POPUP ---
    const MiniHeroPopup = () => {
        if (!isHovered) return null;

        const scale = 1.9; 
        const newWidth = coords.width * scale;
        const leftPos = coords.left - (newWidth - coords.width) / 2;
        const rect = cardRef.current ? cardRef.current.getBoundingClientRect() : { top: 0 };
        const topPos = (rect.top + window.scrollY) - 60; 

        const content = stripHtml(detailData?.content || movie.content);
        const actors = detailData?.actor || []; 
        const categories = detailData?.category || movie.category || [];
        const time = detailData?.time || movie.time || "N/A";

        return createPortal(
            <div 
                className="fixed z-[9999] rounded-xl overflow-hidden shadow-[0_25px_50px_rgba(0,0,0,0.95)] animate-fade-in ring-1 ring-white/20 group"
                style={{
                    top: topPos - window.scrollY,
                    left: leftPos,
                    width: newWidth,
                    aspectRatio: '4/3',
                    backgroundColor: '#0a0e17'
                }}
                onMouseEnter={handleMouseEnter}
                onMouseLeave={handleMouseLeave}
            >
                {/* 1. ẢNH NỀN */}
                <img 
                    src={backdropUrl} 
                    alt={movie.name} 
                    className="absolute inset-0 w-full h-full object-cover transition-transform duration-[4s] group-hover:scale-110"
                />

                {/* 2. GRADIENT */}
                <div className="absolute inset-0 bg-gradient-to-t from-[#0a0e17] via-[#0a0e17]/80 to-transparent" />

                {/* 3. CONTENT */}
                <div className="absolute inset-0 p-4 flex flex-col justify-end items-start gap-2">
                    
                    <Link to={`/phim/${movie.slug}`} className="block hover:opacity-80 transition w-full">
                        <h3 className="text-white font-black text-xl leading-tight line-clamp-2 drop-shadow-lg text-shadow-md font-sans">
                            {movie.name}
                        </h3>
                        <p className="text-gray-400 text-[10px] font-medium line-clamp-1">{movie.origin_name}</p>
                    </Link>

                    {/* Metadata */}
                    <div className="flex items-center flex-wrap gap-2 text-[10px] font-bold text-gray-300 mt-1">
                        <span className="flex items-center gap-1 text-yellow-400 text-xs font-extrabold shadow-black drop-shadow-md">
                            <FaStar /> {displayRating}
                        </span>
                        
                        <span className="bg-white/10 px-1.5 py-0.5 rounded border border-white/10">
                            {year}
                        </span>
                        <span className="bg-white/10 px-1.5 py-0.5 rounded border border-white/10">
                            {time.replace('phút', 'p')}
                        </span>
                        <span className="bg-red-600 text-white px-1.5 py-0.5 rounded uppercase shadow-sm">
                            {movie.quality || 'HD'}
                        </span>
                    </div>

                    {/* Mô tả */}
                    <p className="text-gray-300 text-[10px] leading-relaxed line-clamp-3 opacity-90 font-medium text-justify">
                        {content || `Phim ${movie.name} chất lượng cao, cập nhật mới nhất tại PhimVietHay.`}
                    </p>

                    {/* Info bổ sung */}
                    <div className="w-full flex flex-col gap-1 mt-1 pt-2 border-t border-white/10">
                        <div className="text-[10px] text-gray-400 line-clamp-1">
                            <span className="text-white font-bold opacity-70">Diễn viên: </span>
                            {actors.length > 0 ? actors.slice(0, 3).join(', ') : 'Đang cập nhật'}
                        </div>
                        <div className="text-[10px] text-gray-400 line-clamp-1">
                            <span className="text-white font-bold opacity-70">Thể loại: </span>
                            {categories.map(c => c.name).slice(0, 3).join(' • ')}
                        </div>
                    </div>

                    {/* Buttons */}
                    <div className="flex items-center gap-2 w-full mt-2">
                        <Link 
                            to={`/xem-phim/${movie.slug}`} 
                            className="flex-1 bg-red-600 text-white py-2 rounded-md font-bold text-xs flex items-center justify-center gap-2 hover:bg-red-700 transition shadow-lg shadow-red-900/30"
                        >
                            <FaPlay size={10} /> Xem
                        </Link>
                        
                        <Link 
                            to={`/phim/${movie.slug}`} 
                            className="flex-1 bg-white/10 text-white py-2 rounded-md font-bold text-xs flex items-center justify-center gap-2 hover:bg-white/20 transition border border-white/20 backdrop-blur-sm"
                        >
                            <FaInfoCircle size={12} /> Chi Tiết
                        </Link>
                    </div>
                </div>
            </div>,
            document.body
        );
    };

    // --- RENDER GỐC ---
    return (
        <>
            <Link 
                ref={cardRef}
                to={`/phim/${movie.slug}`}
                className="relative group cursor-pointer select-none h-full flex flex-col block"
                title={movie.name}
                onMouseEnter={handleMouseEnter} 
                onMouseLeave={handleMouseLeave}
            >
                 <div className="relative w-full aspect-[2/3] rounded-xl overflow-hidden mb-3 bg-[#1a1a1a] shadow-lg transition-all duration-300 group-hover:scale-[1.03] group-hover:shadow-red-900/20 ring-1 ring-white/10 group-hover:ring-red-600">
                    <img src={posterUrl} alt={movie.name} className="w-full h-full object-cover transform group-hover:brightness-75 transition-all duration-500" loading="lazy" decoding="async" />
                    
                    <div className="absolute top-2 left-2"> 
                        <span className="bg-red-600 text-white text-[9px] font-bold px-2 py-0.5 rounded shadow-md uppercase">{movie.quality || 'HD'}</span>
                    </div>
                    <div className="absolute top-2 right-2">
                        <span className="bg-yellow-500 text-black text-[9px] font-bold px-1.5 py-0.5 rounded shadow-md flex items-center gap-1">{displayRating} <FaStar size={8} /></span>
                    </div>
                    <div className="absolute bottom-2 right-2 z-10">
                        <span className="bg-black/60 backdrop-blur-md text-white text-[10px] font-bold px-2 py-0.5 rounded border border-white/10">{movie.episode_current || 'Full'}</span>
                    </div>
                    
                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 scale-75 group-hover:scale-100">
                        <FaPlayCircle className="text-5xl text-white drop-shadow-[0_4px_6px_rgba(0,0,0,0.5)]" />
                    </div>
                </div>
                
                <div className="px-1">
                    <h3 className="font-bold text-sm text-gray-200 line-clamp-1 group-hover:text-red-600 transition-colors">{movie.name}</h3>
                    <div className="flex items-center justify-between text-xs text-gray-500 mt-1">
                        <span className="line-clamp-1 max-w-[70%] truncate" title={movie.origin_name}>{movie.origin_name}</span>
                        <span className="text-gray-400 border border-gray-700 px-1.5 rounded-[4px] bg-[#1a1a1a]">{year}</span>
                    </div>
                </div>
            </Link>

            <MiniHeroPopup />
        </>
    );
});

export default MovieCard;