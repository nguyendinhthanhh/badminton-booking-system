package com.badminton.booking.security;

import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;

@Component("userSecurity")
public class UserSecurity {

    public boolean isCurrentUser(Integer userId) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || !authentication.isAuthenticated()) {
            return false;
        }
        // Cần implement logic để so sánh userId với user hiện tại
        // Tạm thời return false, admin sẽ xử lý
        return false;
    }

    public boolean isCurrentUsername(String username) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || !authentication.isAuthenticated()) {
            return false;
        }
        return authentication.getName().equals(username);
    }
}

