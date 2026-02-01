package com.badminton.booking.service;

import com.badminton.booking.dto.request.ChangePasswordRequest;
import com.badminton.booking.dto.request.ForgotPasswordRequest;
import com.badminton.booking.dto.request.ResetPasswordRequest;

public interface PasswordService {

    /**
     * Gửi email chứa link reset password
     */
    String forgotPassword(ForgotPasswordRequest request);

    /**
     * Reset password với token
     */
    String resetPassword(ResetPasswordRequest request);

    /**
     * Đổi password cho user đang đăng nhập
     */
    String changePassword(String username, ChangePasswordRequest request);

    /**
     * Kiểm tra token có hợp lệ không
     */
    boolean validateResetToken(String token);
}

