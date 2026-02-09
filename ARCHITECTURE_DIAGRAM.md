# Architecture Diagram: Booking Status Update Flow

## Before Fix (Network Error)

```
┌─────────────────────────────────────────────────────────────────┐
│                         BROWSER                                  │
│  ┌────────────────────────────────────────────────────────────┐ │
│  │  Frontend (localhost:3000)                                  │ │
│  │  ┌──────────────────────────────────────────────────────┐  │ │
│  │  │  BookingManagement.jsx                                │  │ │
│  │  │  - User clicks "Xác nhận" button                      │  │ │
│  │  │  - Calls adminBookingService.updateBookingStatus()    │  │ │
│  │  └──────────────────────────────────────────────────────┘  │ │
│  │                           │                                  │ │
│  │                           ▼                                  │ │
│  │  ┌──────────────────────────────────────────────────────┐  │ │
│  │  │  adminBookingService.js                               │  │ │
│  │  │  - Makes PATCH request                                │  │ │
│  │  │  - URL: /api/bookings/5/status?status=CONFIRMED       │  │ │
│  │  └──────────────────────────────────────────────────────┘  │ │
│  │                           │                                  │ │
│  │                           ▼                                  │ │
│  │  ┌──────────────────────────────────────────────────────┐  │ │
│  │  │  axiosInstance (axiosConfig.js)                       │  │ │
│  │  │  - Adds Authorization header                          │  │ │
│  │  │  - Sends PATCH request                                │  │ │
│  │  └──────────────────────────────────────────────────────┘  │ │
│  └────────────────────────────────────────────────────────────┘ │
│                           │                                      │
│                           │ PATCH request                        │
│                           ▼                                      │
│  ┌────────────────────────────────────────────────────────────┐ │
│  │  Browser CORS Check                                         │ │
│  │  ❌ BLOCKED! PATCH not in allowed methods                   │ │
│  │  Returns: ERR_NETWORK                                       │ │
│  └────────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────┘
                           ✗
                    Request never reaches backend!

┌─────────────────────────────────────────────────────────────────┐
│                    BACKEND (localhost:8080)                      │
│  ┌────────────────────────────────────────────────────────────┐ │
│  │  SecurityConfig.java                                        │ │
│  │  ❌ Allowed methods: GET, POST, PUT, DELETE, OPTIONS        │ │
│  │  ❌ Missing: PATCH                                          │ │
│  └────────────────────────────────────────────────────────────┘ │
│                                                                  │
│  ┌────────────────────────────────────────────────────────────┐ │
│  │  BookingController.java                                     │ │
│  │  @PatchMapping("/{bookingId}/status")                       │ │
│  │  (Never reached)                                            │ │
│  └────────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────┘
```

## After Fix (Working)

```
┌─────────────────────────────────────────────────────────────────┐
│                         BROWSER                                  │
│  ┌────────────────────────────────────────────────────────────┐ │
│  │  Frontend (localhost:3000)                                  │ │
│  │  ┌──────────────────────────────────────────────────────┐  │ │
│  │  │  BookingManagement.jsx                                │  │ │
│  │  │  - User clicks "Xác nhận" button                      │  │ │
│  │  │  - Calls adminBookingService.updateBookingStatus()    │  │ │
│  │  └──────────────────────────────────────────────────────┘  │ │
│  │                           │                                  │ │
│  │                           ▼                                  │ │
│  │  ┌──────────────────────────────────────────────────────┐  │ │
│  │  │  adminBookingService.js                               │  │ │
│  │  │  - Makes PATCH request                                │  │ │
│  │  │  - URL: /api/bookings/5/status?status=CONFIRMED       │  │ │
│  │  └──────────────────────────────────────────────────────┘  │ │
│  │                           │                                  │ │
│  │                           ▼                                  │ │
│  │  ┌──────────────────────────────────────────────────────┐  │ │
│  │  │  axiosInstance (axiosConfig.js)                       │  │ │
│  │  │  - Adds Authorization header                          │  │ │
│  │  │  - Sends PATCH request                                │  │ │
│  │  └──────────────────────────────────────────────────────┘  │ │
│  └────────────────────────────────────────────────────────────┘ │
│                           │                                      │
│                           │ PATCH request                        │
│                           ▼                                      │
│  ┌────────────────────────────────────────────────────────────┐ │
│  │  Browser CORS Check                                         │ │
│  │  ✅ ALLOWED! PATCH is in allowed methods                    │ │
│  │  Request proceeds to backend                                │ │
│  └────────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────┘
                           │
                           │ PATCH /api/bookings/5/status?status=CONFIRMED
                           │ Authorization: Bearer <token>
                           ▼
┌─────────────────────────────────────────────────────────────────┐
│                    BACKEND (localhost:8080)                      │
│  ┌────────────────────────────────────────────────────────────┐ │
│  │  SecurityConfig.java                                        │ │
│  │  ✅ Allowed methods: GET, POST, PUT, PATCH, DELETE, OPTIONS │ │
│  │  ✅ PATCH is now allowed!                                   │ │
│  └────────────────────────────────────────────────────────────┘ │
│                           │                                      │
│                           ▼                                      │
│  ┌────────────────────────────────────────────────────────────┐ │
│  │  JwtAuthenticationFilter                                    │ │
│  │  - Validates JWT token                                      │ │
│  │  - Extracts user info                                       │ │
│  └────────────────────────────────────────────────────────────┘ │
│                           │                                      │
│                           ▼                                      │
│  ┌────────────────────────────────────────────────────────────┐ │
│  │  BookingController.java                                     │ │
│  │  @PatchMapping("/{bookingId}/status")                       │ │
│  │  - Receives request                                         │ │
│  │  - Calls bookingService.updateBookingStatus()              │ │
│  └────────────────────────────────────────────────────────────┘ │
│                           │                                      │
│                           ▼                                      │
│  ┌────────────────────────────────────────────────────────────┐ │
│  │  BookingServiceImpl.java                                    │ │
│  │  - Validates status transition                              │ │
│  │  - Updates booking in database                              │ │
│  │  - Returns BookingResponse                                  │ │
│  └────────────────────────────────────────────────────────────┘ │
│                           │                                      │
│                           ▼                                      │
│  ┌────────────────────────────────────────────────────────────┐ │
│  │  PostgreSQL Database                                        │ │
│  │  UPDATE bookings SET status = 'CONFIRMED' WHERE id = 5      │ │
│  └────────────────────────────────────────────────────────────┘ │
│                           │                                      │
│                           │ Success response                     │
│                           ▼                                      │
└─────────────────────────────────────────────────────────────────┘
                           │
                           │ 200 OK + BookingResponse JSON
                           ▼
┌─────────────────────────────────────────────────────────────────┐
│                         BROWSER                                  │
│  ┌────────────────────────────────────────────────────────────┐ │
│  │  Frontend (localhost:3000)                                  │ │
│  │  ┌──────────────────────────────────────────────────────┐  │ │
│  │  │  BookingManagement.jsx                                │  │ │
│  │  │  ✅ Success message displayed                          │  │ │
│  │  │  ✅ Table refreshed with new status                    │  │ │
│  │  │  ✅ Status badge updated to "CONFIRMED" (blue)         │  │ │
│  │  └──────────────────────────────────────────────────────┘  │ │
│  └────────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────┘
```

