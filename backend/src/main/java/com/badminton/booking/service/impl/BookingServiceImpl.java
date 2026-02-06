package com.badminton.booking.service.impl;

import com.badminton.booking.dto.booking.*;
import com.badminton.booking.entity.*;
import com.badminton.booking.entity.enums.DayType;
import com.badminton.booking.exception.ResourceNotFoundException;
import com.badminton.booking.repository.*;
import com.badminton.booking.service.BookingService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.DayOfWeek;
import java.time.Duration;
import java.time.LocalDate;
import java.time.LocalTime;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
@Transactional
public class BookingServiceImpl implements BookingService {

    private final BookingRepository bookingRepository;
    private final BadmintonCourtRepo courtRepository;
    private final CourtPriceRepository courtPriceRepository;
    private final UserRepository userRepository;

    // ===== CONSTANTS =====
    private static final int DEFAULT_BUFFER_MINUTES = 10;
    private static final BigDecimal OVERTIME_RATE_MULTIPLIER = new BigDecimal("1.5");
    private static final int MAX_OVERTIME_MINUTES = 30;
    private static final int MIN_BOOKING_DURATION = 30; // 30 phút - giảm từ 60 phút
    // Bỏ giới hạn MAX_BOOKING_DURATION
    private static final LocalTime OPERATING_START = LocalTime.of(6, 0);
    private static final LocalTime OPERATING_END = LocalTime.of(22, 0);

    // ===== STATUS CONSTANTS =====
    private static final String STATUS_PENDING = "PENDING";
    private static final String STATUS_CONFIRMED = "CONFIRMED";
    private static final String STATUS_PLAYING = "PLAYING";
    private static final String STATUS_COMPLETED = "COMPLETED";
    private static final String STATUS_CANCELLED = "CANCELLED";

    // ========================================================
    // 1. CHECK OVERLAP - Core function
    // Công thức: (start < existingEnd + buffer) && (end > existingStart)
    // ========================================================
    @Override
    @Transactional(readOnly = true)
    public AvailabilityResponse checkAvailability(Integer courtId, LocalDate playDate,
                                                   LocalTime startTime, LocalTime endTime) {
        // Validate inputs
        validateTimeRange(startTime, endTime);

        BadmintonCourt court = courtRepository.findById(courtId)
                .orElseThrow(() -> new ResourceNotFoundException("Court not found: " + courtId));

        // Lấy tất cả booking active của sân trong ngày
        List<Booking> activeBookings = bookingRepository.findActiveBookingsByCourtAndDate(
                courtId, playDate, null);

        // Check overlap với từng booking
        List<AvailabilityResponse.ConflictingBooking> conflicts = new ArrayList<>();

        for (Booking existing : activeBookings) {
            if (isOverlapping(startTime, endTime, existing)) {
                conflicts.add(AvailabilityResponse.ConflictingBooking.builder()
                        .bookingId(existing.getId())
                        .startTime(existing.getStartTime())
                        .endTime(existing.getEndTime())
                        .effectiveEndTime(existing.getEffectiveEndTime())
                        .status(existing.getStatus())
                        .build());
            }
        }

        boolean available = conflicts.isEmpty();

        // Nếu không available, gợi ý các slot trống
        List<AvailabilityResponse.AvailableSlot> suggestions = available ?
                Collections.emptyList() : findAvailableSlots(courtId, playDate, activeBookings);

        return AvailabilityResponse.builder()
                .courtId(courtId)
                .courtName(court.getName())
                .date(playDate)
                .requestedStart(startTime)
                .requestedEnd(endTime)
                .available(available)
                .message(available ? "Khung giờ trống, có thể đặt sân" :
                        "Khung giờ đã có người đặt, vui lòng chọn giờ khác")
                .conflicts(conflicts)
                .suggestedSlots(suggestions)
                .build();
    }

