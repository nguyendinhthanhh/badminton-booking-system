import { Navigate, Outlet } from 'react-router-dom';
import useAuthStore from '../../store/useAuthStore.js';

const ProtectedRoute = ({ redirectPath = '/login' }) => {
    const accessToken = useAuthStore((state) => state.accessToken);

    if (!accessToken) {
        // Nếu không có token, chuyển hướng về trang login
        return <Navigate to={redirectPath} replace />;
    }

    // Nếu đã login, cho phép truy cập vào các route con (AdminLayout, Dashboard,...)
    return <Outlet />;
};

export default ProtectedRoute;