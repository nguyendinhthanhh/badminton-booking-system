package com.badminton.booking.service;

import com.badminton.booking.dto.request.BadmintonCourtCreateRequest;
import com.badminton.booking.dto.request.BadmintonCourtUpdateRequest;
import com.badminton.booking.dto.response.BadmintonCourtResponse;
import com.badminton.booking.dto.response.CourtDetailResponse;
import org.springframework.data.domain.Slice;

import java.time.LocalDate;

public interface BadmintonCourtService {

    BadmintonCourtResponse createBadmintonCourt(BadmintonCourtCreateRequest request);

    // Use Slice to avoid expensive COUNT query for faster pagination when total is
    // not required
    Slice<BadmintonCourtResponse> getAllBadmintonCourts(int page, int size);

    BadmintonCourtResponse getBadmintonCourtById(Integer id);

    void deleteBadmintonCourtById(Integer id);

    void updateBadmintonCourt(Integer id, BadmintonCourtUpdateRequest request);

    /**
     * Lấy chi tiết sân đầy đủ: thông tin + bảng giá + slot trống
     * Dùng cho trang Chi tiết sân
     */
    CourtDetailResponse getCourtDetail(Integer courtId, LocalDate date);

    /**
     * Filter courts by price, type, and status
     * 
     * @param minPrice Minimum price per hour (optional)
     * @param maxPrice Maximum price per hour (optional)
     * @param types    List of court types (optional)
     * @param status   Court status (default: ACTIVE)
     * @param page     Page number
     * @param size     Page size
     * @return Paginated filtered courts
     */
    Slice<BadmintonCourtResponse> filterCourts(
            java.math.BigDecimal minPrice,
            java.math.BigDecimal maxPrice,
            java.util.List<com.badminton.booking.entity.enums.CourtType> types,
            com.badminton.booking.entity.enums.CourtStatus status,
            int page,
            int size);
}
