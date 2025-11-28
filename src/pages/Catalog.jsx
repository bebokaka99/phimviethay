import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import Header from '../components/layout/Header';
import { getMoviesBySlug, getMenuData, IMG_URL } from '../services/movieService';
import { FaPlayCircle, FaStar, FaChevronLeft, FaChevronRight, FaFilm, FaFilter, FaCheck, FaTimes, FaTags, FaTrashAlt, FaSortAmountDown, FaLayerGroup, FaGlobe, FaCalendarAlt, FaInfoCircle } from 'react-icons/fa';

// --- DATA CỐ ĐỊNH (ĐÃ XÓA 'TẤT CẢ' ĐỂ TRÁNH TRÙNG) ---
const FILTER_DATA = {
    sort: [
        { name: 'Mới nhất', value: 'modified.time' },
        { name: 'Năm sản xuất', value: 'year' },
        { name: 'Lượt xem', value: 'view' },
    ],
    type: [
        { name: 'Phim lẻ', value: 'phim-le' },
        { name: 'Phim bộ', value: 'phim-bo' },
        { name: 'Hoạt hình', value: 'hoat-hinh' },
        { name: 'TV Shows', value: 'tv-shows' }
    ],
    status: [
        { name: 'Hoàn thành', value: 'completed' },
        { name: 'Đang chiếu', value: 'ongoing' },
        { name: 'Trailer', value: 'trailer' }
    ]
};

const YEARS = Array.from({length: 16}, (_, i) => ({ name: (2025 - i).toString(), value: (2025 - i).toString() }));

