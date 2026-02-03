package com.badminton.booking.security;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.util.Arrays;

@Configuration
@EnableWebSecurity
@EnableMethodSecurity

public class SecurityConfig {
    @Autowired
    private JwtAuthenticationFilter jwtAuthFilter;
    // Bước này xác thực thành công thì qua controller làm việc theo phân quyền, nếu xác thực thất bại 1 là đăng nhập lại, 2 là báo lỗi không có quyền truy cập
    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
                http.cors(cors -> cors.configurationSource(corsConfigurationSource()))
                .csrf(csrf -> csrf.disable()) // Thường disable nếu dùng JWT
                .authorizeHttpRequests(auth -> auth
                        .requestMatchers("/api/auth/**").permitAll()
                        // Cho phép truy cập công khai cho guest users
                        .requestMatchers("/api/courts/all", "/api/courts/findById/**").permitAll()
                        // Cho phép xem giá sân và khung giờ công khai
                        .requestMatchers("/api/time-slots", "/api/time-slots/active", "/api/time-slots/{id}").permitAll()
                        .requestMatchers("/api/pricing/**").permitAll()
                        // Cho phép kiểm tra username tồn tại
                        .requestMatchers("/api/users/check-username").permitAll()
                        // Cho phép forgot password và reset password
                        .requestMatchers("/api/password/forgot", "/api/password/reset", "/api/password/validate-token").permitAll()
                        // Cho phép truy cập Swagger UI và API docs công khai
                        .requestMatchers(
                                "/swagger-ui/**",
                                "/swagger-ui.html",
                                "/v3/api-docs/**",
                                "/api-docs/**"
                        ).permitAll()
                        // API lịch đặt sân - yêu cầu xác thực
                        .requestMatchers("/api/schedule/admin/**").authenticated()
                        // API quản lý người dùng - yêu cầu xác thực
                        .requestMatchers("/api/users/**").authenticated()
                        .anyRequest().authenticated()
                )
                .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
                .addFilterBefore(jwtAuthFilter, UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    @Bean
    public AuthenticationManager authenticationManager(AuthenticationConfiguration authenticationConfiguration) throws Exception {
        return authenticationConfiguration.getAuthenticationManager();
    }
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration configuration = new CorsConfiguration();

        // Cho phép frontend ở port 3000, 3001 và Swagger UI
        configuration.setAllowedOrigins(Arrays.asList(
                "http://localhost:3000",
                "http://localhost:3001",
                "http://localhost:8080"
        ));

        configuration.setAllowedMethods(Arrays.asList("GET", "POST", "PUT", "DELETE", "OPTIONS"));
        configuration.setAllowedHeaders(Arrays.asList("Authorization", "Content-Type", "Accept"));
        configuration.setMaxAge(3600L);

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", configuration);
        return source;
    }
}
