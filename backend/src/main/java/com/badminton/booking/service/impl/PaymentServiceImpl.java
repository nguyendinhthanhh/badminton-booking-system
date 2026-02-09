package com.badminton.booking.service.impl;

import com.badminton.booking.dto.booking.DepositPaymentRequest;
import com.badminton.booking.dto.booking.BookingResponse;
import com.badminton.booking.entity.Booking;
import com.badminton.booking.entity.Payment;
import com.badminton.booking.exception.ResourceNotFoundException;
import com.badminton.booking.repository.BookingRepository;
import com.badminton.booking.repository.PaymentRepository;
import com.badminton.booking.service.BookingService;
import com.badminton.booking.service.PaymentService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDateTime;

@Service
@RequiredArgsConstructor
@Slf4j
@Transactional
public class PaymentServiceImpl implements PaymentService {

    private final BookingRepository bookingRepository;
    private final PaymentRepository paymentRepository;
    private final BookingService bookingService;

    @Override
    public BookingResponse payDeposit(DepositPaymentRequest request) {
        Booking booking = bookingRepository.findById(request.getBookingId())
                .orElseThrow(() -> new ResourceNotFoundException("Booking not found: " + request.getBookingId()));

        // Validate booking status
        if (!"PENDING_PAYMENT".equals(booking.getStatus())) {
            throw new RuntimeException("Booking không ở trạng thái chờ thanh toán");
        }

        // Validate deposit amount
        if (booking.getDepositAmount() == null || booking.getDepositAmount().compareTo(BigDecimal.ZERO) <= 0) {
            throw new RuntimeException("Booking không yêu cầu thanh toán deposit");
        }

        // Check if already paid
        if (booking.getDepositPaid() != null && 
            booking.getDepositPaid().compareTo(booking.getDepositAmount()) >= 0) {
            throw new RuntimeException("Deposit đã được thanh toán");
        }

        // Create payment record
        Payment payment = new Payment();
        payment.setBooking(booking);
        payment.setUser(booking.getUser());
        payment.setAmount(booking.getDepositAmount());
        payment.setMethod(request.getPaymentMethod());
        payment.setTransactionDate(Instant.now());
        
        paymentRepository.save(payment);

        // Update booking
        booking.setDepositPaid(booking.getDepositAmount());
        booking.setStatus("CONFIRMED"); // Đổi thành CONFIRMED thay vì PAYMENT_CONFIRMED
        booking.setPaymentStatus("DEPOSIT_PAID");
        booking.setConfirmedAt(LocalDateTime.now()); // Set thời điểm xác nhận
        
        if (request.getNotes() != null) {
            String currentNotes = booking.getNotes() != null ? booking.getNotes() : "";
            booking.setNotes(currentNotes + " | Deposit payment: " + request.getNotes());
        }

        bookingRepository.save(booking);

        log.info("Deposit paid for booking {} - Amount: {}", booking.getId(), booking.getDepositAmount());

        // Return updated booking response
        return bookingService.getBooking(booking.getId());
    }

    @Override
    public BookingResponse payRemaining(Integer bookingId, String paymentMethod) {
        Booking booking = bookingRepository.findById(bookingId)
                .orElseThrow(() -> new ResourceNotFoundException("Booking not found: " + bookingId));

        // Validate
        if (booking.getRemainingAmount() == null || 
            booking.getRemainingAmount().compareTo(BigDecimal.ZERO) <= 0) {
            throw new RuntimeException("Không có số tiền còn lại cần thanh toán");
        }

        // Create payment record
        Payment payment = new Payment();
        payment.setBooking(booking);
        payment.setUser(booking.getUser());
        payment.setAmount(booking.getRemainingAmount());
        payment.setMethod(com.badminton.booking.entity.enums.PaymentMethod.valueOf(paymentMethod));
        payment.setTransactionDate(Instant.now());
        
        paymentRepository.save(payment);

        // Update booking
        booking.setRemainingAmount(BigDecimal.ZERO);
        booking.setPaymentStatus("PAID");
        
        bookingRepository.save(booking);

        log.info("Remaining amount paid for booking {} - Amount: {}", 
            booking.getId(), payment.getAmount());

        return bookingService.getBooking(booking.getId());
    }
}
