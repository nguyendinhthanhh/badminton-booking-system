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
import org.springframework.http.HttpMethod;

import java.util.Arrays;

@Configuration
@EnableWebSecurity
@EnableMethodSecurity

public class SecurityConfig {
    @Autowired
    private JwtAuthenticationFilter jwtAuthFilter;

    // Bước này xác thực thành công thì qua controller làm việc theo phân quyền, nếu
    // xác thực thất bại 1 là đăng nhập lại, 2 là báo lỗi không có quyền truy cập
    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http.cors(cors -> cors.configurationSource(corsConfigurationSource()))
                .csrf(csrf -> csrf.disable()) // Thường disable nếu dùng JWT
                .authorizeHttpRequests(auth -> auth
                        .requestMatchers(HttpMethod.OPTIONS, "/**").permitAll()
                        .requestMatchers("/api/auth/**").permitAll()
                        // Cho phép truy cập công khai cho guest users
                        .requestMatchers("/api/courts/all", "/api/courts/findById/**").permitAll()
                        // Cho phép xem giá sân và khung giờ công khai
                        .requestMatchers("/api/time-slots", "/api/time-slots/active", "/api/time-slots/{id}")
                        .permitAll()
                        .requestMatchers("/api/pricing/**", "/api/court-prices/**").permitAll()
                        // Cho phép kiểm tra username tồn tại
                        .requestMatchers("/api/users/check-username").permitAll()
                        // Cho phép forgot password và reset password
                        .requestMatchers("/api/password/forgot", "/api/password/reset", "/api/password/validate-token")
                        .permitAll()
                        // Cho phép truy cập Swagger UI và API docs công khai
                        .requestMatchers(
                                "/swagger-ui/**",
                                "/swagger-ui.html",
                                "/v3/api-docs/**",
                                "/api-docs/**")
                        .permitAll()
                        // API lịch đặt sân công khai cho guest/customer
                        .requestMatchers("/api/schedule/public/**").permitAll()

                        // API chi tiết sân công khai cho customer
                        .requestMatchers("/api/courts/*/prices").permitAll()
                        .requestMatchers("/api/courts/*/available-slots").permitAll()
                        .requestMatchers("/api/courts/*/detail").permitAll()
                        .requestMatchers("/api/courts/filter").permitAll()

                        // API booking công khai cho customer
                        .requestMatchers("/api/bookings/check-availability").permitAll()
                        .requestMatchers("/api/bookings/calculate-price").permitAll()
                        .requestMatchers("/api/bookings/court/*/available-slots").permitAll()
                        .requestMatchers("/api/bookings/court/*").permitAll()
                        .requestMatchers("/api/bookings").permitAll() // POST create booking
                        // Allow only GET for warehouses and shuttlecocks publicly; other methods require auth
                        .requestMatchers(HttpMethod.GET, "/api/warehouses/**").permitAll()
                        .requestMatchers(HttpMethod.GET, "/api/warehouses/*/shuttlecocks").permitAll()
                        // Allow GET for frontend product/shuttlecock path — POST/PUT/DELETE require auth + role
                        .requestMatchers(HttpMethod.GET, "/api/products/warehouse/**").permitAll()
                        .requestMatchers(HttpMethod.POST, "/api/products/**").hasAnyRole("ADMIN", "STAFF")
                        .requestMatchers(HttpMethod.PUT, "/api/products/**").hasAnyRole("ADMIN", "STAFF")
                        .requestMatchers(HttpMethod.DELETE, "/api/products/**").hasAnyRole("ADMIN", "STAFF")

                        // API lịch đặt sân - yêu cầu xác thực
                        .requestMatchers("/api/schedule/admin/**").authenticated()
                        // API quản lý người dùng - yêu cầu xác thực
                        .requestMatchers("/api/users/**").authenticated()
                        .anyRequest().authenticated())
                .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
                .addFilterBefore(jwtAuthFilter, UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    @Bean
    public AuthenticationManager authenticationManager(AuthenticationConfiguration authenticationConfiguration)
            throws Exception {
        return authenticationConfiguration.getAuthenticationManager();
    }

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration configuration = new CorsConfiguration();

        // Cho phép frontend ở port 3000, 3001 và Swagger UI
        configuration.setAllowedOrigins(Arrays.asList(
                "http://localhost:3000",
                "http://localhost:3001",
                "http://localhost:8080"));

        configuration.setAllowedMethods(Arrays.asList("GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"));
        configuration.setAllowedHeaders(Arrays.asList("*"));
        configuration.setExposedHeaders(Arrays.asList("Authorization"));
        configuration.setMaxAge(3600L);

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", configuration);
        return source;
    }
}
