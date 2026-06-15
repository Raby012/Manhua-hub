import React from 'react';
import { motion } from 'motion/react';

export const HomeSkeleton: React.FC = () => {
  return (
    <div className="min-h-screen">
      {/* Hero Skeleton */}
      <div className="w-full h-[500px] md:h-[700px] bg-card shimmer" />
      
      {/* Rows Skeletons */}
      {[...Array(3)].map((_, i) => (
        <div key={i} className="py-8 px-4 md:px-12">
          <div className="h-8 w-48 bg-card shimmer rounded mb-6" />
          <div className="flex gap-4 overflow-hidden">
            {[...Array(6)].map((_, j) => (
              <div key={j} className="flex-shrink-0 w-[160px] h-[220px] md:w-[200px] md:h-[280px] bg-card shimmer rounded-xl" />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
};

export const DetailsSkeleton: React.FC = () => {
  return (
    <div className="min-h-screen">
      <div className="h-[400px] bg-card shimmer" />
      <div className="max-w-6xl mx-auto px-4 -mt-32">
        <div className="flex flex-col md:flex-row gap-8">
           <div className="w-[200px] h-[280px] md:w-[300px] md:h-[400px] bg-card shimmer rounded-2xl flex-shrink-0" />
           <div className="flex-1 mt-8 md:mt-24">
             <div className="h-12 w-3/4 bg-card shimmer rounded mb-4" />
             <div className="h-6 w-1/4 bg-card shimmer rounded mb-8" />
             <div className="flex gap-4">
                <div className="h-12 w-40 bg-card shimmer rounded-full" />
                <div className="h-12 w-40 bg-card shimmer rounded-full" />
             </div>
           </div>
        </div>
        <div className="mt-12">
           <div className="h-10 w-40 bg-card shimmer rounded mb-4" />
           <div className="h-32 w-full bg-card shimmer rounded" />
        </div>
      </div>
    </div>
  );
};
