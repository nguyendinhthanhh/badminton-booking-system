package com.badminton.booking.service;

import com.badminton.booking.dto.user.UserCreateRequest;
import com.badminton.booking.dto.user.UserFilterRequest;
import com.badminton.booking.dto.user.UserProfileUpdateRequest;
import com.badminton.booking.dto.user.UserResponse;
import com.badminton.booking.dto.user.UserUpdateRequest;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.List;

public interface UserService {

    UserResponse createUser(UserCreateRequest request);

    UserResponse getUserById(Integer id);

    UserResponse getUserByUsername(String username);

    Page<UserResponse> getAllUsers(Pageable pageable);

    Page<UserResponse> getAllUsers(UserFilterRequest filter, Pageable pageable);

    List<UserResponse> getUsersByRole(String roleName);

    UserResponse updateUser(Integer id, UserUpdateRequest request);

    UserResponse updateProfile(Integer id, UserProfileUpdateRequest request);

    void deleteUser(Integer id);

    void reactivateUser(Integer id);

    boolean existsByUsername(String username);

    void reindexUsers();
}
