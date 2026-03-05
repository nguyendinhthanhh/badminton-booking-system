// CourtDetails - Booking Integration v2.5.1 (Fixed)
import { useParams, Link, useNavigate, useLocation } from "react-router-dom";
import { useState, useEffect, useMemo, useRef } from "react";
import useAuthStore from "../../store/useAuthStore";
import courtService from "../../services/courtService";
import bookingService from "../../services/bookingService";
import courtPriceService from "../../services/courtPriceService";
import paymentService from "../../services/paymentService";
import Toast from "../../components/common/Toast";
import CourtAvailability from "../../components/common/CourtAvailability";
import TimePickerBooking from "../../components/common/TimePickerBooking";
import CourtDetailSkeleton from "../../components/common/CourtDetailSkeleton";
import TimelineSkeleton from "../../components/common/TimelineSkeleton";
import PaymentModal from "../../components/customer/PaymentModal";
import LoginRequiredModal from "../../components/common/LoginRequiredModal";
// If you don't have these 2 files, comment them out and use simple <div>Loading...</div>
// import PriceTableSkeleton from "../../components/common/PriceTableSkeleton"; 
// import CourtAvailabilitySkeleton from "../../components/common/CourtAvailabilitySkeleton"; 

console.log("🔄 CourtDetails loaded - Booking integration active");

const CourtDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();

  // State definitions
  const [court, setCourt] = useState(null);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedDate, setSelectedDate] = useState(new Date());
  // eslint-disable-next-line no-unused-vars
  const [loadingDetail, setLoadingDetail] = useState(false);
  const [bookingInProgress, setBookingInProgress] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [pendingBooking, setPendingBooking] = useState(null);
  const [toast, setToast] = useState({ show: false, message: "", type: "" });
  const [availableSlots, setAvailableSlots] = useState([]);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [selectedStartTime, setSelectedStartTime] = useState("");
  const [selectedEndTime, setSelectedEndTime] = useState("");
  const [checkingAvailability, setCheckingAvailability] = useState(false);
  const [availabilityResult, setAvailabilityResult] = useState(null);
  const [priceResult, setPriceResult] = useState(null);
  const [courtPrices, setCourtPrices] = useState([]);
  const [loadingPrices, setLoadingPrices] = useState(false);

  // Refs
  const timelineRef = useRef(null);
  const amenitiesRef = useRef(null);
  const isInitialMount = useRef(true);

  // --- 1. INITIAL LOAD ---
  useEffect(() => {
    let ignore = false;

    const initializePage = async () => {
      try {
        setLoading(true);
        // Fetch Court Info
        const courtData = await courtService.getCourtById(id);
        if (ignore) return;
        setCourt(courtData);

        // Fetch Prices
        setLoadingPrices(true);
        const pricesData = await courtPriceService.getPricesByCourtId(id);
        if (ignore) return;

        const activePrices = pricesData.filter((p) => p.isActive);
        setCourtPrices(activePrices);
        setLoadingPrices(false);

        // Fetch initial slots in the same sequence
        if (!ignore) {
          await fetchAvailableSlotsAndBookings();
        }

      } catch (err) {
        if (!ignore) {
          setError("Không thể tải thông tin sân. Vui lòng thử lại sau.");
          console.error("Initialization error:", err);
        }
      } finally {
        if (!ignore) {
          setLoading(false);
          isInitialMount.current = false; // Mark as initialized
        }
      }
    };
    initializePage();

    return () => {
      ignore = true;
    };
  }, [id]);

  // --- 2. DATE CHANGE EFFECT ---
  useEffect(() => {
    // Skip if it's the first render (initially handled by initializePage)
    if (isInitialMount.current) return;

    if (court) {
      // Fetch availability
      fetchAvailableSlotsAndBookings();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedDate]);

  const fetchAvailableSlotsAndBookings = async () => {
    try {
      setLoadingSlots(true);
      const formattedDate = formatDateString(selectedDate);
      const slotsData = await bookingService.getAvailableSlots(
        id,
        formattedDate,
      );
      setAvailableSlots(slotsData);
    } catch (err) {
      console.error("Error fetching slots:", err);
    } finally {
      setLoadingSlots(false);
    }
  };

  // --- HELPER FUNCTIONS ---
  const formatDateString = (date) => {
    return date.toISOString().split("T")[0];
  };

  const getDayType = (date) => {
    const day = date.getDay();
    return day === 0 || day === 6 ? "WEEKEND" : "WEEKDAY";
  };

  const calculateDuration = (startTime, endTime) => {
    if (!startTime || !endTime) return 0;
    const [startHour, startMin] = startTime.split(":").map(Number);
    const [endHour, endMin] = endTime.split(":").map(Number);
    const startMinutes = startHour * 60 + startMin;
    const endMinutes = endHour * 60 + endMin;
    return endMinutes - startMinutes;
  };

  const getGroupedPrices = () => {
    const currentDayType = getDayType(selectedDate); // 'WEEKDAY' or 'WEEKEND'

    // Filter and Sort
    const dailyPrices = courtPrices
      .filter((p) => p.dayType === currentDayType)
      .sort((a, b) => a.startTime.localeCompare(b.startTime));

    // Group
    const grouped = {
      morning: [],    // < 12:00
      afternoon: [],  // 12:00 - 17:00
      evening: [],    // >= 17:00
    };

    dailyPrices.forEach((price) => {
      const startHour = parseInt(price.startTime.split(":")[0]);
      if (startHour < 12) {
        grouped.morning.push(price);
      } else if (startHour < 17) {
        grouped.afternoon.push(price);
      } else {
        grouped.evening.push(price);
      }
    });

    return grouped;
  };

  const showToast = (message, type) => {
    setToast({ show: true, message, type });
  };

  // --- HANDLERS ---
  const handleCheckAvailability = async () => {
    if (!selectedStartTime || !selectedEndTime) return;

    const duration = calculateDuration(selectedStartTime, selectedEndTime);
    if (duration <= 0) {
      showToast("Giờ kết thúc phải lớn hơn giờ bắt đầu", "error");
      return;
    }
    if (duration < 60) {
      showToast("Thời lượng đặt sân tối thiểu 1 giờ (60 phút)", "error");
      return;
    }

    setCheckingAvailability(true);
    setAvailabilityResult(null);
    setPriceResult(null);

    try {
      const formattedDate = formatDateString(selectedDate);
      const availData = await bookingService.checkAvailability(
        id,
        formattedDate,
        selectedStartTime,
        selectedEndTime,
      );
      setAvailabilityResult(availData);

      if (availData.available) {
        const priceData = await bookingService.calculatePrice(
          id,
          formattedDate,
          selectedStartTime,
          selectedEndTime,
        );
        setPriceResult(priceData);
      }
    } catch (error) {
      console.error("Check availability error:", error);
      const errorMessage =
        error.response?.data?.message ||
        error.response?.data?.error ||
        "Lỗi khi kiểm tra khả dụng";

      showToast(errorMessage, "error");

      setAvailabilityResult({
        available: false,
        message: errorMessage,
      });
    } finally {
      setCheckingAvailability(false);
    }
  };

  const { user } = useAuthStore(); // Get user from store
  const [showLoginModal, setShowLoginModal] = useState(false);

  const handleBooking = async () => {
    if (!user) {
      setShowLoginModal(true);
      return;
    }

    if (!selectedStartTime || !selectedEndTime) {
      showToast("Vui lòng chọn giờ bắt đầu và kết thúc", "error");
      return;
    }

    if (!availabilityResult || !availabilityResult.available) {
      showToast("Vui lòng kiểm tra khả dụng trước khi đặt sân", "error");
      return;
    }

    // Hiển thị Payment Modal TRƯỚC khi tạo booking
    // Lưu thông tin booking để tạo sau khi thanh toán
    const bookingData = {
      courtId: parseInt(id),
      playDate: formatDateString(selectedDate),
      startTime: selectedStartTime,
      endTime: selectedEndTime,
      notes: `Đặt sân từ ${selectedStartTime} đến ${selectedEndTime}`,
      totalPrice: priceResult?.totalPrice || 0,
      depositAmount: Math.round((priceResult?.totalPrice || 0) / 3), // 1/3 deposit
    };

    setPendingBooking(bookingData);
    setShowPaymentModal(true);
  };

  const handlePaymentSuccess = async (paymentMethod) => {
    try {
      setBookingInProgress(true);

      const bookingData = {
        courtId: pendingBooking.courtId,
        playDate: pendingBooking.playDate,
        startTime: pendingBooking.startTime,
        endTime: pendingBooking.endTime,
        notes: pendingBooking.notes,
      };

      console.log('📝 Creating booking with data:', bookingData);
      const response = await bookingService.createBooking(bookingData);
      console.log('✅ Booking created:', response);

      const depositPaymentData = {
        bookingId: response.bookingId, // Backend trả về bookingId, không phải id
        paymentMethod: paymentMethod,
        notes: `Thanh toán deposit qua ${paymentMethod}`
      };

      if (paymentMethod === 'VNPAY') {
        console.log('🔗 Creating VNPay payment URL with data:', depositPaymentData);
        const { paymentUrl } = await paymentService.createVnPayDepositUrl(depositPaymentData);
        console.log('➡️ Redirecting to VNPay:', paymentUrl);
        window.location.href = paymentUrl;
        return;
      }

      console.log('💳 Paying deposit with data:', depositPaymentData);
      await paymentService.payDeposit(depositPaymentData);
      console.log('✅ Deposit paid successfully');

      setShowPaymentModal(false);
      setPendingBooking(null);

      // Reset states
      setSelectedStartTime("");
      setSelectedEndTime("");
      setAvailabilityResult(null);
      setPriceResult(null);

      // Refresh Data
      fetchAvailableSlotsAndBookings();

      showToast("Thanh toán thành công! Vui lòng check-in đúng giờ.", "success");

      // Redirect to my bookings
      setTimeout(() => {
        navigate("/my-bookings");
      }, 1500);

    } catch (error) {
      console.error("Booking/Payment Error", error);
      console.error("Error response:", error.response?.data);
      const errorMessage =
        error.response?.data?.message ||
        error.response?.data?.error ||
        "Đặt sân hoặc thanh toán thất bại. Vui lòng thử lại.";
      showToast(errorMessage, "error");

      setShowPaymentModal(false);
      setPendingBooking(null);
    } finally {
      setBookingInProgress(false);
    }
  };

  // --- MEMOIZED DATA ---
  const priceGroups = useMemo(() => getGroupedPrices(), [courtPrices, selectedDate]);

  const getDayName = (date) => {
    const days = ["Chủ nhật", "Thứ 2", "Thứ 3", "Thứ 4", "Thứ 5", "Thứ 6", "Thứ 7"];
    return days[date.getDay()];
  };

  const getShortDayName = (date) => {
    const days = ["CN", "T2", "T3", "T4", "T5", "T6", "T7"];
    return days[date.getDay()];
  };

  const getWeekDays = useMemo(() => {
    const days = [];
    const today = new Date();
    for (let i = 0; i < 7; i++) {
      const date = new Date(today);
      date.setDate(today.getDate() + i);
      days.push(date);
    }
    return days;
  }, []);

  // --- RENDER ---
  if (loading) {
    return <CourtDetailSkeleton />;
  }

  if (error || !court) {
    return (
      <div className="min-h-screen bg-[#f9fafb] flex items-center justify-center">
        {error || "Sân không tồn tại"}
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f9fafb] font-sans text-slate-800">
      {/* Header Info */}
      <div className="bg-white border-b border-gray-200 shadow-sm relative z-20">
        <div className="max-w-[1600px] mx-auto px-6">
          <div className="flex items-center gap-2 text-sm py-4">
            <Link to="/" className="text-gray-500 hover:text-blue-600 font-medium">Trang chủ</Link>
            <span className="text-gray-300">›</span>
            <Link to="/courts" className="text-gray-500 hover:text-blue-600 font-medium">TP. Hồ Chí Minh</Link>
            <span className="text-gray-300">›</span>
            <span className="text-gray-900 font-semibold">{court.name}</span>
          </div>

          <div className="py-6 border-t border-gray-100">
            <div className="flex flex-col items-center">
              <h1 className="text-3xl font-black text-gray-900 mb-3 tracking-tight">
                {court.name} - Sân {court.id}
              </h1>
              <div className="flex items-center justify-center gap-6">
                <div className="flex items-center gap-2 bg-yellow-50 px-3 py-1.5 rounded-lg">
                  <span className="material-symbols-outlined text-yellow-500 text-xl">star</span>
                  <span className="font-black text-gray-900">4.8</span>
                  <span className="text-gray-500 text-sm font-medium">(120 đánh giá)</span>
                </div>
                <div className="flex items-center gap-2 text-gray-600">
                  <span className="material-symbols-outlined text-blue-500 text-xl">location_on</span>
                  <span className="font-semibold text-sm">{court.location || "Ground Floor"}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Layout */}
      <div className="px-6 py-8 bg-[#f9fafb]">
        <div className="max-w-[1600px] mx-auto">
          <div className="flex gap-6 items-start relative">

            {/* --- LEFT COLUMN: DATE & PRICE (STICKY) --- */}
            <div className="w-[280px] flex-shrink-0 sticky top-24 h-fit z-10">
              <div className="space-y-6">

                {/* 1. Date Selection */}
                <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
                  <div className="bg-gray-50/80 backdrop-blur-sm border-b border-gray-100 p-4 flex items-center gap-3">
                    <div className="size-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 shadow-sm">
                      <span className="material-symbols-outlined text-lg">calendar_month</span>
                    </div>
                    <h3 className="text-sm font-black text-gray-900 uppercase tracking-wide">Chọn ngày đặt</h3>
                  </div>

                  <div className="p-4">
                    <div className="grid grid-cols-4 gap-2">
                      {getWeekDays.map((date, idx) => {
                        const isActive = formatDateString(date) === formatDateString(selectedDate);
                        const isToday = formatDateString(date) === formatDateString(new Date());
                        const isWeekend = date.getDay() === 0 || date.getDay() === 6;

                        return (
                          <button
                            key={idx}
                            onClick={() => setSelectedDate(date)}
                            className={`relative flex flex-col items-center justify-center h-[60px] rounded-xl transition-all duration-200 border
                                ${isActive
                                ? "bg-blue-600 border-blue-600 text-white shadow-md shadow-blue-200/50 scale-105 z-10"
                                : "bg-white border-gray-100 text-gray-500 hover:bg-blue-50 hover:border-blue-200 hover:text-blue-600"
                              }
                            `}
                          >
                            {isToday && !isActive && (
                              <span className="absolute top-1 right-1 size-1.5 bg-red-500 rounded-full ring-1 ring-white"></span>
                            )}
                            <span className="text-[10px] font-bold uppercase leading-none mb-1 opacity-80">
                              {getShortDayName(date)}
                            </span>
                            <span className={`text-lg font-black leading-none ${!isActive && isWeekend ? "text-red-500" : ""}`}>
                              {date.getDate()}
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  <div className="px-4 py-3 bg-blue-50/50 border-t border-blue-100">
                    <p className="text-xs text-blue-800 text-center">
                      Đang chọn: <span className="font-black">{getDayName(selectedDate)}, {dateToString(selectedDate)}</span>
                    </p>
                  </div>
                </div>

                {/* 2. Detailed Price Table */}
                <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
                  <div className="bg-gray-50/80 backdrop-blur-sm border-b border-gray-100 p-4 flex items-center gap-3">
                    <div className="size-8 rounded-full bg-orange-100 flex items-center justify-center text-orange-600 shadow-sm">
                      <span className="material-symbols-outlined text-lg">payments</span>
                    </div>
                    <h3 className="text-sm font-black text-gray-900 uppercase tracking-wide">
                      Bảng giá {getDayType(selectedDate) === "WEEKEND" ? "Cuối tuần" : "Ngày thường"}
                    </h3>
                  </div>

                  <div className="p-4 space-y-4">
                    {loadingPrices ? (
                      <div className="space-y-4 animate-pulse">
                        {/* Morning skeleton */}
                        <div className="space-y-2">
                          <div className="flex items-center gap-1.5">
                            <div className="w-4 h-4 bg-amber-200 rounded"></div>
                            <div className="h-3 bg-amber-200 rounded w-12"></div>
                          </div>
                          <div className="space-y-1">
                            {[1, 2].map((i) => (
                              <div key={`morning-${i}`} className="flex justify-between items-center text-xs p-2 rounded-lg bg-amber-50 border border-amber-100">
                                <div className="h-3 bg-amber-200 rounded w-24"></div>
                                <div className="h-3 bg-amber-200 rounded w-16"></div>
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* Afternoon skeleton */}
                        <div className="space-y-2">
                          <div className="flex items-center gap-1.5">
                            <div className="w-4 h-4 bg-orange-200 rounded"></div>
                            <div className="h-3 bg-orange-200 rounded w-12"></div>
                          </div>
                          <div className="space-y-1">
                            {[1, 2].map((i) => (
                              <div key={`afternoon-${i}`} className="flex justify-between items-center text-xs p-2 rounded-lg bg-orange-50 border border-orange-100">
                                <div className="h-3 bg-orange-200 rounded w-24"></div>
                                <div className="h-3 bg-orange-200 rounded w-16"></div>
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* Evening skeleton */}
                        <div className="space-y-2">
                          <div className="flex items-center gap-1.5">
                            <div className="w-4 h-4 bg-indigo-200 rounded"></div>
                            <div className="h-3 bg-indigo-200 rounded w-12"></div>
                          </div>
                          <div className="space-y-1">
                            {[1, 2].map((i) => (
                              <div key={`evening-${i}`} className="flex justify-between items-center text-xs p-2 rounded-lg bg-indigo-50 border border-indigo-100">
                                <div className="h-3 bg-indigo-200 rounded w-24"></div>
                                <div className="h-3 bg-indigo-200 rounded w-16"></div>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    ) : courtPrices.length === 0 ? (
                      <div className="text-center py-4 text-xs text-gray-500">Chưa có dữ liệu giá</div>
                    ) : (
                      <>
                        {/* Morning */}
                        {priceGroups.morning.length > 0 && (
                          <div className="space-y-2">
                            <div className="flex items-center gap-1.5 text-amber-700">
                              <span className="text-base">☀️</span>
                              <span className="text-xs font-black uppercase">Sáng</span>
                            </div>
                            <div className="space-y-1">
                              {priceGroups.morning.map((price) => (
                                <div key={price.id} className="flex justify-between items-center text-xs p-2 rounded-lg bg-amber-50 border border-amber-100">
                                  <span className="font-medium text-gray-600">{price.startTime.slice(0, 5)} - {price.endTime.slice(0, 5)}</span>
                                  <span className="font-bold text-amber-700">{price.pricePerHour.toLocaleString("vi-VN")}đ</span>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Afternoon */}
                        {priceGroups.afternoon.length > 0 && (
                          <div className="space-y-2">
                            <div className="flex items-center gap-1.5 text-orange-700">
                              <span className="text-base">🌤️</span>
                              <span className="text-xs font-black uppercase">Chiều</span>
                            </div>
                            <div className="space-y-1">
                              {priceGroups.afternoon.map((price) => (
                                <div key={price.id} className="flex justify-between items-center text-xs p-2 rounded-lg bg-orange-50 border border-orange-100">
                                  <span className="font-medium text-gray-600">{price.startTime.slice(0, 5)} - {price.endTime.slice(0, 5)}</span>
                                  <span className="font-bold text-orange-700">{price.pricePerHour.toLocaleString("vi-VN")}đ</span>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Evening */}
                        {priceGroups.evening.length > 0 && (
                          <div className="space-y-2">
                            <div className="flex items-center gap-1.5 text-indigo-700">
                              <span className="text-base">🌙</span>
                              <span className="text-xs font-black uppercase">Tối</span>
                            </div>
                            <div className="space-y-1">
                              {priceGroups.evening.map((price) => (
                                <div key={price.id} className="flex justify-between items-center text-xs p-2 rounded-lg bg-indigo-50 border border-indigo-100">
                                  <span className="font-medium text-gray-600">{price.startTime.slice(0, 5)} - {price.endTime.slice(0, 5)}</span>
                                  <span className="font-bold text-indigo-700">{price.pricePerHour.toLocaleString("vi-VN")}đ</span>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* --- MIDDLE COLUMN: GALLERY + TIMELINE --- */}
            <div className="flex-1 min-w-0 flex flex-col gap-6">
              {/* Gallery */}
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
                {(() => {
                  const images = (court.images && court.images.length > 0)
                    ? court.images
                    : [court.imageUrl || "https://images.unsplash.com/photo-1626224583764-f87db24ac4ea?w=800"];
                  const currentImage = images[currentImageIndex] || images[0];

                  return (
                    <>
                      <div className="w-full aspect-[16/9] rounded-xl overflow-hidden relative group mb-3 bg-gray-100">
                        <img
                          src={currentImage}
                          className="w-full h-full object-cover transition-transform group-hover:scale-105"
                          alt={`${court.name} - Image ${currentImageIndex + 1}`}
                          onError={(e) => {
                            e.target.src = "https://images.unsplash.com/photo-1626224583764-f87db24ac4ea?w=800";
                          }}
                        />

                        {/* Status Badge */}
                        <div className="absolute top-3 left-3">
                          {court?.status === 'ACTIVE' ? (
                            <span className="bg-green-500 text-white text-xs font-bold px-3 py-1.5 rounded-lg flex items-center gap-1.5 shadow-lg">
                              <span className="size-2 bg-white rounded-full animate-pulse"></span> Đang hoạt động
                            </span>
                          ) : (
                            <span className="bg-red-500 text-white text-xs font-bold px-3 py-1.5 rounded-lg flex items-center gap-1.5 shadow-lg">
                              <span className="material-symbols-outlined text-[14px]">block</span> Tạm ngưng
                            </span>
                          )}
                        </div>

                        {/* Navigation Arrows (only if multiple images) */}
                        {images.length > 1 && (
                          <>
                            <button
                              onClick={() => setCurrentImageIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1))}
                              className="absolute left-3 top-1/2 -translate-y-1/2 size-10 bg-white/90 hover:bg-white rounded-full flex items-center justify-center shadow-lg opacity-0 group-hover:opacity-100 transition-opacity"
                            >
                              <span className="material-symbols-outlined text-gray-800">chevron_left</span>
                            </button>
                            <button
                              onClick={() => setCurrentImageIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1))}
                              className="absolute right-3 top-1/2 -translate-y-1/2 size-10 bg-white/90 hover:bg-white rounded-full flex items-center justify-center shadow-lg opacity-0 group-hover:opacity-100 transition-opacity"
                            >
                              <span className="material-symbols-outlined text-gray-800">chevron_right</span>
                            </button>

                            {/* Image Counter */}
                            <div className="absolute bottom-3 right-3 bg-black/60 text-white text-xs font-bold px-2 py-1 rounded-lg">
                              {currentImageIndex + 1} / {images.length}
                            </div>
                          </>
                        )}
                      </div>

                      {/* Thumbnails */}
                      {images.length > 1 && (
                        <div className="grid grid-cols-5 gap-2">
                          {images.slice(0, 5).map((img, idx) => (
                            <div
                              key={idx}
                              onClick={() => setCurrentImageIndex(idx)}
                              className={`aspect-square rounded-lg overflow-hidden border-2 cursor-pointer transition-all ${idx === currentImageIndex
                                ? "border-blue-500 ring-2 ring-blue-200"
                                : "border-gray-200 hover:border-blue-300"
                                }`}
                            >
                              <img
                                src={img}
                                className="w-full h-full object-cover"
                                alt={`Thumbnail ${idx + 1}`}
                                onError={(e) => {
                                  e.target.src = "https://images.unsplash.com/photo-1626224583764-f87db24ac4ea?w=200";
                                }}
                              />
                            </div>
                          ))}
                          {images.length > 5 && (
                            <div className="aspect-square rounded-lg overflow-hidden border border-gray-200 bg-gray-100 flex items-center justify-center cursor-pointer hover:bg-gray-200">
                              <span className="text-xs font-bold text-gray-500">+{images.length - 5}</span>
                            </div>
                          )}
                        </div>
                      )}
                    </>
                  );
                })()}
              </div>

              {/* Court Information */}
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
                <h3 className="text-base font-black text-gray-900 mb-4">Thông tin sân</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-xl">
                    <div className="size-10 bg-blue-100 rounded-lg flex items-center justify-center">
                      <span className="material-symbols-outlined text-blue-600">category</span>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 font-medium">Loại sân</p>
                      <p className="text-sm font-bold text-gray-900">{court.type || 'N/A'}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 p-3 bg-green-50 rounded-xl">
                    <div className="size-10 bg-green-100 rounded-lg flex items-center justify-center">
                      <span className="material-symbols-outlined text-green-600">group</span>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 font-medium">Sức chứa</p>
                      <p className="text-sm font-bold text-gray-900">{court.capacity || 'N/A'} người</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 p-3 bg-orange-50 rounded-xl">
                    <div className="size-10 bg-orange-100 rounded-lg flex items-center justify-center">
                      <span className="material-symbols-outlined text-orange-600">schedule</span>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 font-medium">Giờ mở cửa</p>
                      <p className="text-sm font-bold text-gray-900">{court.openTime || '06:00'} - {court.closeTime || '22:00'}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 p-3 bg-purple-50 rounded-xl">
                    <div className="size-10 bg-purple-100 rounded-lg flex items-center justify-center">
                      <span className="material-symbols-outlined text-purple-600">payments</span>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 font-medium">Giá</p>
                      <p className="text-sm font-bold text-gray-900">
                        {court.minPricePerHour?.toLocaleString('vi-VN') || 'N/A'}đ - {court.maxPricePerHour?.toLocaleString('vi-VN') || 'N/A'}đ
                      </p>
                    </div>
                  </div>
                </div>

                {court.description && (
                  <div className="mt-4 p-4 bg-gray-50 rounded-xl">
                    <p className="text-xs font-bold text-gray-500 uppercase mb-2">Mô tả</p>
                    <p className="text-sm text-gray-700 leading-relaxed">{court.description}</p>
                  </div>
                )}
              </div>

              {/* Timeline with Integrated Booking */}
              <div ref={timelineRef}>
                {loadingSlots ? (
                  <TimelineSkeleton />
                ) : (
                  <CourtAvailability
                    availableSlots={availableSlots}
                    openTime={court?.openTime}
                    closeTime={court?.closeTime}
                    selectedDate={formatDateString(selectedDate)}
                    // Booking props
                    selectedStartTime={selectedStartTime}
                    selectedEndTime={selectedEndTime}
                    onStartTimeChange={setSelectedStartTime}
                    onEndTimeChange={setSelectedEndTime}
                    onCheckAvailability={handleCheckAvailability}
                    checkingAvailability={checkingAvailability}
                    availabilityResult={availabilityResult}
                    priceResult={priceResult}
                    onBooking={handleBooking}
                    bookingInProgress={bookingInProgress}
                    courtStatus={court?.status}
                  />
                )}
              </div>

              {/* Time Picker - Now integrated into CourtAvailability above */}
              {/* <TimePickerBooking
                selectedStartTime={selectedStartTime}
                selectedEndTime={selectedEndTime}
                onStartTimeChange={setSelectedStartTime}
                onEndTimeChange={setSelectedEndTime}
                onCheckAvailability={handleCheckAvailability}
                checkingAvailability={checkingAvailability}
                availabilityResult={availabilityResult}
                priceResult={priceResult}
                openTime={court?.openTime}
                closeTime={court?.closeTime}
              /> */}

              {/* Amenities */}
              <div ref={amenitiesRef} className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
                <h3 className="text-base font-black text-gray-900 mb-6">Tiện ích đi kèm</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {[
                    { icon: "p", label: "Gửi xe miễn phí" },
                    { icon: "wifi", label: "Wifi miễn phí" },
                    { icon: "shower", label: "Phòng tắm" },
                    { icon: "sports_tennis", label: "Cho thuê vợt" },
                  ].map((item, idx) => (
                    <div key={idx} className="flex items-center gap-3">
                      <div className="size-10 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600">
                        {item.icon === "p" ? <span className="font-black text-xl">P</span> : <span className="material-symbols-outlined text-xl">{item.icon}</span>}
                      </div>
                      <span className="text-xs font-bold text-gray-700">{item.label}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* --- RIGHT COLUMN: BOOKING SIDEBAR (STICKY) --- */}
            <div className="w-[320px] flex-shrink-0 sticky top-24 h-fit z-10">
              <div className="bg-white rounded-2xl border border-gray-100 shadow-xl shadow-gray-200/50 overflow-hidden">
                {/* Header */}
                <div className="bg-gray-50/80 backdrop-blur-sm border-b border-gray-100 p-4 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="size-8 rounded-full bg-blue-600 flex items-center justify-center text-white shadow-md shadow-blue-200">
                      <span className="material-symbols-outlined text-lg">shopping_cart</span>
                    </div>
                    <h2 className="text-sm font-black text-gray-900 uppercase tracking-wide">Thông tin đặt sân</h2>
                  </div>
                  <span className="bg-blue-50 text-blue-600 text-[10px] font-bold px-2 py-1 rounded-lg border border-blue-100">Bước 1/3</span>
                </div>

                <div className="p-6">
                  <div className="space-y-4 mb-6">
                    <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl border border-gray-100">
                      <div className="size-10 bg-white rounded-lg border border-gray-100 flex items-center justify-center shadow-sm">
                        <span className="material-symbols-outlined text-blue-600">event</span>
                      </div>
                      <div className="flex-1">
                        <p className="text-[10px] font-bold text-gray-400 uppercase">Ngày đặt</p>
                        <p className="text-sm font-black text-gray-900">{getDayName(selectedDate)}, {dateToString(selectedDate)}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl border border-gray-100">
                      <div className="size-10 bg-white rounded-lg border border-gray-100 flex items-center justify-center shadow-sm">
                        <span className="material-symbols-outlined text-green-600">schedule</span>
                      </div>
                      <div className="flex-1">
                        <p className="text-[10px] font-bold text-gray-400 uppercase">Giờ đã chọn</p>
                        {selectedStartTime && selectedEndTime ? (
                          <div className="flex items-center gap-2">
                            <p className="text-sm font-black text-gray-900">{selectedStartTime} - {selectedEndTime}</p>
                            <span className="text-xs bg-green-100 text-green-600 font-bold px-1.5 py-0.5 rounded">
                              {calculateDuration(selectedStartTime, selectedEndTime)} phút
                            </span>
                          </div>
                        ) : (
                          <p className="text-sm text-gray-400 italic">Chưa chọn giờ</p>
                        )}
                      </div>
                    </div>

                    {availabilityResult && (
                      <div className={`flex items-start gap-3 p-3 rounded-xl border ${!availabilityResult.available ? "bg-red-50 border-red-200" :
                        availabilityResult.softBlocked ? "bg-amber-50 border-amber-200" :
                          "bg-green-50 border-green-200"
                        }`}>
                        <span className={`material-symbols-outlined text-lg mt-0.5 ${!availabilityResult.available ? "text-red-600" :
                          availabilityResult.softBlocked ? "text-amber-600" :
                            "text-green-600"
                          }`}>
                          {!availabilityResult.available ? "cancel" :
                            availabilityResult.softBlocked ? "warning" : "check_circle"}
                        </span>
                        <div className="flex flex-col">
                          <span className={`text-xs font-bold ${!availabilityResult.available ? "text-red-700" :
                            availabilityResult.softBlocked ? "text-amber-700" :
                              "text-green-700"
                            }`}>
                            {!availabilityResult.available ? (availabilityResult.message || "Đã kín") :
                              availabilityResult.softBlocked ? "Có thể đặt (Lưu ý)" : "Còn trống!"}
                          </span>
                          {availabilityResult.available && availabilityResult.softBlocked && (
                            <span className="text-[10px] text-amber-600 leading-tight mt-1 font-medium">
                              {availabilityResult.softBlockWarning || "Khung giờ có thể bị ảnh hưởng bởi khách đang chơi."}
                            </span>
                          )}
                        </div>
                      </div>
                    )}
                  </div>

                  {priceResult && (
                    <div className="border-t border-dashed border-gray-200 pt-4 mb-4">
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-sm font-bold text-gray-900">Tổng cộng</span>
                        <span className="text-xl font-black text-blue-600">{(priceResult.totalPrice).toLocaleString()}đ</span>
                      </div>
                    </div>
                  )}

                  <button
                    disabled={!availabilityResult?.available || bookingInProgress}
                    onClick={handleBooking}
                    className={`w-full h-12 rounded-xl flex items-center justify-center gap-2 text-sm font-black transition-all shadow-lg ${availabilityResult?.available && !bookingInProgress
                      ? "bg-gradient-to-r from-blue-600 to-blue-700 text-white hover:from-blue-700 hover:to-blue-800 shadow-blue-200 transform active:scale-95"
                      : "bg-gray-100 text-gray-400 cursor-not-allowed shadow-none"
                      }`}
                  >
                    {bookingInProgress ? (
                      <><span className="animate-spin material-symbols-outlined text-lg">progress_activity</span> Đang xử lý...</>
                    ) : (
                      <><span className="material-symbols-outlined text-lg">payment</span> Thanh toán để đặt sân</>
                    )}
                  </button>


                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        .scrollbar-hide::-webkit-scrollbar { display: none; }
        .scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>

      {/* Payment Modal */}
      <PaymentModal
        isOpen={showPaymentModal}
        booking={pendingBooking}
        onClose={() => {
          setShowPaymentModal(false);
          setPendingBooking(null);
        }}
        onSuccess={handlePaymentSuccess}
      />

      <LoginRequiredModal
        isOpen={showLoginModal}
        onClose={() => setShowLoginModal(false)}
        onLogin={() => navigate('/login', { state: { from: location.pathname } })}
        message="Vui lòng đăng nhập để tiếp tục đặt sân."
      />

      {/* Toast */}
      {toast.show && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast({ show: false, message: "", type: "" })}
        />
      )}
    </div>
  );
};

// Helper
const dateToString = (date) => {
  return `${date.getDate()}/${date.getMonth() + 1}/${date.getFullYear()}`;
};

export default CourtDetails;
