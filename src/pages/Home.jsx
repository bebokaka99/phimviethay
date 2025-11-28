import React, { useEffect, useState } from 'react';
import Header from '../components/layout/Header';
import HeroSection from '../components/movies/HeroSection';
import MovieRow from '../components/movies/MovieRow';
import { HomeSkeleton } from '../components/common/Skeleton';
import { getHomeData, getMoviesBySlug } from '../services/movieService';

const Home = () => {
  const [loadingBanner, setLoadingBanner] = useState(true);
  const [loadingList, setLoadingList] = useState(true);
  
  const [bannerMovies, setBannerMovies] = useState([]);
  
  // Thêm nhiều danh mục hơn
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

  // 2. Tải List Phim (Gọi nhiều API hơn)
  useEffect(() => {
      const fetchLists = async () => {
          try {
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
      <Header />
      
      <HeroSection movies={bannerMovies} />
      
      <div className="relative z-10 px-0 space-y-6 md:space-y-10 pb-10 mt-6 md:mt-10 bg-gradient-to-b from-phim-dark/0 via-phim-dark to-phim-dark">
        {loadingList ? (
             <div className="space-y-10 px-10 pt-10">
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
                {/* Phim Mới */}
                <MovieRow title="Phim Lẻ Mới Cập Nhật" movies={categories.phimLe} slug="phim-le" type="danh-sach" />
                <MovieRow title="Phim Bộ Hot" movies={categories.phimBo} slug="phim-bo" type="danh-sach" />
                
                {/* Thể loại */}
                <MovieRow title="Phim Hành Động" movies={categories.hanhDong} slug="hanh-dong" type="the-loai" />
                <MovieRow title="Phim Tình Cảm Lãng Mạn" movies={categories.tinhCam} slug="tinh-cam" type="the-loai" />

                {/* Quốc gia */}
                <MovieRow title="Phim Hàn Quốc" movies={categories.hanQuoc} slug="han-quoc" type="quoc-gia" />
                <MovieRow title="Phim Trung Quốc" movies={categories.trungQuoc} slug="trung-quoc" type="quoc-gia" />

                {/* Khác */}
                <MovieRow title="Hoạt Hình / Anime" movies={categories.hoatHinh} slug="hoat-hinh" type="danh-sach" />
                <MovieRow title="TV Shows & Gameshow" movies={categories.tvShows} slug="tv-shows" type="danh-sach" />
            </>
        )}
      </div>
    </div>
  );
};

export default Home;