package com.badminton.booking.controller;

import com.badminton.booking.dto.booking.DepositPaymentRequest;
import com.badminton.booking.dto.booking.BookingResponse;
import com.badminton.booking.service.PaymentService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/payments")
@RequiredArgsConstructor
@Tag(name = "Payment", description = "Payment Management APIs")
public class PaymentController {

    private final PaymentService paymentService;

    @PostMapping("/deposit")
    @PreAuthorize("hasAnyRole('CUSTOMER', 'ADMIN')")
    @Operation(summary = "Pay deposit for booking", 
               description = "Thanh toán 1/3 tiền cọc để xác nhận đặt sân")
    public ResponseEntity<BookingResponse> payDeposit(@Valid @RequestBody DepositPaymentRequest request) {
        BookingResponse response = paymentService.payDeposit(request);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/remaining/{bookingId}")
    @PreAuthorize("hasAnyRole('CUSTOMER', 'ADMIN')")
    @Operation(summary = "Pay remaining amount", 
               description = "Thanh toán phần còn lại khi check-in")
    public ResponseEntity<BookingResponse> payRemaining(
            @PathVariable Integer bookingId,
            @RequestParam String paymentMethod) {
        BookingResponse response = paymentService.payRemaining(bookingId, paymentMethod);
        return ResponseEntity.ok(response);
    }
}
