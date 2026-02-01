package com.badminton.booking.entity.enums;

public enum PaymentStatus {
    UNPAID,         // Chưa thanh toán
    PARTIAL,        // Thanh toán một phần
    PAID,           // Đã thanh toán đủ
    REFUNDED,
    PENDING,// Đã hoàn tiền
    REFUND_PENDING  // Chờ hoàn tiền
}
