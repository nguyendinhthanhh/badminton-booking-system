package com.badminton.booking.controller;

import com.badminton.booking.dto.request.LoginRequest;
import com.badminton.booking.dto.request.RefreshTokenRequest;
import com.badminton.booking.dto.request.RegisterRequest;
import com.badminton.booking.dto.request.ResendVerificationRequest;
import com.badminton.booking.dto.response.AuthResponse;
import com.badminton.booking.security.AuthService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {
    @Autowired
    private AuthService authService;

    @PostMapping("/register")
    public ResponseEntity<?> register(@Valid @RequestBody RegisterRequest req) {
        return ResponseEntity.ok(authService.register(req));
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@Valid @RequestBody LoginRequest req) {
        AuthResponse resp = authService.login(req);
        return ResponseEntity.ok(resp);
    }

    @PostMapping("/refresh")
    public ResponseEntity<?> refreshToken(@RequestBody RefreshTokenRequest req) {
        try {
            AuthResponse resp = authService.refreshToken(req.getRefreshToken());
            return ResponseEntity.ok(resp);
        } catch (RuntimeException e) {
            return ResponseEntity.status(401).body(e.getMessage());
        }
    }

    @GetMapping("/verify-email")
    public ResponseEntity<?> verifyEmail(
            @RequestParam(value = "code", required = false) String code,
            @RequestParam(value = "token", required = false) String token
    ) {
        String verificationValue = (code != null && !code.isBlank()) ? code : token;
        if (verificationValue == null || verificationValue.isBlank()) {
            return ResponseEntity.badRequest().body("Verification code is required.");
        }

        return ResponseEntity.ok(authService.verifyEmail(verificationValue));
    }

    @PostMapping("/resend-verification")
    public ResponseEntity<?> resendVerification(@Valid @RequestBody ResendVerificationRequest request) {
        return ResponseEntity.ok(authService.resendVerificationEmail(request.getEmail()));
    }
}
