package com.badminton.booking.service;

import com.badminton.booking.dto.booking.DepositPaymentRequest;
import com.badminton.booking.dto.booking.BookingResponse;

import java.util.Map;

public interface PaymentService {
    
    /**
     * Thanh toán deposit cho booking
     */
    BookingResponse payDeposit(DepositPaymentRequest request);
    
    /**
     * Thanh toán phần còn lại khi check-in
     */
    BookingResponse payRemaining(Integer bookingId, String paymentMethod);

    /**
     * Tạo VNPay payment URL cho thanh toán deposit.
     */
    String createVnPayDepositUrl(DepositPaymentRequest request, String ipAddress);

    /**
     * Tạo VNPay payment URL cho thanh toán phần còn lại (check-in).
     */
    String createVnPayRemainingUrl(Integer bookingId, String ipAddress);

    /**
     * Xác nhận thanh toán VNPay sau khi redirect về hệ thống.
     */
    BookingResponse confirmVnPayPayment(Map<String, String> vnpParams);
}
