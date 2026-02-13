import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import PageHeader from "../../components/common/PageHeader";
import StatCard from "../../components/common/StatCard";
import adminReportService from "../../services/adminReportService";

const REPORT_TYPES = [
  { value: "overview", label: "Tổng quan" },
  { value: "revenue", label: "Doanh thu" },
  { value: "bookings", label: "Đặt sân" },
  { value: "occupancy", label: "Công suất" },
];

const DATE_PRESETS = [
  { value: "today", label: "Hôm nay" },
  { value: "7d", label: "7 ngày" },
  { value: "30d", label: "30 ngày" },
  { value: "thisMonth", label: "Tháng này" },
];

const SCALE_MODES = [
  { value: "absolute", label: "Giá trị" },
  { value: "normalized", label: "% so với đỉnh" },
  { value: "log", label: "Log scale" },
];

const getQuantile = (sortedValues, quantile) => {
  if (!sortedValues.length) return 0;
  const pos = (sortedValues.length - 1) * quantile;
  const base = Math.floor(pos);
  const rest = pos - base;
  if (sortedValues[base + 1] !== undefined) {
    return (
      sortedValues[base] + rest * (sortedValues[base + 1] - sortedValues[base])
    );
  }
  return sortedValues[base];
};

const Dashboard = () => {
  const [reportType, setReportType] = useState("overview");
  const [preset, setPreset] = useState("7d");
  const [scaleMode, setScaleMode] = useState("absolute");
  const [hoveredIndex, setHoveredIndex] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [report, setReport] = useState(null);

  const formatDate = (date) => {
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, "0");
    const d = String(date.getDate()).padStart(2, "0");
    return `${y}-${m}-${d}`;
  };

  const selectedRange = useMemo(() => {
    const now = new Date();
    const end = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    let start = new Date(end);

    if (preset === "today") start = new Date(end);
    else if (preset === "7d") start.setDate(end.getDate() - 6);
    else if (preset === "30d") start.setDate(end.getDate() - 29);
    else if (preset === "thisMonth")
      start = new Date(end.getFullYear(), end.getMonth(), 1);

    return { fromDate: formatDate(start), toDate: formatDate(end) };
  }, [preset]);

  useEffect(() => {
    const fetchReport = async () => {
      setLoading(true);
      setError("");
      try {
        const data = await adminReportService.getDashboardReport({
          reportType,
          ...selectedRange,
        });
        setReport(data);
      } catch (err) {
        console.error("Error fetching dashboard report:", err);
        setError("Không tải được dữ liệu báo cáo.");
      } finally {
        setLoading(false);
      }
    };

    fetchReport();
  }, [reportType, selectedRange]);

  const formatCurrency = (value) =>
    new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
      maximumFractionDigits: 0,
    }).format(Number(value || 0));

  const stats = useMemo(() => {
    if (!report?.summary) return [];
    return [
      {
        title: "Doanh thu",
        value: formatCurrency(report.summary.totalRevenue),
        change: report.summary.revenueChange,
        trend: report.summary.revenueChange?.startsWith("-") ? "down" : "up",
        icon: "payments",
        iconBg: "bg-green-50",
        iconColor: "text-green-600",
      },
      {
        title: "Lượt đặt sân",
        value: String(report.summary.totalBookings ?? 0),
        change: report.summary.bookingChange,
        trend: report.summary.bookingChange?.startsWith("-") ? "down" : "up",
        icon: "event",
        iconBg: "bg-blue-50",
        iconColor: "text-blue-600",
      },
      {
        title: "Khách hàng hoạt động",
        value: String(report.summary.activeCustomers ?? 0),
        change: report.summary.customerChange,
        trend: report.summary.customerChange?.startsWith("-") ? "down" : "up",
        icon: "person_add",
        iconBg: "bg-purple-50",
        iconColor: "text-purple-600",
      },
      {
        title: "Tỷ lệ phủ sân",
        value: `${Number(report.summary.occupancyRate || 0).toFixed(1)}%`,
        change: report.summary.occupancyChange,
        trend: report.summary.occupancyChange?.startsWith("-") ? "down" : "up",
        icon: "analytics",
        iconBg: "bg-orange-50",
        iconColor: "text-orange-600",
      },
    ];
  }, [report]);

  const rawSeries = useMemo(() => report?.revenueSeries || [], [report]);

  const maxRawRevenue = useMemo(() => {
    if (!rawSeries.length) return 0;
    return Math.max(...rawSeries.map((point) => Number(point.revenue || 0)), 0);
  }, [rawSeries]);

  const chartData = useMemo(() => {
    const maxSafe = Math.max(maxRawRevenue, 1);

    return rawSeries.map((point, index) => {
      const revenue = Number(point.revenue || 0);
      const previousRevenue =
        index > 0 ? Number(rawSeries[index - 1].revenue || 0) : null;
      const trendPercent =
        previousRevenue && previousRevenue > 0
          ? ((revenue - previousRevenue) / previousRevenue) * 100
          : null;
      const movingStart = Math.max(0, index - 6);
      const movingSlice = rawSeries.slice(movingStart, index + 1);
      const movingAverageRaw =
        movingSlice.reduce((sum, item) => sum + Number(item.revenue || 0), 0) /
        movingSlice.length;

      const normalizedRevenue = (revenue / maxSafe) * 100;
      const normalizedMovingAverage = (movingAverageRaw / maxSafe) * 100;
      const logRevenue = Math.log10(revenue + 1);
      const logMovingAverage = Math.log10(movingAverageRaw + 1);

      return {
        ...point,
        revenue,
        bookings: Number(
          point.bookings ?? point.totalBookings ?? point.bookingCount ?? 0
        ),
        trendPercent,
        movingAverageRaw,
        displayRevenue:
          scaleMode === "normalized"
            ? normalizedRevenue
            : scaleMode === "log"
            ? logRevenue
            : revenue,
        displayMovingAverage:
          scaleMode === "normalized"
            ? normalizedMovingAverage
            : scaleMode === "log"
            ? logMovingAverage
            : movingAverageRaw,
      };
    });
  }, [rawSeries, maxRawRevenue, scaleMode]);

  const maxDisplayValue = useMemo(() => {
    if (scaleMode === "normalized") return 100;
    if (!chartData.length) return 1;

    return Math.max(
      ...chartData.map((point) =>
        Math.max(point.displayRevenue, point.displayMovingAverage)
      ),
      1
    );
  }, [chartData, scaleMode]);

  const hasChartData = chartData.length > 0;

  const yTicks = useMemo(() => {
    const maxValue = Math.max(maxDisplayValue, 1);
    return [1, 0.75, 0.5, 0.25, 0].map((ratio) => maxValue * ratio);
  }, [maxDisplayValue]);

  const formatYAxisValue = (value) => {
    if (scaleMode === "normalized") return `${Math.round(value)}%`;
    if (scaleMode === "log") return formatCurrency(Math.pow(10, value) - 1);
    return formatCurrency(value);
  };

  const revenueThresholds = useMemo(() => {
    const sorted = chartData
      .map((point) => point.revenue)
      .filter((value) => value > 0)
      .sort((a, b) => a - b);

    return {
      low: getQuantile(sorted, 0.33),
      high: getQuantile(sorted, 0.66),
    };
  }, [chartData]);

  const getBarClass = (value) => {
    if (value <= 0) return "bg-slate-200 hover:bg-slate-300";
    if (value <= revenueThresholds.low) return "bg-blue-200 hover:bg-blue-300";
    if (value <= revenueThresholds.high) return "bg-blue-400 hover:bg-blue-500";
    return "bg-blue-600 hover:bg-blue-700";
  };

  const chartLinePoints = useMemo(() => {
    if (!chartData.length) return "";

    return chartData
      .map((point, index) => {
        const x = ((index + 0.5) / chartData.length) * 100;
        const y =
          100 -
          (point.displayMovingAverage / Math.max(maxDisplayValue, 1)) * 100;
        return `${x},${y}`;
      })
      .join(" ");
  }, [chartData, maxDisplayValue]);

  const highestPoint = useMemo(() => {
    if (!chartData.length) return null;
    return chartData.reduce(
      (acc, current) => (current.revenue > acc.revenue ? current : acc),
      chartData[0]
    );
  }, [chartData]);

  const lowestPoint = useMemo(() => {
    if (!chartData.length) return null;
    return chartData.reduce(
      (acc, current) => (current.revenue < acc.revenue ? current : acc),
      chartData[0]
    );
  }, [chartData]);

  const topCourts = report?.topCourts || [];
  const recentBookings = report?.recentBookings || [];

  const statusLabel = (status) => {
    const map = {
      PAID: "Đã thanh toán",
      UNPAID: "Chưa thanh toán",
      PENDING: "Chờ xác nhận",
      CONFIRMED: "Đã xác nhận",
      PLAYING: "Đang chơi",
      COMPLETED: "Hoàn thành",
      CANCELLED: "Đã hủy",
      CANCELLATION_REQUESTED: "Chờ duyệt hủy",
    };
    return map[status] || status || "N/A";
  };

  const statusClass = (status) => {
    if (status === "PAID" || status === "COMPLETED")
      return "bg-green-50 text-green-700 border-green-200";
    if (
      status === "PENDING" ||
      status === "UNPAID" ||
      status === "CANCELLATION_REQUESTED"
    ) {
      return "bg-amber-50 text-amber-700 border-amber-200";
    }
    if (status === "CANCELLED") return "bg-red-50 text-red-700 border-red-200";
    return "bg-blue-50 text-blue-700 border-blue-200";
  };

  const dateRangeText = `${report?.fromDate || selectedRange.fromDate} - ${
    report?.toDate || selectedRange.toDate
  }`;
  const hoveredPoint = hoveredIndex !== null ? chartData[hoveredIndex] : null;

  const hoverCardClass =
    hoveredPoint?.trendPercent == null
      ? "text-slate-500"
      : hoveredPoint.trendPercent >= 0
      ? "text-green-600"
      : "text-red-600";

  return (
    <div className="p-6">
      <div className="max-w-[1400px] mx-auto">
        <PageHeader
          title="Dashboard"
          subtitle="Thống kê và báo cáo vận hành theo thời gian thực"
          actions={
            <>
              <select
                value={reportType}
                onChange={(e) => setReportType(e.target.value)}
                className="px-4 py-2 bg-white border border-gray-300 rounded-lg text-sm font-semibold text-gray-800 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-200"
              >
                {REPORT_TYPES.map((type) => (
                  <option key={type.value} value={type.value}>
                    {type.label}
                  </option>
                ))}
              </select>
              <select
                value={preset}
                onChange={(e) => setPreset(e.target.value)}
                className="px-4 py-2 bg-white border border-gray-300 rounded-lg text-sm font-semibold text-gray-800 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-200"
              >
                {DATE_PRESETS.map((item) => (
                  <option key={item.value} value={item.value}>
                    {item.label}
                  </option>
                ))}
              </select>
              <div className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg shadow-sm text-gray-800 min-w-[260px]">
                <span className="material-symbols-outlined text-lg text-blue-600">
                  calendar_today
                </span>
                <span className="text-sm font-semibold whitespace-nowrap">
                  {dateRangeText}
                </span>
              </div>
            </>
          }
        />

        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 rounded-xl p-4 text-sm text-red-700">
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
          {(loading ? Array.from({ length: 4 }) : stats).map((stat, index) => (
            <div key={index}>
              {loading ? (
                <div className="bg-white rounded-xl border border-gray-200 p-6 h-[152px] animate-pulse" />
              ) : (
                <StatCard {...stat} />
              )}
            </div>
          ))}
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-6">
            <div>
              <h3 className="text-lg font-bold text-gray-900">
                Biểu đồ doanh thu
              </h3>
              <div className="flex flex-wrap items-center gap-2 mt-2 text-xs">
                <span className="px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-100 font-semibold">
                  Đỉnh: {highestPoint?.date?.slice(5) || "--"} (
                  {formatCurrency(highestPoint?.revenue || 0)})
                </span>
                <span className="px-2.5 py-1 rounded-full bg-amber-50 text-amber-700 border border-amber-100 font-semibold">
                  Thấp nhất: {lowestPoint?.date?.slice(5) || "--"} (
                  {formatCurrency(lowestPoint?.revenue || 0)})
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-sm text-gray-500">
                {rawSeries.length || 0} mốc dữ liệu
              </span>
              <div className="flex items-center gap-1 bg-gray-100 p-1 rounded-lg">
                {SCALE_MODES.map((mode) => (
                  <button
                    key={mode.value}
                    type="button"
                    onClick={() => setScaleMode(mode.value)}
                    className={`px-2.5 py-1.5 rounded-md text-xs font-semibold transition-colors ${
                      scaleMode === mode.value
                        ? "bg-white text-blue-700 shadow-sm"
                        : "text-gray-600 hover:text-gray-800"
                    }`}
                  >
                    {mode.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {!hasChartData ? (
            <div className="h-72 rounded-xl border border-dashed border-gray-300 bg-gray-50 flex items-center justify-center">
              <div className="text-center px-4">
                <span className="material-symbols-outlined text-4xl text-gray-400">
                  bar_chart_off
                </span>
                <p className="text-sm font-semibold text-gray-700 mt-2">
                  Chưa có dữ liệu doanh thu trong khoảng đã chọn
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  Thử đổi bộ lọc thời gian hoặc loại báo cáo để xem dữ liệu
                  khác.
                </p>
              </div>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-[96px_1fr] gap-3">
                <div className="h-72 flex flex-col justify-between text-xs text-gray-500 text-right pr-2 pl-1 overflow-visible">
                  {yTicks.map((tick, index) => (
                    <span
                      key={index}
                      className="whitespace-nowrap tabular-nums"
                    >
                      {formatYAxisValue(tick)}
                    </span>
                  ))}
                </div>

                <div className="relative h-72 rounded-xl border border-gray-200 bg-gray-50/60 p-3 pb-10 pr-4">
                  <div className="absolute inset-x-3 top-3 bottom-10">
                    {[0, 1, 2, 3, 4].map((line) => (
                      <div
                        key={line}
                        className="absolute left-0 right-0 border-t border-dashed border-gray-200"
                        style={{ top: `${line * 25}%` }}
                      />
                    ))}
                  </div>

                  <div className="absolute inset-x-3 top-3 bottom-10 flex items-end gap-2">
                    {chartData.map((point, index) => {
                      const safeMax = Math.max(maxDisplayValue, 1);
                      const barHeight = (point.displayRevenue / safeMax) * 100;

                      return (
                        <div
                          key={`${point.date}-${index}`}
                          className="group relative flex-1 h-full flex items-end"
                          onMouseEnter={() => setHoveredIndex(index)}
                          onMouseLeave={() => setHoveredIndex(null)}
                        >
                          <div
                            className={`w-full rounded-t-md transition-all duration-200 cursor-pointer ${getBarClass(
                              point.revenue
                            )}`}
                            style={{ height: `${Math.max(barHeight, 2)}%` }}
                          />

                          <div className="absolute -top-3 left-1/2 -translate-x-1/2 -translate-y-full opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-20">
                            <div className="bg-gray-900 text-white rounded-lg px-3 py-2 shadow-lg min-w-[180px]">
                              <div className="text-[11px] font-semibold text-gray-200 mb-1">
                                {point.date}
                              </div>
                              <div className="text-xs font-semibold">
                                Doanh thu: {formatCurrency(point.revenue)}
                              </div>
                              {point.bookings > 0 && (
                                <div className="text-xs text-gray-200 mt-0.5">
                                  Booking: {point.bookings}
                                </div>
                              )}
                              <div
                                className={`text-xs mt-0.5 font-semibold ${
                                  point.trendPercent == null
                                    ? "text-gray-300"
                                    : point.trendPercent >= 0
                                    ? "text-green-300"
                                    : "text-red-300"
                                }`}
                              >
                                {point.trendPercent == null
                                  ? "So với trước: N/A"
                                  : `So với trước: ${
                                      point.trendPercent >= 0 ? "+" : ""
                                    }${point.trendPercent.toFixed(1)}%`}
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })}

                    {chartLinePoints && (
                      <svg
                        className="absolute inset-0 w-full h-full pointer-events-none"
                        viewBox="0 0 100 100"
                        preserveAspectRatio="none"
                      >
                        <polyline
                          points={chartLinePoints}
                          fill="none"
                          stroke="#f97316"
                          strokeWidth="1"
                          vectorEffect="non-scaling-stroke"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                    )}
                  </div>

                  <div className="absolute left-3 right-3 bottom-2 flex justify-between text-[11px] text-gray-500">
                    {chartData.map((point) => (
                      <span
                        key={point.date}
                        className="flex-1 text-center truncate"
                      >
                        {point.date?.slice(5)}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              <div className="mt-4 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3">
                <div className="flex items-center gap-4 text-xs text-gray-600 flex-wrap">
                  <span className="inline-flex items-center gap-1.5">
                    <span className="w-3 h-3 rounded bg-blue-400 inline-block" />
                    Cột doanh thu (màu theo mức thấp/trung/cao)
                  </span>
                  <span className="inline-flex items-center gap-1.5">
                    <span className="w-4 h-[2px] bg-orange-500 inline-block" />
                    Trung bình động 7 mốc
                  </span>
                </div>

                <div className={`text-xs font-semibold ${hoverCardClass}`}>
                  {hoveredPoint
                    ? `Đang xem ${hoveredPoint.date}: ${formatCurrency(
                        hoveredPoint.revenue
                      )}`
                    : "Di chuột vào cột để xem chi tiết"}
                </div>
              </div>
            </>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-6">
              Top sân theo lượt đặt
            </h3>
            <div className="space-y-5">
              {topCourts.length === 0 && (
                <p className="text-sm text-gray-500">Không có dữ liệu.</p>
              )}
              {topCourts.map((court) => (
                <div key={court.courtId}>
                  <div className="flex justify-between text-sm mb-2">
                    <span className="font-medium text-gray-900">
                      {court.courtName}
                    </span>
                    <span className="font-bold text-blue-600">
                      {court.bookings} lượt
                    </span>
                  </div>
                  <div className="w-full bg-gray-100 rounded-full h-2">
                    <div
                      className="bg-blue-600 h-2 rounded-full transition-all"
                      style={{ width: `${court.percentage || 0}%` }}
                    />
                  </div>
                  <div className="text-xs text-gray-500 mt-1">
                    Doanh thu: {formatCurrency(court.revenue)}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="lg:col-span-2 bg-white rounded-xl border border-gray-200 overflow-hidden">
            <div className="p-6 border-b border-gray-200 flex items-center justify-between">
              <h3 className="text-lg font-bold text-gray-900">
                Booking gần đây
              </h3>
              <Link
                to="/admin/bookings"
                className="text-sm font-medium text-blue-600 hover:text-blue-700"
              >
                Xem tất cả
              </Link>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase">
                      ID
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase">
                      Khách hàng
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase">
                      Sân
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase">
                      Thời gian
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase">
                      Trạng thái
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {recentBookings.length === 0 && (
                    <tr>
                      <td
                        colSpan="5"
                        className="px-6 py-8 text-center text-sm text-gray-500"
                      >
                        Không có dữ liệu.
                      </td>
                    </tr>
                  )}
                  {recentBookings.map((booking) => (
                    <tr
                      key={booking.bookingId}
                      className="hover:bg-gray-50 transition-colors"
                    >
                      <td className="px-6 py-4 text-sm font-medium text-gray-900">
                        #BK-{booking.bookingId}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900">
                        {booking.customerName}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        {booking.courtName}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        {booking.playDate} {booking.startTime?.slice(0, 5)} -{" "}
                        {booking.endTime?.slice(0, 5)}
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${statusClass(
                            booking.paymentStatus || booking.status
                          )}`}
                        >
                          {statusLabel(booking.paymentStatus || booking.status)}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
