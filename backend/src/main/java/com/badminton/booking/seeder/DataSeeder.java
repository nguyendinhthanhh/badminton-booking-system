package com.badminton.booking.seeder;

import com.badminton.booking.entity.*;
import com.badminton.booking.entity.enums.*;
import com.badminton.booking.repository.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.Arrays;
import java.util.List;
import java.util.ArrayList;

@Component
@RequiredArgsConstructor
@Slf4j
public class DataSeeder implements CommandLineRunner {

    private final RoleRepository roleRepository;
    private final UserRepository userRepository;
    private final BadmintonCourtRepo courtRepository;
    private final CategoryRepository categoryRepository;
    private final WarehouseRepository warehouseRepository;
    private final ProductRepository productRepository;
    private final TimeSlotRepository timeSlotRepository;
    private final PriceRuleRepository priceRuleRepository;
    private final BookingRepository bookingRepository;
    private final BookingDetailRepository bookingDetailRepository;
    private final CoachRepository coachRepository;
    private final LockerRepository lockerRepository;
    private final BadmintonRacketRepository racketRepository;
    private final PaymentRepository paymentRepository;
    private final OrderRepository orderRepository;
    private final OrderItemRepository orderItemRepository;
    private final ReviewRepository reviewRepository;
    private final NotificationRepository notificationRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    @Transactional
    public void run(String... args) throws Exception {
        if (roleRepository.count() > 0) {
            log.info("Data already seeded, skipping...");
            return;
        }

        log.info("Starting comprehensive data seeding...");

        seedRoles();
        seedUsers();
        seedWarehouses();
        seedCategories();
        seedProducts();
        seedBadmintonCourts();
        seedTimeSlots();
        seedPriceRules();
        seedCoaches();
        seedLockers();
        seedBadmintonRackets();
        seedBookings();
        seedBookingDetails();
        seedPayments();
        seedOrders();
        seedOrderItems();
        seedReviews();
        seedNotifications();

        log.info("Comprehensive data seeding completed successfully!");
    }

    private void seedRoles() {
        log.info("Seeding roles...");
        List<Role> roles = Arrays.asList(
            createRole("ADMIN"),
            createRole("MANAGER"),
            createRole("STAFF"),
            createRole("USER"),
            createRole("COACH")
        );
        roleRepository.saveAll(roles);
    }

    private Role createRole(String roleName) {
        Role role = new Role();
        role.setRoleName(roleName);
        return role;
    }

    private void seedUsers() {
        log.info("Seeding users...");
        Role adminRole = roleRepository.findByRoleName("ADMIN").orElse(null);
        Role managerRole = roleRepository.findByRoleName("MANAGER").orElse(null);
        Role staffRole = roleRepository.findByRoleName("STAFF").orElse(null);
        Role userRole = roleRepository.findByRoleName("USER").orElse(null);
        Role coachRole = roleRepository.findByRoleName("COACH").orElse(null);

        List<User> users = Arrays.asList(
            createUser("admin", "admin@badminton.com", "Admin User", "0123456789", adminRole),
            createUser("manager1", "manager@badminton.com", "John Manager", "0123456788", managerRole),
            createUser("staff1", "staff1@badminton.com", "Alice Staff", "0123456787", staffRole),
            createUser("staff2", "staff2@badminton.com", "Bob Staff", "0123456786", staffRole),
            createUser("user1", "user1@gmail.com", "Nguyen Van A", "0987654321", userRole),
            createUser("user2", "user2@gmail.com", "Tran Thi B", "0987654322", userRole),
            createUser("user3", "user3@gmail.com", "Le Van C", "0987654323", userRole),
            createUser("coach1", "coach1@badminton.com", "Coach David", "0912345678", coachRole),
            createUser("coach2", "coach2@badminton.com", "Coach Emma", "0912345679", coachRole)
        );
        userRepository.saveAll(users);
    }

    private User createUser(String username, String email, String fullName, String phone, Role role) {
        User user = new User();
        user.setUsername(username);
        user.setEmail(email);
        user.setFullName(fullName);
        user.setPhoneNumber(phone);
        user.setPasswordHash(passwordEncoder.encode("password123"));
        user.setRole(role);
        user.setCreatedAt(Instant.now());
        return user;
    }

