import React from 'react';
import Logo from '../common/Logo';
import { FaFacebook, FaTwitter, FaInstagram, FaYoutube, FaHeart } from 'react-icons/fa';

const Footer = () => {
  return (
    // Nền trong suốt với gradient rất nhẹ từ dưới lên
    <footer className="relative mt-20 border-t border-white/5 pt-16 pb-8 text-gray-400 text-sm font-sans">
      {/* Background Glow */}
      <div className="absolute inset-0 bg-gradient-to-t from-black via-[#0a0e17] to-transparent -z-10 pointer-events-none" />

      <div className="container mx-auto px-4 md:px-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10 lg:gap-16 mb-12">
            
            {/* Cột 1: Brand */}
            <div className="space-y-5">
                <div className="scale-90 origin-left opacity-90 hover:opacity-100 transition duration-300">
                    <Logo />
                </div>
                <p className="text-xs leading-6 text-gray-500 text-justify">
                    <span className="text-white font-bold">PhimVietHay</span> - Nền tảng xem phim trực tuyến miễn phí chất lượng cao. Cập nhật liên tục các bộ phim mới nhất, hot nhất thị trường với tốc độ tải trang siêu nhanh.
                </p>
                <div className="flex gap-4 pt-2">
                    <a href="#" className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center hover:bg-blue-600 hover:text-white transition-all duration-300 group"><FaFacebook className="group-hover:scale-110 transition"/></a>
                    <a href="#" className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center hover:bg-sky-500 hover:text-white transition-all duration-300 group"><FaTwitter className="group-hover:scale-110 transition"/></a>
                    <a href="#" className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center hover:bg-pink-600 hover:text-white transition-all duration-300 group"><FaInstagram className="group-hover:scale-110 transition"/></a>
                    <a href="#" className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center hover:bg-red-600 hover:text-white transition-all duration-300 group"><FaYoutube className="group-hover:scale-110 transition"/></a>
                </div>
            </div>

            {/* Cột 2: Khám phá */}
            <div>
                <h3 className="text-white font-bold uppercase text-xs tracking-widest mb-6 relative inline-block after:content-[''] after:absolute after:-bottom-2 after:left-0 after:w-8 after:h-0.5 after:bg-red-600">Khám phá</h3>
                <ul className="space-y-3 text-xs font-medium">
                    <li><a href="/danh-sach/phim-moi" className="hover:text-red-500 transition-colors flex items-center gap-2 group"><span className="w-1 h-1 bg-gray-600 rounded-full group-hover:bg-red-500 transition-colors"></span> Phim chiếu rạp mới</a></li>
                    <li><a href="/danh-sach/phim-bo" className="hover:text-red-500 transition-colors flex items-center gap-2 group"><span className="w-1 h-1 bg-gray-600 rounded-full group-hover:bg-red-500 transition-colors"></span> Phim bộ độc quyền</a></li>
                    <li><a href="/danh-sach/phim-le" className="hover:text-red-500 transition-colors flex items-center gap-2 group"><span className="w-1 h-1 bg-gray-600 rounded-full group-hover:bg-red-500 transition-colors"></span> Phim lẻ hành động</a></li>
                    <li><a href="/danh-sach/tv-shows" className="hover:text-red-500 transition-colors flex items-center gap-2 group"><span className="w-1 h-1 bg-gray-600 rounded-full group-hover:bg-red-500 transition-colors"></span> TV Shows hấp dẫn</a></li>
                    <li><a href="/danh-sach/hoat-hinh" className="hover:text-red-500 transition-colors flex items-center gap-2 group"><span className="w-1 h-1 bg-gray-600 rounded-full group-hover:bg-red-500 transition-colors"></span> Anime & Hoạt hình</a></li>
                </ul>
            </div>

            {/* Cột 3: Hỗ trợ */}
            <div>
                <h3 className="text-white font-bold uppercase text-xs tracking-widest mb-6 relative inline-block after:content-[''] after:absolute after:-bottom-2 after:left-0 after:w-8 after:h-0.5 after:bg-red-600">Hỗ trợ</h3>
                <ul className="space-y-3 text-xs font-medium">
                    <li><a href="#" className="hover:text-white transition-colors">Điều khoản sử dụng</a></li>
                    <li><a href="#" className="hover:text-white transition-colors">Chính sách bảo mật</a></li>
                    <li><a href="#" className="hover:text-white transition-colors">Khiếu nại bản quyền</a></li>
                    <li><a href="#" className="hover:text-white transition-colors">Liên hệ quảng cáo</a></li>
                    <li><a href="#" className="hover:text-white transition-colors">Câu hỏi thường gặp</a></li>
                </ul>
            </div>

            {/* Cột 4: Trending Tags */}
            <div>
                <h3 className="text-white font-bold uppercase text-xs tracking-widest mb-6 relative inline-block after:content-[''] after:absolute after:-bottom-2 after:left-0 after:w-8 after:h-0.5 after:bg-red-600">Từ khóa hot</h3>
                <div className="flex flex-wrap gap-2">
                    {['Hành động', 'Marvel', 'Hàn Quốc', 'Anime', 'Kinh dị', 'Netflix', 'Hài hước', 'Tình cảm', 'Học đường', 'DC'].map(tag => (
                        <span key={tag} className="bg-white/5 border border-white/5 px-2.5 py-1 rounded-md text-[10px] font-bold text-gray-400 hover:text-white hover:bg-red-600 hover:border-red-600 cursor-pointer transition-all duration-300">
                            #{tag}
                        </span>
                    ))}
                </div>
            </div>
        </div>

        <div className="border-t border-white/5 pt-8 flex flex-col md:flex-row items-center justify-between gap-4 opacity-60 hover:opacity-100 transition-opacity">
            <p className="text-[10px] text-gray-500">Copyright © 2026 PhimVietHay. All rights reserved.</p>
            <p className="text-[10px] text-gray-500 flex items-center gap-1">
                
            </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;