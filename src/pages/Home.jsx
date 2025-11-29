import React, { useEffect, useState } from 'react';
import { Helmet } from 'react-helmet-async'; // Import SEO
import Header from '../components/layout/Header';
import HeroSection from '../components/movies/HeroSection';
import MovieRow from '../components/movies/MovieRow';
import { HomeSkeleton } from '../components/common/Skeleton';
import { getHomeData, getMoviesBySlug } from '../services/movieService';

const Home = () => {
  const [loadingBanner, setLoadingBanner] = useState(true);
  const [loadingList, setLoadingList] = useState(true);
  
  const [bannerMovies, setBannerMovies] = useState([]);
  
  // State lưu trữ các danh sách phim
  const [categories, setCategories] = useState({
      phimLe: [], 
      phimBo: [], 
      tvShows: [],
      hoatHinh: [],
      hanhDong: [],
      tinhCam: [],
      hanQuoc: [],
      trungQuoc: []
  });

  // 1. Tải Banner (Ưu tiên số 1)
  useEffect(() => {
    const fetchBanner = async () => {
        try {
            const data = await getHomeData();
            if (data?.data?.items) {
                // Lấy 8 phim đầu làm slider cho đa dạng
                setBannerMovies(data.data.items.slice(0, 8));
            }
        } catch (err) { console.error(err); } 
        finally { setLoadingBanner(false); }
    };
    fetchBanner();
  }, []);

  // 2. Tải các danh sách bên dưới (Chạy song song)
  useEffect(() => {
      const fetchLists = async () => {
          try {
              // Gọi song song nhiều API để tiết kiệm thời gian
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

  if (loadingBanner) return <HomeSkeleton />;

  return (
    <div className="min-h-screen bg-phim-dark pb-20 overflow-x-hidden">
      
      {/* --- SEO META TAGS --- */}
      <Helmet>
        <title>PhimVietHay - Xem Phim Online HD Vietsub Thuyết Minh Mới Nhất</title>
        <meta name="description" content="PhimVietHay - Trang web xem phim trực tuyến miễn phí chất lượng cao, cập nhật liên tục phim bộ, phim lẻ, anime, tv shows mới nhất 2024." />
        <meta property="og:title" content="PhimVietHay - Xem Phim Online HD Vietsub" />
        <meta property="og:description" content="Xem phim online miễn phí chất lượng cao, tốc độ nhanh tại PhimVietHay." />
        <meta property="og:image" content="https://images.unsplash.com/photo-1536440136628-849c177e76a1?q=80&w=1925&auto=format&fit=crop" />
        <meta property="og:type" content="website" />
      </Helmet>

      
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
                {/* --- LIST PHIM --- */}
                
                {/* Nhóm Phim Mới */}
                <MovieRow title="Phim Lẻ Mới Cập Nhật" movies={categories.phimLe} slug="phim-le" type="danh-sach" />
                <MovieRow title="Phim Bộ Hot" movies={categories.phimBo} slug="phim-bo" type="danh-sach" />
                
                {/* Nhóm Thể loại */}
                <MovieRow title="Phim Hành Động" movies={categories.hanhDong} slug="hanh-dong" type="the-loai" />
                <MovieRow title="Phim Tình Cảm" movies={categories.tinhCam} slug="tinh-cam" type="the-loai" />

                {/* Nhóm Quốc gia */}
                <MovieRow title="Phim Hàn Quốc" movies={categories.hanQuoc} slug="han-quoc" type="quoc-gia" />
                <MovieRow title="Phim Trung Quốc" movies={categories.trungQuoc} slug="trung-quoc" type="quoc-gia" />

                {/* Nhóm Khác */}
                <MovieRow title="Hoạt Hình / Anime" movies={categories.hoatHinh} slug="hoat-hinh" type="danh-sach" />
                <MovieRow title="TV Shows & Gameshow" movies={categories.tvShows} slug="tv-shows" type="danh-sach" />
            </>
        )}
      </div>
    </div>
  );
};

export default Home;