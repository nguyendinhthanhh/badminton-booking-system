package com.badminton.booking.security;

import com.badminton.booking.dto.request.LoginRequest;
import com.badminton.booking.dto.response.AuthResponse;
import com.badminton.booking.dto.response.RegisterRequest;
import com.badminton.booking.entity.RefreshToken;
import com.badminton.booking.entity.User;

import java.util.Map;

public interface AuthService {
    public RefreshToken createRefreshToken(User user);
    public RefreshToken verifyExpiration(RefreshToken token);
    public Map<String, String> refreshAccessToken(String refreshToken);
    public String register(RegisterRequest req);
    public AuthResponse login(LoginRequest request);
    public void deleteByUser(User user);
    public void logout(String refreshToken);
}
