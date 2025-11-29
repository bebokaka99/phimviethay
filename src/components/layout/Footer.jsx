import React from 'react';
import { FaFacebook, FaTwitter, FaInstagram, FaYoutube, FaHeart } from 'react-icons/fa';

const Footer = () => {
  return (
    <footer className="bg-black border-t border-white/10 pt-16 pb-8 text-gray-400 text-sm font-sans">
      <div className="container mx-auto px-4 md:px-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
            
            {/* Cột 1: Logo & Giới thiệu */}
            <div className="space-y-4">
                <h1 className="text-phim-accent text-3xl font-black tracking-tighter uppercase">
                    PhimViet<span className="text-white">Hay</span>
                </h1>
                <p className="leading-relaxed text-xs">
                    Trải nghiệm xem phim đỉnh cao với chất lượng HD, Vietsub - Thuyết minh nhanh nhất. Kho phim khổng lồ, cập nhật liên tục hàng ngày.
                </p>
                <div className="flex gap-4 pt-2">
                    <FaFacebook className="text-xl hover:text-blue-500 cursor-pointer transition" />
                    <FaTwitter className="text-xl hover:text-sky-400 cursor-pointer transition" />
                    <FaInstagram className="text-xl hover:text-pink-500 cursor-pointer transition" />
                    <FaYoutube className="text-xl hover:text-red-600 cursor-pointer transition" />
                </div>
            </div>

            {/* Cột 2: Danh mục */}
            <div>
                <h3 className="text-white font-bold uppercase tracking-wider mb-6">Danh mục</h3>
                <ul className="space-y-3 text-xs">
                    <li><a href="/danh-sach/phim-moi" className="hover:text-phim-accent transition">Phim Mới</a></li>
                    <li><a href="/danh-sach/phim-bo" className="hover:text-phim-accent transition">Phim Bộ</a></li>
                    <li><a href="/danh-sach/phim-le" className="hover:text-phim-accent transition">Phim Lẻ</a></li>
                    <li><a href="/danh-sach/tv-shows" className="hover:text-phim-accent transition">TV Shows</a></li>
                    <li><a href="/danh-sach/hoat-hinh" className="hover:text-phim-accent transition">Hoạt Hình</a></li>
                </ul>
            </div>

            {/* Cột 3: Điều khoản */}
            <div>
                <h3 className="text-white font-bold uppercase tracking-wider mb-6">Hỗ trợ</h3>
                <ul className="space-y-3 text-xs">
                    <li><a href="#" className="hover:text-phim-accent transition">Điều khoản sử dụng</a></li>
                    <li><a href="#" className="hover:text-phim-accent transition">Chính sách bảo mật</a></li>
                    <li><a href="#" className="hover:text-phim-accent transition">Khiếu nại bản quyền</a></li>
                    <li><a href="#" className="hover:text-phim-accent transition">Liên hệ quảng cáo</a></li>
                </ul>
            </div>

            {/* Cột 4: Tags phổ biến */}
            <div>
                <h3 className="text-white font-bold uppercase tracking-wider mb-6">Từ khóa hot</h3>
                <div className="flex flex-wrap gap-2">
                    {['Hành động', 'Tình cảm', 'Hàn Quốc', 'Anime', 'Kinh dị', 'Hài hước', 'Viễn tưởng'].map(tag => (
                        <span key={tag} className="bg-white/5 px-3 py-1 rounded border border-white/10 text-[10px] hover:bg-phim-accent hover:border-phim-accent hover:text-white cursor-pointer transition">
                            {tag}
                        </span>
                    ))}
                </div>
            </div>
        </div>

        <div className="border-t border-white/10 pt-8 flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-xs">© 2024 PhimVietHay. All rights reserved.</p>
            <p className="text-xs flex items-center gap-1">
                Made with <FaHeart className="text-red-600 animate-pulse" /> by <span className="text-white font-bold">Bebokaka</span>
            </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;