    private void seedWarehouses() {
        log.info("Seeding warehouses...");
        User manager = userRepository.findByUsername("manager1").orElse(null);

        List<Warehouse> warehouses = Arrays.asList(
            createWarehouse("WH001", "123 Main St, Ho Chi Minh City", manager),
            createWarehouse("WH002", "456 Equipment Ave, Ho Chi Minh City", manager),
            createWarehouse("WH003", "789 Storage Rd, Ho Chi Minh City", manager)
        );
        warehouseRepository.saveAll(warehouses);
    }

    private Warehouse createWarehouse(String name, String address, User manager) {
        Warehouse warehouse = new Warehouse();
        warehouse.setName(name);
        warehouse.setAddress(address);
        warehouse.setManager(manager);
        return warehouse;
    }

    private void seedCategories() {
        log.info("Seeding categories...");
        List<Category> categories = Arrays.asList(
            createCategory("Rackets"),
            createCategory("Shoes"),
            createCategory("Shuttlecocks"),
            createCategory("Accessories"),
            createCategory("Apparel"),
            createCategory("Bags"),
            createCategory("Strings"),
            createCategory("Grips")
        );
        categoryRepository.saveAll(categories);
    }

    private Category createCategory(String name) {
        Category category = new Category();
        category.setName(name);
        return category;
    }

    private void seedProducts() {
        log.info("Seeding products...");
        Category racketCategory = categoryRepository.findByName("Rackets").orElse(null);
        Category shoeCategory = categoryRepository.findByName("Shoes").orElse(null);
        Category shuttleCategory = categoryRepository.findByName("Shuttlecocks").orElse(null);
        Category accessoryCategory = categoryRepository.findByName("Accessories").orElse(null);

        Warehouse mainWarehouse = warehouseRepository.findByName("WH001").orElse(null);
        Warehouse equipmentWarehouse = warehouseRepository.findByName("WH002").orElse(null);

        List<Product> products = Arrays.asList(
            createProduct("YONEX Arcsaber 11", "ARC11", new BigDecimal("4500000"), "Professional badminton racket", 15, racketCategory, mainWarehouse),
            createProduct("Victor Thruster K7000", "VTK7000", new BigDecimal("3800000"), "High-performance racket", 20, racketCategory, mainWarehouse),
            createProduct("YONEX Power Cushion 65", "YPC65", new BigDecimal("2200000"), "Professional badminton shoes", 25, shoeCategory, equipmentWarehouse),
            createProduct("Victor SH-A922", "VSH922", new BigDecimal("1800000"), "Lightweight badminton shoes", 30, shoeCategory, equipmentWarehouse),
            createProduct("YONEX AS-50", "YAS50", new BigDecimal("280000"), "Tournament grade shuttlecocks", 100, shuttleCategory, mainWarehouse),
            createProduct("Victor Gold No.1", "VG1", new BigDecimal("320000"), "Premium shuttlecocks", 80, shuttleCategory, mainWarehouse),
            createProduct("Badminton String BG65", "BG65", new BigDecimal("180000"), "Durable badminton string", 50, accessoryCategory, equipmentWarehouse),
            createProduct("Grip Tape Super", "GRIPS", new BigDecimal("45000"), "Anti-slip grip tape", 200, accessoryCategory, equipmentWarehouse)
        );
        productRepository.saveAll(products);
    }

    private Product createProduct(String name, String sku, BigDecimal price, String description, int quantity, Category category, Warehouse warehouse) {
        Product product = new Product();
        product.setName(name);
        product.setSku(sku);
        product.setBasePrice(price);
        product.setDescription(description);
        product.setQuantity(quantity);
        product.setCategory(category);
        product.setWarehouse(warehouse);
        return product;
    }

