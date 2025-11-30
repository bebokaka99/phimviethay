import React from 'react';
import Logo from '../common/Logo';
import { FaFacebook, FaTwitter, FaInstagram, FaYoutube, FaHeart } from 'react-icons/fa';

const Footer = () => {
  return (
    // Sửa bg-black thành bg-transparent hoặc gradient nhẹ
    <footer className="bg-gradient-to-t from-black/80 via-black/40 to-transparent border-t border-white/5 pt-16 pb-8 text-gray-400 text-sm font-sans backdrop-blur-sm mt-10">
      <div className="container mx-auto px-4 md:px-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
            
            {/* Cột 1: Logo & Giới thiệu */}
            <div className="space-y-4">
                <div className="scale-90 origin-left">
                    <Logo />
                </div>
                <p className="leading-relaxed text-xs text-gray-400">
                    Trải nghiệm xem phim đỉnh cao với chất lượng HD, Vietsub - Thuyết minh nhanh nhất. Kho phim khổng lồ, cập nhật liên tục hàng ngày.
                </p>
                <div className="flex gap-4 pt-2">
                    <FaFacebook className="text-xl hover:text-blue-500 cursor-pointer transition hover:scale-110" />
                    <FaTwitter className="text-xl hover:text-sky-400 cursor-pointer transition hover:scale-110" />
                    <FaInstagram className="text-xl hover:text-pink-500 cursor-pointer transition hover:scale-110" />
                    <FaYoutube className="text-xl hover:text-red-600 cursor-pointer transition hover:scale-110" />
                </div>
            </div>

            {/* Cột 2: Danh mục */}
            <div>
                <h3 className="text-white font-bold uppercase tracking-wider mb-6 text-xs border-b border-red-600 inline-block pb-1">Danh mục</h3>
                <ul className="space-y-2 text-xs">
                    <li><a href="/danh-sach/phim-moi" className="hover:text-phim-accent transition flex items-center gap-2"><span className="w-1 h-1 bg-red-600 rounded-full"></span> Phim Mới</a></li>
                    <li><a href="/danh-sach/phim-bo" className="hover:text-phim-accent transition flex items-center gap-2"><span className="w-1 h-1 bg-red-600 rounded-full"></span> Phim Bộ</a></li>
                    <li><a href="/danh-sach/phim-le" className="hover:text-phim-accent transition flex items-center gap-2"><span className="w-1 h-1 bg-red-600 rounded-full"></span> Phim Lẻ</a></li>
                    <li><a href="/danh-sach/tv-shows" className="hover:text-phim-accent transition flex items-center gap-2"><span className="w-1 h-1 bg-red-600 rounded-full"></span> TV Shows</a></li>
                    <li><a href="/danh-sach/hoat-hinh" className="hover:text-phim-accent transition flex items-center gap-2"><span className="w-1 h-1 bg-red-600 rounded-full"></span> Hoạt Hình</a></li>
                </ul>
            </div>

            {/* Cột 3: Thông tin */}
            <div>
                <h3 className="text-white font-bold uppercase tracking-wider mb-6 text-xs border-b border-red-600 inline-block pb-1">Thông tin</h3>
                <ul className="space-y-2 text-xs">
                    <li><a href="#" className="hover:text-phim-accent transition">Điều khoản sử dụng</a></li>
                    <li><a href="#" className="hover:text-phim-accent transition">Chính sách riêng tư</a></li>
                    <li><a href="#" className="hover:text-phim-accent transition">Khiếu nại bản quyền</a></li>
                    <li><a href="#" className="hover:text-phim-accent transition">Liên hệ quảng cáo</a></li>
                </ul>
            </div>

            {/* Cột 4: Tags */}
            <div>
                <h3 className="text-white font-bold uppercase tracking-wider mb-6 text-xs border-b border-red-600 inline-block pb-1">Từ khóa nổi bật</h3>
                <div className="flex flex-wrap gap-2">
                    {['Hành động', 'Tình cảm', 'Hàn Quốc', 'Anime', 'Kinh dị', 'Hài hước', 'Viễn tưởng', 'Học đường', 'Chiến tranh'].map(tag => (
                        <span key={tag} className="bg-white/5 px-2 py-1 rounded border border-white/10 text-[10px] hover:bg-red-600 hover:border-red-600 hover:text-white cursor-pointer transition">
                            {tag}
                        </span>
                    ))}
                </div>
            </div>
        </div>

        <div className="border-t border-white/5 pt-8 flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-[10px] text-gray-500">© 2024 PhimVietHay. All rights reserved.</p>
            <p className="text-[10px] text-gray-500 flex items-center gap-1">
                Made with <FaHeart className="text-red-600 animate-pulse" /> by <span className="text-white font-bold">Bebokaka</span>
            </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;