    /**
     * Core overlap check: (start < existingEnd + buffer) && (end > existingStart)
     */
    private boolean isOverlapping(LocalTime newStart, LocalTime newEnd, Booking existing) {
        LocalTime existingStart = existing.getStartTime();
        LocalTime existingEffectiveEnd = existing.getEffectiveEndTime(); // endTime + buffer

        // If existing booking has missing times, treat it as non-overlapping
        if (existingStart == null || existingEffectiveEnd == null) {
            return false;
        }

        // Overlap formula: (start < existingEnd) && (end > existingStart)
        return newStart.isBefore(existingEffectiveEnd) && newEnd.isAfter(existingStart);
    }

    // ========================================================
    // 2. CALCULATE PRICE - Tách theo nhiều khung giá
    // Ví dụ: 07:00-10:00 = 60k + 80k*2 = 220k
    // ========================================================
    @Override
    @Transactional(readOnly = true)
    public PriceCalculationResponse calculatePrice(Integer courtId, LocalDate playDate,
                                                    LocalTime startTime, LocalTime endTime) {
        validateTimeRange(startTime, endTime);

        BadmintonCourt court = courtRepository.findById(courtId)
                .orElseThrow(() -> new ResourceNotFoundException("Court not found: " + courtId));

        DayType dayType = getDayType(playDate);

        // Lấy tất cả khung giá của sân theo loại ngày
        List<CourtPrice> prices = courtPriceRepository.findByCourtIdAndDayType(courtId, dayType);

        if (prices.isEmpty()) {
            throw new RuntimeException("Chưa cấu hình giá cho sân " + court.getName() + " vào " + dayType);
        }

        // Sort theo startTime
        prices.sort(Comparator.comparing(CourtPrice::getStartTime));

        // Tính giá từng segment
        List<PriceCalculationResponse.PriceSegment> breakdown = new ArrayList<>();
        BigDecimal totalPrice = BigDecimal.ZERO;
        LocalTime currentTime = startTime;

        while (currentTime.isBefore(endTime)) {
            // Tìm khung giá phù hợp cho currentTime
            CourtPrice applicablePrice = findApplicablePrice(prices, currentTime);

            if (applicablePrice == null) {
                throw new RuntimeException("Không tìm thấy giá cho khung giờ " + currentTime);
            }

            // Xác định segment end: min(endTime, priceEndTime)
            LocalTime segmentEnd = endTime.isBefore(applicablePrice.getEndTime()) ?
                    endTime : applicablePrice.getEndTime();

            // Tính duration và giá
            int segmentMinutes = (int) Duration.between(currentTime, segmentEnd).toMinutes();
            BigDecimal pricePerHour = applicablePrice.getPricePerHour();
            BigDecimal subtotal = pricePerHour
                    .multiply(BigDecimal.valueOf(segmentMinutes))
                    .divide(BigDecimal.valueOf(60), 0, RoundingMode.HALF_UP);

            breakdown.add(PriceCalculationResponse.PriceSegment.builder()
                    .start(currentTime)
                    .end(segmentEnd)
                    .minutes(segmentMinutes)
                    .pricePerHour(pricePerHour)
                    .subtotal(subtotal)
                    .periodName(getPeriodName(currentTime))
                    .build());

            totalPrice = totalPrice.add(subtotal);
            currentTime = segmentEnd;
        }

        int totalMinutes = (int) Duration.between(startTime, endTime).toMinutes();

        return PriceCalculationResponse.builder()
                .courtId(courtId)
                .courtName(court.getName())
                .playDate(playDate)
                .dayType(dayType.name())
                .startTime(startTime)
                .endTime(endTime)
                .totalMinutes(totalMinutes)
                .totalPrice(totalPrice)
                .breakdown(breakdown)
                .build();
    }

    private CourtPrice findApplicablePrice(List<CourtPrice> prices, LocalTime time) {
        for (CourtPrice price : prices) {
            // time >= startTime && time < endTime
            if (!time.isBefore(price.getStartTime()) && time.isBefore(price.getEndTime())) {
                return price;
            }
        }
        return null;
    }

