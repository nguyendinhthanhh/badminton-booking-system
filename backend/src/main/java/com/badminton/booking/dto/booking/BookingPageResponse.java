package com.badminton.booking.dto.booking;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

/**
 * Response DTO cho danh sách booking có phân trang
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class BookingPageResponse {

    private List<BookingResponse> content;
    private int page;
    private int size;
    private long totalElements;
    private int totalPages;
    private boolean first;
    private boolean last;
}

