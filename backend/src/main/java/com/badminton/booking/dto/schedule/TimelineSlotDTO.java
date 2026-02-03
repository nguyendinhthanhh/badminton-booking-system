package com.badminton.booking.dto.schedule;

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
public class TimelineSlotDTO {
    private Integer slotId;
    private LocalTime startTime;
    private LocalTime endTime;
    private Integer durationMinutes; // Thời lượng slot tính bằng phút
    private String periodName;
    private String status; // AVAILABLE, BOOKED, PENDING, MAINTENANCE
    private Integer bookingId;
    private Integer bookingDetailId;
    private String customerName;
    private String customerPhone;

    // ===== THÔNG TIN GIÁ =====
    private BigDecimal price;              // Giá cuối cùng
    private BigDecimal basePrice;          // Giá cơ bản của sân
    private BigDecimal slotMultiplier;     // Hệ số khung giờ
    private BigDecimal weekendMultiplier;  // Hệ số cuối tuần (1.0 nếu ngày thường)
    private Boolean isWeekend;             // Có phải cuối tuần không
}
