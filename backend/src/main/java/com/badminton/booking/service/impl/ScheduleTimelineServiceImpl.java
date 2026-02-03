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
import java.time.DayOfWeek;
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

    @Override
    public ScheduleTimelineDTO getScheduleTimeline(LocalDate date) {
        // Get all courts
        List<BadmintonCourt> courts = badmintonCourtRepo.findAll();

        // Get all active time slots (không còn phụ thuộc vào ngày trong tuần)
        List<TimeSlot> timeSlots = timeSlotRepository.findByIsActiveTrueOrderByStartTimeAsc();

        // Get all bookings for this date
        List<Booking> bookings = bookingRepository.findAllByPlayDate(date);

        // Get all booking details
        List<Integer> bookingIds = bookings.stream().map(Booking::getId).collect(Collectors.toList());
        List<BookingDetail> allBookingDetails = bookingIds.isEmpty() ?
            Collections.emptyList() : bookingDetailRepository.findByBookingIds(bookingIds);

        // Build court timelines
        List<CourtTimelineDTO> courtTimelines = new ArrayList<>();

        for (BadmintonCourt court : courts) {
            CourtTimelineDTO courtTimeline = buildCourtTimeline(court, date, timeSlots, bookings, allBookingDetails);
            courtTimelines.add(courtTimeline);
        }

        // Calculate statistics
        ScheduleStatisticsDTO statistics = calculateStatistics(courtTimelines);

        // Get operating hours
        LocalTime startTime = timeSlotRepository.findEarliestStartTime();
        LocalTime endTime = timeSlotRepository.findLatestEndTime();

        return ScheduleTimelineDTO.builder()
                .date(date)
                .operatingStartTime(startTime != null ? startTime : LocalTime.of(6, 0))
                .operatingEndTime(endTime != null ? endTime : LocalTime.of(22, 0))
                .courts(courtTimelines)
                .statistics(statistics)
                .build();
    }

    @Override
    public CourtTimelineDTO getCourtTimeline(Integer courtId, LocalDate date) {
        BadmintonCourt court = badmintonCourtRepo.findById(courtId)
                .orElseThrow(() -> new RuntimeException("Court not found with id: " + courtId));

        // Get all active time slots (không còn phụ thuộc vào ngày trong tuần)
        List<TimeSlot> timeSlots = timeSlotRepository.findByIsActiveTrueOrderByStartTimeAsc();

        List<Booking> bookings = bookingRepository.findByCourtIdAndPlayDate(courtId, date);
        List<Integer> bookingIds = bookings.stream().map(Booking::getId).collect(Collectors.toList());
        List<BookingDetail> bookingDetails = bookingIds.isEmpty() ?
            Collections.emptyList() : bookingDetailRepository.findByBookingIds(bookingIds);

        return buildCourtTimeline(court, date, timeSlots, bookings, bookingDetails);
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
        return buildUserBookingTimeline(bookings);
    }

    @Override
    public List<UserBookingTimelineDTO> getUserUpcomingBookings(Integer userId) {
        List<Booking> bookings = bookingRepository.findByUserIdAndPlayDateFrom(userId, LocalDate.now());
        return buildUserBookingTimeline(bookings);
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

        // Build slot details
        List<BookingDetailInfoDTO.BookingSlotDetailDTO> slotDetails = new ArrayList<>();
        Set<BookingDetail> details = booking.getBookingDetails();

        if (details != null) {
            for (BookingDetail detail : details) {
                TimeSlot slot = detail.getSlot();
                int durationMinutes = 0;
                if (slot != null && slot.getStartTime() != null && slot.getEndTime() != null) {
                    durationMinutes = (int) java.time.Duration.between(slot.getStartTime(), slot.getEndTime()).toMinutes();
                }

                slotDetails.add(BookingDetailInfoDTO.BookingSlotDetailDTO.builder()
                        .bookingDetailId(detail.getId())
                        .slotId(slot != null ? slot.getId() : null)
                        .startTime(slot != null ? slot.getStartTime() : null)
                        .endTime(slot != null ? slot.getEndTime() : null)
                        .durationMinutes(durationMinutes)
                        .periodName(slot != null ? slot.getPeriodName() : null)
                        .price(detail.getPriceAtBooking())
                        .status(detail.getStatus())
                        .build());
            }

            // Sort by start time
            slotDetails.sort(Comparator.comparing(s -> s.getStartTime() != null ? s.getStartTime() : LocalTime.MIN));
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

    private CourtTimelineDTO buildCourtTimeline(BadmintonCourt court, LocalDate date,
            List<TimeSlot> timeSlots, List<Booking> allBookings, List<BookingDetail> allBookingDetails) {

        // Filter bookings for this court
        List<Booking> courtBookings = allBookings.stream()
                .filter(b -> b.getCourt() != null && b.getCourt().getId().equals(court.getId()))
                .collect(Collectors.toList());

        // Create a map of slot -> booking detail for this court
        Map<Integer, BookingDetail> slotBookingMap = new HashMap<>();
        Map<Integer, Booking> slotBookingParentMap = new HashMap<>();

        for (Booking booking : courtBookings) {
            for (BookingDetail detail : allBookingDetails) {
                if (detail.getBooking() != null &&
                    detail.getBooking().getId().equals(booking.getId()) &&
                    detail.getSlot() != null) {
                    slotBookingMap.put(detail.getSlot().getId(), detail);
                    slotBookingParentMap.put(detail.getSlot().getId(), booking);
                }
            }
        }

        // Check if date is weekend
        boolean isWeekend = isWeekend(date);

        // Build timeline slots
        List<TimelineSlotDTO> slots = new ArrayList<>();

        for (TimeSlot timeSlot : timeSlots) {
            TimelineSlotDTO slotDTO = buildTimelineSlot(timeSlot, court, date, isWeekend,
                    slotBookingMap.get(timeSlot.getId()),
                    slotBookingParentMap.get(timeSlot.getId()));
            slots.add(slotDTO);
        }

        return CourtTimelineDTO.builder()
                .courtId(court.getId())
                .courtName(court.getName())
                .courtType(court.getType() != null ? court.getType().name() : null)
                .courtStatus(court.getStatus() != null ? court.getStatus().name() : null)
                .location(court.getLocation())
                .slots(slots)
                .build();
    }

    private TimelineSlotDTO buildTimelineSlot(TimeSlot timeSlot, BadmintonCourt court,
            LocalDate date, boolean isWeekend, BookingDetail bookingDetail, Booking booking) {

        String status = STATUS_AVAILABLE;
        Integer bookingId = null;
        Integer bookingDetailId = null;
        String customerName = null;
        String customerPhone = null;

        // Lấy giá từ CourtPriceService (theo khung giờ + loại ngày)
        BigDecimal pricePerHour = courtPriceService.getPriceForTime(court.getId(), date, timeSlot.getStartTime());
        BigDecimal displayPrice = pricePerHour; // Giá hiển thị mặc định

        // Check if court is under maintenance
        if (court.getStatus() != null && "MAINTENANCE".equals(court.getStatus().name())) {
            status = STATUS_MAINTENANCE;
        } else if (bookingDetail != null && booking != null) {
            bookingId = booking.getId();
            bookingDetailId = bookingDetail.getId();

            // Nếu đã đặt, hiển thị giá lúc đặt
            if (bookingDetail.getPriceAtBooking() != null) {
                displayPrice = bookingDetail.getPriceAtBooking();
            }

            // Determine status based on booking status
            String bookingStatus = booking.getStatus();
            if ("CONFIRMED".equalsIgnoreCase(bookingStatus) || "COMPLETED".equalsIgnoreCase(bookingStatus)) {
                status = STATUS_BOOKED;
            } else if ("PENDING".equalsIgnoreCase(bookingStatus)) {
                status = STATUS_PENDING;
            } else if ("CANCELLED".equalsIgnoreCase(bookingStatus)) {
                status = STATUS_AVAILABLE;
            } else {
                status = STATUS_BOOKED;
            }

            // Get customer info
            User user = booking.getUser();
            if (user != null) {
                customerName = user.getFullName();
                customerPhone = user.getPhoneNumber();
            }
        }

        // Calculate duration in minutes
        int durationMinutes = (int) java.time.Duration.between(timeSlot.getStartTime(), timeSlot.getEndTime()).toMinutes();

        return TimelineSlotDTO.builder()
                .slotId(timeSlot.getId())
                .startTime(timeSlot.getStartTime())
                .endTime(timeSlot.getEndTime())
                .durationMinutes(durationMinutes)
                .periodName(timeSlot.getPeriodName())
                .status(status)
                .bookingId(bookingId)
                .bookingDetailId(bookingDetailId)
                .customerName(customerName)
                .customerPhone(customerPhone)
                .price(displayPrice)
                .isWeekend(isWeekend)
                .build();
    }

    private boolean isWeekend(LocalDate date) {
        java.time.DayOfWeek day = date.getDayOfWeek();
        return day == java.time.DayOfWeek.SATURDAY || day == java.time.DayOfWeek.SUNDAY;
    }

    private List<UserBookingTimelineDTO> buildUserBookingTimeline(List<Booking> bookings) {
        List<UserBookingTimelineDTO> timeline = new ArrayList<>();

        for (Booking booking : bookings) {
            Set<BookingDetail> details = booking.getBookingDetails();

            if (details == null || details.isEmpty()) {
                // Booking without details
                timeline.add(UserBookingTimelineDTO.builder()
                        .bookingId(booking.getId())
                        .playDate(booking.getPlayDate())
                        .courtName(booking.getCourt() != null ? booking.getCourt().getName() : null)
                        .courtId(booking.getCourt() != null ? booking.getCourt().getId() : null)
                        .status(booking.getStatus())
                        .paymentStatus(booking.getPaymentStatus())
                        .price(booking.getTotalPrice())
                        .build());
            } else {
                // Create entry for each booking detail
                for (BookingDetail detail : details) {
                    TimeSlot slot = detail.getSlot();
                    timeline.add(UserBookingTimelineDTO.builder()
                            .bookingId(booking.getId())
                            .bookingDetailId(detail.getId())
                            .playDate(booking.getPlayDate())
                            .startTime(slot != null ? slot.getStartTime() : null)
                            .endTime(slot != null ? slot.getEndTime() : null)
                            .courtName(booking.getCourt() != null ? booking.getCourt().getName() : null)
                            .courtId(booking.getCourt() != null ? booking.getCourt().getId() : null)
                            .status(detail.getStatus() != null ? detail.getStatus() : booking.getStatus())
                            .paymentStatus(booking.getPaymentStatus())
                            .price(detail.getPriceAtBooking())
                            .periodName(slot != null ? slot.getPeriodName() : null)
                            .build());
                }
            }
        }

        // Sort by play date and start time
        timeline.sort(Comparator
                .comparing(UserBookingTimelineDTO::getPlayDate)
                .thenComparing(dto -> dto.getStartTime() != null ? dto.getStartTime() : LocalTime.MIN));

        return timeline;
    }

    private ScheduleStatisticsDTO calculateStatistics(List<CourtTimelineDTO> courtTimelines) {
        int totalSlots = 0;
        int bookedSlots = 0;
        int availableSlots = 0;
        int pendingSlots = 0;
        int maintenanceSlots = 0;
        BigDecimal totalRevenue = BigDecimal.ZERO;

        for (CourtTimelineDTO court : courtTimelines) {
            for (TimelineSlotDTO slot : court.getSlots()) {
                totalSlots++;

                switch (slot.getStatus()) {
                    case STATUS_BOOKED:
                        bookedSlots++;
                        if (slot.getPrice() != null) {
                            totalRevenue = totalRevenue.add(slot.getPrice());
                        }
                        break;
                    case STATUS_AVAILABLE:
                        availableSlots++;
                        break;
                    case STATUS_PENDING:
                        pendingSlots++;
                        break;
                    case STATUS_MAINTENANCE:
                        maintenanceSlots++;
                        break;
                }
            }
        }

        double occupancyRate = totalSlots > 0 ?
                (double) (bookedSlots + pendingSlots) / (totalSlots - maintenanceSlots) * 100 : 0;

        return ScheduleStatisticsDTO.builder()
                .totalSlots(totalSlots)
                .bookedSlots(bookedSlots)
                .availableSlots(availableSlots)
                .pendingSlots(pendingSlots)
                .maintenanceSlots(maintenanceSlots)
                .occupancyRate(Math.round(occupancyRate * 100.0) / 100.0)
                .totalRevenue(totalRevenue)
                .expectedRevenue(totalRevenue) // Can be enhanced with pricing logic
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

        // Update play date, court, slots only if status is PENDING
        if (STATUS_PENDING.equalsIgnoreCase(currentStatus)) {
            // Update play date
            if (request.getPlayDate() != null) {
                validatePlayDateChange(booking, request.getPlayDate());
                booking.setPlayDate(request.getPlayDate());
            }

            // Update court
            if (request.getCourtId() != null) {
                BadmintonCourt newCourt = badmintonCourtRepo.findById(request.getCourtId())
                        .orElseThrow(() -> new RuntimeException("Court not found with id: " + request.getCourtId()));

                // Validate court is available
                validateCourtAvailability(newCourt, booking.getPlayDate(), booking.getId());
                booking.setCourt(newCourt);
            }

            // Update time slots
            if (request.getSlotIds() != null && !request.getSlotIds().isEmpty()) {
                updateBookingSlots(booking, request.getSlotIds());
            }
        } else if (request.getPlayDate() != null || request.getCourtId() != null ||
                   (request.getSlotIds() != null && !request.getSlotIds().isEmpty())) {
            throw new RuntimeException("Cannot change play date, court or slots when booking status is " + currentStatus +
                    ". Only PENDING bookings can be modified.");
        }

        // Update actual check-in/check-out times for booking details
        if (request.getActualCheckInTime() != null || request.getActualCheckOutTime() != null) {
            updateActualTimes(booking, request.getActualCheckInTime(), request.getActualCheckOutTime());
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

        // Update all booking details status
        Set<BookingDetail> details = booking.getBookingDetails();
        if (details != null) {
            for (BookingDetail detail : details) {
                detail.setStatus(STATUS_CANCELLED);
                bookingDetailRepository.save(detail);
            }
        }

        bookingRepository.save(booking);

        return getBookingDetail(bookingId);
    }

    private void validateStatusTransition(String currentStatus, String newStatus) {
        // Define valid status transitions
        Map<String, Set<String>> validTransitions = new HashMap<>();
        validTransitions.put(STATUS_PENDING, Set.of(STATUS_CONFIRMED, STATUS_CANCELLED));
        validTransitions.put(STATUS_CONFIRMED, Set.of(STATUS_COMPLETED, STATUS_CANCELLED, "NO_SHOW"));
        validTransitions.put(STATUS_COMPLETED, Set.of()); // Terminal state
        validTransitions.put(STATUS_CANCELLED, Set.of()); // Terminal state
        validTransitions.put("NO_SHOW", Set.of()); // Terminal state

        Set<String> allowedTransitions = validTransitions.getOrDefault(
                currentStatus != null ? currentStatus.toUpperCase() : STATUS_PENDING,
                Set.of());

        if (!allowedTransitions.contains(newStatus.toUpperCase())) {
            throw new RuntimeException("Invalid status transition from " + currentStatus + " to " + newStatus +
                    ". Allowed transitions: " + allowedTransitions);
        }
    }

    private void validatePlayDateChange(Booking booking, LocalDate newPlayDate) {
        // Cannot change to past date
        if (newPlayDate.isBefore(LocalDate.now())) {
            throw new RuntimeException("Cannot change play date to a past date.");
        }

        // Check if slots are available on new date
        if (booking.getCourt() != null && booking.getBookingDetails() != null) {
            List<Integer> slotIds = booking.getBookingDetails().stream()
                    .filter(d -> d.getSlot() != null)
                    .map(d -> d.getSlot().getId())
                    .collect(Collectors.toList());

            if (!slotIds.isEmpty()) {
                List<BookingDetail> conflictingDetails = bookingDetailRepository
                        .findConflictingBookings(booking.getCourt().getId(), newPlayDate, slotIds, booking.getId());

                if (!conflictingDetails.isEmpty()) {
                    throw new RuntimeException("Selected slots are not available on " + newPlayDate);
                }
            }
        }
    }

    private void validateCourtAvailability(BadmintonCourt court, LocalDate playDate, Integer excludeBookingId) {
        // Check court status
        if (court.getStatus() != null && "MAINTENANCE".equals(court.getStatus().name())) {
            throw new RuntimeException("Court " + court.getName() + " is under maintenance.");
        }
    }

    private void updateBookingSlots(Booking booking, List<Integer> newSlotIds) {
        // Get new slots
        List<TimeSlot> newSlots = timeSlotRepository.findAllById(newSlotIds);
        if (newSlots.size() != newSlotIds.size()) {
            throw new RuntimeException("Some slot IDs are invalid.");
        }

        // Check if new slots are available
        List<BookingDetail> conflictingDetails = bookingDetailRepository
                .findConflictingBookings(booking.getCourt().getId(), booking.getPlayDate(), newSlotIds, booking.getId());

        if (!conflictingDetails.isEmpty()) {
            throw new RuntimeException("Selected slots are not available.");
        }

        // Remove old booking details
        Set<BookingDetail> oldDetails = booking.getBookingDetails();
        if (oldDetails != null) {
            for (BookingDetail detail : oldDetails) {
                bookingDetailRepository.delete(detail);
            }
        }

        // Create new booking details
        BigDecimal totalPrice = BigDecimal.ZERO;
        Set<BookingDetail> newDetails = new LinkedHashSet<>();

        for (TimeSlot slot : newSlots) {
            BookingDetail detail = new BookingDetail();
            detail.setBooking(booking);
            detail.setSlot(slot);
            detail.setStatus(STATUS_PENDING);

            // Lấy giá từ CourtPriceService
            BigDecimal slotPrice = courtPriceService.getPriceForTime(
                    booking.getCourt().getId(),
                    booking.getPlayDate(),
                    slot.getStartTime()
            );
            // Nếu chưa cấu hình giá, dùng giá mặc định
            if (slotPrice == null) {
                slotPrice = new BigDecimal("100000");
            }
            detail.setPriceAtBooking(slotPrice);
            totalPrice = totalPrice.add(slotPrice);

            bookingDetailRepository.save(detail);
            newDetails.add(detail);
        }

        booking.setBookingDetails(newDetails);
        booking.setTotalPrice(totalPrice);
    }

    private void updateActualTimes(Booking booking, java.time.LocalDateTime checkInTime, java.time.LocalDateTime checkOutTime) {
        Set<BookingDetail> details = booking.getBookingDetails();
        if (details != null && !details.isEmpty()) {
            for (BookingDetail detail : details) {
                if (checkInTime != null) {
                    detail.setActualStartTime(checkInTime);
                }
                if (checkOutTime != null) {
                    detail.setActualEndTime(checkOutTime);
                }
                bookingDetailRepository.save(detail);
            }
        }
    }
}
