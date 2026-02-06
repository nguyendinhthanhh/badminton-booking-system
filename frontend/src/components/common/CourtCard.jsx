const CourtCard = ({ court, onViewDetails, onBookNow }) => {
  const defaultCourtImage = 'https://images.unsplash.com/photo-1626224583764-f87db24ac4ea?w=800';
  
  const courtId = court.id;
  const courtName = court.name;
  const isAvailable = court.status === 'ACTIVE' && court.isAvailableToday;
  const courtType = court.type === 'SINGLE' ? 'Sân đơn' : court.type === 'DOUBLE' ? 'Sân đôi' : 'Sân VIP';
  const typeColor = court.type === 'SINGLE' ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400' : 
                   court.type === 'DOUBLE' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' : 
                   'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400';

  const formatPrice = (price) => {
    return new Intl.NumberFormat('vi-VN').format(price) + 'đ';
  };

  return (
    <div className="group bg-white dark:bg-surface-dark rounded-xl overflow-hidden hover:shadow-xl transition-all duration-300 border border-gray-200 dark:border-gray-700 hover:border-primary/30">
      {/* Image */}
      <div className="relative h-48 overflow-hidden bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-900">
        <img
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
          src={court.imageUrl || defaultCourtImage}
          alt={courtName}
          onError={(e) => {
            e.target.src = defaultCourtImage;
          }}
        />
        {/* Overlay gradient */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent"></div>
        
        {/* Status Badge */}
        <div className={`absolute top-3 left-3 ${isAvailable ? 'bg-green-500' : 'bg-red-500'} text-white text-xs font-bold px-3 py-1.5 rounded-full shadow-lg flex items-center gap-1.5`}>
          <span className={`w-1.5 h-1.5 rounded-full bg-white ${isAvailable ? 'animate-pulse' : ''}`}></span>
          {isAvailable ? 'Còn trống' : 'Hết sân'}
        </div>

        {/* Court Type Badge */}
        <div className={`absolute top-3 right-3 ${typeColor} text-xs font-semibold px-3 py-1.5 rounded-full backdrop-blur-sm`}>
          {courtType}
        </div>

        {/* Favorite */}
        <button className="absolute bottom-3 right-3 size-9 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center text-gray-600 hover:text-red-500 hover:bg-white transition-all shadow-lg">
          <span className="material-symbols-outlined text-[20px]">favorite_border</span>
        </button>
      </div>

      {/* Content */}
      <div className="p-5">
        {/* Title & Location */}
        <div className="mb-4">
          <h3 className="text-lg font-bold text-[#111318] dark:text-white mb-2 line-clamp-1 group-hover:text-primary transition-colors">
            {courtName}
          </h3>
          <div className="flex items-center gap-1.5 text-[#616e89] dark:text-gray-400 text-sm">
            <span className="material-symbols-outlined text-[16px]">location_on</span>
            <span className="line-clamp-1">{court.location || 'Chưa cập nhật'}</span>
          </div>
        </div>

        {/* Description */}
        {court.description && (
          <p className="text-sm text-[#616e89] dark:text-gray-400 mb-4 line-clamp-2">
            {court.description}
          </p>
        )}

        {/* Info Grid */}
        <div className="grid grid-cols-2 gap-3 mb-4 pb-4 border-b border-gray-100 dark:border-gray-700">
          {/* Capacity */}
          <div className="flex items-center gap-2 bg-gray-50 dark:bg-gray-800/50 rounded-lg p-2.5">
            <div className="size-8 rounded-lg bg-primary/10 flex items-center justify-center">
              <span className="material-symbols-outlined text-[18px] text-primary">groups</span>
            </div>
            <div className="flex flex-col">
              <span className="text-[10px] text-[#616e89] dark:text-gray-400 uppercase font-medium">Sức chứa</span>
              <span className="text-sm font-bold text-[#111318] dark:text-white">{court.capacity || 4} người</span>
            </div>
          </div>

          {/* Operating Hours */}
          <div className="flex items-center gap-2 bg-gray-50 dark:bg-gray-800/50 rounded-lg p-2.5">
            <div className="size-8 rounded-lg bg-primary/10 flex items-center justify-center">
              <span className="material-symbols-outlined text-[18px] text-primary">schedule</span>
            </div>
            <div className="flex flex-col">
              <span className="text-[10px] text-[#616e89] dark:text-gray-400 uppercase font-medium">Giờ mở cửa</span>
              <span className="text-sm font-bold text-[#111318] dark:text-white">{court.openTime}-{court.closeTime}</span>
            </div>
          </div>
        </div>

        {/* Price Section */}
        <div className="mb-4">
          <p className="text-[10px] text-[#616e89] dark:text-gray-400 uppercase font-medium mb-1.5">Giá thuê</p>
          {court.minPricePerHour && court.maxPricePerHour ? (
            <div className="flex items-baseline gap-2">
              <p className="text-primary font-bold text-xl">
                {formatPrice(court.minPricePerHour)}
              </p>
              <span className="text-[#616e89] dark:text-gray-400 text-sm">-</span>
              <p className="text-primary font-bold text-xl">
                {formatPrice(court.maxPricePerHour)}
              </p>
              <span className="text-sm text-[#616e89] dark:text-gray-400 font-normal">/giờ</span>
            </div>
          ) : (
            <p className="text-[#616e89] dark:text-gray-400 text-sm italic">
              Liên hệ để biết giá
            </p>
          )}
        </div>

        {/* Actions */}
        <div className="flex gap-2">
          <button
            onClick={() => onViewDetails(courtId)}
            className="flex-[0.8] h-11 rounded-xl border-2 border-gray-200 dark:border-gray-700 flex items-center justify-center gap-1.5 text-[#111318] dark:text-white hover:border-primary hover:bg-primary/5 transition-all text-sm font-semibold"
          >
            <span className="material-symbols-outlined text-[18px]">visibility</span>
            <span>Chi tiết</span>
          </button>
          {isAvailable ? (
            <button
              onClick={() => onBookNow(courtId)}
              className="flex-1 h-11 rounded-xl bg-gradient-to-r from-primary to-primary-hover hover:shadow-lg hover:shadow-primary/30 text-white text-sm font-bold transition-all flex items-center justify-center gap-1.5 group/btn"
            >
              <span>Đặt ngay</span>
              <span className="material-symbols-outlined text-[18px] group-hover/btn:translate-x-1 transition-transform">arrow_forward</span>
            </button>
          ) : (
            <button
              disabled
              className="flex-1 h-11 rounded-xl bg-gray-200 dark:bg-gray-700 text-[#616e89] dark:text-gray-400 text-sm font-bold cursor-not-allowed"
            >
              Không khả dụng
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default CourtCard;
