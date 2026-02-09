package com.badminton.booking.controller;

import com.badminton.booking.dto.booking.*;
import com.badminton.booking.service.BookingService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.tags.Tag;
import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.security.core.Authentication;

import com.badminton.booking.entity.User;
import com.badminton.booking.repository.UserRepository;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;

@RestController
@RequestMapping("/api/bookings")
@RequiredArgsConstructor
@Tag(name = "Booking", description = "API đặt sân cầu lông - dùng startTime/endTime, không dùng slot")
public class BookingController {

    private final BookingService bookingService;
    private final UserRepository userRepository;

    @GetMapping("/check-availability")
    @Operation(summary = "Kiểm tra khung giờ có trống không", description = "Kiểm tra overlap với các booking hiện có. "
            +
            "Công thức: (start < existingEnd + buffer) && (end > existingStart)")
    public ResponseEntity<AvailabilityResponse> checkAvailability(
            @Parameter(description = "ID sân", example = "1") @RequestParam Integer courtId,

            @Parameter(description = "Ngày chơi (YYYY-MM-DD)", example = "2026-02-05") @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate playDate,

            @Parameter(description = "Giờ bắt đầu (HH:mm hoặc HH:mm:ss)", schema = @Schema(type = "string", format = "time", example = "07:00")) @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.TIME) LocalTime startTime,

