const CourtTimeline = ({ availableSlots, bookings, openTime, closeTime }) => {
  // Convert time string to minutes from midnight
  const timeToMinutes = (timeStr) => {
    const [hours, minutes] = timeStr.split(':').map(Number);
    return hours * 60 + minutes;
  };

  // Convert minutes to time string
  const minutesToTime = (minutes) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}`;
  };

  const startMinutes = timeToMinutes(openTime || '06:00');
  const endMinutes = timeToMinutes(closeTime || '22:00');
  const totalMinutes = endMinutes - startMinutes;

  // Generate time markers (every hour)
  const timeMarkers = [];
  for (let i = startMinutes; i <= endMinutes; i += 60) {
    timeMarkers.push(i);
  }

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6">
      <h3 className="text-base font-black text-gray-900 mb-4">
        📊 Lịch đặt sân hôm nay
      </h3>

      {/* Timeline */}
      <div className="relative">
        {/* Time markers */}
        <div className="flex justify-between mb-2 text-xs font-bold text-gray-400">
          {timeMarkers.map((minutes, idx) => (
            <div key={idx} className="flex-1 text-center">
              {minutesToTime(minutes)}
            </div>
          ))}
        </div>

        {/* Timeline bar */}
        <div className="relative h-16 bg-gray-100 rounded-lg overflow-hidden">
          {/* Available slots (green) */}
          {availableSlots && availableSlots.map((slot, idx) => {
            const slotStart = timeToMinutes(slot.startTime);
            const slotEnd = timeToMinutes(slot.endTime);
            const left = ((slotStart - startMinutes) / totalMinutes) * 100;
            const width = ((slotEnd - slotStart) / totalMinutes) * 100;

            return (
              <div
                key={`available-${idx}`}
                className="absolute top-0 h-full bg-green-200 border-l-2 border-r-2 border-green-400"
                style={{ left: `${left}%`, width: `${width}%` }}
                title={`Trống: ${slot.startTime} - ${slot.endTime}`}
              >
                <div className="flex items-center justify-center h-full text-xs font-bold text-green-700">
                  Trống
                </div>
              </div>
            );
          })}

          {/* Booked slots (blue) */}
          {bookings && bookings.map((booking, idx) => {
            // Skip if no time info
            if (!booking.startTime || !booking.endTime) return null;

            const bookingStart = timeToMinutes(
              typeof booking.startTime === 'string' 
                ? booking.startTime 
                : `${booking.startTime.hour}:${booking.startTime.minute}`
            );
            const bookingEnd = timeToMinutes(
              typeof booking.endTime === 'string'
                ? booking.endTime
                : `${booking.endTime.hour}:${booking.endTime.minute}`
            );
            
            const left = ((bookingStart - startMinutes) / totalMinutes) * 100;
            const width = ((bookingEnd - bookingStart) / totalMinutes) * 100;

            return (
              <div
                key={`booking-${idx}`}
                className="absolute top-0 h-full bg-blue-500 border-l-2 border-r-2 border-blue-700 cursor-pointer hover:bg-blue-600 transition-colors"
                style={{ left: `${left}%`, width: `${width}%` }}
                title={`${booking.customerName} - ${booking.status}`}
              >
                <div className="flex flex-col items-center justify-center h-full text-xs font-bold text-white px-1">
                  <span className="truncate w-full text-center">{booking.customerName}</span>
                  <span className="text-[10px] opacity-80">{booking.status}</span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Legend */}
        <div className="flex gap-4 mt-3 text-xs font-bold">
          <div className="flex items-center gap-1.5">
            <div className="size-3 bg-green-200 border border-green-400 rounded"></div>
            <span className="text-gray-600">Còn trống</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="size-3 bg-blue-500 border border-blue-700 rounded"></div>
            <span className="text-gray-600">Đã đặt</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="size-3 bg-gray-100 border border-gray-300 rounded"></div>
            <span className="text-gray-600">Không khả dụng</span>
          </div>
        </div>
      </div>

      {/* Booking list - Only for admin */}
      {bookings && bookings.length > 0 && (
        <div className="mt-6 pt-6 border-t border-gray-200">
          <h4 className="text-sm font-bold text-gray-900 mb-3">
            Danh sách booking ({bookings.length})
          </h4>
          <div className="space-y-2">
            {bookings.map((booking) => (
              <div
                key={booking.bookingId}
                className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="size-10 rounded-full bg-blue-100 flex items-center justify-center">
                    <span className="material-symbols-outlined text-blue-600 text-[20px]">person</span>
                  </div>
                  <div>
                    <p className="text-sm font-bold text-gray-900">{booking.customerName}</p>
                    <p className="text-xs text-gray-500">{booking.customerPhone}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-bold text-gray-900">
                    {booking.totalPrice?.toLocaleString()}đ
                  </p>
                  <div className="flex items-center gap-2">
                    <span className={`text-xs font-bold px-2 py-0.5 rounded ${
                      booking.status === 'CONFIRMED' ? 'bg-green-100 text-green-700' :
                      booking.status === 'PENDING' ? 'bg-yellow-100 text-yellow-700' :
                      booking.status === 'COMPLETED' ? 'bg-blue-100 text-blue-700' :
                      'bg-gray-100 text-gray-700'
                    }`}>
                      {booking.status}
                    </span>
                    <span className={`text-xs font-bold px-2 py-0.5 rounded ${
                      booking.paymentStatus === 'PAID' ? 'bg-green-100 text-green-700' :
                      'bg-red-100 text-red-700'
                    }`}>
                      {booking.paymentStatus}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default CourtTimeline;
