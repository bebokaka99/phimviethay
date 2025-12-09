import React, { useEffect, useState } from 'react';
import { FaTrash, FaRobot, FaUserCog, FaClock, FaExternalLinkAlt, FaImage, FaCheckCircle } from 'react-icons/fa';
import { getIntrosList, deleteIntroData } from '../../services/adminService';
import { getMovieDetail } from '../../services/movieService'; // Gọi API lấy info phim
import { Skeleton } from '../../components/common/Skeleton';

const IntroDetailTable = ({ movieSlug }) => {
    const [intros, setIntros] = useState([]);
    const [movieInfo, setMovieInfo] = useState(null); // Info phim (ảnh, tên...)
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);

    // 1. Fetch dữ liệu bảng Intro
    const fetchIntros = async () => {
        // Gọi API với tham số thứ 4 là exactMovie
        const res = await getIntrosList(page, 50, '', movieSlug); 
        if (res && res.data) {
            setIntros(res.data);
            setTotalPages(res.pagination.totalPages);
        }
    };

    // 2. Fetch thông tin phim (để hiển thị Header đẹp)
    const fetchMovieInfo = async () => {
        try {
            const res = await getMovieDetail(movieSlug);
            if (res && res.status && res.movie) {
                setMovieInfo(res.movie);
            }
        } catch (error) {
            console.error("Lỗi lấy info phim");
        }
    };

    useEffect(() => {
        setLoading(true);
        Promise.all([fetchIntros(), fetchMovieInfo()]).finally(() => setLoading(false));
    }, [page, movieSlug]);

    const handleDelete = async (id) => {
        if (window.confirm("Xóa dữ liệu tập này? (Sẽ mất tính năng Skip/Auto Next)")) {
            await deleteIntroData(id);
            fetchIntros(); // Reload bảng
        }
    };

    const formatTime = (seconds) => {
        if (seconds === null || seconds === undefined) return "-";
        const m = Math.floor(seconds / 60).toString().padStart(2, '0');
        const s = (seconds % 60).toString().padStart(2, '0');
        return `${m}:${s}`;
    };

    // Render Header Info
    const renderHeader = () => {
        if (!movieInfo && loading) return <Skeleton className="h-32 w-full rounded-xl mb-6" />;
        
        const poster = movieInfo?.thumb_url || movieInfo?.poster_url;

        return (
            <div className="flex items-start gap-6 bg-[#111] p-6 rounded-xl border border-white/10 mb-6 shadow-lg">
                {/* Ảnh nhỏ bên trái */}
                <div className="w-24 h-36 flex-shrink-0 rounded-lg overflow-hidden border border-white/10 bg-gray-800">
                    {poster ? (
                        <img src={poster} alt="" className="w-full h-full object-cover" />
                    ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-600"><FaImage size={24}/></div>
                    )}
                </div>

                {/* Thông tin chữ */}
                <div className="flex-1">
                    <h2 className="text-2xl font-bold text-white mb-1">{movieInfo?.name || movieSlug}</h2>
                    <p className="text-gray-400 text-sm mb-4">{movieInfo?.origin_name || movieSlug}</p>
                    
                    <div className="flex gap-4 text-sm">
                        <div className="bg-green-900/20 text-green-400 px-3 py-1 rounded border border-green-500/20 flex items-center gap-2">
                            <FaCheckCircle /> 
                            <strong>{intros.length}</strong> tập đã xử lý
                        </div>
                        <div className="text-gray-500 py-1">
                            Tổng số tập gốc: <span className="text-white font-bold">{movieInfo?.episode_current || '?'}</span>
                        </div>
                    </div>
                </div>
            </div>
        );
    };

    return (
        <div>
            {renderHeader()}

            {/* BẢNG DANH SÁCH TẬP */}
            <div className="overflow-x-auto rounded-xl border border-white/10 shadow-xl bg-[#111]">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="bg-white/5 text-gray-400 border-b border-white/10 text-xs uppercase tracking-wider font-bold">
                            <th className="p-4 w-20 text-center">Tập</th>
                            <th className="p-4 text-center">Intro (Start - End)</th>
                            <th className="p-4 text-center">Auto Next (Credit)</th>
                            <th className="p-4 text-center">Nguồn</th>
                            <th className="p-4 text-center">Kiểm tra</th>
                            <th className="p-4 text-center">Xóa</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                        {loading ? (
                            <tr><td colSpan="6" className="p-10 text-center text-gray-500">Đang tải dữ liệu...</td></tr>
                        ) : intros.length > 0 ? (
                            intros.map((item) => (
                                <tr key={item.id} className="hover:bg-white/5 transition-colors">
                                    <td className="p-4 text-center">
                                        <span className="bg-white/10 text-white font-bold px-3 py-1 rounded text-sm min-w-[40px] inline-block">
                                            {item.episode_slug}
                                        </span>
                                    </td>
                                    
                                    <td className="p-4 text-center">
                                        {item.intro_end ? (
                                            <span className="font-mono text-green-400 bg-green-900/20 px-2 py-1 rounded border border-green-500/20 text-xs">
                                                {formatTime(item.intro_start)} ➔ {formatTime(item.intro_end)}
                                            </span>
                                        ) : <span className="text-gray-600">-</span>}
                                    </td>

                                    <td className="p-4 text-center">
                                        {item.credits_start ? (
                                            <span className="font-mono text-purple-400 bg-purple-900/20 px-2 py-1 rounded border border-purple-500/20 text-xs">
                                                <FaClock className="inline mr-1" size={10}/>
                                                {formatTime(item.credits_start)}
                                            </span>
                                        ) : <span className="text-gray-600">-</span>}
                                    </td>

                                    <td className="p-4 text-center">
                                        {item.source === 'ADMIN' ? (
                                            <span className="text-red-500 text-[10px] font-bold border border-red-500/30 px-2 py-0.5 rounded bg-red-500/10">ADMIN</span>
                                        ) : (
                                            <span className="text-blue-500 text-[10px] font-bold border border-blue-500/30 px-2 py-0.5 rounded bg-blue-500/10">AI</span>
                                        )}
                                    </td>

                                    <td className="p-4 text-center">
                                        <a 
                                            href={`/xem-phim/${item.movie_slug}?tap=${item.episode_slug}`} // Lưu ý check lại route xem phim của bạn
                                            target="_blank" 
                                            rel="noreferrer"
                                            className="inline-flex p-2 text-blue-400 hover:text-white hover:bg-blue-600 rounded transition-all"
                                            title="Xem thử"
                                        >
                                            <FaExternalLinkAlt size={14} />
                                        </a>
                                    </td>

                                    <td className="p-4 text-center">
                                        <button 
                                            onClick={() => handleDelete(item.id)} 
                                            className="p-2 text-gray-500 hover:text-red-500 hover:bg-red-500/10 rounded transition-all"
                                            title="Xóa"
                                        >
                                            <FaTrash size={14} />
                                        </button>
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan="6" className="p-10 text-center text-gray-500">
                                    Không tìm thấy dữ liệu tập nào cho phim này.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default IntroDetailTable;