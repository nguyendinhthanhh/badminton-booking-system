package com.badminton.booking.controller;

import com.badminton.booking.dto.user.UserCreateRequest;
import com.badminton.booking.dto.user.UserFilterRequest;
import com.badminton.booking.dto.user.UserProfileUpdateRequest;
import com.badminton.booking.dto.user.UserResponse;
import com.badminton.booking.dto.user.UserUpdateRequest;
import com.badminton.booking.entity.enums.Gender;
import com.badminton.booking.security.AuthService;
import com.badminton.booking.service.UserService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
@Tag(name = "User Management", description = "APIs for managing users")
public class UserController {

    private final UserService userService;
    private final AuthService authService;

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Create a new user", description = "Admin only - Creates user with default password 'password@123'")
    public ResponseEntity<UserResponse> createUser(@Valid @RequestBody UserCreateRequest request) {
        UserResponse response = userService.createUser(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN') or @userSecurity.isCurrentUser(#id)")
    @Operation(summary = "Get user by ID")
    public ResponseEntity<UserResponse> getUserById(@PathVariable Integer id) {
        UserResponse response = userService.getUserById(id);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/username/{username}")
    @PreAuthorize("hasRole('ADMIN') or @userSecurity.isCurrentUsername(#username)")
    @Operation(summary = "Get user by username")
    public ResponseEntity<UserResponse> getUserByUsername(@PathVariable String username) {
        UserResponse response = userService.getUserByUsername(username);
        return ResponseEntity.ok(response);
    }

    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Get all users with pagination and filter", description = "Admin only")
    public ResponseEntity<Page<UserResponse>> getAllUsers(
            @Parameter(description = "Search keyword (username, fullName, email, phoneNumber)") @RequestParam(required = false) String keyword,
            @Parameter(description = "Filter by username") @RequestParam(required = false) String username,
            @Parameter(description = "Filter by full name") @RequestParam(required = false) String fullName,
            @Parameter(description = "Filter by email") @RequestParam(required = false) String email,
            @Parameter(description = "Filter by phone number") @RequestParam(required = false) String phoneNumber,
            @Parameter(description = "Filter by gender (MALE, FEMALE, OTHER)") @RequestParam(required = false) Gender gender,
            @Parameter(description = "Filter by role name") @RequestParam(required = false) String roleName,
            @Parameter(description = "Filter by date of birth from (yyyy-MM-dd)") @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate dateOfBirthFrom,
            @Parameter(description = "Filter by date of birth to (yyyy-MM-dd)") @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate dateOfBirthTo,
            @Parameter(description = "Filter by created at from (yyyy-MM-dd)") @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate createdAtFrom,
            @Parameter(description = "Filter by created at to (yyyy-MM-dd)") @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate createdAtTo,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "id") String sortBy,
            @RequestParam(defaultValue = "asc") String sortDir) {

        Sort sort = sortDir.equalsIgnoreCase("desc")
                ? Sort.by(sortBy).descending()
                : Sort.by(sortBy).ascending();
        Pageable pageable = PageRequest.of(page, size, sort);

        UserFilterRequest filter = UserFilterRequest.builder()
                .keyword(keyword)
                .username(username)
                .fullName(fullName)
                .email(email)
                .phoneNumber(phoneNumber)
                .gender(gender)
                .roleName(roleName)
                .dateOfBirthFrom(dateOfBirthFrom)
                .dateOfBirthTo(dateOfBirthTo)
                .createdAtFrom(createdAtFrom)
                .createdAtTo(createdAtTo)
                .build();

        Page<UserResponse> response = userService.getAllUsers(filter, pageable);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/role/{roleName}")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Get users by role", description = "Admin only")
    public ResponseEntity<List<UserResponse>> getUsersByRole(@PathVariable String roleName) {
        List<UserResponse> response = userService.getUsersByRole(roleName);
        return ResponseEntity.ok(response);
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Update user by Admin", description = "Admin only - can update all fields including role")
    public ResponseEntity<UserResponse> updateUser(
            @PathVariable Integer id,
            @Valid @RequestBody UserUpdateRequest request) {
        UserResponse response = userService.updateUser(id, request);
        return ResponseEntity.ok(response);
    }

    @PutMapping("/profile")
    @PreAuthorize("isAuthenticated()")
    @Operation(summary = "Update own profile", description = "User can only update their own profile (cannot change role or password)")
    public ResponseEntity<UserResponse> updateProfile(
            @Valid @RequestBody UserProfileUpdateRequest request) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String username = authentication.getName();
        UserResponse currentUser = userService.getUserByUsername(username);
        UserResponse response = userService.updateProfile(currentUser.getId(), request);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/me")
    @PreAuthorize("isAuthenticated()")
    @Operation(summary = "Get current user profile", description = "Get profile of currently logged in user")
    public ResponseEntity<UserResponse> getCurrentUser() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String username = authentication.getName();
        UserResponse response = userService.getUserByUsername(username);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/logout")
    @PreAuthorize("isAuthenticated()")
    @Operation(summary = "Logout current user", description = "Invalidates all refresh tokens for the current user")
    public ResponseEntity<String> logout() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String username = authentication.getName();
        authService.logout(username);
        return ResponseEntity.ok("Logged out successfully");
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Delete user (soft delete)", description = "Admin only - Deactivates user by setting isActive to false")
    public ResponseEntity<Void> deleteUser(@PathVariable Integer id) {
        userService.deleteUser(id);
        return ResponseEntity.noContent().build();
    }

    @PutMapping("/{id}/reactivate")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Reactivate deactivated user", description = "Admin only - Reactivates a previously deactivated user")
    public ResponseEntity<String> reactivateUser(@PathVariable Integer id) {
        userService.reactivateUser(id);
        return ResponseEntity.ok("User reactivated successfully");
    }

    @GetMapping("/check-username")
    @Operation(summary = "Check if username exists")
    public ResponseEntity<Boolean> checkUsernameExists(@RequestParam String username) {
        boolean exists = userService.existsByUsername(username);
        return ResponseEntity.ok(exists);
    }

    @PostMapping("/reindex")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Re-index all users for search", description = "Admin only - Updates searchText for all users")
    public ResponseEntity<String> reindexUsers() {
        userService.reindexUsers();
        return ResponseEntity.ok("User search index updated successfully");
    }
}
