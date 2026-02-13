package com.badminton.booking.dto.report;

import lombok.Builder;
import lombok.Getter;
import lombok.Setter;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.Map;

@Getter
@Setter
@Builder
public class AdminDashboardReportResponse {
    private String reportType;
    private LocalDate fromDate;
    private LocalDate toDate;
    private Summary summary;
    private List<RevenuePoint> revenueSeries;
    private List<TopCourt> topCourts;
    private List<RecentBooking> recentBookings;
    private Map<String, Long> statusBreakdown;

    @Getter
    @Setter
    @Builder
    public static class Summary {
        private BigDecimal totalRevenue;
        private String revenueChange;
        private Long totalBookings;
        private String bookingChange;
        private Long activeCustomers;
        private String customerChange;
        private Double occupancyRate;
        private String occupancyChange;
    }

    @Getter
    @Setter
    @Builder
    public static class RevenuePoint {
        private LocalDate date;
        private BigDecimal revenue;
    }

    @Getter
    @Setter
    @Builder
    public static class TopCourt {
        private Integer courtId;
        private String courtName;
        private Long bookings;
        private BigDecimal revenue;
        private Double percentage;
    }

    @Getter
    @Setter
    @Builder
    public static class RecentBooking {
        private Integer bookingId;
        private String customerName;
        private String courtName;
        private LocalDate playDate;
        private String startTime;
        private String endTime;
        private String status;
        private String paymentStatus;
    }
}
