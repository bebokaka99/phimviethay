import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom'; 
import { FaSearch, FaChevronDown, FaTimes, FaSpinner, FaBars, FaChevronUp, FaList, FaHistory, FaUser, FaHeart, FaSignOutAlt, FaCog, FaFilm, FaChartBar, FaGlobeAsia, FaLayerGroup } from 'react-icons/fa';
import { getMenuData, searchMovies } from '../../services/movieService';
import { useDebounce } from '../../hooks/useDebounce';
import { getCurrentUser, logout } from '../../services/authService';
import Logo from '../common/Logo';
import UserAvatar from '../common/UserAvatar';

const Header = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const [isScrolled, setIsScrolled] = useState(false);
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [activeMobileSubmenu, setActiveMobileSubmenu] = useState('');
    const [menuData, setMenuData] = useState({ theLoai: [], quocGia: [] });
    const [user, setUser] = useState(null);
    const [showSearch, setShowSearch] = useState(false);
    const [keyword, setKeyword] = useState('');
    const [results, setResults] = useState([]);
    const [isSearching, setIsSearching] = useState(false);
    const debouncedKeyword = useDebounce(keyword, 500);
    const searchRef = useRef(null);

    const listItems = [
        { name: 'Phim Mới', slug: 'phim-moi' }, { name: 'Phim Bộ', slug: 'phim-bo' }, { name: 'Phim Lẻ', slug: 'phim-le' },
        { name: 'TV Shows', slug: 'tv-shows' }, { name: 'Hoạt Hình', slug: 'hoat-hinh' }, { name: 'Sắp Chiếu', slug: 'phim-sap-chieu' },
    ];

    useEffect(() => {
        const handleScroll = () => setIsScrolled(window.scrollY > 20);
        const handleClickOutside = (event) => { if (searchRef.current && !searchRef.current.contains(event.target)) setShowSearch(false); };
        const fetchMenu = async () => { const data = await getMenuData(); if (data) setMenuData(data); };
        
        window.addEventListener('scroll', handleScroll);
        document.addEventListener('mousedown', handleClickOutside);
        fetchMenu();
        setUser(getCurrentUser());

        return () => {
            window.removeEventListener('scroll', handleScroll);
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    // Đóng mobile menu khi chuyển trang
    useEffect(() => {
        setMobileMenuOpen(false);
        window.scrollTo(0, 0);
    }, [location]);

    useEffect(() => {
        const fetchApiSearch = async () => {
            if (!debouncedKeyword.trim()) { setResults([]); return; }
            setIsSearching(true);
            try {
                const data = await searchMovies(debouncedKeyword);
                setResults(data?.data?.items || []);
            } catch (e) { setResults([]); }
            setIsSearching(false);
        };
        fetchApiSearch();
    }, [debouncedKeyword]);

    const handleEnterSearch = (e) => { e.preventDefault(); if (keyword.trim()) { navigate(`/tim-kiem?keyword=${keyword}`); setShowSearch(false); } };
    const toggleMobileSubmenu = (name) => setActiveMobileSubmenu(prev => prev === name ? '' : name);
    const handleLogout = () => { logout(); setUser(null); setMobileMenuOpen(false); navigate('/login'); };

    return (
        <>
            <header className={`fixed top-0 w-full z-[100] transition-all duration-500 ${isScrolled ? 'bg-[#0a0e17]/90 backdrop-blur-xl shadow-2xl h-16 border-b border-white/5' : 'bg-gradient-to-b from-black/80 to-transparent h-20 md:h-24'}`}>
                <div className="w-full h-full px-4 md:px-8 container mx-auto flex items-center justify-between">
                    
                    {/* LEFT: LOGO & MOBILE TOGGLE */}
                    <div className="flex items-center gap-4 lg:gap-8">
                        <button className="lg:hidden text-white text-xl p-2 hover:bg-white/10 rounded-lg transition" onClick={() => setMobileMenuOpen(true)}>
                            <FaBars />
                        </button>
                        <Link to="/" className="block hover:opacity-90 transition transform hover:scale-105 duration-300">
                            <Logo />
                        </Link>
                        
                        {/* DESKTOP MENU (MEGA MENU STYLE) */}
                        <ul className="hidden lg:flex items-center gap-1 text-sm font-bold text-gray-300 h-full">
                            <li><Link to="/" className="hover:text-white hover:bg-white/5 px-4 py-2 rounded-lg transition block">Trang chủ</Link></li>
                            
                            {/* Dropdown: Danh sách */}
                            <li className="group relative px-3 py-2 cursor-pointer hover:text-white">
                                <span className="flex items-center gap-1">Danh sách <FaChevronDown size={8}/></span>
                                <div className="absolute top-full left-0 w-48 bg-[#111]/95 backdrop-blur-md border border-white/10 rounded-xl shadow-2xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 transform translate-y-2 group-hover:translate-y-0 overflow-hidden py-2">
                                    {listItems.map((item) => (
                                        <Link key={item.slug} to={`/danh-sach/${item.slug}`} className="block px-4 py-2.5 text-sm text-gray-400 hover:text-white hover:bg-white/10 transition-colors">
                                            {item.name}
                                        </Link>
                                    ))}
                                </div>
                            </li>

                            {/* Dropdown: Thể loại (Grid) */}
                            <li className="group relative px-3 py-2 cursor-pointer hover:text-white">
                                <span className="flex items-center gap-1">Thể loại <FaChevronDown size={8}/></span>
                                <div className="absolute top-full left-0 w-[600px] bg-[#111]/95 backdrop-blur-md border border-white/10 rounded-xl shadow-2xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 transform translate-y-2 group-hover:translate-y-0 overflow-hidden p-6">
                                    <div className="flex items-center gap-2 mb-4 text-xs font-bold text-gray-500 uppercase tracking-wider border-b border-white/10 pb-2">
                                        <FaLayerGroup className="text-red-600"/> Khám phá theo thể loại
                                    </div>
                                    <div className="grid grid-cols-4 gap-x-4 gap-y-2">
                                        {menuData.theLoai.slice(0, 24).map((item) => (
                                            <Link key={item._id} to={`/the-loai/${item.slug}`} className="text-sm text-gray-400 hover:text-white hover:translate-x-1 transition-all duration-200 block py-1">
                                                {item.name}
                                            </Link>
                                        ))}
                                    </div>
                                </div>
                            </li>

                            {/* Dropdown: Quốc gia (Grid) */}
                            <li className="group relative px-3 py-2 cursor-pointer hover:text-white">
                                <span className="flex items-center gap-1">Quốc gia <FaChevronDown size={8}/></span>
                                <div className="absolute top-full left-0 w-[450px] bg-[#111]/95 backdrop-blur-md border border-white/10 rounded-xl shadow-2xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 transform translate-y-2 group-hover:translate-y-0 overflow-hidden p-6">
                                    <div className="flex items-center gap-2 mb-4 text-xs font-bold text-gray-500 uppercase tracking-wider border-b border-white/10 pb-2">
                                        <FaGlobeAsia className="text-blue-500"/> Quốc gia sản xuất
                                    </div>
                                    <div className="grid grid-cols-3 gap-x-4 gap-y-2">
                                        {menuData.quocGia.slice(0, 18).map((item) => (
                                            <Link key={item._id} to={`/quoc-gia/${item.slug}`} className="text-sm text-gray-400 hover:text-white hover:translate-x-1 transition-all duration-200 block py-1">
                                                {item.name}
                                            </Link>
                                        ))}
                                    </div>
                                </div>
                            </li>

                            <li>
                                <Link to="/watch-party" className="ml-2 group relative px-4 py-2 flex items-center gap-2 bg-gradient-to-r from-red-600 to-red-700 rounded-full text-white shadow-lg shadow-red-900/20 hover:shadow-red-900/40 hover:scale-105 transition-all">
                                    <FaFilm className="text-xs"/> <span className="font-bold tracking-wide">Rạp Phim</span>
                                </Link>
                            </li>
                        </ul>
                    </div>

                    {/* RIGHT: SEARCH & USER */}
                    <div className="flex items-center gap-3 lg:gap-5" ref={searchRef}>
                        {/* Search Bar Animation */}
                        <div className={`relative flex items-center transition-all duration-300 ease-out ${showSearch ? 'w-[200px] sm:w-[300px] bg-[#1a1a1a] border-white/20' : 'w-10 bg-transparent border-transparent'} border rounded-full overflow-hidden h-10`}>
                            <button 
                                onClick={() => setShowSearch(!showSearch)} 
                                className={`absolute left-0 top-0 w-10 h-10 flex items-center justify-center text-gray-300 hover:text-white transition-colors z-10`}
                            >
                                <FaSearch className="text-sm"/>
                            </button>
                            
                            <form onSubmit={handleEnterSearch} className={`flex-1 pl-10 pr-8 h-full transition-opacity duration-200 ${showSearch ? 'opacity-100' : 'opacity-0'}`}>
                                <input 
                                    type="text" 
                                    placeholder="Tìm kiếm phim..." 
                                    className="w-full h-full bg-transparent text-sm text-white placeholder-gray-500 outline-none"
                                    value={keyword} 
                                    onChange={(e) => setKeyword(e.target.value)} 
                                />
                            </form>
                            
                            {showSearch && (
                                <button onClick={() => { setShowSearch(false); setKeyword(''); setResults([]); }} className="absolute right-3 text-gray-500 hover:text-white transition">
                                    {isSearching ? <FaSpinner className="animate-spin text-red-500"/> : <FaTimes/>}
                                </button>
                            )}
                        </div>

                        {/* Search Results Dropdown */}
                        {showSearch && keyword.length > 0 && results.length > 0 && (
                            <div className="absolute top-full right-0 mt-3 w-[320px] bg-[#111]/95 backdrop-blur-xl border border-white/10 rounded-xl shadow-2xl overflow-hidden animate-fade-in-up z-[110]">
                                <div className="max-h-[60vh] overflow-y-auto custom-scrollbar">
                                    {results.slice(0, 5).map((movie) => (
                                        <Link key={movie._id} to={`/phim/${movie.slug}`} onClick={() => { setShowSearch(false); setKeyword(''); }} className="flex items-center gap-3 p-3 hover:bg-white/5 transition border-b border-white/5 last:border-0 group">
                                            <img src={movie.thumb_url} alt="" className="w-10 h-14 object-cover rounded-md shadow-md group-hover:scale-105 transition-transform" />
                                            <div className="flex-1 min-w-0">
                                                <h4 className="text-sm font-bold text-white truncate group-hover:text-red-500 transition">{movie.name}</h4>
                                                <p className="text-xs text-gray-500 truncate mt-0.5">{movie.origin_name} • {movie.year}</p>
                                            </div>
                                        </Link>
                                    ))}
                                    <div onClick={handleEnterSearch} className="p-3 text-center text-xs font-bold text-red-500 cursor-pointer hover:bg-white/5 transition uppercase tracking-wide">
                                        Xem tất cả kết quả
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* User Actions */}
                        {user ? (
                            <div className="relative group cursor-pointer py-2">
                                <div className="flex items-center gap-2">
                                    <UserAvatar user={user} className="w-9 h-9 border border-white/10 group-hover:border-red-500 transition-colors" />
                                </div>
                                <div className="absolute top-full right-0 pt-2 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 transform translate-y-2 group-hover:translate-y-0 w-56 z-50">
                                    <div className="bg-[#111]/95 backdrop-blur-md border border-white/10 rounded-xl shadow-2xl overflow-hidden py-1">
                                        <div className="px-4 py-3 border-b border-white/10 bg-white/5">
                                            <p className="text-sm font-bold text-white truncate">{user.fullname || user.username}</p>
                                            <p className="text-xs text-gray-500 font-bold uppercase tracking-wider">{user.role}</p>
                                        </div>
                                        {(user.role === 'admin' || user.role === 'super_admin') && (
                                            <Link to="/admin" className="block px-4 py-2.5 text-sm text-yellow-500 hover:bg-white/5 hover:text-yellow-400 font-bold flex items-center gap-2">
                                                <FaChartBar/> Quản trị
                                            </Link>
                                        )}
                                        <Link to="/ho-so" className="block px-4 py-2.5 text-sm text-gray-300 hover:bg-white/5 hover:text-white flex items-center gap-2"><FaUser/> Hồ sơ cá nhân</Link>
                                        <Link to="/tu-phim" className="block px-4 py-2.5 text-sm text-gray-300 hover:bg-white/5 hover:text-white flex items-center gap-2"><FaHeart/> Phim yêu thích</Link>
                                        <Link to="/lich-su" className="block px-4 py-2.5 text-sm text-gray-300 hover:bg-white/5 hover:text-white flex items-center gap-2"><FaHistory/> Lịch sử xem</Link>
                                        <div className="border-t border-white/10 mt-1 pt-1">
                                            <button onClick={handleLogout} className="w-full text-left px-4 py-2.5 text-sm text-red-500 hover:bg-red-500/10 flex items-center gap-2 font-bold"><FaSignOutAlt/> Đăng xuất</button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <Link to="/login" className="hidden sm:inline-block bg-white/10 hover:bg-white/20 border border-white/10 text-white px-5 py-2 rounded-full text-xs font-bold transition-all hover:scale-105">
                                Đăng nhập
                            </Link>
                        )}
                    </div>
                </div>
            </header>

            {/* MOBILE MENU (OFF-CANVAS DRAWER) */}
            <div className={`fixed inset-0 bg-black/80 backdrop-blur-sm z-[150] transition-opacity duration-300 lg:hidden ${mobileMenuOpen ? 'opacity-100 visible' : 'opacity-0 invisible'}`} onClick={() => setMobileMenuOpen(false)} />
            
            <div className={`fixed top-0 left-0 w-[85%] max-w-[320px] h-full bg-[#0a0e17] z-[200] transform transition-transform duration-300 ease-out lg:hidden flex flex-col ${mobileMenuOpen ? 'translate-x-0' : '-translate-x-full'} shadow-2xl border-r border-white/5`}>
                
                {/* Mobile Header */}
                <div className="p-6 border-b border-white/10 bg-gradient-to-r from-red-900/20 to-transparent">
                    <div className="flex justify-between items-center mb-6">
                        <Logo />
                        <button onClick={() => setMobileMenuOpen(false)} className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center text-gray-400 hover:text-white hover:bg-white/10 transition">
                            <FaTimes size={14}/>
                        </button>
                    </div>
                    {user ? (
                        <div className="flex items-center gap-3">
                            <UserAvatar user={user} className="w-10 h-10 border border-white/20" />
                            <div>
                                <p className="text-white font-bold text-sm truncate w-32">{user.fullname || user.username}</p>
                                <p className="text-[10px] text-gray-500 uppercase font-bold">{user.role}</p>
                            </div>
                        </div>
                    ) : (
                        <div className="grid grid-cols-2 gap-3">
                            <Link to="/login" className="bg-red-600 text-white font-bold py-2 rounded-lg text-xs text-center">Đăng nhập</Link>
                            <Link to="/register" className="border border-white/20 text-white font-bold py-2 rounded-lg text-xs text-center">Đăng ký</Link>
                        </div>
                    )}
                </div>

                {/* Mobile Links */}
                <div className="flex-1 overflow-y-auto p-4 space-y-1 custom-scrollbar">
                    {user && (
                        <div className="grid grid-cols-3 gap-2 mb-4 pb-4 border-b border-white/5">
                            <Link to="/tu-phim" className="flex flex-col items-center gap-2 p-3 rounded-xl bg-white/5 hover:bg-white/10 transition">
                                <FaHeart className="text-red-500 text-lg"/> <span className="text-[10px] font-bold text-gray-300">Yêu thích</span>
                            </Link>
                            <Link to="/lich-su" className="flex flex-col items-center gap-2 p-3 rounded-xl bg-white/5 hover:bg-white/10 transition">
                                <FaHistory className="text-blue-400 text-lg"/> <span className="text-[10px] font-bold text-gray-300">Lịch sử</span>
                            </Link>
                            <Link to="/ho-so" className="flex flex-col items-center gap-2 p-3 rounded-xl bg-white/5 hover:bg-white/10 transition">
                                <FaCog className="text-gray-400 text-lg"/> <span className="text-[10px] font-bold text-gray-300">Cài đặt</span>
                            </Link>
                        </div>
                    )}

                    <Link to="/" className="flex items-center gap-3 py-3 px-4 rounded-lg bg-white/5 text-white font-bold border-l-4 border-red-600"><span className="w-5"><FaFilm/></span> Trang Chủ</Link>
                    <Link to="/watch-party" className="flex items-center gap-3 py-3 px-4 rounded-lg text-gray-300 hover:text-white hover:bg-white/5 transition font-medium"><span className="w-5"><FaFilm className="text-purple-500"/></span> Rạp Phim Online</Link>
                    
                    {/* Collapsible Menus */}
                    <div className="py-2">
                        <button onClick={() => toggleMobileSubmenu('danh-sach')} className="w-full flex justify-between items-center py-3 px-4 rounded-lg text-gray-300 hover:text-white hover:bg-white/5 transition font-medium">
                            <div className="flex items-center gap-3"><span className="w-5"><FaList/></span> Danh Sách</div>
                            <FaChevronDown className={`text-xs transition-transform ${activeMobileSubmenu === 'danh-sach' ? 'rotate-180' : ''}`}/>
                        </button>
                        <div className={`overflow-hidden transition-all duration-300 ${activeMobileSubmenu === 'danh-sach' ? 'max-h-[500px]' : 'max-h-0'}`}>
                            <div className="bg-black/20 rounded-lg m-2 p-2 grid grid-cols-2 gap-2">
                                {listItems.map(item => (<Link key={item.slug} to={`/danh-sach/${item.slug}`} className="text-xs text-gray-400 hover:text-white p-2 hover:bg-white/5 rounded block">{item.name}</Link>))}
                            </div>
                        </div>
                    </div>

                    <div className="py-2">
                        <button onClick={() => toggleMobileSubmenu('the-loai')} className="w-full flex justify-between items-center py-3 px-4 rounded-lg text-gray-300 hover:text-white hover:bg-white/5 transition font-medium">
                            <div className="flex items-center gap-3"><span className="w-5"><FaLayerGroup/></span> Thể Loại</div>
                            <FaChevronDown className={`text-xs transition-transform ${activeMobileSubmenu === 'the-loai' ? 'rotate-180' : ''}`}/>
                        </button>
                        <div className={`overflow-hidden transition-all duration-300 ${activeMobileSubmenu === 'the-loai' ? 'max-h-[500px]' : 'max-h-0'}`}>
                            <div className="bg-black/20 rounded-lg m-2 p-2 grid grid-cols-2 gap-2">
                                {menuData.theLoai.map(item => (<Link key={item._id} to={`/the-loai/${item.slug}`} className="text-xs text-gray-400 hover:text-white p-2 hover:bg-white/5 rounded block truncate">{item.name}</Link>))}
                            </div>
                        </div>
                    </div>
                </div>

                {user && (
                    <div className="p-4 border-t border-white/5 bg-black/20">
                        <button onClick={handleLogout} className="w-full flex items-center justify-center gap-2 bg-red-900/10 text-red-500 border border-red-900/30 py-3 rounded-xl font-bold hover:bg-red-900/30 transition text-sm">
                            <FaSignOutAlt /> Đăng Xuất
                        </button>
                    </div>
                )}
            </div>
        </>
    );
};

export default Header;