    private void seedBadmintonCourts() {
        log.info("Seeding badminton courts...");
        List<BadmintonCourt> courts = Arrays.asList(
            createBadmintonCourt("Court 1", CourtType.DOUBLE, CourtStatus.ACTIVE, "Ground Floor", 4),
            createBadmintonCourt("Court 2", CourtType.DOUBLE, CourtStatus.ACTIVE, "Ground Floor", 4),
            createBadmintonCourt("Court 3", CourtType.SINGLE, CourtStatus.ACTIVE, "Ground Floor", 2),
            createBadmintonCourt("Court 4", CourtType.SINGLE, CourtStatus.ACTIVE, "Ground Floor", 2),
            createBadmintonCourt("VIP Court 1", CourtType.VIP, CourtStatus.ACTIVE, "2nd Floor", 4),
            createBadmintonCourt("VIP Court 2", CourtType.VIP, CourtStatus.ACTIVE, "2nd Floor", 4),
            createBadmintonCourt("Court 5", CourtType.DOUBLE, CourtStatus.MAINTENANCE, "Ground Floor", 4),
            createBadmintonCourt("Outdoor Court", CourtType.OUTDOOR, CourtStatus.ACTIVE, "Outdoor Area", 4)
        );
        courtRepository.saveAll(courts);
    }

    private BadmintonCourt createBadmintonCourt(String name, CourtType type, CourtStatus status, String location, int capacity) {
        BadmintonCourt court = new BadmintonCourt();
        court.setName(name);
        court.setType(type);
        court.setStatus(status);
        court.setLocation(location);
        court.setCapacity(capacity);
        court.setDescription("Professional badminton court");
        court.setCreatedAt(LocalDateTime.now());
        return court;
    }

    private void seedTimeSlots() {
        log.info("Seeding time slots...");
        List<TimeSlot> timeSlots = Arrays.asList(
            createTimeSlot(LocalTime.of(6, 0), LocalTime.of(8, 0), "Early Morning"),
            createTimeSlot(LocalTime.of(8, 0), LocalTime.of(10, 0), "Morning"),
            createTimeSlot(LocalTime.of(10, 0), LocalTime.of(12, 0), "Late Morning"),
            createTimeSlot(LocalTime.of(12, 0), LocalTime.of(14, 0), "Noon"),
            createTimeSlot(LocalTime.of(14, 0), LocalTime.of(16, 0), "Afternoon"),
            createTimeSlot(LocalTime.of(16, 0), LocalTime.of(18, 0), "Late Afternoon"),
            createTimeSlot(LocalTime.of(18, 0), LocalTime.of(20, 0), "Evening"),
            createTimeSlot(LocalTime.of(20, 0), LocalTime.of(22, 0), "Night")
        );
        timeSlotRepository.saveAll(timeSlots);
    }

    private TimeSlot createTimeSlot(LocalTime startTime, LocalTime endTime, String periodName) {
        TimeSlot timeSlot = new TimeSlot();
        timeSlot.setStartTime(startTime);
        timeSlot.setEndTime(endTime);
        timeSlot.setPeriodName(periodName);
        timeSlot.setIsActive(true);
        return timeSlot;
    }

    private void seedPriceRules() {
        log.info("Seeding price rules...");
        List<BadmintonCourt> courts = courtRepository.findAll();
        List<TimeSlot> timeSlots = timeSlotRepository.findAll();

        for (BadmintonCourt court : courts) {
            for (TimeSlot timeSlot : timeSlots) {
                BigDecimal price = calculatePrice(court.getType(), timeSlot.getStartTime());
                PriceRule priceRule = new PriceRule();
                priceRule.setCourt(court);
                priceRule.setSlot(timeSlot);
                priceRule.setPrice(price);
                priceRule.setEffectiveFrom(LocalDate.now().minusDays(30));
                priceRule.setEffectiveTo(LocalDate.now().plusYears(1));
                priceRule.setIsActive(true);
                priceRuleRepository.save(priceRule);
            }
        }
    }

