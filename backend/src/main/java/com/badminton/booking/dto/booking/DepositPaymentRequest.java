package com.badminton.booking.dto.booking;

import com.badminton.booking.entity.enums.PaymentMethod;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class DepositPaymentRequest {
    
    @NotNull(message = "Booking ID is required")
    private Integer bookingId;
    
    @NotNull(message = "Payment method is required")
    private PaymentMethod paymentMethod;
    
    private String transactionId; // ID giao dịch từ payment gateway (MoMo, VNPay, etc.)
    
    private String notes;
}
