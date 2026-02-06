# 📚 TÀI LIỆU API - HỆ THỐNG ĐẶT SÂN CẦU LÔNG

## 📊 BẢNG TÓM TẮT PHÂN QUYỀN

| Role | Có thể dùng API |
|------|----------------|
| 🌐 **PUBLIC** | Xem sân, xem lịch public, xem giá, kiểm tra khả dụng |
| 👤 **KHÁCH** | + Đặt sân, hủy booking, xem booking của mình, cập nhật profile |
| 👨‍💼 **NHÂN VIÊN** | + Check-in, check-out, gia hạn, cập nhật trạng thái booking |
| 👨‍💼 **ADMIN** | + Tạo/sửa/xóa sân, cấu hình giá, quản lý user, xem thống kê |

---

## 🎯 FLOW SỬ DỤNG THEO VAI TRÒ

### 👤 KHÁCH HÀNG (Customer Flow)

1. `GET /api/courts/all` → Xem danh sách sân
2. `GET /api/schedule/public/timeline` → Xem lịch sân trống
3. `GET /api/bookings/check-availability` → Kiểm tra giờ muốn đặt
4. `GET /api/bookings/calculate-price` → Xem giá
5. `POST /api/bookings` → Đặt sân
6. `GET /api/schedule/user/{userId}/bookings` → Xem lịch sử đặt sân
7. `POST /api/bookings/{id}/cancel` → Hủy booking (nếu cần)

### 👨‍💼 NHÂN VIÊN QUẢN LÝ (Staff Daily Flow)

1. `GET /api/schedule/admin/timeline` → Xem lịch hôm nay
2. `PATCH /api/bookings/{id}/status` → Xác nhận booking
3. `POST /api/bookings/{id}/check-in` → Khách đến → Check-in
4. `POST /api/bookings/{id}/extend` → Khách muốn thêm giờ
5. `POST /api/bookings/{id}/complete` → Khách về → Check-out

### 👨‍💼 ADMIN CẤU HÌNH HỆ THỐNG

1. `POST /api/courts/create` → Thêm sân mới
2. `POST /api/court-prices/court/{id}/init-default` → Tạo bảng giá
3. `PUT /api/court-prices/{id}` → Điều chỉnh giá
4. `GET /api/schedule/admin/statistics` → Xem báo cáo

---

## 📋 TỔNG HỢP TẤT CẢ API - CHI TIẾT

---

## 1️⃣ AuthController (`/api/auth`) 🔐

**Mục đích:** Đăng ký, đăng nhập

| API | Method | Endpoint | Dùng khi nào | Ai dùng | Yêu cầu Auth |
|-----|--------|----------|--------------|---------|--------------|
| Đăng ký | POST | `/api/auth/register` | Tạo tài khoản mới | 🌐 PUBLIC | ❌ |
| Đăng nhập | POST | `/api/auth/login` | Lấy access token | 🌐 PUBLIC | ❌ |

**Request Body - Register:**
```json
{
  "username": "customer01",
  "password": "password123",
  "email": "customer@example.com",
  "fullName": "Nguyễn Văn A",
  "phoneNumber": "0901234567"
}
```

**Request Body - Login:**
```json
{
  "username": "customer01",
  "password": "password123"
}
```

**Response - Login:**
```json
{
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "tokenType": "Bearer",
  "expiresIn": 3600
}
```

---

## 2️⃣ BadmintonCourtController (`/api/courts`) 🏸

**Mục đích:** Quản lý thông tin sân cầu lông

| API | Method | Endpoint | Dùng khi nào | Ai dùng | Yêu cầu Auth |
|-----|--------|----------|--------------|---------|--------------|
| Tạo sân mới | POST | `/api/courts/create` | Thêm sân mới vào hệ thống | 👨‍💼 ADMIN | ✅ |
| Lấy thông tin sân | GET | `/api/courts/findById/{courtId}` | Xem chi tiết 1 sân | 🌐 PUBLIC | ❌ |
| Lấy danh sách sân | GET | `/api/courts/all?page=0&size=20` | Hiển thị danh sách sân trên UI | 🌐 PUBLIC | ❌ |
| Xóa sân | DELETE | `/api/courts/deleteById/{courtId}` | Xóa sân không dùng nữa | 👨‍💼 ADMIN | ✅ |
| Cập nhật sân | PUT | `/api/courts/updateById/{courtId}` | Sửa thông tin sân (tên, mô tả, ảnh...) | 👨‍💼 ADMIN | ✅ |

**Request Body - Create Court:**
```json
{
  "courtName": "Sân 1",
  "courtType": "STANDARD",
  "description": "Sân tiêu chuẩn, ánh sáng tốt",
  "imageUrl": "https://example.com/court1.jpg",
  "status": "AVAILABLE"
}
```

**Response - Court:**
```json
{
  "courtId": 1,
  "courtName": "Sân 1",
  "courtType": "STANDARD",
  "description": "Sân tiêu chuẩn, ánh sáng tốt",
  "imageUrl": "https://example.com/court1.jpg",
  "status": "AVAILABLE",
  "createdAt": "2026-02-04T10:00:00"
}
```

