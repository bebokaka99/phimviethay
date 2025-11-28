import React from 'react';

// Component tạo một khối màu xám nhấp nháy
const Skeleton = ({ className }) => {
  return (
    <div className={`bg-gray-700 animate-pulse rounded-md ${className}`}></div>
  );
};

export const HomeSkeleton = () => {
    return (
        <div className="w-full min-h-screen bg-phim-dark p-4 md:p-10 space-y-8">
             {/* Banner Skeleton */}
             <Skeleton className="w-full h-[60vh] md:h-[70vh] rounded-xl" />
             
             {/* Row Skeleton */}
             <div className="space-y-4">
                 <Skeleton className="w-48 h-6" />
                 <div className="flex gap-4 overflow-hidden">
                     {[1,2,3,4,5,6].map(i => (
                         <Skeleton key={i} className="min-w-[160px] h-[240px]" />
                     ))}
                 </div>
             </div>
        </div>
    )
}

export default Skeleton;