    // ========================================================
    // 3. CREATE BOOKING
    // ========================================================
    @Override
    public BookingResponse createBooking(Integer userId, CreateBookingRequest request) {
        // Validate user
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found: " + userId));

        // Validate court
        BadmintonCourt court = courtRepository.findById(request.getCourtId())
                .orElseThrow(() -> new ResourceNotFoundException("Court not found: " + request.getCourtId()));

        // Validate time range
        validateTimeRange(request.getStartTime(), request.getEndTime());
        validateDuration(request.getStartTime(), request.getEndTime());
        validateOperatingHours(request.getStartTime(), request.getEndTime());
        validateFutureBooking(request.getPlayDate(), request.getStartTime());

        // Check availability
        AvailabilityResponse availability = checkAvailability(
                request.getCourtId(), request.getPlayDate(),
                request.getStartTime(), request.getEndTime());

        if (!availability.isAvailable()) {
            throw new RuntimeException("Khung giờ đã có người đặt. " +
                    "Conflicts: " + availability.getConflicts().size());
        }

        // Calculate price
        PriceCalculationResponse priceCalc = calculatePrice(
                request.getCourtId(), request.getPlayDate(),
                request.getStartTime(), request.getEndTime());

        // Create booking
        Booking booking = new Booking();
        booking.setUser(user);
        booking.setCourt(court);
        booking.setPlayDate(request.getPlayDate());
        booking.setStartTime(request.getStartTime());
        booking.setEndTime(request.getEndTime());
        booking.setBufferMinutes(DEFAULT_BUFFER_MINUTES);
        booking.setBasePrice(priceCalc.getTotalPrice());
        booking.setTotalPrice(priceCalc.getTotalPrice());
        booking.setStatus(STATUS_PENDING);
        booking.setPaymentStatus("UNPAID");
        booking.setBookingDate(LocalDate.now());
        booking.setNotes(request.getNotes());
        booking.setOvertimeMinutes(0);
        booking.setOvertimeFee(BigDecimal.ZERO);

        Booking saved = bookingRepository.save(booking);

        // Save price breakdown
        savePriceBreakdown(saved, priceCalc);

        log.info("Created booking {} for court {} from {} to {}",
                saved.getId(), court.getName(), request.getStartTime(), request.getEndTime());

        return toBookingResponse(saved);
    }

    // ========================================================
    // 4. EXTEND BOOKING - Chỉ cho phép nếu giờ tiếp theo còn trống
    // ========================================================
    @Override
    public BookingResponse extendBooking(Integer bookingId, ExtendBookingRequest request) {
        Booking booking = bookingRepository.findById(bookingId)
                .orElseThrow(() -> new ResourceNotFoundException("Booking not found: " + bookingId));

        // Chỉ có thể gia hạn khi đang PLAYING hoặc CONFIRMED
        if (!STATUS_PLAYING.equals(booking.getStatus()) && !STATUS_CONFIRMED.equals(booking.getStatus())) {
            throw new RuntimeException("Chỉ có thể gia hạn booking đang PLAYING hoặc CONFIRMED");
        }

        LocalTime currentEndTime = booking.getEndTime();
        LocalTime newEndTime;

        // Xác định thời gian kết thúc mới
        if (request.getNewEndTime() != null) {
            newEndTime = request.getNewEndTime();
        } else if (request.getExtensionMinutes() != null) {
            newEndTime = currentEndTime.plusMinutes(request.getExtensionMinutes());
        } else {
            throw new RuntimeException("Phải cung cấp newEndTime hoặc extensionMinutes");
        }

        // Validate new end time
        if (!newEndTime.isAfter(currentEndTime)) {
            throw new RuntimeException("Thời gian gia hạn phải sau thời gian kết thúc hiện tại");
        }

        validateOperatingHours(booking.getStartTime(), newEndTime);

        // Check if extension is available (không trùng với booking tiếp theo)
        List<Booking> nextBookings = bookingRepository.findNextBookings(
                booking.getCourt().getId(), booking.getPlayDate(), currentEndTime);

        if (!nextBookings.isEmpty()) {
            Booking nextBooking = nextBookings.get(0);
            LocalTime newEffectiveEnd = newEndTime.plusMinutes(DEFAULT_BUFFER_MINUTES);

            if (newEffectiveEnd.isAfter(nextBooking.getStartTime())) {
                throw new RuntimeException("Không thể gia hạn - có booking tiếp theo lúc " +
                        nextBooking.getStartTime());
            }
        }

        // Calculate extension fee
        int extensionMinutes = (int) Duration.between(currentEndTime, newEndTime).toMinutes();
        PriceCalculationResponse extPrice = calculatePrice(
                booking.getCourt().getId(), booking.getPlayDate(),
                currentEndTime, newEndTime);

        // Create extension record
        BookingExtension extension = new BookingExtension();
        extension.setBooking(booking);
        extension.setOriginalEndTime(currentEndTime);
        extension.setExtendedEndTime(newEndTime);
        extension.setExtensionMinutes(extensionMinutes);
        extension.setExtensionFee(extPrice.getTotalPrice());

        // Update booking
        booking.setEndTime(newEndTime);
        booking.setBasePrice(booking.getBasePrice().add(extPrice.getTotalPrice()));
        booking.setTotalPrice(booking.getTotalPrice().add(extPrice.getTotalPrice()));
        booking.getExtensions().add(extension);

        Booking saved = bookingRepository.save(booking);

        log.info("Extended booking {} from {} to {}. Fee: {}",
                bookingId, currentEndTime, newEndTime, extPrice.getTotalPrice());

        return toBookingResponse(saved);
    }

