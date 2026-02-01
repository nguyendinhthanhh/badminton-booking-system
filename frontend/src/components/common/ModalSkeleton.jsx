const ModalSkeleton = ({ type = 'detail' }) => {
  if (type === 'detail') {
    return (
      <div className="fixed inset-0 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-2xl w-full max-w-3xl max-h-[90vh] overflow-hidden shadow-2xl">
          {/* Header Skeleton */}
          <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 bg-white/30 rounded-full"></div>
                <div className="space-y-2">
                  <div className="h-6 bg-white/30 rounded w-48"></div>
                  <div className="h-4 bg-white/20 rounded w-24"></div>
                </div>
              </div>
              <div className="w-10 h-10 bg-white/20 rounded-lg"></div>
            </div>
          </div>

          {/* Content Skeleton */}
          <div className="p-6 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[...Array(8)].map((_, i) => (
                <div key={i} className="flex items-start gap-4 p-4 bg-gray-50 rounded-lg">
                  <div className="w-10 h-10 bg-gray-200 rounded-lg"></div>
                  <div className="flex-1 space-y-2">
                    <div className="h-3 bg-gray-200 rounded w-20"></div>
                    <div className="h-4 bg-gray-300 rounded w-32"></div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Footer Skeleton */}
          <div className="border-t border-gray-200 px-6 py-4 bg-gray-50">
            <div className="flex justify-end">
              <div className="h-10 bg-gray-200 rounded-lg w-24"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Form skeleton
  return (
    <div className="fixed inset-0 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl w-full max-w-3xl max-h-[90vh] overflow-hidden shadow-2xl">
        {/* Header Skeleton */}
        <div className="bg-gradient-to-r from-indigo-600 to-indigo-700 px-6 py-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-white/30 rounded-lg"></div>
              <div className="space-y-2">
                <div className="h-6 bg-white/30 rounded w-48"></div>
                <div className="h-4 bg-white/20 rounded w-36"></div>
              </div>
            </div>
            <div className="w-10 h-10 bg-white/20 rounded-lg"></div>
          </div>
        </div>

        {/* Form Content Skeleton */}
        <div className="p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="space-y-2">
                <div className="h-4 bg-gray-200 rounded w-24"></div>
                <div className="h-11 bg-gray-100 rounded-lg"></div>
              </div>
            ))}
          </div>
        </div>

        {/* Footer Skeleton */}
        <div className="border-t border-gray-200 px-6 py-4 bg-gray-50">
          <div className="flex justify-end gap-3">
            <div className="h-10 bg-gray-200 rounded-lg w-20"></div>
            <div className="h-10 bg-gray-300 rounded-lg w-32"></div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ModalSkeleton;
