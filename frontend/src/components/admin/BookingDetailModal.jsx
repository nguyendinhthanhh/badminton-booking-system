import React, { useEffect } from 'react';
import { X, Calendar, Clock, User, Phone, CreditCard, MapPin, CheckCircle, XCircle, PlayCircle, Flag, Trash2 } from 'lucide-react';

const BookingDetailModal = ({ booking, courts = [], onClose, onUpdateStatus, onExtend, loading }) => {
  if (!booking) return null;

  // Debug: Log booking data để check deposit fields
  console.log('BookingDetailModal - Booking data:', {
    bookingId: booking.bookingId,
    totalPrice: booking.totalPrice,
    depositAmount: booking.depositAmount,
    depositPaid: booking.depositPaid,
    remainingAmount: booking.remainingAmount,
    depositRequired: booking.depositRequired,
    checkInDeadline: booking.checkInDeadline,
    status: booking.status
  });

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(amount);
  };

  const formatTimeObject = (time) => {
    if (!time) return '';
    if (typeof time === 'string') return time.substring(0, 5);
    if (typeof time === 'object' && time.hour !== undefined) {
      return `${String(time.hour).padStart(2, '0')}:${String(time.minute).padStart(2, '0')}`;
    }
    return '';
  };

  const formatDate = (dateString) => {
    if (!dateString) return "";
    return new Date(dateString).toLocaleDateString('vi-VN', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
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

  const getStatusColor = (status) => {
    const colors = {
      PENDING: 'bg-yellow-100 text-yellow-800',
      CONFIRMED: 'bg-blue-100 text-blue-800',
      PLAYING: 'bg-purple-100 text-purple-800',
      COMPLETED: 'bg-green-100 text-green-800',
      CANCELLED: 'bg-red-100 text-red-800'
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  const getPaymentStatusColor = (status) => {
    const colors = {
      PAID: 'bg-green-100 text-green-800',
      UNPAID: 'bg-red-100 text-red-800',
      REFUNDED: 'bg-gray-100 text-gray-800'
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  const getBookingTypeBadge = (type) => {
    if (type === 'WALK_IN') {
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-purple-500/20 text-white border border-white/20 text-[10px] font-bold uppercase tracking-wider">
          <span className="material-symbols-outlined text-[14px]">storefront</span>
          Tại quầy
        </span>
      );
    }
    // Default to Online
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-sky-500/20 text-white border border-white/20 text-[10px] font-bold uppercase tracking-wider">
        <span className="material-symbols-outlined text-[14px]">public</span>
        Online
      </span>
    );
  };

  return (
    <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-3xl w-full max-h-[90vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white px-6 py-4 flex items-center justify-between shrink-0">
          <div>
            <h2 className="text-xl font-black tracking-tight">Chi tiết Đặt sân</h2>
            <div className="flex items-center gap-2 mt-0.5">
              <p className="text-blue-100 text-[10px] font-bold uppercase tracking-widest">Mã Booking: #{booking.bookingId}</p>
              {getBookingTypeBadge(booking.bookingType)}
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="text-white hover:bg-white/20 rounded-lg p-2 transition-colors border border-transparent hover:border-white/10"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar">
          <div className="space-y-6">
            {/* Status Badges */}
            <div className="flex gap-3">
              <span className={`px-4 py-2 rounded-lg font-bold text-xs uppercase tracking-widest ${getStatusColor(booking.status)}`}>
                {booking.status === 'PENDING' ? 'Chờ xác nhận' :
                  booking.status === 'CONFIRMED' ? 'Đã xác nhận' :
                    booking.status === 'PLAYING' ? 'Đang chơi' :
                      booking.status === 'COMPLETED' ? 'Hoàn thành' :
                        booking.status === 'CANCELLED' ? 'Đã hủy' : booking.status}
              </span>
              <span className={`px-4 py-2 rounded-lg font-bold text-xs uppercase tracking-widest ${getPaymentStatusColor(booking.paymentStatus)}`}>
                {booking.paymentStatus === 'PAID' ? 'Đã thanh toán' :
                  booking.paymentStatus === 'UNPAID' ? 'Chưa thanh toán' :
                    booking.paymentStatus === 'REFUNDED' ? 'Đã hoàn tiền' : booking.paymentStatus}
              </span>
            </div>

            {/* Court Info */}
            <div className="bg-blue-50 rounded-2xl p-4 border border-blue-100">
              <div className="flex items-center gap-2 mb-3">
                <MapPin className="w-5 h-5 text-blue-600" />
                <h3 className="font-black text-slate-900">Thông tin sân</h3>
              </div>
              <div className="flex gap-4">
                {/* Image Preview */}
                <div className="w-24 h-24 rounded-xl overflow-hidden border-2 border-white shadow-sm flex-shrink-0 bg-white">
                  {booking.courtImage ? (
                    <img
                      src={booking.courtImage}
                      alt={booking.courtName}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = 'https://placehold.co/200x200?text=Sân';
                      }}
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-blue-200">
                      <span className="material-symbols-outlined text-4xl">stadium</span>
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-1 flex-1 gap-2 text-sm justify-center py-1">
                  <div className="flex justify-between items-center">
                    <span className="text-slate-500 font-bold text-[10px] uppercase">Sân chơi:</span>
                    <span className="font-black text-slate-900 text-base">{booking.courtName}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-slate-500 font-bold text-[10px] uppercase">Loại hình:</span>
                    <span className="px-2 py-0.5 rounded-lg bg-blue-100 text-blue-700 font-black text-[10px] uppercase tracking-wider">
                      {booking.courtType === 'DOUBLE' ? 'Sân đôi' :
                        booking.courtType === 'SINGLE' ? 'Sân đơn' :
                          booking.courtType === 'VIP' ? 'Sân VIP' : booking.courtType}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Customer Info */}
            <div className="bg-emerald-50 rounded-2xl p-4 border border-emerald-100">
              <div className="flex items-center gap-2 mb-3">
                <User className="w-5 h-5 text-emerald-600" />
                <h3 className="font-black text-slate-900">Thông tin khách hàng</h3>
              </div>
              <div className="grid grid-cols-2 gap-6 text-sm">
                <div>
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1">Họ tên khách</label>
                  <span className="font-black text-slate-900">{booking.customerName}</span>
                </div>
                <div>
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1">Số điện thoại</label>
                  <div className="flex items-center gap-2 font-black text-slate-900">
                    <Phone className="w-3.5 h-3.5 text-emerald-600" />
                    {booking.customerPhone}
                  </div>
                </div>
              </div>
            </div>

            {/* Booking Time */}
            <div className="bg-purple-50 rounded-2xl p-4 border border-purple-100">
              <div className="flex items-center gap-2 mb-3">
                <Calendar className="w-5 h-5 text-purple-600" />
                <h3 className="font-black text-slate-900">Thời gian đặt sân</h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div>
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1">Ngày thi đấu</label>
                  <span className="font-black text-slate-900">{formatDate(booking.playDate)}</span>
                </div>
                <div>
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1">Khung giờ</label>
                  <div className="flex items-center gap-2 font-black text-slate-900">
                    <Clock className="w-3.5 h-3.5 text-purple-600" />
                    {booking.startTime && booking.endTime
                      ? `${formatTimeObject(booking.startTime)} - ${formatTimeObject(booking.actualEndTime || booking.endTime)}`
                      : booking.openEnded
                        ? 'Chưa kết thúc (Đang chơi)'
                        : 'Chưa xác định'}

                    {booking.durationMinutes > 0 && (
                      <span className="text-purple-600 ml-1 font-black text-[10px]">({booking.durationMinutes} phút)</span>
                    )}
                  </div>
                </div>
                <div className="md:col-span-2 pt-2 border-t border-purple-100/50 mt-1 flex flex-col gap-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1">Dòng thời gian sự kiện</label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-2">
                    {booking.createdAt && (
                      <div className="flex justify-between text-[11px] text-slate-500 bg-slate-100/50 rounded-lg px-3 py-1.5 border border-slate-100">
                        <span className="font-bold">Đã tạo đơn:</span>
                        <span className="font-black">{formatDateWithTime(booking.createdAt)}</span>
                      </div>
                    )}
                    {booking.confirmedAt && (
                      <div className="flex justify-between text-[11px] text-blue-600 bg-blue-100/50 rounded-lg px-3 py-1.5 border border-blue-100">
                        <span className="font-bold">Đã xác nhận:</span>
                        <span className="font-black">{formatDateWithTime(booking.confirmedAt)}</span>
                      </div>
                    )}
                    {booking.checkedInAt && (
                      <div className="flex justify-between text-[11px] text-purple-600 bg-purple-100/50 rounded-lg px-3 py-1.5 border border-purple-100">
                        <span className="font-bold">Đã check-in:</span>
                        <span className="font-black">{formatDateWithTime(booking.checkedInAt)}</span>
                      </div>
                    )}
                    {booking.completedAt && (
                      <div className="flex justify-between text-[11px] text-emerald-600 bg-emerald-100/50 rounded-lg px-3 py-1.5 border border-emerald-100">
                        <span className="font-bold">Đã check-out:</span>
                        <span className="font-black">{formatDateWithTime(booking.completedAt)}</span>
                      </div>
                    )}
                    {booking.cancelledAt && (
                      <div className="flex flex-col text-[11px] text-rose-600 bg-rose-100/50 rounded-lg px-3 py-1.5 border border-rose-100 col-span-full">
                        <div className="flex justify-between">
                          <span className="font-bold">Đã hủy đơn:</span>
                          <span className="font-black">{formatDateWithTime(booking.cancelledAt)}</span>
                        </div>
                        {booking.cancelledBy && (
                          <div className="flex justify-between mt-1 pt-1 border-t border-rose-200/50">
                            <span className="font-bold">Người thực hiện hủy:</span>
                            <span className="font-black">{booking.cancelledBy}</span>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Price Breakdown */}
            {booking.priceBreakdown && booking.priceBreakdown.length > 0 && (
              <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200 shadow-inner">
                <div className="flex items-center justify-between gap-2 mb-4">
                  <div className="flex items-center gap-2">
                    <CreditCard className="w-5 h-5 text-slate-600" />
                    <h3 className="font-black text-slate-900 leading-none">Chi tiết bảng giá</h3>
                  </div>
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{booking.priceBreakdown.length} Slot</span>
                </div>
                <div className="space-y-2">
                  {booking.priceBreakdown.map((period, index) => (
                    <div key={index} className="flex justify-between items-center bg-white px-4 py-2.5 rounded-xl border border-slate-100 shadow-sm">
                      <div className="flex flex-col">
                        <span className="text-slate-900 font-black text-xs leading-none">
                          {formatTimeObject(period.periodStart)} - {formatTimeObject(period.periodEnd)}
                        </span>
                        <span className="text-[9px] font-black text-slate-400 uppercase tracking-tighter mt-1">
                          {period.dayType === 'WEEKDAY' ? 'Ngày thường' : 'Cuối tuần'}
                        </span>
                      </div>
                      <span className="font-black text-slate-900">
                        {formatCurrency(period.subtotal)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Overtime & Extensions Summary */}
            {(booking.overtimeMinutes > 0 || (booking.extensions && booking.extensions.length > 0)) && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {booking.overtimeMinutes > 0 && (
                  <div className="bg-orange-50 rounded-2xl p-4 border border-orange-100">
                    <p className="text-[10px] font-black text-orange-400 uppercase tracking-widest mb-1 leading-none">Phụ phí Overtime</p>
                    <div className="flex justify-between items-end">
                      <span className="text-sm font-black text-slate-900">{booking.overtimeMinutes} phút</span>
                      <span className="text-lg font-black text-orange-600">{formatCurrency(booking.overtimeFee)}</span>
                    </div>
                  </div>
                )}
                {booking.extensions && booking.extensions.length > 0 && (
                  <div className="bg-indigo-50 rounded-2xl p-4 border border-indigo-100">
                    <p className="text-[10px] font-black text-indigo-400 uppercase tracking-widest mb-1 leading-none">Tổng phí Gia hạn</p>
                    <div className="flex justify-between items-end">
                      <span className="text-sm font-black text-slate-900">+{booking.extensions.reduce((sum, e) => sum + e.extensionMinutes, 0)} phút</span>
                      <span className="text-lg font-black text-indigo-600">{formatCurrency(booking.extensions.reduce((sum, e) => sum + e.extensionFee, 0))}</span>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Notes */}
            {(booking.notes || booking.adminNote) && (
              <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200 border-dashed">
                <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 flex items-center gap-1.5">
                  <Flag className="w-3.5 h-3.5" />
                  Ghi chú / Lý do hủy
                </h3>
                <p className="text-sm text-slate-700 font-medium italic whitespace-pre-wrap leading-relaxed">"{booking.notes || booking.adminNote}"</p>
              </div>
            )}

            {/* Deposit Information - ALWAYS SHOW for debugging */}
            {true && (
              <div className="bg-gradient-to-br from-purple-50 to-blue-50 rounded-xl p-5 border border-purple-200">
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
                      {formatCurrency(booking.totalPrice)}
                    </span>
                  </div>

                  <div className="h-px bg-gradient-to-r from-transparent via-purple-200 to-transparent"></div>

                  {booking.depositAmount && (
                    <div className="flex justify-between items-center bg-purple-50 rounded-lg p-3 border border-purple-300">
                      <div className="flex items-center gap-2">
                        <span className="material-symbols-outlined text-purple-600 text-lg">info</span>
                        <span className="text-sm font-semibold text-purple-700">Số tiền cọc yêu cầu (1/3):</span>
                      </div>
                      <span className="text-lg font-bold text-purple-600">
                        {formatCurrency(booking.depositAmount)}
                      </span>
                    </div>
                  )}

                  {booking.depositPaid !== undefined && booking.depositPaid !== null && (
                    <div className="flex justify-between items-center bg-white rounded-lg p-3 border border-purple-200">
                      <div className="flex items-center gap-2">
                        <span className="material-symbols-outlined text-green-600 text-lg">account_balance_wallet</span>
                        <span className="text-sm font-semibold text-green-700">Đã thanh toán cọc:</span>
                      </div>
                      <span className="text-lg font-bold text-green-600">
                        {formatCurrency(booking.depositPaid)}
                      </span>
                    </div>
                  )}

                  {booking.remainingAmount !== undefined && booking.remainingAmount !== null && (
                    <div className={`flex justify-between items-center rounded-lg p-3 border ${booking.remainingAmount > 0
                      ? 'bg-amber-50 border-amber-200'
                      : 'bg-green-50 border-green-200'
                      }`}>
                      <div className="flex items-center gap-2">
                        <span className={`material-symbols-outlined text-lg ${booking.remainingAmount > 0 ? 'text-amber-600' : 'text-green-600'
                          }`}>
                          {booking.remainingAmount > 0 ? 'pending_actions' : 'check_circle'}
                        </span>
                        <span className={`text-sm font-semibold ${booking.remainingAmount > 0 ? 'text-amber-700' : 'text-green-700'
                          }`}>
                          {booking.remainingAmount > 0 ? 'Còn phải trả:' : 'Đã thanh toán đầy đủ'}
                        </span>
                      </div>
                      <span className={`text-lg font-bold ${booking.remainingAmount > 0 ? 'text-amber-600' : 'text-green-600'
                        }`}>
                        {formatCurrency(booking.remainingAmount)}
                      </span>
                    </div>
                  )}

                  {booking.checkInDeadline && (booking.status === 'PAYMENT_CONFIRMED' || booking.status === 'PENDING_PAYMENT') && (
                    <div className="flex items-center gap-2 text-blue-600 text-xs bg-blue-50 rounded-lg p-2 border border-blue-200">
                      <span className="material-symbols-outlined text-base">schedule</span>
                      <span>
                        <strong>Deadline check-in:</strong> {formatDateWithTime(booking.checkInDeadline)}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Total Banner */}
            <div className="bg-slate-900 text-white rounded-2xl p-6 shadow-xl shadow-slate-200 relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -mr-16 -mt-16 blur-2xl group-hover:scale-150 transition-transform duration-700"></div>
              <div className="flex justify-between items-center relative z-10">
                <div className="flex flex-col">
                  <span className="text-white/50 text-[10px] font-black uppercase tracking-[0.2em] mb-1">Tổng cộng phí quyết toán</span>
                  <span className="text-3xl font-black tracking-tighter">{formatCurrency(booking.totalPrice)}</span>
                </div>
                <div className="w-12 h-12 bg-white/10 rounded-xl flex items-center justify-center backdrop-blur-sm border border-white/10">
                  <CreditCard className="w-6 h-6 text-white" />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-slate-50 border-t shrink-0">
          <div className="flex flex-col gap-3">
            <div className="flex flex-wrap gap-2">
              {/* PENDING - Chờ xử lý */}
              {booking.status === 'PENDING' && (
                <>
                  <button
                    onClick={() => onUpdateStatus(booking.bookingId, 'CONFIRMED')}
                    disabled={loading}
                    className="flex-1 min-w-[140px] flex items-center justify-center gap-2 px-4 py-2.5 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-all font-black text-[13px] uppercase tracking-wider shadow-lg shadow-blue-100 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {loading ? (
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    ) : (
                      <CheckCircle className="w-4 h-4" />
                    )}
                    {loading ? 'Đang xử lý...' : 'Xác nhận Đơn'}
                  </button>
                  <button
                    onClick={() => onUpdateStatus(booking.bookingId, 'CANCELLED')}
                    disabled={loading}
                    className="flex-1 min-w-[140px] flex items-center justify-center gap-2 px-4 py-2.5 bg-rose-600 text-white rounded-xl hover:bg-rose-700 transition-all font-black text-[13px] uppercase tracking-wider shadow-lg shadow-rose-100 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {loading ? (
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    ) : (
                      <XCircle className="w-4 h-4" />
                    )}
                    {loading ? 'Đang xử lý...' : 'Hủy đặt sân'}
                  </button>
                </>
              )}

              {/* PENDING_PAYMENT - Chờ thanh toán deposit */}
              {booking.status === 'PENDING_PAYMENT' && (
                <>
                  <div className="flex-1 bg-orange-50 border border-orange-200 rounded-xl p-3 text-center">
                    <p className="text-sm font-semibold text-orange-700">
                      Đang chờ khách thanh toán deposit
                    </p>
                    <p className="text-xs text-orange-600 mt-1">
                      Khách cần thanh toán {formatCurrency(booking.depositAmount)} để xác nhận
                    </p>
                  </div>
                  <button
                    onClick={() => onUpdateStatus(booking.bookingId, 'CANCELLED')}
                    disabled={loading}
                    className="flex items-center justify-center gap-2 px-6 py-2.5 bg-white border-2 border-rose-100 text-rose-600 rounded-xl hover:bg-rose-50 transition-all font-black text-[13px] uppercase tracking-wider disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {loading ? (
                      <div className="w-4 h-4 border-2 border-rose-600/30 border-t-rose-600 rounded-full animate-spin" />
                    ) : (
                      <Trash2 className="w-4 h-4" />
                    )}
                    {loading ? 'Đang xử lý...' : 'Hủy đơn'}
                  </button>
                </>
              )}

              {/* CONFIRMED - Đã thanh toán deposit, chờ check-in */}
              {booking.status === 'CONFIRMED' && (
                <>
                  <div className="flex-1 bg-green-50 border border-green-200 rounded-xl p-3 text-center">
                    <p className="text-sm font-semibold text-green-700">
                      ✓ Đã thanh toán deposit - Chờ khách đến
                    </p>
                    <p className="text-xs text-green-600 mt-1">
                      Đã cọc: {formatCurrency(booking.depositPaid)} | Còn lại: {formatCurrency(booking.remainingAmount)}
                    </p>
                  </div>
                  <button
                    onClick={() => onUpdateStatus(booking.bookingId, 'PLAYING')}
                    disabled={loading}
                    className="flex-1 min-w-[140px] flex items-center justify-center gap-2 px-4 py-2.5 bg-purple-600 text-white rounded-xl hover:bg-purple-700 transition-all font-black text-[13px] uppercase tracking-wider shadow-lg shadow-purple-100 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {loading ? (
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    ) : (
                      <PlayCircle className="w-4 h-4" />
                    )}
                    {loading ? 'Đang xử lý...' : 'Check-in'}
                  </button>
                  <button
                    onClick={() => onUpdateStatus(booking.bookingId, 'CANCELLED')}
                    disabled={loading}
                    className="flex items-center justify-center gap-2 px-6 py-2.5 bg-white border-2 border-rose-100 text-rose-600 rounded-xl hover:bg-rose-50 transition-all font-black text-[13px] uppercase tracking-wider disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {loading ? (
                      <div className="w-4 h-4 border-2 border-rose-600/30 border-t-rose-600 rounded-full animate-spin" />
                    ) : (
                      <Trash2 className="w-4 h-4" />
                    )}
                    {loading ? 'Đang xử lý...' : 'Hủy đơn'}
                  </button>
                </>
              )}

              {/* PLAYING - Đang chơi */}
              {booking.status === 'PLAYING' && (
                <>
                  <button
                    onClick={() => onExtend(booking)}
                    className="flex-1 min-w-[140px] flex items-center justify-center gap-2 px-4 py-2.5 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition-all font-black text-[13px] uppercase tracking-wider shadow-lg shadow-indigo-100"
                  >
                    <Clock className="w-4 h-4" />
                    Gia hạn chơi
                  </button>
                  <button
                    onClick={() => onUpdateStatus(booking.bookingId, 'COMPLETED')}
                    disabled={loading}
                    className="flex-1 min-w-[140px] flex items-center justify-center gap-2 px-4 py-2.5 bg-emerald-600 text-white rounded-xl hover:bg-emerald-700 transition-all font-black text-[13px] uppercase tracking-wider shadow-lg shadow-emerald-100 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {loading ? (
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    ) : (
                      <Flag className="w-4 h-4" />
                    )}
                    {loading ? 'Đang xử lý...' : 'Check-out'}
                  </button>
                </>
              )}
            </div>

            <button
              onClick={onClose}
              disabled={loading}
              className="w-full px-6 py-3 bg-slate-100 text-slate-500 rounded-xl hover:bg-slate-200 transition-all font-black text-[13px] uppercase tracking-widest border border-slate-200 disabled:opacity-50"
            >
              Đóng cửa sổ
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BookingDetailModal;
