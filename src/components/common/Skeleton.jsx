import React from 'react';

// 1. Skeleton cơ bản (Khối xám nhấp nháy)
const SkeletonBox = ({ className }) => (
  <div className={`bg-gray-800/50 animate-pulse rounded-lg ${className}`}></div>
);

// 2. Skeleton cho 1 Card Phim
export const MovieCardSkeleton = () => {
  return (
    <div className="flex flex-col gap-2">
      {/* Ảnh Poster */}
      <SkeletonBox className="w-full aspect-[2/3] rounded-xl" />
      {/* Tên phim */}
      <SkeletonBox className="h-4 w-3/4 mt-1" />
      {/* Năm/Info */}
      <div className="flex justify-between">
          <SkeletonBox className="h-3 w-1/3" />
          <SkeletonBox className="h-3 w-1/4" />
      </div>
    </div>
  );
};

// 3. Skeleton cho Grid (Dùng ở Catalog, Search, Profile)
export const MovieGridSkeleton = () => {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 gap-y-8">
      {Array(12).fill(0).map((_, i) => (
        <MovieCardSkeleton key={i} />
      ))}
    </div>
  );
};

// 4. Skeleton cho Trang Chủ (Banner + 1 Row)
export const HomeSkeleton = () => {
  return (
    <div className="min-h-screen bg-[#0a0a0a] overflow-hidden">
      {/* Header Placeholder */}
      <div className="h-16 w-full bg-black/20 border-b border-white/5"></div>
      
      {/* Banner Skeleton */}
      <div className="relative w-full h-[500px] md:h-[700px] bg-gray-900 animate-pulse flex items-end pb-20 px-4 md:px-16">
           <div className="w-full max-w-6xl grid grid-cols-1 md:grid-cols-2 gap-8">
               <div className="space-y-4">
                   <SkeletonBox className="h-10 w-3/4 md:w-1/2" /> {/* Title */}
                   <div className="flex gap-3">
                       <SkeletonBox className="h-6 w-12" />
                       <SkeletonBox className="h-6 w-12" />
                       <SkeletonBox className="h-6 w-12" />
                   </div>
                   <SkeletonBox className="h-24 w-full" /> {/* Desc */}
                   <div className="flex gap-4 pt-2">
                       <SkeletonBox className="h-12 w-32 rounded-full" />
                       <SkeletonBox className="h-12 w-32 rounded-full" />
                   </div>
               </div>
               <div className="hidden md:block">
                   <SkeletonBox className="w-[260px] aspect-[2/3] ml-auto rounded-2xl" />
               </div>
           </div>
      </div>

      {/* Movie Row Skeleton */}
      <div className="px-4 md:px-16 py-10 space-y-8">
          {[1, 2].map((i) => (
              <div key={i}>
                  <div className="flex justify-between mb-4">
                      <SkeletonBox className="h-8 w-48" />
                      <SkeletonBox className="h-6 w-20" />
                  </div>
                  <div className="flex gap-4 overflow-hidden">
                      {Array(6).fill(0).map((_, j) => (
                           <div key={j} className="flex-none w-[160px] md:w-[200px]">
                               <MovieCardSkeleton />
                           </div>
                      ))}
                  </div>
              </div>
          ))}
      </div>
    </div>
  );
};

// 5. Skeleton cho Trang Chi Tiết
export const DetailSkeleton = () => {
    return (
        <div className="min-h-screen bg-[#0a0a0a]">
            {/* Banner */}
            <div className="relative w-full h-[600px] md:h-[800px] bg-gray-900 animate-pulse flex items-end pb-12">
                 <div className="container mx-auto px-4 md:px-12 flex flex-col md:flex-row gap-10 items-center md:items-start">
                     {/* Poster */}
                     <SkeletonBox className="w-[150px] md:w-[300px] aspect-[2/3] rounded-xl flex-shrink-0" />
                     
                     {/* Info */}
                     <div className="flex-1 w-full space-y-6">
                         <SkeletonBox className="h-12 w-3/4" /> {/* Title */}
                         <SkeletonBox className="h-6 w-1/3" /> {/* Subtitle */}
                         <div className="flex gap-4">
                             <SkeletonBox className="h-8 w-16 rounded-full" />
                             <SkeletonBox className="h-8 w-16 rounded-full" />
                             <SkeletonBox className="h-8 w-16 rounded-full" />
                         </div>
                         <SkeletonBox className="h-32 w-full" /> {/* Desc */}
                         <div className="flex gap-4 pt-4">
                             <SkeletonBox className="h-12 w-40 rounded-full" />
                             <SkeletonBox className="h-12 w-12 rounded-full" />
                         </div>
                     </div>
                 </div>
            </div>
        </div>
    );
}