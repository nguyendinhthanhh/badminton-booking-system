const BookingDetailSkeleton = () => {
  return (
    <div className="space-y-6 animate-pulse">
      {/* Customer Info Skeleton */}
      <div className="bg-slate-50 rounded-lg p-4">
        <div className="flex items-center gap-2 mb-3">
          <div className="w-5 h-5 bg-slate-300 rounded"></div>
          <div className="h-4 bg-slate-300 rounded w-40"></div>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <div className="h-3 bg-slate-200 rounded w-24 mb-2"></div>
            <div className="h-5 bg-slate-300 rounded w-32"></div>
          </div>
          <div>
            <div className="h-3 bg-slate-200 rounded w-24 mb-2"></div>
            <div className="h-5 bg-slate-300 rounded w-28"></div>
          </div>
          <div className="col-span-2">
            <div className="h-3 bg-slate-200 rounded w-16 mb-2"></div>
            <div className="h-5 bg-slate-300 rounded w-48"></div>
          </div>
        </div>
      </div>

      {/* Court Info Skeleton */}
      <div className="bg-slate-50 rounded-lg p-4">
        <div className="flex items-center gap-2 mb-3">
          <div className="w-5 h-5 bg-slate-300 rounded"></div>
          <div className="h-4 bg-slate-300 rounded w-32"></div>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <div className="h-3 bg-slate-200 rounded w-20 mb-2"></div>
            <div className="h-5 bg-slate-300 rounded w-24"></div>
          </div>
          <div>
            <div className="h-3 bg-slate-200 rounded w-20 mb-2"></div>
            <div className="h-5 bg-slate-300 rounded w-28"></div>
          </div>
          <div className="col-span-2">
            <div className="h-3 bg-slate-200 rounded w-16 mb-2"></div>
            <div className="h-5 bg-slate-300 rounded w-40"></div>
          </div>
        </div>
      </div>

      {/* Booking Info Skeleton */}
      <div className="bg-slate-50 rounded-lg p-4">
        <div className="flex items-center gap-2 mb-3">
          <div className="w-5 h-5 bg-slate-300 rounded"></div>
          <div className="h-4 bg-slate-300 rounded w-36"></div>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <div className="h-3 bg-slate-200 rounded w-20 mb-2"></div>
            <div className="h-5 bg-slate-300 rounded w-28"></div>
          </div>
          <div>
            <div className="h-3 bg-slate-200 rounded w-20 mb-2"></div>
            <div className="h-5 bg-slate-300 rounded w-28"></div>
          </div>
          <div>
            <div className="h-3 bg-slate-200 rounded w-32 mb-2"></div>
            <div className="h-6 bg-slate-300 rounded w-24"></div>
          </div>
          <div>
            <div className="h-3 bg-slate-200 rounded w-36 mb-2"></div>
            <div className="h-6 bg-slate-300 rounded w-20"></div>
          </div>
          <div>
            <div className="h-3 bg-slate-200 rounded w-32 mb-2"></div>
            <div className="h-5 bg-slate-300 rounded w-36"></div>
          </div>
          <div>
            <div className="h-3 bg-slate-200 rounded w-32 mb-2"></div>
            <div className="h-5 bg-slate-300 rounded w-36"></div>
          </div>
          <div className="col-span-2">
            <div className="h-3 bg-slate-200 rounded w-28 mb-2"></div>
            <div className="h-12 bg-slate-300 rounded w-full"></div>
          </div>
        </div>
      </div>

      {/* Time Slots Skeleton */}
      <div>
        <div className="flex items-center gap-2 mb-3">
          <div className="w-5 h-5 bg-slate-300 rounded"></div>
          <div className="h-4 bg-slate-300 rounded w-36"></div>
        </div>
        <div className="space-y-2">
          {[1, 2, 3].map((idx) => (
            <div key={idx} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-slate-300 rounded-full"></div>
                <div>
                  <div className="h-5 bg-slate-300 rounded w-32 mb-1"></div>
                  <div className="h-3 bg-slate-200 rounded w-24"></div>
                </div>
              </div>
              <div className="text-right">
                <div className="h-5 bg-slate-300 rounded w-24 mb-1"></div>
                <div className="h-4 bg-slate-200 rounded w-16"></div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Total Price Skeleton */}
      <div className="border-t border-slate-200 pt-4">
        <div className="flex items-center justify-between">
          <div className="h-6 bg-slate-300 rounded w-24"></div>
          <div className="h-8 bg-slate-300 rounded w-32"></div>
        </div>
      </div>
    </div>
  );
};

export default BookingDetailSkeleton;
