package com.badminton.booking.mapper;

import com.badminton.booking.dto.request.BadmintonCourtCreateRequest;
import com.badminton.booking.dto.request.BadmintonCourtUpdateRequest;
import com.badminton.booking.dto.response.BadmintonCourtResponse;
import com.badminton.booking.entity.BadmintonCourt;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.MappingTarget;

@Mapper(componentModel = "spring")
public interface BadmintonCourtMapper {

    @Mapping(target = "images", ignore = true)
    BadmintonCourt toEntity(BadmintonCourtCreateRequest badmintonCourt);

    @Mapping(target = "images", expression = "java(mapImages(badmintonCourt))")
    BadmintonCourtResponse toResponse(BadmintonCourt badmintonCourt);

    @Mapping(target = "images", ignore = true)
    void updateBadmintonCourt(@MappingTarget BadmintonCourt entity, BadmintonCourtUpdateRequest dto);

    default java.util.List<String> mapImages(BadmintonCourt court) {
        if (court.getImages() != null && !court.getImages().isEmpty()) {
            return court.getImages().stream()
                    .sorted(java.util.Comparator.comparingInt(com.badminton.booking.entity.CourtImage::getDisplayOrder))
                    .map(com.badminton.booking.entity.CourtImage::getImageUrl)
                    .collect(java.util.stream.Collectors.toList());
        }
        // Fallback to single imageUrl if collection is empty
        if (court.getImageUrl() != null && !court.getImageUrl().isEmpty()) {
            return java.util.Collections.singletonList(court.getImageUrl());
        }
        return new java.util.ArrayList<>();
    }

}
