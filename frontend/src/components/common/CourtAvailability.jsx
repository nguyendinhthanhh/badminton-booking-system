import { useState } from "react";

const CourtAvailability = ({ availableSlots, openTime, closeTime }) => {
  const [viewMode, setViewMode] = useState("30min"); // '30min' or '1hour'

  // Parse time string to minutes
  const timeToMinutes = (timeStr) => {
    const [hours, minutes] = timeStr.split(":").map(Number);
    return hours * 60 + minutes;
  };

  // Convert minutes to time string
  const minutesToTime = (minutes) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours.toString().padStart(2, "0")}:${mins.toString().padStart(2, "0")}`;
  };

  // Generate slots based on interval (30 or 60 minutes)
  const generateSlots = (interval) => {
    const slots = [];
    const startMinutes = timeToMinutes(openTime || "06:00");
    const endMinutes = timeToMinutes(closeTime || "22:00");

    for (
      let minutes = startMinutes;
      minutes < endMinutes;
      minutes += interval
    ) {
      const startTime = minutesToTime(minutes);
      const endTime = minutesToTime(minutes + interval);

      // Check if this slot is available
      const isAvailable = availableSlots.some((slot) => {
        const slotStart = timeToMinutes(slot.startTime);
        const slotEnd = timeToMinutes(slot.endTime);
        const currentStart = minutes;
        const currentEnd = minutes + interval;

        // Slot is available if it fully contains this time block
        return slotStart <= currentStart && slotEnd >= currentEnd;
      });

      // Check if this slot is partially booked (for visual indication)
      const isPartiallyBooked =
        !isAvailable &&
        availableSlots.some((slot) => {
          const slotStart = timeToMinutes(slot.startTime);
          const slotEnd = timeToMinutes(slot.endTime);
          const currentStart = minutes;
          const currentEnd = minutes + interval;

          // Check if slot overlaps but doesn't fully contain
          return slotStart < currentEnd && slotEnd > currentStart;
        });

      slots.push({
        startTime,
        endTime,
        available: isAvailable,
        partiallyAvailable: isPartiallyBooked,
        minutes,
      });
    }

    return slots;
  };

  const interval = viewMode === "30min" ? 30 : 60;
  const timeSlots = generateSlots(interval);

  // Group slots by hour for better visualization
  const groupSlotsByHour = () => {
    const grouped = {};
    timeSlots.forEach((slot) => {
      const hour = Math.floor(slot.minutes / 60);
      if (!grouped[hour]) {
        grouped[hour] = [];
      }
      grouped[hour].push(slot);
    });
    return grouped;
  };

  const hourlyGroups = groupSlotsByHour();
  const hours = Object.keys(hourlyGroups)
    .map(Number)
    .sort((a, b) => a - b);

  // Calculate stats
  const availableCount = timeSlots.filter((s) => s.available).length;
  const bookedCount = timeSlots.filter((s) => !s.available).length;
  const availableTime = (availableCount * interval) / 60;
  const bookedTime = (bookedCount * interval) / 60;

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6">
      {/* Header with view mode toggle */}
      <div className="flex items-center justify-between mb-5">
        <h3 className="text-base font-black text-gray-900">
          📅 Tình trạng sân theo giờ
        </h3>
        <div className="flex items-center gap-4">
          {/* View Mode Toggle */}
          <div className="flex items-center bg-gray-100 rounded-lg p-1">
            <button
              onClick={() => setViewMode("30min")}
              className={`px-3 py-1.5 text-xs font-bold rounded-md transition-all ${
                viewMode === "30min"
                  ? "bg-white text-blue-600 shadow-sm"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              30 phút
            </button>
            <button
              onClick={() => setViewMode("1hour")}
              className={`px-3 py-1.5 text-xs font-bold rounded-md transition-all ${
                viewMode === "1hour"
                  ? "bg-white text-blue-600 shadow-sm"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              1 giờ
            </button>
          </div>

          {/* Legend */}
          <div className="flex gap-3 text-xs font-bold">
            <div className="flex items-center gap-1.5">
              <div className="size-3 bg-green-500 rounded"></div>
              <span className="text-gray-600">Trống</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="size-3 bg-red-400 rounded"></div>
              <span className="text-gray-600">Đã đặt</span>
            </div>
          </div>
        </div>
      </div>

      {/* Timeline View - More precise visualization */}
      <div className="space-y-2">
        {hours.map((hour) => {
          const slots = hourlyGroups[hour];
          return (
            <div key={hour} className="flex items-center gap-2">
              {/* Hour label */}
              <div className="w-14 text-right">
                <span className="text-sm font-bold text-gray-700">
                  {hour.toString().padStart(2, "0")}:00
                </span>
              </div>

              {/* Slots for this hour */}
              <div className="flex-1 flex gap-1">
                {slots.map((slot, idx) => (
                  <div
                    key={idx}
                    className={`relative flex-1 h-12 rounded-lg border-2 flex items-center justify-center transition-all cursor-default group ${
                      slot.available
                        ? "bg-green-50 border-green-400 hover:bg-green-100 hover:border-green-500"
                        : "bg-red-50 border-red-300"
                    }`}
                    title={`${slot.startTime} - ${slot.endTime}: ${slot.available ? "Còn trống" : "Đã đặt"}`}
                  >
                    {/* Time display */}
                    <div className="text-center">
                      <div
                        className={`text-xs font-bold ${slot.available ? "text-green-700" : "text-red-600"}`}
                      >
                        {slot.startTime}
                      </div>
                      {viewMode === "30min" && (
                        <div
                          className={`text-[9px] ${slot.available ? "text-green-600" : "text-red-500"}`}
                        >
                          -{slot.endTime}
                        </div>
                      )}
                    </div>

                    {/* Status indicator */}
                    <div
                      className={`absolute -top-1 -right-1 size-4 rounded-full flex items-center justify-center shadow-sm ${
                        slot.available ? "bg-green-500" : "bg-red-400"
                      }`}
                    >
                      <span className="text-white text-[8px]">
                        {slot.available ? "✓" : "✗"}
                      </span>
                    </div>

                    {/* Tooltip on hover */}
                    <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 bg-gray-900 text-white text-[10px] font-bold rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10 pointer-events-none">
                      {slot.startTime} - {slot.endTime}
                      <br />
                      {slot.available ? "🟢 Có thể đặt" : "🔴 Đã có người đặt"}
                    </div>
                  </div>
                ))}
              </div>

              {/* End time for the hour */}
              <div className="w-14">
                <span className="text-xs font-medium text-gray-400">
                  {(hour + 1).toString().padStart(2, "0")}:00
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Summary */}
      <div className="mt-5 pt-5 border-t border-gray-200">
        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-green-600 text-xl">
              check_circle
            </span>
            <span className="font-bold text-gray-700">
              Còn trống:{" "}
              <span className="text-green-600">{availableTime} giờ</span>
              <span className="text-gray-400 text-xs ml-1">
                ({availableCount} slot)
              </span>
            </span>
          </div>
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-red-500 text-xl">
              cancel
            </span>
            <span className="font-bold text-gray-700">
              Đã đặt: <span className="text-red-500">{bookedTime} giờ</span>
              <span className="text-gray-400 text-xs ml-1">
                ({bookedCount} slot)
              </span>
            </span>
          </div>
        </div>
      </div>

      {/* Helper text */}
      <div className="mt-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
        <div className="flex items-start gap-2">
          <span className="material-symbols-outlined text-blue-600 text-lg">
            info
          </span>
          <p className="text-xs font-bold text-blue-800 leading-relaxed">
            💡 <span className="text-blue-900">Chế độ 30 phút</span> hiển thị
            chi tiết hơn để bạn thấy rõ các khung giờ như 16:00-17:30. Các ô màu{" "}
            <span className="text-green-600">xanh</span> có thể đặt.
          </p>
        </div>
      </div>
    </div>
  );
};

export default CourtAvailability;
