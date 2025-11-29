import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaSearch, FaChevronDown, FaTimes, FaSpinner, FaBars, FaChevronUp, FaArrowRight, FaList } from 'react-icons/fa';
import { getMenuData, searchMovies } from '../../services/movieService';
import { useDebounce } from '../../hooks/useDebounce';
import { getCurrentUser, logout } from '../../services/authService';
import Logo from '../common/Logo';

const Header = () => {
    const navigate = useNavigate();
    const [isScrolled, setIsScrolled] = useState(false);
    const [menuData, setMenuData] = useState({ theLoai: [], quocGia: [] });

    const [showSearch, setShowSearch] = useState(false);
    const [keyword, setKeyword] = useState('');
    const [results, setResults] = useState([]);
    const [isSearching, setIsSearching] = useState(false);

    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [activeMobileSubmenu, setActiveMobileSubmenu] = useState('');

    const [user, setUser] = useState(null);

    const debouncedKeyword = useDebounce(keyword, 500);
    const searchRef = useRef(null);

    const listItems = [
        { name: 'Phim Mới Cập Nhật', slug: 'phim-moi' },
        { name: 'Phim Bộ Đang Chiếu', slug: 'phim-bo' },
        { name: 'Phim Lẻ Đặc Sắc', slug: 'phim-le' },
        { name: 'TV Shows / Gameshow', slug: 'tv-shows' },
        { name: 'Hoạt Hình / Anime', slug: 'hoat-hinh' },
        { name: 'Phim Sắp Chiếu', slug: 'phim-sap-chieu' },
    ];

    useEffect(() => {
        const handleScroll = () => setIsScrolled(window.scrollY > 0);
        window.addEventListener('scroll', handleScroll);

        const handleClickOutside = (event) => {
            if (searchRef.current && !searchRef.current.contains(event.target)) {
                setShowSearch(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);

        const fetchMenu = async () => {
            const data = await getMenuData();
            if (data) setMenuData(data);
        };
        fetchMenu();

        const currentUser = getCurrentUser();
        if (currentUser) setUser(currentUser);

        return () => {
            window.removeEventListener('scroll', handleScroll);
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

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

    const handleMovieClick = (slug) => {
        navigate(`/phim/${slug}`);
        setShowSearch(false);
        setKeyword('');
    };

    const toggleMobileSubmenu = (menuName) => {
        setActiveMobileSubmenu(activeMobileSubmenu === menuName ? '' : menuName);
    };

    const handleLogout = () => {
        logout();
        setUser(null);
        setMobileMenuOpen(false);
    };

    return (
        <>
            <header className={`${isScrolled ? 'bg-phim-dark/95 backdrop-blur-md shadow-2xl' : 'bg-gradient-to-b from-black/90 via-black/50 to-transparent'} fixed top-0 w-full z-[100] transition-all duration-500 h-16 md:h-20`}>
                <div className="w-full h-full px-4 md:px-12 flex items-center justify-between">

                    {/* --- LEFT --- */}
                    <div className="flex items-center gap-4 lg:gap-12">
                        <button className="lg:hidden text-white text-2xl hover:text-phim-accent transition" onClick={() => setMobileMenuOpen(true)}>
                            <FaBars />
                        </button>

                        {/* 2. THAY THẾ ĐOẠN H1 CŨ BẰNG COMPONENT LOGO */}
                        <div onClick={() => navigate('/')}>
                            <Logo />
                        </div>

                        <ul className="hidden lg:flex items-center gap-8 text-sm font-medium text-gray-300 h-full">
                            <li onClick={() => navigate('/')} className="hover:text-white cursor-pointer transition py-2 font-bold">Trang chủ</li>

                            {/* DANH SÁCH */}
                            <li className="group relative h-full flex items-center hover:text-white cursor-pointer z-50">
                                <span className="flex items-center gap-1 font-bold py-6">Danh sách <FaChevronDown size={10} /></span>
                                <div className="absolute top-[90%] left-0 w-[400px] bg-[#1a1a1a]/95 backdrop-blur-xl border border-white/10 rounded-xl shadow-2xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 translate-y-4 group-hover:translate-y-0 overflow-hidden">
                                    <div className="p-6 grid grid-cols-2 gap-4">
                                        {listItems.map((item) => (
                                            <a key={item.slug} href={`/danh-sach/${item.slug}`} className="text-gray-400 hover:text-phim-accent text-sm flex items-center gap-2 transition-colors hover:translate-x-1">
                                                <FaList className="text-xs opacity-50" /> {item.name}
                                            </a>
                                        ))}
                                    </div>
                                </div>
                            </li>
                            {/* THỂ LOẠI */}
                            <li className="group relative h-full flex items-center hover:text-white cursor-pointer z-50">
                                <span className="flex items-center gap-1 font-bold py-6">Thể loại <FaChevronDown size={10} /></span>
                                <div className="absolute top-[90%] left-0 w-[650px] bg-[#1a1a1a]/95 backdrop-blur-xl border border-white/10 rounded-xl shadow-2xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 translate-y-4 group-hover:translate-y-0 overflow-hidden">
                                    <div className="p-6 grid grid-cols-4 gap-3">
                                        {menuData.theLoai.slice(0, 24).map((item) => (
                                            <a key={item._id} href={`/the-loai/${item.slug}`} className="text-gray-400 hover:text-phim-accent text-sm block transition-colors hover:translate-x-1">{item.name}</a>
                                        ))}
                                    </div>
                                    <div className="p-3 text-center border-t border-white/10">
                                        <a href="/the-loai" className="text-gray-300 font-bold text-xs uppercase tracking-widest flex items-center justify-center gap-2 hover:text-phim-accent transition">
                                            Xem tất cả <FaArrowRight size={10} />
                                        </a>
                                    </div>
                                </div>
                            </li>
                            {/* QUỐC GIA */}
                            <li className="group relative h-full flex items-center hover:text-white cursor-pointer z-50">
                                <span className="flex items-center gap-1 font-bold py-6">Quốc gia <FaChevronDown size={10} /></span>
                                <div className="absolute top-[90%] left-0 w-[500px] bg-[#1a1a1a]/95 backdrop-blur-xl border border-white/10 rounded-xl shadow-2xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 translate-y-4 group-hover:translate-y-0 overflow-hidden">
                                    <div className="p-6 grid grid-cols-3 gap-3">
                                        {menuData.quocGia.slice(0, 18).map((item) => (
                                            <a key={item._id} href={`/quoc-gia/${item.slug}`} className="text-gray-400 hover:text-phim-accent text-sm block transition-colors hover:translate-x-1">{item.name}</a>
                                        ))}
                                    </div>
                                    <div className="p-3 text-center border-t border-white/10">
                                        <a href="/quoc-gia" className="text-gray-300 font-bold text-xs uppercase tracking-widest flex items-center justify-center gap-2 hover:text-phim-accent transition">
                                            Xem tất cả <FaArrowRight size={10} />
                                        </a>
                                    </div>
                                </div>
                            </li>
                        </ul>
                    </div>

                    {/* --- RIGHT --- */}
                    <div className="flex items-center gap-3" ref={searchRef}>
                        <div className={`relative flex items-center bg-white/10 border border-white/20 rounded-full transition-all duration-300 ${showSearch ? 'w-48 sm:w-64 px-3 py-1.5 bg-black/80 border-phim-accent ring-1 ring-phim-accent/50' : 'w-9 h-9 justify-center border-transparent bg-transparent hover:bg-white/10'}`}>
                            {showSearch ? (
                                <form onSubmit={handleEnterSearch} className="flex-1 flex items-center w-full">
                                    <input type="text" placeholder="Tìm phim..." className="bg-transparent border-none outline-none text-white text-sm w-full placeholder-gray-500 font-medium" value={keyword} onChange={(e) => setKeyword(e.target.value)} autoFocus />
                                    {isSearching ? <FaSpinner className="text-phim-accent animate-spin ml-2 text-xs" /> : <FaTimes className="text-gray-400 cursor-pointer hover:text-white ml-2 text-xs" onClick={() => { setShowSearch(false); setKeyword(''); setResults([]); }} />}
                                </form>
                            ) : (
                                <FaSearch className="text-white text-lg cursor-pointer hover:text-phim-accent transition" onClick={() => setShowSearch(true)} />
                            )}
                            {showSearch && keyword.length > 0 && (
                                <div className="absolute top-full right-0 mt-3 w-[85vw] max-w-[350px] bg-[#1a1a1a] border border-white/10 rounded-xl shadow-2xl overflow-hidden animate-fade-in-up z-[110]">
                                    {results.length > 0 ? (
                                        <div className="max-h-[50vh] overflow-y-auto custom-scrollbar">
                                            {results.slice(0, 5).map((movie) => (
                                                <div key={movie._id} onClick={() => handleMovieClick(movie.slug)} className="flex items-start gap-3 p-3 hover:bg-white/10 cursor-pointer border-b border-white/5 last:border-0 group">
                                                    <div className="w-10 h-14 rounded overflow-hidden flex-shrink-0 relative shadow-md">
                                                        <img src={movie.thumb_url} alt="" className="w-full h-full object-cover" />
                                                        <div className="absolute inset-0 bg-black/30 group-hover:bg-transparent transition" />
                                                    </div>
                                                    <div className="flex-1 min-w-0">
                                                        <h4 className="text-sm font-bold text-white truncate group-hover:text-phim-accent transition">{movie.name}</h4>
                                                        <p className="text-[10px] text-gray-400 truncate mt-0.5">{movie.origin_name} ({movie.year})</p>
                                                    </div>
                                                </div>
                                            ))}
                                            <div onClick={(e) => handleEnterSearch(e)} className="p-3 text-center bg-phim-accent/10 text-phim-accent text-xs font-bold cursor-pointer hover:bg-phim-accent/20 transition">Xem tất cả kết quả</div>
                                        </div>
                                    ) : (!isSearching && <div className="p-4 text-center text-gray-500 text-xs">Không tìm thấy phim.</div>)}
                                </div>
                            )}
                        </div>

                        {user ? (
                            <div className="hidden sm:flex items-center gap-3 group relative cursor-pointer ml-2">
                                <div className="text-right">
                                    <p className="text-[10px] text-gray-400 uppercase tracking-wider">Xin chào</p>
                                    <p className="text-sm font-bold text-white max-w-[100px] truncate">{user.fullname || user.username}</p>
                                </div>
                                <div className="w-9 h-9 rounded-full overflow-hidden border-2 border-transparent group-hover:border-phim-accent transition bg-gray-700">
                                    <img src={user.avatar} alt="User" className="w-full h-full object-cover" />
                                </div>
                                <div className="absolute top-full right-0 mt-2 w-48 bg-[#1a1a1a] border border-white/10 rounded-xl shadow-2xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 overflow-hidden">
                                    <div className="py-1">
                                        <button onClick={() => navigate('/ho-so')} className="w-full text-left px-4 py-2 text-sm text-gray-300 hover:bg-white/10 hover:text-white transition">Hồ sơ cá nhân</button>
                                        {/* --- SỬA TẠI ĐÂY: /tu-phim --- */}
                                        <button onClick={() => navigate('/tu-phim')} className="w-full text-left px-4 py-2 text-sm text-gray-300 hover:bg-white/10 hover:text-white transition">Phim yêu thích</button>
                                        <div className="border-t border-white/10 my-1"></div>
                                        <button onClick={handleLogout} className="w-full text-left px-4 py-2 text-sm text-red-500 hover:bg-red-500/10 transition font-bold">Đăng xuất</button>
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <div className="flex items-center gap-3 ml-4 border-l border-white/20 pl-4 h-6 hidden sm:flex">
                                <button onClick={() => navigate('/register')} className="text-white font-bold text-sm hover:text-gray-300 transition px-2">Đăng ký</button>
                                <button onClick={() => navigate('/login')} className="bg-phim-accent hover:bg-red-700 text-white text-sm font-bold px-5 py-1.5 rounded transition shadow-lg">Đăng nhập</button>
                            </div>
                        )}
                    </div>
                </div>
            </header>

            {/* --- MOBILE SIDEBAR --- */}
            <div className={`fixed inset-0 bg-black/80 z-[150] transition-opacity duration-300 lg:hidden ${mobileMenuOpen ? 'opacity-100 visible' : 'opacity-0 invisible'}`} onClick={() => setMobileMenuOpen(false)} />
            <div className={`fixed top-0 left-0 w-[80%] max-w-[300px] h-full bg-[#111] z-[200] transform transition-transform duration-300 ease-in-out lg:hidden flex flex-col ${mobileMenuOpen ? 'translate-x-0' : '-translate-x-full'} shadow-2xl`}>

                {user ? (
                    <div className="p-5 border-b border-white/10 bg-black/30 flex items-center gap-3">
                        <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-phim-accent">
                            <img src={user.avatar} alt="User" className="w-full h-full object-cover" />
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="text-xs text-gray-400">Đang đăng nhập</p>
                            <p className="text-white font-bold truncate">{user.fullname || user.username}</p>
                        </div>
                        <button onClick={() => setMobileMenuOpen(false)} className="text-gray-400 hover:text-white"><FaTimes /></button>
                    </div>
                ) : (
                    <div className="p-5 border-b border-white/10 flex justify-between items-center bg-black/20">
                        <h2 className="text-phim-accent text-2xl font-black uppercase">PhimVietHay</h2>
                        <button onClick={() => setMobileMenuOpen(false)} className="text-gray-400 hover:text-white text-xl"><FaTimes /></button>
                    </div>
                )}

                <div className="flex-1 overflow-y-auto p-4 space-y-2">
                    <a href="/" className="block py-3 px-4 rounded-lg bg-white/5 text-white font-bold hover:bg-phim-accent hover:text-white transition">Trang Chủ</a>

                    {/* ... (Giữ nguyên phần menu xổ xuống của Danh sách, Thể loại, Quốc gia) ... */}
                    {/* Bạn copy lại từ code cũ của bạn hoặc mình gửi lại nếu cần, logic toggle không đổi */}
                    <div>
                        <button onClick={() => toggleMobileSubmenu('danh-sach')} className="w-full flex justify-between items-center py-3 px-4 rounded-lg text-gray-300 font-bold hover:bg-white/5 transition">
                            Danh Sách {activeMobileSubmenu === 'danh-sach' ? <FaChevronUp size={12} /> : <FaChevronDown size={12} />}
                        </button>
                        <div className={`pl-4 overflow-hidden transition-all duration-300 ${activeMobileSubmenu === 'danh-sach' ? 'max-h-[500px] opacity-100 mt-2' : 'max-h-0 opacity-0'}`}>
                            <div className="grid grid-cols-2 gap-2 border-l-2 border-white/10 pl-3">
                                {listItems.map((item) => (
                                    <a key={item.slug} href={`/danh-sach/${item.slug}`} className="text-sm text-gray-400 py-1 hover:text-phim-accent block truncate">{item.name}</a>
                                ))}
                            </div>
                        </div>
                    </div>

                    <div>
                        <button onClick={() => toggleMobileSubmenu('the-loai')} className="w-full flex justify-between items-center py-3 px-4 rounded-lg text-gray-300 font-bold hover:bg-white/5 transition">
                            Thể Loại {activeMobileSubmenu === 'the-loai' ? <FaChevronUp size={12} /> : <FaChevronDown size={12} />}
                        </button>
                        <div className={`pl-4 overflow-hidden transition-all duration-300 ${activeMobileSubmenu === 'the-loai' ? 'max-h-[500px] opacity-100 mt-2' : 'max-h-0 opacity-0'}`}>
                            <div className="grid grid-cols-2 gap-2 border-l-2 border-white/10 pl-3">
                                {menuData.theLoai.map((item) => (
                                    <a key={item._id} href={`/the-loai/${item.slug}`} className="text-sm text-gray-400 py-1 hover:text-phim-accent block truncate">{item.name}</a>
                                ))}
                                <a href="/the-loai" className="text-sm text-phim-accent font-bold py-1 flex items-center gap-1 col-span-2 mt-1">Xem tất cả <FaArrowRight size={10} /></a>
                            </div>
                        </div>
                    </div>

                    <div>
                        <button onClick={() => toggleMobileSubmenu('quoc-gia')} className="w-full flex justify-between items-center py-3 px-4 rounded-lg text-gray-300 font-bold hover:bg-white/5 transition">
                            Quốc Gia {activeMobileSubmenu === 'quoc-gia' ? <FaChevronUp size={12} /> : <FaChevronDown size={12} />}
                        </button>
                        <div className={`pl-4 overflow-hidden transition-all duration-300 ${activeMobileSubmenu === 'quoc-gia' ? 'max-h-[500px] opacity-100 mt-2' : 'max-h-0 opacity-0'}`}>
                            <div className="grid grid-cols-2 gap-2 border-l-2 border-white/10 pl-3">
                                {menuData.quocGia.map((item) => (
                                    <a key={item._id} href={`/quoc-gia/${item.slug}`} className="text-sm text-gray-400 py-1 hover:text-phim-accent block truncate">{item.name}</a>
                                ))}
                                <a href="/quoc-gia" className="text-sm text-phim-accent font-bold py-1 flex items-center gap-1 col-span-2 mt-1">Xem tất cả <FaArrowRight size={10} /></a>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Footer Sidebar (Auth Mobile) */}
                <div className="p-5 border-t border-white/10 text-center flex flex-col gap-3">
                    {user ? (
                        <>
                            <button onClick={() => navigate('/ho-so')} className="w-full border border-white/20 text-white font-bold py-3 rounded-lg hover:bg-white/10 transition">Hồ sơ cá nhân</button>
                            {/* --- SỬA TẠI ĐÂY: /tu-phim --- */}
                            <button onClick={() => navigate('/tu-phim')} className="w-full border border-white/20 text-white font-bold py-3 rounded-lg hover:bg-white/10 transition">Tủ Phim</button>
                            <button onClick={handleLogout} className="w-full bg-red-900/50 text-red-500 font-bold py-3 rounded-lg border border-red-900 hover:bg-red-900 transition">Đăng Xuất</button>
                        </>
                    ) : (
                        <>
                            <button onClick={() => navigate('/register')} className="w-full border border-white/20 text-white font-bold py-3 rounded-lg hover:bg-white/10 transition">Đăng Ký</button>
                            <button onClick={() => navigate('/login')} className="w-full bg-phim-accent text-white font-bold py-3 rounded-lg shadow-lg hover:bg-red-700 transition">Đăng Nhập</button>
                        </>
                    )}
                </div>
            </div>
        </>
    );
};

export default Header;