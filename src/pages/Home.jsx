import React, { useEffect, useState } from 'react';
import { Helmet } from 'react-helmet-async';
import Header from '../components/layout/Header';
import HeroSection from '../components/movies/HeroSection';
import MovieRow from '../components/movies/MovieRow';
import { HomeSkeleton } from '../components/common/Skeleton';
// Import thêm getTrendingMovies
import { getHomeData, getMoviesBySlug, getTrendingMovies } from '../services/movieService';

const Home = () => {
  const [loadingBanner, setLoadingBanner] = useState(true);
  const [loadingList, setLoadingList] = useState(true);
  
  const [bannerMovies, setBannerMovies] = useState([]);
  const [trendingMovies, setTrendingMovies] = useState([]); // State lưu phim Hot
  
  const [categories, setCategories] = useState({
      phimLe: [], phimBo: [], tvShows: [], hoatHinh: [], hanhDong: [], tinhCam: [], hanQuoc: [], trungQuoc: []
  });

  // 1. Tải Banner
  useEffect(() => {
    const fetchBanner = async () => {
        try {
            const data = await getHomeData();
            if (data?.data?.items) {
                setBannerMovies(data.data.items.slice(0, 8));
            }
        } catch (err) { console.error(err); } 
        finally { setLoadingBanner(false); }
    };
    fetchBanner();
  }, []);

  // 2. Tải List Phim & Trending
  useEffect(() => {
      const fetchLists = async () => {
          try {
              // Gọi API Trending song song với các list khác
              getTrendingMovies().then(res => setTrendingMovies(res));

              const [phimLe, phimBo, tvShows, hoatHinh, hanhDong, tinhCam, hanQuoc, trungQuoc] = await Promise.all([
                  getMoviesBySlug('phim-le', 1, 'danh-sach'),
                  getMoviesBySlug('phim-bo', 1, 'danh-sach'),
                  getMoviesBySlug('tv-shows', 1, 'danh-sach'),
                  getMoviesBySlug('hoat-hinh', 1, 'danh-sach'),
                  getMoviesBySlug('hanh-dong', 1, 'the-loai'),
                  getMoviesBySlug('tinh-cam', 1, 'the-loai'),
                  getMoviesBySlug('han-quoc', 1, 'quoc-gia'),
                  getMoviesBySlug('trung-quoc', 1, 'quoc-gia'),
              ]);
              
              setCategories({
                  phimLe: phimLe?.data?.items || [],
                  phimBo: phimBo?.data?.items || [],
                  tvShows: tvShows?.data?.items || [],
                  hoatHinh: hoatHinh?.data?.items || [],
                  hanhDong: hanhDong?.data?.items || [],
                  tinhCam: tinhCam?.data?.items || [],
                  hanQuoc: hanQuoc?.data?.items || [],
                  trungQuoc: trungQuoc?.data?.items || [],
              });
          } catch (err) { console.error(err); }
          finally { setLoadingList(false); }
      };
      fetchLists();
  }, []);

  // --- TẠO TITLE ĐẶC BIỆT CHO TRENDING ---
  const TrendingTitle = (
      <div className="flex items-center gap-3">
          <span className="text-white">Top 10 Phim Xem Nhiều</span>
          <span className="bg-red-600 text-white text-[10px] font-bold px-2 py-0.5 rounded animate-pulse shadow-lg shadow-red-600/50 tracking-wider border border-red-500">
              HOT
          </span>
      </div>
  );

  if (loadingBanner) return <HomeSkeleton />;

  return (
    <div className="min-h-screen bg-phim-dark pb-20 overflow-x-hidden">
      <Helmet>
        <title>PhimVietHay - Xem Phim Online HD Vietsub Thuyết Minh Mới Nhất</title>
        <meta name="description" content="PhimVietHay - Trang web xem phim trực tuyến miễn phí chất lượng cao, cập nhật liên tục phim bộ, phim lẻ, anime, tv shows mới nhất." />
      </Helmet>

      <Header />
      
      <HeroSection movies={bannerMovies} />
      
      <div className="relative z-10 px-0 space-y-8 md:space-y-12 pb-10 mt-8 md:mt-12 bg-gradient-to-b from-phim-dark/0 via-phim-dark to-phim-dark">
        {loadingList ? (
             <div className="space-y-10 px-4 md:px-16 pt-10">
                 {[1,2,3,4].map(i => (
                     <div key={i} className="animate-pulse">
                         <div className="h-8 w-48 bg-gray-800 rounded mb-4"/>
                         <div className="flex gap-4 overflow-hidden">
                            {[1,2,3,4,5,6].map(j => <div key={j} className="h-[280px] min-w-[200px] bg-gray-800 rounded-lg"/>)}
                         </div>
                     </div>
                 ))}
             </div>
        ) : (
            <>
                {/* --- TOP TRENDING (HIỂN THỊ ĐẦU TIÊN) --- */}
                {trendingMovies.length > 0 && (
                    <div className="mb-8">
                        {/* Truyền biến TrendingTitle chứa JSX vào prop title */}
                        <MovieRow title={TrendingTitle} movies={trendingMovies} />
                    </div>
                )}

                {/* Các mục phim khác */}
                <MovieRow title="Phim Lẻ Mới Cập Nhật" movies={categories.phimLe} slug="phim-le" type="danh-sach" />
                <MovieRow title="Phim Bộ Hot" movies={categories.phimBo} slug="phim-bo" type="danh-sach" />
                
                <MovieRow title="Phim Hành Động Gay Cấn" movies={categories.hanhDong} slug="hanh-dong" type="the-loai" />
                <MovieRow title="Phim Tình Cảm Lãng Mạn" movies={categories.tinhCam} slug="tinh-cam" type="the-loai" />

                <MovieRow title="Phim Hàn Quốc" movies={categories.hanQuoc} slug="han-quoc" type="quoc-gia" />
                <MovieRow title="Phim Trung Quốc" movies={categories.trungQuoc} slug="trung-quoc" type="quoc-gia" />

                <MovieRow title="Hoạt Hình / Anime" movies={categories.hoatHinh} slug="hoat-hinh" type="danh-sach" />
                <MovieRow title="TV Shows & Gameshow" movies={categories.tvShows} slug="tv-shows" type="danh-sach" />
            </>
        )}
      </div>
    </div>
  );
};

export default Home;