---

## 3️⃣ BookingController (`/api/bookings`) ⭐ QUAN TRỌNG NHẤT

**Mục đích:** Đặt sân, quản lý booking (dùng startTime/endTime, KHÔNG dùng slot)

| API | Method | Endpoint | Dùng khi nào | Ai dùng | Yêu cầu Auth |
|-----|--------|----------|--------------|---------|--------------|
| Kiểm tra sân trống | GET | `/api/bookings/check-availability` | Khách chọn ngày giờ → kiểm tra có ai đặt chưa | 👤 KHÁCH | ✅ |
| Tính giá | GET | `/api/bookings/calculate-price` | Khách muốn biết giá trước khi đặt | 👤 KHÁCH | ✅ |
| Đặt sân | POST | `/api/bookings?userId=1` | Khách bấm "Đặt sân" | 👤 KHÁCH | ✅ |
| Lấy thông tin booking | GET | `/api/bookings/{bookingId}` | Xem chi tiết 1 booking | 👥 Tất cả | ✅ |
| Gia hạn | POST | `/api/bookings/{bookingId}/extend` | Khách đang chơi muốn thêm giờ | 👨‍💼 NHÂN VIÊN | ✅ |
| Tính phí overtime | GET | `/api/bookings/{bookingId}/overtime` | Khách về muộn, xem phí trước | 👨‍💼 NHÂN VIÊN | ✅ |
| Check-out | POST | `/api/bookings/{bookingId}/complete` | Khách chơi xong, rời sân | 👨‍💼 NHÂN VIÊN | ✅ |
| Check-in | POST | `/api/bookings/{bookingId}/check-in` | Khách đến sân | 👨‍💼 NHÂN VIÊN | ✅ |
| Cập nhật trạng thái | PATCH | `/api/bookings/{bookingId}/status` | Xác nhận/đổi trạng thái booking | 👨‍💼 NHÂN VIÊN | ✅ |
| Hủy booking | POST | `/api/bookings/{bookingId}/cancel` | Khách hoặc NV hủy đặt sân | 👥 KHÁCH/NV | ✅ |
| Xem booking của khách | GET | `/api/bookings/user/{userId}` | Khách xem lịch sử đặt sân | 👤 KHÁCH | ✅ |
| Xem booking của sân | GET | `/api/bookings/court/{courtId}` | NV xem tất cả booking của sân trong ngày | 👨‍💼 NHÂN VIÊN | ✅ |
| Xem slot trống | GET | `/api/bookings/court/{courtId}/available-slots` | Hiển thị lịch sân cho khách chọn | 👤 KHÁCH | ✅ |

### 📝 Chi tiết API quan trọng:

#### 1. Check Availability
```
GET /api/bookings/check-availability?courtId=1&playDate=2026-02-05&startTime=07:00&endTime=10:00
```

**Response:**
```json
{
  "available": true,
  "courtId": 1,
  "playDate": "2026-02-05",
  "startTime": "07:00",
  "endTime": "10:00",
  "conflictingBookings": []
}
```

#### 2. Calculate Price
```
GET /api/bookings/calculate-price?courtId=1&playDate=2026-02-05&startTime=07:00&endTime=10:00
```

**Response:**
```json
{
  "totalPrice": 220000,
  "breakdown": [
    {"timeRange": "07:00-08:00", "pricePerHour": 60000, "hours": 1, "subtotal": 60000},
    {"timeRange": "08:00-10:00", "pricePerHour": 80000, "hours": 2, "subtotal": 160000}
  ],
  "courtId": 1,
  "playDate": "2026-02-05",
  "startTime": "07:00",
  "endTime": "10:00"
}
```

#### 3. Create Booking
```
POST /api/bookings?userId=1
```

**Request Body:**
```json
{
  "courtId": 1,
  "playDate": "2026-02-05",
  "startTime": "07:00",
  "endTime": "10:00",
  "notes": "Đặt sân cho 4 người"
}
```

**Response:**
```json
{
  "bookingId": 123,
  "courtId": 1,
  "courtName": "Sân 1",
  "userId": 1,
  "customerName": "Nguyễn Văn A",
  "playDate": "2026-02-05",
  "startTime": "07:00",
  "endTime": "10:00",
  "totalPrice": 220000,
  "status": "PENDING",
  "paymentStatus": "UNPAID",
  "createdAt": "2026-02-04T10:30:00"
}
```

#### 4. Extend Booking
```
POST /api/bookings/123/extend
```

**Request Body (Option 1 - Thêm phút):**
```json
{
  "extensionMinutes": 60
}
```

**Request Body (Option 2 - Giờ kết thúc mới):**
```json
{
  "newEndTime": "11:00"
}
```

#### 5. Complete Booking (Check-out)
```
POST /api/bookings/123/complete?actualEndTime=10:30
```

