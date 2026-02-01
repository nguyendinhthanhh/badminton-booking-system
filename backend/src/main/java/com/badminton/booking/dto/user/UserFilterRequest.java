package com.badminton.booking.dto.user;

import com.badminton.booking.entity.enums.Gender;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UserFilterRequest {

    private String keyword; // search by username, fullName, email, phoneNumber
    private String username;
    private String fullName;
    private String email;
    private String phoneNumber;
    private Gender gender;
    private String roleName;
    private LocalDate dateOfBirthFrom;
    private LocalDate dateOfBirthTo;
    private LocalDate createdAtFrom;
    private LocalDate createdAtTo;
}

