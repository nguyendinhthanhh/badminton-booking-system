package com.badminton.booking.dto.request;

import jakarta.validation.constraints.PositiveOrZero;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.Setter;

import java.math.BigDecimal;

@Getter
@Setter
public class ProductUpdateRequest {

    @Size(max = 150)
    private String name;

    @Size(max = 100)
    private String sku;

    private String description;

    @PositiveOrZero
    private BigDecimal basePrice;

    @PositiveOrZero
    private Integer quantity;

    private Integer categoryId;
}
