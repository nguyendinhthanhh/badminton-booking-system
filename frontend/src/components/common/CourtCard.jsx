import { useState } from 'react';

const CourtCard = ({ court, onViewDetails, onBookNow }) => {
  const defaultCourtImage = 'https://images.unsplash.com/photo-1626224583764-f87db24ac4ea?w=800';
  const [imageLoaded, setImageLoaded] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  // Prepare images list (using fallback if empty)
  // TODO: Remove mock images when backend data is ready
  const demoImages = [
    court.imageUrl || defaultCourtImage,
    'https://images.unsplash.com/photo-1626224583764-f87db24ac4ea?w=800',
    'https://plus.unsplash.com/premium_photo-1676634832558-6654a134e920?w=800'
  ];
  const images = (court.images && court.images.length > 0) ? court.images : demoImages;
  const currentImage = images[currentImageIndex];

  const courtId = court.id;
  const courtName = court.name;
  const isAvailable = court.status === 'ACTIVE' && court.isAvailableToday;
  const courtType = court.type === 'SINGLE' ? 'Sân đơn' : court.type === 'DOUBLE' ? 'Sân đôi' : 'Sân VIP';

  // Sport-inspired accent colors
  const getAccentColor = () => {
    switch (court.type) {
      case 'SINGLE':
        return {
          primary: 'bg-blue-600',
          text: 'text-blue-600',
          border: 'border-blue-600',
          hover: 'hover:bg-blue-700',
          light: 'bg-blue-50',
          darkBg: 'dark:bg-blue-900/20'
        };
      case 'DOUBLE':
        return {
          primary: 'bg-green-600',
          text: 'text-green-600',
          border: 'border-green-600',
          hover: 'hover:bg-green-700',
          light: 'bg-green-50',
          darkBg: 'dark:bg-green-900/20'
        };
      default: // VIP
        return {
          primary: 'bg-amber-600',
          text: 'text-amber-600',
          border: 'border-amber-600',
          hover: 'hover:bg-amber-700',
          light: 'bg-amber-50',
          darkBg: 'dark:bg-amber-900/20'
        };
    }
  };

  const color = getAccentColor();

  const handleNextImage = (e) => {
    e.stopPropagation();
    setCurrentImageIndex((prev) => (prev + 1) % images.length);
  };

  const handlePrevImage = (e) => {
    e.stopPropagation();
    setCurrentImageIndex((prev) => (prev - 1 + images.length) % images.length);
  };

  // Preload next image logic could be added here

  return (
    <div
      className="group bg-white dark:bg-gray-800 rounded-xl overflow-hidden border-2 border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 transition-all duration-300 hover:shadow-lg cursor-pointer"
      onClick={() => onViewDetails(courtId)}
    >
      {/* Image Section */}
      <div className="relative h-48 overflow-hidden bg-gray-100 dark:bg-gray-700 group/image">
        {!imageLoaded && (
          <div className="absolute inset-0 bg-gray-200 dark:bg-gray-700 animate-pulse" />
        )}

        <img
          className={`w-full h-full object-cover transition-transform duration-500 group-hover:scale-105 ${imageLoaded ? 'opacity-100' : 'opacity-0'}`}
          src={currentImage}
          alt={`${courtName} - ${currentImageIndex + 1}`}
          onLoad={() => setImageLoaded(true)}
          onError={(e) => {
            e.target.src = defaultCourtImage;
            setImageLoaded(true);
          }}
        />

        {/* Carousel Controls - Only visible on hover and if multiple images */}
        {images.length > 1 && (
          <>
            <button
              onClick={handlePrevImage}
              className="absolute left-2 top-1/2 -translate-y-1/2 p-1 rounded-full bg-white/80 hover:bg-white text-gray-800 shadow-sm opacity-0 group-hover/image:opacity-100 transition-opacity transform hover:scale-110"
            >
              <span className="material-symbols-outlined text-sm">chevron_left</span>
            </button>
            <button
              onClick={handleNextImage}
              className="absolute right-2 top-1/2 -translate-y-1/2 p-1 rounded-full bg-white/80 hover:bg-white text-gray-800 shadow-sm opacity-0 group-hover/image:opacity-100 transition-opacity transform hover:scale-110"
            >
              <span className="material-symbols-outlined text-sm">chevron_right</span>
            </button>
            {/* Dots Indicator */}
            <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1.5 opacity-0 group-hover/image:opacity-100 transition-opacity">
              {images.map((_, idx) => (
                <div
                  key={idx}
                  className={`w-1.5 h-1.5 rounded-full shadow-sm transition-colors ${idx === currentImageIndex ? 'bg-white' : 'bg-white/50'}`}
                />
              ))}
            </div>
          </>
        )}

        {/* Simple gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent pointer-events-none" />

        {/* Status Badge - Clean & Simple */}
        <div className="absolute top-3 left-3 z-10">
          {court.status === 'ACTIVE' ? (
            isAvailable ? (
              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-green-500 text-white text-xs font-bold">
                <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
                Còn trống
              </div>
            ) : (
              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-red-500 text-white text-xs font-bold">
                <span className="material-symbols-outlined text-sm">close</span>
                Hết sân
              </div>
            )
          ) : (
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-gray-500 text-white text-xs font-bold">
              <span className="material-symbols-outlined text-sm">lock</span>
              Tạm ngưng
            </div>
          )}
        </div>

        {/* Court Type Badge */}
        <div className="absolute top-3 right-3 z-10">
          <div className={`px-3 py-1.5 rounded-md ${color.primary} text-white text-xs font-bold uppercase tracking-wide`}>
            {courtType}
          </div>
        </div>
      </div>

      {/* Content Section */}
      <div className="p-4">
        {/* Court Name & Location */}
        <div className="mb-4">
          <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-1 line-clamp-1">
            {courtName}
          </h3>
          <div className="flex items-center gap-1.5 text-gray-500 dark:text-gray-400 text-sm">
            <span className="material-symbols-outlined text-base">location_on</span>
            <span className="line-clamp-1">{court.location || 'Chưa cập nhật'}</span>
          </div>
        </div>

        {/* Info Row - Horizontal & Clean */}
        <div className="flex items-center gap-4 mb-4 pb-4 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-2">
            <div className={`w-9 h-9 rounded-lg ${color.light} ${color.darkBg} ${color.text} flex items-center justify-center`}>
              <span className="material-symbols-outlined text-lg">group</span>
            </div>
            <div>
              <p className="text-xs text-gray-500 dark:text-gray-400">Sức chứa</p>
              <p className="text-sm font-bold text-gray-900 dark:text-white">{court.capacity || 4} người</p>
            </div>
          </div>

          <div className="w-px h-10 bg-gray-200 dark:bg-gray-700" />

          <div className="flex items-center gap-2">
            <div className={`w-9 h-9 rounded-lg ${color.light} ${color.darkBg} ${color.text} flex items-center justify-center`}>
              <span className="material-symbols-outlined text-lg">schedule</span>
            </div>
            <div>
              <p className="text-xs text-gray-500 dark:text-gray-400">Giờ hoạt động</p>
              <p className="text-sm font-bold text-gray-900 dark:text-white">{court.openTime?.slice(0, 5)} - {court.closeTime?.slice(0, 5)}</p>
            </div>
          </div>
        </div>

        {/* Price & Action - Full Width Button */}
        <div className="space-y-3">
          {/* Price Display */}
          <div className="flex items-baseline gap-2">
            <span className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wide">Giá:</span>
            {court.minPricePerHour ? (
              <div className="flex items-baseline gap-1">
                <span className={`text-2xl font-black ${color.text}`}>
                  {new Intl.NumberFormat('vi-VN').format(court.minPricePerHour)}
                </span>
                <span className="text-sm font-semibold text-gray-500 dark:text-gray-400">đ/giờ</span>
              </div>
            ) : (
              <span className="text-lg font-bold text-gray-500">Liên hệ</span>
            )}
          </div>

          {/* Full Width Button */}
          {court.status === 'ACTIVE' ? (
            <button
              onClick={(e) => { e.stopPropagation(); onViewDetails(courtId); }}
              className={`w-full ${color.primary} ${color.hover} text-white font-bold text-sm py-3 px-4 rounded-lg transition-all duration-200 active:scale-[0.98] flex items-center justify-center gap-2 shadow-sm hover:shadow-md`}
            >
              <span>Xem chi tiết</span>
              <span className="material-symbols-outlined text-lg">arrow_forward</span>
            </button>
          ) : (
            <button
              disabled
              className="w-full bg-gray-200 dark:bg-gray-700 text-gray-400 font-bold text-sm py-3 px-4 rounded-lg cursor-not-allowed flex items-center justify-center gap-2"
            >
              <span className="material-symbols-outlined text-lg">lock</span>
              <span>Tạm ngưng</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default CourtCard;
