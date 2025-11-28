import React from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../components/layout/Header';
import { FaGhost, FaHome } from 'react-icons/fa';

const NotFound = () => {
  const navigate = useNavigate();

  return (
    <div className="bg-phim-dark min-h-screen text-white font-sans flex flex-col">
      <Header />
      
      <div className="flex-1 flex flex-col items-center justify-center p-4 text-center">
          <div className="bg-white/5 p-10 rounded-3xl border border-white/10 backdrop-blur-md shadow-2xl transform hover:scale-105 transition duration-500">
              <FaGhost className="text-8xl text-phim-accent mx-auto mb-6 animate-bounce" />
              
              <h1 className="text-6xl font-black text-white mb-2">404</h1>
              <h2 className="text-2xl font-bold text-gray-300 mb-6">Trang không tồn tại</h2>
              
              <p className="text-gray-400 mb-8 max-w-md mx-auto">
                  Có vẻ như bạn đã đi lạc vào vùng đất hoang dã. Đường dẫn này không tồn tại hoặc phim đã bị xóa.
              </p>

              <button 
                onClick={() => navigate('/')}
                className="bg-phim-accent px-8 py-3 rounded-full font-bold flex items-center gap-2 mx-auto hover:bg-red-700 transition shadow-lg shadow-red-900/40"
              >
                  <FaHome /> Quay về Trang Chủ
              </button>
          </div>
      </div>
    </div>
  );
};

export default NotFound;