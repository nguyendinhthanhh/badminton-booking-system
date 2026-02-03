package com.badminton.booking.mapper;

import com.badminton.booking.dto.request.CourtPriceRequest;
import com.badminton.booking.dto.response.CourtPriceResponse;
import com.badminton.booking.entity.CourtPrice;
import com.badminton.booking.entity.enums.DayType;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.MappingTarget;
import org.mapstruct.Named;

@Mapper(componentModel = "spring")
public interface CourtPriceMapper {

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "court", ignore = true)
    @Mapping(target = "createdAt", ignore = true)
    @Mapping(target = "updatedAt", ignore = true)
    CourtPrice toEntity(CourtPriceRequest request);

    @Mapping(source = "court.id", target = "courtId")
    @Mapping(source = "court.name", target = "courtName")
    @Mapping(source = "dayType", target = "dayTypeName", qualifiedByName = "dayTypeToName")
    CourtPriceResponse toResponse(CourtPrice courtPrice);

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "court", ignore = true)
    @Mapping(target = "createdAt", ignore = true)
    @Mapping(target = "updatedAt", ignore = true)
    void updateEntity(@MappingTarget CourtPrice courtPrice, CourtPriceRequest request);

    @Named("dayTypeToName")
    default String dayTypeToName(DayType dayType) {
        if (dayType == null) return null;
        return switch (dayType) {
            case WEEKDAY -> "Ngày thường";
            case WEEKEND -> "Cuối tuần";
            case HOLIDAY -> "Ngày lễ";
        };
    }
}

