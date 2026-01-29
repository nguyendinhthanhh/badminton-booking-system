import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import GuestLayout from './layouts/GuestLayout';
import AdminLayout from './layouts/AdminLayout';
import GuestHome from './pages/customer/GuestHome';
import CourtDetails from './pages/customer/CourtDetails';
import Dashboard from './pages/admin/Dashboard';
import CourtManagement from './pages/admin/CourtManagement';
import AuthPage from './pages/auth/AuthPage.jsx'; // Trang Login của bạn
import ProtectedRoute from './components/Auth/ProtectedRoute.jsx';
import './App.css';
import {useEffect} from "react";
import useAuthStore from "./store/useAuthStore.js";
import axiosClient from "./axiosConfig/axiosConfig.js";

function App() {
  const setAccessToken = useAuthStore((state) => state.setAccessToken);

  useEffect(() => {
    const autoRefresh = async () => {
      try {
        // Gọi thử 1 API cần quyền hoặc API refresh để lấy lại AccessToken từ Cookie
        const res = await axiosClient.post('/auth/refresh-token');
        setAccessToken(res.data.accessToken);
      } catch (err) {
        console.log("Chưa đăng nhập hoặc session hết hạn: ",+ err);
      }
    };
    autoRefresh();
  }, [setAccessToken]);

  return (
      <Router>
        <Routes>
          {/* Public Routes: Ai cũng xem được */}
          <Route path="/login" element={<AuthPage />} />

          <Route element={<GuestLayout />}>
            <Route path="/" element={<GuestHome />} />
            <Route path="/courts/:id" element={<CourtDetails />} />
          </Route>

          {/* Private Routes: Chỉ dành cho Admin hoặc người đã Login */}
          <Route element={<ProtectedRoute redirectPath="/login" />}>
            <Route path="/admin" element={<AdminLayout />}>
              <Route index element={<Dashboard />} />
              <Route path="courts" element={<CourtManagement />} />
            </Route>
          </Route>

          {/* 404 hoặc Redirect mặc định */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Router>
  );
}

export default App;