package com.badminton.booking.security;

import com.badminton.booking.dto.request.LoginRequest;
import com.badminton.booking.dto.request.RegisterRequest;
import com.badminton.booking.dto.response.AuthResponse;

public interface AuthService {
    String register(RegisterRequest req);
    AuthResponse login(LoginRequest request);
}
