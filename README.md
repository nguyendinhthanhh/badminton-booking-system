# 🏸 Badminton Court Booking System

## 📖 Overview

The **Badminton Court Booking System** is a comprehensive web application designed to streamline the process of booking badminton courts. The platform provides an intuitive interface for customers to browse available courts, make reservations, process payments, and manage their bookings. The system includes a powerful admin panel for court management and analytics.

---

## 🧑‍🤝‍🧑 Team Members

| No. | Full Name         | Student ID | Email                      |
| --: | ----------------- | ---------- | -------------------------- |
|   1 | Trần Gia Huy      | SE170167   | huytgse170167@fpt.edu.vn   |
|   2 | Nguyễn Đình Thanh | SE182854   | thanhndse182854@fpt.edu.vn |
|   3 | Lê Quang Hải      | SE183698   | hailqse183698@fpt.edu.vn   |
|   4 | Nguyễn Công Hậu   | SE181752   | hauncse181752@fpt.edu.vn   |
|   5 | Nguyễn Thành Lợi  | SE182752   | lointse182752@fpt.edu.vn   |

---

### Key Highlights

- 🔐 **Secure Authentication** - JWT-based authentication with role-based access control
- 💳 **Online Payments** - Integrated payment gateways (VNPay, MoMo, ZaloPay)
- 📱 **Responsive Design** - Mobile-first responsive UI
- ⚡ **Real-time Updates** - Live court availability tracking
- 📊 **Analytics Dashboard** - Revenue reports and booking statistics
- 🎯 **Multi-role Support** - Guest, Customer, Staff, and Admin roles

---

## ✨ Features

### 🌐 Guest Users

- Browse available badminton courts with detailed information
- View pricing and available time slots
- Access to registration and login functionality

### 👤 Customer Portal

- **Advanced Search** - Filter courts by date, time, location, and court type
- **Easy Booking** - Simple and intuitive booking process
- **Secure Payments** - Multiple payment gateway options
- **Booking Management** - View booking history and current reservations
- **Flexible Cancellation** - Cancel bookings according to cancellation policy

### 👨‍💼 Staff Dashboard

- **Daily Schedule** - View and manage daily court bookings
- **Customer Check-in** - Quick check-in system for arriving customers
- **Status Management** - Update booking and court status in real-time

### 🔧 Admin Panel

- **Court Management** - Full CRUD operations for court listings
- **Configuration** - Manage time slots, pricing, and booking rules
- **Booking Oversight** - View and manage all system bookings
- **Reports & Analytics** - Generate revenue reports and usage statistics
- **User Management** - Manage customer and staff accounts

---

## 🛠️ Tech Stack

### Frontend

- **Framework**: React 18.x
- **Build Tool**: Vite 5.x
- **Language**: JavaScript/JSX
- **Routing**: React Router DOM
- **HTTP Client**: Axios
- **Styling**: CSS3, Modern UI Components

### Backend

- **Framework**: Spring Boot 3.x
- **Language**: Java 17+
- **Build Tool**: Maven
- **Architecture**: RESTful API
- **Security**: Spring Security + JWT
- **Database**: SQL Server
- **ORM**: Spring Data JPA/Hibernate

### DevOps & Tools

- **Version Control**: Git & GitHub
- **CI/CD**: GitHub Actions
- **API Testing**: Postman
- **Development Environment**: VS Code, IntelliJ IDEA

---

## 📂 Project Structure

```
badminton-booking-system/
│
├── frontend/                    # React frontend application
│   ├── public/                  # Static assets
│   ├── src/
│   │   ├── components/          # Reusable React components
│   │   │   ├── common/          # Common UI components
│   │   │   └── layout/          # Layout components
│   │   ├── pages/               # Page components
│   │   │   ├── admin/           # Admin dashboard pages
│   │   │   └── customer/        # Customer portal pages
│   │   ├── services/            # API service layer
│   │   ├── routers/             # Route configurations
│   │   ├── context/             # React context providers
│   │   ├── hooks/               # Custom React hooks
│   │   ├── utils/               # Utility functions
│   │   └── styles/              # Global styles
│   ├── package.json
│   └── vite.config.js
│
├── back-end/                    # Spring Boot backend application
│   ├── src/
│   │   ├── main/
│   │   │   ├── java/com/badminton/booking/
│   │   │   │   ├── config/          # Spring configuration
│   │   │   │   ├── controller/      # REST controllers
│   │   │   │   ├── dto/             # Data Transfer Objects
│   │   │   │   │   ├── request/     # Request DTOs
│   │   │   │   │   └── response/    # Response DTOs
│   │   │   │   ├── entity/          # JPA entities
│   │   │   │   ├── repository/      # Data repositories
│   │   │   │   ├── service/         # Business logic
│   │   │   │   │   └── serviceimpl/ # Service implementations
│   │   │   │   ├── security/        # Security configuration
│   │   │   │   ├── mapper/          # Entity-DTO mappers
│   │   │   │   └── exception/       # Custom exceptions
│   │   │   └── resources/
│   │   │       └── application.properties
│   │   └── test/                    # Unit and integration tests
│   └── pom.xml
│
└── README.md                    # This file
```

