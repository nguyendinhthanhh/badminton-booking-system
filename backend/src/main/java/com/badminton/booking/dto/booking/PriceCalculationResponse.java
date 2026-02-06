package com.badminton.booking.dto.booking;

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
 * Response tính giá trước khi đặt sân
 *
 * Ví dụ output cho 07:00-10:00 ngày thường:
 * {
 *   "courtId": 1,
 *   "playDate": "2026-02-05",
 *   "startTime": "07:00",
 *   "endTime": "10:00",
 *   "totalMinutes": 180,
 *   "totalPrice": 220000,
 *   "breakdown": [
 *     {"start": "07:00", "end": "08:00", "minutes": 60, "pricePerHour": 60000, "subtotal": 60000},
 *     {"start": "08:00", "end": "10:00", "minutes": 120, "pricePerHour": 80000, "subtotal": 160000}
 *   ]
 * }
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PriceCalculationResponse {

    private Integer courtId;
    private String courtName;
    private LocalDate playDate;
    private String dayType; // WEEKDAY, WEEKEND

    @JsonFormat(pattern = "HH:mm")
    private LocalTime startTime;

    @JsonFormat(pattern = "HH:mm")
    private LocalTime endTime;

    private Integer totalMinutes;
    private BigDecimal totalPrice;

    private List<PriceSegment> breakdown;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class PriceSegment {
        @JsonFormat(pattern = "HH:mm")
        private LocalTime start;

        @JsonFormat(pattern = "HH:mm")
        private LocalTime end;

        private Integer minutes;
        private BigDecimal pricePerHour;
        private BigDecimal subtotal;
        private String periodName; // "Sáng sớm", "Sáng", "Giờ vàng", etc.
    }
}

