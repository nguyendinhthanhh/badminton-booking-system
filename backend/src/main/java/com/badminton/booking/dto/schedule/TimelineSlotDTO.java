package com.badminton.booking.dto.schedule;

import com.fasterxml.jackson.annotation.JsonInclude;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@JsonInclude(JsonInclude.Include.NON_NULL) // Không hiển thị các trường null
public class TimelineSlotDTO {
    private LocalTime startTime;
    private LocalTime endTime;
    private Integer durationMinutes;
    private String periodName;
    private String status; // PENDING, CONFIRMED, PLAYING, COMPLETED
    private Integer bookingId;
    private String customerName;
    private String customerPhone;

    // ===== THÔNG TIN GIÁ =====
    private BigDecimal basePrice;          // Giá cơ bản
    private BigDecimal totalPrice;         // Tổng tiền (bao gồm overtime, gia hạn...)
    private String paymentStatus;          // UNPAID, PAID, REFUNDED
    private Boolean isWeekend;
}
