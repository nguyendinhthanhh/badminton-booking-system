const TimePickerBooking = ({
  selectedStartTime,
  selectedEndTime,
  onStartTimeChange,
  onEndTimeChange,
  onCheckAvailability,
  checkingAvailability,
  availabilityResult,
  priceResult,
  openTime,
  closeTime
}) => {
  // Generate time options (every 30 minutes)
  const generateTimeOptions = () => {
    const options = [];
    const [openHour, openMin] = (openTime || '06:00').split(':').map(Number);
    const [closeHour, closeMin] = (closeTime || '22:00').split(':').map(Number);

    const startMinutes = openHour * 60 + openMin;
    const endMinutes = closeHour * 60 + closeMin;

    for (let minutes = startMinutes; minutes <= endMinutes; minutes += 30) {
      const hours = Math.floor(minutes / 60);
      const mins = minutes % 60;
      const timeStr = `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}`;
      options.push({
        value: timeStr,
        label: `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}`,
        displayLabel: `${hours.toString().padStart(2, '0')}h${mins.toString().padStart(2, '0')}`
      });
    }

    return options;
  };

  const timeOptions = generateTimeOptions();

  const calculateDuration = (startTime, endTime) => {
    if (!startTime || !endTime) return 0;
    const [startHour, startMin] = startTime.split(':').map(Number);
    const [endHour, endMin] = endTime.split(':').map(Number);
    const startMinutes = startHour * 60 + startMin;
    const endMinutes = endHour * 60 + endMin;
    return endMinutes - startMinutes;
  };

  const duration = calculateDuration(selectedStartTime, selectedEndTime);
  const isValidDuration = duration >= 60; // Chỉ yêu cầu tối thiểu 1 giờ, không giới hạn tối đa
  const durationWarning = duration > 0 && duration < 60
    ? 'Tối thiểu 1 giờ'
    : null;

  // Get available end times
  const getAvailableEndTimes = () => {
    if (!selectedStartTime) return [];
    return timeOptions.filter(option => option.value > selectedStartTime);
  };

  return (
    <div className="mb-10">
      <h3 className="text-base font-black text-gray-900 mb-5">
        🕐 Chọn giờ đặt sân
      </h3>

      {/* Tabs */}
      <div className="flex gap-8 mb-6 border-b-2 border-gray-200">
        <button className="pb-3 text-sm font-bold text-blue-600 border-b-3 border-blue-600 px-2 transition-colors">
          Đặt sân
        </button>
        <button className="pb-3 text-sm font-bold text-gray-400 hover:text-gray-700 hover:border-gray-300 border-b-3 border-transparent px-2 transition-colors">
          Thông tin
        </button>
        <button className="pb-3 text-sm font-bold text-gray-400 hover:text-gray-700 hover:border-gray-300 border-b-3 border-transparent px-2 transition-colors">
          Đánh giá
        </button>
      </div>

      <div className="bg-blue-50 border-2 border-blue-200 rounded-xl p-6">
        {/* Start Time */}
        <div className="mb-6">
          <label className="block text-sm font-bold text-gray-700 mb-3">
            Giờ bắt đầu
          </label>
          <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 gap-2">
            {timeOptions.map((option) => (
              <button
                key={option.value}
                type="button"
                onClick={() => {
                  onStartTimeChange(option.value);
                  // Reset end time if it's before new start time
                  if (selectedEndTime && selectedEndTime <= option.value) {
                    onEndTimeChange('');
                  }
                }}
                className={`px-3 py-2.5 rounded-lg text-sm font-bold transition-all ${selectedStartTime === option.value
                    ? 'bg-blue-600 text-white shadow-lg scale-105'
                    : 'bg-white text-gray-700 hover:bg-blue-100 hover:border-blue-300 border-2 border-gray-200'
                  }`}
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>

        {/* End Time */}
        <div className="mb-6">
          <label className="block text-sm font-bold text-gray-700 mb-3">
            Giờ kết thúc
            {!selectedStartTime && (
              <span className="text-xs font-normal text-gray-500 ml-2">
                (Vui lòng chọn giờ bắt đầu trước)
              </span>
            )}
          </label>
          {selectedStartTime ? (
            <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 gap-2">
              {getAvailableEndTimes().map((option) => (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => onEndTimeChange(option.value)}
                  className={`px-3 py-2.5 rounded-lg text-sm font-bold transition-all ${selectedEndTime === option.value
                      ? 'bg-green-600 text-white shadow-lg scale-105'
                      : 'bg-white text-gray-700 hover:bg-green-100 hover:border-green-300 border-2 border-gray-200'
                    }`}
                >
                  {option.label}
                </button>
              ))}
            </div>
          ) : (
            <div className="bg-gray-100 border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
              <span className="material-symbols-outlined text-4xl text-gray-400">schedule</span>
              <p className="text-sm text-gray-500 mt-2">Chọn giờ bắt đầu để xem giờ kết thúc</p>
            </div>
          )}
        </div>

        {/* Duration Display */}
        {selectedStartTime && selectedEndTime && duration > 0 && (
          <div className={`mb-4 p-4 rounded-lg border-2 ${isValidDuration
              ? 'bg-white border-blue-300'
              : 'bg-red-50 border-red-300'
            }`}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-lg">timer</span>
                <span className="text-sm font-bold text-gray-600">Thời lượng:</span>
              </div>
              <span className={`text-lg font-black ${isValidDuration ? 'text-blue-600' : 'text-red-600'
                }`}>
                {duration} phút ({(duration / 60).toFixed(1)} giờ)
              </span>
            </div>
            {durationWarning && (
              <div className="mt-2 text-sm font-bold text-red-600 flex items-center gap-2">
                <span className="material-symbols-outlined text-base">warning</span>
                {durationWarning}
              </div>
            )}
          </div>
        )}

        {/* Quick Duration Buttons */}
        {selectedStartTime && !selectedEndTime && (
          <div className="mb-4 p-4 bg-white rounded-lg border-2 border-blue-200">
            <p className="text-sm font-bold text-gray-700 mb-3">⚡ Chọn nhanh thời lượng:</p>
            <div className="flex flex-wrap gap-2">
              {[60, 90, 120, 180, 240, 300, 360].map((mins) => {
                const [startHour, startMin] = selectedStartTime.split(':').map(Number);
                const startMinutes = startHour * 60 + startMin;
                const endMinutes = startMinutes + mins;
                const endHour = Math.floor(endMinutes / 60);
                const endMin = endMinutes % 60;
                const endTime = `${endHour.toString().padStart(2, '0')}:${endMin.toString().padStart(2, '0')}`;

                // Check if end time is valid
                const isValidEndTime = timeOptions.some(opt => opt.value === endTime);

                if (!isValidEndTime) return null;

                return (
                  <button
                    key={mins}
                    type="button"
                    onClick={() => onEndTimeChange(endTime)}
                    className="px-4 py-2 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg text-sm font-bold hover:from-blue-600 hover:to-blue-700 transition-all shadow-md hover:shadow-lg"
                  >
                    {mins >= 60 ? `${mins / 60}h` : `${mins}m`}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Check Availability Button */}
        <button
          onClick={onCheckAvailability}
          disabled={!selectedStartTime || !selectedEndTime || !isValidDuration || checkingAvailability}
          className={`w-full h-12 rounded-lg font-bold transition-all flex items-center justify-center gap-2 ${selectedStartTime && selectedEndTime && isValidDuration && !checkingAvailability
              ? 'bg-blue-600 text-white hover:bg-blue-700 shadow-lg hover:shadow-xl'
              : 'bg-gray-200 text-gray-400 cursor-not-allowed'
            }`}
        >
          <span className="material-symbols-outlined">search</span>
          {checkingAvailability ? 'Đang kiểm tra...' : 'Kiểm tra khả dụng & Tính giá'}
        </button>

        {/* Availability Result */}
        {availabilityResult && (
          <div className={`mt-4 p-4 rounded-lg border-2 ${!availabilityResult.available ? 'bg-red-50 border-red-500' :
              availabilityResult.softBlocked ? 'bg-amber-50 border-amber-500' :
                'bg-green-50 border-green-500'
            }`}>
            <div className="flex items-start gap-2 mb-2">
              <span className={`material-symbols-outlined text-lg mt-0.5 ${!availabilityResult.available ? 'text-red-600' :
                  availabilityResult.softBlocked ? 'text-amber-600' :
                    'text-green-600'
                }`}>
                {!availabilityResult.available ? 'cancel' :
                  availabilityResult.softBlocked ? 'warning' : 'check_circle'}
              </span>
              <div>
                <span className={`font-bold ${!availabilityResult.available ? 'text-red-700' :
                    availabilityResult.softBlocked ? 'text-amber-700' :
                      'text-green-700'
                  }`}>
                  {!availabilityResult.available ? (availabilityResult.message || '❌ Sân đã được đặt') :
                    availabilityResult.softBlocked ? '⚠️ Có thể đặt (Lưu ý)' : '✅ Sân còn trống!'}
                </span>

                {availabilityResult.available && availabilityResult.softBlocked && (
                  <p className="text-xs text-amber-800 mt-1 font-medium">
                    {availabilityResult.softBlockWarning || "Khung giờ có thể bị ảnh hưởng bởi khách đang chơi, có rủi ro delay."}
                  </p>
                )}
              </div>
            </div>

            {!availabilityResult.available && availabilityResult.conflictingBookings && (
              <p className="text-sm text-red-700 ml-7">
                Có {availabilityResult.conflictingBookings.length} booking trùng giờ
              </p>
            )}

            {/* Soft Block Info */}
            {availabilityResult.softBlockedBy && availabilityResult.softBlockedBy.length > 0 && (
              <div className="mt-2 ml-7 p-2 bg-amber-100/50 rounded-lg text-xs text-amber-900 border border-amber-200">
                <p className="font-bold mb-1">Chi tiết ảnh hưởng:</p>
                {availabilityResult.softBlockedBy.map((block, idx) => (
                  <p key={idx}>• {block.message}</p>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Price Result */}
        {priceResult && availabilityResult?.available && (
          <div className="mt-4 p-4 bg-gradient-to-br from-green-50 to-emerald-50 rounded-lg border-2 border-green-400 shadow-sm">
            <div className="flex items-center gap-2 mb-4">
              <span className="material-symbols-outlined text-green-600">payments</span>
              <h4 className="font-bold text-gray-900">Chi tiết giá</h4>
            </div>

            {/* Debug: Show raw data */}
            {console.log('Price Result:', priceResult)}

            <div className="space-y-3">
              {priceResult.breakdown && priceResult.breakdown.length > 0 ? (
                priceResult.breakdown.map((item, idx) => {
                  console.log('Breakdown item:', item);

                  // Try different field names from API
                  const startTime = item.periodStart || item.startTime || item.start || '';
                  const endTime = item.periodEnd || item.endTime || item.end || '';
                  const timeRange = item.timeRange || (startTime && endTime ? `${startTime} - ${endTime}` : '');

                  // Duration
                  const minutes = item.durationMinutes || item.duration || item.minutes || 0;
                  const hours = item.hours || (minutes > 0 ? minutes / 60 : 0);

                  // Price
                  const pricePerHour = item.pricePerHour || item.hourlyRate || item.rate || 0;
                  const subtotal = item.subtotal || item.total || item.amount || 0;

                  return (
                    <div key={idx} className="bg-white rounded-lg p-4 shadow-sm border border-gray-200">
                      <div className="flex justify-between items-start gap-4">
                        <div className="flex items-start gap-3 flex-1">
                          <span className="material-symbols-outlined text-blue-600 text-xl">schedule</span>
                          <div className="flex-1">
                            <div className="text-base font-bold text-gray-900 mb-1">
                              {timeRange || 'Khung giờ'}
                            </div>
                            {hours > 0 && (
                              <div className="text-sm text-gray-600">
                                {hours >= 1 ? `${hours} giờ` : `${minutes} phút`}
                              </div>
                            )}
                            {pricePerHour > 0 && (
                              <div className="text-xs text-gray-500 mt-1">
                                {pricePerHour.toLocaleString('vi-VN')}đ/giờ
                              </div>
                            )}
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-lg font-bold text-blue-600">
                            {subtotal.toLocaleString('vi-VN')}đ
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="bg-white rounded-lg p-4 text-center text-gray-500">
                  <span className="material-symbols-outlined text-4xl text-gray-300 mb-2">receipt_long</span>
                  <p className="text-sm">Không có chi tiết giá</p>
                </div>
              )}

              {/* Total */}
              <div className="pt-2">
                <div className="flex justify-between items-center bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-lg p-4 shadow-lg">
                  <div className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-2xl">check_circle</span>
                    <span className="font-bold text-lg">Tổng cộng</span>
                  </div>
                  <span className="font-black text-3xl">
                    {(priceResult.totalPrice || 0).toLocaleString('vi-VN')}đ
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default TimePickerBooking;
