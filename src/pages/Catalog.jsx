import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { 
    FaFilter, FaCheck, FaTags, FaTrashAlt, FaSortAmountDown, 
    FaLayerGroup, FaGlobe, FaCalendarAlt, FaFilm, 
    FaChevronLeft, FaChevronRight, FaFire, FaHeart, FaGhost, 
    FaLaughSquint, FaSearch, FaBolt, FaStar, FaTv
} from 'react-icons/fa';
import MovieGrid from '../components/movies/MovieGrid';
import { MovieGridSkeleton } from '../components/common/Skeleton';
import { getMoviesBySlug, getMenuData } from '../services/movieService';

// --- CONSTANTS ---
const FILTER_DATA = {
    sort: [ { name: 'Mới cập nhật', value: 'modified.time' }, { name: 'Năm sản xuất', value: 'year' }, { name: 'Lượt xem', value: 'view' } ],
    type: [ { name: 'Phim lẻ', value: 'phim-le' }, { name: 'Phim bộ', value: 'phim-bo' }, { name: 'Hoạt hình', value: 'hoat-hinh' }, { name: 'TV Shows', value: 'tv-shows' } ]
};
const YEARS = Array.from({ length: 16 }, (_, i) => ({ name: (2025 - i).toString(), value: (2025 - i).toString() }));

// Helper Icon Header
const getHeaderIcon = (title) => {
    const t = (title || '').toLowerCase();
    if (t.includes('hành động')) return <FaFire className="text-red-500" />;
    if (t.includes('tình cảm')) return <FaHeart className="text-pink-500" />;
    if (t.includes('kinh dị')) return <FaGhost className="text-gray-400" />;
    if (t.includes('hài')) return <FaLaughSquint className="text-yellow-400" />;
    if (t.includes('mới') || t.includes('new')) return <FaBolt className="text-blue-400" />;
    if (t.includes('hot') || t.includes('nổi bật')) return <FaStar className="text-yellow-500" />;
    if (t.includes('bộ') || t.includes('series')) return <FaTv className="text-purple-500" />;
    return <FaFilm className="text-red-600" />;
};

