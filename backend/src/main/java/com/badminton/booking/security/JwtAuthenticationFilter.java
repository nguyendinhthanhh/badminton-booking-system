package com.badminton.booking.security;


import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpMethod;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;
import org.springframework.util.AntPathMatcher;

import java.io.IOException;
import java.util.List;

@Component
@Slf4j
public class JwtAuthenticationFilter extends OncePerRequestFilter {

    @Autowired
    private JwtService jwtService;

    @Autowired
    private UserDetailsService userDetailsService;

    private static final AntPathMatcher PATH_MATCHER = new AntPathMatcher();

    // Danh sách các GET endpoint không cần JWT
    private static final List<String> PUBLIC_GET_PATHS = List.of(
            "/api/courts/all",
            "/api/courts/findById/**",
            "/api/courts/*/prices",
            "/api/courts/*/available-slots",
            "/api/courts/*/detail",
            "/api/courts/filter",
            "/api/time-slots",
            "/api/time-slots/active",
            "/api/time-slots/**",
            "/api/pricing/**",
            "/api/court-prices/**",
            "/api/users/check-username",
            "/api/schedule/public/**",
            "/api/bookings/check-availability",
            "/api/bookings/calculate-price",
            "/api/bookings/court/*/available-slots",
            "/api/bookings/court/*",
            "/api/warehouses/**",
            "/api/products/warehouse/**"
    );

    // Danh sách các endpoint PUBLIC cho mọi method (auth, swagger, password reset...)
    private static final List<String> PUBLIC_ALL_METHOD_PATHS = List.of(
            "/api/auth/**",
            "/api/password/forgot",
            "/api/password/reset",
            "/api/password/validate-token",
            "/swagger-ui/**",
            "/swagger-ui.html",
            "/v3/api-docs/**",
            "/api-docs/**"
    );

    // Danh sách các POST endpoint không cần JWT (tạo booking công khai)
    private static final List<String> PUBLIC_POST_PATHS = List.of(
            "/api/bookings"
    );

    /**
     * Bỏ qua filter với các public endpoint — tránh lỗi 401/403
     * khi frontend gửi token cũ/hết hạn cùng request không cần auth.
     */
    @Override
    protected boolean shouldNotFilter(HttpServletRequest request) {
        String path = request.getRequestURI();
        String method = request.getMethod();

        // OPTIONS luôn bỏ qua (CORS preflight)
        if (HttpMethod.OPTIONS.matches(method)) {
            return true;
        }

        // Các path public cho mọi method (auth, swagger, password...)
        if (PUBLIC_ALL_METHOD_PATHS.stream().anyMatch(pattern -> PATH_MATCHER.match(pattern, path))) {
            return true;
        }

        // Chỉ GET request mới được bỏ qua filter với các public GET paths
        if (HttpMethod.GET.matches(method)) {
            return PUBLIC_GET_PATHS.stream()
                    .anyMatch(pattern -> PATH_MATCHER.match(pattern, path));
        }

        // Các POST endpoint công khai (ví dụ: tạo booking không cần đăng nhập)
        if (HttpMethod.POST.matches(method)) {
            return PUBLIC_POST_PATHS.stream()
                    .anyMatch(pattern -> PATH_MATCHER.match(pattern, path));
        }

        return false;
    }

    // Bước lọc cho mỗi yêu cầu HTTP để xác thực JWT
    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain)
            throws ServletException, IOException {
        String token = null;
        String username = null;

        // Header Authorization chứa Bearer token
        final String authHeader = request.getHeader("Authorization");

        log.debug("[JwtFilter] {} {} | Authorization header: {}",
                request.getMethod(), request.getRequestURI(),
                authHeader != null ? authHeader.substring(0, Math.min(authHeader.length(), 30)) + "..." : "MISSING");

        if (authHeader != null && authHeader.startsWith("Bearer ")) {
            token = authHeader.substring(7);
            try {
                username = jwtService.extractUsername(token);
                log.debug("[JwtFilter] Extracted username: {}", username);
            } catch (Exception e) {
                log.warn("[JwtFilter] Invalid or expired token: {}", e.getMessage());
                // Token không hợp lệ hoặc đã hết hạn — trả về 401
                response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
                response.setContentType("application/json");
                response.getWriter().write("{\"error\":\"Invalid or expired token\"}");
                return;
            }
        }

        if (username != null && SecurityContextHolder.getContext().getAuthentication() == null) {
            UserDetails userDetails = this.userDetailsService.loadUserByUsername(username);
            if (jwtService.validateToken(token, userDetails)) {
                UsernamePasswordAuthenticationToken authToken = new UsernamePasswordAuthenticationToken(
                        userDetails, null, userDetails.getAuthorities());
                authToken.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));
                SecurityContextHolder.getContext().setAuthentication(authToken);
                log.debug("[JwtFilter] Authenticated user: {} | Authorities: {}", username, userDetails.getAuthorities());
            } else {
                log.warn("[JwtFilter] Token validation failed for user: {}", username);
                // Token không hợp lệ — trả về 401
                response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
                response.setContentType("application/json");
                response.getWriter().write("{\"error\":\"Invalid or expired token\"}");
                return;
            }
        }
        filterChain.doFilter(request, response);
    }

}