**Response:**
```json
{
  "bookingId": 123,
  "status": "COMPLETED",
  "actualEndTime": "10:30",
  "overtimeFee": 60000,
  "totalPrice": 280000,
  "paymentStatus": "UNPAID"
}
```

---

## 4️⃣ CourtPriceController (`/api/court-prices`) 💰

**Mục đích:** Quản lý bảng giá sân theo khung giờ và loại ngày

| API | Method | Endpoint | Dùng khi nào | Ai dùng | Yêu cầu Auth |
|-----|--------|----------|--------------|---------|--------------|
| Tạo giá mới | POST | `/api/court-prices` | Thêm khung giá mới cho sân | 👨‍💼 ADMIN | ✅ |
| Cập nhật giá | PUT | `/api/court-prices/{id}` | Sửa giá khung giờ | 👨‍💼 ADMIN | ✅ |
| Xóa giá | DELETE | `/api/court-prices/{id}` | Xóa khung giá | 👨‍💼 ADMIN | ✅ |
| Lấy giá theo ID | GET | `/api/court-prices/{id}` | Xem chi tiết 1 khung giá | 👨‍💼 ADMIN | ✅ |
| Lấy tất cả giá của sân | GET | `/api/court-prices/court/{courtId}` | Xem bảng giá của 1 sân | 🌐 PUBLIC | ❌ |
| Lấy giá theo loại ngày | GET | `/api/court-prices/court/{courtId}/day-type/WEEKDAY` | Xem giá ngày thường/cuối tuần | 🌐 PUBLIC | ❌ |
| Tính giá tại thời điểm | GET | `/api/court-prices/calculate` | Xem giá 1 khung giờ cụ thể | 🌐 PUBLIC | ❌ |
| Tạo giá mặc định | POST | `/api/court-prices/court/{courtId}/init-default` | Tự động tạo bảng giá mặc định cho sân mới | 👨‍💼 ADMIN | ✅ |
| Lấy tất cả giá | GET | `/api/court-prices` | Xem toàn bộ bảng giá hệ thống | 🌐 PUBLIC | ❌ |

### 📝 Chi tiết API:

#### 1. Create Price
```
POST /api/court-prices
```

**Request Body:**
```json
{
  "courtId": 1,
  "dayType": "WEEKDAY",
  "startTime": "06:00",
  "endTime": "08:00",
  "pricePerHour": 60000
}
```

#### 2. Calculate Price at Specific Time
```
GET /api/court-prices/calculate?courtId=1&date=2026-02-05&time=17:00
```

**Response:**
```json
{
  "courtId": 1,
  "date": "2026-02-05",
  "time": "17:00",
  "dayType": "WEEKDAY",
  "pricePerHour": 100000
}
```

#### 3. Init Default Prices
```
POST /api/court-prices/court/1/init-default
```

Tự động tạo bảng giá mặc định:
- **WEEKDAY (Thứ 2-6):**
  - 06:00-08:00: 60,000đ/giờ
  - 08:00-16:00: 80,000đ/giờ
  - 16:00-22:00: 100,000đ/giờ

- **WEEKEND (Thứ 7, CN):**
  - 06:00-08:00: 80,000đ/giờ
  - 08:00-16:00: 100,000đ/giờ
  - 16:00-22:00: 120,000đ/giờ

---

## 5️⃣ ScheduleTimelineController (`/api/schedule`) 📅

**Mục đích:** Xem lịch sân dạng timeline (cho UI lịch)

### 🔒 API cho ADMIN/NHÂN VIÊN

| API | Method | Endpoint | Dùng khi nào | Ai dùng | Yêu cầu Auth |
|-----|--------|----------|--------------|---------|--------------|
| Xem lịch tất cả sân | GET | `/api/schedule/admin/timeline` | Dashboard NV xem tổng quan lịch sân | 👨‍💼 NHÂN VIÊN | ✅ |
| Xem lịch nhiều ngày | GET | `/api/schedule/admin/timeline/range` | Xem lịch tuần/tháng | 👨‍💼 NHÂN VIÊN | ✅ |
| Xem lịch 1 sân | GET | `/api/schedule/admin/court/{courtId}/timeline` | Xem chi tiết lịch 1 sân | 👨‍💼 NHÂN VIÊN | ✅ |
| Xem thống kê | GET | `/api/schedule/admin/statistics` | Xem tỷ lệ lấp đầy, doanh thu... | 👨‍💼 ADMIN | ✅ |
| Xem chi tiết booking | GET | `/api/schedule/admin/booking/{bookingId}` | Click vào booking trên lịch → xem chi tiết | 👨‍💼 NHÂN VIÊN | ✅ |
| Cập nhật booking | PUT | `/api/schedule/admin/booking/{bookingId}` | Sửa thông tin booking | 👨‍💼 NHÂN VIÊN | ✅ |
| Hủy booking | POST | `/api/schedule/admin/booking/{bookingId}/cancel` | Hủy booking từ dashboard | 👨‍💼 NHÂN VIÊN | ✅ |
| Cập nhật trạng thái | PATCH | `/api/schedule/admin/booking/{bookingId}/status` | Đổi trạng thái nhanh | 👨‍💼 NHÂN VIÊN | ✅ |
| Cập nhật thanh toán | PATCH | `/api/schedule/admin/booking/{bookingId}/payment-status` | Cập nhật đã thanh toán | 👨‍💼 NHÂN VIÊN | ✅ |