    private BigDecimal calculatePrice(CourtType courtType, LocalTime time) {
        BigDecimal basePrice = new BigDecimal("150000");
        if (courtType == CourtType.VIP) basePrice = basePrice.multiply(new BigDecimal("2"));
        else if (courtType == CourtType.SINGLE) basePrice = basePrice.multiply(new BigDecimal("0.7"));
        else if (courtType == CourtType.OUTDOOR) basePrice = basePrice.multiply(new BigDecimal("0.6"));

        if (time.isAfter(LocalTime.of(17, 59))) basePrice = basePrice.multiply(new BigDecimal("1.3"));
        else if (time.isBefore(LocalTime.of(8, 1))) basePrice = basePrice.multiply(new BigDecimal("0.8"));

        return basePrice;
    }

    private void seedCoaches() {
        log.info("Seeding coaches...");
        User coach1 = userRepository.findByUsername("coach1").orElse(null);
        User coach2 = userRepository.findByUsername("coach2").orElse(null);

        List<Coach> coaches = Arrays.asList(
            createCoach("Beginner, Intermediate", new BigDecimal("500000"), coach1),
            createCoach("Intermediate, Advanced", new BigDecimal("700000"), coach2)
        );
        coachRepository.saveAll(coaches);
    }

    private Coach createCoach(String specialization, BigDecimal hourlyRate, User user) {
        Coach coach = new Coach();
        coach.setSpecialization(specialization);
        coach.setHourlyRate(hourlyRate);
        coach.setUser(user);
        coach.setIsAvailable(true);
        coach.setCreatedAt(Instant.now());
        return coach;
    }

    private void seedLockers() {
        log.info("Seeding lockers...");
        List<Locker> lockers = new ArrayList<>();
        for (int i = 1; i <= 20; i++) {
            Locker locker = new Locker();
            locker.setLockerNumber("L" + String.format("%03d", i));
            locker.setStatus(LockerStatus.AVAILABLE);
            locker.setSize(i <= 10 ? "SMALL" : "LARGE");
            locker.setLocation(i <= 10 ? "Ground Floor" : "Second Floor");
            locker.setRentalPrice(new BigDecimal("20000"));
            lockers.add(locker);
        }
        lockerRepository.saveAll(lockers);
    }

    private void seedBadmintonRackets() {
        log.info("Seeding badminton rackets...");
        List<BadmintonRacket> rackets = new ArrayList<>();
        String[] brands = {"YONEX", "Victor", "Li-Ning"};
        for (int i = 1; i <= 15; i++) {
            BadmintonRacket racket = new BadmintonRacket();
            racket.setRacketCode("R" + String.format("%03d", i));
            racket.setBrand(brands[i % 3]);
            racket.setModel("Rental-" + String.format("%02d", i));
            racket.setStatus(RacketStatus.AVAILABLE);
            racket.setRentalPrice(new BigDecimal("50000"));
            racket.setConditionStatus("Good");
            rackets.add(racket);
        }
        racketRepository.saveAll(rackets);
    }

    private void seedBookings() {
        log.info("Seeding bookings...");
        List<User> users = userRepository.findByRole_RoleName("USER");
        List<BadmintonCourt> courts = courtRepository.findByStatus(CourtStatus.ACTIVE);

        if (users.isEmpty() || courts.isEmpty()) return;

        List<Booking> bookings = Arrays.asList(
            createBooking(users.get(0), courts.get(0), LocalDate.now().plusDays(1), new BigDecimal("300000"), "CONFIRMED", "PAID"),
            createBooking(users.get(1), courts.get(1), LocalDate.now().plusDays(2), new BigDecimal("450000"), "CONFIRMED", "PAID"),
            createBooking(users.get(2), courts.get(2), LocalDate.now().plusDays(3), new BigDecimal("210000"), "PENDING", "PENDING"),
            createBooking(users.get(0), courts.get(3), LocalDate.now().plusDays(4), new BigDecimal("210000"), "CONFIRMED", "PAID")
        );
        bookingRepository.saveAll(bookings);
    }

    private Booking createBooking(User user, BadmintonCourt court, LocalDate playDate, BigDecimal totalPrice, String status, String paymentStatus) {
        Booking booking = new Booking();
        booking.setUser(user);
        booking.setCourt(court);
        booking.setBookingDate(LocalDate.now());
        booking.setPlayDate(playDate);
        booking.setTotalPrice(totalPrice);
        booking.setStatus(status);
        booking.setPaymentStatus(paymentStatus);
        return booking;
    }

