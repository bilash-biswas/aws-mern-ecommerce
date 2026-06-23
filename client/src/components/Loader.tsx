import React from 'react';

interface LoaderProps {
  variant?: 'spinner' | 'grid' | 'detail' | 'table' | 'text' | 'hero';
  count?: number;
}

const Loader: React.FC<LoaderProps> = ({ variant = 'grid', count }) => {
  if (variant === 'spinner') {
    return (
      <div className="flex justify-center items-center py-8">
        <div className="relative w-12 h-12">
          <div className="absolute inset-0 rounded-full border-4 border-card-border"></div>
          <div className="absolute inset-0 rounded-full border-4 border-t-primary-indigo border-r-purple-500 animate-spin"></div>
        </div>
      </div>
    );
  }

  if (variant === 'grid') {
    const itemsCount = count || 8;
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 w-full py-6">
        {Array.from({ length: itemsCount }).map((_, index) => (
          <div key={index} className="glass-card rounded-2xl p-4 flex flex-col h-full border border-card-border/40">
            {/* Image Placeholder */}
            <div className="shimmer aspect-square rounded-2xl w-full mb-4 opacity-80"></div>
            
            {/* Category Placeholder */}
            <div className="shimmer h-4 w-1/4 rounded-md mb-2 opacity-70"></div>
            
            {/* Title Placeholder */}
            <div className="shimmer h-6 w-3/4 rounded-md mb-3 opacity-90"></div>
            
            {/* Bottom info placeholder */}
            <div className="flex items-center justify-between mt-auto pt-2 border-t border-card-border/20">
              <div className="shimmer h-5 w-1/5 rounded-md opacity-80"></div>
              <div className="shimmer h-5 w-1/4 rounded-md opacity-75"></div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (variant === 'detail') {
    return (
      <div className="w-full max-w-6xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
          {/* Product Image Skeleton */}
          <div className="glass-card rounded-3xl p-6 border border-card-border/40">
            <div className="shimmer aspect-square rounded-2xl w-full opacity-80"></div>
            <div className="flex gap-4 mt-6">
              <div className="shimmer h-20 w-20 rounded-xl opacity-70"></div>
              <div className="shimmer h-20 w-20 rounded-xl opacity-70"></div>
              <div className="shimmer h-20 w-20 rounded-xl opacity-70"></div>
            </div>
          </div>

          {/* Product Details Info Skeleton */}
          <div className="flex flex-col h-full py-2">
            <div className="shimmer h-5 w-24 rounded-md mb-4 opacity-75"></div>
            <div className="shimmer h-10 w-4/5 rounded-md mb-4 opacity-95"></div>
            <div className="shimmer h-6 w-1/3 rounded-md mb-6 opacity-80"></div>
            
            <div className="border-y border-card-border/40 py-6 my-6 space-y-3">
              <div className="shimmer h-4 w-full rounded-md opacity-70"></div>
              <div className="shimmer h-4 w-11/12 rounded-md opacity-70"></div>
              <div className="shimmer h-4 w-4/5 rounded-md opacity-70"></div>
            </div>

            <div className="flex gap-6 items-center mb-8">
              <div className="shimmer h-12 w-28 rounded-xl opacity-80"></div>
              <div className="shimmer h-12 w-40 rounded-xl opacity-90"></div>
            </div>

            <div className="shimmer h-14 w-full rounded-xl mt-auto opacity-95"></div>
          </div>
        </div>
      </div>
    );
  }

  if (variant === 'table') {
    const rowCount = count || 5;
    return (
      <div className="w-full py-4 space-y-4">
        {/* Table Header Placeholder */}
        <div className="glass-card rounded-xl p-4 border border-card-border/30">
          <div className="flex items-center gap-4">
            <div className="shimmer h-5 w-1/6 rounded-md opacity-90"></div>
            <div className="shimmer h-5 w-2/6 rounded-md opacity-90"></div>
            <div className="shimmer h-5 w-1/6 rounded-md opacity-90"></div>
            <div className="shimmer h-5 w-1/6 rounded-md opacity-90"></div>
            <div className="shimmer h-5 w-1/6 rounded-md opacity-90"></div>
          </div>
        </div>

        {/* Table Rows Placeholder */}
        {Array.from({ length: rowCount }).map((_, index) => (
          <div key={index} className="glass-card rounded-xl p-5 border border-card-border/20">
            <div className="flex items-center gap-4">
              <div className="shimmer h-6 w-1/6 rounded-md opacity-70"></div>
              <div className="shimmer h-6 w-2/6 rounded-md opacity-80"></div>
              <div className="shimmer h-6 w-1/6 rounded-md opacity-70"></div>
              <div className="shimmer h-6 w-1/6 rounded-md opacity-75"></div>
              <div className="shimmer h-6 w-1/6 rounded-md opacity-70"></div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (variant === 'text') {
    const lineCount = count || 3;
    return (
      <div className="w-full py-2 space-y-3">
        {Array.from({ length: lineCount }).map((_, index) => (
          <div 
            key={index} 
            className="shimmer h-4 rounded-md opacity-70"
            style={{ width: index === lineCount - 1 ? '70%' : '100%' }}
          ></div>
        ))}
      </div>
    );
  }

  if (variant === 'hero') {
    return (
      <div className="w-full glass-card rounded-3xl p-8 border border-card-border/40 my-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
          <div className="space-y-6">
            <div className="shimmer h-5 w-1/4 rounded-md opacity-70"></div>
            <div className="shimmer h-14 w-11/12 rounded-xl opacity-95"></div>
            <div className="shimmer h-6 w-4/5 rounded-md opacity-80"></div>
            <div className="flex gap-4 pt-2">
              <div className="shimmer h-12 w-32 rounded-xl opacity-90"></div>
              <div className="shimmer h-12 w-32 rounded-xl opacity-75"></div>
            </div>
          </div>
          <div className="shimmer aspect-video lg:aspect-square rounded-2xl w-full opacity-85"></div>
        </div>
      </div>
    );
  }

  return null;
};

export default Loader;