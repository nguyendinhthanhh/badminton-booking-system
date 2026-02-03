package com.badminton.booking.dto.schedule;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class BookingDetailInfoDTO {
    // Booking info
    private Integer bookingId;
    private String bookingStatus;
    private String paymentStatus;
    private LocalDate playDate;
    private LocalDate bookingDate;
    private BigDecimal totalPrice;

    // Court info
    private Integer courtId;
    private String courtName;
    private String courtType;
    private String courtLocation;

    // Customer info
    private Integer customerId;
    private String customerName;
    private String customerEmail;
    private String customerPhone;

    // Booking slots
    private List<BookingSlotDetailDTO> slots;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class BookingSlotDetailDTO {
        private Integer bookingDetailId;
        private Integer slotId;
        private LocalTime startTime;
        private LocalTime endTime;
        private Integer durationMinutes;
        private String periodName;
        private BigDecimal price;
        private String status;
    }
}
