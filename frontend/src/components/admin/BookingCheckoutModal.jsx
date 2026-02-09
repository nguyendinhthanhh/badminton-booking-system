import React, { useState, useEffect } from 'react';
import { CheckCircle, Clock, CreditCard, AlertTriangle, X } from 'lucide-react';
import adminBookingService from '../../services/adminBookingService';

const BookingCheckoutModal = ({ booking, onConfirm, onCancel, loading: parentLoading }) => {
    const [calculation, setCalculation] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [currentTime, setCurrentTime] = useState(new Date());

    // Update current time every minute
    useEffect(() => {
        const timer = setInterval(() => setCurrentTime(new Date()), 60000);
        return () => clearInterval(timer);
    }, []);

    useEffect(() => {
        calculateCheckoutPrice();
    }, [booking]);

    const calculateCheckoutPrice = async () => {
        try {
            setLoading(true);
            setError(null);

            const now = new Date();
            const endTimeStr = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;

            const params = {
                courtId: booking.courtId,
                playDate: booking.playDate,
                startTime: booking.startTime, // Use original start time
                endTime: endTimeStr // Use current time as end time
            };

            const result = await adminBookingService.calculatePrice(params);
            setCalculation(result);
        } catch (err) {
            console.error("Error calculating checkout price:", err);
            setError("Không thể tính toán giá tiền. Vui lòng thử lại.");
        } finally {
            setLoading(false);
        }
    };

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('vi-VN', {
            style: 'currency',
            currency: 'VND'
        }).format(amount);
    };

    const formatTime = (timeStr) => {
        if (!timeStr) return "--:--";
        return timeStr.substring(0, 5);
    };

    return (
        <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl shadow-2xl max-w-lg w-full flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200">

                {/* Header */}
                <div className="bg-emerald-600 text-white px-6 py-4 flex justify-between items-center">
                    <h3 className="text-lg font-bold flex items-center gap-2">
                        <CheckCircle className="w-5 h-5" />
                        Xác nhận Thanh toán & Trả sân
                    </h3>
                    <button onClick={onCancel} className="text-white/80 hover:text-white hover:bg-white/10 p-1 rounded-lg transition-colors">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <div className="p-6 space-y-6">
                    {/* Booking Info */}
                    <div className="flex justify-between items-start text-sm">
                        <div>
                            <p className="text-gray-500 font-bold uppercase text-[10px]">Khách hàng</p>
                            <p className="font-bold text-gray-900 text-base">{booking.customerName}</p>
                            <p className="text-gray-500">{booking.customerPhone}</p>
                        </div>
                        <div className="text-right">
                            <p className="text-gray-500 font-bold uppercase text-[10px]">{booking.courtName}</p>
                            <div className="flex items-center gap-1 justify-end font-bold text-gray-900">
                                <Clock className="w-4 h-4 text-emerald-600" />
                                {formatTime(booking.startTime)} - <span className="text-emerald-600 underline decoration-2 decoration-emerald-200 underline-offset-2">{calculation?.endTime}</span>
                            </div>
                            {loading ? (
                                <div className="h-4 w-20 bg-gray-100 animate-pulse rounded mt-1 ml-auto"></div>
                            ) : (
                                <p className="text-xs text-gray-500 font-bold mt-1">Tổng {calculation?.totalMinutes} phút</p>
                            )}
                        </div>
                    </div>

                    {/* Error State */}
                    {error && (
                        <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex gap-3">
                            <AlertTriangle className="w-5 h-5 text-red-600 flex-shrink-0" />
                            <div>
                                <p className="text-sm font-bold text-red-800">Lỗi tính giá</p>
                                <p className="text-xs text-red-600 mt-1">{error}</p>
                            </div>
                        </div>
                    )}

                    {/* Calculation Result */}
                    {!loading && !error && calculation && (
                        <div className="bg-gray-50 rounded-xl border border-gray-200 p-4 space-y-3">
                            <div className="flex items-center gap-2 mb-2">
                                <CreditCard className="w-4 h-4 text-gray-500" />
                                <span className="text-xs font-black text-gray-500 uppercase tracking-widest">Chi tiết tính tiền</span>
                            </div>

                            {/* Breakdown */}
                            <div className="space-y-2">
                                {calculation.breakdown.map((item, idx) => (
                                    <div key={idx} className="flex justify-between text-sm">
                                        <span className="text-gray-600 font-medium">
                                            {formatTime(item.start)} - {formatTime(item.end)} ({item.periodName})
                                        </span>
                                        <span className="font-bold text-gray-900">{formatCurrency(item.subtotal)}</span>
                                    </div>
                                ))}
                            </div>

                            <div className="border-t border-gray-200 pt-3 flex justify-between items-center">
                                <span className="font-black text-gray-900 uppercase">Tổng cộng</span>
                                <span className="font-black text-2xl text-emerald-600">{formatCurrency(calculation.totalPrice)}</span>
                            </div>

                            {booking.openEnded ? (
                                <p className="text-[10px] text-emerald-600 font-medium italic text-right mt-1">
                                    * Giá đã được tính lại dựa trên thời gian thực tế (Open-Ended)
                                </p>
                            ) : (
                                calculation.totalPrice > booking.totalPrice && (
                                    <p className="text-[10px] text-orange-600 font-medium italic text-right mt-1">
                                        * Bao gồm phí Overtime do quá giờ
                                    </p>
                                )
                            )}
                        </div>
                    )}

                    {/* Logic notes */}
                    <div className="bg-blue-50 border border-blue-100 rounded-lg p-3 text-xs text-blue-800">
                        <p>
                            Thời gian kết thúc sẽ được lưu là <strong>{calculation?.endTime || '--:--'}</strong>.
                            {booking.openEnded ?
                                " Hệ thống sẽ cập nhật lại toàn bộ giá tiền dựa trên thời gian thực tế." :
                                " Nếu quá giờ quy định, hệ thống sẽ tự động tính thêm phí Overtime."
                            }
                        </p>
                    </div>
                </div>

                {/* Footer Actions */}
                <div className="p-4 bg-gray-50 border-t border-gray-200 flex gap-3">
                    <button
                        onClick={onCancel}
                        className="flex-1 py-2.5 bg-white border border-gray-300 text-gray-700 font-bold rounded-lg hover:bg-gray-50 transition-colors"
                        disabled={parentLoading}
                    >
                        Hủy bỏ
                    </button>
                    <button
                        onClick={onConfirm}
                        className="flex-1 py-2.5 bg-emerald-600 text-white font-bold rounded-lg hover:bg-emerald-700 transition-colors shadow-lg shadow-emerald-200 disabled:opacity-50 disabled:cursor-not-allowed flex justify-center items-center gap-2"
                        disabled={loading || !!error || parentLoading}
                    >
                        {parentLoading ? (
                            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        ) : (
                            <>
                                <CheckCircle className="w-4 h-4" />
                                Xác nhận Thanh toán
                            </>
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default BookingCheckoutModal;