### 👤 API cho USER

| API | Method | Endpoint | Dùng khi nào | Ai dùng | Yêu cầu Auth |
|-----|--------|----------|--------------|---------|--------------|
| Xem booking của tôi | GET | `/api/schedule/user/{userId}/bookings` | Khách xem lịch đặt sân của mình | 👤 KHÁCH | ✅ |
| Xem booking sắp tới | GET | `/api/schedule/user/{userId}/upcoming` | Khách xem các booking chưa đến | 👤 KHÁCH | ✅ |

### 🌐 API PUBLIC (Không cần đăng nhập)

| API | Method | Endpoint | Dùng khi nào | Ai dùng | Yêu cầu Auth |
|-----|--------|----------|--------------|---------|--------------|
| Xem lịch sân (public) | GET | `/api/schedule/public/timeline` | Khách vãng lai xem sân trống | 🌐 PUBLIC | ❌ |
| Xem lịch 1 sân (public) | GET | `/api/schedule/public/court/{courtId}/timeline` | Khách xem chi tiết 1 sân | 🌐 PUBLIC | ❌ |

### 📝 Chi tiết API:

#### 1. Get Schedule Timeline (Admin)
```
GET /api/schedule/admin/timeline?date=2026-02-05
```

**Response:**
```json
{
  "date": "2026-02-05",
  "dayOfWeek": "WEDNESDAY",
  "courts": [
    {
      "courtId": 1,
      "courtName": "Sân 1",
      "slots": [
        {
          "bookingId": 123,
          "startTime": "07:00",
          "endTime": "10:00",
          "status": "CONFIRMED",
          "customerName": "Nguyễn Văn A",
          "customerPhone": "0901234567",
          "totalPrice": 220000,
          "paymentStatus": "UNPAID"
        }
      ]
    }
  ]
}
```

#### 2. Get Schedule Statistics
```
GET /api/schedule/admin/statistics?date=2026-02-05
```

**Response:**
```json
{
  "date": "2026-02-05",
  "totalCourts": 5,
  "totalBookings": 12,
  "confirmedBookings": 10,
  "completedBookings": 2,
  "cancelledBookings": 0,
  "totalRevenue": 2640000,
  "occupancyRate": 75.5,
  "averageBookingDuration": 2.5
}
```

#### 3. Get User Booking Timeline
```
GET /api/schedule/user/1/bookings?startDate=2026-02-01&endDate=2026-02-28
```

**Response:**
```json
[
  {
    "bookingId": 123,
    "courtId": 1,
    "courtName": "Sân 1",
    "playDate": "2026-02-05",
    "startTime": "07:00",
    "endTime": "10:00",
    "status": "CONFIRMED",
    "totalPrice": 220000,
    "paymentStatus": "UNPAID"
  }
]
```

---

## 6️⃣ TimeSlotController (`/api/time-slots`) ⏰

**Mục đích:** Quản lý các khung giờ mẫu (CHỈ CHO UI, không dùng cho booking logic)

| API | Method | Endpoint | Dùng khi nào | Ai dùng | Yêu cầu Auth |
|-----|--------|----------|--------------|---------|--------------|
| Tạo khung giờ | POST | `/api/time-slots` | Thêm khung giờ mới | 👨‍💼 ADMIN | ✅ |
| Cập nhật khung giờ | PUT | `/api/time-slots/{id}` | Sửa khung giờ | 👨‍💼 ADMIN | ✅ |
| Xóa khung giờ | DELETE | `/api/time-slots/{id}` | Xóa khung giờ | 👨‍💼 ADMIN | ✅ |
| Lấy khung giờ theo ID | GET | `/api/time-slots/{id}` | Xem chi tiết | 👨‍💼 ADMIN | ✅ |
| Lấy tất cả khung giờ | GET | `/api/time-slots` | Xem danh sách khung giờ | 🌐 PUBLIC | ❌ |
| Lấy khung giờ active | GET | `/api/time-slots/active` | Lấy các khung giờ đang hoạt động | 🌐 PUBLIC | ❌ |
| Tạo khung giờ mặc định | POST | `/api/time-slots/init-default` | Tự động tạo 17 khung giờ (6h-22h) | 👨‍💼 ADMIN | ✅ |

### 📝 Chi tiết API:

#### 1. Create Time Slot
```
POST /api/time-slots
```

**Request Body:**
```json
{
  "startTime": "06:00",
  "endTime": "07:00",
  "slotName": "Sáng sớm",
  "isActive": true
}
```

#### 2. Init Default Time Slots
```
POST /api/time-slots/init-default
```

