import { useState } from "react";

const CourtAvailability = ({
  availableSlots,
  openTime,
  closeTime,
  selectedDate, // YYYY-MM-DD format
  // Booking props
  selectedStartTime,
  selectedEndTime,
  onStartTimeChange,
  onEndTimeChange,
  onCheckAvailability,
  checkingAvailability,
  availabilityResult,
  priceResult,
  onBooking,
  bookingInProgress,
  courtStatus = "ACTIVE", // Default to ACTIVE if not provided
}) => {
  const [viewMode, setViewMode] = useState("30min");

  // Check if slot is in the past (for today only)
  const isPastSlot = (slot) => {
    if (!selectedDate) return false;

    const today = new Date();
    const todayStr = today.toISOString().split('T')[0];

    // Only apply past check for today
    if (selectedDate !== todayStr) return false;

    const nowMinutes = today.getHours() * 60 + today.getMinutes();
    // Slot is past if its end time is before or equal to now
    const slotEndMinutes = slot.minutes + (viewMode === "30min" ? 30 : 60);
    return slotEndMinutes <= nowMinutes;
  };

  // Parse time string to minutes
  const timeToMinutes = (timeStr) => {
    if (!timeStr) return 0;
    const [hours, minutes] = timeStr.split(":").map(Number);
    return hours * 60 + minutes;
  };

  // Convert minutes to time string
  const minutesToTime = (minutes) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours.toString().padStart(2, "0")}:${mins.toString().padStart(2, "0")}`;
  };

  // Generate slots based on interval
  const generateSlots = (interval) => {
    const slots = [];
    const startMinutes = timeToMinutes(openTime || "06:00");
    const endMinutes = timeToMinutes(closeTime || "22:00");

    for (let minutes = startMinutes; minutes < endMinutes; minutes += interval) {
      const startTime = minutesToTime(minutes);
      const endTime = minutesToTime(minutes + interval);

      const isAvailable = courtStatus === "ACTIVE" && availableSlots.some((slot) => {
        const slotStart = timeToMinutes(slot.startTime);
        const slotEnd = timeToMinutes(slot.endTime);
        return slotStart <= minutes && slotEnd >= minutes + interval;
      });

      slots.push({ startTime, endTime, available: isAvailable, minutes });
    }
    return slots;
  };

  const interval = viewMode === "30min" ? 30 : 60;
  const timeSlots = generateSlots(interval);

  // Group slots by hour
  const groupSlotsByHour = () => {
    const grouped = {};
    timeSlots.forEach((slot) => {
      const hour = Math.floor(slot.minutes / 60);
      if (!grouped[hour]) grouped[hour] = [];
      grouped[hour].push(slot);
    });
    return grouped;
  };

  const hourlyGroups = groupSlotsByHour();
  const hours = Object.keys(hourlyGroups).map(Number).sort((a, b) => a - b);

  // Stats
  const availableCount = timeSlots.filter((s) => s.available).length;
  const bookedCount = timeSlots.filter((s) => !s.available).length;
  const availableTime = (availableCount * interval) / 60;
  const bookedTime = (bookedCount * interval) / 60;

  // Selection helpers
  const selectedStartMinutes = timeToMinutes(selectedStartTime);
  const selectedEndMinutes = timeToMinutes(selectedEndTime);

  const isSlotInRange = (slot) => {
    if (!selectedStartTime || !selectedEndTime) return false;
    return slot.minutes >= selectedStartMinutes && slot.minutes < selectedEndMinutes;
  };

  const isSlotStart = (slot) => slot.startTime === selectedStartTime;
  const isSlotEnd = (slot) => slot.endTime === selectedEndTime;

  // IMPROVED: Handle slot click - much simpler logic
  const handleSlotClick = (slot) => {
    if (!slot.available || isPastSlot(slot)) return;

    // If no start selected, or clicking the same start slot (toggle off)
    if (!selectedStartTime || isSlotStart(slot)) {
      if (isSlotStart(slot)) {
        // Toggle off - reset all
        onStartTimeChange("");
        onEndTimeChange("");
      } else {
        // Set new start
        onStartTimeChange(slot.startTime);
        onEndTimeChange("");
      }
      return;
    }

    // If start is selected, clicking another slot
    const clickedEndMinutes = slot.minutes + interval;

    if (slot.minutes < selectedStartMinutes) {
      // Clicked BEFORE current start - set this as new start
      onStartTimeChange(slot.startTime);
      onEndTimeChange("");
    } else {
      // Clicked AFTER current start - set as end time
      onEndTimeChange(minutesToTime(clickedEndMinutes));
    }
  };

  // Calculate duration
  const duration = selectedStartTime && selectedEndTime
    ? timeToMinutes(selectedEndTime) - timeToMinutes(selectedStartTime)
    : 0;
  const isValidDuration = duration >= 60;

  // Reset selection
  const handleReset = () => {
    onStartTimeChange("");
    onEndTimeChange("");
  };

  // Quick duration select
  const handleQuickDuration = (mins) => {
    if (!selectedStartTime) return;
    const endMinutes = selectedStartMinutes + mins;
    const closeMinutes = timeToMinutes(closeTime || "22:00");
    if (endMinutes <= closeMinutes) {
      onEndTimeChange(minutesToTime(endMinutes));
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-gray-200 shadow-lg overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="size-10 rounded-xl bg-white/20 flex items-center justify-center">
              <span className="material-symbols-outlined text-white text-2xl">calendar_month</span>
            </div>
            <div>
              <h3 className="text-lg font-black text-white">Chọn giờ đặt sân</h3>
              <p className="text-blue-100 text-sm">Click vào ô xanh để chọn</p>
            </div>
          </div>

          {/* View Mode Toggle */}
          <div className="flex items-center bg-white/20 rounded-lg p-1">
            <button
              onClick={() => setViewMode("30min")}
              className={`px-3 py-1.5 text-xs font-bold rounded-md transition-all ${viewMode === "30min" ? "bg-white text-blue-600 shadow" : "text-white/80 hover:text-white"
                }`}
            >
              30 phút
            </button>
            <button
              onClick={() => setViewMode("1hour")}
              className={`px-3 py-1.5 text-xs font-bold rounded-md transition-all ${viewMode === "1hour" ? "bg-white text-blue-600 shadow" : "text-white/80 hover:text-white"
                }`}
            >
              1 giờ
            </button>
          </div>
        </div>
      </div>

      {/* Selection Info Bar - FIXED HEIGHT, always visible */}
      <div className="px-6 py-3 bg-gradient-to-r from-blue-50 to-indigo-50 border-b border-blue-100 h-14 flex items-center">
        <div className="flex items-center justify-between w-full">
          <div className="flex items-center gap-3 text-sm">
            <span className="font-bold text-gray-600">Giờ chọn:</span>
            {/* Start time */}
            <div className="w-16 text-center">
              {selectedStartTime ? (
                <span className="px-3 py-1 bg-blue-600 text-white rounded-lg font-bold text-sm">
                  {selectedStartTime}
                </span>
              ) : (
                <span className="px-3 py-1 bg-gray-200 text-gray-400 rounded-lg font-bold text-sm">--:--</span>
              )}
            </div>

            <span className="text-gray-400">→</span>

            {/* End time */}
            <div className="w-16 text-center">
              {selectedEndTime ? (
                <span className="px-3 py-1 bg-green-600 text-white rounded-lg font-bold text-sm">
                  {selectedEndTime}
                </span>
              ) : (
                <span className="px-3 py-1 bg-gray-200 text-gray-400 rounded-lg font-bold text-sm">--:--</span>
              )}
            </div>

            {/* Duration badge - fixed width */}
            <div className="w-20 text-center">
              {duration > 0 ? (
                <span className={`px-2 py-1 rounded text-xs font-bold ${isValidDuration ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
                  }`}>
                  {duration} phút
                </span>
              ) : (
                <span className="text-xs text-gray-400">-</span>
              )}
            </div>

            {/* Quick duration buttons - shown inline when selecting */}
            {selectedStartTime && !selectedEndTime && (
              <div className="flex items-center gap-1 ml-2">
                <span className="text-xs text-amber-700 font-bold">⚡</span>
                {[60, 90, 120, 180].map((mins) => {
                  const endMinutes = selectedStartMinutes + mins;
                  const closeMinutes = timeToMinutes(closeTime || "22:00");
                  if (endMinutes > closeMinutes) return null;
                  return (
                    <button
                      key={mins}
                      onClick={() => handleQuickDuration(mins)}
                      className="px-2 py-0.5 bg-amber-500 text-white rounded text-xs font-bold hover:bg-amber-600"
                    >
                      {mins / 60}h
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* Reset button - always visible but disabled when nothing selected */}
          <button
            onClick={handleReset}
            disabled={!selectedStartTime && !selectedEndTime}
            className={`flex items-center gap-1 px-3 py-1.5 text-xs font-bold rounded-lg transition-colors ${selectedStartTime || selectedEndTime
              ? "text-red-600 hover:bg-red-50"
              : "text-gray-300 cursor-not-allowed"
              }`}
          >
            <span className="material-symbols-outlined text-base">close</span>
            Xóa
          </button>
        </div>
      </div>

      {/* Legend */}
      <div className="px-6 py-2 border-b border-gray-100 flex items-center justify-between text-xs">
        <div className="flex gap-4 font-bold">
          <div className="flex items-center gap-1.5">
            <div className="w-4 h-4 bg-green-500 rounded"></div>
            <span className="text-gray-600">Trống</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-4 h-4 bg-red-400 rounded"></div>
            <span className="text-gray-600">Đã đặt</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-4 h-4 bg-blue-600 rounded"></div>
            <span className="text-gray-600">Đang chọn</span>
          </div>
        </div>
        <span className="text-gray-500">
          Trống: <b className="text-green-600">{availableTime}h</b> | Đã đặt: <b className="text-red-500">{bookedTime}h</b>
        </span>
      </div>

      {/* Timeline Grid - NO ANIMATIONS, FIXED HEIGHTS */}
      <div className="p-4 space-y-1 max-h-[400px] overflow-y-auto">
        {hours.map((hour) => {
          const slots = hourlyGroups[hour];
          return (
            <div key={hour} className="flex items-center gap-2">
              <div className="w-12 text-right text-xs font-bold text-gray-600">
                {hour.toString().padStart(2, "0")}:00
              </div>
              <div className="flex-1 flex gap-1">
                {slots.map((slot, idx) => {
                  const isInRange = isSlotInRange(slot);
                  const isStart = isSlotStart(slot);
                  const isEnd = isSlotEnd(slot);
                  const isPast = isPastSlot(slot);
                  const isInactive = courtStatus !== "ACTIVE";
                  const isDisabled = !slot.available || isPast || isInactive;

                  // Determine slot style - NO SCALE, NO RING, JUST COLORS
                  let slotClass = "h-10 rounded-lg border-2 flex items-center justify-center text-xs font-bold ";

                  if (isInactive) {
                    // Inactive court - dark gray / locked
                    slotClass += "bg-slate-100 border-slate-200 text-slate-400 cursor-not-allowed striped-bg";
                  } else if (isPast) {
                    // Past slots - gray out
                    slotClass += "bg-gray-100 border-gray-200 text-gray-400 cursor-not-allowed line-through opacity-60";
                  } else if (isStart) {
                    slotClass += "bg-blue-600 border-blue-600 text-white";
                  } else if (isEnd && !isStart) {
                    slotClass += "bg-green-600 border-green-600 text-white";
                  } else if (isInRange) {
                    slotClass += "bg-blue-200 border-blue-300 text-blue-800";
                  } else if (slot.available) {
                    slotClass += "bg-green-50 border-green-300 text-green-700 hover:bg-green-100 cursor-pointer";
                  } else {
                    slotClass += "bg-red-50 border-red-200 text-red-400 cursor-not-allowed opacity-50";
                  }

                  return (
                    <button
                      key={idx}
                      onClick={() => handleSlotClick(slot)}
                      disabled={isDisabled}
                      className={`flex-1 ${slotClass}`}
                      title={isInactive ? "Sân tạm ngưng hoạt động" : (isPast ? `${slot.startTime} - Đã qua` : `${slot.startTime} - ${slot.endTime}`)}
                    >
                      {slot.startTime}
                    </button>
                  );
                })}
              </div>
              <div className="w-12 text-xs text-gray-400">
                {(hour + 1).toString().padStart(2, "0")}:00
              </div>
            </div>
          );
        })}
      </div>

      {/* Booking Controls - Restored Check/Price only */}
      {selectedStartTime && selectedEndTime && (
        <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 space-y-3">
          {/* Duration Warning */}
          {!isValidDuration && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700 font-bold flex items-center gap-2">
              <span className="material-symbols-outlined">warning</span>
              Tối thiểu 1 giờ (60 phút)
            </div>
          )}

          {/* Check Availability Button */}
          <button
            onClick={onCheckAvailability}
            disabled={!isValidDuration || checkingAvailability}
            className={`w-full py-3 rounded-xl font-bold flex items-center justify-center gap-2 transition-all ${isValidDuration && !checkingAvailability
              ? "bg-blue-600 text-white hover:bg-blue-700 shadow-md hover:shadow-lg"
              : "bg-gray-200 text-gray-400 cursor-not-allowed"
              }`}
          >
            {checkingAvailability ? (
              <span className="animate-spin material-symbols-outlined">progress_activity</span>
            ) : (
              <span className="material-symbols-outlined">search</span>
            )}
            {checkingAvailability ? "Đang kiểm tra..." : "Kiểm tra & Tính giá"}
          </button>

          {/* Availability Result */}
          {availabilityResult && (
            <div className={`p-3 rounded-xl border flex items-center justify-between ${availabilityResult.available ? "bg-green-50 border-green-300" : "bg-red-50 border-red-300"
              }`}>
              <div className="flex items-center gap-2">
                <span className={`material-symbols-outlined ${availabilityResult.available ? "text-green-600" : "text-red-600"
                  }`}>
                  {availabilityResult.available ? "check_circle" : "cancel"}
                </span>
                <span className={`font-bold ${availabilityResult.available ? "text-green-700" : "text-red-700"
                  }`}>
                  {availabilityResult.available ? "Còn trống!" : (availabilityResult.message || "Đã có người đặt")}
                </span>
              </div>

              {/* Price Result - Inline if valid */}
              {availabilityResult.available && priceResult && (
                <div className="text-right">
                  <span className="block text-xs font-bold text-gray-500">Tổng tiền</span>
                  <span className="text-xl font-black text-green-700">
                    {(priceResult.totalPrice || 0).toLocaleString("vi-VN")}đ
                  </span>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Help text */}
      <div className="px-6 py-3 bg-blue-50 border-t border-blue-100 text-xs text-blue-700">
        💡 Click ô xanh để chọn giờ bắt đầu, click tiếp để chọn giờ kết thúc. Click lại ô bắt đầu để hủy chọn.
      </div>
    </div>
  );
};

export default CourtAvailability;
