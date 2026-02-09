package com.badminton.booking.controller;

import com.badminton.booking.dto.booking.*;
import com.badminton.booking.service.BookingService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;

@RestController
@RequestMapping("/api/admin/bookings")
@RequiredArgsConstructor
@Tag(name = "Admin Booking", description = "API quản lý booking dành cho admin")
public class AdminBookingController {

    private final BookingService bookingService;

    // ========================================================
    // CREATE WALK-IN BOOKING (Admin tạo booking cho khách vãng lai)
    // ========================================================
    @PostMapping("/walk-in")
    @Operation(summary = "Admin tạo booking cho khách walk-in (vãng lai)",
               description = "Cho phép admin tạo booking cho khách đến sân trực tiếp. " +
                           "Có thể tạo booking từ thời gian quá khứ (tối đa 7 ngày). " +
                           "Dùng cho khách tới sân rồi mới tính giờ chơi, không đặt trước online.")
    public ResponseEntity<BookingResponse> createWalkInBooking(
            @Valid @RequestBody WalkInBookingRequest request,
            Authentication authentication) {

        if (authentication == null || authentication.getName() == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }

        String adminUsername = authentication.getName();
        BookingResponse response = bookingService.createWalkInBooking(request, adminUsername);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    // ========================================================
    // GET ALL BOOKINGS WITH FILTER & PAGINATION
    // ========================================================
    @GetMapping
    @Operation(summary = "Lấy danh sách booking với filter và phân trang",
               description = "Admin có thể lọc booking theo sân, trạng thái, thanh toán, ngày. " +
                           "Hỗ trợ phân trang với page và size.")
    public ResponseEntity<BookingPageResponse> getAllBookings(
            @Parameter(description = "ID sân cần lọc", example = "17")
            @RequestParam(required = false) Integer courtId,

            @Parameter(description = "Trạng thái booking: PENDING, CONFIRMED, PLAYING, COMPLETED, CANCELLED", example = "PENDING")
            @RequestParam(required = false) String status,

            @Parameter(description = "Trạng thái thanh toán: UNPAID, PAID, REFUNDED", example = "UNPAID")
            @RequestParam(required = false) String paymentStatus,

            @Parameter(description = "Ngày bắt đầu filter (YYYY-MM-DD)", example = "2026-02-01")
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate fromDate,

            @Parameter(description = "Ngày kết thúc filter (YYYY-MM-DD)", example = "2026-02-07")
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate toDate,

            @Parameter(description = "Số trang (bắt đầu từ 0)", example = "0")
            @RequestParam(defaultValue = "0") int page,

            @Parameter(description = "Số lượng mỗi trang", example = "20")
            @RequestParam(defaultValue = "20") int size) {

        BookingPageResponse response = bookingService.getAllBookingsWithFilter(
                courtId, status, paymentStatus, fromDate, toDate, page, size);
        return ResponseEntity.ok(response);
    }

    // ========================================================
    // UPDATE BOOKING STATUS (Admin)
    // ========================================================
    @PatchMapping("/{bookingId}/status")
    @Operation(summary = "Admin cập nhật trạng thái booking",
               description = "PENDING → CONFIRMED → PLAYING → COMPLETED. " +
                           "Có thể CANCELLED từ PENDING hoặc CONFIRMED")
    public ResponseEntity<BookingResponse> updateStatus(
            @PathVariable Integer bookingId,
            @RequestParam String status) {

        BookingResponse response = bookingService.updateBookingStatus(bookingId, status);
        return ResponseEntity.ok(response);
    }

    // ========================================================
    // CANCEL BOOKING (Admin)
    // ========================================================
    @PostMapping("/{bookingId}/cancel")
    @Operation(summary = "Admin hủy booking",
               description = "Admin có thể hủy booking ở trạng thái PENDING hoặc CONFIRMED")
    public ResponseEntity<BookingResponse> cancelBooking(
            @PathVariable Integer bookingId,
            @RequestBody(required = false) CancelBookingRequest request) {

        String reason = (request != null) ? request.getReason() : null;
        BookingResponse response = bookingService.cancelBooking(bookingId, reason);
        return ResponseEntity.ok(response);
    }

    // ========================================================
    // EXTEND BOOKING (Admin gia hạn thời gian chơi)
    // ========================================================
    @PostMapping("/{bookingId}/extend")
    @Operation(summary = "Admin gia hạn thời gian chơi cho booking",
               description = "Gia hạn thời gian chơi nếu khung giờ tiếp theo còn trống. " +
                           "Có thể truyền newEndTime hoặc extensionMinutes.")
    public ResponseEntity<BookingResponse> extendBooking(
            @PathVariable Integer bookingId,
            @RequestBody ExtendBookingRequest request) {

        BookingResponse response = bookingService.extendBooking(bookingId, request);
        return ResponseEntity.ok(response);
    }

    // ========================================================
    // GET BOOKING DETAIL (Admin xem chi tiết booking)
    // ========================================================
    @GetMapping("/{bookingId}")
    @Operation(summary = "Admin xem chi tiết booking")
    public ResponseEntity<BookingResponse> getBookingDetail(@PathVariable Integer bookingId) {
        BookingResponse response = bookingService.getBooking(bookingId);
        return ResponseEntity.ok(response);
    }
}
