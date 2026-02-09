package com.badminton.booking.dto.request;

import com.badminton.booking.entity.enums.CourtStatus;
import com.badminton.booking.entity.enums.CourtType;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CourtFilterRequest {

    /**
     * Minimum price per hour filter (optional)
     */
    private BigDecimal minPrice;

    /**
     * Maximum price per hour filter (optional)
     */
    private BigDecimal maxPrice;

    /**
     * List of court types to include (optional)
     * If null or empty, all types are included
     */
    private List<CourtType> courtTypes;

    /**
     * Court status filter (optional)
     * Default: ACTIVE
     */
    private CourtStatus status;
}