    // ========================================================
    // 5. CALCULATE OVERTIME FEE - Khi khách về muộn
    // ========================================================
    @Override
    @Transactional(readOnly = true)
    public OvertimeResponse calculateOvertimeFee(Integer bookingId, LocalTime actualEndTime) {
        Booking booking = bookingRepository.findById(bookingId)
                .orElseThrow(() -> new ResourceNotFoundException("Booking not found: " + bookingId));

        LocalTime scheduledEnd = booking.getEndTime();

        // Nếu về sớm hoặc đúng giờ -> không tính overtime
        if (!actualEndTime.isAfter(scheduledEnd)) {
            return OvertimeResponse.builder()
                    .bookingId(bookingId)
                    .scheduledEndTime(scheduledEnd)
                    .actualEndTime(actualEndTime)
                    .overtimeMinutes(0)
                    .overtimeFee(BigDecimal.ZERO)
                    .message("Khách về đúng giờ hoặc sớm - không tính phí overtime")
                    .build();
        }

        int overtimeMinutes = (int) Duration.between(scheduledEnd, actualEndTime).toMinutes();

        // Cap overtime at max
        if (overtimeMinutes > MAX_OVERTIME_MINUTES) {
            log.warn("Overtime {} minutes exceeds max {}. Capping.", overtimeMinutes, MAX_OVERTIME_MINUTES);
        }

        // Tính phí overtime = giá khung giờ * hệ số overtime * thời gian
        // Lấy giá của khung giờ overtime
        DayType dayType = getDayType(booking.getPlayDate());
        BigDecimal basePricePerHour = courtPriceRepository
                .findPriceForTime(booking.getCourt().getId(), dayType, scheduledEnd)
                .map(CourtPrice::getPricePerHour)
                .orElse(new BigDecimal("100000")); // Default price

        BigDecimal overtimeFee = basePricePerHour
                .multiply(OVERTIME_RATE_MULTIPLIER)
                .multiply(BigDecimal.valueOf(overtimeMinutes))
                .divide(BigDecimal.valueOf(60), 0, RoundingMode.HALF_UP);

        return OvertimeResponse.builder()
                .bookingId(bookingId)
                .scheduledEndTime(scheduledEnd)
                .actualEndTime(actualEndTime)
                .overtimeMinutes(overtimeMinutes)
                .overtimeRate(OVERTIME_RATE_MULTIPLIER)
                .basePricePerHour(basePricePerHour)
                .overtimeFee(overtimeFee)
                .message(String.format("Overtime %d phút, phí: %s VND (hệ số x%.1f)",
                        overtimeMinutes, overtimeFee.toPlainString(), OVERTIME_RATE_MULTIPLIER))
                .build();
    }