            @Parameter(description = "Giờ kết thúc (HH:mm hoặc HH:mm:ss)", schema = @Schema(type = "string", format = "time", example = "10:00")) @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.TIME) LocalTime endTime) {

        AvailabilityResponse response = bookingService.checkAvailability(courtId, playDate, startTime, endTime);
        return ResponseEntity.ok(response);
    }

    // ========================================================
    // 2. CALCULATE PRICE
    // ========================================================
    @GetMapping("/calculate-price")
    @Operation(summary = "Tính giá đặt sân", description = "Tự động tách theo nhiều khung giá. " +
            "Ví dụ: 07:00-10:00 = (07-08: 60k) + (08-10: 80k*2) = 220k")
    public ResponseEntity<PriceCalculationResponse> calculatePrice(
            @Parameter(description = "ID sân", example = "1") @RequestParam Integer courtId,

            @Parameter(description = "Ngày chơi", example = "2026-02-05") @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate playDate,

            @Parameter(description = "Giờ bắt đầu (HH:mm hoặc HH:mm:ss)", schema = @Schema(type = "string", format = "time", example = "07:00")) @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.TIME) LocalTime startTime,

            @Parameter(description = "Giờ kết thúc (HH:mm hoặc HH:mm:ss)", schema = @Schema(type = "string", format = "time", example = "10:00")) @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.TIME) LocalTime endTime) {

        PriceCalculationResponse response = bookingService.calculatePrice(courtId, playDate, startTime, endTime);
        return ResponseEntity.ok(response);
    }

    // ========================================================
    // 3. CREATE BOOKING
    // ========================================================
    @PostMapping
    @Operation(summary = "Tạo booking mới", description = "Cho phép đặt thời lượng lẻ (1h, 1.5h, 2.5h...). " +
            "Tự động kiểm tra overlap và tính giá.")
    public ResponseEntity<BookingResponse> createBooking(
            @Valid @RequestBody CreateBookingRequest request,
            Authentication authentication) {

        // Lấy username từ Authentication, sau đó tìm user id từ DB
        if (authentication == null || authentication.getName() == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }

        String username = authentication.getName();
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("Authenticated user not found: " + username));

        BookingResponse response = bookingService.createBooking(user.getId(), request);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    // ========================================================
    // 4. GET BOOKING
    // ========================================================
    @GetMapping("/{bookingId}")
    @Operation(summary = "Lấy thông tin booking")
    public ResponseEntity<BookingResponse> getBooking(
            @PathVariable Integer bookingId) {

        BookingResponse response = bookingService.getBooking(bookingId);
        return ResponseEntity.ok(response);
    }

    // ========================================================
    // 5. EXTEND BOOKING
    // ========================================================
    @PostMapping("/{bookingId}/extend")
    @Operation(summary = "Gia hạn booking", description = "Chỉ cho phép nếu giờ tiếp theo còn trống. " +
            "Tính phí gia hạn theo khung giá tương ứng.")
    public ResponseEntity<BookingResponse> extendBooking(
            @PathVariable Integer bookingId,
            @Valid @RequestBody ExtendBookingRequest request) {

        BookingResponse response = bookingService.extendBooking(bookingId, request);
        return ResponseEntity.ok(response);
    }

    // ========================================================
    // 6. CALCULATE OVERTIME FEE
    // ========================================================
    @GetMapping("/{bookingId}/overtime")
    @Operation(summary = "Tính phí overtime", description = "Phí overtime = giá/giờ * 1.5 * số phút overtime")
    public ResponseEntity<OvertimeResponse> calculateOvertimeFee(
            @PathVariable Integer bookingId,

            @Parameter(description = "Giờ kết thúc thực tế (HH:mm hoặc HH:mm:ss)", example = "10:30") @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.TIME) LocalTime actualEndTime) {

        OvertimeResponse response = bookingService.calculateOvertimeFee(bookingId, actualEndTime);
        return ResponseEntity.ok(response);
    }

    // ========================================================
    // 7. COMPLETE BOOKING (CHECK-OUT)
    // ========================================================
    @PostMapping("/{bookingId}/complete")
    @Operation(summary = "Hoàn thành booking (check-out)", description = "Tự động tính overtime nếu khách về muộn. " +
            "Không hoàn tiền nếu khách về sớm.")
    public ResponseEntity<BookingResponse> completeBooking(
            @PathVariable Integer bookingId,

            @Parameter(description = "Giờ kết thúc thực tế (HH:mm hoặc HH:mm:ss)", example = "10:00") @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.TIME) LocalTime actualEndTime) {

        BookingResponse response = bookingService.completeBooking(bookingId, actualEndTime);
        return ResponseEntity.ok(response);
    }

    // ========================================================
    // 8. CHECK-IN
    // ========================================================
    @PostMapping("/{bookingId}/check-in")
    @Operation(summary = "Check-in booking", description = "Chuyển trạng thái từ CONFIRMED sang PLAYING")
    public ResponseEntity<BookingResponse> checkIn(@PathVariable Integer bookingId) {
        BookingResponse response = bookingService.checkIn(bookingId);
        return ResponseEntity.ok(response);
    }

    // ========================================================
    // 9. UPDATE STATUS
    // ========================================================
    @PatchMapping("/{bookingId}/status")
    @Operation(summary = "Cập nhật trạng thái booking", description = "PENDING → CONFIRMED → PLAYING → COMPLETED. " +
            "Có thể CANCELLED từ PENDING hoặc CONFIRMED")
    public ResponseEntity<BookingResponse> updateStatus(
            @PathVariable Integer bookingId,
            @RequestParam String status) {

        BookingResponse response = bookingService.updateBookingStatus(bookingId, status);
        return ResponseEntity.ok(response);
    }

    // ========================================================
    // 10. GET USER BOOKINGS
    // ========================================================
    @GetMapping("/user/{userId}")
    @Operation(summary = "Lấy danh sách booking của user")
    public ResponseEntity<List<BookingResponse>> getUserBookings(
            @PathVariable Integer userId,

            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate fromDate,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate toDate) {

        List<BookingResponse> response = bookingService.getUserBookings(userId, fromDate, toDate);
        return ResponseEntity.ok(response);
    }

    // ========================================================
    // 10.1 GET MY BOOKINGS (từ token đăng nhập)
    // ========================================================
    @GetMapping("/my-bookings")
    @Operation(summary = "Lấy danh sách booking của user đang đăng nhập", description = "Lấy user ID từ token đăng nhập. Mặc định trả về tất cả booking. "
            +
            "Có thể filter theo ngày, trạng thái booking, trạng thái thanh toán")
    public ResponseEntity<List<BookingResponse>> getMyBookings(
            @Parameter(description = "Ngày bắt đầu filter (YYYY-MM-DD)", example = "2026-01-01") @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate fromDate,

            @Parameter(description = "Ngày kết thúc filter (YYYY-MM-DD)", example = "2026-02-28") @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate toDate,

            @Parameter(description = "Trạng thái booking: PENDING, CONFIRMED, PLAYING, COMPLETED, CANCELLED", example = "CONFIRMED") @RequestParam(required = false) String status,

            @Parameter(description = "Trạng thái thanh toán: UNPAID, PAID, REFUNDED", example = "PAID") @RequestParam(required = false) String paymentStatus,

            Authentication authentication) {

        if (authentication == null || authentication.getName() == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }

        String username = authentication.getName();
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("Authenticated user not found: " + username));

        List<BookingResponse> response = bookingService.getUserBookingsWithFilter(
                user.getId(), fromDate, toDate, status, paymentStatus);
        return ResponseEntity.ok(response);
    }

    // ========================================================
    // 10.2 CANCEL MY BOOKING (User tự hủy booking của mình)
    // ========================================================
    @PostMapping("/my-bookings/{bookingId}/cancel")
    @Operation(summary = "User tự hủy booking của mình", description = "Nếu PENDING: Hủy ngay lập tức. " +
            "Nếu CONFIRMED: Chuyển sang CANCELLATION_REQUESTED (chờ admin duyệt).")
    public ResponseEntity<BookingResponse> cancelMyBooking(
            @PathVariable Integer bookingId,

            @RequestBody(required = false) CancelBookingRequest request,

            Authentication authentication) {

        if (authentication == null || authentication.getName() == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }

        String username = authentication.getName();
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("Authenticated user not found: " + username));

        String reason = (request != null) ? request.getReason() : null;
        BookingResponse response = bookingService.cancelMyBooking(user.getId(), bookingId, reason);
        return ResponseEntity.ok(response);
    }

    // ========================================================
    // 11. ADMIN CANCELLATION APPROVAL
    // ========================================================
    @PostMapping("/{bookingId}/cancellation/approve")
    @Operation(summary = "Admin duyệt yêu cầu hủy booking", description = "Chuyển trạng thái từ CANCELLATION_REQUESTED sang CANCELLED")
    public ResponseEntity<BookingResponse> approveCancellation(@PathVariable Integer bookingId) {
        BookingResponse response = bookingService.approveCancellation(bookingId);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/{bookingId}/cancellation/reject")
    @Operation(summary = "Admin từ chối yêu cầu hủy booking", description = "Chuyển trạng thái từ CANCELLATION_REQUESTED về CONFIRMED")
    public ResponseEntity<BookingResponse> rejectCancellation(@PathVariable Integer bookingId) {
        BookingResponse response = bookingService.rejectCancellation(bookingId);
        return ResponseEntity.ok(response);
    }

    // ========================================================
    // 12. GET COURT BOOKINGS
    // ========================================================
    @GetMapping("/court/{courtId}")
    @Operation(summary = "Lấy danh sách booking của sân trong ngày")
    public ResponseEntity<List<BookingResponse>> getCourtBookings(
            @PathVariable Integer courtId,

            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date) {

        List<BookingResponse> response = bookingService.getCourtBookings(courtId, date);
        return ResponseEntity.ok(response);
    }

    // ========================================================
    // 13. GET AVAILABLE SLOTS
    // ========================================================
    @GetMapping("/court/{courtId}/available-slots")
    @Operation(summary = "Lấy các khung giờ trống của sân", description = "Trả về danh sách các khoảng thời gian có thể đặt")
    public ResponseEntity<List<AvailabilityResponse.AvailableSlot>> getAvailableSlots(
            @PathVariable Integer courtId,

            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date) {

        List<AvailabilityResponse.AvailableSlot> response = bookingService.getAvailableSlots(courtId, date);
        return ResponseEntity.ok(response);
    }

    // ========================================================
    // 14. EARLY RELEASE - Mở slot do khách về sớm
    // ========================================================
    @PostMapping("/{bookingId}/release-early")
    @Operation(summary = "Mở slot do khách về sớm (Early Release)", description = "Biến thời gian còn dư của booking thành slot rảnh có thể bán lại. "
            +
            "KHÔNG hoàn tiền, KHÔNG sửa endTime, KHÔNG động vào booking gốc. " +
            "Chỉ tạo một released slot mới cho người khác đặt.\n\n" +
            "**Rules:**\n" +
            "- Booking phải COMPLETED\n" +
            "- actualEndTime < endTime (khách về sớm)\n" +
            "- Thời gian dư >= 30 phút\n" +
            "- Slot chưa từng được release trước đó")
    public ResponseEntity<EarlyReleaseResponse> releaseEarly(
            @Parameter(description = "ID của booking đã COMPLETED", example = "123") @PathVariable Integer bookingId,

            Authentication authentication) {

        String releasedBy = "SYSTEM";
        if (authentication != null && authentication.getName() != null) {
            releasedBy = authentication.getName();
        }

        EarlyReleaseResponse response = bookingService.releaseEarly(bookingId, releasedBy);

        if (response.isReleased()) {
            return ResponseEntity.ok(response);
        } else {
            return ResponseEntity.badRequest().body(response);
        }
    }
}
