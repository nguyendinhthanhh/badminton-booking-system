package com.badminton.booking.security;

import com.badminton.booking.dto.request.LoginRequest;
import com.badminton.booking.dto.response.AuthResponse;
import com.badminton.booking.dto.request.RegisterRequest;
import com.badminton.booking.entity.RefreshToken;
import com.badminton.booking.entity.Role;
import com.badminton.booking.entity.User;
import com.badminton.booking.repository.RefreshTokenRepo;
import com.badminton.booking.repository.RoleRepository;
import com.badminton.booking.repository.UserRepository;

import java.time.Instant;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
public class AuthServiceImpl implements AuthService {
    @Autowired
    private UserRepository userRepository;
    @Autowired
    private PasswordEncoder passwordEncoder;
    @Autowired
    private AuthenticationManager authenticationManager;
    @Autowired
    private JwtService jwtService;
    @Autowired
    private RoleRepository roleRepository;
    @Autowired
    private RefreshTokenRepo refreshTokenRepo;

    public String register(RegisterRequest req) {
        if (userRepository.existsByUsername(req.getUsername())) {
            throw new RuntimeException("Username already taken");
        }

        User user = new User();
        user.setEmail(req.getEmail());
        user.setFullName(req.getFullName());
        user.setPasswordHash(passwordEncoder.encode(req.getPassword()));
        user.setPhoneNumber(req.getPhoneNumber());
        user.setUsername(req.getUsername());
        user.setGender(req.getGender());
        user.setDateOfBirth(req.getDateOfBirth());

        // Lấy role mặc định từ DB
        Role defaultRole = roleRepository.findByRoleName("USER")
                .orElseGet(() -> {
                    Role r = new Role();
                    r.setRoleName("USER");
                    return roleRepository.save(r);
                });

        user.setRole(defaultRole);
        userRepository.save(user);
        return "User registered successfully";
    }

    public AuthResponse login(LoginRequest request) {
        // First check if user exists and is active
        User user = userRepository.findByUsernameIncludingInactive(request.getUsername())
                .orElseThrow(() -> new RuntimeException("Invalid username or password"));

        // Check if user is active
        if (!user.getIsActive()) {
            throw new RuntimeException("Account is deactivated. Please contact administrator.");
        }

        authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(request.getUsername(), request.getPassword()));

        String accessToken = jwtService.generateAccessToken(user);

        // Tạo refresh token
        String refreshTokenString = jwtService.generateRefreshToken();

        // Xóa refresh token cũ của user (nếu có)
        refreshTokenRepo.deleteByUser(user);

        // Tạo và lưu refresh token mới
        RefreshToken refreshToken = new RefreshToken();
        refreshToken.setToken(refreshTokenString);
        refreshToken.setUser(user);
        refreshToken.setExpiryDate(Instant.now().plusMillis(jwtService.getRefreshTokenExpiration()));
        refreshTokenRepo.save(refreshToken);

        AuthResponse.UserInfo userInfo = new AuthResponse.UserInfo(
                user.getId().longValue(),
                user.getUsername(),
                user.getEmail(),
                user.getFullName(),
                user.getPhoneNumber(),
                user.getRole() != null ? user.getRole().getRoleName() : "USER");

        AuthResponse response = new AuthResponse();
        response.setTokenType("Bearer");
        response.setAccessToken(accessToken);
        response.setRefreshToken(refreshTokenString);
        response.setUser(userInfo);

        return response;
    }

    @Override
    public AuthResponse refreshToken(String refreshTokenString) {
        // Tìm refresh token trong DB
        RefreshToken refreshToken = refreshTokenRepo.findByToken(refreshTokenString)
                .orElseThrow(() -> new RuntimeException("Refresh token not found"));

        // Kiểm tra hết hạn
        if (refreshToken.getExpiryDate().isBefore(Instant.now())) {
            refreshTokenRepo.delete(refreshToken);
            throw new RuntimeException("Refresh token has expired. Please login again.");
        }

        User user = refreshToken.getUser();

        // Kiểm tra user còn active không
        if (!user.getIsActive()) {
            refreshTokenRepo.delete(refreshToken);
            throw new RuntimeException("Account is deactivated.");
        }

        // Tạo access token mới
        String newAccessToken = jwtService.generateAccessToken(user);

        // Rotate refresh token (tạo token mới để tăng security)
        String newRefreshTokenString = jwtService.generateRefreshToken();
        refreshToken.setToken(newRefreshTokenString);
        refreshToken.setExpiryDate(Instant.now().plusMillis(jwtService.getRefreshTokenExpiration()));
        refreshTokenRepo.save(refreshToken);

        // Build response
        AuthResponse.UserInfo userInfo = new AuthResponse.UserInfo(
                user.getId().longValue(),
                user.getUsername(),
                user.getEmail(),
                user.getFullName(),
                user.getPhoneNumber(),
                user.getRole() != null ? user.getRole().getRoleName() : "USER");

        AuthResponse response = new AuthResponse();
        response.setTokenType("Bearer");
        response.setAccessToken(newAccessToken);
        response.setRefreshToken(newRefreshTokenString);
        response.setUser(userInfo);

        return response;
    }

    @Override
    public void logout(String username) {
        User user = userRepository.findByUsernameIncludingInactive(username)
                .orElseThrow(() -> new RuntimeException("User not found: " + username));

        // Delete all refresh tokens for this user to invalidate sessions
        refreshTokenRepo.deleteByUser(user);
    }
}
