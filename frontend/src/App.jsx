import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import GuestLayout from './layouts/GuestLayout';
import AdminLayout from './layouts/AdminLayout';
import GuestHome from './pages/customer/GuestHome';
import CourtDetails from './pages/customer/CourtDetails';
import CourtList from './pages/customer/CourtList';
import CourtBooking from './pages/customer/CourtBooking';
import UserProfile from './pages/customer/UserProfile';
import MyBookings from './pages/customer/MyBookings';
import Community from './pages/customer/Community';
import Dashboard from './pages/admin/Dashboard';
import CourtManagement from './pages/admin/CourtManagement';
import UserManagement from './pages/admin/UserManagement';
import BookingSchedule from './pages/admin/BookingSchedule';
import BookingManagement from './pages/admin/BookingManagement';
import PriceRuleManagement from './pages/admin/PriceRuleManagement';
import CourtPriceManagement from './pages/admin/CourtPriceManagement';
import SystemConfig from './pages/admin/SystemConfig';
import AuthPage from './pages/auth/AuthPage.jsx';
import ProtectedRoute from './components/Auth/ProtectedRoute.jsx';
import './App.css';

function App() {
  return (
    <Router>
      <ToastContainer position="top-right" autoClose={3000} />
      <Routes>
        {/* Public Routes */}
        <Route path="/login" element={<AuthPage />} />

        <Route element={<GuestLayout />}>
          <Route path="/" element={<GuestHome />} />
          <Route path="/courts" element={<CourtList />} />
          <Route path="/courts/:id" element={<CourtDetails />} />
          <Route path="/courts/:id" element={<CourtDetails />} />
          <Route path="/booking" element={<CourtBooking />} />
          <Route path="/community" element={<Community />} />

          {/* Protected Customer Routes with Layout */}
          <Route element={<ProtectedRoute redirectPath="/login" />}>
            <Route path="/profile" element={<UserProfile />} />
            <Route path="/my-bookings" element={<MyBookings />} />
          </Route>
        </Route>

        {/* Protected Admin Routes */}
        <Route element={<ProtectedRoute requiredRole="ADMIN" redirectPath="/login" />}>
          <Route path="/admin" element={<AdminLayout />}>
            <Route index element={<Dashboard />} />
            <Route path="bookings" element={<BookingSchedule />} />
            <Route path="booking-management" element={<BookingManagement />} />
            <Route path="courts" element={<CourtManagement />} />
            <Route path="court-prices" element={<CourtPriceManagement />} />
            <Route path="users" element={<UserManagement />} />
            <Route path="price-rules" element={<PriceRuleManagement />} />
            <Route path="system-config" element={<SystemConfig />} />
            <Route path="profile" element={<UserProfile />} />
          </Route>
        </Route>

        {/* 404 */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}

export default App;