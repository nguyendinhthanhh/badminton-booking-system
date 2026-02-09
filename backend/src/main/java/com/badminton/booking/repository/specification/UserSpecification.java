package com.badminton.booking.repository.specification;

import com.badminton.booking.dto.user.UserFilterRequest;
import com.badminton.booking.entity.User;
import jakarta.persistence.criteria.JoinType;
import jakarta.persistence.criteria.Predicate;
import org.springframework.data.jpa.domain.Specification;

import java.time.LocalTime;
import java.time.ZoneId;
import java.util.ArrayList;
import java.util.List;

public class UserSpecification {

    public static Specification<User> withFilter(UserFilterRequest filter) {
        return (root, query, criteriaBuilder) -> {
            List<Predicate> predicates = new ArrayList<>();

            // Join with Role for filtering
            var roleJoin = root.join("role", JoinType.LEFT);

            // Keyword search (username, fullName, email, phoneNumber)
            if (filter.getKeyword() != null && !filter.getKeyword().trim().isEmpty()) {
                String normalizedKeyword = removeAccents(filter.getKeyword().toLowerCase().trim());
                String likePattern = "%" + normalizedKeyword + "%";

                // Search in normalized text
                Predicate searchTextPredicate = criteriaBuilder.like(root.get("searchText"), likePattern);

                // Fallback to legacy fields for non-indexed users
                String rawKeyword = filter.getKeyword().toLowerCase().trim();
                String rawLikePattern = "%" + rawKeyword + "%";

                Predicate legacyPredicate = criteriaBuilder.or(
                        criteriaBuilder.like(criteriaBuilder.lower(root.get("username")), rawLikePattern),
                        criteriaBuilder.like(criteriaBuilder.lower(root.get("fullName")), rawLikePattern),
                        criteriaBuilder.like(criteriaBuilder.lower(root.get("email")), rawLikePattern),
                        criteriaBuilder.like(criteriaBuilder.lower(root.get("phoneNumber")), rawLikePattern));

                predicates.add(criteriaBuilder.or(searchTextPredicate, legacyPredicate));
            }

            // Filter by username
            if (filter.getUsername() != null && !filter.getUsername().trim().isEmpty()) {
                predicates.add(criteriaBuilder.like(
                        criteriaBuilder.lower(root.get("username")),
                        "%" + filter.getUsername().toLowerCase().trim() + "%"));
            }

            // Filter by fullName
            if (filter.getFullName() != null && !filter.getFullName().trim().isEmpty()) {
                predicates.add(criteriaBuilder.like(
                        criteriaBuilder.lower(root.get("fullName")),
                        "%" + filter.getFullName().toLowerCase().trim() + "%"));
            }

            // Filter by email
            if (filter.getEmail() != null && !filter.getEmail().trim().isEmpty()) {
                predicates.add(criteriaBuilder.like(
                        criteriaBuilder.lower(root.get("email")),
                        "%" + filter.getEmail().toLowerCase().trim() + "%"));
            }

            // Filter by phoneNumber
            if (filter.getPhoneNumber() != null && !filter.getPhoneNumber().trim().isEmpty()) {
                predicates.add(criteriaBuilder.like(
                        root.get("phoneNumber"),
                        "%" + filter.getPhoneNumber().trim() + "%"));
            }

            // Filter by gender
            if (filter.getGender() != null) {
                predicates.add(criteriaBuilder.equal(root.get("gender"), filter.getGender()));
            }

            // Filter by role name
            if (filter.getRoleName() != null && !filter.getRoleName().trim().isEmpty()) {
                predicates.add(criteriaBuilder.equal(
                        criteriaBuilder.lower(roleJoin.get("roleName")),
                        filter.getRoleName().toLowerCase().trim()));
            }

            // Filter by date of birth range
            if (filter.getDateOfBirthFrom() != null) {
                predicates.add(criteriaBuilder.greaterThanOrEqualTo(
                        root.get("dateOfBirth"), filter.getDateOfBirthFrom()));
            }
            if (filter.getDateOfBirthTo() != null) {
                predicates.add(criteriaBuilder.lessThanOrEqualTo(
                        root.get("dateOfBirth"), filter.getDateOfBirthTo()));
            }

            // Filter by created at range
            if (filter.getCreatedAtFrom() != null) {
                predicates.add(criteriaBuilder.greaterThanOrEqualTo(
                        root.get("createdAt"),
                        filter.getCreatedAtFrom().atStartOfDay(ZoneId.systemDefault()).toInstant()));
            }
            if (filter.getCreatedAtTo() != null) {
                predicates.add(criteriaBuilder.lessThanOrEqualTo(
                        root.get("createdAt"),
                        filter.getCreatedAtTo().atTime(LocalTime.MAX).atZone(ZoneId.systemDefault()).toInstant()));
            }

            // Always filter to show only active users
            predicates.add(criteriaBuilder.equal(root.get("isActive"), true));

            return criteriaBuilder.and(predicates.toArray(new Predicate[0]));
        };
    }

    private static String removeAccents(String text) {
        if (text == null)
            return null;
        String normalized = java.text.Normalizer.normalize(text, java.text.Normalizer.Form.NFD);
        return normalized.replaceAll("\\p{InCombiningDiacriticalMarks}+", "").replaceAll("đ", "d").replaceAll("Đ", "D");
    }
}
