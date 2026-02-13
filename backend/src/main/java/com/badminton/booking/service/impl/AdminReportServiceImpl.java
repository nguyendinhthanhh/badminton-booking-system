package com.badminton.booking.service.impl;

import com.badminton.booking.dto.report.AdminDashboardReportResponse;
import com.badminton.booking.repository.BadmintonCourtRepo;
import com.badminton.booking.repository.BookingRepository;
import com.badminton.booking.service.AdminReportService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.time.LocalTime;
import java.time.temporal.ChronoUnit;
import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class AdminReportServiceImpl implements AdminReportService {
    private final BookingRepository bookingRepository;
    private final BadmintonCourtRepo badmintonCourtRepo;

    @Override
    public AdminDashboardReportResponse getDashboardReport(String reportType, LocalDate fromDate, LocalDate toDate) {
        LocalDate end = toDate != null ? toDate : LocalDate.now();
        LocalDate start = fromDate != null ? fromDate : end.minusDays(29);
        if (start.isAfter(end)) {
            throw new RuntimeException("fromDate must be before or equal to toDate");
        }

        long dayCount = ChronoUnit.DAYS.between(start, end) + 1;
        LocalDate prevEnd = start.minusDays(1);
        LocalDate prevStart = prevEnd.minusDays(dayCount - 1);

        BigDecimal totalRevenue = safeBigDecimal(bookingRepository.sumRevenueBetween(start, end));
        BigDecimal prevRevenue = safeBigDecimal(bookingRepository.sumRevenueBetween(prevStart, prevEnd));
        long totalBookings = safeLong(bookingRepository.countBookingsBetween(start, end));
        long prevBookings = safeLong(bookingRepository.countBookingsBetween(prevStart, prevEnd));
        long activeCustomers = safeLong(bookingRepository.countDistinctUsersBetween(start, end));
        long prevActiveCustomers = safeLong(bookingRepository.countDistinctUsersBetween(prevStart, prevEnd));

        long totalCourts = badmintonCourtRepo.count();
        long bookedCourts = safeLong(bookingRepository.countDistinctBookedCourtsBetween(start, end));
        double occupancy = totalCourts == 0 ? 0.0 : roundTwoDecimals((bookedCourts * 100.0) / totalCourts);

        long prevBookedCourts = safeLong(bookingRepository.countDistinctBookedCourtsBetween(prevStart, prevEnd));
        double prevOccupancy = totalCourts == 0 ? 0.0 : roundTwoDecimals((prevBookedCourts * 100.0) / totalCourts);

        Map<LocalDate, BigDecimal> revenueMap = bookingRepository.summarizeRevenueByDate(start, end).stream()
                .collect(Collectors.toMap(
                        BookingRepository.RevenueByDateView::getPlayDate,
                        row -> safeBigDecimal(row.getRevenue())));

        List<AdminDashboardReportResponse.RevenuePoint> revenueSeries = new ArrayList<>();
        LocalDate cursor = start;
        while (!cursor.isAfter(end)) {
            revenueSeries.add(AdminDashboardReportResponse.RevenuePoint.builder()
                    .date(cursor)
                    .revenue(revenueMap.getOrDefault(cursor, BigDecimal.ZERO))
                    .build());
            cursor = cursor.plusDays(1);
        }

        List<BookingRepository.TopCourtView> topCourtRows = bookingRepository.findTopCourtsBetween(
                start, end, PageRequest.of(0, 5));
        long maxBookings = topCourtRows.stream().mapToLong(row -> safeLong(row.getBookings())).max().orElse(0L);
        List<AdminDashboardReportResponse.TopCourt> topCourts = topCourtRows.stream()
                .map(row -> {
                    long bookings = safeLong(row.getBookings());
                    double percentage = maxBookings == 0 ? 0.0 : roundTwoDecimals((bookings * 100.0) / maxBookings);
                    return AdminDashboardReportResponse.TopCourt.builder()
                            .courtId(row.getCourtId())
                            .courtName(row.getCourtName())
                            .bookings(bookings)
                            .revenue(safeBigDecimal(row.getRevenue()))
                            .percentage(percentage)
                            .build();
                })
                .toList();

        List<AdminDashboardReportResponse.RecentBooking> recentBookings = bookingRepository.findRecentBookingsBetween(
                        start, end, PageRequest.of(0, 8)).stream()
                .map(row -> AdminDashboardReportResponse.RecentBooking.builder()
                        .bookingId(row.getBookingId())
                        .customerName(row.getCustomerName())
                        .courtName(row.getCourtName())
                        .playDate(row.getPlayDate())
                        .startTime(formatTime(row.getStartTime()))
                        .endTime(formatTime(row.getEndTime()))
                        .status(row.getStatus())
                        .paymentStatus(row.getPaymentStatus())
                        .build())
                .toList();

        Map<String, Long> statusBreakdown = new LinkedHashMap<>();
        bookingRepository.countBookingsByStatusBetween(start, end).forEach(row ->
                statusBreakdown.put(row.getStatus(), safeLong(row.getTotal())));

        return AdminDashboardReportResponse.builder()
                .reportType(reportType == null || reportType.isBlank() ? "overview" : reportType.toLowerCase())
                .fromDate(start)
                .toDate(end)
                .summary(AdminDashboardReportResponse.Summary.builder()
                        .totalRevenue(totalRevenue)
                        .revenueChange(toChangeString(totalRevenue, prevRevenue))
                        .totalBookings(totalBookings)
                        .bookingChange(toChangeString(totalBookings, prevBookings))
                        .activeCustomers(activeCustomers)
                        .customerChange(toChangeString(activeCustomers, prevActiveCustomers))
                        .occupancyRate(occupancy)
                        .occupancyChange(toChangeString(occupancy, prevOccupancy))
                        .build())
                .revenueSeries(revenueSeries)
                .topCourts(topCourts)
                .recentBookings(recentBookings)
                .statusBreakdown(statusBreakdown)
                .build();
    }

    private BigDecimal safeBigDecimal(BigDecimal value) {
        return value != null ? value : BigDecimal.ZERO;
    }

    private long safeLong(Long value) {
        return value != null ? value : 0L;
    }

    private String formatTime(LocalTime time) {
        return time == null ? null : time.toString();
    }

    private double roundTwoDecimals(double value) {
        return BigDecimal.valueOf(value).setScale(2, RoundingMode.HALF_UP).doubleValue();
    }

    private String toChangeString(BigDecimal current, BigDecimal previous) {
        if (previous == null || previous.compareTo(BigDecimal.ZERO) == 0) {
            if (current != null && current.compareTo(BigDecimal.ZERO) > 0) {
                return "+100.0%";
            }
            return "0.0%";
        }
        BigDecimal delta = current.subtract(previous)
                .multiply(BigDecimal.valueOf(100))
                .divide(previous, 1, RoundingMode.HALF_UP);
        String sign = delta.compareTo(BigDecimal.ZERO) >= 0 ? "+" : "";
        return sign + delta + "%";
    }

    private String toChangeString(long current, long previous) {
        return toChangeString(BigDecimal.valueOf(current), BigDecimal.valueOf(previous));
    }

    private String toChangeString(double current, double previous) {
        return toChangeString(BigDecimal.valueOf(current), BigDecimal.valueOf(previous));
    }
}
