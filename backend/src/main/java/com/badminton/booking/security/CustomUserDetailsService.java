package com.badminton.booking.security;

import com.badminton.booking.entity.User;
import com.badminton.booking.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

import java.util.Collection;
import java.util.Collections;

@Service
public class CustomUserDetailsService implements UserDetailsService {

    @Autowired
    private UserRepository userRepository;

    @Override
    // Load user details by username
    public UserDetails loadUserByUsername(String username) throws UsernameNotFoundException {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new UsernameNotFoundException("User not found"));
        return new org.springframework.security.core.userdetails.User(
                user.getUsername(),
                user.getPasswordHash(),
                getAuthority(user)
        );
    }
    // Get authorities from user roles
    private Collection<? extends GrantedAuthority> getAuthority(User user) {
        // Kiểm tra nếu user hoặc role bị null để tránh NullPointerException
        if (user.getRole() == null) {
            return Collections.emptyList();
        }

        // Trả về một danh sách chứa duy nhất 1 quyền
        return Collections.singletonList(
                new SimpleGrantedAuthority("ROLE_" + user.getRole().getRoleName())
        );
    }

}
