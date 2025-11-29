import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import Header from '../components/layout/Header';
import { searchMovies } from '../services/movieService';
import MovieGrid from '../components/movies/MovieGrid';
import { MovieGridSkeleton } from '../components/common/Skeleton';
// Import thêm icon mũi tên
import { FaSearch, FaFilm, FaChevronLeft, FaChevronRight } from 'react-icons/fa';

const SearchPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const keyword = searchParams.get('keyword');
  
  // Lấy trang hiện tại từ URL (VD: ?keyword=...&page=2)
  const currentPage = parseInt(searchParams.get('page')) || 1;
  
  const [movies, setMovies] = useState([]);
  const [loading, setLoading] = useState(false);
  const [totalPages, setTotalPages] = useState(1); // State tổng số trang
  const [totalItems, setTotalItems] = useState(0); // Tổng số phim tìm thấy

  useEffect(() => {
    window.scrollTo(0, 0);
    if (!keyword) return;
    
    const fetchSearch = async () => {
        setLoading(true);
        try {
            // Gọi hàm tìm kiếm với tham số page
            const data = await searchMovies(keyword, currentPage);
            
            if (data?.data?.items) {
                setMovies(data.data.items);
                
                // Tính toán phân trang từ dữ liệu API trả về
                const pagination = data.data.params?.pagination;
                if (pagination) {
                    setTotalItems(pagination.totalItems);
                    // API OPhim trả về totalItemsPerPage
                    const total = Math.ceil(pagination.totalItems / pagination.totalItemsPerPage);
                    setTotalPages(total);
                }
            } else {
                setMovies([]);
                setTotalPages(1);
                setTotalItems(0);
            }
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };
    
    fetchSearch();
  }, [keyword, currentPage]); // Chạy lại khi từ khóa HOẶC trang thay đổi

  // Hàm chuyển trang
  const handlePageChange = (newPage) => {
      if (newPage >= 1 && newPage <= totalPages) {
          // Cập nhật URL, giữ nguyên keyword, chỉ đổi page
          setSearchParams({ keyword, page: newPage });
      }
  };

  return (
    <div className="bg-phim-dark min-h-screen text-white font-sans">
      <Helmet>
          <title>{`Tìm kiếm: ${keyword} - Trang ${currentPage} | PhimVietHay`}</title>
          <meta name="description" content={`Kết quả tìm kiếm cho từ khóa ${keyword}.`} />
      </Helmet>

      
      <div className="pt-28 px-4 md:px-12 container mx-auto pb-20">
          
          {/* Header Kết quả */}
          <div className="mb-10 border-b border-gray-800 pb-6 flex items-end justify-between">
              <div>
                  <h2 className="text-2xl md:text-3xl font-bold flex items-center gap-3">
                      <span className="bg-red-600 p-3 rounded-full shadow-lg shadow-red-900/20">
                        <FaSearch className="text-white text-xl" />
                      </span>
                      Kết quả cho: <span className="text-red-500 italic">"{keyword}"</span>
                  </h2>
                  {!loading && (
                      <p className="text-gray-400 mt-4 ml-2 text-sm">
                          Tìm thấy <strong className="text-white">{totalItems}</strong> phim (Trang {currentPage}/{totalPages})
                      </p>
                  )}
              </div>
          </div>

          {/* Content */}
          {loading ? (
              <div className="py-10">
                  <MovieGridSkeleton />
              </div>
          ) : (
              <>
                  {movies.length > 0 ? (
                      <>
                          <MovieGrid movies={movies} />

                          {/* --- PHÂN TRANG (PAGINATION) --- */}
                          {totalPages > 1 && (
                              <div className="flex justify-center items-center gap-4 mt-16">
                                  <button 
                                    onClick={() => handlePageChange(currentPage - 1)}
                                    disabled={currentPage === 1}
                                    className={`flex items-center gap-2 px-5 py-2.5 rounded-full font-bold transition ${currentPage === 1 ? 'bg-gray-800 text-gray-600 cursor-not-allowed' : 'bg-white/10 hover:bg-red-600 hover:text-white'}`}
                                  >
                                      <FaChevronLeft /> Trước
                                  </button>
                                  
                                  <div className="flex items-center gap-2">
                                      <span className="text-gray-400 font-medium text-sm">Trang</span>
                                      <span className="bg-red-600 text-white font-bold w-10 h-10 flex items-center justify-center rounded-full shadow-lg border border-red-500">{currentPage}</span>
                                      <span className="text-gray-400 font-medium text-sm">/ {totalPages}</span>
                                  </div>

                                  <button 
                                    onClick={() => handlePageChange(currentPage + 1)}
                                    disabled={currentPage === totalPages}
                                    className={`flex items-center gap-2 px-5 py-2.5 rounded-full font-bold transition ${currentPage === totalPages ? 'bg-gray-800 text-gray-600 cursor-not-allowed' : 'bg-white/10 hover:bg-red-600 hover:text-white'}`}
                                  >
                                      Sau <FaChevronRight />
                                  </button>
                              </div>
                          )}
                      </>
                  ) : (
                      // Empty State
                      <div className="flex flex-col items-center justify-center py-32 text-gray-500 opacity-60 border-2 border-dashed border-gray-800 rounded-2xl bg-white/5">
                          <FaFilm className="text-7xl mb-4 text-gray-600" />
                          <p className="text-2xl font-bold text-gray-400">Không tìm thấy phim nào.</p>
                          <p className="text-sm mt-2">Hãy thử tìm bằng tên tiếng Anh hoặc từ khóa ngắn hơn.</p>
                          <button onClick={() => navigate('/')} className="mt-6 px-6 py-2 bg-red-600 text-white rounded-full hover:bg-red-700 transition font-bold">
                              Về trang chủ
                          </button>
                      </div>
                  )}
              </>
          )}
      </div>
    </div>
  );
};

export default SearchPage;