    // ========================================================
    // 6. COMPLETE BOOKING - Kết thúc và tính overtime nếu có
    // ========================================================
    @Override
    public BookingResponse completeBooking(Integer bookingId, LocalTime actualEndTime) {
        Booking booking = bookingRepository.findById(bookingId)
                .orElseThrow(() -> new ResourceNotFoundException("Booking not found: " + bookingId));

        if (!STATUS_PLAYING.equals(booking.getStatus())) {
            throw new RuntimeException("Chỉ có thể hoàn thành booking đang PLAYING");
        }

        // Calculate overtime if applicable
        OvertimeResponse overtime = calculateOvertimeFee(bookingId, actualEndTime);

        booking.setActualEndTime(actualEndTime);
        booking.setOvertimeMinutes(overtime.getOvertimeMinutes());
        booking.setOvertimeFee(overtime.getOvertimeFee());
        booking.setTotalPrice(booking.getBasePrice().add(overtime.getOvertimeFee()));
        booking.setStatus(STATUS_COMPLETED);

        Booking saved = bookingRepository.save(booking);

        log.info("Completed booking {}. Actual end: {}, Overtime: {} mins, Fee: {}",
                bookingId, actualEndTime, overtime.getOvertimeMinutes(), overtime.getOvertimeFee());

        return toBookingResponse(saved);
    }

    // ========================================================
    // 7. OTHER METHODS
    // ========================================================

    @Override
    @Transactional(readOnly = true)
    public BookingResponse getBooking(Integer bookingId) {
        Booking booking = bookingRepository.findById(bookingId)
                .orElseThrow(() -> new ResourceNotFoundException("Booking not found: " + bookingId));
        return toBookingResponse(booking);
    }

    @Override
    public BookingResponse updateBookingStatus(Integer bookingId, String newStatus) {
        Booking booking = bookingRepository.findById(bookingId)
                .orElseThrow(() -> new ResourceNotFoundException("Booking not found: " + bookingId));

        validateStatusTransition(booking.getStatus(), newStatus);
        booking.setStatus(newStatus);

        Booking saved = bookingRepository.save(booking);
        return toBookingResponse(saved);
    }

    @Override
    public BookingResponse cancelBooking(Integer bookingId, String reason) {
        Booking booking = bookingRepository.findById(bookingId)
                .orElseThrow(() -> new ResourceNotFoundException("Booking not found: " + bookingId));

        if (STATUS_COMPLETED.equals(booking.getStatus()) || STATUS_CANCELLED.equals(booking.getStatus())) {
            throw new RuntimeException("Không thể hủy booking đã COMPLETED hoặc CANCELLED");
        }

        if (STATUS_PLAYING.equals(booking.getStatus())) {
            throw new RuntimeException("Không thể hủy booking đang PLAYING");
        }

        booking.setStatus(STATUS_CANCELLED);
        String currentNotes = booking.getNotes() != null ? booking.getNotes() : "";
        booking.setNotes(currentNotes + "\nCancelled by admin: " + (reason != null ? reason : "Không có lý do"));

        Booking saved = bookingRepository.save(booking);
        log.info("Cancelled booking {}: {}", bookingId, reason);

        return toBookingResponse(saved);
    }

