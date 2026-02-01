package com.badminton.booking.controller;

import com.badminton.booking.dto.request.ChangePasswordRequest;
import com.badminton.booking.dto.request.ForgotPasswordRequest;
import com.badminton.booking.dto.request.ResetPasswordRequest;
import com.badminton.booking.service.PasswordService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/password")
@RequiredArgsConstructor
@Tag(name = "Password Management", description = "APIs for password management")
public class PasswordController {

    private final PasswordService passwordService;

    @PostMapping("/forgot")
    @Operation(summary = "Request password reset", description = "Send reset password link to email")
    public ResponseEntity<Map<String, String>> forgotPassword(@Valid @RequestBody ForgotPasswordRequest request) {
        String message = passwordService.forgotPassword(request);
        return ResponseEntity.ok(Map.of("message", message));
    }

    @PostMapping("/reset")
    @Operation(summary = "Reset password", description = "Reset password using token from email")
    public ResponseEntity<Map<String, String>> resetPassword(@Valid @RequestBody ResetPasswordRequest request) {
        String message = passwordService.resetPassword(request);
        return ResponseEntity.ok(Map.of("message", message));
    }

    @PostMapping("/change")
    @Operation(summary = "Change password", description = "Change password for logged in user")
    public ResponseEntity<Map<String, String>> changePassword(
            Authentication authentication,
            @Valid @RequestBody ChangePasswordRequest request) {
        String username = authentication.getName();
        String message = passwordService.changePassword(username, request);
        return ResponseEntity.ok(Map.of("message", message));
    }

    @GetMapping("/validate-token")
    @Operation(summary = "Validate reset token", description = "Check if reset token is valid")
    public ResponseEntity<Map<String, Boolean>> validateToken(@RequestParam String token) {
        boolean valid = passwordService.validateResetToken(token);
        return ResponseEntity.ok(Map.of("valid", valid));
    }
}

