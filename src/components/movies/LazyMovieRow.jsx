import React, { useState, useEffect } from 'react';
import MovieRow from './MovieRow';
import { getMoviesBySlug } from '../../services/movieService'; // Sửa lại đường dẫn import cho đúng thư mục của bạn
import useOnScreen from '../../hooks/useOnScreen'; // Import hook vừa tạo

const LazyMovieRow = ({ title, slug, type }) => {
    // ref: Gắn vào thẻ div bao ngoài
    // isVisible: True khi người dùng cuộn tới thẻ div này
    // rootMargin: '200px' -> Tải trước khi cuộn tới 200px cho mượt
    const [ref, isVisible] = useOnScreen({ rootMargin: '200px' });
    
    const [movies, setMovies] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Chỉ gọi API khi isVisible = true và chưa có movies
        if (isVisible && movies.length === 0) {
            const fetchData = async () => {
                try {
                    const res = await getMoviesBySlug(slug, 1, type);
                    if (res?.data?.items) {
                        setMovies(res.data.items);
                    }
                } catch (error) {
                    console.error(`Lỗi tải ${title}:`, error);
                } finally {
                    setLoading(false);
                }
            };
            fetchData();
        }
    }, [isVisible, slug, type, title, movies.length]);

    return (
        // Div giữ chỗ (Placeholder)
        // Min-height giúp tránh layout shift (giật bố cục) khi load xong
        <div ref={ref} className="min-h-[350px] transition-opacity duration-500">
            {isVisible && !loading && movies.length > 0 ? (
                <MovieRow title={title} movies={movies} slug={slug} type={type} />
            ) : (
                // Skeleton đơn giản trong lúc chờ cuộn tới hoặc chờ API
                <div className="px-4 md:px-16 py-8 space-y-4 opacity-50">
                     <div className="h-8 w-48 bg-gray-800 rounded animate-pulse"/>
                     <div className="flex gap-4 overflow-hidden">
                        {[1,2,3,4,5].map(i => (
                            <div key={i} className="h-[280px] min-w-[200px] bg-gray-800 rounded-lg animate-pulse"/>
                        ))}
                     </div>
                </div>
            )}
        </div>
    );
};

export default LazyMovieRow;