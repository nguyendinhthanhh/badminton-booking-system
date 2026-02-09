package com.badminton.booking.specification;

import com.badminton.booking.entity.BadmintonCourt;
import com.badminton.booking.entity.CourtPrice;
import com.badminton.booking.entity.enums.CourtStatus;
import com.badminton.booking.entity.enums.CourtType;
import jakarta.persistence.criteria.Join;
import jakarta.persistence.criteria.JoinType;
import jakarta.persistence.criteria.Predicate;
import org.springframework.data.jpa.domain.Specification;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;

/**
 * JPA Specifications for filtering BadmintonCourt entities
 */
public class CourtSpecification {

    /**
     * Filter courts by type
     * 
     * @param types List of court types to include
     * @return Specification for court type filtering
     */
    public static Specification<BadmintonCourt> hasType(List<CourtType> types) {
        return (root, query, criteriaBuilder) -> {
            if (types == null || types.isEmpty()) {
                return criteriaBuilder.conjunction(); // No filter
            }
            return root.get("type").in(types);
        };
    }

    /**
     * Filter courts by status
     * 
     * @param status Court status (e.g., ACTIVE, INACTIVE)
     * @return Specification for status filtering
     */
    public static Specification<BadmintonCourt> hasStatus(CourtStatus status) {
        return (root, query, criteriaBuilder) -> {
            if (status == null) {
                return criteriaBuilder.conjunction(); // No filter
            }
            return criteriaBuilder.equal(root.get("status"), status);
        };
    }

    /**
     * Filter courts by price range (requires JOIN with court_prices)
     * 
     * @param minPrice Minimum price per hour (inclusive)
     * @param maxPrice Maximum price per hour (inclusive)
     * @return Specification for price range filtering
     */
    public static Specification<BadmintonCourt> hasPriceInRange(BigDecimal minPrice, BigDecimal maxPrice) {
        return (root, query, criteriaBuilder) -> {
            if (minPrice == null && maxPrice == null) {
                return criteriaBuilder.conjunction(); // No filter
            }

            // JOIN with court_prices table
            Join<BadmintonCourt, CourtPrice> priceJoin = root.join("courtPrices", JoinType.LEFT);

            List<Predicate> pricePredicates = new ArrayList<>();

            // Only consider active prices
            pricePredicates.add(criteriaBuilder.isTrue(priceJoin.get("isActive")));

            if (minPrice != null) {
                pricePredicates.add(
                        criteriaBuilder.greaterThanOrEqualTo(priceJoin.get("pricePerHour"), minPrice));
            }

            if (maxPrice != null) {
                pricePredicates.add(
                        criteriaBuilder.lessThanOrEqualTo(priceJoin.get("pricePerHour"), maxPrice));
            }

            // Ensure DISTINCT results (avoid duplicates from JOIN)
            query.distinct(true);

            return criteriaBuilder.and(pricePredicates.toArray(new Predicate[0]));
        };
    }

    /**
     * Combine all filter specifications
     * 
     * @param types    List of court types
     * @param status   Court status
     * @param minPrice Minimum price
     * @param maxPrice Maximum price
     * @return Combined specification
     */
    public static Specification<BadmintonCourt> buildFilterSpec(
            List<CourtType> types,
            CourtStatus status,
            BigDecimal minPrice,
            BigDecimal maxPrice) {

        return Specification.where(hasType(types))
                .and(hasStatus(status))
                .and(hasPriceInRange(minPrice, maxPrice));
    }
}
