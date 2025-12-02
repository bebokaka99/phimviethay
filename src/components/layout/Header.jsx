import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaSearch, FaChevronDown, FaTimes, FaSpinner, FaBars, FaChevronUp, FaArrowRight, FaList, FaHistory, FaUser, FaHeart, FaSignOutAlt, FaStar, FaCog, FaFilm } from 'react-icons/fa';
import { getMenuData, searchMovies } from '../../services/movieService';
import { useDebounce } from '../../hooks/useDebounce';
import { getCurrentUser, logout } from '../../services/authService';
import Logo from '../common/Logo';
// Import Component Mới
import UserAvatar from '../common/UserAvatar'; 

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
        if (searchRef.current && !searchRef.current.contains(event.target)) setShowSearch(false);
    };
    document.addEventListener('mousedown', handleClickOutside);
    const fetchMenu = async () => { const data = await getMenuData(); if (data) setMenuData(data); };
    fetchMenu();
    const currentUser = getCurrentUser();
    if (currentUser) setUser(currentUser);
    return () => { window.removeEventListener('scroll', handleScroll); document.removeEventListener('mousedown', handleClickOutside); };
  }, []);

  useEffect(() => {
      const fetchApiSearch = async () => {
          if (!debouncedKeyword.trim()) { setResults([]); return; }
          setIsSearching(true);
          const data = await searchMovies(debouncedKeyword);
          setIsSearching(false);
          if (data?.data?.items) setResults(data.data.items); else setResults([]);
      };
      fetchApiSearch();
  }, [debouncedKeyword]);

  const handleEnterSearch = (e) => { e.preventDefault(); if (keyword.trim()) { navigate(`/tim-kiem?keyword=${keyword}`); setShowSearch(false); } };
  const handleMovieClick = (slug) => { navigate(`/phim/${slug}`); setShowSearch(false); setKeyword(''); };
  const toggleMobileSubmenu = (menuName) => { setActiveMobileSubmenu(activeMobileSubmenu === menuName ? '' : menuName); };
  const handleLogout = () => { logout(); setUser(null); setMobileMenuOpen(false); };

  return (
    <>
    <header className={`${isScrolled ? 'bg-[#0a0e17]/95 backdrop-blur-md shadow-2xl border-b border-white/5' : 'bg-gradient-to-b from-black/90 via-black/40 to-transparent'} fixed top-0 w-full z-[100] transition-all duration-500 h-16 md:h-20`}>
      <div className="w-full h-full px-4 md:px-12 flex items-center justify-between">
        
        <div className="flex items-center gap-4 lg:gap-10">
            <button className="lg:hidden text-white text-2xl p-2 hover:bg-white/10 rounded-lg transition" onClick={() => setMobileMenuOpen(true)}><FaBars /></button>
            <div onClick={() => navigate('/')}><Logo /></div>
            <ul className="hidden lg:flex items-center gap-6 text-sm font-medium text-gray-300 h-full">
                <li onClick={() => navigate('/')} className="hover:text-white cursor-pointer transition hover:scale-105">Trang chủ</li>
                <li className="group relative h-full flex items-center hover:text-white cursor-pointer z-50">
                    <span className="flex items-center gap-1 py-6">Danh sách <FaChevronDown size={8}/></span>
                    <div className="absolute top-[80%] left-0 w-48 bg-[#111] border border-white/10 rounded-lg shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 translate-y-2 group-hover:translate-y-0 overflow-hidden py-2">
                        {listItems.map((item) => (<a key={item.slug} href={`/danh-sach/${item.slug}`} className="text-gray-400 hover:text-white hover:bg-white/5 text-sm block px-4 py-2 transition-colors">{item.name}</a>))}
                    </div>
                </li>
                <li className="group relative h-full flex items-center hover:text-white cursor-pointer z-50">
                    <span className="flex items-center gap-1 py-6">Thể loại <FaChevronDown size={8}/></span>
                    <div className="absolute top-[80%] left-0 w-[600px] bg-[#111] border border-white/10 rounded-lg shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 translate-y-2 group-hover:translate-y-0 overflow-hidden p-4">
                        <div className="grid grid-cols-4 gap-2">
                            {menuData.theLoai.slice(0, 24).map((item) => (<a key={item._id} href={`/the-loai/${item.slug}`} className="text-gray-400 hover:text-phim-accent text-sm block transition-colors hover:translate-x-1">{item.name}</a>))}
                        </div>
                    </div>
                </li>
                <li className="group relative h-full flex items-center hover:text-white cursor-pointer z-50">
                    <span className="flex items-center gap-1 py-6">Quốc gia <FaChevronDown size={8}/></span>
                    <div className="absolute top-[80%] left-0 w-[400px] bg-[#111] border border-white/10 rounded-lg shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 translate-y-2 group-hover:translate-y-0 overflow-hidden p-4">
                        <div className="grid grid-cols-3 gap-2">
                            {menuData.quocGia.slice(0, 18).map((item) => (<a key={item._id} href={`/quoc-gia/${item.slug}`} className="text-gray-400 hover:text-phim-accent text-sm block transition-colors hover:translate-x-1">{item.name}</a>))}
                        </div>
                    </div>
                </li>
            </ul>
        </div>

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

             {user ? (
                 <div className="hidden sm:flex items-center gap-3 group relative cursor-pointer">
                     {/* --- THAY THẾ ẢNH CŨ BẰNG USER AVATAR MỚI --- */}
                     <UserAvatar user={user} className="w-8 h-8 group-hover:border-phim-accent transition duration-300" />
                     
                     <FaChevronDown className="text-[10px] text-gray-500 group-hover:text-white transition" />
                     <div className="absolute top-full right-0 pt-2 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 transform translate-y-1 group-hover:translate-y-0 w-48 z-50">
                         <div className="bg-[#161616] border border-white/10 rounded-lg shadow-xl overflow-hidden">
                             <div className="px-4 py-3 border-b border-white/5 flex items-center gap-2">
                                 <UserAvatar user={user} className="w-8 h-8" />
                                 <div className="flex-1 min-w-0">
                                     <p className="text-sm font-bold text-white truncate">{user.fullname || user.username}</p>
                                     <p className="text-[10px] text-gray-500">Thành viên</p>
                                 </div>
                             </div>
                             <div className="py-1">
                                 <button onClick={() => navigate('/ho-so')} className="w-full text-left px-4 py-2 text-sm text-gray-300 hover:bg-white/5 hover:text-white transition flex items-center gap-2"><FaUser className="text-xs" /> Hồ sơ</button>
                                 <button onClick={() => navigate('/tu-phim')} className="w-full text-left px-4 py-2 text-sm text-gray-300 hover:bg-white/5 hover:text-white transition flex items-center gap-2"><FaHeart className="text-xs" /> Tủ phim</button>
                                 <button onClick={() => navigate('/lich-su')} className="w-full text-left px-4 py-2 text-sm text-gray-300 hover:bg-white/5 hover:text-white transition flex items-center gap-2"><FaHistory className="text-xs" /> Lịch sử</button>
                             </div>
                             <div className="border-t border-white/10 py-1">
                                 <button onClick={handleLogout} className="w-full text-left px-4 py-2 text-sm text-red-500 hover:bg-red-500/10 transition flex items-center gap-2"><FaSignOutAlt className="text-xs" /> Đăng xuất</button>
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

    {/* --- MOBILE SIDEBAR --- */}
    <div className={`fixed inset-0 bg-black/80 z-[150] transition-opacity duration-300 lg:hidden ${mobileMenuOpen ? 'opacity-100 visible' : 'opacity-0 invisible'}`} onClick={() => setMobileMenuOpen(false)} />
    <div className={`fixed top-0 left-0 w-[85%] max-w-[320px] h-full bg-[#111] z-[200] transform transition-transform duration-300 ease-in-out lg:hidden flex flex-col ${mobileMenuOpen ? 'translate-x-0' : '-translate-x-full'} shadow-2xl border-r border-white/10`}>
        <div className="p-6 border-b border-white/10 bg-gradient-to-b from-black/40 to-transparent">
            <div className="flex justify-between items-start mb-4">
                {user ? (
                    <div className="flex items-center gap-3" onClick={() => navigate('/ho-so')}>
                        {/* --- THAY THẾ AVATAR MOBILE --- */}
                        <UserAvatar user={user} className="w-12 h-12 border-2 border-phim-accent" />
                        <div>
                            <p className="text-white font-bold text-lg">{user.fullname || user.username}</p>
                            <p className="text-xs text-gray-400">{user.email}</p>
                        </div>
                    </div>
                ) : (<Logo />)}
                <button onClick={() => setMobileMenuOpen(false)} className="text-gray-400 hover:text-white p-1"><FaTimes size={20}/></button>
            </div>
            {/* Shortcuts mobile giữ nguyên */}
            {user && (
                <div className="grid grid-cols-3 gap-2 mt-4">
                    <button onClick={() => { navigate('/tu-phim'); setMobileMenuOpen(false); }} className="flex flex-col items-center gap-1 p-2 rounded-lg bg-white/5 hover:bg-white/10 transition"><FaHeart className="text-red-500" /> <span className="text-[10px] text-gray-300">Yêu thích</span></button>
                    <button onClick={() => { navigate('/lich-su'); setMobileMenuOpen(false); }} className="flex flex-col items-center gap-1 p-2 rounded-lg bg-white/5 hover:bg-white/10 transition"><FaHistory className="text-blue-400" /> <span className="text-[10px] text-gray-300">Lịch sử</span></button>
                    <button onClick={() => { navigate('/ho-so'); setMobileMenuOpen(false); }} className="flex flex-col items-center gap-1 p-2 rounded-lg bg-white/5 hover:bg-white/10 transition"><FaCog className="text-gray-400" /> <span className="text-[10px] text-gray-300">Cài đặt</span></button>
                </div>
            )}
        </div>
        
        {/* Phần Menu Mobile (Giữ nguyên) */}
        <div className="flex-1 overflow-y-auto p-4 space-y-1 custom-scrollbar">
             <a href="/" className="flex items-center gap-3 py-3 px-4 rounded-lg hover:bg-white/5 text-white font-medium transition"><span className="w-6 text-center"><FaFilm className="text-phim-accent"/></span> Trang Chủ</a>
             {/* ... các menu con ... */}
             <div>
                <button onClick={() => toggleMobileSubmenu('danh-sach')} className="w-full flex justify-between items-center py-3 px-4 rounded-lg text-gray-300 hover:text-white hover:bg-white/5 transition font-medium">
                    <div className="flex items-center gap-3"><span className="w-6 text-center"><FaList/></span> Danh Sách</div>{activeMobileSubmenu === 'danh-sach' ? <FaChevronUp size={10}/> : <FaChevronDown size={10}/>}
                </button>
                <div className={`pl-11 pr-2 overflow-hidden transition-all duration-300 ${activeMobileSubmenu === 'danh-sach' ? 'max-h-[500px] opacity-100 pb-2' : 'max-h-0 opacity-0'}`}>
                    <div className="grid grid-cols-1 gap-1 border-l border-white/10 pl-3">{listItems.map((item) => (<a key={item.slug} href={`/danh-sach/${item.slug}`} className="text-sm text-gray-500 py-2 hover:text-white block">{item.name}</a>))}</div>
                </div>
            </div>
             <div>
                <button onClick={() => toggleMobileSubmenu('the-loai')} className="w-full flex justify-between items-center py-3 px-4 rounded-lg text-gray-300 hover:text-white hover:bg-white/5 transition font-medium">
                    <div className="flex items-center gap-3"><span className="w-6 text-center"><FaList/></span> Thể Loại</div>{activeMobileSubmenu === 'the-loai' ? <FaChevronUp size={10}/> : <FaChevronDown size={10}/>}
                </button>
                <div className={`pl-11 pr-2 overflow-hidden transition-all duration-300 ${activeMobileSubmenu === 'the-loai' ? 'max-h-[500px] opacity-100 pb-2' : 'max-h-0 opacity-0'}`}>
                    <div className="grid grid-cols-2 gap-2 border-l border-white/10 pl-3 pt-2">
                        {menuData.theLoai.map((item) => (<a key={item._id} href={`/the-loai/${item.slug}`} className="text-sm text-gray-500 py-1 hover:text-white truncate">{item.name}</a>))}
                    </div>
                </div>
            </div>
            <div>
                <button onClick={() => toggleMobileSubmenu('quoc-gia')} className="w-full flex justify-between items-center py-3 px-4 rounded-lg text-gray-300 hover:text-white hover:bg-white/5 transition font-medium">
                    <div className="flex items-center gap-3"><span className="w-6 text-center"><FaList/></span> Quốc Gia</div>{activeMobileSubmenu === 'quoc-gia' ? <FaChevronUp size={10}/> : <FaChevronDown size={10}/>}
                </button>
                <div className={`pl-11 pr-2 overflow-hidden transition-all duration-300 ${activeMobileSubmenu === 'quoc-gia' ? 'max-h-[500px] opacity-100 pb-2' : 'max-h-0 opacity-0'}`}>
                    <div className="grid grid-cols-2 gap-2 border-l border-white/10 pl-3 pt-2">
                        {menuData.quocGia.map((item) => (<a key={item._id} href={`/quoc-gia/${item.slug}`} className="text-sm text-gray-400 py-1 hover:text-white block truncate">{item.name}</a>))}
                    </div>
                </div>
            </div>
        </div>
        
        {/* Footer Mobile */}
        <div className="p-6 border-t border-white/10 bg-black/20">
            {user ? (<button onClick={handleLogout} className="w-full flex items-center justify-center gap-2 bg-red-900/20 text-red-500 border border-red-900/50 py-3 rounded-xl font-bold hover:bg-red-900/40 transition"><FaSignOutAlt /> Đăng Xuất</button>) : (<div className="grid grid-cols-2 gap-3"><button onClick={() => navigate('/login')} className="bg-phim-accent text-white font-bold py-3 rounded-xl shadow-lg hover:bg-red-700 transition">Đăng Nhập</button><button onClick={() => navigate('/register')} className="border border-white/20 text-white font-bold py-3 rounded-xl hover:bg-white/10 transition">Đăng Ký</button></div>)}
        </div>
    </div>
    </>
  );
};

export default Header;