package com.badminton.booking.service.impl;

import com.badminton.booking.dto.user.UserCreateRequest;
import com.badminton.booking.dto.user.UserFilterRequest;
import com.badminton.booking.dto.user.UserProfileUpdateRequest;
import com.badminton.booking.dto.user.UserResponse;
import com.badminton.booking.dto.user.UserUpdateRequest;
import com.badminton.booking.entity.Role;
import com.badminton.booking.entity.User;
import com.badminton.booking.mapper.UserMapper;
import com.badminton.booking.repository.RoleRepository;
import com.badminton.booking.repository.UserRepository;
import com.badminton.booking.repository.specification.UserSpecification;
import com.badminton.booking.service.UserService;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class UserServiceImpl implements UserService {

    private final UserRepository userRepository;
    private final RoleRepository roleRepository;
    private final UserMapper userMapper;
    private final PasswordEncoder passwordEncoder;

    @Override
    @Transactional
    public UserResponse createUser(UserCreateRequest request) {
        if (userRepository.existsByUsername(request.getUsername())) {
            throw new IllegalArgumentException("Username already exists: " + request.getUsername());
        }

        User user = userMapper.toEntity(request);
        // Set default password for admin-created users
        String defaultPassword = "password@123";
        user.setPasswordHash(passwordEncoder.encode(defaultPassword));
        user.setCreatedAt(Instant.now());

        if (request.getRoleName() != null) {
            Role role = roleRepository.findByRoleName(request.getRoleName())
                    .orElseThrow(() -> new EntityNotFoundException("Role not found: " + request.getRoleName()));
            user.setRole(role);
        }

        User savedUser = userRepository.save(user);
        return userMapper.toResponse(savedUser);
    }

    @Override
    @Transactional(readOnly = true)
    public UserResponse getUserById(Integer id) {
        User user = userRepository.findByIdAndActiveTrue(id)
                .orElseThrow(() -> new EntityNotFoundException("User not found with id: " + id));
        return userMapper.toResponse(user);
    }

    @Override
    @Transactional(readOnly = true)
    public UserResponse getUserByUsername(String username) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new EntityNotFoundException("User not found with username: " + username));
        return userMapper.toResponse(user);
    }

    @Override
    @Transactional(readOnly = true)
    public Page<UserResponse> getAllUsers(Pageable pageable) {
        return userRepository.findAll(pageable)
                .map(userMapper::toResponse);
    }

    @Override
    @Transactional(readOnly = true)
    public Page<UserResponse> getAllUsers(UserFilterRequest filter, Pageable pageable) {
        return userRepository.findAll(UserSpecification.withFilter(filter), pageable)
                .map(userMapper::toResponse);
    }

    @Override
    @Transactional(readOnly = true)
    public List<UserResponse> getUsersByRole(String roleName) {
        return userRepository.findByRole_RoleName(roleName)
                .stream()
                .map(userMapper::toResponse)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional
    public UserResponse updateUser(Integer id, UserUpdateRequest request) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("User not found with id: " + id));

        if (request.getFullName() != null) {
            user.setFullName(request.getFullName());
        }
        if (request.getEmail() != null) {
            user.setEmail(request.getEmail());
        }
        if (request.getPhoneNumber() != null) {
            user.setPhoneNumber(request.getPhoneNumber());
        }
        if (request.getGender() != null) {
            user.setGender(request.getGender());
        }
        if (request.getDateOfBirth() != null) {
            user.setDateOfBirth(request.getDateOfBirth());
        }
        if (request.getAvatar() != null) {
            user.setAvatar(request.getAvatar());
        }
        if (request.getRoleName() != null) {
            Role role = roleRepository.findByRoleName(request.getRoleName())
                    .orElseThrow(() -> new EntityNotFoundException("Role not found: " + request.getRoleName()));
            user.setRole(role);
        }

        User updatedUser = userRepository.save(user);
        return userMapper.toResponse(updatedUser);
    }

    @Override
    @Transactional
    public UserResponse updateProfile(Integer id, UserProfileUpdateRequest request) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("User not found with id: " + id));

        if (request.getFullName() != null) {
            user.setFullName(request.getFullName());
        }
        if (request.getEmail() != null) {
            user.setEmail(request.getEmail());
        }
        if (request.getPhoneNumber() != null) {
            user.setPhoneNumber(request.getPhoneNumber());
        }
        if (request.getGender() != null) {
            user.setGender(request.getGender());
        }
        if (request.getDateOfBirth() != null) {
            user.setDateOfBirth(request.getDateOfBirth());
        }
        if (request.getAvatar() != null) {
            user.setAvatar(request.getAvatar());
        }

        User updatedUser = userRepository.save(user);
        return userMapper.toResponse(updatedUser);
    }

    @Override
    @Transactional
    public void deleteUser(Integer id) {
        User user = userRepository.findByIdAndActiveTrue(id)
                .orElseThrow(() -> new EntityNotFoundException("User not found with id: " + id));

        // Soft delete - set isActive to false instead of deleting from database
        user.setIsActive(false);
        userRepository.save(user);
    }

    @Override
    @Transactional
    public void reactivateUser(Integer id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("User not found with id: " + id));

        if (user.getIsActive()) {
            throw new IllegalStateException("User is already active");
        }

        // Reactivate user by setting isActive to true
        user.setIsActive(true);
        userRepository.save(user);
    }

    @Override
    public boolean existsByUsername(String username) {
        return userRepository.existsByUsername(username);
    }
}