    @Override
    public BookingResponse cancelMyBooking(Integer userId, Integer bookingId, String reason) {
        Booking booking = bookingRepository.findById(bookingId)
                .orElseThrow(() -> new ResourceNotFoundException("Booking not found: " + bookingId));

        // Kiểm tra booking có thuộc về user này không
        if (!booking.getUser().getId().equals(userId)) {
            throw new RuntimeException("Bạn không có quyền hủy booking này");
        }

        // Chỉ cho phép hủy khi đang PENDING (chưa được admin duyệt)
        if (!STATUS_PENDING.equals(booking.getStatus())) {
            throw new RuntimeException("Chỉ có thể hủy booking đang chờ duyệt (PENDING). " +
                    "Booking đã được duyệt vui lòng liên hệ admin để hủy.");
        }

        booking.setStatus(STATUS_CANCELLED);
        String currentNotes = booking.getNotes() != null ? booking.getNotes() : "";
        booking.setNotes(currentNotes + "\nCancelled by user: " + (reason != null ? reason : "Không có lý do"));

        Booking saved = bookingRepository.save(booking);
        log.info("User {} cancelled their booking {}: {}", userId, bookingId, reason);

        return toBookingResponse(saved);
    }

    @Override
    @Transactional(readOnly = true)
    public List<BookingResponse> getUserBookings(Integer userId, LocalDate fromDate, LocalDate toDate) {
        List<Booking> bookings = bookingRepository.findByUserIdAndPlayDateBetween(userId, fromDate, toDate);
        return bookings.stream().map(this::toBookingResponse).collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<BookingResponse> getUserBookingsWithFilter(Integer userId, LocalDate fromDate, LocalDate toDate,
                                                            String status, String paymentStatus) {
        List<Booking> bookings;

        // Nếu có filter date thì dùng, không thì lấy tất cả
        if (fromDate != null && toDate != null) {
            bookings = bookingRepository.findByUserIdAndPlayDateBetween(userId, fromDate, toDate);
        } else {
            bookings = bookingRepository.findByUserId(userId);
        }

        // Filter theo status nếu có
        if (status != null && !status.isEmpty()) {
            bookings = bookings.stream()
                    .filter(b -> status.equalsIgnoreCase(b.getStatus()))
                    .collect(Collectors.toList());
        }

        // Filter theo paymentStatus nếu có
        if (paymentStatus != null && !paymentStatus.isEmpty()) {
            bookings = bookings.stream()
                    .filter(b -> paymentStatus.equalsIgnoreCase(b.getPaymentStatus()))
                    .collect(Collectors.toList());
        }

        // Sắp xếp theo ngày giảm dần (mới nhất trước)
        bookings.sort((b1, b2) -> {
            int dateCompare = b2.getPlayDate().compareTo(b1.getPlayDate());
            if (dateCompare != 0) return dateCompare;
            return b2.getStartTime().compareTo(b1.getStartTime());
        });

        return bookings.stream().map(this::toBookingResponse).collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<BookingResponse> getCourtBookings(Integer courtId, LocalDate date) {
        List<Booking> bookings = bookingRepository.findByCourtIdAndPlayDate(courtId, date);
        return bookings.stream().map(this::toBookingResponse).collect(Collectors.toList());
    }

    @Override
    public BookingResponse checkIn(Integer bookingId) {
        Booking booking = bookingRepository.findById(bookingId)
                .orElseThrow(() -> new ResourceNotFoundException("Booking not found: " + bookingId));

        if (!STATUS_CONFIRMED.equals(booking.getStatus())) {
            throw new RuntimeException("Chỉ có thể check-in booking đã CONFIRMED");
        }

        booking.setStatus(STATUS_PLAYING);
        Booking saved = bookingRepository.save(booking);

        log.info("Checked in booking {}", bookingId);
        return toBookingResponse(saved);
    }

    @Override
    @Transactional(readOnly = true)
    public List<AvailabilityResponse.AvailableSlot> getAvailableSlots(Integer courtId, LocalDate date) {
        List<Booking> bookings = bookingRepository.findActiveBookingsByCourtAndDate(courtId, date, null);
        return findAvailableSlots(courtId, date, bookings);
    }

    // ========================================================
    // HELPER METHODS
    // ========================================================

    private void validateTimeRange(LocalTime startTime, LocalTime endTime) {
        if (startTime == null || endTime == null) {
            throw new RuntimeException("Start time và end time không được null");
        }
        if (!endTime.isAfter(startTime)) {
            throw new RuntimeException("End time phải sau start time");
        }
    }

    private void validateDuration(LocalTime startTime, LocalTime endTime) {
        int duration = (int) Duration.between(startTime, endTime).toMinutes();
        if (duration < MIN_BOOKING_DURATION) {
            throw new RuntimeException("Thời lượng đặt sân tối thiểu " + MIN_BOOKING_DURATION + " phút");
        }
        // Bỏ kiểm tra thời gian tối đa
    }

    private void validateOperatingHours(LocalTime startTime, LocalTime endTime) {
        if (startTime.isBefore(OPERATING_START) || endTime.isAfter(OPERATING_END)) {
            throw new RuntimeException("Giờ hoạt động từ " + OPERATING_START + " đến " + OPERATING_END);
        }
    }

    private void validateFutureBooking(LocalDate playDate, LocalTime startTime) {
        LocalDate today = LocalDate.now();
        if (playDate.isBefore(today)) {
            throw new RuntimeException("Không thể đặt sân cho ngày trong quá khứ");
        }
        if (playDate.equals(today) && startTime.isBefore(LocalTime.now())) {
            throw new RuntimeException("Không thể đặt sân cho giờ đã qua");
        }
    }

    private void validateStatusTransition(String current, String newStatus) {
        Map<String, Set<String>> validTransitions = Map.of(
                STATUS_PENDING, Set.of(STATUS_CONFIRMED, STATUS_CANCELLED),
                STATUS_CONFIRMED, Set.of(STATUS_PLAYING, STATUS_CANCELLED),
                STATUS_PLAYING, Set.of(STATUS_COMPLETED),
                STATUS_COMPLETED, Set.of(),
                STATUS_CANCELLED, Set.of()
        );

        Set<String> allowed = validTransitions.getOrDefault(current, Set.of());
        if (!allowed.contains(newStatus)) {
            throw new RuntimeException("Không thể chuyển từ " + current + " sang " + newStatus);
        }
    }

    private DayType getDayType(LocalDate date) {
        DayOfWeek day = date.getDayOfWeek();
        if (day == DayOfWeek.SATURDAY || day == DayOfWeek.SUNDAY) {
            return DayType.WEEKEND;
        }
        return DayType.WEEKDAY;
    }

    private String getPeriodName(LocalTime time) {
        if (time == null) return "Ngoài giờ";
        int hour = time.getHour();
        if (hour >= 6 && hour < 8) return "Sáng sớm";
        if (hour >= 8 && hour < 11) return "Sáng";
        if (hour >= 11 && hour < 14) return "Trưa";
        if (hour >= 14 && hour < 17) return "Chiều";
        if (hour >= 17 && hour < 21) return "Giờ vàng";
        if (hour >= 21 && hour < 22) return "Tối muộn";
        return "Ngoài giờ";
    }

    private List<AvailabilityResponse.AvailableSlot> findAvailableSlots(
            Integer courtId, LocalDate date, List<Booking> existingBookings) {

        List<AvailabilityResponse.AvailableSlot> slots = new ArrayList<>();

        // Sort bookings by start time and filter out invalid bookings
        List<Booking> sorted = existingBookings.stream()
                .filter(b -> b.getStartTime() != null && b.getEndTime() != null) // Filter out null times
                .sorted(Comparator.comparing(Booking::getStartTime))
                .collect(Collectors.toList());

        LocalTime currentStart = OPERATING_START;

        for (Booking booking : sorted) {
            LocalTime bookingStart = booking.getStartTime();
            LocalTime bookingEffectiveEnd = booking.getEffectiveEndTime();

            // Skip if effective end time is null
            if (bookingEffectiveEnd == null) {
                continue;
            }

            // Gap before this booking
            if (currentStart.isBefore(bookingStart)) {
                int gap = (int) Duration.between(currentStart, bookingStart).toMinutes();
                if (gap >= MIN_BOOKING_DURATION) {
                    slots.add(AvailabilityResponse.AvailableSlot.builder()
                            .startTime(currentStart)
                            .endTime(bookingStart)
                            .durationMinutes(gap)
                            .build());
                }
            }

            // Move current to after this booking (including buffer)
            currentStart = bookingEffectiveEnd;
        }

        // Gap after last booking until closing
        if (currentStart != null && currentStart.isBefore(OPERATING_END)) {
            int gap = (int) Duration.between(currentStart, OPERATING_END).toMinutes();
            if (gap >= MIN_BOOKING_DURATION) {
                slots.add(AvailabilityResponse.AvailableSlot.builder()
                        .startTime(currentStart)
                        .endTime(OPERATING_END)
                        .durationMinutes(gap)
                        .build());
            }
        }

        return slots;
    }

    private void savePriceBreakdown(Booking booking, PriceCalculationResponse priceCalc) {
        Set<BookingPriceBreakdown> breakdowns = new LinkedHashSet<>();

        for (PriceCalculationResponse.PriceSegment segment : priceCalc.getBreakdown()) {
            BookingPriceBreakdown breakdown = new BookingPriceBreakdown();
            breakdown.setBooking(booking);
            breakdown.setPeriodStart(segment.getStart());
            breakdown.setPeriodEnd(segment.getEnd());
            breakdown.setDurationMinutes(segment.getMinutes());
            breakdown.setPricePerHour(segment.getPricePerHour());
            breakdown.setSubtotal(segment.getSubtotal());
            breakdown.setDayType(priceCalc.getDayType());
            breakdowns.add(breakdown);
        }

        booking.setPriceBreakdowns(breakdowns);
    }

    private BookingResponse toBookingResponse(Booking booking) {
        List<BookingResponse.PriceBreakdownDTO> breakdownDTOs = new ArrayList<>();
        if (booking.getPriceBreakdowns() != null) {
            for (BookingPriceBreakdown b : booking.getPriceBreakdowns()) {
                breakdownDTOs.add(BookingResponse.PriceBreakdownDTO.builder()
                        .periodStart(b.getPeriodStart())
                        .periodEnd(b.getPeriodEnd())
                        .durationMinutes(b.getDurationMinutes())
                        .pricePerHour(b.getPricePerHour())
                        .subtotal(b.getSubtotal())
                        .dayType(b.getDayType())
                        .build());
            }
        }

        List<BookingResponse.ExtensionDTO> extensionDTOs = new ArrayList<>();
        if (booking.getExtensions() != null) {
            for (BookingExtension e : booking.getExtensions()) {
                extensionDTOs.add(BookingResponse.ExtensionDTO.builder()
                        .originalEndTime(e.getOriginalEndTime())
                        .extendedEndTime(e.getExtendedEndTime())
                        .extensionMinutes(e.getExtensionMinutes())
                        .extensionFee(e.getExtensionFee())
                        .build());
            }
        }

        BadmintonCourt court = booking.getCourt();
        User user = booking.getUser();

        return BookingResponse.builder()
                .bookingId(booking.getId())
                .courtId(court != null ? court.getId() : null)
                .courtName(court != null ? court.getName() : null)
                .courtType(court != null && court.getType() != null ? court.getType().name() : null)
                .customerId(user != null ? user.getId() : null)
                .customerName(user != null ? user.getFullName() : null)
                .customerPhone(user != null ? user.getPhoneNumber() : null)
                .playDate(booking.getPlayDate())
                .startTime(booking.getStartTime())
                .endTime(booking.getEndTime())
                .actualEndTime(booking.getActualEndTime())
                .durationMinutes(booking.getDurationMinutes())
                .bufferMinutes(booking.getBufferMinutes())
                .status(booking.getStatus())
                .paymentStatus(booking.getPaymentStatus())
                .basePrice(booking.getBasePrice())
                .overtimeFee(booking.getOvertimeFee())
                .totalPrice(booking.getTotalPrice())
                .overtimeMinutes(booking.getOvertimeMinutes())
                .priceBreakdown(breakdownDTOs)
                .extensions(extensionDTOs)
                .notes(booking.getNotes())
                .bookingDate(booking.getBookingDate())
                .build();
    }
}

