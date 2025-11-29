import React from 'react';
// Import ảnh từ thư mục assets
import logoImg from '../../assets/logo.png';

const Logo = () => {
  return (
    <div className="cursor-pointer select-none group">
      <img 
        src={logoImg} 
        alt="PhimVietHay Logo" 
        // Class chỉnh kích thước:
        // h-10 (40px) trên mobile, h-12 (48px) trên máy tính
        // w-auto: Chiều rộng tự động theo tỉ lệ
        // object-contain: Đảm bảo ảnh không bị méo
        className="h-10 md:h-14 w-auto object-contain transition-transform duration-300 group-hover:scale-105 drop-shadow-lg"
      />
    </div>
  );
};

export default Logo;