// Filter Pill
const FilterPill = ({ label, active, onClick }) => (
    <button 
        onClick={onClick} 
        className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all duration-300 border flex items-center justify-center gap-2 whitespace-nowrap active:scale-95
        ${active 
            ? 'bg-red-600 text-white border-red-500 shadow-[0_0_15px_rgba(220,38,38,0.4)]' 
            : 'bg-transparent text-gray-400 border-transparent hover:bg-white/5 hover:text-white hover:border-white/10'}`}
    >
        {label}
    </button>
);

// Filter Row
const FilterRow = ({ label, icon, items, activeValue, onSelect, isMulti = false, gridClass = "flex flex-wrap gap-1" }) => (
    <div className="flex flex-col md:flex-row gap-3 md:gap-6 border-b border-white/5 py-5 last:border-0 hover:bg-white/[0.02] transition-colors rounded-xl px-2 -mx-2">
        <div className="w-36 flex-shrink-0 pt-1 md:text-right flex items-center md:justify-end gap-3 group">
            <span className="text-gray-200 font-bold text-xs uppercase tracking-widest group-hover:text-white transition-colors">{label}</span>
            <div className="w-9 h-9 rounded-xl bg-white/5 flex items-center justify-center shadow-sm border border-white/5 group-hover:border-white/20 group-hover:bg-white/10 transition-all">
                {icon}
            </div>
        </div>
        <div className={`flex-1 ${gridClass}`}>
            <FilterPill label="Tất cả" active={isMulti ? (!activeValue || activeValue.length === 0) : activeValue === ''} onClick={() => onSelect('')} />
            {items?.map((item) => {
                const val = item.slug !== undefined ? item.slug : item.value;
                const isActive = isMulti ? activeValue?.includes(val) : activeValue === val;
                return <FilterPill key={val} label={item.name} active={isActive} onClick={() => onSelect(val)} />;
            })}
        </div>
    </div>
);

// Pagination
const Pagination = ({ currentPage, totalPages, onPageChange }) => {
    if (totalPages <= 1) return null;
    let pages = [];
    if (totalPages <= 7) {
        pages = Array.from({ length: totalPages }, (_, i) => i + 1);
    } else {
        if (currentPage <= 4) pages = [1, 2, 3, 4, 5, '...', totalPages];
        else if (currentPage >= totalPages - 3) pages = [1, '...', totalPages - 4, totalPages - 3, totalPages - 2, totalPages - 1, totalPages];
        else pages = [1, '...', currentPage - 1, currentPage, currentPage + 1, '...', totalPages];
    }

    return (
        <div className="flex justify-center items-center gap-2 mt-16 pb-10">
            <button onClick={() => onPageChange(currentPage - 1)} disabled={currentPage === 1} className="w-9 h-9 rounded-lg flex items-center justify-center bg-white/5 text-gray-400 hover:bg-red-600 hover:text-white transition disabled:opacity-30 disabled:cursor-not-allowed"><FaChevronLeft size={10}/></button>
            {pages.map((p, i) => (
                <button 
                    key={i} 
                    onClick={() => typeof p === 'number' && onPageChange(p)} 
                    disabled={typeof p !== 'number'}
                    className={`w-9 h-9 rounded-lg text-sm font-bold flex items-center justify-center transition-all
                    ${p === currentPage 
                        ? 'bg-red-600 text-white shadow-lg shadow-red-900/40' 
                        : typeof p === 'number' 
                            ? 'bg-white/5 text-gray-400 hover:bg-white/10 hover:text-white' 
                            : 'text-gray-600 bg-transparent cursor-default'}`}
                >
                    {p}
                </button>
            ))}
            <button onClick={() => onPageChange(currentPage + 1)} disabled={currentPage === totalPages} className="w-9 h-9 rounded-lg flex items-center justify-center bg-white/5 text-gray-400 hover:bg-red-600 hover:text-white transition disabled:opacity-30 disabled:cursor-not-allowed"><FaChevronRight size={10}/></button>
        </div>
    );
};

const Catalog = ({ group }) => {
    const { slug } = useParams();
    const [searchParams, setSearchParams] = useSearchParams();
    const navigate = useNavigate();
    const currentPage = parseInt(searchParams.get('page')) || 1;
    
    // --- STATE LOGIC (GIỮ NGUYÊN) ---
    const [movies, setMovies] = useState([]);
    const [menuData, setMenuData] = useState({ theLoai: [], quocGia: [] });
    const [totalPages, setTotalPages] = useState(1);
    const [loading, setLoading] = useState(true);
    const [title, setTitle] = useState('');
    const [showFilter, setShowFilter] = useState(false);
    const [activeTags, setActiveTags] = useState([]);
    const [selectedFilters, setSelectedFilters] = useState({ category: [], country: [], year: '', type: '', sort: 'modified.time' });

    useEffect(() => { getMenuData().then(data => data && setMenuData(data)); }, []);

    useEffect(() => {
        const parseArray = (str) => str ? str.split(',') : [];
        const newFilters = { category: [], country: [], type: '', year: '', sort: 'modified.time' };
        if (group === 'the-loai') newFilters.category = [slug];
        else if (group === 'quoc-gia') newFilters.country = [slug];
        else if (group === 'danh-sach') newFilters.type = slug;

        const qCat = searchParams.get('category');
        const qCountry = searchParams.get('country');
        if (qCat) newFilters.category = [...newFilters.category, ...parseArray(qCat)];
        if (qCountry) newFilters.country = [...newFilters.country, ...parseArray(qCountry)];
        
        newFilters.category = [...new Set(newFilters.category)];
        newFilters.country = [...new Set(newFilters.country)];
        if (searchParams.get('sort_field')) newFilters.sort = searchParams.get('sort_field');
        if (searchParams.get('year')) newFilters.year = searchParams.get('year');
        
        setSelectedFilters(newFilters);
    }, [group, slug, searchParams]);

    useEffect(() => {
        window.scrollTo(0, 0);
        const fetchData = async () => {
            setLoading(true);
            try {
                let apiSlug = 'phim-moi', apiType = 'danh-sach', filterParams = {};
                const urlType = group === 'danh-sach' ? slug : searchParams.get('type');
                const urlCats = searchParams.get('category') ? searchParams.get('category').split(',') : [];
                const urlCountries = searchParams.get('country') ? searchParams.get('country').split(',') : [];

                if (group === 'the-loai') urlCats.push(slug);
                if (group === 'quoc-gia') urlCountries.push(slug);

                const uniqueCats = [...new Set(urlCats)];
                const uniqueCountries = [...new Set(urlCountries)];

                if (urlType && urlType !== 'phim-moi') { apiSlug = urlType; apiType = 'danh-sach'; }
                else if (uniqueCats.length > 0) { apiSlug = uniqueCats[0]; apiType = 'the-loai'; }
                else if (uniqueCountries.length > 0) { apiSlug = uniqueCountries[0]; apiType = 'quoc-gia'; }

                const finalCats = uniqueCats.filter(c => !(apiType === 'the-loai' && c === apiSlug));
                const finalCountries = uniqueCountries.filter(c => !(apiType === 'quoc-gia' && c === apiSlug));

                if (finalCats.length > 0) filterParams.category = finalCats.join(',');
                if (finalCountries.length > 0) filterParams.country = finalCountries.join(',');
                if (searchParams.get('year')) filterParams.year = searchParams.get('year');
                if (searchParams.get('sort_field')) filterParams.sort_field = searchParams.get('sort_field');

                const data = await getMoviesBySlug(apiSlug, currentPage, apiType, filterParams);
                if (data?.data?.items) {
                    setMovies(data.data.items);
                    if(!title) setTitle(data.data.titlePage || 'Danh sách phim');
                    const pagination = data.data.params?.pagination;
                    if (pagination) setTotalPages(Math.ceil(pagination.totalItems / pagination.totalItemsPerPage));
                } else { setMovies([]); }
            } catch (error) { console.error(error); } finally { setLoading(false); }
        };
        fetchData();
    }, [slug, currentPage, group, searchParams]);

    useEffect(() => {
        const urlType = group === 'danh-sach' ? slug : searchParams.get('type');
        const urlCats = searchParams.get('category') ? searchParams.get('category').split(',') : [];
        const urlCountries = searchParams.get('country') ? searchParams.get('country').split(',') : [];
        if (group === 'the-loai') urlCats.push(slug);
        if (group === 'quoc-gia') urlCountries.push(slug);

        const tags = [], titleParts = [];
        if (urlType && urlType !== 'phim-moi') { const name = FILTER_DATA.type.find(t => t.value === urlType)?.name; if (name) { tags.push({ label: name }); titleParts.push(name); } }
        if (menuData.theLoai.length > 0) {
            [...new Set(urlCats)].forEach(c => { const name = menuData.theLoai.find(i => i.slug === c)?.name; if (name) { tags.push({ label: name }); titleParts.push(name); } });
            [...new Set(urlCountries)].forEach(c => { const name = menuData.quocGia.find(i => i.slug === c)?.name; if (name) { tags.push({ label: name }); titleParts.push(name); } });
        }
        if (searchParams.get('year')) { const y = searchParams.get('year'); tags.push({ label: `Năm ${y}` }); titleParts.push(`Năm ${y}`); }
        setActiveTags(tags.filter(t => t && t.label));
        if (titleParts.length > 0) setTitle(titleParts.join(' • ')); else if (!title) setTitle('Danh sách phim');
    }, [menuData, searchParams, slug, group]);

    // Handlers
    const handleApplyFilter = () => {
        let path = '/danh-sach/'; path += selectedFilters.type ? selectedFilters.type : 'phim-moi';
        const params = new URLSearchParams();
        if (selectedFilters.category.length > 0) params.set('category', selectedFilters.category.join(','));
        if (selectedFilters.country.length > 0) params.set('country', selectedFilters.country.join(','));
        if (selectedFilters.year) params.set('year', selectedFilters.year);
        if (selectedFilters.sort) params.set('sort_field', selectedFilters.sort);
        params.set('page', '1');
        navigate(`${path}?${params.toString()}`); setShowFilter(false);
    };

    const handleClearFilter = () => { setSelectedFilters({ category: [], country: [], year: '', type: '', sort: 'modified.time' }); navigate('/danh-sach/phim-moi'); setShowFilter(false); };
    const toggleArrayFilter = (key, value) => { setSelectedFilters(prev => { const list = prev[key] || []; if (value === '') return { ...prev, [key]: [] }; if (list.includes(value)) return { ...prev, [key]: list.filter(item => item !== value) }; return { ...prev, [key]: [...list, value] }; }); };
    const setSingleFilter = (key, value) => { setSelectedFilters(prev => ({ ...prev, [key]: value })); };
    const handlePageChange = (newPage) => { if (newPage >= 1 && newPage <= totalPages) setSearchParams(prev => { prev.set('page', newPage); return prev; }); };

    // --- RENDER ---
    return (
        <div className="min-h-screen text-white font-sans overflow-x-hidden relative bg-transparent">
            <Helmet>
                <title>{title ? `${title} | PhimVietHay` : 'Danh sách phim - PhimVietHay'}</title>
                <meta name="description" content={`Xem danh sách ${title} mới nhất...`} />
            </Helmet>

            {/* AMBIENT GLOW */}
            <div className="absolute top-0 left-0 w-full h-[300px] bg-gradient-to-b from-red-900/10 via-red-900/5 to-transparent pointer-events-none -z-10" />

            <div className="pt-24 px-4 md:px-8 container mx-auto pb-20">
                
                {/* 1. HEADER: FIX MOBILE */}
                {/* [MOBILE FIX] Thêm items-start trên mobile để nút và tiêu đề không bị lệch, mt-4 cho nút */}
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10 border-b border-white/5 pb-8 relative">
                    {/* Background Light Spot */}
                    <div className="absolute top-0 left-0 w-32 h-32 bg-red-600/20 rounded-full blur-[60px] pointer-events-none -mt-10 -ml-10"></div>

                    <div className="relative z-10 w-full md:w-auto">
                        {/* Tagline */}
                        <div className="flex items-center gap-2 mb-2 animate-fade-in">
                            <div className="h-[2px] w-8 bg-red-600 shadow-[0_0_10px_rgba(220,38,38,0.8)]"></div>
                            <span className="text-xs md:text-sm font-bold text-red-500 uppercase tracking-[0.2em] drop-shadow-sm">Khám phá vũ trụ phim</span>
                        </div>

                        {/* Massive Title with Icon Box */}
                        <div className="flex items-center gap-4 md:gap-6">
                            {/* Glass Icon Box: Nhỏ hơn trên mobile (w-12 h-12) */}
                            <div className="flex-shrink-0 w-12 h-12 md:w-20 md:h-20 rounded-2xl bg-gradient-to-br from-white/10 to-transparent border border-white/10 backdrop-blur-md shadow-2xl flex items-center justify-center text-2xl md:text-5xl animate-fade-up">
                                {getHeaderIcon(title)}
                            </div>
                            
                            {/* Text with Gradient & Shadow */}
                            {/* [MOBILE FIX] Giảm font-size xuống text-2xl/3xl, thêm line-clamp để không vỡ layout */}
                            <h2 className="flex-1 text-1xl md:text-3xl lg:text-3xl font-black uppercase tracking-tighter text-transparent bg-clip-text bg-gradient-to-r from-white via-gray-200 to-gray-500 drop-shadow-[0_5px_15px_rgba(0,0,0,0.5)] animate-fade-up delay-100 line-clamp-2 md:line-clamp-1 py-1">
                                {title || 'Kho Phim'}
                            </h2>
                        </div>
                    </div>
                    
                    {/* Filter Button */}
                    {/* [MOBILE FIX] Nút full width trên mobile để dễ bấm */}
                    <button 
                        onClick={() => setShowFilter(!showFilter)} 
                        className={`w-full md:w-auto group flex items-center justify-center gap-3 px-7 py-3.5 rounded-full font-bold text-sm transition-all shadow-xl backdrop-blur-md border animate-fade-in delay-200
                        ${showFilter 
                            ? 'bg-red-600 text-white border-red-500 ring-4 ring-red-500/20 scale-105' 
                            : 'bg-white/5 text-gray-300 border-white/10 hover:bg-white/10 hover:text-white hover:border-white/30 hover:-translate-y-1'}`}
                    >
                        <FaFilter className={`text-sm transition-transform duration-300 ${showFilter ? 'rotate-180' : ''}`} /> 
                        {showFilter ? 'Đóng bộ lọc' : 'Bộ lọc tìm kiếm'}
                    </button>
                </div>

                {/* 2. ACTIVE TAGS */}
                {activeTags.length > 0 && !showFilter && (
                    <div className="flex flex-wrap items-center gap-2 mb-8 animate-fade-in-down px-1">
                        <span className="text-xs font-bold text-gray-500 uppercase tracking-wider mr-2">Đang lọc:</span>
                        {activeTags.map((tag, idx) => (
                            <div key={idx} className="bg-white/5 border border-white/10 px-4 py-1.5 rounded-full text-xs font-bold flex items-center gap-2 shadow-sm text-gray-300 hover:border-white/30 transition-colors">
                                <FaTags className="text-red-500 text-[10px]" /> {tag.label}
                            </div>
                        ))}
                        <button onClick={handleClearFilter} className="text-xs text-red-500 font-bold hover:text-red-400 ml-2 hover:underline flex items-center gap-1"><FaTrashAlt/> Xóa tất cả</button>
                    </div>
                )}

                {/* 3. FILTER HUD */}
                <div className={`overflow-hidden transition-all duration-500 ease-in-out ${showFilter ? 'max-h-[3000px] opacity-100 mb-16' : 'max-h-0 opacity-0 mb-0'}`}>
                    <div className="bg-white/5 backdrop-blur-2xl border border-white/10 p-6 md:p-10 rounded-3xl shadow-2xl relative overflow-hidden ring-1 ring-white/5">
                        <div className="absolute top-0 right-0 p-12 opacity-[0.03] pointer-events-none transform rotate-12"><FaFilter size={250} /></div>

                        <div className="relative z-10 space-y-2">
                            <FilterRow label="Loại hình" icon={<FaLayerGroup className="text-blue-400 drop-shadow"/>} items={FILTER_DATA.type} activeValue={selectedFilters.type} onSelect={(val) => setSingleFilter('type', val)} />
                            <FilterRow label="Quốc gia" icon={<FaGlobe className="text-green-400 drop-shadow"/>} items={menuData.quocGia} activeValue={selectedFilters.country} onSelect={(val) => toggleArrayFilter('country', val)} isMulti={true} gridClass="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-1.5" />
                            <FilterRow label="Thể loại" icon={<FaTags className="text-yellow-400 drop-shadow"/>} items={menuData.theLoai} activeValue={selectedFilters.category} onSelect={(val) => toggleArrayFilter('category', val)} isMulti={true} gridClass="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-1.5" />
                            <FilterRow label="Năm" icon={<FaCalendarAlt className="text-purple-400 drop-shadow"/>} items={YEARS} activeValue={selectedFilters.year} onSelect={(val) => setSingleFilter('year', val)} gridClass="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 gap-1.5" />
                            <FilterRow label="Sắp xếp" icon={<FaSortAmountDown className="text-red-400 drop-shadow"/>} items={FILTER_DATA.sort} activeValue={selectedFilters.sort} onSelect={(val) => setSingleFilter('sort', val)} />
                        </div>

                        <div className="mt-10 flex flex-col md:flex-row justify-end gap-4 border-t border-white/5 pt-8 relative z-10">
                            <button onClick={handleClearFilter} className="px-8 py-3 rounded-xl font-bold text-gray-400 hover:text-white hover:bg-white/5 transition flex items-center justify-center gap-2 text-sm w-full md:w-auto"><FaTrashAlt /> Đặt lại</button>
                            <button onClick={handleApplyFilter} className="bg-gradient-to-r from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 text-white px-10 py-3 rounded-xl font-bold shadow-xl shadow-red-900/30 transition flex items-center justify-center gap-2 text-sm transform hover:-translate-y-1 w-full md:w-auto"><FaCheck /> Áp dụng bộ lọc</button>
                        </div>
                    </div>
                </div>

                {/* 4. RESULTS */}
                {loading ? <div className="py-10"><MovieGridSkeleton /></div> : (
                    <>
                        {movies.length > 0 ? (
                            <MovieGrid movies={movies} />
                        ) : (
                            <div className="py-24 text-center border-2 border-dashed border-white/5 rounded-3xl bg-white/[0.02]">
                                <div className="inline-block p-6 rounded-full bg-white/5 mb-4 animate-bounce"><FaSearch className="text-4xl text-gray-600"/></div>
                                <h3 className="text-2xl font-bold text-white mb-2">Không tìm thấy phim</h3>
                                <p className="text-gray-500 mb-6 max-w-md mx-auto">Chúng tôi không tìm thấy kết quả nào phù hợp với bộ lọc của bạn.</p>
                                <button onClick={handleClearFilter} className="text-red-500 font-bold hover:text-red-400 hover:underline">Xóa bộ lọc và thử lại</button>
                            </div>
                        )}
                        <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={handlePageChange} />
                    </>
                )}
            </div>
        </div>
    );
};

export default Catalog;