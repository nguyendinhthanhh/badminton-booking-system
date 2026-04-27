# Badminton Booking System

A comprehensive badminton court booking management system built with Spring Boot and React, designed for sports facilities to manage court reservations, equipment rentals, and customer interactions.

## 🏸 Features

### Core Booking Management
- **Court Reservation System** - Real-time court availability and booking management
- **Time Slot Management** - Flexible scheduling with customizable time slots
- **Walk-in Booking Support** - Handle both advance and on-site reservations
- **Booking Extensions** - Allow customers to extend their playing time
- **Cancellation Management** - Automated refund processing and cancellation policies

### Equipment & Inventory
- **Racket Rental System** - Manage badminton racket inventory and rentals
- **Product Management** - Handle sports equipment and accessories
- **Warehouse Management** - Track inventory levels and stock movements

### Payment & Pricing
- **Dynamic Pricing** - Flexible pricing based on time slots and court types
- **Deposit Management** - Handle booking deposits and final payments
- **Payment Processing** - Integrated payment gateway support
- **Overtime Billing** - Automatic calculation for extended playing time

### User Management & Security
- **Role-based Access Control** - Admin, staff, and customer roles
- **JWT Authentication** - Secure token-based authentication
- **Email Verification** - Account verification and password recovery
- **User Profile Management** - Customer information and booking history

### Administrative Tools
- **Admin Dashboard** - Comprehensive reporting and analytics
- **Schedule Timeline** - Visual booking schedule management
- **System Configuration** - Customizable system settings
- **Report Generation** - Revenue, usage, and performance reports

### Customer Experience
- **AI Chatbot Integration** - Powered by Google Gemini for customer support
- **Real-time Availability** - Live court status updates
- **Booking History** - Complete transaction and booking records
- **Email Notifications** - Automated booking confirmations and reminders

## 🛠 Technology Stack

### Backend
- **Java 21** - Latest LTS version with modern language features
- **Spring Boot 3.2.1** - Enterprise-grade application framework
- **Spring Security** - Authentication and authorization
- **Spring Data JPA** - Database abstraction layer
- **PostgreSQL/SQL Server** - Production database support
- **Flyway** - Database migration management
- **JWT** - Stateless authentication tokens
- **MapStruct** - Type-safe object mapping
- **OpenAPI 3** - API documentation and testing

### Frontend
- **React 19** - Modern UI library with latest features
- **Vite** - Fast build tool and development server
- **TypeScript** - Type-safe JavaScript development
- **Tailwind CSS** - Utility-first CSS framework
- **Zustand** - Lightweight state management
- **React Router** - Client-side routing
- **Axios** - HTTP client for API communication

### Development Tools
- **Maven** - Dependency management and build automation
- **Lombok** - Boilerplate code reduction
- **ESLint** - Code quality and consistency
- **Hot Reload** - Development productivity features

## 🚀 Getting Started

### Prerequisites
- Java 21 or higher
- Node.js 18+ and npm
- PostgreSQL or SQL Server
- Maven 3.6+

### Backend Setup

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd badminton-booking-system
   ```

2. **Configure database**
   ```bash
   # Create database
   createdb badminton_booking
   
   # Update application.properties with your database credentials
   ```

3. **Run the backend**
   ```bash
   cd backend
   ./mvnw spring-boot:run
   ```

   The API will be available at `http://localhost:8080`

### Frontend Setup

1. **Install dependencies**
   ```bash
   cd frontend
   npm install
   ```

2. **Start development server**
   ```bash
   npm run dev
   ```

   The application will be available at `http://localhost:3000`

### API Documentation

Once the backend is running, access the interactive API documentation at:
- Swagger UI: `http://localhost:8080/swagger-ui.html`
- OpenAPI Spec: `http://localhost:8080/v3/api-docs`

## 📁 Project Structure

```
badminton-booking-system/
├── backend/                    # Spring Boot API
│   ├── src/main/java/com/badminton/booking/
│   │   ├── controller/        # REST API endpoints
│   │   ├── service/           # Business logic layer
│   │   ├── repository/        # Data access layer
│   │   ├── entity/            # JPA entities
│   │   ├── dto/               # Data transfer objects
│   │   ├── config/            # Configuration classes
│   │   └── security/          # Security configuration
│   └── src/main/resources/
│       ├── db/migration/      # Flyway database migrations
│       └── application.properties
├── frontend/                   # React application
│   ├── src/
│   │   ├── components/        # Reusable UI components
│   │   ├── pages/             # Application pages
│   │   ├── services/          # API service layer
│   │   ├── hooks/             # Custom React hooks
│   │   ├── store/             # State management
│   │   └── utils/             # Utility functions
│   └── public/                # Static assets
└── README.md
```

## 🔧 Configuration

### Environment Variables

Create `.env` files for environment-specific configuration:

**Backend (`backend/src/main/resources/application-dev.properties`)**
```properties
spring.datasource.url=jdbc:postgresql://localhost:5432/badminton_booking
spring.datasource.username=your_username
spring.datasource.password=your_password
jwt.secret=your_jwt_secret_key
spring.mail.host=smtp.gmail.com
spring.mail.username=your_email@gmail.com
spring.mail.password=your_app_password
```

**Frontend (`frontend/.env`)**
```env
VITE_API_BASE_URL=http://localhost:8080/api
VITE_APP_NAME=Badminton Booking System
```

## 🧪 Testing

### Backend Tests
```bash
cd backend
./mvnw test
```

### Frontend Tests
```bash
cd frontend
npm run test
```

## 📦 Deployment

### Production Build

**Backend**
```bash
cd backend
./mvnw clean package -Pprod
```

**Frontend**
```bash
cd frontend
npm run build
```

### Docker Deployment
```bash
# Build and run with Docker Compose
docker-compose up --build
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 📞 Support

For support and questions:
- Create an issue in the repository
- Contact the development team
- Check the API documentation for technical details

---

**Built with ❤️ for the badminton community**