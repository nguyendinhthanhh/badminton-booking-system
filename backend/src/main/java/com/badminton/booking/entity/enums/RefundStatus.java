package com.badminton.booking.entity.enums;

public enum RefundStatus {
    PENDING,        // Chờ xử lý
    APPROVED,       // Đã duyệt
    REJECTED,       // Từ chối
    PROCESSING,     // Đang xử lý
    COMPLETED,      // Hoàn thành
    FAILED          // Thất bại
}
