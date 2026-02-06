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

    // Customer info
    private Integer customerId;
    private String customerName;
    private String customerPhone;

    // Booking time
    private LocalDate playDate;

    @JsonFormat(pattern = "HH:mm")
    private LocalTime startTime;

    @JsonFormat(pattern = "HH:mm")
    private LocalTime endTime;

    @JsonFormat(pattern = "HH:mm")
    private LocalTime actualEndTime;

    private Integer durationMinutes;
    private Integer bufferMinutes;

    // Status
    private String status;
    private String paymentStatus;

    // Pricing
    private BigDecimal basePrice;
    private BigDecimal overtimeFee;
    private BigDecimal totalPrice;
    private Integer overtimeMinutes;

    // Price breakdown
    private List<PriceBreakdownDTO> priceBreakdown;

    // Extensions history
    private List<ExtensionDTO> extensions;

    private String notes;
    private LocalDate bookingDate;

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

