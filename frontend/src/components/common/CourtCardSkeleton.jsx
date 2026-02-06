const CourtCardSkeleton = () => {
  return (
    <div className="bg-white dark:bg-surface-dark border border-gray-200 dark:border-gray-700 rounded-xl overflow-hidden flex flex-col h-full animate-pulse">
      {/* Image skeleton */}
      <div className="h-48 bg-gradient-to-br from-gray-200 to-gray-300 dark:from-gray-800 dark:to-gray-900 relative">
        <div className="absolute top-3 left-3 h-7 w-20 bg-gray-300 dark:bg-gray-700 rounded-full" />
        <div className="absolute top-3 right-3 h-7 w-16 bg-gray-300 dark:bg-gray-700 rounded-full" />
        <div className="absolute bottom-3 right-3 size-9 bg-gray-300 dark:bg-gray-700 rounded-full" />
      </div>
      
      {/* Content skeleton */}
      <div className="p-5 flex flex-col flex-1">
        {/* Title & Location */}
        <div className="mb-4">
          <div className="h-6 bg-gray-200 dark:bg-gray-800 rounded w-3/4 mb-2" />
          <div className="h-4 bg-gray-200 dark:bg-gray-800 rounded w-1/2" />
        </div>
        
        {/* Description */}
        <div className="mb-4 space-y-2">
          <div className="h-3 bg-gray-200 dark:bg-gray-800 rounded w-full" />
          <div className="h-3 bg-gray-200 dark:bg-gray-800 rounded w-4/5" />
        </div>
        
        {/* Info Grid */}
        <div className="grid grid-cols-2 gap-3 mb-4 pb-4 border-b border-gray-100 dark:border-gray-800">
          <div className="h-16 bg-gray-100 dark:bg-gray-800/50 rounded-lg" />
          <div className="h-16 bg-gray-100 dark:bg-gray-800/50 rounded-lg" />
        </div>
        
        {/* Price */}
        <div className="mb-4">
          <div className="h-3 bg-gray-200 dark:bg-gray-800 rounded w-1/4 mb-2" />
          <div className="h-8 bg-gray-200 dark:bg-gray-800 rounded w-2/3" />
        </div>
        
        {/* Actions */}
        <div className="flex gap-2">
          <div className="flex-[0.8] h-11 bg-gray-100 dark:bg-gray-800 rounded-xl" />
          <div className="flex-1 h-11 bg-gray-100 dark:bg-gray-800 rounded-xl" />
        </div>
      </div>
    </div>
  );
};

export default CourtCardSkeleton;
