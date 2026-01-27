package com.badminton.booking.dto.request;

import com.badminton.booking.entity.enums.CourtStatus;
import com.badminton.booking.entity.enums.CourtType;
import jakarta.validation.constraints.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class BadmintonCourtUpdateRequest {

    @NotBlank(message = "Court name must not be blank")
    @Size(
            max = 100,
            message = "Court name must not exceed 100 characters"
    )
    private String name;

    @NotNull(message = "Court status is required")
    private CourtStatus status;


    private CourtType type;

    @Size(
            max = 255,
            message = "Location must not exceed 255 characters"
    )
    private String location;

    @Size(
            max = 2000,
            message = "Description must not exceed 2000 characters"
    )
    private String description;

    @Size(
            max = 500,
            message = "Image URL must not exceed 500 characters"
    )

    private String imageUrl;

    @NotNull(message = "Capacity is required")
    @Min(
            value = 1,
            message = "Capacity must be at least 1"
    )
    @Max(
            value = 20,
            message = "Capacity must not exceed 20"
    )
    private Integer capacity;
}
