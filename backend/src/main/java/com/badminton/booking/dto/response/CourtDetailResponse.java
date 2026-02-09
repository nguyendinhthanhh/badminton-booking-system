package com.badminton.booking.dto.response;

import com.fasterxml.jackson.annotation.JsonFormat;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;

/**
 * Response đầy đủ cho trang Chi tiết sân
 * Gộp: thông tin sân + bảng giá + slot trống
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CourtDetailResponse {

    // ===== THÔNG TIN CƠ BẢN =====
    private Integer id;
    private String name;
    private String status;
    private String type;
    private String location;
    private String description;
    private String imageUrl;
    private java.util.List<String> images;
    private Integer capacity;

    // ===== GIÁ TÓM TẮT =====
    private BigDecimal minPricePerHour;
    private BigDecimal maxPricePerHour;

    // ===== GIỜ HOẠT ĐỘNG =====
    @JsonFormat(pattern = "HH:mm")
    private LocalTime openTime;

    @JsonFormat(pattern = "HH:mm")
    private LocalTime closeTime;

    // ===== BẢNG GIÁ CHI TIẾT =====
    private List<PriceInfo> weekdayPrices;
    private List<PriceInfo> weekendPrices;

    // ===== SLOT TRỐNG HÔM NAY =====
    private LocalDate today;
    private Boolean isAvailableToday;
    private List<AvailableSlot> availableSlotsToday;

    // ===== THỐNG KÊ =====
    private Integer totalBookingsToday;
    private Integer totalAvailableMinutesToday;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class PriceInfo {
        @JsonFormat(pattern = "HH:mm")
        private LocalTime startTime;

        @JsonFormat(pattern = "HH:mm")
        private LocalTime endTime;

        private BigDecimal pricePerHour;
        private String periodName; // "Sáng sớm", "Giờ vàng"...
        private String status; // "AVAILABLE", "BOOKED", "MAINTENANCE"...
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class AvailableSlot {
        @JsonFormat(pattern = "HH:mm")
        private LocalTime startTime;

        @JsonFormat(pattern = "HH:mm")
        private LocalTime endTime;

        private Integer durationMinutes;
    }
}