const Catalog = ({ group }) => {
  const { slug } = useParams();
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  
  const currentPage = parseInt(searchParams.get('page')) || 1;
  const [movies, setMovies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [title, setTitle] = useState('');
  const [totalPages, setTotalPages] = useState(1);

  const [menuData, setMenuData] = useState({ theLoai: [], quocGia: [] });
  const [showFilter, setShowFilter] = useState(false);
  const [activeTags, setActiveTags] = useState([]);

  const [selectedFilters, setSelectedFilters] = useState({
      category: [], 
      country: [],
      year: '',
      type: '',
      status: '',
      sort: 'modified.time'
  });

  // 1. Load Menu
  useEffect(() => {
      const fetchMenu = async () => {
          const data = await getMenuData();
          if (data) setMenuData(data);
      };
      fetchMenu();
  }, []);

  // 2. Sync URL -> UI State
  useEffect(() => {
      const parseArray = (str) => str ? str.split(',') : [];
      const newFilters = { category: [], country: [], type: '', year: '', status: '', sort: 'modified.time' };

      // Base path logic
      if (group === 'the-loai') newFilters.category = [slug];
      else if (group === 'quoc-gia') newFilters.country = [slug];
      else if (group === 'danh-sach') newFilters.type = slug;

      // Params logic
      const qCat = searchParams.get('category');
      const qCountry = searchParams.get('country');
      const qYear = searchParams.get('year');
      const qSort = searchParams.get('sort_field');
      const qStatus = searchParams.get('status');

      if (qCat) newFilters.category = [...newFilters.category, ...parseArray(qCat)];
      if (qCountry) newFilters.country = [...newFilters.country, ...parseArray(qCountry)];
      if (qYear) newFilters.year = parseArray(qYear);

      newFilters.category = [...new Set(newFilters.category)];
      newFilters.country = [...new Set(newFilters.country)];

      // Fix lỗi logic: Nếu có param trên URL thì ưu tiên lấy, nếu không giữ mặc định
      if (qSort) newFilters.sort = qSort;
      if (qStatus) newFilters.status = qStatus;
      if (searchParams.get('year')) newFilters.year = searchParams.get('year'); 
      
      setSelectedFilters(newFilters);
  }, [group, slug, searchParams]);

  // 3. FETCH DATA
  useEffect(() => {
    window.scrollTo(0, 0);
    const fetchData = async () => {
        setLoading(true);
        try {
            let apiSlug = 'phim-moi';
            let apiType = 'danh-sach';
            const filterParams = {};

            // Logic chọn API Path
            const urlType = group === 'danh-sach' ? slug : searchParams.get('type');
            const urlCats = group === 'the-loai' ? [slug, ...(searchParams.get('category')?.split(',') || [])] : (searchParams.get('category')?.split(',') || []);
            const urlCountries = group === 'quoc-gia' ? [slug, ...(searchParams.get('country')?.split(',') || [])] : (searchParams.get('country')?.split(',') || []);
            
            if (urlType) { apiSlug = urlType; apiType = 'danh-sach'; } 
            
            const uniqueCats = [...new Set(urlCats)];
            const uniqueCountries = [...new Set(urlCountries)];

            if (uniqueCats.length > 0) filterParams.category = uniqueCats.join(',');
            if (uniqueCountries.length > 0) filterParams.country = uniqueCountries.join(',');

            // Gán các tham số lọc (Status, Sort, Year)
            if (searchParams.get('year')) filterParams.year = searchParams.get('year');
            if (searchParams.get('sort_field')) filterParams.sort_field = searchParams.get('sort_field');
            if (searchParams.get('status')) filterParams.status = searchParams.get('status');

            // Tạo Tags hiển thị
            const tags = [];
            if(urlType && urlType !== 'phim-moi') tags.push({ label: FILTER_DATA.type.find(t=>t.value===urlType)?.name });
            // Chờ menu data load xong mới map tên
            if (menuData.theLoai.length > 0) {
                 uniqueCats.forEach(c => tags.push({ label: menuData.theLoai.find(i=>i.slug===c)?.name || c }));
                 uniqueCountries.forEach(c => tags.push({ label: menuData.quocGia.find(i=>i.slug===c)?.name || c }));
            }
            if(filterParams.year) tags.push({ label: `Năm ${filterParams.year}` });
            if(filterParams.status) tags.push({ label: FILTER_DATA.status.find(s=>s.value===filterParams.status)?.name });
            
            setActiveTags(tags.filter(t=>t.label));

            const data = await getMoviesBySlug(apiSlug, currentPage, apiType, filterParams);
            
            if (data?.data?.items) {
                setMovies(data.data.items);
                // Title giữ nguyên theo API trả về
                setTitle(data.data.titlePage || 'Danh sách phim');
                
                const pagination = data.data.params?.pagination;
                if (pagination) {
                    const total = Math.ceil(pagination.totalItems / pagination.totalItemsPerPage);
                    setTotalPages(total);
                }
            } else {
                setMovies([]);
            }
        } catch (error) { console.error(error); } 
        finally { setLoading(false); }
    };
    fetchData();
  }, [slug, currentPage, group, searchParams, menuData]);

  // --- APPLY FILTER ---
  const handleApplyFilter = () => {
      let path = '/danh-sach/';
      // Nếu chọn loại phim thì dùng loại phim làm gốc, không thì mặc định phim-moi
      path += selectedFilters.type ? selectedFilters.type : 'phim-moi';
      
      const params = new URLSearchParams();

      if (selectedFilters.category.length > 0) params.set('category', selectedFilters.category.join(','));
      if (selectedFilters.country.length > 0) params.set('country', selectedFilters.country.join(','));
      if (selectedFilters.year) params.set('year', selectedFilters.year);
      if (selectedFilters.sort) params.set('sort_field', selectedFilters.sort);
      if (selectedFilters.status) params.set('status', selectedFilters.status);
      
      params.set('page', '1');

      navigate(`${path}?${params.toString()}`);
      setShowFilter(false);
  };

  const handleClearFilter = () => {
      setSelectedFilters({ category: [], country: [], year: '', type: '', status: '', sort: 'modified.time' });
      navigate('/danh-sach/phim-moi');
      setShowFilter(false);
  };

  // Helpers
  const toggleArrayFilter = (key, value) => {
      setSelectedFilters(prev => {
          const list = prev[key] || [];
          if (value === '') return { ...prev, [key]: [] };
          if (list.includes(value)) return { ...prev, [key]: list.filter(item => item !== value) };
          return { ...prev, [key]: [...list, value] };
      });
  };

  const setSingleFilter = (key, value) => {
      setSelectedFilters(prev => ({ ...prev, [key]: value }));
  };

  const handlePageChange = (newPage) => {
      if (newPage >= 1 && newPage <= totalPages) {
          setSearchParams(prev => { prev.set('page', newPage); return prev; });
      }
  };

  // UI Components
  const FilterPill = ({ label, active, onClick }) => (
      <button 
        onClick={onClick}
        className={`
            px-4 py-2 rounded-full text-xs font-bold transition-all duration-200 border flex items-center justify-center gap-2 whitespace-nowrap
            ${active 
                ? 'bg-red-600 text-white border-red-600 shadow-md shadow-red-900/30' 
                : 'bg-[#1a1a1a] text-gray-400 border-white/5 hover:border-white/30 hover:text-white hover:bg-white/5'}
        `}
      >
          {label}
          {active && <FaCheck className="text-[10px]" />}
      </button>
  );

  const FilterRow = ({ label, icon, items, activeValue, onSelect, isMulti = false, gridClass = "flex flex-wrap gap-2" }) => (
      <div className="flex flex-col md:flex-row gap-2 md:gap-4 border-b border-white/5 py-5 last:border-0">
          <div className="w-32 flex-shrink-0 text-gray-400 font-bold text-sm pt-2 md:text-right md:pr-4 flex items-center md:justify-end gap-2">
              <span className="md:hidden text-red-600">{icon}</span> {label}:
          </div>
          <div className={`flex-1 ${gridClass}`}>
              <FilterPill 
                  label="Tất cả" 
                  active={isMulti ? (!activeValue || activeValue.length === 0) : activeValue === ''} 
                  onClick={() => onSelect('')} 
              />
              {items?.map((item) => {
                  const val = item.slug !== undefined ? item.slug : item.value;
                  const isActive = isMulti ? activeValue?.includes(val) : activeValue === val;
                  return <FilterPill key={val} label={item.name} active={isActive} onClick={() => onSelect(val)} />;
              })}
          </div>
      </div>
  );

  return (
    <div className="bg-phim-dark min-h-screen text-white font-sans">
      <Header />
      
      <div className="pt-24 px-4 md:px-8 container mx-auto pb-20">
          
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-6">
              <h2 className="text-2xl md:text-3xl font-bold uppercase tracking-wide flex items-center gap-3">
                  <span className="text-red-600 border-l-4 border-red-600 pl-3 text-ellipsis overflow-hidden line-clamp-1">{title}</span>
              </h2>
              <button 
                onClick={() => setShowFilter(!showFilter)}
                className={`flex items-center gap-2 px-6 py-2.5 rounded-full font-bold transition shadow-lg border ${showFilter ? 'bg-red-600 text-white border-red-600' : 'bg-[#1a1a1a] text-white border-white/10 hover:border-white/30'}`}
              >
                  <FaFilter /> {showFilter ? 'Ẩn bộ lọc' : 'Lọc Phim'}
              </button>
          </div>

          {/* TAGS */}
          {activeTags.length > 0 && !showFilter && (
              <div className="flex flex-wrap gap-2 mb-8 animate-fade-in">
                  <span className="text-sm font-bold text-gray-500 flex items-center gap-2 mr-2"><FaTags /> Đang lọc:</span>
                  {activeTags.map((tag, idx) => (
                      <span key={idx} className="bg-red-600/10 text-red-500 border border-red-600/30 px-3 py-1 rounded-full text-xs font-bold flex items-center gap-2">
                          {tag.label}
                      </span>
                  ))}
                  <button onClick={handleClearFilter} className="text-xs text-gray-500 underline hover:text-white ml-2">Xóa tất cả</button>
              </div>
          )}

          {/* --- PANEL BỘ LỌC (MOBILE OPTIMIZED: FLEX COLUMN) --- */}
          <div className={`
              transition-all duration-500 ease-in-out z-[200]
              /* Desktop */
              lg:static lg:block lg:overflow-visible lg:bg-transparent lg:p-0
              ${showFilter ? 'lg:max-h-[3000px] lg:opacity-100 lg:mb-12' : 'lg:max-h-0 lg:opacity-0 lg:mb-0'}
              
              /* Mobile: Fullscreen Modal */
              fixed inset-0 bg-[#0a0a0a] flex flex-col
              ${showFilter ? 'translate-y-0 opacity-100' : 'translate-y-full opacity-0 lg:translate-y-0'}
              ${!showFilter && 'pointer-events-none lg:pointer-events-auto'}
          `}>
              
              {/* Mobile Header */}
              <div className="flex lg:hidden items-center justify-between p-4 border-b border-white/10 bg-[#111]">
                  <h3 className="text-lg font-bold text-white flex items-center gap-2"><FaFilter className="text-red-600"/> Bộ lọc nâng cao</h3>
                  <button onClick={() => setShowFilter(false)} className="p-2 bg-white/10 rounded-full text-gray-400 hover:text-white"><FaTimes/></button>
              </div>

              {/* Scrollable Content */}
              <div className="flex-1 overflow-y-auto bg-[#111] lg:bg-transparent lg:border lg:border-white/10 lg:rounded-2xl lg:shadow-2xl p-4 md:p-8">
                  <div className="space-y-2 pb-20 lg:pb-0">
                       {/* Render Rows */}
                      <FilterRow label="Sắp xếp" icon={<FaSortAmountDown/>} items={FILTER_DATA.sort} activeValue={selectedFilters.sort} onSelect={(val) => setSingleFilter('sort', val)} />
                      <FilterRow label="Loại phim" icon={<FaFilm/>} items={FILTER_DATA.type} activeValue={selectedFilters.type} onSelect={(val) => setSingleFilter('type', val)} />
                      <FilterRow label="Tình trạng" icon={<FaInfoCircle/>} items={FILTER_DATA.status} activeValue={selectedFilters.status} onSelect={(val) => setSingleFilter('status', val)} />
                      <FilterRow label="Quốc gia" icon={<FaGlobe/>} items={menuData.quocGia} activeValue={selectedFilters.country} onSelect={(val) => toggleArrayFilter('country', val)} isMulti={true} gridClass="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-2" />
                      <FilterRow label="Thể loại" icon={<FaLayerGroup/>} items={menuData.theLoai} activeValue={selectedFilters.category} onSelect={(val) => toggleArrayFilter('category', val)} isMulti={true} gridClass="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-2" />
                      <FilterRow label="Năm" icon={<FaCalendarAlt/>} items={YEARS} activeValue={selectedFilters.year} onSelect={(val) => setSingleFilter('year', val)} gridClass="grid grid-cols-4 gap-2" />
                  </div>
              </div>

              {/* Sticky Footer on Mobile / Normal on Desktop */}
              <div className="
                   p-4 bg-[#111] border-t border-white/10 lg:bg-transparent lg:border-none lg:p-0 lg:mt-6
                   flex justify-center lg:justify-end gap-4
              ">
                  <button onClick={handleClearFilter} className="flex-1 lg:flex-none flex items-center justify-center gap-2 px-6 py-3 rounded-full font-bold text-red-500 hover:text-white border border-red-900/30 hover:bg-red-900/50 transition">
                      <FaTrashAlt /> Reset
                  </button>
                  <button onClick={() => setShowFilter(false)} className="hidden lg:block px-8 py-3 rounded-full font-bold text-gray-400 hover:text-white bg-[#1f1f1f] hover:bg-[#2a2a2a] transition">
                      Đóng
                  </button>
                  <button onClick={handleApplyFilter} className="flex-[2] lg:flex-none bg-red-600 hover:bg-red-700 text-white px-10 py-3 rounded-full font-bold shadow-lg shadow-red-900/20 transform hover:-translate-y-0.5 transition flex items-center justify-center gap-2">
                      <FaCheck /> LỌC KẾT QUẢ
                  </button>
              </div>
          </div>

          {/* LIST PHIM */}
          {loading ? (
              <div className="flex justify-center py-40">
                  <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-red-600"></div>
              </div>
          ) : (
              <>
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-x-4 gap-y-8">
                      {movies.map((movie) => (
                          <div key={movie._id} className="relative group cursor-pointer select-none" onClick={() => navigate(`/phim/${movie.slug}`)}>
                              <div className="relative w-full aspect-[2/3] rounded-lg overflow-hidden mb-3 bg-gray-900 transition-all duration-300 group-hover:scale-[1.03] group-hover:shadow-lg group-hover:shadow-red-900/20 ring-1 ring-white/10 group-hover:ring-red-600">
                                  <img src={`${IMG_URL}${movie.thumb_url}`} alt={movie.name} className="w-full h-full object-cover transform group-hover:brightness-75 transition-all duration-500" loading="lazy" />
                                  <div className="absolute top-2 left-2 right-2 flex items-center justify-between z-10"> 
                                      <span className="bg-red-600 text-white text-[9px] font-bold px-1.5 py-0.5 rounded shadow-sm">{movie.quality || 'HD'}</span>
                                      <span className="bg-yellow-500 text-black text-[9px] font-bold px-1.5 py-0.5 rounded shadow-sm flex items-center gap-1">{movie.vote_average || '8.5'} <FaStar size={8} /></span>
                                  </div>
                                  <div className="absolute bottom-2 right-2 z-10">
                                      <span className="bg-black/60 backdrop-blur-sm text-white text-[10px] font-bold px-2 py-0.5 rounded border border-white/10">{movie.episode_current || 'Full'}</span>
                                  </div>
                                  <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 scale-75 group-hover:scale-100">
                                      <FaPlayCircle className="text-4xl text-white drop-shadow-xl" />
                                  </div>
                              </div>
                              <div className="px-1">
                                  <h3 className="font-bold text-sm text-gray-200 line-clamp-1 group-hover:text-red-500 transition-colors">{movie.name}</h3>
                                  <div className="flex items-center justify-between text-xs text-gray-500 mt-1">
                                      <span className="line-clamp-1 max-w-[60%]">{movie.origin_name}</span>
                                      <span className="text-gray-400 border border-gray-700 px-1 rounded">{movie.year}</span>
                                  </div>
                              </div>
                          </div>
                      ))}
                  </div>

                  {movies.length === 0 && (
                      <div className="py-20 text-center text-gray-500 border-2 border-dashed border-gray-800 rounded-2xl bg-white/5">
                          <FaFilm className="text-5xl mx-auto mb-4 opacity-50"/>
                          <p className="text-xl">Không có phim nào khớp với bộ lọc.</p>
                          <button onClick={handleClearFilter} className="mt-4 text-red-500 hover:underline font-bold">Xóa bộ lọc</button>
                      </div>
                  )}

                  {movies.length > 0 && totalPages > 1 && (
                      <div className="flex justify-center items-center gap-3 mt-16 pb-10">
                          <button onClick={() => handlePageChange(currentPage - 1)} disabled={currentPage === 1} className={`px-4 py-2 rounded bg-[#1a1a1a] text-gray-400 ${currentPage === 1 ? 'opacity-50' : 'hover:bg-red-600 hover:text-white'}`}><FaChevronLeft /></button>
                          <div className="bg-[#1a1a1a] px-4 py-2 rounded text-red-500 font-bold border border-white/10">{currentPage} / {totalPages}</div>
                          <button onClick={() => handlePageChange(currentPage + 1)} disabled={currentPage === totalPages} className={`px-4 py-2 rounded bg-[#1a1a1a] text-gray-400 ${currentPage === totalPages ? 'opacity-50' : 'hover:bg-red-600 hover:text-white'}`}><FaChevronRight /></button>
                      </div>
                  )}
              </>
          )}
      </div>
    </div>
  );
};

export default Catalog;