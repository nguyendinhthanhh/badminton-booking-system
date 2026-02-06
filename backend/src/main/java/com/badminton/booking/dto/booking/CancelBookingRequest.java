package com.badminton.booking.dto.booking;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Request DTO để hủy booking
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CancelBookingRequest {

    @Schema(description = "Lý do hủy booking", example = "Bận việc đột xuất, không thể đến được")
    private String reason;
}

