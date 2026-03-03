import React, { useState, useEffect } from 'react';
import { Calendar, RefreshCw, Search, CheckCircle } from 'lucide-react';
import { myBookingService } from '../../services/myBookingService';
import paymentService from '../../services/paymentService';
import BookingCard from '../../components/customer/BookingCard';
import CancelBookingModal from '../../components/customer/CancelBookingModal';
import BookingCardSkeleton from '../../components/common/BookingCardSkeleton';
import CheckInCountdown from '../../components/customer/CheckInCountdown';
import AlertModal from '../../components/common/AlertModal';

const MyBookings = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState('');

  // Alert modal
  const [alertConfig, setAlertConfig] = useState({
    isOpen: false,
    type: 'info',
    title: '',
    message: ''
  });

  // Cancel modal
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [cancelLoading, setCancelLoading] = useState(false);

  // Date filters - Mặc định không filter theo ngày
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');

  // Status filter
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [paymentFilter, setPaymentFilter] = useState('ALL');

  useEffect(() => {
    fetchBookings();
  }, []);

  const fetchBookings = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await myBookingService.getMyBookings(
        fromDate || null,
        toDate || null,
        statusFilter,
        paymentFilter
      );
      setBookings(data);
    } catch (err) {
      setError(err.response?.data?.message || 'Không thể tải danh sách đặt sân');
      console.error('Error fetching bookings:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = () => {
    fetchBookings();
  };

  const handleQuickDate = (days) => {
    const from = new Date();
    const to = new Date();

    if (days === 0) {
      // Hôm nay
      setFromDate(from.toISOString().split('T')[0]);
      setToDate(from.toISOString().split('T')[0]);
    } else if (days > 0) {
      // X ngày tới
      to.setDate(to.getDate() + days);
      setFromDate(from.toISOString().split('T')[0]);
      setToDate(to.toISOString().split('T')[0]);
    } else {
      // X ngày trước
      from.setDate(from.getDate() + days);
      setFromDate(from.toISOString().split('T')[0]);
      setToDate(new Date().toISOString().split('T')[0]);
    }
  };

  const handleClearFilters = () => {
    setFromDate('');
    setToDate('');
    setStatusFilter('ALL');
    setPaymentFilter('ALL');
  };

  const handleCancelClick = (booking) => {
    setSelectedBooking(booking);
    setShowCancelModal(true);
  };


  const handleCancelConfirm = async (reason) => {
    setCancelLoading(true);
    setError(null);

    try {
      await myBookingService.cancelBooking(selectedBooking.bookingId, reason);

      // Show success message
      setSuccessMessage(`Đã hủy booking #${selectedBooking.bookingId} thành công`);
      setTimeout(() => setSuccessMessage(''), 5000);

      // Close modal
      setShowCancelModal(false);
      setSelectedBooking(null);

      // Refresh bookings
      fetchBookings();
    } catch (err) {
      setError(err.response?.data?.message || 'Không thể hủy booking. Vui lòng thử lại.');
      console.error('Error cancelling booking:', err);
    } finally {
      setCancelLoading(false);
    }
  };

  const handleCancelClose = () => {
    setShowCancelModal(false);
    setSelectedBooking(null);
  };

  const handleCheckIn = async (booking) => {
    try {
      setError(null);
      const { paymentUrl } = await paymentService.createVnPayRemainingUrl(booking.bookingId);
      window.location.href = paymentUrl;
    } catch (err) {
      console.error('Error creating VNPay remaining payment URL:', err);
      setError(
        err.response?.data?.message ||
        err.response?.data?.error ||
        'Không thể tạo URL thanh toán VNPay cho phần còn lại. Vui lòng thử lại.'
      );
    }
  };

  // Filter bookings client-side không cần nữa vì API đã filter
  const filteredBookings = bookings;

  // Group bookings by date
  const groupedBookings = filteredBookings.reduce((groups, booking) => {
    const date = booking.playDate;
    if (!groups[date]) {
      groups[date] = [];
    }
    groups[date].push(booking);
    return groups;
  }, {});

  const formatDateHeader = (dateString) => {
    return new Date(dateString).toLocaleDateString('vi-VN', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const calculateTotalAmount = () => {
    return filteredBookings
      .filter((b) => b.status === 'COMPLETED')
      .reduce((sum, booking) => sum + booking.totalPrice, 0);
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(amount);
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Lịch sử đặt sân</h1>
          <p className="text-gray-600">Xem và quản lý các lần đặt sân của bạn</p>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          {/* Date Range */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Từ ngày
              </label>
              <input
                type="date"
                value={fromDate}
                onChange={(e) => setFromDate(e.target.value)}
                className="w-full px-3 py-2 bg-white border-2 border-gray-300 rounded-lg text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Đến ngày
              </label>
              <input
                type="date"
                value={toDate}
                onChange={(e) => setToDate(e.target.value)}
                className="w-full px-3 py-2 bg-white border-2 border-gray-300 rounded-lg text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Trạng thái
              </label>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full px-3 py-2 bg-white border-2 border-gray-300 rounded-lg text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors appearance-none cursor-pointer"
              >
                <option value="ALL">Tất cả</option>
                <option value="PENDING">Chờ xác nhận</option>
                <option value="CONFIRMED">Đã xác nhận</option>
                <option value="PLAYING">Đang chơi</option>
                <option value="COMPLETED">Hoàn thành</option>
                <option value="CANCELLED">Đã hủy</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Thanh toán
              </label>
              <select
                value={paymentFilter}
                onChange={(e) => setPaymentFilter(e.target.value)}
                className="w-full px-3 py-2 bg-white border-2 border-gray-300 rounded-lg text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors appearance-none cursor-pointer"
              >
                <option value="ALL">Tất cả</option>
                <option value="UNPAID">Chưa thanh toán</option>
                <option value="PAID">Đã thanh toán</option>
                <option value="REFUNDED">Đã hoàn tiền</option>
              </select>
            </div>
          </div>

          {/* Quick Date Buttons */}
          <div className="flex flex-wrap gap-2 mb-4">
            <button
              onClick={() => handleQuickDate(0)}
              className="px-4 py-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors text-sm font-medium"
            >
              Hôm nay
            </button>
            <button
              onClick={() => handleQuickDate(7)}
              className="px-4 py-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors text-sm font-medium"
            >
              7 ngày tới
            </button>
            <button
              onClick={() => handleQuickDate(30)}
              className="px-4 py-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors text-sm font-medium"
            >
              30 ngày tới
            </button>
            <button
              onClick={() => handleQuickDate(-7)}
              className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors text-sm font-medium"
            >
              7 ngày trước
            </button>
            <button
              onClick={() => handleQuickDate(-30)}
              className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors text-sm font-medium"
            >
              30 ngày trước
            </button>
            <button
              onClick={handleClearFilters}
              className="px-4 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors text-sm font-medium"
            >
              Xóa bộ lọc
            </button>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3">
            <button
              onClick={handleSearch}
              disabled={loading}
              className="flex items-center gap-2 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium"
            >
              <Search className="w-4 h-4" />
              Tìm kiếm
            </button>
            <button
              onClick={fetchBookings}
              disabled={loading}
              className="flex items-center gap-2 px-6 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
              Làm mới
            </button>
          </div>
        </div>

        {/* Summary Stats */}
        {!loading && filteredBookings.length > 0 && (() => {
          const completedBookings = filteredBookings.filter((b) => b.status === 'COMPLETED');
          return (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <div className="bg-white rounded-lg shadow-md p-4">
                <p className="text-sm text-gray-600 mb-1">Tổng số lượt đặt (hoàn thành)</p>
                <p className="text-2xl font-bold text-gray-900">{completedBookings.length}</p>
              </div>
              <div className="bg-white rounded-lg shadow-md p-4">
                <p className="text-sm text-gray-600 mb-1">Tổng thời gian</p>
                <p className="text-2xl font-bold text-gray-900">
                  {completedBookings.reduce((sum, b) => sum + b.durationMinutes, 0)} phút
                </p>
              </div>
              <div className="bg-white rounded-lg shadow-md p-4">
                <p className="text-sm text-gray-600 mb-1">Tổng chi phí</p>
                <p className="text-2xl font-bold text-blue-600">
                  {formatCurrency(calculateTotalAmount())}
                </p>
              </div>
            </div>
          );
        })()}

        {/* Loading State */}
        {loading && (
          <div className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <BookingCardSkeleton key={i} />
              ))}
            </div>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6 flex items-center justify-between">
            <p className="text-red-800">{error}</p>
            <button
              onClick={() => setError(null)}
              className="text-red-600 hover:text-red-800 font-medium"
            >
              Đóng
            </button>
          </div>
        )}

        {/* Success Message */}
        {successMessage && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6 flex items-center gap-3">
            <CheckCircle className="w-5 h-5 text-green-600" />
            <p className="text-green-800 flex-1">{successMessage}</p>
            <button
              onClick={() => setSuccessMessage('')}
              className="text-green-600 hover:text-green-800 font-medium"
            >
              Đóng
            </button>
          </div>
        )}

        {/* Bookings List */}
        {!loading && !error && (
          <>
            {filteredBookings.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 px-4">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                  <Calendar className="w-8 h-8 text-gray-400" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Không có lịch đặt sân</h3>
                <p className="text-sm text-gray-600 text-center">Bạn chưa có lịch đặt sân nào trong khoảng thời gian này</p>
              </div>
            ) : (
              <div className="space-y-8">
                {Object.entries(groupedBookings).map(([date, dateBookings]) => (
                  <div key={date}>
                    <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                      <Calendar className="w-5 h-5 text-blue-600" />
                      {formatDateHeader(date)}
                      <span className="text-sm font-normal text-gray-500">
                        ({dateBookings.length} lượt đặt)
                      </span>
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {dateBookings.map((booking) => (
                        <BookingCard
                          key={booking.bookingId}
                          booking={booking}
                          onCancel={handleCancelClick}
                          onCheckIn={handleCheckIn}
                        />
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </div>

      {/* Cancel Modal */}
      {showCancelModal && selectedBooking && (
        <CancelBookingModal
          booking={selectedBooking}
          onClose={handleCancelClose}
          onConfirm={handleCancelConfirm}
          loading={cancelLoading}
        />
      )}
    </div>
  );
};

export default MyBookings;
