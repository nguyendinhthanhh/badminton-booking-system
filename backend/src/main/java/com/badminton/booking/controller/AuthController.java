package com.badminton.booking.controller;

import com.badminton.booking.dto.request.LoginRequest;
import com.badminton.booking.dto.response.AuthResponse;
import com.badminton.booking.dto.request.RegisterRequest;
import com.badminton.booking.security.AuthService;
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
    public ResponseEntity<?> register(@RequestBody RegisterRequest req) {
        authService.register(req);
        return ResponseEntity.ok("User registered successfully");
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody LoginRequest req) {
        AuthResponse resp = authService.login(req);
        return ResponseEntity.ok(resp);
    }
}