## Key Changes

### 1. SecurityConfig.java
```java
// BEFORE
configuration.setAllowedMethods(Arrays.asList(
    "GET", "POST", "PUT", "DELETE", "OPTIONS"
));

// AFTER
configuration.setAllowedMethods(Arrays.asList(
    "GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"
));
```

### 2. CORS Headers (Before)
```
Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS
```

### 3. CORS Headers (After)
```
Access-Control-Allow-Methods: GET, POST, PUT, PATCH, DELETE, OPTIONS
```

## Request Flow Details

### 1. Frontend Request
```javascript
// adminBookingService.js
const response = await axiosInstance.patch(
  `/bookings/${bookingId}/status`,
  null,
  { params: { status } }
);
```

### 2. HTTP Request
```http
PATCH /api/bookings/5/status?status=CONFIRMED HTTP/1.1
Host: localhost:8080
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
Content-Type: application/json
Origin: http://localhost:3000
```

### 3. Backend Response
```http
HTTP/1.1 200 OK
Access-Control-Allow-Origin: http://localhost:3000
Access-Control-Allow-Methods: GET, POST, PUT, PATCH, DELETE, OPTIONS
Content-Type: application/json

{
  "bookingId": 5,
  "status": "CONFIRMED",
  "courtName": "Court 1",
  ...
}
```

## Status Transition Validation

```
┌─────────────────────────────────────────────────────────────┐
│  BookingServiceImpl.updateBookingStatus()                    │
│                                                              │
│  1. Check current status                                    │
│  2. Validate transition:                                    │
│     - PENDING → CONFIRMED ✅                                 │
│     - PENDING → CANCELLED ✅                                 │
│     - CONFIRMED → PLAYING ✅                                 │
│     - CONFIRMED → CANCELLED ✅                               │
│     - PLAYING → COMPLETED ✅                                 │
│     - COMPLETED → * ❌ (final state)                         │
│     - CANCELLED → * ❌ (final state)                         │
│  3. Update database                                         │
│  4. Return updated booking                                  │
└─────────────────────────────────────────────────────────────┘
```

## Error Handling

### Network Error (Before Fix)
```
Browser → CORS Check → ❌ BLOCKED
Error: ERR_NETWORK
Response: undefined
```

### Success (After Fix)
```
Browser → CORS Check → ✅ ALLOWED → Backend → Database → Response
Status: 200 OK
Data: { bookingId: 5, status: "CONFIRMED", ... }
```

### Invalid Transition
```
Browser → CORS Check → ✅ ALLOWED → Backend → Validation → ❌ ERROR
Status: 400 Bad Request
Error: "Invalid status transition"
```

### Unauthorized
```
Browser → CORS Check → ✅ ALLOWED → Backend → JWT Check → ❌ ERROR
Status: 401 Unauthorized
Error: "Invalid or expired token"
```
