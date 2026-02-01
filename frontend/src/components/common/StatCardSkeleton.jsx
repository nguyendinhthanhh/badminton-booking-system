const StatCardSkeleton = () => {
  return (
    <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm h-32 animate-pulse">
      <div className="flex justify-between items-start mb-4">
        <div className="h-3 bg-gray-200 rounded w-24"></div>
        <div className="w-8 h-8 bg-gray-200 rounded-md"></div>
      </div>
      <div className="space-y-2">
        <div className="h-8 bg-gray-200 rounded w-20"></div>
        <div className="h-2 bg-gray-200 rounded w-32"></div>
      </div>
    </div>
  );
};

export default StatCardSkeleton;
