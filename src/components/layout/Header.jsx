import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import {
    FaSearch, FaChevronDown, FaTimes, FaBars, FaHistory, FaUser,
    FaHeart, FaSignOutAlt, FaFilm, FaChartBar, FaCrown, FaShieldAlt,
    FaGlobeAsia, FaLayerGroup, FaStar, FaHome, FaListUl
} from 'react-icons/fa';
import { getMenuData, searchMovies } from '../../services/movieService';
import { useDebounce } from '../../hooks/useDebounce';
import { getCurrentUser, logout } from '../../services/authService';
import Logo from '../common/Logo';
import UserAvatar from '../common/UserAvatar';

const Header = () => {
    const navigate = useNavigate();
    const location = useLocation();

    // State UI
    const [isScrolled, setIsScrolled] = useState(false);
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [activeMobileSubmenu, setActiveMobileSubmenu] = useState(''); // 'danh-sach' | 'the-loai' | 'quoc-gia'
    const [showUserMenu, setShowUserMenu] = useState(false);
    const userMenuRef = useRef(null);

    // State Data
    const [menuData, setMenuData] = useState({ theLoai: [], quocGia: [] });
    const [user, setUser] = useState(null);

    // State Search
    const [showSearch, setShowSearch] = useState(false);
    const [keyword, setKeyword] = useState('');
    const [results, setResults] = useState([]);
    const debouncedKeyword = useDebounce(keyword, 500);
    const searchRef = useRef(null);

    const listItems = [
        { name: 'Phim Mới', slug: 'phim-moi' },
        { name: 'Phim Bộ', slug: 'phim-bo' },
        { name: 'Phim Lẻ', slug: 'phim-le' },
        { name: 'TV Shows', slug: 'tv-shows' },
        { name: 'Hoạt Hình', slug: 'hoat-hinh' },
        { name: 'Vietsub', slug: 'phim-vietsub' },
        { name: 'Thuyết Minh', slug: 'phim-thuyet-minh' },
        { name: 'Lồng Tiếng', slug: 'phim-long-tieng' },
        { name: 'Bộ Đang Chiếu', slug: 'phim-bo-dang-chieu' },
        { name: 'Bộ Hoàn Thành', slug: 'phim-bo-hoan-thanh' },
        { name: 'Sắp Chiếu', slug: 'phim-sap-chieu' },
        { name: 'Subteam', slug: 'subteam' },
        { name: 'Chiếu Rạp', slug: 'phim-chieu-rap' },
    ];

    useEffect(() => {
        const handleScroll = () => setIsScrolled(window.scrollY > 20);
        const handleClickOutside = (event) => {
            if (searchRef.current && !searchRef.current.contains(event.target)) setShowSearch(false);
            if (userMenuRef.current && !userMenuRef.current.contains(event.target)) setShowUserMenu(false);
        };
        const initHeaderData = async () => {
            const menu = await getMenuData();
            if (menu) setMenuData(menu);
            setUser(getCurrentUser());
        };
        window.addEventListener('scroll', handleScroll);
        document.addEventListener('mousedown', handleClickOutside);
        initHeaderData();
        return () => {
            window.removeEventListener('scroll', handleScroll);
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    useEffect(() => {
        setMobileMenuOpen(false);
        setActiveMobileSubmenu('');
        setShowUserMenu(false);
        window.scrollTo(0, 0);
    }, [location]);

    useEffect(() => {
        const fetchApiSearch = async () => {
            if (!debouncedKeyword.trim()) { setResults([]); return; }
            try {
                const data = await searchMovies(debouncedKeyword);
                setResults(data?.data?.items || []);
            } catch (e) { setResults([]); }
        };
        fetchApiSearch();
    }, [debouncedKeyword]);

    const handleEnterSearch = (e) => { e.preventDefault(); if (keyword.trim()) { navigate(`/tim-kiem?keyword=${keyword}`); setShowSearch(false); } };
    const handleLogout = () => { logout(); setUser(null); setMobileMenuOpen(false); navigate('/login'); };
    const toggleUserMenu = (e) => { e.stopPropagation(); setShowUserMenu(!showUserMenu); };
    const toggleMobileSubmenu = (menuName) => { setActiveMobileSubmenu(activeMobileSubmenu === menuName ? '' : menuName); };

    // Styles Helper
    const getDropdownBannerStyle = (role) => {
        if (role === 'super_admin') return "bg-gradient-to-r from-yellow-500 via-amber-500 to-yellow-600";
        if (role === 'admin') return "bg-gradient-to-r from-red-600 via-red-500 to-rose-600";
        return "bg-gradient-to-r from-blue-900 via-gray-900 to-black";
    };

    const getRoleIcon = (role) => {
        if (role === 'super_admin') return <FaCrown className="text-yellow-200" />;
        if (role === 'admin') return <FaShieldAlt className="text-white" />;
        return null;
    };

    const getRoleName = (role) => {
        if (role === 'super_admin') return "Super Admin";
        if (role === 'admin') return "Administrator";
        return "Thành viên";
    };

    return (
        <>
            <header className={`fixed top-0 w-full z-[100] transition-all duration-500 ${isScrolled ? 'bg-[#0a0e17]/95 backdrop-blur-md border-b border-white/5 shadow-lg' : 'bg-gradient-to-b from-black/90 to-transparent'}`}>
                <div className="h-16 md:h-20 container mx-auto px-4 flex items-center justify-between">
                    <div className="flex items-center gap-4 md:gap-6">
                        <button className="lg:hidden text-white text-xl p-2 active:scale-95 transition" onClick={() => setMobileMenuOpen(true)}><FaBars /></button>
                        <Link to="/" className="block hover:scale-105 transition"><Logo /></Link>

                        {/* --- DESKTOP MENU --- */}
                        <ul className="hidden lg:flex items-center gap-6 text-sm font-medium text-gray-300">
                            <li><Link to="/" className="hover:text-white transition">Trang chủ</Link></li>

                            {/* Danh Sách Dropdown - [UPDATED DESIGN] */}
                            <li className="group relative py-4 cursor-pointer hover:text-white">
                                <span className="flex items-center gap-1">Danh sách <FaChevronDown size={8} /></span>
                                <div className="absolute top-full left-0 w-[450px] bg-[#1a1a1a]/95 backdrop-blur-xl border border-white/10 rounded-xl shadow-2xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 transform translate-y-2 group-hover:translate-y-0 py-4 grid grid-cols-3 gap-2 px-4">
                                    {listItems.map((item) => (
                                        <Link key={item.slug} to={`/danh-sach/${item.slug}`} className="block px-3 py-2 text-xs font-bold text-gray-400 hover:text-white hover:bg-white/10 rounded-lg transition-colors">{item.name}</Link>
                                    ))}
                                </div>
                            </li>

                            {/* Thể Loại Dropdown */}
                            <li className="group relative py-4 cursor-pointer hover:text-white">
                                <span className="flex items-center gap-1">Thể loại <FaChevronDown size={8} /></span>
                                <div className="absolute top-full left-0 w-[600px] bg-[#1a1a1a]/95 backdrop-blur-xl border border-white/10 rounded-xl shadow-2xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 transform translate-y-2 group-hover:translate-y-0 p-5 grid grid-cols-4 gap-2">
                                    {menuData.theLoai.length > 0 ? menuData.theLoai.map((item) => (
                                        <Link key={item._id || item.slug} to={`/the-loai/${item.slug}`} className="text-xs text-gray-400 hover:text-red-500 transition-colors py-1 hover:translate-x-1 duration-200">{item.name}</Link>
                                    )) : <span className="text-xs text-gray-500 col-span-4 text-center">Đang tải...</span>}
                                </div>
                            </li>

                            {/* Quốc Gia Dropdown */}
                            <li className="group relative py-4 cursor-pointer hover:text-white">
                                <span className="flex items-center gap-1">Quốc gia <FaChevronDown size={8} /></span>
                                <div className="absolute top-full left-0 w-[500px] bg-[#1a1a1a]/95 backdrop-blur-xl border border-white/10 rounded-xl shadow-2xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 transform translate-y-2 group-hover:translate-y-0 p-5 grid grid-cols-4 gap-2">
                                    {menuData.quocGia.length > 0 ? menuData.quocGia.map((item) => (
                                        <Link key={item._id || item.slug} to={`/quoc-gia/${item.slug}`} className="text-xs text-gray-400 hover:text-red-500 transition-colors py-1 hover:translate-x-1 duration-200">{item.name}</Link>
                                    )) : <span className="text-xs text-gray-500 col-span-4 text-center">Đang tải...</span>}
                                </div>
                            </li>

                            <li><Link to="/watch-party" className="ml-2 px-5 py-2 bg-gradient-to-r from-red-600 to-rose-600 rounded-full text-white shadow-lg hover:shadow-red-500/30 hover:scale-105 transition flex items-center gap-2 text-xs font-bold"><FaFilm /> Rạp Phim</Link></li>
                        </ul>
                    </div>

                    <div className="flex items-center gap-3 md:gap-4">
                        {/* Search Bar */}
                        <div className="flex items-center" ref={searchRef}>
                            <div className={`relative flex items-center transition-all ${showSearch ? 'w-48 md:w-64 bg-[#222] border-white/20' : 'w-8 bg-transparent border-transparent'} border rounded-full h-9`}>
                                <button onClick={() => setShowSearch(!showSearch)} className="absolute left-0 w-8 h-9 flex items-center justify-center text-gray-300 hover:text-white"><FaSearch className="text-sm" /></button>
                                {showSearch && (<form onSubmit={handleEnterSearch} className="flex-1 pl-9 pr-3 md:pr-8"><input autoFocus type="text" placeholder="Tìm kiếm..." className="w-full bg-transparent text-sm text-white outline-none" value={keyword} onChange={(e) => setKeyword(e.target.value)} /></form>)}
                                {showSearch && keyword && results.length > 0 && (
                                    <div className="absolute top-full right-0 mt-2 w-72 md:w-80 bg-[#1a1a1a] border border-white/10 rounded-xl shadow-2xl overflow-hidden z-50">
                                        <div className="max-h-[300px] overflow-y-auto">
                                            {results.map(m => (
                                                <Link key={m._id} to={`/phim/${m.slug}`} onClick={() => setShowSearch(false)} className="flex gap-3 p-3 hover:bg-white/5 border-b border-white/5 last:border-0 transition-colors">
                                                    <img src={m.thumb_url} className="w-10 h-14 object-cover rounded bg-gray-800" alt="" />
                                                    <div className="flex-1 overflow-hidden"><p className="text-sm font-bold text-white truncate">{m.name}</p><p className="text-xs text-gray-400 truncate">{m.origin_name}</p><p className="text-xs text-red-500 mt-1">{m.year}</p></div>
                                                </Link>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* User Menu */}
                        {user ? (
                            <div className="relative" ref={userMenuRef}>
                                <div onClick={toggleUserMenu} className="flex items-center gap-2 cursor-pointer select-none">
                                    <div className={`rounded-full p-0.5 transition-transform active:scale-95 ${user.role === 'admin' ? 'bg-red-500' : user.role === 'super_admin' ? 'bg-yellow-400' : 'bg-transparent'}`}>
                                        <UserAvatar user={user} className="w-8 h-8" hasBorder={false} />
                                    </div>
                                    <FaChevronDown size={10} className={`text-gray-400 transition-transform duration-300 ${showUserMenu ? 'rotate-180' : ''}`} />
                                </div>
                                <div className={`absolute top-full right-0 pt-3 w-72 z-50 transition-all duration-200 origin-top-right ${showUserMenu ? 'opacity-100 visible translate-y-0' : 'opacity-0 invisible -translate-y-2'}`}>
                                    <div className="bg-[#1a1a1a] border border-white/10 rounded-xl shadow-2xl overflow-hidden">
                                        <div className={`h-20 ${getDropdownBannerStyle(user.role)} relative flex items-center px-5`}><div className="absolute top-0 right-0 p-2 opacity-20 text-white text-6xl transform translate-x-2 -translate-y-2">{getRoleIcon(user.role) || <FaUser />}</div></div>
                                        <div className="px-5 relative -mt-10 mb-3 flex items-end justify-between">
                                            <div className="w-20 h-20 rounded-full border-4 border-[#1a1a1a] bg-[#1a1a1a] flex items-center justify-center shadow-lg"><UserAvatar user={user} className="w-full h-full" hasBorder={false} fontSize="text-2xl" /></div>
                                            <div className="mb-2"><span className="bg-[#1a1a1a]/80 backdrop-blur border border-white/10 text-white text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-wider flex items-center gap-1 shadow-sm">{getRoleIcon(user.role)} {getRoleName(user.role)}</span></div>
                                        </div>
                                        <div className="px-5 mb-4"><p className="text-lg font-bold text-white truncate">{user.fullname || user.username}</p><p className="text-xs text-gray-500">@{user.username}</p></div>
                                        <div className="border-t border-white/5 p-2">
                                            {(user.role === 'admin' || user.role === 'super_admin') && (<Link to="/admin" className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-red-400 hover:bg-white/5 hover:text-red-300 transition"><FaChartBar className="text-lg" /> Quản trị hệ thống</Link>)}
                                            <Link to="/ho-so" className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-gray-300 hover:bg-white/5 hover:text-white transition"><FaUser className="text-lg text-gray-500" /> Hồ sơ cá nhân</Link>
                                            <Link to="/tu-phim" className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-gray-300 hover:bg-white/5 hover:text-white transition"><FaHeart className="text-lg text-gray-500" /> Tủ phim yêu thích</Link>
                                            <Link to="/lich-su" className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-gray-300 hover:bg-white/5 hover:text-white transition"><FaHistory className="text-lg text-gray-500" /> Lịch sử xem</Link>
                                        </div>
                                        <div className="bg-white/[0.02] border-t border-white/5 p-2"><button onClick={handleLogout} className="w-full flex items-center justify-center gap-2 px-3 py-2.5 rounded-lg text-sm font-bold text-gray-400 hover:bg-red-500/10 hover:text-red-500 transition"><FaSignOutAlt /> Đăng xuất</button></div>
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <Link to="/login" className="bg-red-600 hover:bg-red-700 text-white px-4 md:px-5 py-1.5 md:py-2 rounded-full font-bold text-xs md:text-sm transition shadow-lg shadow-red-900/20 whitespace-nowrap">Đăng nhập</Link>
                        )}
                    </div>
                </div>
            </header>

            {/* --- MOBILE MENU "WOW" REDESIGN --- */}
            <div className={`fixed inset-0 bg-black/90 backdrop-blur-xl z-[150] transition-opacity duration-300 lg:hidden ${mobileMenuOpen ? 'opacity-100 visible' : 'opacity-0 invisible'}`} onClick={() => setMobileMenuOpen(false)} />

            <div className={`fixed top-0 left-0 w-[85%] max-w-[340px] h-full bg-[#0a0e17] z-[200] transform transition-transform duration-500 cubic-bezier(0.4, 0, 0.2, 1) lg:hidden flex flex-col shadow-2xl border-r border-white/5 ${mobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}`}>

                {/* 1. Mobile Header (User Section) */}
                <div className="relative overflow-hidden">
                    <div className={`absolute inset-0 ${user ? getDropdownBannerStyle(user.role) : 'bg-gradient-to-r from-gray-800 to-black'} opacity-80`}></div>
                    <div className="relative z-10 p-6 pt-10">
                        <div className="flex items-center justify-between mb-4">
                            <Logo />
                            <button onClick={() => setMobileMenuOpen(false)} className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-white hover:bg-white/20"><FaTimes /></button>
                        </div>
                        {user ? (
                            <div className="flex items-center gap-3">
                                <div className="p-0.5 bg-white/20 rounded-full">
                                    <UserAvatar user={user} className="w-12 h-12" hasBorder={false} />
                                </div>
                                <div className="text-white">
                                    <p className="font-bold text-lg leading-tight">{user.fullname}</p>
                                    <p className="text-xs text-white/70">@{user.username}</p>
                                </div>
                            </div>
                        ) : (
                            <div>
                                <h3 className="text-white font-bold text-lg">Chào khách!</h3>
                                <p className="text-gray-300 text-xs mb-3">Đăng nhập để lưu phim & đồng bộ lịch sử.</p>
                                <Link to="/login" className="inline-block bg-white text-black font-bold text-xs px-4 py-2 rounded-full shadow-lg">Đăng nhập ngay</Link>
                            </div>
                        )}
                    </div>
                </div>

                {/* 2. Mobile Nav Links */}
                <div className="flex-1 overflow-y-auto p-4 space-y-4">
                    {/* Main Nav */}
                    <div className="grid grid-cols-2 gap-3">
                        <Link to="/" onClick={() => setMobileMenuOpen(false)} className="flex flex-col items-center justify-center bg-[#151a25] border border-white/5 rounded-xl py-4 hover:bg-white/5 active:scale-95 transition">
                            <FaHome className="text-2xl text-red-500 mb-2" />
                            <span className="text-xs font-bold text-gray-300">Trang Chủ</span>
                        </Link>
                        <Link to="/watch-party" onClick={() => setMobileMenuOpen(false)} className="flex flex-col items-center justify-center bg-[#151a25] border border-white/5 rounded-xl py-4 hover:bg-white/5 active:scale-95 transition relative overflow-hidden">
                            <div className="absolute top-0 right-0 bg-red-600 text-[9px] font-bold px-1.5 py-0.5 rounded-bl-lg text-white">HOT</div>
                            <FaFilm className="text-2xl text-blue-500 mb-2" />
                            <span className="text-xs font-bold text-gray-300">Rạp Phim</span>
                        </Link>
                    </div>

                    {/* Danh Sách (Accordion Style) */}
                    <div className="bg-[#151a25] rounded-xl border border-white/5 overflow-hidden">
                        <button onClick={() => toggleMobileSubmenu('danh-sach')} className="w-full flex items-center justify-between p-4 bg-white/[0.02]">
                            <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-full bg-purple-500/10 flex items-center justify-center text-purple-500"><FaListUl /></div>
                                <span className="font-bold text-sm text-gray-200">Danh Sách</span>
                            </div>
                            <FaChevronDown className={`text-xs text-gray-500 transition-transform ${activeMobileSubmenu === 'danh-sach' ? 'rotate-180' : ''}`} />
                        </button>
                        {activeMobileSubmenu === 'danh-sach' && (
                            <div className="p-3 grid grid-cols-2 gap-2 bg-black/20 border-t border-white/5 animate-fade-in-down">
                                {listItems.map(item => (
                                    <Link key={item.slug} to={`/danh-sach/${item.slug}`} onClick={() => setMobileMenuOpen(false)} className="px-3 py-2 rounded-lg bg-white/5 text-xs text-gray-300 text-center hover:bg-white/10">{item.name}</Link>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Thể Loại & Quốc Gia (Side-by-Side Toggle) */}
                    <div className="grid grid-cols-2 gap-3">
                        {/* Thể Loại Toggle */}
                        <button onClick={() => toggleMobileSubmenu('the-loai')} className={`flex flex-col items-center p-4 rounded-xl border transition-all ${activeMobileSubmenu === 'the-loai' ? 'bg-red-500/10 border-red-500/50' : 'bg-[#151a25] border-white/5'}`}>
                            <FaLayerGroup className={`text-xl mb-2 ${activeMobileSubmenu === 'the-loai' ? 'text-red-500' : 'text-gray-400'}`} />
                            <span className={`text-xs font-bold ${activeMobileSubmenu === 'the-loai' ? 'text-white' : 'text-gray-400'}`}>Thể Loại</span>
                        </button>

                        {/* Quốc Gia Toggle */}
                        <button onClick={() => toggleMobileSubmenu('quoc-gia')} className={`flex flex-col items-center p-4 rounded-xl border transition-all ${activeMobileSubmenu === 'quoc-gia' ? 'bg-blue-500/10 border-blue-500/50' : 'bg-[#151a25] border-white/5'}`}>
                            <FaGlobeAsia className={`text-xl mb-2 ${activeMobileSubmenu === 'quoc-gia' ? 'text-blue-500' : 'text-gray-400'}`} />
                            <span className={`text-xs font-bold ${activeMobileSubmenu === 'quoc-gia' ? 'text-white' : 'text-gray-400'}`}>Quốc Gia</span>
                        </button>
                    </div>

                    {/* Content Area for Side-by-Side Toggles */}
                    <div className="transition-all duration-300">
                        {activeMobileSubmenu === 'the-loai' && (
                            <div className="bg-[#151a25] border border-white/5 rounded-xl p-3 animate-fade-in-down">
                                <p className="text-xs font-bold text-gray-500 uppercase mb-3 ml-1">Chọn Thể Loại</p>
                                <div className="grid grid-cols-2 gap-2">
                                    {menuData.theLoai.map(item => (
                                        <Link key={item.slug} to={`/the-loai/${item.slug}`} onClick={() => setMobileMenuOpen(false)} className="px-3 py-2 rounded-lg bg-white/5 text-xs text-gray-300 hover:text-white truncate">{item.name}</Link>
                                    ))}
                                </div>
                            </div>
                        )}
                        {activeMobileSubmenu === 'quoc-gia' && (
                            <div className="bg-[#151a25] border border-white/5 rounded-xl p-3 animate-fade-in-down">
                                <p className="text-xs font-bold text-gray-500 uppercase mb-3 ml-1">Chọn Quốc Gia</p>
                                <div className="grid grid-cols-2 gap-2">
                                    {menuData.quocGia.map(item => (
                                        <Link key={item.slug} to={`/quoc-gia/${item.slug}`} onClick={() => setMobileMenuOpen(false)} className="px-3 py-2 rounded-lg bg-white/5 text-xs text-gray-300 hover:text-white truncate">{item.name}</Link>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* 3. Mobile Footer */}
                {user && (
                    <div className="p-4 border-t border-white/10 bg-black/20">
                        <button onClick={handleLogout} className="w-full py-3 rounded-xl bg-red-600/10 text-red-500 font-bold text-sm flex items-center justify-center gap-2 hover:bg-red-600 hover:text-white transition">
                            <FaSignOutAlt /> Đăng Xuất
                        </button>
                    </div>
                )}
            </div>
        </>
    );
};

export default Header;