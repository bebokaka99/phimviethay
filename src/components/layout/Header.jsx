import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaSearch, FaChevronDown, FaTimes, FaSpinner, FaBars, FaChevronUp, FaArrowRight, FaList, FaHistory, FaUser, FaHeart, FaSignOutAlt, FaStar } from 'react-icons/fa';
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
      { name: 'Phim Mới', slug: 'phim-moi' },
      { name: 'Phim Bộ', slug: 'phim-bo' },
      { name: 'Phim Lẻ', slug: 'phim-le' },
      { name: 'TV Shows', slug: 'tv-shows' },
      { name: 'Hoạt Hình', slug: 'hoat-hinh' },
      { name: 'Sắp Chiếu', slug: 'phim-sap-chieu' },
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
    <header className={`${isScrolled ? 'bg-[#0a0a0a]/95 backdrop-blur-sm border-b border-white/5 shadow-lg' : 'bg-gradient-to-b from-black/80 via-black/40 to-transparent'} fixed top-0 w-full z-[100] transition-all duration-500 h-16 md:h-20`}>
      <div className="w-full h-full px-4 md:px-12 flex items-center justify-between">
        
        {/* --- LEFT --- */}
        <div className="flex items-center gap-4 lg:gap-10">
            <button className="lg:hidden text-white text-2xl" onClick={() => setMobileMenuOpen(true)}>
                <FaBars />
            </button>

            <div onClick={() => navigate('/')}>
                <Logo />
            </div>
            
            <ul className="hidden lg:flex items-center gap-6 text-sm font-medium text-gray-300 h-full">
                <li onClick={() => navigate('/')} className="hover:text-white cursor-pointer transition hover:scale-105">Trang chủ</li>
                
                {/* MENU DANH SÁCH */}
                <li className="group relative h-full flex items-center hover:text-white cursor-pointer z-50">
                    <span className="flex items-center gap-1 py-6">Danh sách <FaChevronDown size={8}/></span>
                    <div className="absolute top-[80%] left-0 w-48 bg-[#111] border border-white/10 rounded-lg shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 translate-y-2 group-hover:translate-y-0 overflow-hidden py-2">
                        {listItems.map((item) => (
                            <a key={item.slug} href={`/danh-sach/${item.slug}`} className="text-gray-400 hover:text-white hover:bg-white/5 text-sm block px-4 py-2 transition-colors">
                                {item.name}
                            </a>
                        ))}
                    </div>
                </li>
                {/* MENU THỂ LOẠI */}
                <li className="group relative h-full flex items-center hover:text-white cursor-pointer z-50">
                    <span className="flex items-center gap-1 py-6">Thể loại <FaChevronDown size={8}/></span>
                    <div className="absolute top-[80%] left-0 w-[600px] bg-[#111] border border-white/10 rounded-lg shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 translate-y-2 group-hover:translate-y-0 overflow-hidden p-4">
                        <div className="grid grid-cols-4 gap-2">
                            {menuData.theLoai.slice(0, 24).map((item) => (
                                <a key={item._id} href={`/the-loai/${item.slug}`} className="text-gray-400 hover:text-phim-accent text-sm block transition-colors hover:translate-x-1">{item.name}</a>
                            ))}
                        </div>
                    </div>
                </li>
                {/* MENU QUỐC GIA */}
                <li className="group relative h-full flex items-center hover:text-white cursor-pointer z-50">
                    <span className="flex items-center gap-1 py-6">Quốc gia <FaChevronDown size={8}/></span>
                    <div className="absolute top-[80%] left-0 w-[400px] bg-[#111] border border-white/10 rounded-lg shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 translate-y-2 group-hover:translate-y-0 overflow-hidden p-4">
                        <div className="grid grid-cols-3 gap-2">
                            {menuData.quocGia.slice(0, 18).map((item) => (
                                <a key={item._id} href={`/quoc-gia/${item.slug}`} className="text-gray-400 hover:text-phim-accent text-sm block transition-colors hover:translate-x-1">{item.name}</a>
                            ))}
                        </div>
                    </div>
                </li>
            </ul>
        </div>

        {/* --- RIGHT --- */}
        <div className="flex items-center gap-4" ref={searchRef}>
             <div className={`relative flex items-center bg-black/40 border border-white/10 rounded-full transition-all duration-300 ${showSearch ? 'w-48 sm:w-64 px-3 py-1.5 border-phim-accent' : 'w-8 h-8 justify-center hover:bg-white/10'}`}>
                 {showSearch ? (
                     <form onSubmit={handleEnterSearch} className="flex-1 flex items-center w-full">
                        <input type="text" placeholder="Tìm tên phim..." className="bg-transparent border-none outline-none text-white text-sm w-full placeholder-gray-500 font-medium" value={keyword} onChange={(e) => setKeyword(e.target.value)} autoFocus />
                        {isSearching ? <FaSpinner className="text-phim-accent animate-spin ml-2 text-xs" /> : <FaTimes className="text-gray-400 cursor-pointer hover:text-white ml-2 text-xs" onClick={() => {setShowSearch(false); setKeyword(''); setResults([]);}} />}
                     </form>
                 ) : (
                     <FaSearch className="text-gray-300 text-sm cursor-pointer hover:text-white transition" onClick={() => setShowSearch(true)} />
                 )}
                 
                 {/* Search Results */}
                 {showSearch && keyword.length > 0 && (
                     <div className="absolute top-full right-0 mt-2 w-[300px] bg-[#111] border border-white/10 rounded-lg shadow-2xl overflow-hidden animate-fade-in-up z-[110]">
                         {results.length > 0 ? (
                             <div className="max-h-[400px] overflow-y-auto custom-scrollbar">
                                 {results.slice(0, 5).map((movie) => (
                                     <div key={movie._id} onClick={() => handleMovieClick(movie.slug)} className="flex items-center gap-3 p-2 hover:bg-white/5 cursor-pointer border-b border-white/5 last:border-0">
                                         <img src={movie.thumb_url} alt="" className="w-8 h-10 object-cover rounded" />
                                         <div className="flex-1 min-w-0">
                                             <h4 className="text-sm text-white truncate">{movie.name}</h4>
                                             <p className="text-[10px] text-gray-500 truncate">{movie.year}</p>
                                         </div>
                                     </div>
                                 ))}
                                 <div onClick={(e) => handleEnterSearch(e)} className="p-2 text-center text-xs text-phim-accent font-bold cursor-pointer hover:bg-white/5">Xem tất cả</div>
                             </div>
                         ) : (!isSearching && <div className="p-3 text-center text-gray-500 text-xs">Không tìm thấy.</div>)}
                     </div>
                 )}
             </div>

             {/* --- USER DROPDOWN (TỐI GIẢN & TINH TẾ) --- */}
             {user ? (
                 <div className="hidden sm:flex items-center gap-3 group relative cursor-pointer">
                     <div className="w-8 h-8 rounded-full overflow-hidden border border-white/20 group-hover:border-phim-accent transition duration-300">
                         <img src={user.avatar} alt="User" className="w-full h-full object-cover" />
                     </div>
                     {/* Mũi tên nhỏ chỉ báo dropdown */}
                     <FaChevronDown className="text-[10px] text-gray-500 group-hover:text-white transition" />

                     {/* DROPDOWN MENU GỌN GÀNG */}
                     <div className="absolute top-full right-0 pt-2 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 transform translate-y-1 group-hover:translate-y-0 w-48 z-50">
                         <div className="bg-[#161616] border border-white/10 rounded-lg shadow-xl overflow-hidden">
                             <div className="px-4 py-3 border-b border-white/5">
                                 <p className="text-sm font-bold text-white truncate">{user.fullname || user.username}</p>
                                 <p className="text-[10px] text-gray-500">Thành viên</p>
                             </div>
                             <div className="py-1">
                                 <button onClick={() => navigate('/ho-so')} className="w-full text-left px-4 py-2 text-sm text-gray-300 hover:bg-white/5 hover:text-white transition flex items-center gap-2">
                                     <FaUser className="text-xs" /> Hồ sơ
                                 </button>
                                 <button onClick={() => navigate('/tu-phim')} className="w-full text-left px-4 py-2 text-sm text-gray-300 hover:bg-white/5 hover:text-white transition flex items-center gap-2">
                                     <FaHeart className="text-xs" /> Tủ phim
                                 </button>
                                 <button onClick={() => navigate('/lich-su')} className="w-full text-left px-4 py-2 text-sm text-gray-300 hover:bg-white/5 hover:text-white transition flex items-center gap-2">
                                     <FaHistory className="text-xs" /> Lịch sử
                                 </button>
                             </div>
                             <div className="border-t border-white/10 py-1">
                                 <button onClick={handleLogout} className="w-full text-left px-4 py-2 text-sm text-red-500 hover:bg-red-500/10 transition flex items-center gap-2">
                                     <FaSignOutAlt className="text-xs" /> Đăng xuất
                                 </button>
                             </div>
                         </div>
                     </div>
                 </div>
             ) : (
                 <div className="flex items-center gap-3 ml-2">
                    <button onClick={() => navigate('/login')} className="bg-phim-accent hover:bg-red-700 text-white text-xs font-bold px-4 py-1.5 rounded transition">Đăng nhập</button>
                 </div>
             )}
        </div>
      </div>
    </header>

    {/* --- MOBILE SIDEBAR (GIỮ NGUYÊN LOGIC CŨ - VẪN TỐT) --- */}
    <div className={`fixed inset-0 bg-black/80 z-[150] transition-opacity duration-300 lg:hidden ${mobileMenuOpen ? 'opacity-100 visible' : 'opacity-0 invisible'}`} onClick={() => setMobileMenuOpen(false)} />
    <div className={`fixed top-0 left-0 w-[75%] max-w-[280px] h-full bg-[#111] z-[200] transform transition-transform duration-300 ease-in-out lg:hidden flex flex-col ${mobileMenuOpen ? 'translate-x-0' : '-translate-x-full'} shadow-2xl`}>
        <div className="p-4 border-b border-white/10 flex justify-between items-center bg-black/20">
            <h2 className="text-phim-accent text-xl font-black uppercase">PVHay</h2>
            <button onClick={() => setMobileMenuOpen(false)} className="text-gray-400 hover:text-white"><FaTimes /></button>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-1">
            <a href="/" className="block py-2.5 px-3 rounded-lg hover:bg-white/5 text-gray-300 hover:text-white font-medium text-sm transition">Trang Chủ</a>
            {/* Mobile Logic giữ nguyên... */}
            {/* Để code ngắn gọn, bạn giữ lại phần map danh sách mobile cũ nhé, nó không ảnh hưởng đến UI mới */}
             <div>
                <button onClick={() => toggleMobileSubmenu('danh-sach')} className="w-full flex justify-between items-center py-2.5 px-3 rounded-lg text-gray-300 font-medium text-sm hover:bg-white/5 transition">
                    Danh Sách {activeMobileSubmenu === 'danh-sach' ? <FaChevronUp size={10}/> : <FaChevronDown size={10}/>}
                </button>
                <div className={`pl-3 overflow-hidden transition-all duration-300 ${activeMobileSubmenu === 'danh-sach' ? 'max-h-[500px] opacity-100' : 'max-h-0 opacity-0'}`}>
                    <div className="grid grid-cols-1 gap-1 border-l border-white/10 pl-3 py-1">
                        {listItems.map((item) => (
                            <a key={item.slug} href={`/danh-sach/${item.slug}`} className="text-sm text-gray-500 py-1.5 hover:text-phim-accent block">{item.name}</a>
                        ))}
                    </div>
                </div>
            </div>
            {/* Các mục mobile khác tương tự... */}
        </div>

        {/* Footer Sidebar */}
        <div className="p-4 border-t border-white/10 flex flex-col gap-2">
            {user ? (
                <>
                    <div className="flex items-center gap-3 mb-2 px-2">
                        <img src={user.avatar} className="w-8 h-8 rounded-full" alt=""/>
                        <span className="text-sm font-bold truncate">{user.username}</span>
                    </div>
                    <button onClick={() => navigate('/ho-so')} className="w-full text-left px-3 py-2 rounded hover:bg-white/5 text-sm text-gray-300">Hồ sơ</button>
                    <button onClick={() => navigate('/tu-phim')} className="w-full text-left px-3 py-2 rounded hover:bg-white/5 text-sm text-gray-300">Tủ phim</button>
                    <button onClick={handleLogout} className="w-full text-left px-3 py-2 rounded hover:bg-red-900/20 text-sm text-red-500">Đăng xuất</button>
                </>
            ) : (
                <>
                    <button onClick={() => navigate('/login')} className="w-full bg-phim-accent text-white font-bold py-2 rounded text-sm">Đăng nhập</button>
                    <button onClick={() => navigate('/register')} className="w-full border border-white/20 text-white font-bold py-2 rounded text-sm">Đăng ký</button>
                </>
            )}
        </div>
    </div>
    </>
  );
};

export default Header;