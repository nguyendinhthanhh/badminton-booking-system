import { Link, useLocation, useNavigate } from 'react-router-dom';
import useAuthStore from '../../store/useAuthStore';

const AdminSidebar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuthStore();

  const menuItems = [
    { path: '/admin', icon: 'dashboard', label: 'Dashboard', exact: true },
    { path: '/admin/courts', icon: 'stadium', label: 'Quản lý sân' },
    { path: '/admin/court-prices', icon: 'payments', label: 'Giá sân' },
    { path: '/admin/users', icon: 'group', label: 'Người dùng' },
    { path: '/admin/bookings', icon: 'event_available', label: 'Đặt sân' },
    { path: '/admin/reports', icon: 'analytics', label: 'Báo cáo' },
    { path: '/admin/settings', icon: 'settings', label: 'Cài đặt' }
  ];

  const isActive = (path, exact = false) => {
    if (exact) {
      return location.pathname === path;
    }
    return location.pathname.startsWith(path);
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <aside className="w-64 bg-white border-r border-gray-200 flex flex-col shrink-0">
      {/* Logo */}
      <div className="p-6 flex items-center gap-3 border-b border-gray-200">
        <div className="bg-blue-600 p-2 rounded-lg flex items-center justify-center">
          <span className="material-symbols-outlined text-3xl text-white">sports_tennis</span>
        </div>
        <div className="flex flex-col">
          <h1 className="text-gray-900 text-lg font-bold leading-tight">BadmintonHub</h1>
          <p className="text-gray-500 text-xs font-medium">Admin Portal</p>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto px-4 py-4 flex flex-col gap-1">
        {menuItems.map((item) => (
          <Link
            key={item.path}
            to={item.path}
            className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all ${
              isActive(item.path, item.exact)
                ? 'bg-blue-50 text-blue-600 font-medium shadow-sm'
                : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
            }`}
          >
            <span className="material-symbols-outlined text-[20px]">{item.icon}</span>
            <span className="text-sm">{item.label}</span>
          </Link>
        ))}
      </nav>

      {/* User Profile */}
      <div className="p-4 border-t border-gray-200">
        <div className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50 cursor-pointer group">
          <div className="bg-blue-600 rounded-full w-10 h-10 flex items-center justify-center text-white font-bold">
            {user?.fullName?.charAt(0) || 'A'}
          </div>
          <div className="flex-1 overflow-hidden">
            <p className="text-gray-900 text-sm font-semibold truncate">
              {user?.fullName || 'Admin User'}
            </p>
            <p className="text-gray-500 text-xs truncate">Quản trị viên</p>
          </div>
          <button
            onClick={handleLogout}
            className="opacity-0 group-hover:opacity-100 transition-opacity"
            title="Đăng xuất"
          >
            <span className="material-symbols-outlined text-[20px] text-gray-400 hover:text-red-500">
              logout
            </span>
          </button>
        </div>
      </div>
    </aside>
  );
};

export default AdminSidebar;
