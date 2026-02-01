package com.badminton.booking.dto.user;

import com.badminton.booking.entity.enums.Gender;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

/**
 * DTO for user to update their own profile (không bao gồm role và password)
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UserProfileUpdateRequest {

    @Size(max = 150, message = "Full name must be at most 150 characters")
    private String fullName;

    @Email(message = "Email is not valid")
    @Size(max = 150, message = "Email must be at most 150 characters")
    private String email;

    @Size(max = 20, message = "Phone number must be at most 20 characters")
    private String phoneNumber;

    private Gender gender;

    private LocalDate dateOfBirth;

    @Size(max = 500, message = "Avatar URL must be at most 500 characters")
    private String avatar;
}

