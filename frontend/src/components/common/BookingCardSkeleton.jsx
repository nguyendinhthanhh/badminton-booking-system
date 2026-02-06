import React from 'react';

const BookingCardSkeleton = () => {
  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden animate-pulse">
      {/* Header */}
      <div className="bg-gradient-to-r from-gray-300 to-gray-400 p-4">
        <div className="flex justify-between items-start">
          <div className="flex-1">
            <div className="h-6 bg-gray-200 rounded w-32 mb-2"></div>
            <div className="h-4 bg-gray-200 rounded w-24"></div>
          </div>
          <div className="h-6 w-20 bg-gray-200 rounded-full"></div>
        </div>
      </div>

      {/* Body */}
      <div className="p-4 space-y-3">
        {/* Date and Time */}
        <div className="flex items-start space-x-3">
          <div className="w-5 h-5 bg-gray-200 rounded"></div>
          <div className="flex-1">
            <div className="h-3 bg-gray-200 rounded w-16 mb-2"></div>
            <div className="h-4 bg-gray-200 rounded w-40"></div>
          </div>
        </div>

        <div className="flex items-start space-x-3">
          <div className="w-5 h-5 bg-gray-200 rounded"></div>
          <div className="flex-1">
            <div className="h-3 bg-gray-200 rounded w-16 mb-2"></div>
            <div className="h-4 bg-gray-200 rounded w-32"></div>
          </div>
        </div>

        {/* Price Breakdown */}
        <div className="bg-gray-50 rounded-lg p-3 space-y-2">
          <div className="h-4 bg-gray-200 rounded w-24 mb-2"></div>
          <div className="flex justify-between">
            <div className="h-3 bg-gray-200 rounded w-32"></div>
            <div className="h-3 bg-gray-200 rounded w-20"></div>
          </div>
          <div className="flex justify-between">
            <div className="h-3 bg-gray-200 rounded w-28"></div>
            <div className="h-3 bg-gray-200 rounded w-20"></div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="bg-gray-50 px-4 py-3 border-t border-gray-200">
        <div className="flex justify-between items-center">
          <div>
            <div className="h-3 bg-gray-200 rounded w-24 mb-2"></div>
            <div className="h-5 bg-gray-200 rounded w-16"></div>
          </div>
          <div className="text-right">
            <div className="h-3 bg-gray-200 rounded w-16 mb-2 ml-auto"></div>
            <div className="h-7 bg-gray-200 rounded w-24"></div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BookingCardSkeleton;
