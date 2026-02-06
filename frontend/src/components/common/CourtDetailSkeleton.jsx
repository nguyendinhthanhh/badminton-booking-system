const CourtDetailSkeleton = () => {
  return (
    <div className="min-h-screen bg-[#f9fafb] font-sans text-slate-800 animate-pulse">
      {/* Breadcrumbs Skeleton */}
      <div className="max-w-[1240px] mx-auto px-4 py-4">
        <div className="flex items-center gap-2 text-xs mb-4">
          <div className="h-3 w-16 bg-gray-200 rounded"></div>
          <span className="text-gray-300">›</span>
          <div className="h-3 w-24 bg-gray-200 rounded"></div>
          <span className="text-gray-300">›</span>
          <div className="h-3 w-20 bg-gray-200 rounded"></div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* LEFT: Main Content */}
          <div className="lg:col-span-8">
            {/* Gallery Skeleton */}
            <div className="grid grid-cols-12 gap-2 mb-6 h-[400px]">
              <div className="col-span-8 h-full rounded-l-2xl bg-gray-200"></div>
              <div className="col-span-4 flex flex-col gap-2 h-full">
                <div className="h-1/2 rounded-tr-2xl bg-gray-200"></div>
                <div className="h-1/2 rounded-br-2xl bg-gray-200"></div>
              </div>
            </div>

            {/* Court Info Skeleton */}
            <div className="flex justify-between items-start mb-6">
              <div className="flex-1">
                <div className="h-8 w-64 bg-gray-200 rounded mb-2"></div>
                <div className="flex items-center gap-6">
                  <div className="h-4 w-32 bg-gray-200 rounded"></div>
                  <div className="h-4 w-40 bg-gray-200 rounded"></div>
                </div>
              </div>
              <div className="text-right">
                <div className="h-3 w-16 bg-gray-200 rounded mb-2"></div>
                <div className="h-8 w-32 bg-gray-200 rounded"></div>
              </div>
            </div>

            {/* Tabs Skeleton */}
            <div className="flex gap-8 border-b border-gray-100 mb-8">
              <div className="h-4 w-16 bg-gray-200 rounded mb-3"></div>
              <div className="h-4 w-20 bg-gray-200 rounded mb-3"></div>
              <div className="h-4 w-20 bg-gray-200 rounded mb-3"></div>
            </div>

            {/* Date Selection Skeleton */}
            <div className="mb-10">
              <div className="h-5 w-32 bg-gray-200 rounded mb-4"></div>
              <div className="flex gap-2">
                {[1, 2, 3, 4, 5, 6, 7].map((i) => (
                  <div key={i} className="min-w-[64px] h-20 bg-gray-200 rounded-xl"></div>
                ))}
              </div>
            </div>

            {/* Timeline Skeleton */}
            <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6">
              <div className="h-5 w-48 bg-gray-200 rounded mb-4"></div>
              <div className="h-16 bg-gray-100 rounded-lg mb-3"></div>
              <div className="flex gap-4">
                <div className="h-4 w-24 bg-gray-200 rounded"></div>
                <div className="h-4 w-24 bg-gray-200 rounded"></div>
                <div className="h-4 w-32 bg-gray-200 rounded"></div>
              </div>
            </div>

            {/* Price Display Skeleton */}
            <div className="mb-10">
              <div className="h-5 w-48 bg-gray-200 rounded mb-5"></div>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {[1, 2, 3, 4, 5, 6].map((i) => (
                  <div key={i} className="h-20 bg-gray-200 rounded-xl"></div>
                ))}
              </div>
            </div>

            {/* Time Picker Skeleton */}
            <div className="mb-10">
              <div className="h-5 w-32 bg-gray-200 rounded mb-5"></div>
              <div className="bg-blue-50 border-2 border-blue-200 rounded-xl p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-4">
                  <div className="h-12 bg-gray-200 rounded-lg"></div>
                  <div className="h-12 bg-gray-200 rounded-lg"></div>
                </div>
                <div className="h-12 bg-gray-200 rounded-lg"></div>
              </div>
            </div>

            {/* Amenities Skeleton */}
            <div className="bg-white rounded-2xl border border-gray-100 p-6">
              <div className="h-5 w-32 bg-gray-200 rounded mb-6"></div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="flex items-center gap-3">
                    <div className="size-10 rounded-xl bg-gray-200"></div>
                    <div className="h-4 w-24 bg-gray-200 rounded"></div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* RIGHT: Sidebar Skeleton */}
          <div className="lg:col-span-4 lg:sticky lg:top-24 self-start">
            <div className="bg-white rounded-[2rem] border border-gray-100 shadow-xl p-8">
              <div className="h-6 w-40 bg-gray-200 rounded mb-8"></div>
              
              <div className="space-y-6 mb-10">
                <div className="h-4 bg-gray-200 rounded"></div>
                <div className="h-4 bg-gray-200 rounded"></div>
                <div className="h-20 bg-gray-200 rounded-lg"></div>
                <div className="h-4 bg-gray-200 rounded"></div>
                <div className="h-4 bg-gray-200 rounded"></div>
              </div>

              <div className="h-14 bg-gray-200 rounded-2xl"></div>

              <div className="mt-6 h-24 bg-gray-100 rounded-2xl"></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CourtDetailSkeleton;
