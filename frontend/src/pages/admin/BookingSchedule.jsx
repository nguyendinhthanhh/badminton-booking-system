import { useState, useEffect } from "react";
import scheduleService from "../../services/scheduleService";
import bookingService from "../../services/bookingService";
import adminBookingService from "../../services/adminBookingService";
import Toast from "../../components/common/Toast";
import BookingDetailSkeleton from "../../components/common/BookingDetailSkeleton";
import WalkInBookingModal from "../../components/admin/WalkInBookingModal";
import useDataStore from "../../store/useDataStore";

const BookingSchedule = () => {
  const {
    bookingSchedule: cachedSchedule,
    isCacheValid,
    setBookingSchedule,
    updateBookingInSchedule,
  } = useDataStore();

  const [selectedDate, setSelectedDate] = useState(new Date());
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [bookingDetail, setBookingDetail] = useState(null);
  const [showBookingDetail, setShowBookingDetail] = useState(false);

  const [showDatePicker, setShowDatePicker] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [loading, setLoading] = useState(true);
  const [loadingDetail, setLoadingDetail] = useState(false);
  const [savingBooking, setSavingBooking] = useState(false);
  const [courts, setCourts] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [stats, setStats] = useState({ totalBookings: 0, dailyRevenue: 0 });
  const [toast, setToast] = useState(null);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [showExtendUI, setShowExtendUI] = useState(false);
  const [extensionMinutes, setExtensionMinutes] = useState(30);
  const [showWalkInModal, setShowWalkInModal] = useState(false);

  // Update current time every second (Vietnam timezone)
  useEffect(() => {
    const updateTime = () => {
      // Get current time in Vietnam timezone (UTC+7)
      const now = new Date();
      const utcTime = now.getTime() + now.getTimezoneOffset() * 60000;
      const vietnamTime = new Date(utcTime + 7 * 3600000); // UTC+7
      setCurrentTime(vietnamTime);
    };

    updateTime();
    const timer = setInterval(updateTime, 1000); // Update every second
    return () => clearInterval(timer);
  }, []);

  // Close date picker when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (showDatePicker && !event.target.closest(".date-picker-container")) {
        setShowDatePicker(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [showDatePicker]);

  // Fetch timeline data when date changes
  useEffect(() => {
    fetchTimeline();
  }, [selectedDate]);

  const fetchTimeline = async (forceRefresh = false) => {
    // Check cache first
    const dateStr = selectedDate.toISOString().split("T")[0];
    const hasCachedData =
      cachedSchedule.data &&
      cachedSchedule.selectedDate === dateStr &&
      isCacheValid(cachedSchedule.lastFetch);

    if (!forceRefresh && hasCachedData) {
      console.log("Using cached booking schedule");
      // Use cached data
      const timelineData = cachedSchedule.data;

      if (timelineData.courts) {
        const mappedCourts = timelineData.courts.map((court) => ({
          id: court.courtId,
          name: court.courtName,
          type: court.courtType,
          status: court.courtStatus,
        }));
        setCourts(mappedCourts);

        const mappedBookings = [];
        timelineData.courts.forEach((court) => {
          if (court.slots) {
            court.slots.forEach((slot) => {
              // Hiển thị booking đã PENDING, PENDING_PAYMENT, CONFIRMED, PLAYING, hoặc COMPLETED
              // Bỏ qua nếu không có startTime hoặc endTime
              if (
                (slot.status === "PENDING" ||
                  slot.status === "PENDING_PAYMENT" ||
                  slot.status === "CONFIRMED" ||
                  slot.status === "PLAYING" ||
                  slot.status === "COMPLETED" ||
                  slot.status === "CANCELLATION_REQUESTED") &&
                slot.startTime &&
                slot.endTime
              ) {
                mappedBookings.push({
                  id: slot.bookingId,
                  courtId: court.courtId,
                  startTime: slot.startTime.substring(0, 5),
                  endTime: slot.endTime.substring(0, 5),
                  status: slot.status,
                  customerName: slot.customerName || "Unknown",
                  phone: slot.customerPhone,
                  payment: slot.paymentStatus || "UNPAID",
                  price: slot.totalPrice || 0,
                });
              }
            });
          }
        });
        setBookings(mappedBookings);
      }

      if (timelineData.statistics) {
        setStats({
          totalBookings: timelineData.statistics.bookedSlots || 0,
          dailyRevenue: timelineData.statistics.totalRevenue || 0,
        });
      }

      setLoading(false);
      return;
    }

    // Fetch from API
    console.log("Fetching booking schedule from API");
    setLoading(true);
    try {
      // Timeline API already contains statistics
      const timelineData = await scheduleService.getTimeline(selectedDate);

      // Cache the data
      setBookingSchedule(timelineData, dateStr);

      if (timelineData.courts) {
        const mappedCourts = timelineData.courts.map((court) => ({
          id: court.courtId,
          name: court.courtName,
          type: court.courtType,
          status: court.courtStatus,
        }));
        setCourts(mappedCourts);

        const mappedBookings = [];
        timelineData.courts.forEach((court) => {
          if (court.slots) {
            court.slots.forEach((slot) => {
              // Hiển thị booking đã PENDING, PENDING_PAYMENT, CONFIRMED, PLAYING, hoặc COMPLETED
              // Bỏ qua nếu không có startTime hoặc endTime
              if (
                (slot.status === "PENDING" ||
                  slot.status === "PENDING_PAYMENT" ||
                  slot.status === "CONFIRMED" ||
                  slot.status === "PLAYING" ||
                  slot.status === "COMPLETED") &&
                slot.startTime &&
                slot.endTime
              ) {
                mappedBookings.push({
                  id: slot.bookingId,
                  courtId: court.courtId,
                  startTime: slot.startTime.substring(0, 5),
                  endTime: slot.endTime.substring(0, 5),
                  status: slot.status,
                  customerName: slot.customerName || "Unknown",
                  phone: slot.customerPhone,
                  payment: slot.paymentStatus || "UNPAID",
                  price: slot.totalPrice || 0,
                });
              }
            });
          }
        });
        console.log("Total courts:", mappedCourts.length);
        console.log("Total bookings found:", mappedBookings.length);
        console.log("Bookings:", mappedBookings);
        setBookings(mappedBookings);
      }

      // Process statistics data from timeline response
      if (timelineData.statistics) {
        setStats({
          totalBookings: timelineData.statistics.bookedSlots || 0,
          dailyRevenue: timelineData.statistics.totalRevenue || 0,
        });
      }
    } catch (error) {
      console.error("Error fetching data:", error);
      showToast("Lỗi khi tải dữ liệu", "error");
    } finally {
      setLoading(false);
    }
  };

  const showToast = (message, type = "success") => {
    setToast({ message, type });
  };

  const timeSlots = [];
  for (let hour = 6; hour <= 23; hour++) {
    timeSlots.push(`${hour.toString().padStart(2, "0")}:00`);
  }

  const formatDate = (date) => {
    return date.toLocaleDateString("en-US", {
      month: "long",
      day: "numeric",
      year: "numeric",
    });
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(amount);
  };

  const formatDateWithTime = (dateString) => {
    if (!dateString) return "";
    // Handle "YYYY-MM-DD HH:mm:ss" format from backend
    const date = new Date(dateString.replace(' ', 'T'));
    return date.toLocaleString('vi-VN', {
      hour: '2-digit',
      minute: '2-digit',
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  const changeDate = (days) => {
    const newDate = new Date(selectedDate);
    newDate.setDate(newDate.getDate() + days);
    setSelectedDate(newDate);
  };

  const goToToday = () => {
    setSelectedDate(new Date());
  };

  const getBookingPosition = (startTime, endTime) => {
    const [startHour, startMin] = startTime.split(":").map(Number);
    const [endHour, endMin] = endTime.split(":").map(Number);

    const startMinutes = (startHour - 6) * 60 + startMin;
    const endMinutes = (endHour - 6) * 60 + endMin;
    const duration = endMinutes - startMinutes;

    const left = (startMinutes / 60) * 120;
    const width = (duration / 60) * 120;

    return { left: `${left}px`, width: `${width}px` };
  };

  const getCurrentTimePosition = () => {
    const today = new Date();
    const isToday = selectedDate.toDateString() === today.toDateString();

    if (!isToday) return null;

    // Use currentTime state which is already in Vietnam timezone
    const currentHour = currentTime.getHours();
    const currentMin = currentTime.getMinutes();
    const currentSec = currentTime.getSeconds();

    // Timeline starts at 6:00 AM and ends at 11:00 PM (23:00)
    if (currentHour < 6 || currentHour >= 24) return null;

    const totalSecondsFromStart = (currentHour - 6) * 3600 + currentMin * 60 + currentSec;

    // Each hour is 120px wide, so position = (seconds / 3600) * 120
    const position = (totalSecondsFromStart / 3600) * 120;

    return `${position}px`;
  };

  const timeToMinutes = (time) => {
    if (!time) return 0;
    if (typeof time === 'string') {
      const [h, m] = time.split(':').map(Number);
      return h * 60 + m;
    }
    if (typeof time === 'object' && time.hour !== undefined) {
      return (time.hour || 0) * 60 + (time.minute || 0);
    }
    return 0;
  };

  const handleBookingClick = async (booking) => {
    setSelectedBooking(booking);
    setShowBookingDetail(true);
    setLoadingDetail(true);
    setBookingDetail(null);


    try {
      // Fetch detailed booking information using the rich detail API
      const detail = await adminBookingService.getBookingById(booking.id);
      console.log("Booking detail from rich API:", detail);

      // Normalize status fields
      const currentStatus = detail.status || detail.bookingStatus || "";
      const normalizedDetail = {
        ...detail,
        status: currentStatus,
        bookingStatus: currentStatus
      };

      setBookingDetail(normalizedDetail);

      // Get slot IDs from rich detail if available, otherwise fallback
      const slots = detail.priceBreakdown || detail.slots || [];


    } catch (error) {
      console.error("Error fetching booking detail:", error);
      showToast("Lỗi khi tải chi tiết booking", "error");
    } finally {
      setLoadingDetail(false);
    }
  };

  const handleDateSelect = (date) => {
    setSelectedDate(date);
    setShowDatePicker(false);
  };



  const handleCheckIn = async () => {
    handleUpdateStatus("PLAYING");
  };

  const handleUpdateStatus = async (newStatus) => {
    setSavingBooking(true);
    try {
      console.log('🔄 Updating status to:', newStatus);
      console.log('📋 Booking detail:', bookingDetail);
      console.log('🆔 Booking ID:', bookingDetail.bookingId);
      console.log('📊 Current status:', bookingDetail.status);

      if (newStatus === 'PLAYING') {
        await adminBookingService.checkIn(bookingDetail.bookingId);
        showToast("Đã check-in thành công", "success");
      } else if (newStatus === 'COMPLETED') {
        const now = new Date();
        const pad = (num) => String(num).padStart(2, '0');
        const actualEndTime = `${pad(now.getHours())}:${pad(now.getMinutes())}`;

        await adminBookingService.completeBooking(bookingDetail.bookingId, actualEndTime);
        showToast("Đã check-out thành công", "success");
      } else {
        await adminBookingService.updateBookingStatus(bookingDetail.bookingId, newStatus);
        showToast(`Cập nhật trạng thái thành ${newStatus} thành công`, "success");
      }

      // Refresh booking detail using the rich detail API
      const updatedDetail = await adminBookingService.getBookingById(bookingDetail.bookingId);

      // Normalize refreshed detail
      const currentStatus = updatedDetail.status || updatedDetail.bookingStatus || "";
      const normalizedDetail = {
        ...updatedDetail,
        status: currentStatus,
        bookingStatus: currentStatus
      };

      setBookingDetail(normalizedDetail);

      // Refresh timeline
      await fetchTimeline(true);
    } catch (error) {
      console.error("Error updating status:", error);
      console.error("Error details:", error.response?.data);
      showToast(error.response?.data?.message || "Lỗi khi cập nhật trạng thái", "error");
    } finally {
      setSavingBooking(false);
    }
  };

  const handleExtendBooking = async () => {
    if (!bookingDetail) return;

    try {
      setSavingBooking(true);
      await scheduleService.extendBooking(bookingDetail.bookingId, {
        extensionMinutes: extensionMinutes,
      });

      showToast("Gia hạn thành công", "success");
      setShowExtendUI(false);

      // Refresh data
      const updatedDetail = await scheduleService.getBookingDetail(
        bookingDetail.bookingId,
      );
      setBookingDetail(updatedDetail);
      await fetchTimeline(true);
    } catch (error) {
      console.error("Error extending booking:", error);
      showToast("Lỗi khi gia hạn", "error");
    } finally {
      setSavingBooking(false);
    }
  };



  return (
    <div className="flex-1 overflow-y-auto p-4 md:p-8 bg-gray-50">
      <div className="max-w-[1600px] mx-auto flex flex-col gap-6">
        {/* Page Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-3xl font-black text-gray-900 tracking-tight">
                Court Schedule
              </h1>
              <div className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-[10px] font-black uppercase tracking-wider flex items-center gap-1.5 shadow-sm border border-green-200">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                </span>
                Live
              </div>
            </div>
            <div className="flex items-center gap-2 mt-1.5">
              <span className="material-symbols-outlined text-purple-600 text-base">schedule</span>
              <p className="text-gray-700 text-base font-black tracking-tight">
                {currentTime.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                <span className="mx-3 text-gray-300">|</span>
                <span className="text-gray-500 text-sm font-bold">System monitoring active</span>
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 bg-white/50 backdrop-blur-md p-1.5 rounded-2xl border border-gray-100 shadow-sm">
            <button
              onClick={() => changeDate(-1)}
              className="p-2 hover:bg-gray-100 rounded-xl transition-all active:scale-95"
            >
              <span className="material-symbols-outlined text-gray-600">
                chevron_left
              </span>
            </button>
            <div className="relative date-picker-container">
              <button
                onClick={() => setShowDatePicker(!showDatePicker)}
                className="flex items-center gap-3 px-4 py-2 bg-white border-2 border-purple-50 rounded-xl hover:border-purple-200 transition-all shadow-sm group"
              >
                <div className="w-8 h-8 bg-purple-100 text-purple-600 rounded-lg flex items-center justify-center group-hover:bg-purple-600 group-hover:text-white transition-colors">
                  <span className="material-symbols-outlined text-xl">
                    calendar_today
                  </span>
                </div>
                <div className="text-left">
                  <div className="text-[10px] font-black text-gray-400 uppercase leading-none mb-0.5">Selected Date</div>
                  <div className="font-bold text-gray-900 text-sm leading-none">
                    {formatDate(selectedDate)}
                  </div>
                </div>
              </button>

              {/* Date Picker Dropdown */}
              {showDatePicker && (
                <div className="absolute top-full mt-2 right-0 bg-white border border-gray-200 rounded-2xl shadow-2xl z-50 p-4 animate-in fade-in zoom-in duration-200 origin-top-right">
                  <input
                    type="date"
                    value={selectedDate.toISOString().split("T")[0]}
                    onChange={(e) => handleDateSelect(new Date(e.target.value))}
                    className="w-full px-4 py-3 border border-gray-100 bg-gray-50 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 text-sm font-bold text-gray-900"
                  />
                </div>
              )}
            </div>
            <button
              onClick={() => changeDate(1)}
              className="p-2 hover:bg-gray-100 rounded-xl transition-all active:scale-95"
            >
              <span className="material-symbols-outlined text-gray-600">
                chevron_right
              </span>
            </button>
            <div className="h-6 w-px bg-gray-100 mx-1"></div>
            <button
              onClick={goToToday}
              className="px-5 py-2.5 bg-gray-900 text-white rounded-xl text-xs font-black hover:bg-purple-600 transition-all active:scale-95 hover:shadow-lg hover:shadow-purple-100 uppercase tracking-widest"
            >
              Today
            </button>
            <div className="w-px h-6 bg-gray-200 mx-2"></div>
            <button
              onClick={() => setShowWalkInModal(true)}
              className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-xl shadow-lg shadow-purple-100 hover:shadow-purple-200 hover:scale-[1.02] active:scale-[0.98] transition-all font-bold text-xs uppercase tracking-wider"
            >
              <span className="material-symbols-outlined text-lg">add_circle</span>
              <span className="hidden sm:inline">Đặt sân ngay</span>
            </button>
          </div>
        </div>

        {/* Premium Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Card 1: Total Bookings */}
          <div className="bg-white rounded-3xl p-5 border border-gray-100 shadow-sm relative overflow-hidden group">
            <div className="absolute -right-4 -top-4 w-24 h-24 bg-purple-50 rounded-full group-hover:scale-150 transition-transform duration-500"></div>
            <div className="relative flex items-center gap-4">
              <div className="w-12 h-12 bg-purple-600 text-white rounded-2xl flex items-center justify-center shadow-lg shadow-purple-100">
                <span className="material-symbols-outlined">analytics</span>
              </div>
              <div>
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Selected Day</p>
                <h3 className="text-2xl font-black text-gray-900 leading-none">{stats.totalBookings}</h3>
                <p className="text-xs text-purple-600 font-bold mt-1 tracking-tight">Total reservations</p>
              </div>
            </div>
          </div>

          {/* Card 2: Daily Revenue */}
          <div className="bg-white rounded-3xl p-5 border border-gray-100 shadow-sm relative overflow-hidden group">
            <div className="absolute -right-4 -top-4 w-24 h-24 bg-emerald-50 rounded-full group-hover:scale-150 transition-transform duration-500"></div>
            <div className="relative flex items-center gap-4">
              <div className="w-12 h-12 bg-emerald-500 text-white rounded-2xl flex items-center justify-center shadow-lg shadow-emerald-100">
                <span className="material-symbols-outlined">payments</span>
              </div>
              <div>
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Revenue</p>
                <h3 className="text-2xl font-black text-gray-900 leading-none">
                  {stats.dailyRevenue.toLocaleString('vi-VN')}
                  <span className="text-xs font-bold text-gray-400 ml-1 underline decoration-emerald-500/30">đ</span>
                </h3>
                <p className="text-xs text-emerald-600 font-bold mt-1 tracking-tight">Daily total earned</p>
              </div>
            </div>
          </div>

          {/* Card 3: Active Courts */}
          <div className="bg-white rounded-3xl p-5 border border-gray-100 shadow-sm relative overflow-hidden group">
            <div className="absolute -right-4 -top-4 w-24 h-24 bg-blue-50 rounded-full group-hover:scale-150 transition-transform duration-500"></div>
            <div className="relative flex items-center gap-4">
              <div className="w-12 h-12 bg-blue-500 text-white rounded-2xl flex items-center justify-center shadow-lg shadow-blue-100">
                <span className="material-symbols-outlined">sports_tennis</span>
              </div>
              <div>
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Active Courts</p>
                <h3 className="text-2xl font-black text-gray-900 leading-none">
                  {courts.filter(c => c.status === 'ACTIVE').length}
                  <span className="text-sm text-gray-400 ml-1">/ {courts.length}</span>
                </h3>
                <p className="text-xs text-blue-600 font-bold mt-1 tracking-tight">Available for play</p>
              </div>
            </div>
          </div>

          {/* Card 4: Occupancy Rate */}
          <div className="bg-white rounded-3xl p-5 border border-gray-100 shadow-sm relative overflow-hidden group">
            <div className="absolute -right-4 -top-4 w-24 h-24 bg-amber-50 rounded-full group-hover:scale-150 transition-transform duration-500"></div>
            <div className="relative flex items-center gap-4">
              <div className="w-12 h-12 bg-amber-500 text-white rounded-2xl flex items-center justify-center shadow-lg shadow-amber-100">
                <span className="material-symbols-outlined">percent</span>
              </div>
              <div>
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Occupancy</p>
                <h3 className="text-2xl font-black text-gray-900 leading-none">
                  {courts.length > 0 ? Math.round((bookings.length / (courts.length * (timeSlots.length * 2))) * 100) : 0}%
                </h3>
                <p className="text-xs text-amber-600 font-bold mt-1 tracking-tight">Utilization rate</p>
              </div>
            </div>
          </div>
        </div>

        {/* Legend */}
        <div className="bg-white/40 backdrop-blur-sm rounded-3xl border border-gray-100 p-2 overflow-x-auto no-scrollbar">
          <div className="flex items-center gap-6 px-4 py-1.5 whitespace-nowrap min-w-max">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-white border-2 border-amber-500 shadow-sm rounded-full ring-2 ring-amber-100"></div>
              <span className="text-[10px] text-gray-500 font-black uppercase tracking-widest">Chờ xử lý</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-white border-2 border-red-500 shadow-sm rounded-full ring-2 ring-red-100 animate-pulse"></div>
              <span className="text-[10px] text-gray-500 font-black uppercase tracking-widest">Quá giờ</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-white border-2 border-purple-500 shadow-sm rounded-full ring-2 ring-purple-100"></div>
              <span className="text-[10px] text-gray-500 font-black uppercase tracking-widest">Đang chơi</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-white border-2 border-blue-500 shadow-sm rounded-full ring-2 ring-blue-100"></div>
              <span className="text-[10px] text-gray-500 font-black uppercase tracking-widest">Sắp đến</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-white border-2 border-green-500 shadow-sm rounded-full ring-2 ring-green-100"></div>
              <span className="text-[10px] text-gray-500 font-black uppercase tracking-widest">Hoàn thành</span>
            </div>
            <div className="flex items-center gap-2 opacity-50">
              <div className="w-3 h-3 bg-gray-200 shadow-inner rounded-full ring-2 ring-gray-100"></div>
              <span className="text-[10px] text-gray-500 font-black uppercase tracking-widest">Còn trống</span>
            </div>
          </div>
        </div>

        {loading ? (
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
            <div className="flex">
              {/* Fixed Court Names Column Skeleton */}
              <div className="flex-shrink-0 bg-gray-50">
                <div className="w-48 px-4 py-3 border-b border-gray-200">
                  <div className="h-4 bg-slate-200 rounded w-16 animate-pulse"></div>
                </div>
                {[1, 2, 3, 4, 5].map((idx) => (
                  <div
                    key={idx}
                    className={`w-48 px-4 py-6 ${idx !== 5 ? "border-b border-gray-200" : ""}`}
                  >
                    <div className="h-5 bg-slate-200 rounded w-24 mb-2 animate-pulse"></div>
                    <div className="h-3 bg-slate-200 rounded w-16 animate-pulse"></div>
                  </div>
                ))}
              </div>

              {/* Scrollable Timeline Skeleton */}
              <div className="flex-1 overflow-hidden">
                <div className="min-w-max">
                  {/* Time Header Skeleton */}
                  <div className="flex border-b border-gray-200 bg-gray-50">
                    {[...Array(18)].map((_, idx) => (
                      <div
                        key={idx}
                        className="w-[100px] flex-shrink-0 text-center py-3 border-l border-gray-200"
                      >
                        <div className="h-3 bg-slate-200 rounded w-12 mx-auto animate-pulse"></div>
                      </div>
                    ))}
                  </div>

                  {/* Court Rows Skeleton */}
                  {[1, 2, 3, 4, 5].map((courtIdx) => (
                    <div
                      key={courtIdx}
                      className={`flex relative ${courtIdx !== 5 ? "border-b border-gray-200" : ""}`}
                      style={{ height: "80px" }}
                    >
                      {[...Array(18)].map((_, idx) => (
                        <div
                          key={idx}
                          className="w-[100px] flex-shrink-0 border-l border-gray-100"
                        ></div>
                      ))}
                      {/* Random booking blocks skeleton */}
                      {courtIdx % 2 === 0 && (
                        <div
                          className="absolute top-2 bottom-2 rounded-lg bg-slate-200 animate-pulse"
                          style={{
                            left: `${courtIdx * 150}px`,
                            width: "200px",
                          }}
                        ></div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        ) : courts.length === 0 ? (
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-12 text-center">
            <p className="text-gray-500">Không có dữ liệu sân cho ngày này</p>
          </div>
        ) : (
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
            {/* Wrapper with both horizontal and vertical scroll */}
            <div className="overflow-auto relative max-h-[700px]">
              <div className="min-w-max">
                {/* Header - STICKY at top */}
                <div className="flex border-b border-gray-100 sticky top-0 bg-white/80 backdrop-blur-md z-30 shadow-sm shadow-gray-100">
                  {/* Fixed Court Label - STICKY at left */}
                  <div className="flex-shrink-0 w-52 bg-gray-50/50 px-6 py-4 border-r border-gray-100 sticky left-0 z-40 backdrop-blur-md">
                    <span className="font-black text-[10px] text-gray-400 uppercase tracking-widest">
                      Resource / Court
                    </span>
                  </div>

                  {/* Time Header */}
                  <div className="flex">
                    {timeSlots.map((time, idx) => (
                      <div
                        key={idx}
                        className="w-[120px] flex-shrink-0 text-center py-4 border-l border-gray-100 bg-white"
                      >
                        <span className="text-[13px] font-black text-gray-800 tracking-tight">
                          {time}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Content area - Remove inner scroll to let outer scroll handle it */}
                <div className="flex relative">
                  {/* Fixed Court Names - STICKY at left */}
                  <div className="flex-shrink-0 w-52 bg-gray-50/30 border-r border-gray-100 sticky left-0 z-20 backdrop-blur-sm">
                    {courts.map((court, courtIdx) => (
                      <div
                        key={court.id}
                        className={`px-6 py-5 flex flex-col justify-center ${courtIdx !== courts.length - 1 ? "border-b border-gray-50" : ""}`}
                        style={{ height: "90px" }}
                      >
                        <div className="flex items-center gap-2">
                          <div className={`w-2 h-2 rounded-full ${court.status === 'ACTIVE' ? 'bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.4)]' : 'bg-gray-300'}`}></div>
                          <div className="font-black text-gray-900 text-sm">{court.name}</div>
                        </div>
                        <div className="flex items-center gap-1.5 mt-1.5">
                          <span className={`px-2 py-0.5 rounded-md text-[9px] font-black uppercase tracking-wider border ${court.type === 'VIP' ? 'bg-amber-50 text-amber-600 border-amber-100' :
                            court.type === 'DOUBLE' ? 'bg-indigo-50 text-indigo-600 border-indigo-100' :
                              'bg-blue-50 text-blue-600 border-blue-100'
                            }`}>
                            {court.type}
                          </span>
                          <span className="text-[10px] text-gray-400 font-bold uppercase tracking-tight">Active</span>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Timeline */}
                  <div className="flex-1 relative">
                    {/* Current Time Marker */}
                    {getCurrentTimePosition() && (
                      <div
                        className="absolute top-0 bottom-0 z-30 pointer-events-none flex flex-col items-center"
                        style={{ left: getCurrentTimePosition() }}
                      >
                        <div className="bg-red-600 text-white text-[10px] font-black px-2 py-1 rounded-b-lg shadow-xl shadow-red-200 uppercase tracking-widest whitespace-nowrap z-10 flex items-center gap-1">
                          <span className="relative flex h-1.5 w-1.5">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-white"></span>
                          </span>
                          NOW
                        </div>
                        <div className="w-0.5 h-full bg-red-600 relative">
                          <div className="absolute top-0 bottom-0 left-[-6px] right-[-6px] bg-red-600/10"></div>
                          <div className="w-3.5 h-3.5 bg-red-600 rounded-full border-4 border-white shadow-lg absolute top-0 left-1/2 -translate-x-1/2 mt-3 z-20"></div>
                        </div>
                      </div>
                    )}

                    {courts.map((court, courtIdx) => (
                      <div
                        key={court.id}
                        className={`flex relative group/row ${courtIdx !== courts.length - 1 ? "border-b border-gray-50" : ""}`}
                        style={{ height: "90px" }}
                      >
                        {/* Time Grid Background */}
                        {timeSlots.map((_, idx) => (
                          <div
                            key={idx}
                            className="w-[120px] flex-shrink-0 border-l border-gray-50 h-full group-hover/row:bg-purple-50/20 transition-colors"
                          ></div>
                        ))}

                        {/* Bookings */}
                        {bookings
                          .filter((b) => b.courtId === court.id)
                          .map((booking) => {
                            const position = getBookingPosition(
                              booking.startTime,
                              booking.endTime,
                            );

                            // Tính toán trạng thái thời gian
                            const now = new Date();
                            const today =
                              selectedDate.toDateString() === now.toDateString();

                            let statusConfig = {
                              bg: "from-blue-500 to-blue-600",
                              shadow: "shadow-blue-200",
                              border: "border-blue-400/20",
                              icon: "event",
                              label: "Confirmed"
                            };

                            if (booking.status === "PENDING") {
                              statusConfig = {
                                bg: "from-amber-400 to-amber-500",
                                shadow: "shadow-amber-200",
                                border: "border-amber-400/20",
                                icon: "hourglass_empty",
                                label: "Pending"
                              };
                            } else if (booking.status === "PLAYING") {
                              statusConfig = {
                                bg: "from-purple-500 to-purple-600",
                                shadow: "shadow-purple-200",
                                border: "border-purple-400/20",
                                icon: "sports_tennis",
                                label: "Playing"
                              };
                            } else if (booking.status === "COMPLETED") {
                              statusConfig = {
                                bg: "from-emerald-500 to-emerald-600",
                                shadow: "shadow-emerald-200",
                                border: "border-emerald-400/20",
                                icon: "check_circle",
                                label: "Finished"
                              };
                            }

                            // Dynamic status updates for active bookings
                            let timeStatus = null;
                            if (today && booking.status === "PLAYING") {
                              const [endHour, endMin] = booking.endTime.split(":").map(Number);
                              const endDateTime = new Date(selectedDate);
                              endDateTime.setHours(endHour, endMin, 0);
                              const diffToEnd = endDateTime - now;

                              if (diffToEnd < 0) {
                                statusConfig.bg = "from-red-600 to-red-700 animate-pulse";
                                statusConfig.shadow = "shadow-red-200";
                                timeStatus = "OVERTIME";
                              } else if (diffToEnd < 15 * 60000) {
                                statusConfig.bg = "from-orange-500 to-orange-600";
                                statusConfig.shadow = "shadow-orange-200";
                                timeStatus = `${Math.floor(diffToEnd / 60000)}m left`;
                              }
                            }

                            return (
                              <button
                                key={booking.id}
                                onClick={() => handleBookingClick(booking)}
                                className={`absolute top-2 bottom-2 rounded-2xl p-2.5 flex flex-col justify-between transition-all hover:scale-[1.02] hover:z-40 text-left border-2 bg-gradient-to-br shadow-lg ${statusConfig.bg} ${statusConfig.border} ${statusConfig.shadow}`}
                                style={{
                                  left: position.left,
                                  width: position.width,
                                }}
                              >
                                <div>
                                  <div className="flex items-start justify-between">
                                    <div className="w-6 h-6 rounded-lg bg-white/20 flex items-center justify-center backdrop-blur-md">
                                      <span className="material-symbols-outlined text-white text-[14px]">
                                        {statusConfig.icon}
                                      </span>
                                    </div>
                                    {timeStatus && (
                                      <span className="bg-white/30 text-white text-[8px] font-black px-1.5 py-0.5 rounded-full backdrop-blur-md uppercase tracking-wider">
                                        {timeStatus}
                                      </span>
                                    )}
                                  </div>
                                  <div className="mt-2 overflow-hidden">
                                    <div className="text-[10px] font-black text-white/70 uppercase leading-none tracking-tight">#{booking.id}</div>
                                    <div className="text-[11px] font-black text-white leading-tight truncate mt-0.5">
                                      {booking.customerName}
                                    </div>
                                  </div>
                                </div>

                                <div className="flex items-center justify-between mt-auto">
                                  <div className="text-[11px] font-black text-white bg-black/20 px-2 py-1 rounded-lg whitespace-nowrap border border-white/10 shadow-inner">
                                    {booking.startTime} - {booking.endTime}
                                  </div>
                                  {booking.payment === 'PAID' && (
                                    <div className="w-5 h-5 rounded-full bg-white/20 flex items-center justify-center backdrop-blur-sm">
                                      <span className="material-symbols-outlined text-white text-[14px] font-black">verified</span>
                                    </div>
                                  )}
                                </div>
                              </button>
                            );
                          })}
                      </div>
                    ))}

                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

      </div>

      {/* Booking Detail Modal */}
      {showBookingDetail && selectedBooking && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex min-h-screen items-center justify-center p-4">
            <div
              className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm transition-opacity"
              onClick={() => setShowBookingDetail(false)}
            ></div>

            <div className="relative bg-white rounded-xl shadow-2xl max-w-4xl w-full border border-slate-200 overflow-hidden max-h-[90vh] flex flex-col">
              {/* Header */}
              <div className="px-4 py-3 border-b border-slate-200 bg-gradient-to-r from-blue-50 to-purple-50 flex-shrink-0">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                      <span className="material-symbols-outlined text-white text-sm">
                        event_available
                      </span>
                    </div>
                    <div>
                      <h3 className="text-base font-bold text-gray-900">
                        Chi tiết đặt sân
                      </h3>
                      <p className="text-xs text-gray-600">
                        Booking #
                        {bookingDetail?.bookingId || selectedBooking.id}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">

                    <button
                      onClick={() => setShowBookingDetail(false)}
                      className="text-slate-400 hover:text-slate-600 transition-colors"
                    >
                      <span className="material-symbols-outlined">close</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* Modal Body */}
              <div className="flex-1 overflow-y-auto p-4 md:p-6 custom-scrollbar">
                {loadingDetail ? (
                  <BookingDetailSkeleton />
                ) : bookingDetail ? (
                  /* VIEW MODE (Existing Code) */
                  <div className="flex flex-col gap-6">
                    {/* Status Banner */}
                    <div
                      className={`p-4 rounded-xl flex items-center justify-between ${bookingDetail.bookingStatus === "CONFIRMED"
                        ? "bg-green-50 border border-green-200"
                        : bookingDetail.bookingStatus === "PENDING"
                          ? "bg-amber-50 border border-amber-200"
                          : bookingDetail.bookingStatus === "PLAYING"
                            ? "bg-purple-50 border border-purple-200"
                            : bookingDetail.bookingStatus === "CANCELLED"
                              ? "bg-red-50 border border-red-200"
                              : "bg-gray-50 border border-gray-200"
                        }`}
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-10 h-10 rounded-full flex items-center justify-center ${bookingDetail.bookingStatus === "CONFIRMED"
                            ? "bg-green-100 text-green-600"
                            : bookingDetail.bookingStatus === "PENDING"
                              ? "bg-amber-100 text-amber-600"
                              : bookingDetail.bookingStatus === "PLAYING"
                                ? "bg-purple-100 text-purple-600"
                                : bookingDetail.bookingStatus === "CANCELLED"
                                  ? "bg-red-100 text-red-600"
                                  : "bg-gray-100 text-gray-600"
                            }`}
                        >
                          <span className="material-symbols-outlined">
                            {bookingDetail.bookingStatus === "CONFIRMED"
                              ? "check_circle"
                              : bookingDetail.bookingStatus === "PENDING"
                                ? "pending"
                                : bookingDetail.bookingStatus === "PLAYING"
                                  ? "sports_tennis"
                                  : bookingDetail.bookingStatus === "CANCELLED"
                                    ? "cancel"
                                    : "info"}
                          </span>
                        </div>
                        <div>
                          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                            Trạng thái hiện tại
                          </p>
                          <p
                            className={`text-lg font-bold ${bookingDetail.bookingStatus === "CONFIRMED"
                              ? "text-green-700"
                              : bookingDetail.bookingStatus === "PENDING"
                                ? "text-amber-700"
                                : bookingDetail.bookingStatus === "PLAYING"
                                  ? "text-purple-700"
                                  : bookingDetail.bookingStatus === "CANCELLED"
                                    ? "text-red-700"
                                    : "text-gray-700"
                              }`}
                          >
                            {bookingDetail.bookingStatus}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                          Mã đặt sân
                        </p>
                        <p className="text-lg font-bold text-gray-900">
                          #{bookingDetail.bookingId}
                        </p>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {/* Customer Info */}
                      <div className="bg-white rounded-xl border border-gray-100 p-5 shadow-sm hover:shadow-md transition-shadow">
                        <h4 className="text-sm font-bold text-gray-800 mb-4 flex items-center gap-2">
                          <span className="material-symbols-outlined text-blue-600">
                            person
                          </span>
                          Thông tin khách hàng
                        </h4>
                        <div className="space-y-4">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center text-blue-600 shrink-0">
                              <span className="material-symbols-outlined">badge</span>
                            </div>
                            <div>
                              <p className="text-[10px] text-gray-400 font-bold uppercase">Họ tên</p>
                              <p className="text-sm font-bold text-gray-900">{bookingDetail.customerName}</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-lg bg-green-50 flex items-center justify-center text-green-600 shrink-0">
                              <span className="material-symbols-outlined">call</span>
                            </div>
                            <div>
                              <p className="text-[10px] text-gray-400 font-bold uppercase">Điện thoại</p>
                              <p className="text-sm font-bold text-gray-900">{bookingDetail.customerPhone}</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-lg bg-purple-50 flex items-center justify-center text-purple-600 shrink-0">
                              <span className="material-symbols-outlined">mail</span>
                            </div>
                            <div>
                              <p className="text-[10px] text-gray-400 font-bold uppercase">Email</p>
                              <p className="text-sm font-medium text-gray-700 truncate max-w-[180px]">{bookingDetail.customerEmail}</p>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Court Info */}
                      <div className="bg-white rounded-xl border border-gray-100 p-5 shadow-sm hover:shadow-md transition-shadow">
                        <h4 className="text-sm font-bold text-gray-800 mb-4 flex items-center gap-2">
                          <span className="material-symbols-outlined text-purple-600">
                            stadium
                          </span>
                          Thông tin sân
                        </h4>
                        <div className="space-y-4">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-lg bg-purple-50 flex items-center justify-center text-purple-600 shrink-0">
                              <span className="material-symbols-outlined">location_on</span>
                            </div>
                            <div>
                              <p className="text-[10px] text-gray-400 font-bold uppercase">Sân & Vị trí</p>
                              <p className="text-sm font-bold text-gray-900">{bookingDetail.courtName} - {bookingDetail.courtLocation}</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-lg bg-amber-50 flex items-center justify-center text-amber-600 shrink-0">
                              <span className="material-symbols-outlined">category</span>
                            </div>
                            <div>
                              <p className="text-[10px] text-gray-400 font-bold uppercase">Loại sân</p>
                              <p className="text-sm font-bold text-gray-900">{bookingDetail.courtType}</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center text-blue-600 shrink-0">
                              <span className="material-symbols-outlined">calendar_today</span>
                            </div>
                            <div>
                              <p className="text-[10px] text-gray-400 font-bold uppercase">Ngày chơi</p>
                              <p className="text-sm font-bold text-gray-900">{new Date(bookingDetail.playDate).toLocaleDateString("vi-VN")}</p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Time Slots / Price Breakdown */}
                    <div className="bg-white rounded-xl border border-gray-100 p-5 shadow-sm">
                      <h4 className="text-sm font-bold text-gray-800 mb-4 flex items-center gap-2">
                        <span className="material-symbols-outlined text-orange-600">
                          schedule
                        </span>
                        Chi tiết khung giờ {(bookingDetail.priceBreakdown || bookingDetail.slots)?.length || 0}
                      </h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {(bookingDetail.priceBreakdown || bookingDetail.slots || []).map((slot, idx) => (
                          <div
                            key={idx}
                            className="flex items-center justify-between p-3 bg-gray-50 rounded-xl border border-gray-200 hover:border-orange-200 transition-colors"
                          >
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 rounded-full bg-white shadow-sm flex items-center justify-center text-orange-600 shrink-0">
                                <span className="font-bold text-xs">{idx + 1}</span>
                              </div>
                              <div>
                                <p className="text-sm font-bold text-gray-900">
                                  {(slot.periodStart || slot.startTime)?.substring(0, 5)} - {(slot.periodEnd || slot.endTime)?.substring(0, 5)}
                                </p>
                                <p className="text-[10px] text-gray-500 font-medium">
                                  {slot.dayType || slot.periodName} • {slot.durationMinutes}p
                                </p>
                              </div>
                            </div>
                            <div className="text-right">
                              <p className="text-sm font-black text-gray-900">
                                {new Intl.NumberFormat("vi-VN", {
                                  style: "currency",
                                  currency: "VND",
                                }).format(slot.subtotal || slot.price)}
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Admin Note - View mode only if exists */}
                    {(bookingDetail.notes || bookingDetail.adminNote) && (
                      <div className="bg-orange-50/50 rounded-xl border border-orange-100 p-4 shadow-sm">
                        <h4 className="text-[10px] font-black text-orange-400 uppercase tracking-widest mb-1 flex items-center gap-2">
                          <span className="material-symbols-outlined text-sm">notes</span>
                          Ghi chú Admin
                        </h4>
                        <p className="text-sm text-gray-700 font-medium italic whitespace-pre-wrap">{bookingDetail.notes || bookingDetail.adminNote}</p>
                      </div>
                    )}

                    {/* Event Timeline (Hours/Times) */}
                    <div className="bg-white rounded-xl border border-gray-100 p-5 shadow-sm">
                      <h4 className="text-sm font-bold text-gray-800 mb-4 flex items-center gap-2">
                        <span className="material-symbols-outlined text-indigo-600">
                          history
                        </span>
                        Dòng thời gian sự kiện
                      </h4>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {bookingDetail.createdAt && (
                          <div className="flex justify-between text-[11px] text-slate-500 bg-slate-100/50 rounded-lg px-3 py-1.5 border border-slate-100">
                            <span className="font-bold">Đã tạo đơn:</span>
                            <span className="font-black">{formatDateWithTime(bookingDetail.createdAt)}</span>
                          </div>
                        )}
                        {bookingDetail.confirmedAt && (
                          <div className="flex justify-between text-[11px] text-blue-600 bg-blue-100/50 rounded-lg px-3 py-1.5 border border-blue-100">
                            <span className="font-bold">Đã xác nhận:</span>
                            <span className="font-black">{formatDateWithTime(bookingDetail.confirmedAt)}</span>
                          </div>
                        )}
                        {bookingDetail.checkedInAt && (
                          <div className="flex justify-between text-[11px] text-purple-600 bg-purple-100/50 rounded-lg px-3 py-1.5 border border-purple-100">
                            <span className="font-bold">Đã check-in:</span>
                            <span className="font-black">{formatDateWithTime(bookingDetail.checkedInAt)}</span>
                          </div>
                        )}
                        {bookingDetail.completedAt && (
                          <div className="flex justify-between text-[11px] text-emerald-600 bg-emerald-100/50 rounded-lg px-3 py-1.5 border border-emerald-100">
                            <span className="font-bold">Đã check-out:</span>
                            <span className="font-black">{formatDateWithTime(bookingDetail.completedAt)}</span>
                          </div>
                        )}
                        {bookingDetail.cancelledAt && (
                          <div className="flex flex-col text-[11px] text-rose-600 bg-rose-100/50 rounded-lg px-3 py-1.5 border border-rose-100 col-span-full">
                            <div className="flex justify-between">
                              <span className="font-bold">Đã hủy đơn:</span>
                              <span className="font-black">{formatDateWithTime(bookingDetail.cancelledAt)}</span>
                            </div>
                            {bookingDetail.cancelledBy && (
                              <div className="flex justify-between mt-1 pt-1 border-t border-rose-200/50">
                                <span className="font-bold">Người thực hiện hủy:</span>
                                <span className="font-black">{bookingDetail.cancelledBy}</span>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Deposit Information - ALWAYS SHOW for debugging */}
                    {(bookingDetail.depositAmount || bookingDetail.depositPaid || bookingDetail.remainingAmount !== undefined) && (
                      <div className="bg-gradient-to-br from-purple-50 to-blue-50 rounded-xl p-5 border border-purple-200 mb-6">
                        <div className="flex items-center gap-2 mb-4">
                          <div className="w-8 h-8 bg-purple-600 rounded-lg flex items-center justify-center">
                            <span className="material-symbols-outlined text-white text-lg">payments</span>
                          </div>
                          <h3 className="text-sm font-black text-purple-900 uppercase tracking-wider">
                            Thông tin thanh toán
                          </h3>
                        </div>

                        <div className="space-y-3">
                          <div className="flex justify-between items-center">
                            <span className="text-sm text-slate-600">Tổng tiền:</span>
                            <span className="text-lg font-bold text-slate-900">
                              {formatCurrency(bookingDetail.totalPrice)}
                            </span>
                          </div>

                          <div className="h-px bg-gradient-to-r from-transparent via-purple-200 to-transparent"></div>

                          {bookingDetail.depositAmount && (
                            <div className="flex justify-between items-center bg-purple-50 rounded-lg p-3 border border-purple-300">
                              <div className="flex items-center gap-2">
                                <span className="material-symbols-outlined text-purple-600 text-lg">info</span>
                                <span className="text-sm font-semibold text-purple-700">Số tiền cọc yêu cầu (1/3):</span>
                              </div>
                              <span className="text-lg font-bold text-purple-600">
                                {formatCurrency(bookingDetail.depositAmount)}
                              </span>
                            </div>
                          )}

                          {bookingDetail.depositPaid !== undefined && bookingDetail.depositPaid !== null && (
                            <div className="flex justify-between items-center bg-white rounded-lg p-3 border border-purple-200">
                              <div className="flex items-center gap-2">
                                <span className="material-symbols-outlined text-green-600 text-lg">account_balance_wallet</span>
                                <span className="text-sm font-semibold text-green-700">Đã thanh toán cọc:</span>
                              </div>
                              <span className="text-lg font-bold text-green-600">
                                {formatCurrency(bookingDetail.depositPaid)}
                              </span>
                            </div>
                          )}

                          {bookingDetail.remainingAmount !== undefined && bookingDetail.remainingAmount !== null && (
                            <div className={`flex justify-between items-center rounded-lg p-3 border ${bookingDetail.remainingAmount > 0
                              ? 'bg-amber-50 border-amber-200'
                              : 'bg-green-50 border-green-200'
                              }`}>
                              <div className="flex items-center gap-2">
                                <span className={`material-symbols-outlined text-lg ${bookingDetail.remainingAmount > 0 ? 'text-amber-600' : 'text-green-600'
                                  }`}>
                                  {bookingDetail.remainingAmount > 0 ? 'pending_actions' : 'check_circle'}
                                </span>
                                <span className={`text-sm font-semibold ${bookingDetail.remainingAmount > 0 ? 'text-amber-700' : 'text-green-700'
                                  }`}>
                                  {bookingDetail.remainingAmount > 0 ? 'Còn phải trả:' : 'Đã thanh toán đầy đủ'}
                                </span>
                              </div>
                              <span className={`text-lg font-bold ${bookingDetail.remainingAmount > 0 ? 'text-amber-600' : 'text-green-600'
                                }`}>
                                {formatCurrency(bookingDetail.remainingAmount)}
                              </span>
                            </div>
                          )}

                          {bookingDetail.checkInDeadline && (bookingDetail.status === 'PAYMENT_CONFIRMED' || bookingDetail.status === 'PENDING_PAYMENT') && (
                            <div className="flex items-center gap-2 text-blue-600 text-xs bg-blue-50 rounded-lg p-2 border border-blue-200">
                              <span className="material-symbols-outlined text-base">schedule</span>
                              <span>
                                <strong>Deadline check-in:</strong> {formatDateWithTime(bookingDetail.checkInDeadline)}
                              </span>
                            </div>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Payment Summary */}
                    <div className="bg-gradient-to-br from-gray-900 to-slate-800 rounded-2xl p-6 text-white shadow-lg relative overflow-hidden">
                      <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -mr-16 -mt-16 blur-2xl"></div>
                      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 relative z-10">
                        <div className="flex items-center gap-4">
                          <div className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${bookingDetail.paymentStatus === "PAID" ? "bg-green-500" : "bg-amber-500"}`}>
                            {bookingDetail.paymentStatus === "PAID" ? "Đã thanh toán" : "Chưa thanh toán"}
                          </div>
                          <div className="h-4 w-px bg-white/20"></div>
                          <div>
                            <p className="text-white/60 text-[10px] font-bold uppercase tracking-wider mb-1">Ngày đặt sân</p>
                            <p className="text-sm font-semibold">{new Date(bookingDetail.bookingDate).toLocaleDateString("vi-VN")}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-white/60 text-[10px] font-bold uppercase tracking-wider mb-1">Tổng cộng phí sân</p>
                          <p className="text-3xl font-black text-white">
                            {new Intl.NumberFormat("vi-VN", {
                              style: "currency",
                              currency: "VND",
                            }).format(bookingDetail.totalPrice)}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <div className="w-16 h-16 bg-red-50 text-red-400 rounded-full flex items-center justify-center mx-auto mb-4">
                      <span className="material-symbols-outlined text-4xl">error</span>
                    </div>
                    <p className="text-gray-500 font-medium tracking-tight">Không thể tải thông tin chi tiết</p>
                  </div>
                )}
              </div>

              {/* Footer / Status Flow Actions */}
              {bookingDetail && !loadingDetail && (
                <div className="px-6 py-4 bg-slate-50 border-t border-slate-200 flex flex-wrap gap-3 items-center justify-center">
                  {savingBooking ? (
                    <div className="flex items-center gap-3 text-gray-500 px-8 py-2">
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-purple-600"></div>
                      <span className="font-semibold text-sm">Đang cập nhật...</span>
                    </div>
                  ) : (
                    /* VIEW MODE ACTIONS */
                    <>
                      {/* PENDING -> CONFIRMED */}
                      {(bookingDetail.status === "PENDING" || bookingDetail.bookingStatus === "PENDING") && (
                        <button
                          onClick={() => handleUpdateStatus("CONFIRMED")}
                          className="flex-1 min-w-[150px] py-2.5 bg-green-600 hover:bg-green-700 text-white rounded-xl shadow-lg shadow-green-200 transition-all font-bold text-sm flex items-center justify-center gap-2"
                        >
                          <span className="material-symbols-outlined text-lg">verified</span>
                          Xác nhận đặt sân
                        </button>
                      )}

                      {/* CONFIRMED -> PLAYING (Check-in) */}
                      {/* Debug: Current status = {bookingDetail.status} / {bookingDetail.bookingStatus} */}
                      {(bookingDetail.status === "CONFIRMED" || bookingDetail.bookingStatus === "CONFIRMED") && (
                        <>
                          <button
                            onClick={() => handleUpdateStatus("PLAYING")}
                            className="flex-1 min-w-[150px] py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl shadow-lg shadow-blue-200 transition-all font-bold text-sm flex items-center justify-center gap-2"
                          >
                            <span className="material-symbols-outlined text-lg">check_circle</span>
                            Check-in
                          </button>
                          <button
                            onClick={() => setShowCancelModal(true)}
                            className="flex items-center justify-center gap-2 px-6 py-2.5 bg-white border-2 border-rose-100 text-rose-600 rounded-xl hover:bg-rose-50 transition-all font-bold text-sm"
                          >
                            <span className="material-symbols-outlined text-lg">cancel</span>
                            Hủy đơn
                          </button>
                        </>
                      )}

                      {/* PLAYING -> COMPLETED */}
                      {(bookingDetail.status === "PLAYING" || bookingDetail.bookingStatus === "PLAYING") && (
                        <button
                          onClick={() => handleUpdateStatus("COMPLETED")}
                          className="flex-1 min-w-[150px] py-2.5 bg-purple-600 hover:bg-purple-700 text-white rounded-xl shadow-lg shadow-purple-200 transition-all font-bold text-sm flex items-center justify-center gap-2"
                        >
                          <span className="material-symbols-outlined text-lg">task_alt</span>
                          Hoàn thành (Check-out)
                        </button>
                      )}

                      {/* Extension Feature (Only for CONFIRMED or PLAYING) */}
                      {(bookingDetail.status === "CONFIRMED" || bookingDetail.bookingStatus === "CONFIRMED" ||
                        bookingDetail.status === "PLAYING" || bookingDetail.bookingStatus === "PLAYING") && !showExtendUI && (
                          <button
                            onClick={() => setShowExtendUI(true)}
                            className="flex-1 min-w-[150px] py-2.5 bg-amber-500 hover:bg-amber-600 text-white rounded-xl shadow-lg shadow-amber-200 transition-all font-bold text-sm flex items-center justify-center gap-2"
                          >
                            <span className="material-symbols-outlined text-lg">history</span>
                            Gia hạn
                          </button>
                        )}
                    </>
                  )}

                  {/* Inline Extension UI */}
                  {showExtendUI && (
                    <div className="w-full bg-amber-50 rounded-2xl p-4 border border-amber-200 animate-in slide-in-from-bottom duration-300">
                      <div className="flex items-center justify-between mb-4">
                        <h5 className="text-sm font-black text-amber-800 flex items-center gap-2">
                          <span className="material-symbols-outlined text-lg">history</span>
                          Gia hạn thời gian chơi
                        </h5>
                        <button
                          onClick={() => setShowExtendUI(false)}
                          className="text-amber-400 hover:text-amber-600"
                        >
                          <span className="material-symbols-outlined text-lg">close</span>
                        </button>
                      </div>

                      <div className="grid grid-cols-3 gap-3 mb-4">
                        {[30, 60, 90].map(mins => (
                          <button
                            key={mins}
                            onClick={() => setExtensionMinutes(mins)}
                            className={`py-2 rounded-xl text-xs font-bold transition-all ${extensionMinutes === mins
                              ? "bg-amber-600 text-white shadow-md"
                              : "bg-white text-amber-700 border border-amber-200 hover:border-amber-400"
                              }`}
                          >
                            +{mins} phút
                          </button>
                        ))}
                      </div>

                      <div className="flex gap-2">
                        <button
                          disabled={savingBooking}
                          onClick={handleExtendBooking}
                          className="flex-1 py-2.5 bg-amber-600 hover:bg-amber-700 text-white rounded-xl font-bold text-sm flex items-center justify-center gap-2 shadow-lg shadow-amber-200"
                        >
                          {savingBooking ? (
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                          ) : (
                            <>
                              <span className="material-symbols-outlined text-lg">add_task</span>
                              Xác nhận gia hạn
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Modal xác nhận hủy đơn */}
      {showCancelModal && bookingDetail && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity"
            onClick={() => !savingBooking && setShowCancelModal(false)}
          ></div>
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md transform transition-all relative z-10 overflow-hidden border border-red-100">
            {/* Header cảnh báo */}
            <div className="bg-red-50 p-6 flex flex-col items-center text-center">
              <div className="w-16 h-16 bg-red-100 text-red-600 rounded-full flex items-center justify-center mb-4 animate-bounce">
                <span className="material-symbols-outlined text-4xl">warning</span>
              </div>
              <h3 className="text-xl font-black text-gray-900">Xác nhận Hủy Đơn</h3>
              <p className="text-sm text-red-600 font-medium mt-1">Cảnh báo: Hành động này không thể hoàn tác!</p>
            </div>

            {/* Content chi tiết */}
            <div className="p-6">
              <div className="bg-gray-50 rounded-2xl p-4 space-y-3 mb-6">
                <div className="flex justify-between items-center">
                  <span className="text-xs font-bold text-gray-400 uppercase">Mã đặt sân</span>
                  <span className="text-sm font-black text-gray-900">#{bookingDetail.bookingId}</span>
                </div>
                <div className="h-px bg-gray-200"></div>
                <div className="flex justify-between items-center">
                  <span className="text-xs font-bold text-gray-400 uppercase">Khách hàng</span>
                  <span className="text-sm font-bold text-gray-900">{bookingDetail.customerName}</span>
                </div>
                <div className="h-px bg-gray-200"></div>
                <div className="flex justify-between items-center">
                  <span className="text-xs font-bold text-gray-400 uppercase">Sân</span>
                  <span className="text-sm font-bold text-gray-900">{bookingDetail.courtName}</span>
                </div>
              </div>

              <div className="flex flex-col gap-3">
                <button
                  disabled={savingBooking}
                  onClick={() => {
                    handleUpdateStatus("CANCELLED");
                    setShowCancelModal(false);
                  }}
                  className="w-full py-3.5 bg-red-600 hover:bg-red-700 text-white rounded-2xl shadow-lg shadow-red-200 transition-all font-black text-sm flex items-center justify-center gap-2"
                >
                  {savingBooking ? (
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  ) : (
                    <>
                      <span className="material-symbols-outlined">delete_forever</span>
                      XÁC NHẬN HỦY NGAY
                    </>
                  )}
                </button>
                <button
                  disabled={savingBooking}
                  onClick={() => setShowCancelModal(false)}
                  className="w-full py-3.5 bg-white border-2 border-gray-100 text-gray-500 hover:bg-gray-50 rounded-2xl transition-all font-bold text-sm"
                >
                  Giữ lại đơn đặt sân
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Walk-in Booking Modal */}
      <WalkInBookingModal
        isOpen={showWalkInModal}
        onClose={() => setShowWalkInModal(false)}
        onSuccess={() => {
          showToast('Đã tạo đặt sân tại quầy thành công');
          fetchTimeline(true);
        }}
        courts={courts}
      />

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
};

export default BookingSchedule;