    private void seedBookingDetails() {
        log.info("Seeding booking details...");
        List<Booking> bookings = bookingRepository.findAll();
        List<TimeSlot> timeSlots = timeSlotRepository.findAll();

        for (int i = 0; i < bookings.size(); i++) {
            BookingDetail detail = new BookingDetail();
            detail.setBooking(bookings.get(i));
            detail.setSlot(timeSlots.get(i % timeSlots.size()));
            detail.setPriceAtBooking(new BigDecimal("150000"));
            detail.setStatus("CONFIRMED");
            bookingDetailRepository.save(detail);
        }
    }

    private void seedPayments() {
        log.info("Seeding payments...");
        List<Booking> paidBookings = bookingRepository.findByPaymentStatus("PAID");

        for (Booking booking : paidBookings) {
            Payment payment = new Payment();
            payment.setUser(booking.getUser());
            payment.setBooking(booking);
            payment.setAmount(booking.getTotalPrice());
            payment.setMethod(PaymentMethod.BANK_TRANSFER);
            payment.setTransactionDate(Instant.now());
            paymentRepository.save(payment);
        }
    }

    private void seedOrders() {
        log.info("Seeding orders...");
        List<User> users = userRepository.findByRole_RoleName("USER");
        if (users.isEmpty()) return;

        for (int i = 0; i < 2; i++) {
            Order order = new Order();
            order.setUser(users.get(i));
            order.setTotalAmount(new BigDecimal("500000").add(new BigDecimal(i * 100000)));
            order.setCreatedAt(Instant.now());
            orderRepository.save(order);
        }
    }

    private void seedOrderItems() {
        log.info("Seeding order items...");
        List<Order> orders = orderRepository.findAll();
        List<Product> products = productRepository.findAll();

        if (orders.isEmpty() || products.isEmpty()) return;

        for (int i = 0; i < orders.size(); i++) {
            OrderItem orderItem = new OrderItem();
            orderItem.setOrder(orders.get(i));
            orderItem.setProduct(products.get(i % products.size()));
            orderItem.setQuantity(2);
            orderItem.setUnitPrice(products.get(i % products.size()).getBasePrice());
            orderItemRepository.save(orderItem);
        }
    }

    private void seedReviews() {
        log.info("Seeding reviews...");
        List<Booking> bookings = bookingRepository.findByStatus("CONFIRMED");

        if (bookings.size() >= 2) {
            Review review1 = new Review();
            review1.setUser(bookings.get(0).getUser());
            review1.setBooking(bookings.get(0));
            review1.setRating(5);
            review1.setComment("Excellent court quality and service!");
            review1.setCreatedAt(LocalDateTime.now());
            reviewRepository.save(review1);

            Review review2 = new Review();
            review2.setUser(bookings.get(1).getUser());
            review2.setBooking(bookings.get(1));
            review2.setRating(4);
            review2.setComment("Great facilities!");
            review2.setCreatedAt(LocalDateTime.now());
            reviewRepository.save(review2);
        }
    }

    private void seedNotifications() {
        log.info("Seeding notifications...");
        List<User> users = userRepository.findByRole_RoleName("USER");

        if (users.size() >= 2) {
            Notification n1 = new Notification();
            n1.setUser(users.get(0));
            n1.setTitle("Booking Confirmed");
            n1.setMessage("Your booking has been confirmed.");
            n1.setType(NotificationType.BOOKING);
            n1.setIsRead(false);
            n1.setSentAt(LocalDateTime.now());
            notificationRepository.save(n1);

            Notification n2 = new Notification();
            n2.setUser(users.get(1));
            n2.setTitle("Payment Received");
            n2.setMessage("We have received your payment.");
            n2.setType(NotificationType.PAYMENT);
            n2.setIsRead(true);
            n2.setSentAt(LocalDateTime.now());
            notificationRepository.save(n2);
        }
    }
}
