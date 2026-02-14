import React from 'react';

/**
 * Skeleton loading component for city cards
 * Displays a placeholder while city data is loading
 */
const CityCardSkeleton: React.FC = () => {
  return (
    <div className="city-card-skeleton bg-white rounded-lg overflow-hidden border-3 border-sandstone-300 shadow-cultural animate-pulse">
      {/* Image skeleton */}
      <div className="h-48 bg-sandstone-200" />
      
      {/* Content skeleton */}
      <div className="p-sacred-sm">
        {/* City name */}
        <div className="h-6 bg-sandstone-200 rounded mb-sacred-xs w-3/4" />
        
        {/* State */}
        <div className="h-4 bg-sandstone-200 rounded mb-sacred-xs w-1/2" />
        
        {/* Region */}
        <div className="h-4 bg-sandstone-200 rounded mb-sacred-xs w-1/3" />
        
        {/* Heritage count */}
        <div className="mt-sacred-sm pt-sacred-xs border-t border-sandstone-300">
          <div className="h-3 bg-sandstone-200 rounded w-1/4" />
        </div>
      </div>
    </div>
  );
};

/**
 * Grid of skeleton cards for loading state
 */
export const CityListSkeleton: React.FC<{ count?: number }> = ({ count = 8 }) => {
  return (
    <div className="city-list-container w-full max-w-7xl mx-auto px-sacred-md py-sacred-lg">
      {/* Header skeleton */}
      <div className="text-center mb-sacred-lg">
        <div className="text-4xl mb-sacred-sm">🕉️</div>
        <div className="h-10 bg-sandstone-200 rounded w-64 mx-auto animate-pulse" />
      </div>

      {/* Filters skeleton */}
      <div className="filters-section bg-ivory-100 border-2 border-sandstone-300 rounded-lg p-sacred-md mb-sacred-lg">
        <div className="h-10 bg-sandstone-200 rounded mb-sacred-sm animate-pulse" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-sacred-sm">
          <div className="h-10 bg-sandstone-200 rounded animate-pulse" />
          <div className="h-10 bg-sandstone-200 rounded animate-pulse" />
        </div>
      </div>

      {/* City grid skeleton */}
      <div className="city-grid grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-sacred-md">
        {Array.from({ length: count }).map((_, index) => (
          <CityCardSkeleton key={index} />
        ))}
      </div>
    </div>
  );
};

export default CityCardSkeleton;
