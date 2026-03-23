package com.badminton.booking.dto.request;

import com.badminton.booking.entity.enums.RacketStatus;
import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.Setter;

import java.math.BigDecimal;

@Getter
@Setter
public class BadmintonRacketUpdateRequest {

    @Size(max = 50)
    private String racketCode;

    @Size(max = 100)
    private String brand;

    @Size(max = 100)
    private String model;

    private RacketStatus status;

    @Positive
    private BigDecimal rentalPrice;

    @Size(max = 50)
    private String conditionStatus;

    private String description;
}
