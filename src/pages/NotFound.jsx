import React from 'react';
import { useNavigate } from 'react-router-dom';
import { FaGhost, FaHome } from 'react-icons/fa';

const NotFound = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex flex-col items-center justify-center text-white relative overflow-hidden">
      {/* Background Noise */}
      <div className="absolute inset-0 bg-[#020617] z-0"></div>
      
      <div className="relative z-10 text-center px-4">
        <div className="text-[150px] font-black text-transparent bg-clip-text bg-gradient-to-r from-gray-800 to-gray-600 leading-none select-none animate-pulse">
            404
        </div>
        
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
            <FaGhost className="text-6xl text-red-600 animate-bounce drop-shadow-[0_0_15px_rgba(220,38,38,0.8)]" />
        </div>

        <h2 className="text-3xl font-bold mt-8 mb-2">Oops! Trang này không tồn tại</h2>
        <p className="text-gray-400 mb-8 text-sm max-w-md mx-auto">
            Có vẻ như bạn đã đi lạc vào vùng đất hoang vu của vũ trụ điện ảnh.
        </p>

        <button 
            onClick={() => navigate('/')}
            className="bg-red-600 hover:bg-red-700 text-white px-8 py-3 rounded-full font-bold transition shadow-lg shadow-red-900/20 flex items-center gap-2 mx-auto"
        >
            <FaHome /> Quay về Trụ sở
        </button>
      </div>
    </div>
  );
};

export default NotFound;