package com.badminton.booking.dto.booking;

import com.fasterxml.jackson.annotation.JsonFormat;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.List;

/**
 * Response trả về thông tin booking
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class BookingResponse {

    private Integer bookingId;

    // Court info
    private Integer courtId;
    private String courtName;
    private String courtType;
    private String courtImage; // Ảnh sân

    // Customer info
    private Integer customerId;
    private String customerName;
    private String customerPhone;

    // Booking type & guest info
    private String bookingType; // ONLINE, WALK_IN
    private Boolean openEnded; // true = chưa xác định giờ kết thúc
    private String guestName; // Tên khách vãng lai
    private String guestPhone; // SĐT khách vãng lai
    private String createdBy; // Admin tạo booking

    // Booking time
    private LocalDate playDate;

    @JsonFormat(pattern = "HH:mm")
    private LocalTime startTime;

    @JsonFormat(pattern = "HH:mm")
    private LocalTime endTime;

    @JsonFormat(pattern = "HH:mm")
    private LocalTime actualEndTime;

    private Integer durationMinutes;
    private Integer estimatedDurationMinutes;
    private Integer bufferMinutes;

    // Status
    private String status;
    private String paymentStatus;

    // Pricing
    private BigDecimal basePrice;
    private BigDecimal overtimeFee;
    private BigDecimal totalPrice;
    private Integer overtimeMinutes;

    // ===== DEPOSIT & PAYMENT =====
    private BigDecimal depositAmount; // Số tiền cọc (1/3 tổng tiền)
    private BigDecimal depositPaid; // Số tiền đã cọc
    private BigDecimal remainingAmount; // Số tiền còn lại
    private Boolean depositRequired; // Có yêu cầu cọc không

    @JsonFormat(pattern = "yyyy-MM-dd HH:mm:ss")
    private LocalDateTime checkInDeadline; // Deadline check-in (startTime + 20 phút)

    // Price breakdown
    private List<PriceBreakdownDTO> priceBreakdown;

    // Extensions history
    private List<ExtensionDTO> extensions;

    private String notes;
    private LocalDate bookingDate;

    // ===== TIMESTAMPS =====
    @JsonFormat(pattern = "yyyy-MM-dd HH:mm:ss")
    private LocalDateTime createdAt; // Thời điểm tạo booking

    @JsonFormat(pattern = "yyyy-MM-dd HH:mm:ss")
    private LocalDateTime confirmedAt; // Thời điểm admin xác nhận

    @JsonFormat(pattern = "yyyy-MM-dd HH:mm:ss")
    private LocalDateTime checkedInAt; // Thời điểm check-in

    @JsonFormat(pattern = "yyyy-MM-dd HH:mm:ss")
    private LocalDateTime completedAt; // Thời điểm hoàn thành

    @JsonFormat(pattern = "yyyy-MM-dd HH:mm:ss")
    private LocalDateTime cancelledAt; // Thời điểm hủy

    private String cancelledBy; // USER hoặc ADMIN

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class PriceBreakdownDTO {
        @JsonFormat(pattern = "HH:mm")
        private LocalTime periodStart;

        @JsonFormat(pattern = "HH:mm")
        private LocalTime periodEnd;

        private Integer durationMinutes;
        private BigDecimal pricePerHour;
        private BigDecimal subtotal;
        private String dayType;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class ExtensionDTO {
        @JsonFormat(pattern = "HH:mm")
        private LocalTime originalEndTime;

        @JsonFormat(pattern = "HH:mm")
        private LocalTime extendedEndTime;

        private Integer extensionMinutes;
        private BigDecimal extensionFee;
    }
}
