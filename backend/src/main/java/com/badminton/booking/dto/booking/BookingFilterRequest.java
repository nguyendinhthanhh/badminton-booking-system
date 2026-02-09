package com.badminton.booking.dto.booking;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;

import java.time.LocalDate;

/**
 * Request DTO để filter booking cho admin
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class BookingFilterRequest {

    @Schema(description = "ID sân cần lọc", example = "17")
    private Integer courtId;

    @Schema(description = "Trạng thái booking: PENDING, CONFIRMED, PLAYING, COMPLETED, CANCELLED", example = "PENDING")
    private String status;

    @Schema(description = "Trạng thái thanh toán: UNPAID, PAID, REFUNDED", example = "UNPAID")
    private String paymentStatus;

    @Schema(description = "Ngày bắt đầu filter", example = "2026-02-01")
    @DateTimeFormat(iso = DateTimeFormat.ISO.DATE)
    private LocalDate fromDate;

    @Schema(description = "Ngày kết thúc filter", example = "2026-02-07")
    @DateTimeFormat(iso = DateTimeFormat.ISO.DATE)
    private LocalDate toDate;
}

