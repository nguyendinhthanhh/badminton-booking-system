package com.badminton.booking.service.impl;

import com.badminton.booking.service.EmailService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
@Slf4j
public class EmailServiceImpl implements EmailService {

    private final JavaMailSender mailSender;

    @Value("${spring.mail.username:}")
    private String fromEmail;

    @Override
    public void sendEmailVerification(String toEmail, String fullName, String verificationLink) {
        if (fromEmail == null || fromEmail.isBlank()) {
            throw new RuntimeException("Email sender is not configured. Please set MAIL_USERNAME.");
        }

        String displayName = (fullName == null || fullName.isBlank()) ? "bạn" : fullName;

        SimpleMailMessage message = new SimpleMailMessage();
        message.setFrom(fromEmail);
        message.setTo(toEmail);
        message.setSubject("Xác thực email tài khoản Badminton Booking");
        message.setText(
                "Xin chào " + displayName + ",\n\n"
                        + "Vui lòng xác thực email để kích hoạt tài khoản của bạn bằng cách bấm vào link sau:\n"
                        + verificationLink + "\n\n"
                        + "Link có hiệu lực trong 24 giờ.\n\n"
                        + "Nếu bạn không tạo tài khoản này, vui lòng bỏ qua email.\n"
        );

        mailSender.send(message);
        log.info("Email verification sent to {}", toEmail);
    }

    @Override
    public void sendBookingConfirmation(
            String toEmail,
            String fullName,
            String courtName,
            String playDate,
            String startTime,
            String endTime,
            String totalPrice,
            String depositAmount
    ) {
        if (fromEmail == null || fromEmail.isBlank()) {
            throw new RuntimeException("Email sender is not configured. Please set MAIL_USERNAME.");
        }

        String displayName = (fullName == null || fullName.isBlank()) ? "bạn" : fullName;

        SimpleMailMessage message = new SimpleMailMessage();
        message.setFrom(fromEmail);
        message.setTo(toEmail);
        message.setSubject("Xác nhận đặt sân thành công - Badminton Booking");
        message.setText(
                "Xin chào " + displayName + ",\n\n"
                        + "Bạn đã đặt sân thành công.\n"
                        + "Thông tin đặt sân:\n"
                        + "- Sân: " + courtName + "\n"
                        + "- Ngày chơi: " + playDate + "\n"
                        + "- Khung giờ: " + startTime + " - " + endTime + "\n"
                        + "- Tổng tiền: " + totalPrice + "\n"
                        + "- Tiền cọc đã thanh toán: " + depositAmount + "\n\n"
                        + "Vui lòng đến sân đúng giờ để check-in.\n"
                        + "Cảm ơn bạn đã sử dụng Badminton Booking.\n"
        );

        mailSender.send(message);
        log.info("Booking confirmation email sent to {}", toEmail);
    }

    @Override
    public void sendBookingCancellation(
            String toEmail,
            String fullName,
            String courtName,
            String playDate,
            String startTime,
            String endTime,
            String reason
    ) {
        if (fromEmail == null || fromEmail.isBlank()) {
            throw new RuntimeException("Email sender is not configured. Please set MAIL_USERNAME.");
        }

        String displayName = (fullName == null || fullName.isBlank()) ? "bạn" : fullName;
        String cancellationReason = (reason == null || reason.isBlank()) ? "Không có lý do cụ thể." : reason;

        SimpleMailMessage message = new SimpleMailMessage();
        message.setFrom(fromEmail);
        message.setTo(toEmail);
        message.setSubject("Thông báo hủy đặt sân - Badminton Booking");
        message.setText(
                "Xin chào " + displayName + ",\n\n"
                        + "Đơn đặt sân của bạn đã được hủy thành công.\n"
                        + "Thông tin booking:\n"
                        + "- Sân: " + courtName + "\n"
                        + "- Ngày chơi: " + playDate + "\n"
                        + "- Khung giờ: " + startTime + " - " + endTime + "\n"
                        + "- Lý do hủy: " + cancellationReason + "\n\n"
                        + "Nếu cần hỗ trợ thêm, vui lòng liên hệ Badminton Booking.\n"
        );

        mailSender.send(message);
        log.info("Booking cancellation email sent to {}", toEmail);
    }
}