Tự động tạo 17 khung giờ từ 06:00 đến 22:00 (mỗi khung 1 giờ)

**Response:**
```json
[
  {"slotId": 1, "startTime": "06:00", "endTime": "07:00", "slotName": "06:00-07:00", "isActive": true},
  {"slotId": 2, "startTime": "07:00", "endTime": "08:00", "slotName": "07:00-08:00", "isActive": true},
  ...
]
```

---

## 7️⃣ UserController (`/api/users`) 👥

**Mục đích:** Quản lý người dùng

| API | Method | Endpoint | Dùng khi nào | Ai dùng | Yêu cầu Auth |
|-----|--------|----------|--------------|---------|--------------|
| Tạo user mới | POST | `/api/users` | Admin tạo tài khoản cho nhân viên | 👨‍💼 ADMIN | ✅ |
| Lấy user theo ID | GET | `/api/users/{id}` | Xem thông tin user | 👨‍💼 ADMIN hoặc chính user đó | ✅ |
| Lấy user theo username | GET | `/api/users/username/{username}` | Tìm user bằng username | 👨‍💼 ADMIN hoặc chính user đó | ✅ |
| Lấy tất cả users | GET | `/api/users` | Xem danh sách user (có filter) | 👨‍💼 ADMIN | ✅ |
| Lấy users theo role | GET | `/api/users/role/{roleName}` | Xem danh sách theo vai trò | 👨‍💼 ADMIN | ✅ |
| Cập nhật user (Admin) | PUT | `/api/users/{id}` | Admin sửa thông tin user | 👨‍💼 ADMIN | ✅ |
| Cập nhật profile | PUT | `/api/users/profile` | User tự cập nhật thông tin | 👤 User đã đăng nhập | ✅ |
| Lấy thông tin của tôi | GET | `/api/users/me` | Xem profile của mình | 👤 User đã đăng nhập | ✅ |
| Logout | POST | `/api/users/logout` | Đăng xuất | 👤 User đã đăng nhập | ✅ |
| Xóa user (soft delete) | DELETE | `/api/users/{id}` | Vô hiệu hóa tài khoản | 👨‍💼 ADMIN | ✅ |
| Kích hoạt lại user | PUT | `/api/users/{id}/reactivate` | Kích hoạt lại tài khoản đã xóa | 👨‍💼 ADMIN | ✅ |
| Kiểm tra username | GET | `/api/users/check-username` | Kiểm tra username đã tồn tại chưa | 🌐 PUBLIC | ❌ |

### 📝 Chi tiết API:

#### 1. Create User (Admin)
```
POST /api/users
```

**Request Body:**
```json
{
  "username": "staff01",
  "email": "staff@example.com",
  "fullName": "Trần Thị B",
  "phoneNumber": "0912345678",
  "roleName": "STAFF",
  "gender": "FEMALE",
  "dateOfBirth": "1995-05-15"
}
```

**Note:** Mật khẩu mặc định là `password@123`

#### 2. Get All Users with Filter
```
GET /api/users?keyword=nguyen&roleName=CUSTOMER&page=0&size=10&sortBy=createdAt&sortDir=desc
```

**Query Parameters:**
- `keyword`: Tìm kiếm theo username, fullName, email, phoneNumber
- `username`: Lọc theo username
- `fullName`: Lọc theo tên
- `email`: Lọc theo email
- `phoneNumber`: Lọc theo số điện thoại
- `gender`: Lọc theo giới tính (MALE, FEMALE, OTHER)
- `roleName`: Lọc theo vai trò (CUSTOMER, STAFF, ADMIN)
- `dateOfBirthFrom`, `dateOfBirthTo`: Lọc theo ngày sinh
- `createdAtFrom`, `createdAtTo`: Lọc theo ngày tạo
- `page`, `size`: Phân trang
- `sortBy`, `sortDir`: Sắp xếp

#### 3. Update Profile (User)
```
PUT /api/users/profile
```

**Request Body:**
```json
{
  "fullName": "Nguyễn Văn A",
  "email": "newemail@example.com",
  "phoneNumber": "0901234567",
  "gender": "MALE",
  "dateOfBirth": "1990-01-01",
  "address": "123 Đường ABC, Quận 1, TP.HCM"
}
```

**Note:** Không thể thay đổi username, password, role qua API này

#### 4. Get Current User
```
GET /api/users/me
```

**Response:**
```json
{
  "id": 1,
  "username": "customer01",
  "email": "customer@example.com",
  "fullName": "Nguyễn Văn A",
  "phoneNumber": "0901234567",
  "roleName": "CUSTOMER",
  "gender": "MALE",
  "dateOfBirth": "1990-01-01",
  "isActive": true,
  "createdAt": "2026-01-01T10:00:00"
}
```

---

## 8️⃣ PasswordController (`/api/password`) 🔑

**Mục đích:** Quản lý mật khẩu (quên mật khẩu, đổi mật khẩu)

