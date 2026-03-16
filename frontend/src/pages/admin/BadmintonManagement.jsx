import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import adminReportService from "../../services/adminReportService";
import StatCardSkeleton from "../../components/common/StatCardSkeleton";
import TableSkeleton from "../../components/common/TableSkeleton";
import Toast from "../../components/common/Toast";

const DATE_PRESETS = [
  { value: "today", label: "Hôm nay" },
  { value: "7d", label: "7 ngày" },
  { value: "30d", label: "30 ngày" },
  { value: "thisMonth", label: "Tháng này" },
];

const formatDate = (date) => {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
};

const formatCurrency = (value) =>
  new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
    maximumFractionDigits: 0,
  }).format(Number(value || 0));

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
  )
    return "bg-amber-50 text-amber-700 border-amber-200";
  if (status === "CANCELLED") return "bg-red-50 text-red-700 border-red-200";
  return "bg-blue-50 text-blue-700 border-blue-200";
};

export default function BadmintonManagement() {
  const [preset, setPreset] = useState("7d");
  const [loading, setLoading] = useState(true);
  const [report, setReport] = useState(null);
  const [toast, setToast] = useState(null);

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
      try {
        const data = await adminReportService.getDashboardReport({
          reportType: "bookings",
          ...selectedRange,
        });
        setReport(data);
      } catch (err) {
        console.error("Error fetching badminton report:", err);
        setToast({
          type: "error",
          message: "Không tải được dữ liệu thống kê.",
        });
      } finally {
        setLoading(false);
      }
    };
    fetchReport();
  }, [selectedRange]);

  const summary = report?.summary || {};
  const recentBookings = report?.recentBookings || [];
  const topCourts = report?.topCourts || [];

  const stats = [
    {
      title: "Tổng lượt đặt",
      value: summary.totalBookings ?? 0,
      icon: "event",
      iconBg: "bg-purple-100",
      iconColor: "text-purple-600",
      change: summary.bookingChange,
    },
    {
      title: "Hoàn thành",
      value: summary.completedBookings ?? summary.totalBookings ?? 0,
      icon: "check_circle",
      iconBg: "bg-green-100",
      iconColor: "text-green-600",
      desc: "Đơn hoàn thành",
    },
    {
      title: "Khách hàng",
      value: summary.activeCustomers ?? 0,
      icon: "group",
      iconBg: "bg-yellow-100",
      iconColor: "text-yellow-600",
      change: summary.customerChange,
    },
    {
      title: "Doanh thu",
      value: formatCurrency(summary.totalRevenue),
      icon: "payments",
      iconBg: "bg-blue-100",
      iconColor: "text-blue-600",
      change: summary.revenueChange,
    },
  ];

  return (
    <div className="flex-1 overflow-y-auto p-4 md:p-8 bg-gray-50">
      <div className="max-w-7xl mx-auto flex flex-col gap-6">
        {/* Page Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-black text-gray-900 tracking-tight">
              Quản lý đặt sân cầu lông
            </h1>
            <p className="text-gray-600 text-sm mt-1">
              Theo dõi và quản lý toàn bộ các đơn đặt sân trên hệ thống.
            </p>
          </div>
          <div className="flex gap-3 items-center">
            {/* Date preset */}
            <div className="flex items-center gap-1 bg-white border border-gray-200 rounded-lg p-1 shadow-sm">
              {DATE_PRESETS.map((item) => (
                <button
                  key={item.value}
                  onClick={() => setPreset(item.value)}
                  className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-colors ${
                    preset === item.value
                      ? "bg-purple-600 text-white shadow-sm"
                      : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
                  }`}
                >
                  {item.label}
                </button>
              ))}
            </div>
            <Link
              to="/admin/booking-management"
              className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg text-gray-900 text-sm font-bold hover:bg-gray-50 transition-colors shadow-sm"
            >
              <span className="material-symbols-outlined text-lg">
                list_alt
              </span>
              Quản lý booking
            </Link>
            <Link
              to="/admin/bookings"
              className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg text-sm font-bold hover:bg-purple-700 transition-colors shadow-md shadow-purple-600/20"
            >
              <span className="material-symbols-outlined text-lg">
                calendar_month
              </span>
              Lịch đặt sân
            </Link>
          </div>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {loading
            ? Array.from({ length: 4 }).map((_, idx) => (
                <StatCardSkeleton key={idx} />
              ))
            : stats.map((stat, idx) => (
                <div
                  key={idx}
                  className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm flex flex-col justify-between h-32"
                >
                  <div className="flex justify-between items-start">
                    <p className="text-gray-600 font-medium text-sm">
                      {stat.title}
                    </p>
                    <span
                      className={`material-symbols-outlined ${stat.iconColor} ${stat.iconBg} p-1 rounded-md text-xl`}
                    >
                      {stat.icon}
                    </span>
                  </div>
                  <div>
                    <p className="text-3xl font-bold text-gray-900">
                      {stat.value}
                    </p>
                    {stat.change && (
                      <div
                        className={`flex items-center gap-1 text-xs font-medium mt-1 ${
                          stat.change.startsWith("-")
                            ? "text-red-600"
                            : "text-green-600"
                        }`}
                      >
                        <span className="material-symbols-outlined text-base">
                          {stat.change.startsWith("-")
                            ? "trending_down"
                            : "trending_up"}
                        </span>
                        <span>{stat.change} so với kỳ trước</span>
                      </div>
                    )}
                    {stat.desc && !stat.change && (
                      <div className="flex items-center gap-1 text-gray-500 text-xs font-medium mt-1">
                        <span className="material-symbols-outlined text-base">
                          info
                        </span>
                        <span>{stat.desc}</span>
                      </div>
                    )}
                  </div>
                </div>
              ))}
        </div>

        {/* Two-column layout: Top courts + Recent bookings */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Top courts */}
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-5">
              Top sân được đặt nhiều
            </h3>
            {loading ? (
              <div className="space-y-4">
                {Array.from({ length: 4 }).map((_, i) => (
                  <div key={i} className="animate-pulse">
                    <div className="h-4 bg-gray-200 rounded w-3/4 mb-2" />
                    <div className="h-2 bg-gray-100 rounded w-full" />
                  </div>
                ))}
              </div>
            ) : topCourts.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-8 text-center">
                <span className="material-symbols-outlined text-4xl text-gray-300 mb-2">
                  sports_tennis
                </span>
                <p className="text-sm text-gray-500">
                  Không có dữ liệu trong khoảng thời gian này.
                </p>
              </div>
            ) : (
              <div className="space-y-5">
                {topCourts.map((court, index) => (
                  <div key={court.courtId}>
                    <div className="flex justify-between text-sm mb-2">
                      <span className="font-medium text-gray-900 flex items-center gap-2">
                        <span
                          className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold text-white ${
                            index === 0
                              ? "bg-purple-600"
                              : index === 1
                              ? "bg-blue-500"
                              : index === 2
                              ? "bg-teal-500"
                              : "bg-gray-400"
                          }`}
                        >
                          {index + 1}
                        </span>
                        {court.courtName}
                      </span>
                      <span className="font-bold text-purple-600">
                        {court.bookings} lượt
                      </span>
                    </div>
                    <div className="w-full bg-gray-100 rounded-full h-2">
                      <div
                        className={`h-2 rounded-full transition-all duration-500 ${
                          index === 0
                            ? "bg-purple-600"
                            : index === 1
                            ? "bg-blue-500"
                            : index === 2
                            ? "bg-teal-500"
                            : "bg-gray-400"
                        }`}
                        style={{ width: `${court.percentage || 0}%` }}
                      />
                    </div>
                    <div className="text-xs text-gray-500 mt-1">
                      Doanh thu: {formatCurrency(court.revenue)}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Recent bookings table */}
          <div className="lg:col-span-2 bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
            <div className="p-4 border-b border-gray-200 flex items-center justify-between">
              <h3 className="text-lg font-bold text-gray-900">
                Booking gần đây
              </h3>
              <Link
                to="/admin/booking-management"
                className="text-sm font-medium text-purple-600 hover:text-purple-700 flex items-center gap-1"
              >
                Xem tất cả
                <span className="material-symbols-outlined text-base">
                  arrow_forward
                </span>
              </Link>
            </div>

            {loading ? (
              <div className="overflow-x-auto">
                <TableSkeleton rows={5} columns={5} />
              </div>
            ) : recentBookings.length === 0 ? (
              <div className="p-12 flex flex-col items-center justify-center text-center">
                <span className="material-symbols-outlined text-5xl text-gray-300 mb-3">
                  event_busy
                </span>
                <h4 className="text-sm font-bold text-gray-700 mb-1">
                  Chưa có booking
                </h4>
                <p className="text-xs text-gray-500">
                  Không có booking nào trong khoảng thời gian đã chọn.
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-gray-50 border-b border-gray-200 text-xs uppercase text-gray-600 font-semibold">
                      <th className="p-4">ID</th>
                      <th className="p-4">Khách hàng</th>
                      <th className="p-4">Sân</th>
                      <th className="p-4">Thời gian</th>
                      <th className="p-4">Trạng thái</th>
                    </tr>
                  </thead>
                  <tbody className="text-sm">
                    {recentBookings.map((booking) => (
                      <tr
                        key={booking.bookingId}
                        className="border-b border-gray-200 hover:bg-gray-50 transition-colors"
                      >
                        <td className="p-4 font-bold text-gray-900">
                          #BK-{booking.bookingId}
                        </td>
                        <td className="p-4 text-gray-900">
                          {booking.customerName}
                        </td>
                        <td className="p-4 text-gray-600">
                          {booking.courtName}
                        </td>
                        <td className="p-4 text-gray-600">
                          {booking.playDate} {booking.startTime?.slice(0, 5)} -{" "}
                          {booking.endTime?.slice(0, 5)}
                        </td>
                        <td className="p-4">
                          <span
                            className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${statusClass(
                              booking.paymentStatus || booking.status
                            )}`}
                          >
                            {statusLabel(
                              booking.paymentStatus || booking.status
                            )}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Toast Notification */}
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}
    </div>
  );
}
