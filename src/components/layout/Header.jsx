import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom'; 
import { 
    FaSearch, FaChevronDown, FaTimes, FaSpinner, FaBars, 
    FaChevronUp, FaList, FaHistory, FaUser, FaHeart, 
    FaSignOutAlt, FaCog, FaFilm, FaChartBar 
} from 'react-icons/fa';

import { getMenuData, searchMovies } from '../../services/movieService';
import { useDebounce } from '../../hooks/useDebounce';
import { getCurrentUser, logout } from '../../services/authService';

import Logo from '../common/Logo';
import UserAvatar from '../common/UserAvatar';

const Header = () => {
    const navigate = useNavigate();
    
    // UI States
    const [isScrolled, setIsScrolled] = useState(false);
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [activeMobileSubmenu, setActiveMobileSubmenu] = useState('');

    // Data States
    const [menuData, setMenuData] = useState({ theLoai: [], quocGia: [] });
    const [user, setUser] = useState(null);

    // Search States
    const [showSearch, setShowSearch] = useState(false);
    const [keyword, setKeyword] = useState('');
    const [results, setResults] = useState([]);
    const [isSearching, setIsSearching] = useState(false);

    const debouncedKeyword = useDebounce(keyword, 500);
    const searchRef = useRef(null);

    const listItems = [
        { name: 'Phim Mới', slug: 'phim-moi' },
        { name: 'Phim Bộ', slug: 'phim-bo' },
        { name: 'Phim Lẻ', slug: 'phim-le' },
        { name: 'TV Shows', slug: 'tv-shows' },
        { name: 'Hoạt Hình', slug: 'hoat-hinh' },
        { name: 'Sắp Chiếu', slug: 'phim-sap-chieu' },
    ];

    useEffect(() => {
        const handleScroll = () => setIsScrolled(window.scrollY > 0);
        
        const handleClickOutside = (event) => {
            if (searchRef.current && !searchRef.current.contains(event.target)) {
                setShowSearch(false);
            }
        };

        const fetchMenu = async () => {
            const data = await getMenuData();
            if (data) setMenuData(data);
        };

        window.addEventListener('scroll', handleScroll);
        document.addEventListener('mousedown', handleClickOutside);
        
        fetchMenu();
        
        const currentUser = getCurrentUser();
        if (currentUser) setUser(currentUser);

        return () => {
            window.removeEventListener('scroll', handleScroll);
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    // Xử lý tìm kiếm với debounce
    useEffect(() => {
        const fetchApiSearch = async () => {
            if (!debouncedKeyword.trim()) {
                setResults([]);
                return;
            }
            setIsSearching(true);
            const data = await searchMovies(debouncedKeyword);
            setIsSearching(false);
            
            if (data?.data?.items) {
                setResults(data.data.items);
            } else {
                setResults([]);
            }
        };
        fetchApiSearch();
    }, [debouncedKeyword]);

    const handleEnterSearch = (e) => {
        e.preventDefault();
        if (keyword.trim()) {
            navigate(`/tim-kiem?keyword=${keyword}`);
            setShowSearch(false);
        }
    };

    const toggleMobileSubmenu = (menuName) => {
        setActiveMobileSubmenu(activeMobileSubmenu === menuName ? '' : menuName);
    };

    const handleLogout = () => {
        logout();
        setUser(null);
        setMobileMenuOpen(false);
        navigate('/login');
    };

    return (
        <>
            <header className={`${isScrolled ? 'bg-[#0a0e17]/95 backdrop-blur-md shadow-2xl border-b border-white/5' : 'bg-gradient-to-b from-black/90 via-black/40 to-transparent'} fixed top-0 w-full z-[100] transition-all duration-500 h-16 md:h-20`}>
                <div className="w-full h-full px-4 md:px-12 flex items-center justify-between">
                    
                    {/* Logo & Navigation */}
                    <div className="flex items-center gap-4 lg:gap-10">
                        <button 
                            className="lg:hidden text-white text-2xl p-2 hover:bg-white/10 rounded-lg transition" 
                            onClick={() => setMobileMenuOpen(true)}
                        >
                            <FaBars />
                        </button>
                        
                        <Link to="/" className="block hover:opacity-90 transition">
                            <Logo />
                        </Link>

                        {/* Desktop Menu */}
                        <ul className="hidden lg:flex items-center gap-6 text-sm font-medium text-gray-300 h-full">
                            <li>
                                <Link to="/" className="hover:text-white transition hover:scale-105 block py-6">
                                    Trang chủ
                                </Link>
                            </li>
                            
                            <li className="group relative h-full flex items-center hover:text-white cursor-pointer z-50">
                                <span className="flex items-center gap-1 py-6">Danh sách <FaChevronDown size={8}/></span>
                                <div className="absolute top-[80%] left-0 w-48 bg-[#111] border border-white/10 rounded-lg shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 translate-y-2 group-hover:translate-y-0 overflow-hidden py-2">
                                    {listItems.map((item) => (
                                        <Link 
                                            key={item.slug} 
                                            to={`/danh-sach/${item.slug}`} 
                                            className="text-gray-400 hover:text-white hover:bg-white/5 text-sm block px-4 py-2 transition-colors"
                                        >
                                            {item.name}
                                        </Link>
                                    ))}
                                </div>
                            </li>

                            <li className="group relative h-full flex items-center hover:text-white cursor-pointer z-50">
                                <span className="flex items-center gap-1 py-6">Thể loại <FaChevronDown size={8}/></span>
                                <div className="absolute top-[80%] left-0 w-[600px] bg-[#111] border border-white/10 rounded-lg shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 translate-y-2 group-hover:translate-y-0 overflow-hidden p-4">
                                    <div className="grid grid-cols-4 gap-2">
                                        {menuData.theLoai.slice(0, 24).map((item) => (
                                            <Link 
                                                key={item._id} 
                                                to={`/the-loai/${item.slug}`} 
                                                className="text-gray-400 hover:text-phim-accent text-sm block transition-colors hover:translate-x-1"
                                            >
                                                {item.name}
                                            </Link>
                                        ))}
                                    </div>
                                </div>
                            </li>

                            <li className="group relative h-full flex items-center hover:text-white cursor-pointer z-50">
                                <span className="flex items-center gap-1 py-6">Quốc gia <FaChevronDown size={8}/></span>
                                <div className="absolute top-[80%] left-0 w-[400px] bg-[#111] border border-white/10 rounded-lg shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 translate-y-2 group-hover:translate-y-0 overflow-hidden p-4">
                                    <div className="grid grid-cols-3 gap-2">
                                        {menuData.quocGia.slice(0, 18).map((item) => (
                                            <Link 
                                                key={item._id} 
                                                to={`/quoc-gia/${item.slug}`} 
                                                className="text-gray-400 hover:text-phim-accent text-sm block transition-colors hover:translate-x-1"
                                            >
                                                {item.name}
                                            </Link>
                                        ))}
                                    </div>
                                </div>
                            </li>

                            {/* [ĐÃ CHUYỂN] Rạp Phim xuống cuối cùng */}
                            <li>
                                <Link to="/watch-party" className="group py-6 flex items-center gap-2 hover:text-white transition hover:scale-105">
                                    <span className="text-red-500 group-hover:text-red-400 transition-colors"></span>
                                    <span className="font-bold tracking-wide">Rạp Phim</span>
                                    {/* Tag NEW nằm ngang */}
                                    <span className="bg-red-600 text-white text-[9px] px-1.5 py-0.5 rounded-sm animate-pulse font-bold border border-red-400 shadow-[0_0_10px_rgba(220,38,38,0.6)] ml-1">
                                        NEW
                                    </span>
                                </Link>
                            </li>
                        </ul>
                    </div>

                    {/* Search & User Action */}
                    <div className="flex items-center gap-4" ref={searchRef}>
                        <div className={`relative flex items-center bg-black/40 border border-white/10 rounded-full transition-all duration-300 ${showSearch ? 'w-48 sm:w-64 px-3 py-1.5 border-phim-accent' : 'w-8 h-8 justify-center hover:bg-white/10'}`}>
                            {showSearch ? (
                                <form onSubmit={handleEnterSearch} className="flex-1 flex items-center w-full">
                                    <input 
                                            type="text" 
                                            placeholder="Tìm tên phim..." 
                                            className="bg-transparent border-none outline-none text-white text-sm w-full placeholder-gray-500 font-medium" 
                                            value={keyword} 
                                            onChange={(e) => setKeyword(e.target.value)} 
                                            autoFocus 
                                    />
                                    {isSearching ? (
                                        <FaSpinner className="text-phim-accent animate-spin ml-2 text-xs" />
                                    ) : (
                                        <FaTimes 
                                            className="text-gray-400 cursor-pointer hover:text-white ml-2 text-xs" 
                                            onClick={() => { setShowSearch(false); setKeyword(''); setResults([]); }} 
                                        />
                                    )}
                                </form>
                            ) : (
                                <FaSearch className="text-gray-300 text-sm cursor-pointer hover:text-white transition" onClick={() => setShowSearch(true)} />
                            )}
                            
                            {/* Search Results Dropdown */}
                            {showSearch && keyword.length > 0 && (
                                <div className="absolute top-full right-0 mt-2 w-[300px] bg-[#111] border border-white/10 rounded-lg shadow-2xl overflow-hidden animate-fade-in-up z-[110]">
                                    {results.length > 0 ? (
                                        <div className="max-h-[400px] overflow-y-auto custom-scrollbar">
                                            {results.slice(0, 5).map((movie) => (
                                                <Link 
                                                    key={movie._id} 
                                                    to={`/phim/${movie.slug}`} 
                                                    onClick={() => { setShowSearch(false); setKeyword(''); }}
                                                    className="flex items-center gap-3 p-2 hover:bg-white/5 cursor-pointer border-b border-white/5 last:border-0"
                                                >
                                                    <img src={movie.thumb_url} alt="" className="w-8 h-10 object-cover rounded" />
                                                    <div className="flex-1 min-w-0">
                                                        <h4 className="text-sm text-white truncate">{movie.name}</h4>
                                                        <p className="text-[10px] text-gray-500 truncate">{movie.year}</p>
                                                    </div>
                                                </Link>
                                            ))}
                                            <div onClick={(e) => handleEnterSearch(e)} className="p-2 text-center text-xs text-phim-accent font-bold cursor-pointer hover:bg-white/5">
                                                Xem tất cả
                                            </div>
                                        </div>
                                    ) : (
                                        !isSearching && <div className="p-3 text-center text-gray-500 text-xs">Không tìm thấy.</div>
                                    )}
                                </div>
                            )}
                        </div>

                        {user ? (
                            <div className="hidden sm:flex items-center gap-3 group relative cursor-pointer">
                                <UserAvatar user={user} className="w-8 h-8 group-hover:border-phim-accent transition duration-300" />
                                <FaChevronDown className="text-[10px] text-gray-500 group-hover:text-white transition" />
                                
                                <div className="absolute top-full right-0 pt-2 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 transform translate-y-1 group-hover:translate-y-0 w-48 z-50">
                                    <div className="bg-[#161616] border border-white/10 rounded-lg shadow-xl overflow-hidden">
                                        
                                        {/* USER INFO */}
                                        <div className="px-4 py-3 border-b border-white/5 flex items-center gap-2">
                                            <UserAvatar user={user} className="w-8 h-8" />
                                            <div className="flex-1 min-w-0">
                                                <p className="text-sm font-bold text-white truncate">{user.fullname || user.username}</p>
                                                <p className="text-[10px] text-gray-500 font-bold uppercase">
                                                    {user.role === 'super_admin' ? 'Super Admin' : user.role}
                                                </p>
                                            </div>
                                        </div>

                                        <div className="py-1 flex flex-col">
                                            {(user.role === 'admin' || user.role === 'super_admin') && (
                                                <Link 
                                                    to="/admin" 
                                                    className="w-full text-left px-4 py-2 text-sm text-yellow-500 hover:bg-white/5 hover:text-yellow-400 transition flex items-center gap-2 font-bold"
                                                >
                                                    <FaChartBar className="text-xs" /> Dashboard
                                                </Link>
                                            )}

                                            <Link to="/ho-so" className="w-full text-left px-4 py-2 text-sm text-gray-300 hover:bg-white/5 hover:text-white transition flex items-center gap-2"><FaUser className="text-xs" /> Hồ sơ</Link>
                                            <Link to="/tu-phim" className="w-full text-left px-4 py-2 text-sm text-gray-300 hover:bg-white/5 hover:text-white transition flex items-center gap-2"><FaHeart className="text-xs" /> Tủ phim</Link>
                                            <Link to="/lich-su" className="w-full text-left px-4 py-2 text-sm text-gray-300 hover:bg-white/5 hover:text-white transition flex items-center gap-2"><FaHistory className="text-xs" /> Lịch sử</Link>
                                        </div>
                                        
                                        <div className="border-t border-white/10 py-1">
                                            <button onClick={handleLogout} className="w-full text-left px-4 py-2 text-sm text-red-500 hover:bg-red-500/10 transition flex items-center gap-2"><FaSignOutAlt className="text-xs" /> Đăng xuất</button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <div className="flex items-center gap-3 ml-2">
                                <Link to="/login" className="bg-phim-accent hover:bg-red-700 text-white text-xs font-bold px-4 py-1.5 rounded transition">
                                    Đăng nhập
                                </Link>
                            </div>
                        )}
                    </div>
                </div>
            </header>

            {/* --- MOBILE SIDEBAR --- */}
            <div 
                className={`fixed inset-0 bg-black/80 z-[150] transition-opacity duration-300 lg:hidden ${mobileMenuOpen ? 'opacity-100 visible' : 'opacity-0 invisible'}`} 
                onClick={() => setMobileMenuOpen(false)} 
            />
            
            <div className={`fixed top-0 left-0 w-[85%] max-w-[320px] h-full bg-[#111] z-[200] transform transition-transform duration-300 ease-in-out lg:hidden flex flex-col ${mobileMenuOpen ? 'translate-x-0' : '-translate-x-full'} shadow-2xl border-r border-white/10`}>
                <div className="p-6 border-b border-white/10 bg-gradient-to-b from-black/40 to-transparent">
                    <div className="flex justify-between items-start mb-4">
                        {user ? (
                            <Link to="/ho-so" className="flex items-center gap-3" onClick={() => setMobileMenuOpen(false)}>
                                <UserAvatar user={user} className="w-12 h-12 border-2 border-phim-accent" />
                                <div>
                                    <p className="text-white font-bold text-lg">{user.fullname || user.username}</p>
                                    <p className="text-xs text-gray-400">{user.email}</p>
                                </div>
                            </Link>
                        ) : (
                            <Logo />
                        )}
                        <button onClick={() => setMobileMenuOpen(false)} className="text-gray-400 hover:text-white p-1">
                            <FaTimes size={20}/>
                        </button>
                    </div>
                    
                    {user && (
                        <div className="grid grid-cols-3 gap-2 mt-4">
                            <Link to="/tu-phim" onClick={() => setMobileMenuOpen(false)} className="flex flex-col items-center gap-1 p-2 rounded-lg bg-white/5 hover:bg-white/10 transition"><FaHeart className="text-red-500" /> <span className="text-[10px] text-gray-300">Yêu thích</span></Link>
                            <Link to="/lich-su" onClick={() => setMobileMenuOpen(false)} className="flex flex-col items-center gap-1 p-2 rounded-lg bg-white/5 hover:bg-white/10 transition"><FaHistory className="text-blue-400" /> <span className="text-[10px] text-gray-300">Lịch sử</span></Link>
                            <Link to="/ho-so" onClick={() => setMobileMenuOpen(false)} className="flex flex-col items-center gap-1 p-2 rounded-lg bg-white/5 hover:bg-white/10 transition"><FaCog className="text-gray-400" /> <span className="text-[10px] text-gray-300">Cài đặt</span></Link>
                        </div>
                    )}
                </div>

                <div className="flex-1 overflow-y-auto p-4 space-y-1 custom-scrollbar">
                    {/* MOBILE DASHBOARD LINK */}
                    {(user?.role === 'admin' || user?.role === 'super_admin') && (
                        <Link to="/admin" onClick={() => setMobileMenuOpen(false)} className="w-full flex items-center gap-3 py-3 px-4 rounded-lg bg-yellow-900/20 text-yellow-500 font-bold mb-2 border border-yellow-900/50">
                            <span className="w-6 text-center"><FaChartBar/></span> Dashboard Quản Trị
                        </Link>
                    )}

                    <Link to="/" onClick={() => setMobileMenuOpen(false)} className="flex items-center gap-3 py-3 px-4 rounded-lg hover:bg-white/5 text-white font-medium transition">
                        <span className="w-6 text-center"><FaFilm className="text-phim-accent"/></span> Trang Chủ
                    </Link>

                    {/* Link Rạp Phim Mobile (Cũng đẹp) */}
                    <Link to="/watch-party" onClick={() => setMobileMenuOpen(false)} className="flex items-center justify-between py-3 px-4 rounded-lg bg-red-900/20 hover:bg-red-900/30 text-white font-bold transition border border-red-900/40">
                        <div className="flex items-center gap-3">
                            <span className="w-6 text-center"><FaFilm className="text-red-500"/></span> Rạp Phim
                        </div>
                        <span className="bg-red-600 text-white text-[9px] px-2 py-0.5 rounded-full animate-pulse shadow-lg">NEW</span>
                    </Link>

                    <div>
                        <button onClick={() => toggleMobileSubmenu('danh-sach')} className="w-full flex justify-between items-center py-3 px-4 rounded-lg text-gray-300 hover:text-white hover:bg-white/5 transition font-medium">
                            <div className="flex items-center gap-3"><span className="w-6 text-center"><FaList/></span> Danh Sách</div>
                            {activeMobileSubmenu === 'danh-sach' ? <FaChevronUp size={10}/> : <FaChevronDown size={10}/>}
                        </button>
                        <div className={`pl-11 pr-2 overflow-hidden transition-all duration-300 ${activeMobileSubmenu === 'danh-sach' ? 'max-h-[500px] opacity-100 pb-2' : 'max-h-0 opacity-0'}`}>
                            <div className="grid grid-cols-1 gap-1 border-l border-white/10 pl-3">
                                {listItems.map((item) => (
                                    <Link key={item.slug} to={`/danh-sach/${item.slug}`} onClick={() => setMobileMenuOpen(false)} className="text-sm text-gray-500 py-2 hover:text-white block">{item.name}</Link>
                                ))}
                            </div>
                        </div>
                    </div>

                    <div>
                        <button onClick={() => toggleMobileSubmenu('the-loai')} className="w-full flex justify-between items-center py-3 px-4 rounded-lg text-gray-300 hover:text-white hover:bg-white/5 transition font-medium">
                            <div className="flex items-center gap-3"><span className="w-6 text-center"><FaList/></span> Thể Loại</div>
                            {activeMobileSubmenu === 'the-loai' ? <FaChevronUp size={10}/> : <FaChevronDown size={10}/>}
                        </button>
                        <div className={`pl-11 pr-2 overflow-hidden transition-all duration-300 ${activeMobileSubmenu === 'the-loai' ? 'max-h-[500px] opacity-100 pb-2' : 'max-h-0 opacity-0'}`}>
                            <div className="grid grid-cols-2 gap-2 border-l border-white/10 pl-3 pt-2">
                                {menuData.theLoai.map((item) => (
                                    <Link key={item._id} to={`/the-loai/${item.slug}`} onClick={() => setMobileMenuOpen(false)} className="text-sm text-gray-500 py-1 hover:text-white truncate">{item.name}</Link>
                                ))}
                            </div>
                        </div>
                    </div>

                    <div>
                        <button onClick={() => toggleMobileSubmenu('quoc-gia')} className="w-full flex justify-between items-center py-3 px-4 rounded-lg text-gray-300 hover:text-white hover:bg-white/5 transition font-medium">
                            <div className="flex items-center gap-3"><span className="w-6 text-center"><FaList/></span> Quốc Gia</div>
                            {activeMobileSubmenu === 'quoc-gia' ? <FaChevronUp size={10}/> : <FaChevronDown size={10}/>}
                        </button>
                        <div className={`pl-11 pr-2 overflow-hidden transition-all duration-300 ${activeMobileSubmenu === 'quoc-gia' ? 'max-h-[500px] opacity-100 pb-2' : 'max-h-0 opacity-0'}`}>
                            <div className="grid grid-cols-2 gap-2 border-l border-white/10 pl-3 pt-2">
                                {menuData.quocGia.map((item) => (
                                    <Link key={item._id} to={`/quoc-gia/${item.slug}`} onClick={() => setMobileMenuOpen(false)} className="text-sm text-gray-400 py-1 hover:text-white block truncate">{item.name}</Link>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>

                <div className="p-6 border-t border-white/10 bg-black/20">
                    {user ? (
                        <button onClick={handleLogout} className="w-full flex items-center justify-center gap-2 bg-red-900/20 text-red-500 border border-red-900/50 py-3 rounded-xl font-bold hover:bg-red-900/40 transition">
                            <FaSignOutAlt /> Đăng Xuất
                        </button>
                    ) : (
                        <div className="grid grid-cols-2 gap-3">
                            <Link to="/login" onClick={() => setMobileMenuOpen(false)} className="bg-phim-accent text-white font-bold py-3 rounded-xl shadow-lg hover:bg-red-700 transition flex items-center justify-center">Đăng Nhập</Link>
                            <Link to="/register" onClick={() => setMobileMenuOpen(false)} className="border border-white/20 text-white font-bold py-3 rounded-xl hover:bg-white/10 transition flex items-center justify-center">Đăng Ký</Link>
                        </div>
                    )}
                </div>
            </div>
        </>
    );
};

export default Header;