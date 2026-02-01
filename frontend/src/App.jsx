import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import GuestLayout from './layouts/GuestLayout';
import AdminLayout from './layouts/AdminLayout';
import GuestHome from './pages/customer/GuestHome';
import CourtDetails from './pages/customer/CourtDetails';
import UserProfile from './pages/customer/UserProfile';
import Dashboard from './pages/admin/Dashboard';
import CourtManagement from './pages/admin/CourtManagement';
import UserManagement from './pages/admin/UserManagement';
import AuthPage from './pages/auth/AuthPage.jsx';
import ProtectedRoute from './components/Auth/ProtectedRoute.jsx';
import './App.css';

function App() {
  return (
      <Router>
        <Routes>
          {/* Public Routes */}
          <Route path="/login" element={<AuthPage />} />

          <Route element={<GuestLayout />}>
            <Route path="/" element={<GuestHome />} />
            <Route path="/courts/:id" element={<CourtDetails />} />
          </Route>

          {/* Protected Customer Routes */}
          <Route element={<ProtectedRoute redirectPath="/login" />}>
            <Route path="/profile" element={<UserProfile />} />
          </Route>

          {/* Protected Admin Routes */}
          <Route element={<ProtectedRoute redirectPath="/login" />}>
            <Route path="/admin" element={<AdminLayout />}>
              <Route index element={<Dashboard />} />
              <Route path="courts" element={<CourtManagement />} />
              <Route path="users" element={<UserManagement />} />
            </Route>
          </Route>

          {/* 404 */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Router>
  );
}

export default App;