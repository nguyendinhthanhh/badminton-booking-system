import { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import useAuthStore from '../../store/useAuthStore';
import userService from '../../services/userService';

const AdminHeader = () => {
  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout: logoutStore } = useAuthStore();

  const getPageTitle = () => {
    const path = location.pathname;
    if (path === '/admin') return 'Dashboard';
    if (path.includes('/admin/courts')) return 'Quản lý sân';
    if (path.includes('/admin/users')) return 'Quản lý người dùng';
    if (path.includes('/admin/bookings')) return 'Quản lý đặt sân';
    if (path.includes('/admin/payments')) return 'Quản lý thanh toán';
    if (path.includes('/admin/reports')) return 'Báo cáo';
    if (path.includes('/admin/settings')) return 'Cài đặt';
    if (path.includes('/admin/system-config')) return 'Cấu hình hệ thống';
    if (path.includes('/admin/profile')) return 'Hồ sơ cá nhân';
    return 'Admin';
  };

  const notifications = [
    {
      id: 1,
      title: 'Thanh toán mới',
      message: 'Khách hàng vừa thanh toán 500.000đ',
      time: '5 phút trước',
      icon: 'payments',
      color: 'text-green-600 bg-green-50'
    },
    {
      id: 2,
      title: 'Đặt sân mới',
      message: 'Sân 01 - 18:00 ngày mai',
      time: '10 phút trước',
      icon: 'event',
      color: 'text-blue-600 bg-blue-50'
    },
    {
      id: 3,
      title: 'Yêu cầu hủy',
      message: 'Khách hàng yêu cầu hủy booking #BK-9023',
      time: '30 phút trước',
      icon: 'cancel',
      color: 'text-red-600 bg-red-50'
    }
  ];

  const handleLogout = async () => {
    // Logout immediately for better UX
    logoutStore();
    navigate('/login');

    // Call API in background (don't wait)
    try {
      await userService.logout();
    } catch (error) {
      console.error('Logout API error:', error);
      // Already logged out locally, so ignore API errors
    }
  };

  return (
    <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-6 shrink-0 z-50 relative">
      {/* Left Section */}
      <div className="flex items-center gap-4">
        <h1 className="text-xl font-bold text-gray-900">{getPageTitle()}</h1>
      </div>

      {/* Right Section */}
      <div className="flex items-center gap-3">
        {/* Search */}
        <div className="hidden md:flex items-center bg-gray-100 rounded-lg px-3 py-2 gap-2 w-64">
          <span className="material-symbols-outlined text-gray-400 text-xl">search</span>
          <input
            type="text"
            placeholder="Tìm kiếm..."
            className="bg-transparent border-none outline-none text-sm w-full text-gray-700 placeholder-gray-400"
          />
        </div>

        {/* Notifications */}
        <div className="relative">
          <button
            onClick={() => {
              setShowNotifications(!showNotifications);
              setShowProfile(false);
            }}
            className="relative p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <span className="material-symbols-outlined text-2xl">notifications</span>
            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
          </button>

          {showNotifications && (
            <>
              <div
                className="fixed inset-0 z-40"
                onClick={() => setShowNotifications(false)}
              ></div>
              <div className="absolute right-0 mt-2 w-80 bg-white rounded-xl shadow-lg border border-gray-200 z-50">
                <div className="px-4 py-3 border-b border-gray-200 flex items-center justify-between">
                  <h3 className="font-semibold text-gray-900">Thông báo</h3>
                  <span className="text-xs bg-red-100 text-red-600 px-2 py-1 rounded-full font-medium">
                    {notifications.length} mới
                  </span>
                </div>
                <div className="max-h-96 overflow-y-auto">
                  {notifications.map((notif) => (
                    <div
                      key={notif.id}
                      className="px-4 py-3 hover:bg-gray-50 cursor-pointer border-b border-gray-100 last:border-0"
                    >
                      <div className="flex gap-3">
                        <div className={`w-10 h-10 rounded-lg ${notif.color} flex items-center justify-center flex-shrink-0`}>
                          <span className="material-symbols-outlined text-xl">{notif.icon}</span>
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900">{notif.title}</p>
                          <p className="text-xs text-gray-600 mt-1">{notif.message}</p>
                          <p className="text-xs text-gray-400 mt-1">{notif.time}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="px-4 py-3 border-t border-gray-200">
                  <button className="text-sm text-blue-600 font-medium hover:text-blue-700 w-full text-center">
                    Xem tất cả thông báo
                  </button>
                </div>
              </div>
            </>
          )}
        </div>

        {/* Profile */}
        <div className="relative">
          <button
            onClick={() => {
              setShowProfile(!showProfile);
              setShowNotifications(false);
            }}
            className="flex items-center gap-3 p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            {user?.avatar ? (
              <img
                src={user.avatar}
                alt="Avatar"
                className="w-9 h-9 rounded-full object-cover border-2 border-blue-600/20"
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.style.display = 'none';
                  const fallback = e.target.nextElementSibling;
                  if (fallback) fallback.style.display = 'flex';
                }}
              />
            ) : null}
            <div
              className="w-9 h-9 bg-blue-600 rounded-full flex items-center justify-center"
              style={{ display: user?.avatar ? 'none' : 'flex' }}
            >
              <span className="text-white font-semibold text-sm">
                {user?.fullName?.charAt(0)?.toUpperCase() || user?.username?.charAt(0)?.toUpperCase() || 'A'}
              </span>
            </div>
            <div className="hidden lg:block text-left">
              <p className="text-sm font-medium text-gray-900">{user?.fullName || 'Admin'}</p>
              <p className="text-xs text-gray-500">{user?.roleName || 'Administrator'}</p>
            </div>
            <span className="material-symbols-outlined text-gray-400 text-xl">expand_more</span>
          </button>

          {showProfile && (
            <>
              <div
                className="fixed inset-0 z-40"
                onClick={() => setShowProfile(false)}
              ></div>
              <div className="absolute right-0 mt-2 w-64 bg-white rounded-xl shadow-lg border border-gray-200 z-50 py-2">
                <div className="px-4 py-3 border-b border-gray-200">
                  <p className="text-sm font-medium text-gray-900">{user?.fullName || 'Admin User'}</p>
                  <p className="text-xs text-gray-500 mt-1">{user?.email || 'admin@badminton.com'}</p>
                </div>
                <div className="py-2">
                  <button
                    onClick={() => {
                      setShowProfile(false);
                      navigate('/admin/profile'); // Assuming a profile page exists or will be created
                    }}
                    className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-3"
                  >
                    <span className="material-symbols-outlined text-xl">person</span>
                    <span>Hồ sơ của tôi</span>
                  </button>
                  <button
                    onClick={() => {
                      setShowProfile(false);
                      navigate('/admin/system-config');
                    }}
                    className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-3"
                  >
                    <span className="material-symbols-outlined text-xl">settings</span>
                    <span>Cài đặt</span>
                  </button>
                  <button
                    onClick={() => {
                      setShowProfile(false);
                      // Show toast or navigate to help
                      // For now, just close as it might not be implemented
                    }}
                    className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-3"
                  >
                    <span className="material-symbols-outlined text-xl">help</span>
                    <span>Trợ giúp</span>
                  </button>
                </div>
                <div className="border-t border-gray-200 py-2">
                  <button
                    onClick={() => {
                      handleLogout();
                      setShowProfile(false);
                    }}
                    className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 flex items-center gap-3"
                  >
                    <span className="material-symbols-outlined text-xl">logout</span>
                    <span>Đăng xuất</span>
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </header>
  );
};

export default AdminHeader;
