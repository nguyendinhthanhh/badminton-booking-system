package com.badminton.booking.dto.schedule;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ScheduleStatisticsDTO {
    private Integer totalSlots;
    private Integer bookedSlots;
    private Integer availableSlots;
    private Integer pendingSlots;
    private Integer maintenanceSlots;
    private Double occupancyRate;
    private BigDecimal totalRevenue;
    private BigDecimal expectedRevenue;
}

