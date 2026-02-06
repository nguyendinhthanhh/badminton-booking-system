const PriceTable = ({ prices, dayType, compact = false }) => {
  if (!prices || prices.length === 0) {
    return (
      <div
        className={`bg-white rounded-xl border border-gray-200 ${compact ? "p-3" : "p-4"} text-center`}
      >
        <span className="material-symbols-outlined text-gray-300 text-3xl">
          receipt_long
        </span>
        <p className="text-gray-500 font-bold text-sm mt-2">Chưa có bảng giá</p>
      </div>
    );
  }

  // Find min and max price
  const minPrice = Math.min(...prices.map((p) => p.pricePerHour));
  const maxPrice = Math.max(...prices.map((p) => p.pricePerHour));

  // Group prices into rows (4 slots per row for normal, 2 for compact)
  const itemsPerRow = compact ? 2 : 4;
  const groupedPrices = [];
  for (let i = 0; i < prices.length; i += itemsPerRow) {
    groupedPrices.push(prices.slice(i, i + itemsPerRow));
  }

  // Compact mode - show only summary with key time slots
  if (compact) {
    // Group by time periods
    const morningPrices = prices.filter((p) => parseInt(p.startTime) < 12);
    const afternoonPrices = prices.filter(
      (p) => parseInt(p.startTime) >= 12 && parseInt(p.startTime) < 18,
    );
    const eveningPrices = prices.filter((p) => parseInt(p.startTime) >= 18);

    const getAvgPrice = (arr) =>
      arr.length > 0
        ? Math.round(
            arr.reduce((sum, p) => sum + p.pricePerHour, 0) / arr.length,
          )
        : 0;

    const periods = [
      {
        name: "Sáng",
        icon: "☀️",
        time: "06:00 - 12:00",
        prices: morningPrices,
        avg: getAvgPrice(morningPrices),
      },
      {
        name: "Chiều",
        icon: "🌤️",
        time: "12:00 - 18:00",
        prices: afternoonPrices,
        avg: getAvgPrice(afternoonPrices),
      },
      {
        name: "Tối",
        icon: "🌙",
        time: "18:00 - 22:00",
        prices: eveningPrices,
        avg: getAvgPrice(eveningPrices),
      },
    ].filter((p) => p.prices.length > 0);

    return (
      <div className="space-y-2">
        {periods.map((period, idx) => {
          const availableCount = period.prices.filter(
            (p) => p.status !== "BOOKED",
          ).length;
          return (
            <div
              key={idx}
              className="flex items-center justify-between p-3 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors"
            >
              <div className="flex items-center gap-3">
                <span className="text-lg">{period.icon}</span>
                <div>
                  <p className="text-xs font-black text-gray-900">
                    {period.name}
                  </p>
                  <p className="text-[10px] text-gray-400">{period.time}</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-sm font-black text-blue-600">
                  {period.avg.toLocaleString()}đ
                </p>
                <p className="text-[10px] text-gray-400">
                  <span className="text-green-600 font-bold">
                    {availableCount}
                  </span>
                  /{period.prices.length} trống
                </p>
              </div>
            </div>
          );
        })}

        {/* Price Range Summary */}
        <div className="mt-3 pt-3 border-t border-gray-100">
          <div className="flex items-center justify-between">
            <span className="text-xs text-gray-500">Khoảng giá:</span>
            <span className="text-xs font-black text-gray-900">
              {minPrice.toLocaleString()}đ - {maxPrice.toLocaleString()}đ
            </span>
          </div>
        </div>
      </div>
    );
  }

  // Normal mode - full grid display
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6">
      <div className="flex items-center justify-between mb-5">
        <h3 className="text-base font-black text-gray-900">
          💰 Bảng giá hôm nay
        </h3>
        <div className="flex gap-3 text-xs font-bold">
          <div className="flex items-center gap-1.5">
            <div className="size-3 bg-blue-500 rounded"></div>
            <span className="text-gray-600">
              {dayType === "WEEKEND" ? "Cuối tuần" : "Ngày thường"}
            </span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="text-gray-600">
              Từ {minPrice.toLocaleString()}đ
            </span>
          </div>
        </div>
      </div>

      {/* Price slots grid */}
      <div className="space-y-3">
        {groupedPrices.map((row, rowIdx) => (
          <div key={rowIdx} className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {row.map((price, idx) => {
              const isBooked = price.status === "BOOKED";
              const hour = parseInt(price.startTime.split(":")[0]);
              const period = hour < 12 ? "☀️" : hour < 18 ? "🌤️" : "🌙";

              return (
                <div
                  key={idx}
                  className={`relative h-16 rounded-lg border-2 flex flex-col items-center justify-center transition-all ${
                    isBooked
                      ? "bg-red-50 border-red-300 opacity-75"
                      : "bg-blue-50 border-blue-500 hover:bg-blue-100"
                  }`}
                >
                  {/* Time display */}
                  <div className="text-center">
                    <div className="text-sm font-black text-gray-900">
                      {price.startTime.substring(0, 5)}
                    </div>
                    <div className="text-[10px] font-bold text-gray-500">
                      đến {price.endTime.substring(0, 5)}
                    </div>
                  </div>

                  {/* Price badge */}
                  {isBooked ? (
                    <div className="absolute top-1 right-1 px-1.5 py-0.5 rounded text-[9px] font-bold bg-red-400 text-white">
                      ĐẶT
                    </div>
                  ) : (
                    <div className="absolute top-1 right-1 px-1.5 py-0.5 rounded text-[9px] font-bold bg-blue-500 text-white">
                      {price.pricePerHour.toLocaleString()}đ
                    </div>
                  )}

                  {/* Period icon */}
                  <div className="absolute bottom-1 left-1 text-xs">
                    {period}
                  </div>
                </div>
              );
            })}
          </div>
        ))}
      </div>

      {/* Summary */}
      <div className="mt-5 pt-5 border-t border-gray-200">
        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-blue-600 text-xl">
              payments
            </span>
            <span className="font-bold text-gray-700">
              Giá từ:{" "}
              <span className="text-blue-600">
                {minPrice.toLocaleString()}đ
              </span>{" "}
              -{" "}
              <span className="text-blue-600">
                {maxPrice.toLocaleString()}đ
              </span>
              /giờ
            </span>
          </div>
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-green-600 text-xl">
              check_circle
            </span>
            <span className="font-bold text-gray-700">
              <span className="text-green-600">
                {prices.filter((p) => p.status !== "BOOKED").length}
              </span>
              /{prices.length} khung còn trống
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
            Bạn có thể đặt sân linh hoạt không bắt buộc theo khung giờ này. Chọn
            giờ bắt đầu và kết thúc tùy ý bên dưới.
          </p>
        </div>
      </div>
    </div>
  );
};

export default PriceTable;
