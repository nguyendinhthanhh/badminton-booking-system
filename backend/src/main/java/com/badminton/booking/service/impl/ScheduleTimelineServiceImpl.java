package com.badminton.booking.service.impl;

import com.badminton.booking.dto.schedule.*;
import com.badminton.booking.entity.*;
import com.badminton.booking.repository.*;
import com.badminton.booking.service.CourtPriceService;
import com.badminton.booking.service.ScheduleTimelineService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.Duration;
import java.time.LocalDate;
import java.time.LocalTime;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class ScheduleTimelineServiceImpl implements ScheduleTimelineService {

    private final BookingRepository bookingRepository;
    private final BookingDetailRepository bookingDetailRepository;
    private final BadmintonCourtRepo badmintonCourtRepo;
    private final TimeSlotRepository timeSlotRepository;
    private final CourtPriceService courtPriceService;

    private static final String STATUS_AVAILABLE = "AVAILABLE";
    private static final String STATUS_BOOKED = "BOOKED";
    private static final String STATUS_PENDING = "PENDING";
    private static final String STATUS_MAINTENANCE = "MAINTENANCE";
    private static final String STATUS_CONFIRMED = "CONFIRMED";
    private static final String STATUS_CANCELLED = "CANCELLED";
    private static final String STATUS_COMPLETED = "COMPLETED";
    private static final String STATUS_PLAYING = "PLAYING";

    // Giờ hoạt động mặc định
    private static final LocalTime DEFAULT_OPERATING_START = LocalTime.of(6, 0);
    private static final LocalTime DEFAULT_OPERATING_END = LocalTime.of(22, 0);

    @Override
    public ScheduleTimelineDTO getScheduleTimeline(LocalDate date) {
        // Get all courts
        List<BadmintonCourt> courts = badmintonCourtRepo.findAll();

        // Get all bookings for this date (booking mới dùng startTime/endTime)
        List<Booking> bookings = bookingRepository.findAllByPlayDate(date);

        // Build court timelines
        List<CourtTimelineDTO> courtTimelines = new ArrayList<>();

        for (BadmintonCourt court : courts) {
            CourtTimelineDTO courtTimeline = buildCourtTimelineFromBookings(court, date, bookings);
            courtTimelines.add(courtTimeline);
        }

        // Calculate statistics
        ScheduleStatisticsDTO statistics = calculateStatisticsFromBookings(courtTimelines, bookings);

        return ScheduleTimelineDTO.builder()
                .date(date)
                .operatingStartTime(DEFAULT_OPERATING_START)
                .operatingEndTime(DEFAULT_OPERATING_END)
                .courts(courtTimelines)
                .statistics(statistics)
                .build();
    }

    /**
     * Build timeline cho 1 sân dựa trên booking (startTime/endTime)
     */
    private CourtTimelineDTO buildCourtTimelineFromBookings(BadmintonCourt court, LocalDate date,
            List<Booking> allBookings) {
        // Filter bookings for this court - chỉ bỏ qua booking đã CANCELLED
        List<Booking> courtBookings = allBookings.stream()
                .filter(b -> b.getCourt() != null && b.getCourt().getId().equals(court.getId()))
                .filter(b -> b.getStatus() == null || !STATUS_CANCELLED.equalsIgnoreCase(b.getStatus())) // Chỉ bỏ
                                                                                                         // CANCELLED
                .sorted(Comparator.comparing(Booking::getStartTime, Comparator.nullsLast(Comparator.naturalOrder())))
                .collect(Collectors.toList());

        // Check if date is weekend
        boolean isWeekend = isWeekend(date);

        // Build timeline slots từ booking
        List<TimelineSlotDTO> slots = new ArrayList<>();

        // Thêm các booking như là các slot (bao gồm cả booking không có
        // startTime/endTime)
        for (Booking booking : courtBookings) {
            TimelineSlotDTO slotDTO = buildSlotFromBooking(booking, court, date, isWeekend);
            slots.add(slotDTO);
        }

        // Sắp xếp theo startTime (null sẽ ở cuối)
        slots.sort(
                Comparator.comparing(TimelineSlotDTO::getStartTime, Comparator.nullsLast(Comparator.naturalOrder())));

        return CourtTimelineDTO.builder()
                .courtId(court.getId())
                .courtName(court.getName())
                .courtType(court.getType() != null ? court.getType().name() : null)
                .courtStatus(court.getStatus() != null ? court.getStatus().name() : null)
                .location(court.getLocation())
                .slots(slots)
                .build();
    }

    /**
     * Build 1 slot từ booking - giữ nguyên status gốc để admin xử lý
     * Hỗ trợ cả booking cũ (không có startTime/endTime) và booking mới
     */
    private TimelineSlotDTO buildSlotFromBooking(Booking booking, BadmintonCourt court, LocalDate date,
            boolean isWeekend) {
        // Giữ nguyên status gốc của booking để admin có thể xử lý
        String status = booking.getStatus() != null ? booking.getStatus().toUpperCase() : STATUS_PENDING;

        // Get customer info
        String customerName = null;
        String customerPhone = null;
        User user = booking.getUser();
        if (user != null) {
            customerName = user.getFullName();
            customerPhone = user.getPhoneNumber();
        }

        // Lấy startTime và endTime - ưu tiên từ booking, nếu null thì lấy từ
        // priceBreakdown
        LocalTime startTime = booking.getStartTime();
        LocalTime endTime = booking.getEndTime();

        // Nếu booking cũ không có startTime/endTime, lấy từ priceBreakdown
        if ((startTime == null || endTime == null) && booking.getPriceBreakdowns() != null
                && !booking.getPriceBreakdowns().isEmpty()) {
            List<BookingPriceBreakdown> sortedBreakdowns = booking.getPriceBreakdowns().stream()
                    .sorted(Comparator.comparing(BookingPriceBreakdown::getPeriodStart))
                    .collect(Collectors.toList());

            if (!sortedBreakdowns.isEmpty()) {
                // startTime = min periodStart, endTime = max periodEnd
                startTime = sortedBreakdowns.get(0).getPeriodStart();
                endTime = sortedBreakdowns.get(sortedBreakdowns.size() - 1).getPeriodEnd();
            }
        }

        // Calculate duration
        int durationMinutes = 0;
        if (startTime != null && endTime != null) {
            durationMinutes = (int) Duration.between(startTime, endTime).toMinutes();
        }

        // Xác định periodName
        String periodName = "Không xác định";
        if (startTime != null) {
            periodName = getPeriodName(startTime);
        }

        return TimelineSlotDTO.builder()
                .startTime(startTime)
                .endTime(endTime)
                .durationMinutes(durationMinutes)
                .periodName(periodName)
                .status(status)
                .bookingId(booking.getId())
                .customerName(customerName)
                .customerPhone(customerPhone)
                .basePrice(booking.getBasePrice())
                .totalPrice(booking.getTotalPrice())
                .paymentStatus(booking.getPaymentStatus())
                .isWeekend(isWeekend)
                .build();
    }

    private String getPeriodName(LocalTime time) {
        if (time == null)
            return "Không xác định";
        int hour = time.getHour();
        if (hour >= 6 && hour < 8)
            return "Sáng sớm";
        if (hour >= 8 && hour < 11)
            return "Sáng";
        if (hour >= 11 && hour < 14)
            return "Trưa";
        if (hour >= 14 && hour < 17)
            return "Chiều";
        if (hour >= 17 && hour < 21)
            return "Giờ vàng";
        if (hour >= 21 && hour < 22)
            return "Tối muộn";
        return "Ngoài giờ";
    }

    @Override
    public CourtTimelineDTO getCourtTimeline(Integer courtId, LocalDate date) {
        BadmintonCourt court = badmintonCourtRepo.findById(courtId)
                .orElseThrow(() -> new RuntimeException("Court not found with id: " + courtId));

        List<Booking> bookings = bookingRepository.findByCourtIdAndPlayDate(courtId, date);

        return buildCourtTimelineFromBookings(court, date, bookings);
    }

    @Override
    public List<ScheduleTimelineDTO> getScheduleTimelineRange(LocalDate startDate, LocalDate endDate) {
        List<ScheduleTimelineDTO> timelines = new ArrayList<>();
        LocalDate currentDate = startDate;

        while (!currentDate.isAfter(endDate)) {
            timelines.add(getScheduleTimeline(currentDate));
            currentDate = currentDate.plusDays(1);
        }

        return timelines;
    }

    @Override
    public List<UserBookingTimelineDTO> getUserBookingTimeline(Integer userId, LocalDate startDate, LocalDate endDate) {
        List<Booking> bookings = bookingRepository.findByUserIdAndPlayDateBetween(userId, startDate, endDate);
        return buildUserBookingTimelineFromBookings(bookings);
    }

    @Override
    public List<UserBookingTimelineDTO> getUserUpcomingBookings(Integer userId) {
        List<Booking> bookings = bookingRepository.findByUserIdAndPlayDateFrom(userId, LocalDate.now());
        return buildUserBookingTimelineFromBookings(bookings);
    }

    /**
     * Build user booking timeline từ booking (không dùng BookingDetail)
     */
    private List<UserBookingTimelineDTO> buildUserBookingTimelineFromBookings(List<Booking> bookings) {
        List<UserBookingTimelineDTO> timeline = new ArrayList<>();

        for (Booking booking : bookings) {
            timeline.add(UserBookingTimelineDTO.builder()
                    .bookingId(booking.getId())
                    .bookingDetailId(null)
                    .playDate(booking.getPlayDate())
                    .startTime(booking.getStartTime())
                    .endTime(booking.getEndTime())
                    .courtName(booking.getCourt() != null ? booking.getCourt().getName() : null)
                    .courtId(booking.getCourt() != null ? booking.getCourt().getId() : null)
                    .status(booking.getStatus())
                    .paymentStatus(booking.getPaymentStatus())
                    .price(booking.getTotalPrice())
                    .periodName(getPeriodName(booking.getStartTime()))
                    .build());
        }

        // Sort by play date and start time
        timeline.sort(Comparator
                .comparing(UserBookingTimelineDTO::getPlayDate)
                .thenComparing(dto -> dto.getStartTime() != null ? dto.getStartTime() : LocalTime.MIN));

        return timeline;
    }

    @Override
    public ScheduleStatisticsDTO getScheduleStatistics(LocalDate date) {
        ScheduleTimelineDTO timeline = getScheduleTimeline(date);
        return timeline.getStatistics();
    }

    @Override
    public BookingDetailInfoDTO getBookingDetail(Integer bookingId) {
        Booking booking = bookingRepository.findById(bookingId)
                .orElseThrow(() -> new RuntimeException("Booking not found with id: " + bookingId));

        BadmintonCourt court = booking.getCourt();
        User customer = booking.getUser();

        // Build slot details từ booking (không dùng BookingDetail)
        List<BookingDetailInfoDTO.BookingSlotDetailDTO> slotDetails = new ArrayList<>();

        // Tạo 1 slot detail từ booking startTime/endTime
        if (booking.getStartTime() != null && booking.getEndTime() != null) {
            int durationMinutes = (int) Duration.between(booking.getStartTime(), booking.getEndTime()).toMinutes();

            slotDetails.add(BookingDetailInfoDTO.BookingSlotDetailDTO.builder()
                    .bookingDetailId(null)
                    .slotId(null)
                    .startTime(booking.getStartTime())
                    .endTime(booking.getEndTime())
                    .durationMinutes(durationMinutes)
                    .periodName(getPeriodName(booking.getStartTime()))
                    .price(booking.getTotalPrice())
                    .status(booking.getStatus())
                    .build());
        }

        return BookingDetailInfoDTO.builder()
                .bookingId(booking.getId())
                .bookingStatus(booking.getStatus())
                .paymentStatus(booking.getPaymentStatus())
                .playDate(booking.getPlayDate())
                .totalPrice(booking.getTotalPrice())
                .bookingDate(booking.getBookingDate())
                // Court info
                .courtId(court != null ? court.getId() : null)
                .courtName(court != null ? court.getName() : null)
                .courtType(court != null && court.getType() != null ? court.getType().name() : null)
                .courtLocation(court != null ? court.getLocation() : null)
                // Customer info
                .customerId(customer != null ? customer.getId() : null)
                .customerName(customer != null ? customer.getFullName() : null)
                .customerEmail(customer != null ? customer.getEmail() : null)
                .customerPhone(customer != null ? customer.getPhoneNumber() : null)
                // Slots
                .slots(slotDetails)
                .build();
    }

    private boolean isWeekend(LocalDate date) {
        java.time.DayOfWeek day = date.getDayOfWeek();
        return day == java.time.DayOfWeek.SATURDAY || day == java.time.DayOfWeek.SUNDAY;
    }

    /**
     * Tính statistics từ booking (không dùng slot)
     */
    private ScheduleStatisticsDTO calculateStatisticsFromBookings(List<CourtTimelineDTO> courtTimelines,
            List<Booking> allBookings) {
        int totalBookings = 0;
        int bookedCount = 0;
        int pendingCount = 0;
        int completedCount = 0;
        BigDecimal totalRevenue = BigDecimal.ZERO;

        for (Booking booking : allBookings) {
            if (STATUS_CANCELLED.equalsIgnoreCase(booking.getStatus())) {
                continue; // Bỏ qua booking đã hủy
            }

            totalBookings++;
            String status = booking.getStatus();

            if (STATUS_CONFIRMED.equalsIgnoreCase(status) || STATUS_PLAYING.equalsIgnoreCase(status)) {
                bookedCount++;
                if (booking.getTotalPrice() != null) {
                    totalRevenue = totalRevenue.add(booking.getTotalPrice());
                }
            } else if (STATUS_PENDING.equalsIgnoreCase(status)) {
                pendingCount++;
            } else if (STATUS_COMPLETED.equalsIgnoreCase(status)) {
                completedCount++;
                if (booking.getTotalPrice() != null) {
                    totalRevenue = totalRevenue.add(booking.getTotalPrice());
                }
            }
        }

        // Tính số sân
        int totalCourts = courtTimelines.size();

        return ScheduleStatisticsDTO.builder()
                .totalSlots(totalBookings) // Dùng totalBookings thay vì totalSlots
                .bookedSlots(bookedCount + completedCount)
                .availableSlots(0) // Không tính được vì không dùng slot
                .pendingSlots(pendingCount)
                .maintenanceSlots(0)
                .occupancyRate(0.0) // Cần logic khác để tính
                .totalRevenue(totalRevenue)
                .expectedRevenue(totalRevenue)
                .build();
    }

    @Override
    @Transactional
    public BookingDetailInfoDTO updateBooking(Integer bookingId, UpdateBookingRequest request) {
        Booking booking = bookingRepository.findById(bookingId)
                .orElseThrow(() -> new RuntimeException("Booking not found with id: " + bookingId));

        String currentStatus = booking.getStatus();

        // Validate and update status
        if (request.getStatus() != null) {
            validateStatusTransition(currentStatus, request.getStatus());
            booking.setStatus(request.getStatus());
        }

        // Update payment status
        if (request.getPaymentStatus() != null) {
            booking.setPaymentStatus(request.getPaymentStatus());
        }

        // Update admin notes
        if (request.getAdminNote() != null) {
            booking.setNotes(request.getAdminNote());
        }

        // Update play date, court, and time only if status is PENDING
        if (STATUS_PENDING.equalsIgnoreCase(currentStatus)) {
            if (request.getPlayDate() != null) {
                validatePlayDateChange(booking, request.getPlayDate());
                booking.setPlayDate(request.getPlayDate());
            }

            if (request.getCourtId() != null) {
                BadmintonCourt newCourt = badmintonCourtRepo.findById(request.getCourtId())
                        .orElseThrow(() -> new RuntimeException("Court not found with id: " + request.getCourtId()));
                booking.setCourt(newCourt);
            }

            if (request.getStartTime() != null) {
                booking.setStartTime(request.getStartTime());
            }

            if (request.getEndTime() != null) {
                booking.setEndTime(request.getEndTime());
            }
        } else if (request.getPlayDate() != null || request.getCourtId() != null ||
                request.getStartTime() != null || request.getEndTime() != null) {
            throw new RuntimeException(
                    "Cannot change play date, court, or time when booking status is " + currentStatus +
                            ". Only PENDING bookings can be modified.");
        }

        bookingRepository.save(booking);

        return getBookingDetail(bookingId);
    }

    @Override
    @Transactional
    public BookingDetailInfoDTO cancelBooking(Integer bookingId, String reason) {
        Booking booking = bookingRepository.findById(bookingId)
                .orElseThrow(() -> new RuntimeException("Booking not found with id: " + bookingId));

        String currentStatus = booking.getStatus();

        // Only PENDING or CONFIRMED bookings can be cancelled
        if (!STATUS_PENDING.equalsIgnoreCase(currentStatus) &&
                !STATUS_CONFIRMED.equalsIgnoreCase(currentStatus)) {
            throw new RuntimeException("Cannot cancel booking with status: " + currentStatus +
                    ". Only PENDING or CONFIRMED bookings can be cancelled.");
        }

        // Check if play date has passed
        if (booking.getPlayDate() != null && booking.getPlayDate().isBefore(LocalDate.now())) {
            throw new RuntimeException("Cannot cancel booking for a past date.");
        }

        booking.setStatus(STATUS_CANCELLED);

        // Thêm lý do vào notes
        String currentNotes = booking.getNotes() != null ? booking.getNotes() : "";
        booking.setNotes(currentNotes + "\nCancelled: " + (reason != null ? reason : "Không có lý do"));

        bookingRepository.save(booking);

        return getBookingDetail(bookingId);
    }

    private void validateStatusTransition(String currentStatus, String newStatus) {
        Map<String, Set<String>> validTransitions = new HashMap<>();
        validTransitions.put(STATUS_PENDING, Set.of(STATUS_CONFIRMED, STATUS_CANCELLED));
        validTransitions.put(STATUS_CONFIRMED, Set.of(STATUS_PLAYING, STATUS_COMPLETED, STATUS_CANCELLED, "NO_SHOW"));
        validTransitions.put(STATUS_PLAYING, Set.of(STATUS_COMPLETED));
        validTransitions.put(STATUS_COMPLETED, Set.of());
        validTransitions.put(STATUS_CANCELLED, Set.of());
        validTransitions.put("NO_SHOW", Set.of());

        Set<String> allowedTransitions = validTransitions.getOrDefault(
                currentStatus != null ? currentStatus.toUpperCase() : STATUS_PENDING,
                Set.of());

        if (!allowedTransitions.contains(newStatus.toUpperCase())) {
            throw new RuntimeException("Invalid status transition from " + currentStatus + " to " + newStatus +
                    ". Allowed transitions: " + allowedTransitions);
        }
    }

    private void validatePlayDateChange(Booking booking, LocalDate newPlayDate) {
        if (newPlayDate.isBefore(LocalDate.now())) {
            throw new RuntimeException("Cannot change play date to a past date.");
        }
    }
}