| API | Method | Endpoint | Dùng khi nào | Ai dùng | Yêu cầu Auth |
|-----|--------|----------|--------------|---------|--------------|
| Quên mật khẩu | POST | `/api/password/forgot` | Gửi link reset password qua email | 🌐 PUBLIC | ❌ |
| Reset mật khẩu | POST | `/api/password/reset` | Đặt lại mật khẩu bằng token | 🌐 PUBLIC | ❌ |
| Đổi mật khẩu | POST | `/api/password/change` | User đổi mật khẩu khi đã đăng nhập | 👤 User đã đăng nhập | ✅ |
| Kiểm tra token | GET | `/api/password/validate-token` | Kiểm tra token reset còn hợp lệ không | 🌐 PUBLIC | ❌ |

### 📝 Chi tiết API:

#### 1. Forgot Password
```
POST /api/password/forgot
```

**Request Body:**
```json
{
  "email": "customer@example.com"
}
```

**Response:**
```json
{
  "message": "Reset password link has been sent to your email"
}
```

#### 2. Reset Password
```
POST /api/password/reset
```

**Request Body:**
```json
{
  "token": "abc123xyz789",
  "newPassword": "newpassword123"
}
```

**Response:**
```json
{
  "message": "Password has been reset successfully"
}
```

#### 3. Change Password
```
POST /api/password/change
```

**Request Body:**
```json
{
  "oldPassword": "oldpassword123",
  "newPassword": "newpassword456"
}
```

**Response:**
```json
{
  "message": "Password changed successfully"
}
```

#### 4. Validate Token
```
GET /api/password/validate-token?token=abc123xyz789
```

**Response:**
```json
{
  "valid": true
}
```

---

## 📊 BẢNG TỔNG HỢP PHÂN QUYỀN CHI TIẾT

### 🌐 PUBLIC APIs (Không cần đăng nhập)

| Controller | Endpoint | Method | Mô tả |
|------------|----------|--------|-------|
| Auth | `/api/auth/register` | POST | Đăng ký tài khoản |
| Auth | `/api/auth/login` | POST | Đăng nhập |
| Court | `/api/courts/all` | GET | Xem danh sách sân |
| Court | `/api/courts/findById/{id}` | GET | Xem chi tiết sân |
| Court Price | `/api/court-prices/court/{courtId}` | GET | Xem bảng giá sân |
| Court Price | `/api/court-prices/calculate` | GET | Tính giá tại thời điểm |
| Time Slot | `/api/time-slots` | GET | Xem khung giờ |
| Time Slot | `/api/time-slots/active` | GET | Xem khung giờ active |
| Schedule | `/api/schedule/public/timeline` | GET | Xem lịch sân public |
| Schedule | `/api/schedule/public/court/{courtId}/timeline` | GET | Xem lịch 1 sân public |
| User | `/api/users/check-username` | GET | Kiểm tra username tồn tại |
| Password | `/api/password/forgot` | POST | Quên mật khẩu |
| Password | `/api/password/reset` | POST | Reset mật khẩu |
| Password | `/api/password/validate-token` | GET | Kiểm tra token |

### 👤 CUSTOMER APIs (Yêu cầu đăng nhập - Role: CUSTOMER)

| Controller | Endpoint | Method | Mô tả |
|------------|----------|--------|-------|
| Booking | `/api/bookings/check-availability` | GET | Kiểm tra sân trống |
| Booking | `/api/bookings/calculate-price` | GET | Tính giá đặt sân |
| Booking | `/api/bookings` | POST | Đặt sân |
| Booking | `/api/bookings/{id}` | GET | Xem booking |
| Booking | `/api/bookings/{id}/cancel` | POST | Hủy booking |
| Booking | `/api/bookings/user/{userId}` | GET | Xem booking của mình |
| Booking | `/api/bookings/court/{courtId}/available-slots` | GET | Xem slot trống |
| Schedule | `/api/schedule/user/{userId}/bookings` | GET | Xem lịch đặt sân |
| Schedule | `/api/schedule/user/{userId}/upcoming` | GET | Xem booking sắp tới |
| User | `/api/users/me` | GET | Xem profile |
| User | `/api/users/profile` | PUT | Cập nhật profile |
| User | `/api/users/logout` | POST | Đăng xuất |
| Password | `/api/password/change` | POST | Đổi mật khẩu |

### 👨‍💼 STAFF APIs (Yêu cầu đăng nhập - Role: STAFF)

**Bao gồm tất cả quyền của CUSTOMER, thêm:**

