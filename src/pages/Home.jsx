import React, { useEffect, useState } from 'react';
import { Helmet } from 'react-helmet-async';
import HeroSection from '../components/movies/HeroSection';
import LazyMovieRow from '../components/movies/LazyMovieRow';
import { HomeSkeleton } from '../components/common/Skeleton';
import { getHomeData } from '../services/movieService'; // Đã xóa getTrendingMovies

const Home = () => {
  const [loadingBanner, setLoadingBanner] = useState(true);
  
  // Dữ liệu ưu tiên (Chỉ còn Banner)
  const [bannerMovies, setBannerMovies] = useState([]);

  // Cấu hình các danh mục phim
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

  // 1. Chỉ tải Banner (Nhanh hơn rất nhiều)
  useEffect(() => {
    const fetchPriorityData = async () => {
        try {
            const bannerData = await getHomeData();

            if (bannerData?.data?.items) {
                setBannerMovies(bannerData.data.items.slice(0, 8));
            }
        } catch (err) {
            console.error("Lỗi tải trang chủ:", err);
        } finally {
            setLoadingBanner(false);
        }
    };
    
    fetchPriorityData();
  }, []);

  if (loadingBanner) return <HomeSkeleton />;

  return (
    <div className="min-h-screen bg-phim-dark pb-20 overflow-x-hidden">
      <Helmet>
        <title>PhimVietHay - Xem Phim Online HD Vietsub</title>
        <meta name="description" content="Xem phim online chất lượng cao miễn phí..." />
      </Helmet>

      {/* Banner */}
      <HeroSection movies={bannerMovies} />
      
      {/* Danh sách phim (Bỏ Trending, đẩy các mục khác lên) */}
      <div className="relative z-10 px-0 space-y-2 md:space-y-4 pb-10 mt-8 md:mt-12 bg-gradient-to-b from-phim-dark/0 via-phim-dark to-phim-dark">
            
            {/* Các danh mục phim Load Lazy */}
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