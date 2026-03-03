package com.badminton.booking.service.impl;

import com.badminton.booking.dto.booking.DepositPaymentRequest;
import com.badminton.booking.dto.booking.BookingResponse;
import com.badminton.booking.entity.Booking;
import com.badminton.booking.entity.Payment;
import com.badminton.booking.entity.enums.PaymentMethod;
import com.badminton.booking.exception.ResourceNotFoundException;
import com.badminton.booking.repository.BookingRepository;
import com.badminton.booking.repository.PaymentRepository;
import com.badminton.booking.service.BookingService;
import com.badminton.booking.service.EmailService;
import com.badminton.booking.service.PaymentService;
import com.badminton.booking.service.VnPayService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.text.NumberFormat;
import java.util.Locale;
import java.util.Map;

@Service
@RequiredArgsConstructor
@Slf4j
@Transactional
public class PaymentServiceImpl implements PaymentService {

    private final BookingRepository bookingRepository;
    private final PaymentRepository paymentRepository;
    private final BookingService bookingService;
    private final EmailService emailService;
    private final VnPayService vnPayService;

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

        sendBookingConfirmationEmailSafely(booking);

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

    @Override
    public String createVnPayDepositUrl(DepositPaymentRequest request, String ipAddress) {
        Booking booking = bookingRepository.findById(request.getBookingId())
                .orElseThrow(() -> new ResourceNotFoundException("Booking not found: " + request.getBookingId()));

        if (!"PENDING_PAYMENT".equals(booking.getStatus())) {
            throw new RuntimeException("Booking không ở trạng thái chờ thanh toán");
        }

        if (booking.getDepositAmount() == null || booking.getDepositAmount().compareTo(BigDecimal.ZERO) <= 0) {
            throw new RuntimeException("Booking không yêu cầu thanh toán deposit");
        }

        if (booking.getDepositPaid() != null &&
                booking.getDepositPaid().compareTo(booking.getDepositAmount()) >= 0) {
            throw new RuntimeException("Deposit đã được thanh toán");
        }

        return vnPayService.createPaymentUrl(booking.getId(), booking.getDepositAmount(), ipAddress);
    }

    @Override
    public String createVnPayRemainingUrl(Integer bookingId, String ipAddress) {
        Booking booking = bookingRepository.findById(bookingId)
                .orElseThrow(() -> new ResourceNotFoundException("Booking not found: " + bookingId));

        if (!"CONFIRMED".equals(booking.getStatus())) {
            throw new RuntimeException("Chỉ có thể thanh toán phần còn lại cho booking đã CONFIRMED");
        }

        if (booking.getRemainingAmount() == null || booking.getRemainingAmount().compareTo(BigDecimal.ZERO) <= 0) {
            throw new RuntimeException("Booking không có số tiền còn lại cần thanh toán");
        }

        return vnPayService.createPaymentUrl(booking.getId(), booking.getRemainingAmount(), ipAddress);
    }

    @Override
    public BookingResponse confirmVnPayPayment(Map<String, String> vnpParams) {
        if (!vnPayService.validateSignature(vnpParams)) {
            throw new RuntimeException("Chữ ký VNPay không hợp lệ");
        }

        String responseCode = vnpParams.get("vnp_ResponseCode");
        if (!"00".equals(responseCode)) {
            throw new RuntimeException("Thanh toán VNPay thất bại với mã: " + responseCode);
        }

        String txnRef = vnpParams.get("vnp_TxnRef");
        Integer bookingId = vnPayService.extractBookingId(txnRef);
        if (bookingId == null) {
            throw new RuntimeException("Không xác định được booking từ giao dịch VNPay");
        }

        Booking booking = bookingRepository.findById(bookingId)
                .orElseThrow(() -> new ResourceNotFoundException("Booking not found: " + bookingId));

        BigDecimal depositAmount = booking.getDepositAmount() != null ? booking.getDepositAmount() : BigDecimal.ZERO;
        BigDecimal depositPaid = booking.getDepositPaid() != null ? booking.getDepositPaid() : BigDecimal.ZERO;
        BigDecimal remainingAmount = booking.getRemainingAmount() != null ? booking.getRemainingAmount()
                : BigDecimal.ZERO;

        if (depositAmount.compareTo(BigDecimal.ZERO) > 0 && depositPaid.compareTo(depositAmount) < 0) {
            // ===== Handle deposit payment =====
            Payment payment = new Payment();
            payment.setBooking(booking);
            payment.setUser(booking.getUser());
            payment.setAmount(depositAmount);
            payment.setMethod(PaymentMethod.VNPAY);
            payment.setTransactionDate(Instant.now());

            paymentRepository.save(payment);

            booking.setDepositPaid(depositAmount);
            booking.setStatus("CONFIRMED");
            booking.setPaymentStatus("DEPOSIT_PAID");
            booking.setConfirmedAt(LocalDateTime.now());

            bookingRepository.save(booking);

            sendBookingConfirmationEmailSafely(booking);
        } else if (remainingAmount.compareTo(BigDecimal.ZERO) > 0) {
            // ===== Handle remaining amount payment (check-in) =====
            Payment payment = new Payment();
            payment.setBooking(booking);
            payment.setUser(booking.getUser());
            payment.setAmount(remainingAmount);
            payment.setMethod(PaymentMethod.VNPAY);
            payment.setTransactionDate(Instant.now());

            paymentRepository.save(payment);

            booking.setRemainingAmount(BigDecimal.ZERO);
            booking.setPaymentStatus("PAID");
            booking.setStatus("PLAYING"); // CHECKED_IN / PLAYING state
            booking.setCheckedInAt(LocalDateTime.now());

            bookingRepository.save(booking);
        }

        return bookingService.getBooking(booking.getId());
    }

    private void sendBookingConfirmationEmailSafely(Booking booking) {
        if (booking.getUser() == null || booking.getUser().getEmail() == null || booking.getUser().getEmail().isBlank()) {
            return;
        }

        try {
            NumberFormat currencyFormatter = NumberFormat.getNumberInstance(new Locale("vi", "VN"));
            DateTimeFormatter dateFormatter = DateTimeFormatter.ofPattern("dd/MM/yyyy");
            DateTimeFormatter timeFormatter = DateTimeFormatter.ofPattern("HH:mm");

            emailService.sendBookingConfirmation(
                    booking.getUser().getEmail(),
                    booking.getUser().getFullName(),
                    booking.getCourt() != null ? booking.getCourt().getName() : "N/A",
                    booking.getPlayDate() != null ? booking.getPlayDate().format(dateFormatter) : "N/A",
                    booking.getStartTime() != null ? booking.getStartTime().format(timeFormatter) : "N/A",
                    booking.getEndTime() != null ? booking.getEndTime().format(timeFormatter) : "N/A",
                    booking.getTotalPrice() != null ? currencyFormatter.format(booking.getTotalPrice()) + " VND" : "N/A",
                    booking.getDepositAmount() != null ? currencyFormatter.format(booking.getDepositAmount()) + " VND" : "N/A"
            );
        } catch (Exception ex) {
            // Do not fail booking confirmation flow if email sending fails.
            log.warn("Failed to send booking confirmation email for booking {}: {}", booking.getId(), ex.getMessage());
        }
    }
}
