package com.badminton.booking.entity.enums;

public enum BookingStatusEnum {
    PENDING,              // Đang chờ xử lý
    PENDING_PAYMENT,      // Chờ thanh toán deposit
    PAYMENT_CONFIRMED,    // Đã thanh toán deposit, chờ check-in
    CONFIRMED,            // Đã xác nhận (cho walk-in hoặc admin confirm)
    PLAYING,              // Đang chơi
    COMPLETED,            // Đã hoàn thành
    CANCELLED,            // Đã hủy
    NO_SHOW               // Không check-in đúng giờ
}
