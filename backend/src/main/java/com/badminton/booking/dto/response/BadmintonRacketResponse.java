package com.badminton.booking.dto.response;

import com.badminton.booking.entity.enums.RacketStatus;
import lombok.Getter;
import lombok.Setter;

import java.math.BigDecimal;

@Getter
@Setter
public class BadmintonRacketResponse {

    private Integer id;
    private String racketCode;
    private String brand;
    private String model;
    private RacketStatus status;
    private BigDecimal rentalPrice;
    private String conditionStatus;
    private String description;
}
