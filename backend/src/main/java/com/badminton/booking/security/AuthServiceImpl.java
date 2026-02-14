package com.badminton.booking.security;

import com.badminton.booking.dto.request.LoginRequest;
import com.badminton.booking.dto.request.RegisterRequest;
import com.badminton.booking.dto.response.AuthResponse;
import com.badminton.booking.entity.EmailVerificationToken;
import com.badminton.booking.entity.RefreshToken;
import com.badminton.booking.entity.Role;
import com.badminton.booking.entity.User;
import com.badminton.booking.repository.EmailVerificationTokenRepository;
import com.badminton.booking.repository.RefreshTokenRepo;
import com.badminton.booking.repository.RoleRepository;
import com.badminton.booking.repository.UserRepository;
import com.badminton.booking.service.EmailService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.UUID;

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
    @Autowired
    private EmailVerificationTokenRepository emailVerificationTokenRepository;
    @Autowired
    private EmailService emailService;
    @Autowired
    private EmailVerificationCipherService emailVerificationCipherService;

    @Value("${app.frontend.base-url:http://localhost:3000}")
    private String frontendBaseUrl;

    private static final int EMAIL_VERIFICATION_EXPIRY_HOURS = 24;

    @Override
    @Transactional
    public String register(RegisterRequest req) {
        if (userRepository.existsByUsername(req.getUsername())) {
            throw new RuntimeException("Username already taken");
        }
        if (userRepository.existsByEmail(req.getEmail())) {
            throw new RuntimeException("Email already registered");
        }

        User user = new User();
        user.setEmail(req.getEmail());
        user.setFullName(req.getFullName());
        user.setPasswordHash(passwordEncoder.encode(req.getPassword()));
        user.setPhoneNumber(req.getPhoneNumber());
        user.setUsername(req.getUsername());
        user.setGender(req.getGender());
        user.setDateOfBirth(req.getDateOfBirth());
        user.setEmailVerified(false);
        user.setEmailVerifiedAt(null);

        Role defaultRole = roleRepository.findByRoleName("USER")
                .orElseGet(() -> {
                    Role r = new Role();
                    r.setRoleName("USER");
                    return roleRepository.save(r);
                });

        user.setRole(defaultRole);
        userRepository.save(user);

        emailVerificationTokenRepository.deleteByUser(user);

        String token = UUID.randomUUID().toString();
        Instant expiryDate = Instant.now().plus(EMAIL_VERIFICATION_EXPIRY_HOURS, ChronoUnit.HOURS);
        EmailVerificationToken verificationToken = new EmailVerificationToken(token, user, expiryDate);
        emailVerificationTokenRepository.save(verificationToken);

        String encryptedToken = emailVerificationCipherService.encryptToken(token);
        String verifyLink = frontendBaseUrl + "/verify-email?code=" + encryptedToken;
        emailService.sendEmailVerification(user.getEmail(), user.getFullName(), verifyLink);

        return "User registered successfully. Please verify your email before login.";
    }

    @Override
    public AuthResponse login(LoginRequest request) {
        User user = userRepository.findByUsernameIncludingInactive(request.getUsername())
                .orElseThrow(() -> new RuntimeException("Invalid username or password"));

        if (!user.getIsActive()) {
            throw new RuntimeException("Account is deactivated. Please contact administrator.");
        }

        if (Boolean.FALSE.equals(user.getEmailVerified())) {
            throw new RuntimeException("Email is not verified. Please verify your email before login.");
        }

        authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(request.getUsername(), request.getPassword()));

        String accessToken = jwtService.generateAccessToken(user);
        String refreshTokenString = jwtService.generateRefreshToken();

        refreshTokenRepo.deleteByUser(user);

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
        RefreshToken refreshToken = refreshTokenRepo.findByToken(refreshTokenString)
                .orElseThrow(() -> new RuntimeException("Refresh token not found"));

        if (refreshToken.getExpiryDate().isBefore(Instant.now())) {
            refreshTokenRepo.delete(refreshToken);
            throw new RuntimeException("Refresh token has expired. Please login again.");
        }

        User user = refreshToken.getUser();

        if (!user.getIsActive()) {
            refreshTokenRepo.delete(refreshToken);
            throw new RuntimeException("Account is deactivated.");
        }

        String newAccessToken = jwtService.generateAccessToken(user);

        String newRefreshTokenString = jwtService.generateRefreshToken();
        refreshToken.setToken(newRefreshTokenString);
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
        response.setAccessToken(newAccessToken);
        response.setRefreshToken(newRefreshTokenString);
        response.setUser(userInfo);

        return response;
    }

    @Override
    public void logout(String username) {
        User user = userRepository.findByUsernameIncludingInactive(username)
                .orElseThrow(() -> new RuntimeException("User not found: " + username));

        refreshTokenRepo.deleteByUser(user);
    }

    @Override
    @Transactional
    public String verifyEmail(String token) {
        String resolvedToken = emailVerificationCipherService.tryDecryptToken(token).orElse(token);

        EmailVerificationToken verificationToken = emailVerificationTokenRepository.findByTokenAndUsedFalse(resolvedToken)
                .orElseThrow(() -> new RuntimeException("Verification token is invalid or already used."));

        if (verificationToken.isExpired()) {
            throw new RuntimeException("Verification token has expired. Please request a new one.");
        }

        User user = verificationToken.getUser();
        user.setEmailVerified(true);
        user.setEmailVerifiedAt(Instant.now());
        userRepository.save(user);

        verificationToken.setUsed(true);
        emailVerificationTokenRepository.save(verificationToken);

        return "Email verified successfully. You can now login.";
    }

    @Override
    @Transactional
    public String resendVerificationEmail(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User with this email was not found."));

        if (Boolean.TRUE.equals(user.getEmailVerified())) {
            return "Email is already verified.";
        }

        emailVerificationTokenRepository.deleteByUser(user);

        String token = UUID.randomUUID().toString();
        Instant expiryDate = Instant.now().plus(EMAIL_VERIFICATION_EXPIRY_HOURS, ChronoUnit.HOURS);
        EmailVerificationToken verificationToken = new EmailVerificationToken(token, user, expiryDate);
        emailVerificationTokenRepository.save(verificationToken);

        String encryptedToken = emailVerificationCipherService.encryptToken(token);
        String verifyLink = frontendBaseUrl + "/verify-email?code=" + encryptedToken;
        emailService.sendEmailVerification(user.getEmail(), user.getFullName(), verifyLink);

        return "Verification email sent successfully.";
    }
}
