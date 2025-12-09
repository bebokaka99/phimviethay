import React, { useEffect, useState } from 'react';
import axios from '../../services/axiosConfig';
import { FaFilm, FaSearch, FaArrowLeft, FaDatabase, FaPlayCircle, FaForward, FaChevronLeft, FaChevronRight } from 'react-icons/fa';
import MovieStatRow from '../../components/admin/MovieStatRow'; // Import Component mới
import IntroDetailTable from './IntroDetailTable';

// Component con: Thẻ thống kê nhỏ
const StatCard = ({ title, value, icon, color }) => (
    <div className="bg-[#111] border border-white/10 p-4 rounded-xl flex items-center gap-4 shadow-lg">
        <div className={`w-12 h-12 rounded-full flex items-center justify-center text-xl bg-${color}-900/20 text-${color}-500`}>
            {icon}
        </div>
        <div>
            <div className="text-gray-400 text-xs uppercase font-bold tracking-wider">{title}</div>
            <div className="text-2xl font-bold text-white">{value.toLocaleString()}</div>
        </div>
    </div>
);

const Intros = () => {
    const [viewMode, setViewMode] = useState('LIST');
    const [selectedMovieSlug, setSelectedMovieSlug] = useState(null);

    const [data, setData] = useState({ data: [], summary: {}, pagination: {} });
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [page, setPage] = useState(1);

    const fetchData = async () => {
        setLoading(true);
        try {
            const res = await axios.get('/analytics/admin/movies-stats', { 
                params: { search, page, limit: 10 } 
            });
            setData(res.data);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (viewMode === 'LIST') fetchData();
    }, [viewMode, search, page]);

    const handleSelectMovie = (slug) => {
        setSelectedMovieSlug(slug);
        setViewMode('DETAIL');
    };

    const handleBack = () => {
        setSelectedMovieSlug(null);
        setViewMode('LIST');
        fetchData();
    };

    // --- VIEW CHI TIẾT (Giữ nguyên) ---
    if (viewMode === 'DETAIL') {
        return (
            <div className="p-6 bg-[#1a1a1a] min-h-screen text-white rounded-xl">
                <button onClick={handleBack} className="mb-6 flex items-center gap-2 text-gray-400 hover:text-white transition px-4 py-2 rounded-lg hover:bg-white/5">
                    <FaArrowLeft /> Quay lại danh sách phim
                </button>
                <IntroDetailTable movieSlug={selectedMovieSlug} />
            </div>
        );
    }

    // --- VIEW DANH SÁCH (Cập nhật) ---
    const { summary, pagination } = data;

    return (
        <div className="p-6 bg-[#1a1a1a] min-h-screen text-white rounded-xl font-sans">
            {/* 1. HEADER & STATS */}
            <div className="mb-8">
                <h2 className="text-2xl font-bold flex items-center gap-2 text-red-500 mb-6">
                    <FaFilm /> Dashboard Intro & Ending
                </h2>
                
                {/* Khu vực thống kê tổng quan */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                    <StatCard 
                        title="Phim đã có data" 
                        value={summary?.total_movies || 0} 
                        icon={<FaDatabase />} 
                        color="blue" 
                    />
                    <StatCard 
                        title="Tổng số tập" 
                        value={summary?.total_episodes || 0} 
                        icon={<FaPlayCircle />} 
                        color="yellow" 
                    />
                    <StatCard 
                        title="Đoạn Intro" 
                        value={summary?.total_intros || 0} 
                        icon={<FaForward />} 
                        color="green" 
                    />
                    <StatCard 
                        title="Auto Next" 
                        value={summary?.total_credits || 0} 
                        icon={<FaForward className="rotate-180" />} 
                        color="purple" 
                    />
                </div>

                {/* Toolbar Tìm kiếm */}
                <div className="flex justify-between items-center bg-[#111] p-4 rounded-xl border border-white/10">
                    <div className="text-sm font-bold text-gray-400">
                        Danh sách phim ({summary?.total_movies || 0})
                    </div>
                    <div className="relative">
                        <input 
                            type="text" 
                            placeholder="Tìm tên phim (Slug)..." 
                            className="bg-[#0a0a0a] border border-white/20 rounded-lg pl-10 pr-4 py-2 text-sm w-64 focus:border-red-500 focus:outline-none transition-colors text-white placeholder-gray-600"
                            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                        />
                        <FaSearch className="absolute left-3 top-2.5 text-gray-500 text-xs" />
                    </div>
                </div>
            </div>

            {/* 2. BẢNG DANH SÁCH (TABLE VIEW) */}
            <div className="overflow-x-auto rounded-xl border border-white/10 shadow-xl bg-[#111]">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="bg-white/5 text-gray-400 border-b border-white/10 text-[11px] uppercase tracking-wider font-bold">
                            <th className="p-4">Poster</th>
                            <th className="p-4">Thông tin phim</th>
                            <th className="p-4 text-center">Số Intro</th>
                            <th className="p-4 text-center">Số Auto Next</th>
                            <th className="p-4 text-center">Cập nhật cuối</th>
                            <th className="p-4 text-center">Thao tác</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                        {loading ? (
                            <tr><td colSpan="6" className="p-10 text-center text-gray-500">Đang tải dữ liệu...</td></tr>
                        ) : data.data.length > 0 ? (
                            data.data.map((stat) => (
                                <MovieStatRow 
                                    key={stat.movie_slug} 
                                    stats={stat} 
                                    onClick={() => handleSelectMovie(stat.movie_slug)} 
                                />
                            ))
                        ) : (
                            <tr>
                                <td colSpan="6" className="p-10 text-center text-gray-500">
                                    Chưa có dữ liệu nào. Hãy bắt đầu sử dụng God Mode!
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            {/* 3. PHÂN TRANG */}
            {pagination.totalPages > 1 && (
                <div className="flex justify-center mt-6 gap-2">
                    <button 
                        onClick={() => setPage(p => Math.max(1, p - 1))}
                        disabled={page === 1}
                        className="p-2 bg-white/5 hover:bg-white/10 rounded-lg disabled:opacity-30 disabled:cursor-not-allowed transition text-white"
                    >
                        <FaChevronLeft />
                    </button>
                    <span className="flex items-center px-4 bg-white/5 rounded-lg text-sm font-bold text-gray-300">
                        Trang {page} / {pagination.totalPages}
                    </span>
                    <button 
                        onClick={() => setPage(p => Math.min(pagination.totalPages, p + 1))}
                        disabled={page === pagination.totalPages}
                        className="p-2 bg-white/5 hover:bg-white/10 rounded-lg disabled:opacity-30 disabled:cursor-not-allowed transition text-white"
                    >
                        <FaChevronRight />
                    </button>
                </div>
            )}
        </div>
    );
};

export default Intros;