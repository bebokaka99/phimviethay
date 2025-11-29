import React from 'react';
import MovieCard from './MovieCard'; // Import Card chuẩn

const MovieGrid = ({ movies }) => {
  if (!movies || movies.length === 0) return null;

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-x-4 gap-y-8">
        {movies.map((movie) => (
            <MovieCard key={movie._id} movie={movie} />
        ))}
    </div>
  );
};

export default MovieGrid;