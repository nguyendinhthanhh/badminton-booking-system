package com.badminton.booking.entity.enums;

public enum BookingStatus {
    PENDING,        // Chờ xác nhận
    CONFIRMED,      // Đã xác nhận
    CHECKED_IN,     // Đã check-in
    PLAYING,        // Đang chơi
    COMPLETED,      // Hoàn thành
    CANCELLED,      // Đã hủy
    NO_SHOW         // Không đến
}
