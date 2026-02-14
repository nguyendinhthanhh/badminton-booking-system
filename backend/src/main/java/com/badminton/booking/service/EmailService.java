package com.badminton.booking.service;

public interface EmailService {
    void sendEmailVerification(String toEmail, String fullName, String verificationLink);

    void sendBookingConfirmation(
            String toEmail,
            String fullName,
            String courtName,
            String playDate,
            String startTime,
            String endTime,
            String totalPrice,
            String depositAmount
    );

    void sendBookingCancellation(
            String toEmail,
            String fullName,
            String courtName,
            String playDate,
            String startTime,
            String endTime,
            String reason
    );
}
