const TimelineSkeleton = () => {
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6 animate-pulse">
      <div className="flex items-center justify-between mb-5">
        <div className="h-5 w-48 bg-gray-200 rounded"></div>
        <div className="flex gap-3">
          <div className="h-4 w-20 bg-gray-200 rounded"></div>
          <div className="h-4 w-20 bg-gray-200 rounded"></div>
        </div>
      </div>
      
      {/* Hourly slots skeleton */}
      <div className="space-y-3">
        {[1, 2, 3, 4].map((row) => (
          <div key={row} className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {[1, 2, 3, 4].map((col) => (
              <div key={col} className="h-16 bg-gray-100 rounded-lg"></div>
            ))}
          </div>
        ))}
      </div>
      
      {/* Summary skeleton */}
      <div className="mt-5 pt-5 border-t border-gray-200 flex justify-between">
        <div className="h-4 w-32 bg-gray-200 rounded"></div>
        <div className="h-4 w-32 bg-gray-200 rounded"></div>
      </div>
    </div>
  );
};

export default TimelineSkeleton;
