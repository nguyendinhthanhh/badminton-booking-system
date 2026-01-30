package com.badminton.booking.dto.product;

import lombok.Getter;
import lombok.Setter;

import java.math.BigDecimal;

@Getter
@Setter
public class ProductResponse {

    private Integer id;
    private String name;
    private String sku;
    private String description;
    private BigDecimal basePrice;
    private Integer quantity;
    private Integer warehouseId;
    private Integer categoryId;
}
