# Badminton Booking System

Hệ thống quản lý & đặt sân cầu lông gồm **Frontend (React)** và **Backend (Spring Boot)**.

## Tổng quan

- **Frontend**: React 19 + Vite, TailwindCSS, Zustand, React Router.
- **Backend**: Spring Boot 3.2 (Java 21), Spring Security + JWT, Spring Data JPA, Validation, Mail, Flyway (có dependency), SpringDoc OpenAPI (Swagger UI).
- **Database**: có driver cho **PostgreSQL** và **SQL Server** (tuỳ cấu hình).

## Kiến trúc & Ports

- **Frontend**: `http://localhost:3000`
- **Backend**: `http://localhost:8080`
- **Swagger UI**: `http://localhost:8080/swagger-ui.html`
- **OpenAPI JSON**: `http://localhost:8080/api-docs`

## Yêu cầu hệ thống

- **Node.js**: khuyến nghị Node 18+ (hoặc bản LTS mới hơn)
- **Java**: 21
- **Maven**: dùng `mvnw`/`mvnw.cmd` (đã có trong `backend/`)
- **Database**: PostgreSQL hoặc SQL Server

## Chạy dự án (Local)

### 1) Backend (Spring Boot)

Tại thư mục `backend/`:

```bash
./mvnw spring-boot:run
```

Trên Windows PowerShell:

```bash
.\mvnw.cmd spring-boot:run
```

Backend mặc định chạy ở `http://localhost:8080`.

### 2) Frontend (React + Vite)

Tại thư mục `frontend/`:

```bash
npm install
npm run dev
```

Frontend mặc định chạy ở `http://localhost:3000`.

## Cấu hình (Environment / Secrets)

Backend đang đọc cấu hình từ `backend/src/main/resources/application.properties`, bao gồm các khoá liên quan đến:

- **JWT**: `app.jwt.secret`, `app.jwt.expiration`, `app.jwt.refresh-expiration`
- **Email/SMTP**
- **Database connection**
- **VNPay**
- **Gemini API**
- **Frontend base URL** cho link xác thực email: `APP_FRONTEND_BASE_URL`

### Khuyến nghị an toàn

- **Không commit secrets** (password/API key) vào repo, đặc biệt khi public.
- Nếu repo này từng public hoặc đã chia sẻ, nên **rotate toàn bộ credentials** đang nằm trong `application.properties`.
- Cách làm phổ biến là chuyển các giá trị nhạy cảm sang **Environment Variables** (hoặc `application-local.properties` không commit), ví dụ:
  - `SPRING_DATASOURCE_URL`
  - `SPRING_DATASOURCE_USERNAME`
  - `SPRING_DATASOURCE_PASSWORD`
  - `APP_JWT_SECRET`
  - `SPRING_MAIL_USERNAME`
  - `SPRING_MAIL_PASSWORD`
  - `VNPAY_TMN_CODE`, `VNPAY_HASH_SECRET`
  - `GEMINI_API_KEY`

## Scripts hữu ích

### Frontend (`frontend/package.json`)

- **dev**: `npm run dev` (Vite, port 3000)
- **build**: `npm run build`
- **preview**: `npm run preview`
- **lint**: `npm run lint`

### Backend (Maven)

- **run**: `./mvnw spring-boot:run`
- **test**: `./mvnw test`
- **package**: `./mvnw clean package`

## Cấu trúc thư mục

```text
.
├─ backend/                 # Spring Boot API
│  ├─ src/main/java/         # source code
│  ├─ src/main/resources/    # application.properties, resources
│  ├─ pom.xml                # Maven config (Java 21)
│  └─ mvnw, mvnw.cmd         # Maven wrapper
└─ frontend/                 # React + Vite web app
   ├─ src/                   # source code
   ├─ public/                # static assets
   ├─ vite.config.js         # Vite config (port 3000)
   └─ package.json
```

## API Documentation

Sau khi chạy backend, truy cập:

- Swagger UI: `http://localhost:8080/swagger-ui.html`
- OpenAPI JSON: `http://localhost:8080/api-docs`

## Góp ý & đóng góp

- Tạo branch theo feature/fix, mở PR kèm mô tả thay đổi và test plan.
- Tránh commit thông tin nhạy cảm (secrets, token, private keys).

