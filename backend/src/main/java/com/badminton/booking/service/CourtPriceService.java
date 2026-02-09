package com.badminton.booking.service;

import com.badminton.booking.dto.request.CourtPriceRequest;
import com.badminton.booking.dto.response.CourtPriceResponse;
import com.badminton.booking.entity.enums.DayType;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;

public interface CourtPriceService {

    CourtPriceResponse createPrice(CourtPriceRequest request);

    CourtPriceResponse updatePrice(Integer id, CourtPriceRequest request);

    void deletePrice(Integer id);

    CourtPriceResponse getPriceById(Integer id);

    List<CourtPriceResponse> getPricesByCourtId(Integer courtId);

    List<CourtPriceResponse> getPricesByCourtIdAndDayType(Integer courtId, DayType dayType);

    /**
     * Lấy tất cả giá sân
     */
    List<CourtPriceResponse> getAllPrices();

    /**
     * Lấy giá cho sân tại thời điểm cụ thể
     * 
     * @param courtId ID sân
     * @param date    Ngày (để xác định WEEKDAY/WEEKEND)
     * @param time    Giờ
     * @return Giá/giờ
     */
    BigDecimal getPriceForTime(Integer courtId, LocalDate date, LocalTime time);

    /**
     * Tạo bảng giá mặc định cho sân
     */
    List<CourtPriceResponse> createDefaultPricesForCourt(Integer courtId);

    /**
     * Tạo nhiều giá cùng lúc (batch), tùy chọn xóa giá cũ
     */
    java.util.Map<String, Object> createPricesBatch(List<CourtPriceRequest> requests, boolean deleteExisting);
}
