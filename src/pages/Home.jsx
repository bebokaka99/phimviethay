import React, { useEffect, useState } from 'react';
import { Helmet } from 'react-helmet-async';
import Header from '../components/layout/Header'; // Giữ nếu bạn dùng Layout riêng
import HeroSection from '../components/movies/HeroSection';
import MovieRow from '../components/movies/MovieRow';
import LazyMovieRow from '../components/movies/LazyMovieRow'; // Import component mới
import { HomeSkeleton } from '../components/common/Skeleton';
import { getHomeData, getTrendingMovies } from '../services/movieService';

const Home = () => {
  const [loadingBanner, setLoadingBanner] = useState(true);
  
  // Dữ liệu ưu tiên (Load ngay lập tức)
  const [bannerMovies, setBannerMovies] = useState([]);
  const [trendingMovies, setTrendingMovies] = useState([]); 

  // Cấu hình các danh mục phim (Sẽ load lazy)
  const ROW_CONFIG = [
    { title: "Phim Lẻ Mới Cập Nhật", slug: "phim-le", type: "danh-sach" },
    { title: "Phim Bộ Hot", slug: "phim-bo", type: "danh-sach" },
    { title: "Phim Hành Động", slug: "hanh-dong", type: "the-loai" },
    { title: "Phim Tình Cảm", slug: "tinh-cam", type: "the-loai" },
    { title: "Phim Hàn Quốc", slug: "han-quoc", type: "quoc-gia" },
    { title: "Phim Trung Quốc", slug: "trung-quoc", type: "quoc-gia" },
    { title: "Hoạt Hình / Anime", slug: "hoat-hinh", type: "danh-sach" },
    { title: "TV Shows", slug: "tv-shows", type: "danh-sach" },
  ];

  // 1. Chỉ tải Banner & Trending (Priority High)
  useEffect(() => {
    const fetchPriorityData = async () => {
        try {
            // Chạy song song 2 request quan trọng nhất
            const [bannerData, trendingData] = await Promise.all([
                getHomeData(),
                getTrendingMovies()
            ]);

            if (bannerData?.data?.items) {
                setBannerMovies(bannerData.data.items.slice(0, 8));
            }
            if (trendingData) {
                setTrendingMovies(trendingData);
            }
        } catch (err) {
            console.error("Lỗi tải trang chủ:", err);
        } finally {
            setLoadingBanner(false);
        }
    };
    
    fetchPriorityData();
  }, []);

  // Title đặc biệt cho Trending
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
        <title>PhimVietHay - Xem Phim Online HD Vietsub</title>
        <meta name="description" content="Xem phim online chất lượng cao miễn phí..." />
      </Helmet>

      {/* Banner luôn load đầu tiên */}
      <HeroSection movies={bannerMovies} />
      
      <div className="relative z-10 px-0 space-y-2 md:space-y-4 pb-10 mt-8 md:mt-12 bg-gradient-to-b from-phim-dark/0 via-phim-dark to-phim-dark">
            
            {/* Trending cũng load ngay (Eager Loading) vì nó ở ngay dưới banner */}
            {trendingMovies.length > 0 && (
                <div className="mb-4">
                    <MovieRow title={TrendingTitle} movies={trendingMovies} />
                </div>
            )}

            {/* Các danh mục còn lại sẽ load theo kiểu Lazy (Cuộn tới đâu load tới đó) */}
            {ROW_CONFIG.map((row, index) => (
                <LazyMovieRow 
                    key={index} 
                    title={row.title} 
                    slug={row.slug} 
                    type={row.type} 
                />
            ))}
      </div>
    </div>
  );
};

export default Home;