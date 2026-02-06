import { Navigate, Outlet } from 'react-router-dom';
import useAuthStore from '../../store/useAuthStore.js';

const ProtectedRoute = ({ redirectPath = '/login', requiredRole }) => {
    const { accessToken, user } = useAuthStore();

    if (!accessToken) {
        // Nếu không có token, chuyển hướng về trang login
        return <Navigate to={redirectPath} replace />;
    }

    if (requiredRole && user?.roleName !== requiredRole) {
        // Nếu đã login nhưng không đúng role, chuyển về trang chủ
        return <Navigate to="/" replace />;
    }

    // Nếu đã login (và đúng role nếu yêu cầu), cho phép truy cập
    return <Outlet />;
};

export default ProtectedRoute;