| Controller | Endpoint | Method | Mô tả |
|------------|----------|--------|-------|
| Booking | `/api/bookings/{id}/check-in` | POST | Check-in khách |
| Booking | `/api/bookings/{id}/extend` | POST | Gia hạn booking |
| Booking | `/api/bookings/{id}/overtime` | GET | Tính phí overtime |
| Booking | `/api/bookings/{id}/complete` | POST | Check-out khách |
| Booking | `/api/bookings/{id}/status` | PATCH | Cập nhật trạng thái |
| Booking | `/api/bookings/court/{courtId}` | GET | Xem booking của sân |
| Schedule | `/api/schedule/admin/timeline` | GET | Xem lịch tất cả sân |
| Schedule | `/api/schedule/admin/timeline/range` | GET | Xem lịch nhiều ngày |
| Schedule | `/api/schedule/admin/court/{courtId}/timeline` | GET | Xem lịch 1 sân |
| Schedule | `/api/schedule/admin/booking/{id}` | GET | Xem chi tiết booking |
| Schedule | `/api/schedule/admin/booking/{id}` | PUT | Cập nhật booking |
| Schedule | `/api/schedule/admin/booking/{id}/cancel` | POST | Hủy booking |
| Schedule | `/api/schedule/admin/booking/{id}/status` | PATCH | Cập nhật trạng thái |
| Schedule | `/api/schedule/admin/booking/{id}/payment-status` | PATCH | Cập nhật thanh toán |

### 👨‍💼 ADMIN APIs (Yêu cầu đăng nhập - Role: ADMIN)

**Bao gồm tất cả quyền của STAFF, thêm:**

| Controller | Endpoint | Method | Mô tả |
|------------|----------|--------|-------|
| Court | `/api/courts/create` | POST | Tạo sân mới |
| Court | `/api/courts/updateById/{id}` | PUT | Cập nhật sân |
| Court | `/api/courts/deleteById/{id}` | DELETE | Xóa sân |
| Court Price | `/api/court-prices` | POST | Tạo giá mới |
| Court Price | `/api/court-prices/{id}` | PUT | Cập nhật giá |
| Court Price | `/api/court-prices/{id}` | DELETE | Xóa giá |
| Court Price | `/api/court-prices/court/{courtId}/init-default` | POST | Tạo giá mặc định |
| Time Slot | `/api/time-slots` | POST | Tạo khung giờ |
| Time Slot | `/api/time-slots/{id}` | PUT | Cập nhật khung giờ |
| Time Slot | `/api/time-slots/{id}` | DELETE | Xóa khung giờ |
| Time Slot | `/api/time-slots/init-default` | POST | Tạo khung giờ mặc định |
| Schedule | `/api/schedule/admin/statistics` | GET | Xem thống kê |
| User | `/api/users` | POST | Tạo user mới |
| User | `/api/users` | GET | Xem tất cả users |
| User | `/api/users/{id}` | PUT | Cập nhật user |
| User | `/api/users/{id}` | DELETE | Xóa user (soft) |
| User | `/api/users/{id}/reactivate` | PUT | Kích hoạt lại user |
| User | `/api/users/role/{roleName}` | GET | Xem users theo role |

---

## 🔐 XÁC THỰC VÀ PHÂN QUYỀN

### Authentication Flow

1. **Đăng ký:** `POST /api/auth/register`
2. **Đăng nhập:** `POST /api/auth/login` → Nhận `accessToken`
3. **Gọi API:** Thêm header `Authorization: Bearer {accessToken}`
4. **Đăng xuất:** `POST /api/users/logout`

### Authorization Rules

- **PUBLIC:** Không cần token
- **CUSTOMER:** Cần token + role CUSTOMER
- **STAFF:** Cần token + role STAFF (có thể làm việc của CUSTOMER)
- **ADMIN:** Cần token + role ADMIN (có thể làm tất cả)

### Security Configuration

```java
// Các endpoint PUBLIC (không cần đăng nhập)
.requestMatchers("/api/auth/**").permitAll()
.requestMatchers("/api/courts/all", "/api/courts/findById/**").permitAll()
.requestMatchers("/api/time-slots", "/api/time-slots/active", "/api/time-slots/{id}").permitAll()
.requestMatchers("/api/pricing/**").permitAll()
.requestMatchers("/api/users/check-username").permitAll()
.requestMatchers("/api/password/forgot", "/api/password/reset", "/api/password/validate-token").permitAll()
.requestMatchers("/api/schedule/public/**").permitAll()

// Các endpoint yêu cầu xác thực
.requestMatchers("/api/schedule/admin/**").authenticated()
.requestMatchers("/api/users/**").authenticated()
.anyRequest().authenticated()
```

### Method-Level Security

Một số API có phân quyền chi tiết hơn bằng `@PreAuthorize`:

```java
@PreAuthorize("hasRole('ADMIN')")  // Chỉ ADMIN
@PreAuthorize("hasRole('ADMIN') or @userSecurity.isCurrentUser(#id)")  // ADMIN hoặc chính user đó
@PreAuthorize("isAuthenticated()")  // Bất kỳ user đã đăng nhập
```

---

## 📝 NOTES VÀ BEST PRACTICES

### 1. Booking Logic (QUAN TRỌNG)

- **Không dùng slot cố định**, dùng `startTime` và `endTime` linh hoạt
- Cho phép đặt thời lượng lẻ: 1h, 1.5h, 2.5h, 3h...
- Tự động kiểm tra overlap với booking khác
- Tự động tính giá theo nhiều khung giá khác nhau

