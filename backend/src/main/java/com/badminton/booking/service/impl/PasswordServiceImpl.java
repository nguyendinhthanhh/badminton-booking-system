package com.badminton.booking.service.impl;

import com.badminton.booking.dto.request.ChangePasswordRequest;
import com.badminton.booking.dto.request.ForgotPasswordRequest;
import com.badminton.booking.dto.request.ResetPasswordRequest;
import com.badminton.booking.entity.PasswordResetToken;
import com.badminton.booking.entity.User;
import com.badminton.booking.repository.PasswordResetTokenRepository;
import com.badminton.booking.repository.UserRepository;
import com.badminton.booking.service.PasswordService;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
public class PasswordServiceImpl implements PasswordService {

    private final UserRepository userRepository;
    private final PasswordResetTokenRepository tokenRepository;
    private final PasswordEncoder passwordEncoder;

    // Token hết hạn sau 30 phút
    private static final int TOKEN_EXPIRY_MINUTES = 30;

    @Override
    @Transactional
    public String forgotPassword(ForgotPasswordRequest request) {
        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new EntityNotFoundException("Không tìm thấy user với email: " + request.getEmail()));

        // Xóa token cũ của user (nếu có)
        tokenRepository.deleteByUser(user);

        // Tạo token mới
        String token = UUID.randomUUID().toString();
        Instant expiryDate = Instant.now().plus(TOKEN_EXPIRY_MINUTES, ChronoUnit.MINUTES);

        PasswordResetToken resetToken = new PasswordResetToken(token, user, expiryDate);
        tokenRepository.save(resetToken);

        // TODO: Gửi email chứa link reset password
        // Link format: http://localhost:3000/reset-password?token={token}
        String resetLink = "http://localhost:3000/reset-password?token=" + token;

        log.info("Password reset link for user {}: {}", user.getEmail(), resetLink);

        // Trong thực tế, bạn sẽ gửi email ở đây
        // emailService.sendResetPasswordEmail(user.getEmail(), resetLink);

        return "Link đặt lại mật khẩu đã được gửi đến email của bạn. Token: " + token;
    }

    @Override
    @Transactional
    public String resetPassword(ResetPasswordRequest request) {
        // Validate passwords match
        if (!request.getNewPassword().equals(request.getConfirmPassword())) {
            throw new IllegalArgumentException("Mật khẩu xác nhận không khớp");
        }

        // Find token
        PasswordResetToken resetToken = tokenRepository.findByTokenAndUsedFalse(request.getToken())
                .orElseThrow(() -> new IllegalArgumentException("Token không hợp lệ hoặc đã được sử dụng"));

        // Check if token is expired
        if (resetToken.isExpired()) {
            throw new IllegalArgumentException("Token đã hết hạn. Vui lòng yêu cầu đặt lại mật khẩu mới.");
        }

        // Update password
        User user = resetToken.getUser();
        user.setPasswordHash(passwordEncoder.encode(request.getNewPassword()));
        userRepository.save(user);

        // Mark token as used
        resetToken.setUsed(true);
        tokenRepository.save(resetToken);

        log.info("Password reset successful for user: {}", user.getEmail());

        return "Đặt lại mật khẩu thành công. Vui lòng đăng nhập với mật khẩu mới.";
    }

    @Override
    @Transactional
    public String changePassword(String username, ChangePasswordRequest request) {
        // Validate passwords match
        if (!request.getNewPassword().equals(request.getConfirmPassword())) {
            throw new IllegalArgumentException("Mật khẩu xác nhận không khớp");
        }

        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new EntityNotFoundException("Không tìm thấy user: " + username));

        // Verify current password
        if (!passwordEncoder.matches(request.getCurrentPassword(), user.getPasswordHash())) {
            throw new IllegalArgumentException("Mật khẩu hiện tại không đúng");
        }

        // Check if new password is same as current
        if (passwordEncoder.matches(request.getNewPassword(), user.getPasswordHash())) {
            throw new IllegalArgumentException("Mật khẩu mới không được trùng với mật khẩu hiện tại");
        }

        // Update password
        user.setPasswordHash(passwordEncoder.encode(request.getNewPassword()));
        userRepository.save(user);

        log.info("Password changed successful for user: {}", username);

        return "Đổi mật khẩu thành công";
    }

    @Override
    public boolean validateResetToken(String token) {
        return tokenRepository.findByTokenAndUsedFalse(token)
                .map(resetToken -> !resetToken.isExpired())
                .orElse(false);
    }
}

