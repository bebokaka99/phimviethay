import React, { useEffect, useState } from 'react';
import { getMovieDetail } from '../../services/movieService'; 
import { FaEdit, FaImage, FaCheck, FaTimes } from 'react-icons/fa';

const MovieStatRow = ({ stats, onClick }) => {
    const [movie, setMovie] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchMeta = async () => {
            try {
                const res = await getMovieDetail(stats.movie_slug);
                if (res && res.status && res.movie) {
                    setMovie(res.movie);
                } else {
                    setMovie({ name: stats.movie_slug, origin_name: 'Unknown', thumb_url: '' });
                }
            } catch (error) {
                console.error("Lỗi info phim");
            } finally {
                setLoading(false);
            }
        };
        fetchMeta();
    }, [stats.movie_slug]);

    // Format ngày giờ
    const lastUpdate = new Date(stats.last_update).toLocaleDateString('vi-VN', {
        day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit'
    });

    if (loading) {
        return (
            <tr className="border-b border-white/5 animate-pulse">
                <td className="p-4"><div className="h-12 w-12 bg-white/10 rounded"></div></td>
                <td className="p-4"><div className="h-4 w-32 bg-white/10 rounded mb-2"></div><div className="h-3 w-20 bg-white/10 rounded"></div></td>
                <td colSpan="5" className="p-4"></td>
            </tr>
        );
    }

    const posterSrc = movie?.thumb_url || movie?.poster_url;

    return (
        <tr className="border-b border-white/5 hover:bg-white/5 transition-colors">
            {/* 1. Ảnh Bìa */}
            <td className="p-3 w-20">
                <div className="w-12 h-16 rounded overflow-hidden bg-gray-800 relative">
                    {posterSrc ? (
                        <img src={posterSrc} alt="" className="w-full h-full object-cover" />
                    ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-600"><FaImage/></div>
                    )}
                </div>
            </td>

            {/* 2. Tên Phim */}
            <td className="p-3 max-w-xs">
                <div className="font-bold text-white text-sm truncate" title={movie?.name}>{movie?.name || stats.movie_slug}</div>
                <div className="text-gray-500 text-xs truncate" title={movie?.origin_name}>{movie?.origin_name}</div>
                <div className="text-gray-600 text-[10px] mt-1 font-mono">{stats.movie_slug}</div>
            </td>

            {/* 3. Thống kê Intro */}
            <td className="p-3 text-center">
                <div className="inline-flex flex-col items-center">
                    <span className="text-lg font-bold text-green-400">{stats.count_intro}</span>
                    <span className="text-[10px] text-gray-500 uppercase">Intro</span>
                </div>
            </td>

            {/* 4. Thống kê Auto Next */}
            <td className="p-3 text-center">
                <div className="inline-flex flex-col items-center">
                    <span className="text-lg font-bold text-purple-400">{stats.count_credits}</span>
                    <span className="text-[10px] text-gray-500 uppercase">Auto Next</span>
                </div>
            </td>

            {/* 5. Cập nhật cuối */}
            <td className="p-3 text-center text-xs text-gray-400">
                <div>{lastUpdate}</div>
                <div className="mt-1 inline-block px-1.5 py-0.5 rounded bg-white/10 text-[10px]">{stats.last_source}</div>
            </td>

            {/* 6. Hành động */}
            <td className="p-3 text-center">
                <button 
                    onClick={onClick}
                    className="px-4 py-2 bg-red-600/10 hover:bg-red-600 text-red-500 hover:text-white rounded-lg text-xs font-bold transition-all flex items-center gap-2 mx-auto border border-red-600/20"
                >
                    <FaEdit /> Chi tiết
                </button>
            </td>
        </tr>
    );
};

export default MovieStatRow;