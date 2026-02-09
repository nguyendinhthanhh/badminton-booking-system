package com.badminton.booking.service;

import com.badminton.booking.dto.booking.DepositPaymentRequest;
import com.badminton.booking.dto.booking.BookingResponse;

public interface PaymentService {
    
    /**
     * Thanh toán deposit cho booking
     */
    BookingResponse payDeposit(DepositPaymentRequest request);
    
    /**
     * Thanh toán phần còn lại khi check-in
     */
    BookingResponse payRemaining(Integer bookingId, String paymentMethod);
}
