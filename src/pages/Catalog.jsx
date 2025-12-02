import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { 
    FaFilter, FaCheck, FaTags, FaTrashAlt, FaSortAmountDown, 
    FaLayerGroup, FaGlobe, FaCalendarAlt, FaFilm, 
    FaChevronLeft, FaChevronRight 
} from 'react-icons/fa';

import Header from '../components/layout/Header';
import MovieGrid from '../components/movies/MovieGrid';
import { MovieGridSkeleton } from '../components/common/Skeleton';
import { getMoviesBySlug, getMenuData } from '../services/movieService';

// --- CONSTANTS ---
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
    ]
};

const YEARS = Array.from({ length: 16 }, (_, i) => ({ 
    name: (2025 - i).toString(), 
    value: (2025 - i).toString() 
}));

// --- SUB-COMPONENTS (Tách ra ngoài để tránh re-render không cần thiết) ---
const FilterPill = ({ label, active, onClick }) => (
    <button 
        onClick={onClick} 
        className={`px-4 py-2 rounded-full text-xs font-bold transition-all duration-200 border flex items-center justify-center gap-2 whitespace-nowrap ${
            active 
                ? 'bg-red-600 text-white border-red-600 shadow-md shadow-red-900/30' 
                : 'bg-[#1a1a1a] text-gray-400 border-white/5 hover:border-white/30 hover:text-white hover:bg-white/5'
        }`}
    >
        {label} {active && <FaCheck className="text-[10px]" />}
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

// --- MAIN COMPONENT ---
const Catalog = ({ group }) => {
    const { slug } = useParams();
    const [searchParams, setSearchParams] = useSearchParams();
    const navigate = useNavigate();
    
    const currentPage = parseInt(searchParams.get('page')) || 1;
    
    // Data State
    const [movies, setMovies] = useState([]);
    const [menuData, setMenuData] = useState({ theLoai: [], quocGia: [] });
    const [totalPages, setTotalPages] = useState(1);
    
    // UI State
    const [loading, setLoading] = useState(true);
    const [title, setTitle] = useState('');
    const [showFilter, setShowFilter] = useState(false);
    const [activeTags, setActiveTags] = useState([]);
    const [selectedFilters, setSelectedFilters] = useState({
        category: [], country: [], year: '', type: '', sort: 'modified.time'
    });

    // 1. Load Menu Data (Chạy 1 lần)
    useEffect(() => {
        const fetchMenu = async () => {
            const data = await getMenuData();
            if (data) setMenuData(data);
        };
        fetchMenu();
    }, []);

    // 2. Sync URL -> Filter State (Để highlight các nút lọc đúng với URL)
    useEffect(() => {
        const parseArray = (str) => str ? str.split(',') : [];
        const newFilters = { category: [], country: [], type: '', year: '', sort: 'modified.time' };

        // Set giá trị mặc định dựa trên Route (slug)
        if (group === 'the-loai') newFilters.category = [slug];
        else if (group === 'quoc-gia') newFilters.country = [slug];
        else if (group === 'danh-sach') newFilters.type = slug;

        // Merge với Query Params từ URL
        const qCat = searchParams.get('category');
        const qCountry = searchParams.get('country');
        
        if (qCat) newFilters.category = [...newFilters.category, ...parseArray(qCat)];
        if (qCountry) newFilters.country = [...newFilters.country, ...parseArray(qCountry)];
        
        // Loại bỏ trùng lặp
        newFilters.category = [...new Set(newFilters.category)];
        newFilters.country = [...new Set(newFilters.country)];

        if (searchParams.get('sort_field')) newFilters.sort = searchParams.get('sort_field');
        if (searchParams.get('year')) newFilters.year = searchParams.get('year');
        
        setSelectedFilters(newFilters);
    }, [group, slug, searchParams]);

    // 3. Fetch Data Movies (Chạy khi URL thay đổi)
    useEffect(() => {
        window.scrollTo(0, 0);
        const fetchData = async () => {
            setLoading(true);
            try {
                let apiSlug = 'phim-moi';
                let apiType = 'danh-sach';
                const filterParams = {};

                // Xử lý params từ URL
                const urlType = group === 'danh-sach' ? slug : searchParams.get('type');
                const urlCats = searchParams.get('category') ? searchParams.get('category').split(',') : [];
                const urlCountries = searchParams.get('country') ? searchParams.get('country').split(',') : [];

                if (group === 'the-loai') urlCats.push(slug);
                if (group === 'quoc-gia') urlCountries.push(slug);

                const uniqueCats = [...new Set(urlCats)];
                const uniqueCountries = [...new Set(urlCountries)];

                // Logic ưu tiên: Type > Category > Country
                if (urlType && urlType !== 'phim-moi') { 
                    apiSlug = urlType; 
                    apiType = 'danh-sach'; 
                } else if (uniqueCats.length > 0) { 
                    apiSlug = uniqueCats[0]; 
                    apiType = 'the-loai'; 
                } else if (uniqueCountries.length > 0) { 
                    apiSlug = uniqueCountries[0]; 
                    apiType = 'quoc-gia'; 
                }

                // Lọc bỏ slug đã dùng làm apiSlug để tránh trùng lặp trong filterParams
                const finalCats = uniqueCats.filter(c => !(apiType === 'the-loai' && c === apiSlug));
                const finalCountries = uniqueCountries.filter(c => !(apiType === 'quoc-gia' && c === apiSlug));

                if (finalCats.length > 0) filterParams.category = finalCats.join(',');
                if (finalCountries.length > 0) filterParams.country = finalCountries.join(',');
                if (searchParams.get('year')) filterParams.year = searchParams.get('year');
                if (searchParams.get('sort_field')) filterParams.sort_field = searchParams.get('sort_field');

                // Gọi API
                const data = await getMoviesBySlug(apiSlug, currentPage, apiType, filterParams);
                
                if (data?.data?.items) {
                    setMovies(data.data.items);
                    if(!title) setTitle(data.data.titlePage || 'Danh sách phim');

                    const pagination = data.data.params?.pagination;
                    if (pagination) setTotalPages(Math.ceil(pagination.totalItems / pagination.totalItemsPerPage));
                } else {
                    setMovies([]);
                }
            } catch (error) { 
                console.error(error); 
            } finally { 
                setLoading(false); 
            }
        };
        fetchData();
    }, [slug, currentPage, group, searchParams]);

    // 4. Update Title & Tags (UI Logic - phụ thuộc MenuData)
    useEffect(() => {
        const urlType = group === 'danh-sach' ? slug : searchParams.get('type');
        const urlCats = searchParams.get('category') ? searchParams.get('category').split(',') : [];
        const urlCountries = searchParams.get('country') ? searchParams.get('country').split(',') : [];
        
        if (group === 'the-loai') urlCats.push(slug);
        if (group === 'quoc-gia') urlCountries.push(slug);

        const tags = [];
        const titleParts = [];

        // Map type slug -> tên
        if (urlType && urlType !== 'phim-moi') {
            const name = FILTER_DATA.type.find(t => t.value === urlType)?.name;
            if (name) { tags.push({ label: name }); titleParts.push(name); }
        }

        // Map category/country slug -> tên từ menuData
        if (menuData.theLoai.length > 0) {
            [...new Set(urlCats)].forEach(c => {
                const name = menuData.theLoai.find(i => i.slug === c)?.name;
                if (name) { tags.push({ label: name }); titleParts.push(name); }
            });
            [...new Set(urlCountries)].forEach(c => {
                const name = menuData.quocGia.find(i => i.slug === c)?.name;
                if (name) { tags.push({ label: name }); titleParts.push(name); }
            });
        }

        if (searchParams.get('year')) {
            const y = searchParams.get('year');
            tags.push({ label: `Năm ${y}` });
            titleParts.push(`Năm ${y}`);
        }

        setActiveTags(tags.filter(t => t && t.label));

        if (titleParts.length > 0) {
            setTitle(titleParts.join(' • '));
        } else if (!title) {
            setTitle('Danh sách phim');
        }
    }, [menuData, searchParams, slug, group]);


    // --- HANDLERS ---
    const handleApplyFilter = () => {
        let path = '/danh-sach/';
        path += selectedFilters.type ? selectedFilters.type : 'phim-moi';
        
        const params = new URLSearchParams();
        if (selectedFilters.category.length > 0) params.set('category', selectedFilters.category.join(','));
        if (selectedFilters.country.length > 0) params.set('country', selectedFilters.country.join(','));
        if (selectedFilters.year) params.set('year', selectedFilters.year);
        if (selectedFilters.sort) params.set('sort_field', selectedFilters.sort);
        
        params.set('page', '1');
        navigate(`${path}?${params.toString()}`);
        setShowFilter(false);
    };

    const handleClearFilter = () => {
        setSelectedFilters({ category: [], country: [], year: '', type: '', sort: 'modified.time' });
        navigate('/danh-sach/phim-moi');
        setShowFilter(false);
    };

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

    return (
        <div className="bg-phim-dark min-h-screen text-white font-sans">
            <Helmet>
                <title>{title ? `${title} | PhimVietHay` : 'Danh sách phim - PhimVietHay'}</title>
                <meta name="description" content={`Xem danh sách ${title} mới nhất...`} />
            </Helmet>

            
            <div className="pt-24 px-4 md:px-8 container mx-auto pb-20">
                {/* Header Page */}
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-6">
                    <h2 className="text-2xl md:text-3xl font-bold uppercase tracking-wide flex items-center gap-3">
                        <span className="text-red-600 border-l-4 border-red-600 pl-3 text-ellipsis overflow-hidden line-clamp-1">
                            {title}
                        </span>
                    </h2>
                    <button 
                        onClick={() => setShowFilter(!showFilter)} 
                        className={`flex items-center gap-2 px-6 py-2.5 rounded-full font-bold transition shadow-lg border ${showFilter ? 'bg-red-600 text-white border-red-600' : 'bg-[#1a1a1a] text-white border-white/10 hover:border-white/30'}`}
                    >
                        <FaFilter /> {showFilter ? 'Ẩn bộ lọc' : 'Lọc Phim'}
                    </button>
                </div>

                {/* Active Tags */}
                {activeTags.length > 0 && !showFilter && (
                    <div className="flex flex-wrap gap-2 mb-8 animate-fade-in">
                        <span className="text-sm font-bold text-gray-500 flex items-center gap-2 mr-2">
                            <FaTags /> Đang lọc:
                        </span>
                        {activeTags.map((tag, idx) => (
                            <span key={idx} className="bg-red-600/10 text-red-500 border border-red-600/30 px-3 py-1 rounded-full text-xs font-bold flex items-center gap-2">
                                {tag.label}
                            </span>
                        ))}
                        <button onClick={handleClearFilter} className="text-xs text-gray-500 underline hover:text-white ml-2">
                            Xóa tất cả
                        </button>
                    </div>
                )}

                {/* Filter Panel */}
                <div className={`overflow-hidden transition-all duration-500 ease-in-out ${showFilter ? 'max-h-[3000px] opacity-100 mb-12' : 'max-h-0 opacity-0 mb-0'}`}>
                    <div className="bg-[#111] border border-white/10 p-6 md:p-8 rounded-2xl shadow-2xl">
                        <FilterRow label="Loại phim" icon={<FaFilm/>} items={FILTER_DATA.type} activeValue={selectedFilters.type} onSelect={(val) => setSingleFilter('type', val)} />
                        
                        <FilterRow 
                            label="Quốc gia" icon={<FaGlobe/>} items={menuData.quocGia} 
                            activeValue={selectedFilters.country} onSelect={(val) => toggleArrayFilter('country', val)} 
                            isMulti={true} gridClass="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-2" 
                        />
                        
                        <FilterRow 
                            label="Thể loại" icon={<FaLayerGroup/>} items={menuData.theLoai} 
                            activeValue={selectedFilters.category} onSelect={(val) => toggleArrayFilter('category', val)} 
                            isMulti={true} gridClass="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-2" 
                        />
                        
                        <FilterRow label="Năm" icon={<FaCalendarAlt/>} items={YEARS} activeValue={selectedFilters.year} onSelect={(val) => setSingleFilter('year', val)} gridClass="grid grid-cols-4 gap-2" />
                        
                        <FilterRow label="Sắp xếp" icon={<FaSortAmountDown/>} items={FILTER_DATA.sort} activeValue={selectedFilters.sort} onSelect={(val) => setSingleFilter('sort', val)} />

                        <div className="mt-8 flex justify-center md:justify-end gap-4 border-t border-white/10 pt-6">
                            <button onClick={handleClearFilter} className="flex items-center gap-2 px-6 py-3 rounded-full font-bold text-red-500 hover:text-white border border-red-900/30 hover:bg-red-900/50 transition">
                                <FaTrashAlt /> Reset
                            </button>
                            <button onClick={() => setShowFilter(false)} className="px-8 py-3 rounded-full font-bold text-gray-400 hover:text-white bg-[#1f1f1f] hover:bg-[#2a2a2a] transition">
                                Đóng
                            </button>
                            <button onClick={handleApplyFilter} className="bg-red-600 hover:bg-red-700 text-white px-10 py-3 rounded-full font-bold shadow-lg shadow-red-900/20 transform hover:-translate-y-0.5 transition flex items-center gap-2">
                                <FaCheck /> Lọc
                            </button>
                        </div>
                    </div>
                </div>

                {/* Movie Grid & Pagination */}
                {loading ? (
                    <div className="py-10">
                        <MovieGridSkeleton />
                    </div>
                ) : (
                    <>
                        <MovieGrid movies={movies} />
                        
                        {movies.length === 0 && (
                            <div className="py-20 text-center text-gray-500 border-2 border-dashed border-gray-800 rounded-2xl bg-white/5">
                                <FaFilm className="text-5xl mx-auto mb-4 opacity-50"/>
                                <p className="text-xl">Không có phim nào khớp với bộ lọc.</p>
                                <button onClick={handleClearFilter} className="mt-4 text-red-500 hover:underline font-bold">
                                    Xóa bộ lọc
                                </button>
                            </div>
                        )}

                        {movies.length > 0 && totalPages > 1 && (
                            <div className="flex justify-center items-center gap-3 mt-16 pb-10">
                                <button 
                                    onClick={() => handlePageChange(currentPage - 1)} 
                                    disabled={currentPage === 1} 
                                    className={`px-4 py-2 rounded bg-[#1a1a1a] text-gray-400 ${currentPage === 1 ? 'opacity-50' : 'hover:bg-red-600 hover:text-white'}`}
                                >
                                    <FaChevronLeft />
                                </button>
                                <div className="bg-[#1a1a1a] px-4 py-2 rounded text-red-500 font-bold border border-white/10">
                                    {currentPage} / {totalPages}
                                </div>
                                <button 
                                    onClick={() => handlePageChange(currentPage + 1)} 
                                    disabled={currentPage === totalPages} 
                                    className={`px-4 py-2 rounded bg-[#1a1a1a] text-gray-400 ${currentPage === totalPages ? 'opacity-50' : 'hover:bg-red-600 hover:text-white'}`}
                                >
                                    <FaChevronRight />
                                </button>
                            </div>
                        )}
                    </>
                )}
            </div>
        </div>
    );
};

export default Catalog;