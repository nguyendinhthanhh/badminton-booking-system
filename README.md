# Badminton Booking System

Hệ thống **đặt sân cầu lông** và **quản trị vận hành** gồm **Frontend (React)** và **Backend API (Spring Boot)**.

## Highlights

- **Đặt sân theo khoảng thời gian linh hoạt**: hỗ trợ thời lượng lẻ (1h, 1.5h, 2.5h…), kiểm tra trùng lịch (overlap) và tính giá tự động theo khung.
- **Quản trị lịch theo timeline**: xem timeline theo ngày / theo khoảng ngày, thống kê vận hành.
- **Xác thực & phân quyền bằng JWT**: đăng ký/đăng nhập, refresh token, verify email.
- **Thanh toán cọc & thanh toán phần còn lại**: hỗ trợ VNPay (tạo URL, confirm).
- **AI Chatbot**: endpoint public dùng Gemini để tư vấn/tìm sân trống theo ngôn ngữ tự nhiên.
- **Swagger/OpenAPI**: tài liệu API sẵn có qua Swagger UI.

## Tech stack

- **Frontend** (`frontend/`): React 19 + Vite, TailwindCSS, Zustand, React Router, Axios
- **Backend** (`backend/`): Spring Boot 3.2 (Java 21), Spring Security, JWT, Spring Data JPA, Validation, Mail, SpringDoc OpenAPI
- **Database**: PostgreSQL (đang cấu hình) và có driver SQL Server (tuỳ cấu hình)

## Architecture & Default URLs

- **Frontend**: `http://localhost:3000`
- **Backend**: `http://localhost:8080`
- **Swagger UI**: `http://localhost:8080/swagger-ui.html`
- **OpenAPI JSON**: `http://localhost:8080/api-docs`

## Prerequisites

- **Node.js**: Node 18+ (khuyến nghị LTS mới)
- **Java**: 21
- **Maven**: dùng Maven Wrapper (`backend/mvnw`, `backend/mvnw.cmd`)
- **Database**: PostgreSQL hoặc SQL Server

## Quickstart (Local)

### Backend

Tại `backend/`:

```bash
./mvnw spring-boot:run
```

Windows PowerShell:

```bash
.\mvnw.cmd spring-boot:run
```

### Frontend

Tại `frontend/`:

```bash
npm install
npm run dev
```

## Configuration (Environment & Secrets)

Backend hiện đọc cấu hình từ `backend/src/main/resources/application.properties`.

### Security note (rất quan trọng)

Trong repo hiện tại có **credentials/secrets nằm trực tiếp trong `application.properties`** (DB password, SMTP app password, VNPay secret, Gemini API key, JWT secret…).

- **Nếu repo từng public / đã chia sẻ**: nên **rotate/thu hồi** các secrets đó ngay.
- Khuyến nghị: chuyển secrets sang **Environment Variables** hoặc file local **không commit** (ví dụ `application-local.properties`) và cấu hình theo profile.

### Env variables gợi ý (mẫu)

Bạn có thể cấu hình bằng biến môi trường (tên theo Spring Boot conventions) như sau:

```bash
# Database
SPRING_DATASOURCE_URL=jdbc:postgresql://localhost:5432/badminton
SPRING_DATASOURCE_USERNAME=postgres
SPRING_DATASOURCE_PASSWORD=postgres

# JWT
APP_JWT_SECRET=change-me-to-a-strong-secret
APP_JWT_EXPIRATION=3600000
APP_JWT_REFRESH_EXPIRATION=604800

# Frontend URL used in email verification links
APP_FRONTEND_BASE_URL=http://localhost:3000
APP_EMAIL_VERIFICATION_ENCRYPTION_KEY=change-me

# Mail (SMTP)
SPRING_MAIL_HOST=smtp.gmail.com
SPRING_MAIL_PORT=587
SPRING_MAIL_USERNAME=your_email@gmail.com
SPRING_MAIL_PASSWORD=your_app_password

# VNPay
VNPAY_TMN_CODE=your_tmn_code
VNPAY_HASH_SECRET=your_hash_secret
VNPAY_RETURN_URL=http://localhost:3000/payment-result

# Gemini
GEMINI_API_KEY=your_api_key
GEMINI_API_URL=https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent
```

## Authentication & Roles

### Auth endpoints

- `POST /api/auth/register`
- `POST /api/auth/login`
- `POST /api/auth/refresh`
- `GET /api/auth/verify-email?code=...` (hoặc `token=...`)
- `POST /api/auth/resend-verification`

