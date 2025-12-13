import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FaPlay, FaInfoCircle, FaStar } from 'react-icons/fa';
import { IMG_URL, getMovieDetail } from '../../services/movieService';

const HeroSection = ({ movies }) => {
    const [currentIndex, setCurrentIndex] = useState(0);
    const [heroMovies, setHeroMovies] = useState([]);

    // --- GIỮ NGUYÊN LOGIC CŨ 100% (START) ---
    useEffect(() => {
        const fetchHighQualityImages = async () => {
            if (!movies || movies.length === 0) return;
            const top5 = movies.slice(0, 5);
            const updatedMovies = await Promise.all(top5.map(async (movie) => {
                try {
                    const data = await getMovieDetail(movie.slug);
                    if (data?.status && data?.movie) {
                        return {
                            ...movie,
                            poster_url: data.movie.poster_url,
                            tmdb: data.movie.tmdb,
                            content: data.movie.content
                        };
                    }
                    return movie;
                } catch (e) { return movie; }
            }));
            setHeroMovies(updatedMovies);
        };
        fetchHighQualityImages();
    }, [movies]);

    useEffect(() => {
        if (heroMovies.length === 0) return;
        const interval = setInterval(() => {
            setCurrentIndex(prev => (prev === heroMovies.length - 1 ? 0 : prev + 1));
        }, 8000);
        return () => clearInterval(interval);
    }, [currentIndex, heroMovies]);

    const stripHtml = (html) => {
        if (!html) return "";
        return html.replace(/<[^>]*>?/gm, '');
    };
    // --- GIỮ NGUYÊN LOGIC CŨ 100% (END) ---

    if (heroMovies.length === 0) return null;

    // Helper tạo link ảnh tối ưu
    const getOptimizedImg = (url, isMobile = false) => {
        if (!url) return '';
        if (url.includes('http') && !url.includes('image.tmdb.org')) return url;
        const cleanPath = url.replace(IMG_URL, '');
        const size = isMobile ? 'w780' : 'original';
        return `https://image.tmdb.org/t/p/${size}${cleanPath}`;
    };

    return (
        // [MOBILE]: h-[60vh] là tỷ lệ đẹp để chứa đủ ảnh + 3 dòng mô tả mà không bị chật
        <div className="relative h-[60vh] md:h-[700px] w-full text-white overflow-hidden group bg-[#0a0e17]">
            
            {heroMovies.map((movie, index) => {
                const isActive = index === currentIndex;
                const shouldRender = Math.abs(index - currentIndex) <= 1 || (currentIndex === heroMovies.length - 1 && index === 0);
                
                if (!shouldRender) return null;

                const rawBackdrop = movie.poster_url || movie.thumb_url;
                const mobileImg = getOptimizedImg(rawBackdrop, true);
                const desktopImg = movie.poster_url && movie.poster_url.includes('http') 
                                    ? movie.poster_url 
                                    : `${IMG_URL}${movie.poster_url || movie.thumb_url}`;
                
                const posterThumb = `${IMG_URL}${movie.thumb_url}`;
                const ratingValue = movie.tmdb?.vote_average || movie.vote_average || 0;
                const displayRating = ratingValue > 0 ? ratingValue.toFixed(1) : 'N/A';

                return (
                    <div 
                        key={movie._id}
                        className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${isActive ? 'opacity-100 z-10' : 'opacity-0 z-0'}`}
                    >
                        {/* 1. BACKGROUND IMAGE */}
                        <div className="absolute inset-0">
                             <img 
                                src={desktopImg}
                                srcSet={`${mobileImg} 768w, ${desktopImg} 1280w`}
                                alt={movie.name}
                                // object-top: Luôn lấy phần trên của ảnh (thường là mặt diễn viên)
                                className="w-full h-full object-cover object-top"
                                loading={index === 0 ? "eager" : "lazy"} 
                            />
                            {/* Gradient Overlay: Mobile đậm hơn ở dưới (80%) để chữ trắng nổi bật */}
                            <div className="absolute inset-0 bg-gradient-to-t from-[#0a0e17] via-[#0a0e17]/40 to-transparent md:bg-gradient-to-r md:from-[#0a0e17] md:via-[#0a0e17]/60 md:to-transparent" />
                        </div>

                        {/* 2. NỘI DUNG CHÍNH */}
                        <div className="absolute inset-0 flex items-center justify-center pb-6 md:pb-0">
                            <div className="w-full max-w-[1500px] mx-auto px-4 md:px-16 flex flex-col md:flex-row items-end md:items-center justify-between gap-8 md:gap-12 h-full md:h-auto">
                                
                                {/* Cột trái: Thông tin phim */}
                                {/* Mobile: flex-col justify-end để đẩy nội dung xuống đáy */}
                                <div className="w-full md:w-[60%] space-y-2 md:space-y-6 z-10 animate-fade-up-custom flex flex-col justify-end h-full md:h-auto pb-4 md:pb-0">
                                    
                                    <Link to={`/phim/${movie.slug}`} className="block hover:opacity-80 transition group/title">
                                        {/* [FIX MOBILE]: line-clamp-2 (tối đa 2 dòng tên phim) */}
                                        <h1 className="text-2xl md:text-5xl font-black leading-tight drop-shadow-2xl text-transparent bg-clip-text bg-gradient-to-r from-white to-gray-300 py-1 line-clamp-2 md:line-clamp-none">
                                            {movie.name}
                                        </h1>
                                        {/* Mobile: Ẩn tên gốc cho đỡ rối */}
                                        <p className="hidden md:block text-lg text-gray-400 italic font-medium mt-1">{movie.origin_name}</p>
                                    </Link>

                                    {/* Meta Data */}
                                    <div className="flex flex-wrap items-center gap-2 md:gap-3 text-xs md:text-base font-medium text-gray-200">
                                        <span className="flex items-center gap-1 text-yellow-400 font-bold text-sm md:text-lg">
                                            <FaStar /> {displayRating}
                                        </span>
                                        <span className="bg-white/10 border border-white/10 px-2 py-0.5 md:px-3 md:py-1 rounded">
                                            {movie.year}
                                        </span>
                                        <span className="bg-red-600 px-2 py-0.5 md:px-3 md:py-1 rounded text-white font-bold uppercase tracking-wider shadow-lg shadow-red-900/40 text-[10px] md:text-sm">
                                            {movie.quality || 'HD'}
                                        </span>
                                        <span className="text-gray-300 border border-gray-500 px-2 py-0.5 md:px-3 md:py-1 rounded uppercase text-[10px] md:text-sm">
                                            {movie.lang}
                                        </span>
                                    </div>

                                    {/* [FIX MOBILE]: line-clamp-3 (Hiện mô tả nhưng tối đa 3 dòng) */}
                                    <p className="text-gray-300 text-xs md:text-lg line-clamp-3 md:line-clamp-4 leading-relaxed max-w-xl drop-shadow-md opacity-90">
                                        {stripHtml(movie.content) || `Trải nghiệm điện ảnh đỉnh cao với ${movie.name}.`}
                                    </p>

                                    {/* Buttons */}
                                    <div className="flex items-center gap-3 md:gap-4 w-full md:w-auto pt-2">
                                        <Link 
                                            to={`/xem-phim/${movie.slug}`} 
                                            className="flex-1 md:flex-none bg-red-600 text-white px-4 py-3 md:px-10 md:py-4 rounded-xl hover:bg-red-700 transition font-bold flex items-center justify-center gap-2 md:gap-3 shadow-xl shadow-red-900/40 active:scale-95 text-sm md:text-lg"
                                        >
                                            <FaPlay /> XEM NGAY
                                        </Link>
                                        
                                        <Link 
                                            to={`/phim/${movie.slug}`} 
                                            className="flex-1 md:flex-none bg-white/10 text-white px-4 py-3 md:px-10 md:py-4 rounded-xl hover:bg-white/20 transition backdrop-blur-md font-bold flex items-center justify-center gap-2 md:gap-3 border border-white/20 active:scale-95 text-sm md:text-lg"
                                        >
                                            <FaInfoCircle /> CHI TIẾT
                                        </Link>
                                    </div>
                                </div>

                                {/* Cột phải: Poster (Chỉ hiện trên desktop - GIỮ NGUYÊN) */}
                                <div className="hidden md:flex w-full md:w-[40%] justify-end relative z-10 animate-poster-custom pr-8">
                                    <Link 
                                        to={`/phim/${movie.slug}`}
                                        className="block w-[280px] aspect-[2/3] rounded-2xl overflow-hidden shadow-[0_20px_50px_rgba(0,0,0,0.6)] border border-white/10 transform rotate-3 hover:rotate-0 transition duration-700 ease-out group-hover:scale-105"
                                    >
                                        
                                        <img src={posterThumb} alt={movie.name} className="w-full h-full object-cover" />
                                    </Link>
                                </div>
                            </div>
                        </div>
                    </div>
                );
            })}

            {/* Thumbnail Navigation (PC Only) */}
            <div className="absolute bottom-8 right-12 z-20 hidden xl:flex items-center gap-3">
                {heroMovies.map((m, idx) => {
                    let thumbWide = `${IMG_URL}${m.poster_url || m.thumb_url}`;
                    if (m.poster_url && m.poster_url.includes('http')) thumbWide = m.poster_url;
                    const isActive = idx === currentIndex;
                    return (
                        <div
                            key={m._id}
                            onClick={() => setCurrentIndex(idx)}
                            className={`relative w-24 h-14 rounded-md overflow-hidden cursor-pointer transition-all duration-300 ease-out ${
                                isActive ? 'scale-110 -translate-y-1 shadow-lg border border-white/50 z-10 opacity-100' : 'opacity-60 hover:opacity-100 hover:scale-105 grayscale hover:grayscale-0 border border-white/10'
                            }`}
                        >
                            <img src={thumbWide} alt="" className="w-full h-full object-cover" />
                            {isActive && <div className="absolute bottom-0 left-0 h-[3px] bg-red-600 z-20" style={{ width: '100%', animation: 'loadingBar 8s linear infinite' }} />}
                        </div>
                    );
                })}
            </div>
            <style>{`@keyframes loadingBar { from { width: 0%; } to { width: 100%; } }`}</style>
        </div>
    );
};

export default HeroSection;