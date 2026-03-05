package com.badminton.booking.controller;

import com.badminton.booking.dto.booking.DepositPaymentRequest;
import com.badminton.booking.dto.booking.BookingResponse;
import com.badminton.booking.service.PaymentService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/payments")
@RequiredArgsConstructor
@Tag(name = "Payment", description = "Payment Management APIs")
public class PaymentController {

    private final PaymentService paymentService;

    @PostMapping("/deposit")
    @PreAuthorize("hasAnyRole('USER', 'ADMIN')")
    @Operation(summary = "Pay deposit for booking", 
               description = "Thanh toán 1/3 tiền cọc để xác nhận đặt sân")
    public ResponseEntity<BookingResponse> payDeposit(@Valid @RequestBody DepositPaymentRequest request) {
        BookingResponse response = paymentService.payDeposit(request);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/deposit/vnpay-url")
    @PreAuthorize("hasAnyRole('USER', 'ADMIN')")
    @Operation(summary = "Create VNPay payment URL for deposit",
            description = "Tạo URL thanh toán VNPay cho tiền cọc booking")
    public ResponseEntity<Map<String, String>> createVnPayDepositUrl(
            @Valid @RequestBody DepositPaymentRequest request,
            HttpServletRequest httpServletRequest) {
        String clientIp = getClientIp(httpServletRequest);
        String paymentUrl = paymentService.createVnPayDepositUrl(request, clientIp);
        Map<String, String> response = new HashMap<>();
        response.put("paymentUrl", paymentUrl);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/remaining/{bookingId}")
    @PreAuthorize("hasAnyRole('USER', 'ADMIN')")
    @Operation(summary = "Pay remaining amount", 
               description = "Thanh toán phần còn lại khi check-in")
    public ResponseEntity<BookingResponse> payRemaining(
            @PathVariable Integer bookingId,
            @RequestParam String paymentMethod) {
        BookingResponse response = paymentService.payRemaining(bookingId, paymentMethod);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/remaining/{bookingId}/vnpay-url")
    @PreAuthorize("hasAnyRole('USER', 'ADMIN')")
    @Operation(summary = "Create VNPay payment URL for remaining amount",
            description = "Tạo URL thanh toán VNPay cho phần tiền còn lại khi check-in")
    public ResponseEntity<Map<String, String>> createVnPayRemainingUrl(
            @PathVariable Integer bookingId,
            HttpServletRequest httpServletRequest) {
        String clientIp = getClientIp(httpServletRequest);
        String paymentUrl = paymentService.createVnPayRemainingUrl(bookingId, clientIp);
        Map<String, String> response = new HashMap<>();
        response.put("paymentUrl", paymentUrl);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/vnpay/confirm")
    @PreAuthorize("hasAnyRole('USER', 'ADMIN')")
    @Operation(summary = "Confirm VNPay payment",
            description = "Xác nhận kết quả thanh toán VNPay sau khi redirect về frontend")
    public ResponseEntity<BookingResponse> confirmVnPayPayment(
            @RequestBody Map<String, String> vnpParams) {
        BookingResponse response = paymentService.confirmVnPayPayment(vnpParams);
        return ResponseEntity.ok(response);
    }

    private String getClientIp(HttpServletRequest request) {
        String ipAddress = request.getHeader("X-Forwarded-For");
        if (ipAddress == null || ipAddress.isBlank()) {
            ipAddress = request.getRemoteAddr();
        } else {
            // In case of multiple IPs, take the first one
            ipAddress = ipAddress.split(",")[0].trim();
        }
        return ipAddress;
    }
}