**Ví dụ:**
```
Đặt từ 07:00 - 10:00 (3 giờ):
- 07:00-08:00: 60,000đ (giá sáng sớm)
- 08:00-10:00: 80,000đ x 2 = 160,000đ (giá bình thường)
→ Tổng: 220,000đ
```

### 2. Booking Status Flow

```
PENDING → CONFIRMED → PLAYING → COMPLETED
   ↓          ↓
CANCELLED  CANCELLED
```

- **PENDING:** Vừa đặt, chờ xác nhận
- **CONFIRMED:** Đã xác nhận, chờ khách đến
- **PLAYING:** Khách đã check-in, đang chơi
- **COMPLETED:** Đã check-out, hoàn thành
- **CANCELLED:** Đã hủy
- **NO_SHOW:** Khách không đến

### 3. Payment Status

- **UNPAID:** Chưa thanh toán
- **PAID:** Đã thanh toán đủ
- **PARTIALLY_PAID:** Thanh toán một phần
- **REFUNDED:** Đã hoàn tiền

### 4. Court Status

- **AVAILABLE:** Sẵn sàng cho thuê
- **MAINTENANCE:** Đang bảo trì
- **UNAVAILABLE:** Không khả dụng

### 5. Day Type

- **WEEKDAY:** Thứ 2-6 (giá thấp hơn)
- **WEEKEND:** Thứ 7, CN (giá cao hơn)

### 6. Overtime Calculation

```
Phí overtime = (Giá/giờ của khung giờ cuối) × 1.5 × (Số phút overtime / 60)
```

**Ví dụ:**
```
Booking: 09:00-10:00 (giá 80,000đ/giờ)
Thực tế: 09:00-10:25 (overtime 25 phút)
Phí overtime = 80,000 × 1.5 × (25/60) = 50,000đ
```

### 7. Extension Rules

- Chỉ có thể gia hạn khi đang ở trạng thái **PLAYING**
- Phải kiểm tra khung giờ tiếp theo có trống không
- Tính phí gia hạn theo giá khung giờ mới

### 8. Cancellation Rules

- Chỉ có thể hủy booking ở trạng thái **PENDING** hoặc **CONFIRMED**
- Không thể hủy booking đang **PLAYING** hoặc **COMPLETED**
- Không hoàn tiền khi hủy (có thể thêm logic hoàn tiền sau)

---

## 🚀 QUICK START EXAMPLES

### Example 1: Khách đặt sân

```bash
# 1. Đăng ký
POST /api/auth/register
{
  "username": "customer01",
  "password": "password123",
  "email": "customer@example.com",
  "fullName": "Nguyễn Văn A",
  "phoneNumber": "0901234567"
}

# 2. Đăng nhập
POST /api/auth/login
{
  "username": "customer01",
  "password": "password123"
}
→ Nhận accessToken

# 3. Xem danh sách sân
GET /api/courts/all

# 4. Xem lịch sân trống
GET /api/schedule/public/timeline?date=2026-02-05

# 5. Kiểm tra khả dụng
GET /api/bookings/check-availability?courtId=1&playDate=2026-02-05&startTime=07:00&endTime=10:00

# 6. Tính giá
GET /api/bookings/calculate-price?courtId=1&playDate=2026-02-05&startTime=07:00&endTime=10:00

# 7. Đặt sân
POST /api/bookings?userId=1
Authorization: Bearer {accessToken}
{
  "courtId": 1,
  "playDate": "2026-02-05",
  "startTime": "07:00",
  "endTime": "10:00"
}
```

### Example 2: Nhân viên quản lý booking

```bash
# 1. Xem lịch hôm nay
GET /api/schedule/admin/timeline?date=2026-02-05
Authorization: Bearer {staffToken}

# 2. Xác nhận booking
PATCH /api/bookings/123/status?status=CONFIRMED
Authorization: Bearer {staffToken}

# 3. Check-in khách
POST /api/bookings/123/check-in
Authorization: Bearer {staffToken}

# 4. Gia hạn (nếu khách muốn)
POST /api/bookings/123/extend
Authorization: Bearer {staffToken}
{
  "extensionMinutes": 60
}

# 5. Check-out
POST /api/bookings/123/complete?actualEndTime=10:00
Authorization: Bearer {staffToken}

# 6. Cập nhật thanh toán
PATCH /api/schedule/admin/booking/123/payment-status?paymentStatus=PAID
Authorization: Bearer {staffToken}
```

### Example 3: Admin cấu hình hệ thống

```bash
# 1. Tạo sân mới
POST /api/courts/create
Authorization: Bearer {adminToken}
{
  "courtName": "Sân 1",
  "courtType": "STANDARD",
  "description": "Sân tiêu chuẩn",
  "status": "AVAILABLE"
}

# 2. Tạo bảng giá mặc định
POST /api/court-prices/court/1/init-default
Authorization: Bearer {adminToken}

# 3. Điều chỉnh giá (nếu cần)
PUT /api/court-prices/5
Authori