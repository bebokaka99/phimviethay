import React from 'react';
import { useNavigate } from 'react-router-dom';
import { FaHome, FaSearch, FaVideoSlash } from 'react-icons/fa';

const NotFound = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center relative overflow-hidden font-sans">
      
      {/* 1. Cinematic Background Effect */}
      {/* Hiệu ứng đèn chiếu Spotlight từ trên cao xuống */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full max-w-4xl bg-gradient-to-b from-white/10 via-transparent to-transparent opacity-50 pointer-events-none blur-3xl"></div>
      
      {/* Hiệu ứng nhiễu hạt (Film Grain - giả lập bằng CSS) */}
      <div className="absolute inset-0 opacity-[0.03] pointer-events-none" style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")` }}></div>

      <div className="relative z-10 text-center px-6 max-w-2xl">
        
        {/* 2. Main Icon (Broken Film) */}
        <div className="mb-8 relative inline-block">
            <div className="absolute inset-0 bg-red-600 blur-[60px] opacity-20 rounded-full animate-pulse-slow"></div>
            <FaVideoSlash className="text-8xl md:text-9xl text-gray-800 drop-shadow-[0_0_15px_rgba(255,255,255,0.1)] relative z-10" />
            <div className="absolute -bottom-2 -right-2 bg-red-600 text-black font-black text-xl px-3 py-1 rounded rotate-[-10deg] border-2 border-white/20">
                404
            </div>
        </div>

        {/* 3. Cinematic Text */}
        <h1 className="text-4xl md:text-6xl font-black mb-4 tracking-tighter text-transparent bg-clip-text bg-gradient-to-r from-gray-100 to-gray-500 uppercase">
            CẮT! <span className="text-red-600">Dừng Quay!</span>
        </h1>
        
        <p className="text-lg md:text-xl text-gray-400 mb-2 font-medium">
            Cảnh quay này không có trong kịch bản.
        </p>
        <p className="text-sm text-gray-600 mb-10 max-w-md mx-auto leading-relaxed">
            Đạo diễn không tìm thấy trang bạn yêu cầu. Có thể phim đã bị xóa, đường dẫn bị sai, hoặc bạn đã đi lạc vào hậu trường.
        </p>

        {/* 4. Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <button 
                onClick={() => navigate('/')}
                className="w-full sm:w-auto bg-red-600 hover:bg-red-700 text-white px-8 py-3.5 rounded-full font-bold transition shadow-[0_0_20px_rgba(220,38,38,0.4)] hover:shadow-[0_0_30px_rgba(220,38,38,0.6)] flex items-center justify-center gap-2 transform active:scale-95"
            >
                <FaHome /> Trở về Rạp Chính
            </button>
            
            <button 
                onClick={() => navigate('/tim-kiem')}
                className="w-full sm:w-auto bg-white/5 hover:bg-white/10 text-gray-300 hover:text-white px-8 py-3.5 rounded-full font-bold transition border border-white/10 flex items-center justify-center gap-2 backdrop-blur-sm"
            >
                <FaSearch /> Tìm phim khác
            </button>
        </div>

        {/* 5. Footer Decor */}
        <div className="mt-16 pt-8 border-t border-white/5">
            <p className="text-[10px] text-gray-700 uppercase tracking-[0.2em]">
                PhimVietHay Production &copy; {new Date().getFullYear()}
            </p>
        </div>
      </div>
    </div>
  );
};

export default NotFound;