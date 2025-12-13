import React, { useEffect, useState, Suspense } from 'react'; // Import Suspense
import { Helmet } from 'react-helmet-async';
import HeroSection from '../components/movies/HeroSection';
// Load Lazy Component để tách bundle
const LazyMovieRow = React.lazy(() => import('../components/movies/LazyMovieRow'));
import { HomeSkeleton, RowSkeleton } from '../components/common/Skeleton'; // Import thêm RowSkeleton
import { getHomeData } from '../services/movieService';

const Home = () => {
  const [loadingBanner, setLoadingBanner] = useState(true);
  const [bannerMovies, setBannerMovies] = useState([]);

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

  useEffect(() => {
    const fetchPriorityData = async () => {
        try {
            const bannerData = await getHomeData();
            if (bannerData?.data?.items) {
                setBannerMovies(bannerData.data.items.slice(0, 8));
            }
        } catch (err) {
            console.error("Home Load Error:", err);
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
        <meta name="description" content="Web xem phim miễn phí, chất lượng cao, cập nhật nhanh nhất." />
      </Helmet>

      {/* Banner Priority */}
      <HeroSection movies={bannerMovies} />
      
      {/* Lazy Load Rows */}
      <div className="relative z-10 px-0 space-y-2 md:space-y-4 pb-10 mt-8 md:mt-12 bg-gradient-to-b from-phim-dark/0 via-phim-dark to-phim-dark">
            {ROW_CONFIG.map((row, index) => (
                <Suspense key={index} fallback={<div className="h-40 bg-white/5 animate-pulse mx-4 rounded-xl"/>}>
                    <LazyMovieRow 
                        title={row.title} 
                        slug={row.slug} 
                        type={row.type} 
                    />
                </Suspense>
            ))}
      </div>
    </div>
  );
};

export default Home;