const PriceGridSkeleton = () => {
  return (
    <div className="bg-white rounded-xl border-2 border-blue-200 shadow-sm mb-6 animate-pulse">
      {/* Header skeleton */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-500 px-5 py-4 rounded-t-xl">
        <div className="flex items-center justify-between">
          <div>
            <div className="h-5 w-32 bg-white/30 rounded mb-2"></div>
            <div className="h-3 w-24 bg-white/20 rounded"></div>
          </div>
          <div className="bg-white/20 rounded-lg px-4 py-2">
            <div className="h-2 w-12 bg-white/30 rounded mb-1"></div>
            <div className="h-6 w-16 bg-white/40 rounded"></div>
          </div>
        </div>
      </div>

      {/* Table skeleton */}
      <div className="p-5">
        <table className="w-full">
          <thead>
            <tr className="border-b-2 border-gray-200">
              <th className="text-left py-3 px-2">
                <div className="h-3 w-20 bg-gray-200 rounded"></div>
              </th>
              <th className="text-left py-3 px-2">
                <div className="h-3 w-12 bg-gray-200 rounded"></div>
              </th>
              <th className="text-right py-3 px-2">
                <div className="h-3 w-16 bg-gray-200 rounded ml-auto"></div>
              </th>
              <th className="text-center py-3 px-2">
                <div className="h-3 w-20 bg-gray-200 rounded mx-auto"></div>
              </th>
            </tr>
          </thead>
          <tbody>
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <tr key={i} className="border-b border-gray-100">
                <td className="py-3 px-2">
                  <div className="flex items-center gap-2">
                    <div className="size-5 bg-gray-200 rounded"></div>
                    <div>
                      <div className="h-4 w-24 bg-gray-200 rounded mb-1"></div>
                      <div className="h-2 w-16 bg-gray-200 rounded"></div>
                    </div>
                  </div>
                </td>
                <td className="py-3 px-2">
                  <div className="h-6 w-16 bg-gray-200 rounded-lg"></div>
                </td>
                <td className="py-3 px-2 text-right">
                  <div className="h-5 w-20 bg-gray-200 rounded ml-auto"></div>
                </td>
                <td className="py-3 px-2 text-center">
                  <div className="h-6 w-20 bg-gray-200 rounded-full mx-auto"></div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Footer skeleton */}
      <div className="px-5 pb-4">
        <div className="h-12 bg-gray-100 rounded-lg"></div>
      </div>
    </div>
  );
};

export default PriceGridSkeleton;