### Roles (theo security rules trong backend)

- **Guest (public)**: xem sân, xem khung giờ/giá, xem lịch public, dùng chatbot…
- **USER**: thao tác đặt sân của mình, thanh toán…
- **ADMIN/STAFF**: quản lý sản phẩm kho (một số API), quản trị timeline/schedule…

> Lưu ý: một số endpoint được “whitelist” ở security layer, nhưng nghiệp vụ vẫn có thể yêu cầu đăng nhập (ví dụ tạo booking đọc `Authentication`). Hãy xem Swagger UI để biết yêu cầu auth cụ thể theo từng API.

## Key API (điểm vào quan trọng)

### Courts

- `GET /api/courts/all`
- `GET /api/courts/findById/{courtId}`
- `GET /api/courts/{courtId}/detail` (thông tin sân + bảng giá + slot trống)
- `GET /api/courts/filter`
- `GET /api/courts/available?date=YYYY-MM-DD&startTime=HH:mm&endTime=HH:mm`

### Time slots

- `GET /api/time-slots`
- `GET /api/time-slots/active`
- `POST /api/time-slots/init-default` (ADMIN)

### Booking

- `GET /api/bookings/check-availability`
- `GET /api/bookings/calculate-price`
- `POST /api/bookings` (tạo booking; nghiệp vụ yêu cầu user đăng nhập)
- `GET /api/bookings/my-bookings`
- `POST /api/bookings/my-bookings/{bookingId}/cancel`
- `POST /api/bookings/{bookingId}/extend`
- `POST /api/bookings/{bookingId}/check-in`
- `POST /api/bookings/{bookingId}/complete`
- `POST /api/bookings/{bookingId}/release-early`

### Schedule timeline

- `GET /api/schedule/public/timeline`
- `GET /api/schedule/public/court/{courtId}/timeline`
- `GET /api/schedule/admin/timeline` (admin view)
- `GET /api/schedule/admin/statistics`
- `PUT /api/schedule/admin/booking/{bookingId}` (update booking)

### Payments (VNPay)

- `POST /api/payments/deposit/vnpay-url` (tạo URL thanh toán cọc)
- `POST /api/payments/remaining/{bookingId}/vnpay-url` (tạo URL thanh toán phần còn lại)
- `POST /api/payments/vnpay/confirm` (confirm sau khi redirect)

### AI Chatbot

- `POST /api/chatbot/message` body: `{ "message": "..." }`

## API Documentation (Swagger)

Sau khi chạy backend:

- Swagger UI: `http://localhost:8080/swagger-ui.html`
- OpenAPI JSON: `http://localhost:8080/api-docs`

Swagger có **Authorize (Bearer JWT)**: đăng nhập lấy access token, sau đó dán vào `Authorization: Bearer <token>`.

## Development workflow

### Frontend scripts (`frontend/package.json`)

- `npm run dev` – chạy local (port 3000)
- `npm run build` – build production
- `npm run preview` – preview build
- `npm run lint` – eslint

### Backend commands (Maven)

- `./mvnw spring-boot:run`
- `./mvnw test`
- `./mvnw clean package`

## Troubleshooting

- **Frontend gọi API bị CORS**: backend đang allow origins `http://localhost:3000`, `http://localhost:3001`, `http://localhost:8080`. Đảm bảo frontend đúng port hoặc cập nhật CORS.
- **401 khi gọi API**: kiểm tra đã set header `Authorization: Bearer <accessToken>`; token hết hạn thì dùng `POST /api/auth/refresh`.
- **VNPay redirect không đúng**: kiểm tra `vnpay.return-url` / `VNPAY_RETURN_URL` trỏ về frontend route xử lý (`/payment-result`).
- **Không connect được DB**: kiểm tra `SPRING_DATASOURCE_URL`/username/password và DB đã chạy.

## Project structure

```text
.
├─ backend/                       # Spring Boot API
│  ├─ src/main/java/              # source code
│  ├─ src/main/resources/         # application.properties
│  ├─ pom.xml                     # Maven config (Java 21)
│  └─ mvnw, mvnw.cmd              # Maven wrapper
└─ frontend/                      # React + Vite web app
   ├─ src/
   ├─ public/
   ├─ vite.config.js              # dev server port 3000
   └─ package.json
```

## Contributing

- Tạo branch theo `feature/*`, `fix/*`, `chore/*`
- PR nên kèm **Summary** + **Test plan**
- Không commit `.env`, secrets, private keys