---

## 🚀 Getting Started

### Prerequisites

Before you begin, ensure you have the following installed:

- **Java Development Kit (JDK)** 17 or higher
- **Maven** 3.8+
- **Node.js** 18+ and npm
- **SQL Server** 2019+
- **Git**

### Installation

#### 1. Clone the Repository

```bash
git clone https://github.com/yourusername/badminton-booking-system.git
cd badminton-booking-system
```

#### 2. Database Setup

```sql
-- Create database
CREATE DATABASE badminton_booking_db;

-- Configure connection in application.properties
```

#### 3. Backend Setup

```bash
# Navigate to backend directory
cd back-end

# Install dependencies and build
mvn clean install

# Run the application
mvn spring-boot:run

# The backend will start on http://localhost:8080
```

#### 4. Frontend Setup

```bash
# Navigate to frontend directory
cd frontend

# Install dependencies
npm install

# Start development server
npm run dev

# The frontend will start on http://localhost:5173
```

### Configuration

#### Backend Configuration

Update `back-end/src/main/resources/application.properties`:

```properties
# Database Configuration
spring.datasource.url=jdbc:sqlserver://localhost:1433;databaseName=badminton_booking_db
spring.datasource.username=your_username
spring.datasource.password=your_password

# JWT Configuration
jwt.secret=your_secret_key
jwt.expiration=86400000

# Payment Gateway Configuration
vnpay.tmnCode=your_tmn_code
vnpay.secretKey=your_secret_key
```

#### Frontend Configuration

Create `frontend/.env` file:

```env
VITE_API_BASE_URL=http://localhost:8080/api
VITE_APP_NAME=Badminton Booking System
```

---

## 📚 API Documentation

### Base URL

```
http://localhost:8080/api
```

### Authentication Endpoints

| Method | Endpoint         | Description          |
| ------ | ---------------- | -------------------- |
| POST   | `/auth/register` | Register new user    |
| POST   | `/auth/login`    | User login           |
| POST   | `/auth/refresh`  | Refresh access token |

### Court Endpoints

| Method | Endpoint       | Description              |
| ------ | -------------- | ------------------------ |
| GET    | `/courts`      | Get all courts           |
| GET    | `/courts/{id}` | Get court by ID          |
| POST   | `/courts`      | Create new court (Admin) |
| PUT    | `/courts/{id}` | Update court (Admin)     |
| DELETE | `/courts/{id}` | Delete court (Admin)     |

### Booking Endpoints

| Method | Endpoint                | Description         |
| ------ | ----------------------- | ------------------- |
| GET    | `/bookings`             | Get user bookings   |
| POST   | `/bookings`             | Create new booking  |
| PUT    | `/bookings/{id}/cancel` | Cancel booking      |
| GET    | `/bookings/{id}`        | Get booking details |

## 🔮 Future Enhancements

- [ ] Mobile application (React Native)
- [ ] Real-time notifications using WebSocket
- [ ] Advanced analytics dashboard
- [ ] Multi-language support
- [ ] SMS notifications
- [ ] Loyalty program integration
- [ ] Social media login (Google, Facebook)

---

## 📝 License

This project is developed for **academic purposes** as part of the Software Engineering program at FPT University.

---

## 🤝 Contributing

This is an academic project. For any questions or suggestions, please contact the team members via email.

---

## 📧 Contact

For inquiries, please reach out to any team member listed above or create an issue in the repository.

---

<div align="center">

**Made with ❤️ by FPT University Students**

⭐ Star this repository if you find it helpful!

</div>
