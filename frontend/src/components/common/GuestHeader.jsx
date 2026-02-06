import { Link, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import useAuthStore from '../../store/useAuthStore';

const GuestHeader = () => {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();
  const [showUserMenu, setShowUserMenu] = useState(false);

  const handleLogout = () => {
    logout();
    setShowUserMenu(false);
    navigate('/login');
  };

  return (
    <header className="sticky top-0 z-50 w-full bg-white dark:bg-[#111621] border-b border-[#e5e7eb] dark:border-[#2d3748]">
      <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-3">
            <div className="flex items-center justify-center text-primary">
              <span className="material-symbols-outlined text-4xl">sports_tennis</span>
            </div>
            <h1 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">BadmintonHub</h1>
          </Link>

          {/* Desktop Menu */}
          <nav className="hidden md:flex gap-8">
            <Link className="text-sm font-medium text-slate-600 hover:text-primary dark:text-slate-300 dark:hover:text-white transition-colors" to="/">
              Trang chủ
            </Link>
            <Link className="text-sm font-medium text-slate-600 hover:text-primary dark:text-slate-300 dark:hover:text-white transition-colors" to="/courts">
              Đặt sân
            </Link>
            <a className="text-sm font-medium text-slate-600 hover:text-primary dark:text-slate-300 dark:hover:text-white transition-colors" href="#">
              Bảng giá
            </a>
            <a className="text-sm font-medium text-slate-600 hover:text-primary dark:text-slate-300 dark:hover:text-white transition-colors" href="#">
              Liên hệ
            </a>
          </nav>

          {/* Auth Buttons or User Menu */}
          <div className="flex items-center gap-3">
            {user ? (
              <div className="relative">
                <button
                  onClick={() => setShowUserMenu(!showUserMenu)}
                  className="flex items-center gap-2.5 px-3 py-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                >
                  {user.avatar ? (
                    <img
                      src={user.avatar}
                      alt="Avatar"
                      className="size-9 rounded-full object-cover border-2 border-primary/30 shadow-sm"
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.style.display = 'none';
                        const fallback = e.target.nextElementSibling;
                        if (fallback) fallback.style.display = 'flex';
                      }}
                    />
                  ) : null}
                  <div 
                    className="bg-primary/10 rounded-full size-9 flex items-center justify-center text-primary font-bold text-sm shadow-sm"
                    style={{ display: user.avatar ? 'none' : 'flex' }}
                  >
                    {user.fullName?.charAt(0)?.toUpperCase() || user.username?.charAt(0)?.toUpperCase() || 'U'}
                  </div>
                  <span className="hidden sm:block text-sm font-medium text-slate-900 dark:text-white">
                    {user.fullName || user.username}
                  </span>
                  <span className="material-symbols-outlined text-slate-600 dark:text-slate-300 text-[20px]">
                    {showUserMenu ? 'expand_less' : 'expand_more'}
                  </span>
                </button>

                {/* Dropdown Menu */}
                {showUserMenu && (
                  <>
                    <div 
                      className="fixed inset-0 z-10" 
                      onClick={() => setShowUserMenu(false)}
                    />
                    <div className="absolute right-0 mt-2 w-56 bg-white dark:bg-[#1a202c] rounded-lg shadow-lg border border-slate-200 dark:border-gray-700 py-2 z-20">
                      <Link
                        to="/profile"
                        onClick={() => setShowUserMenu(false)}
                        className="flex items-center gap-3 px-4 py-2.5 text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                      >
                        <span className="material-symbols-outlined text-[20px]">person</span>
                        Hồ sơ của tôi
                      </Link>
                      <Link
                        to="/bookings"
                        onClick={() => setShowUserMenu(false)}
                        className="flex items-center gap-3 px-4 py-2.5 text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                      >
                        <span className="material-symbols-outlined text-[20px]">calendar_month</span>
                        Lịch đặt sân
                      </Link>
                      <div className="border-t border-slate-200 dark:border-gray-700 my-2" />
                      <button
                        onClick={handleLogout}
                        className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                      >
                        <span className="material-symbols-outlined text-[20px]">logout</span>
                        Đăng xuất
                      </button>
                    </div>
                  </>
                )}
              </div>
            ) : (
              <>
                <Link 
                  to="/login"
                  state={{ mode: 'login' }}
                  className="hidden sm:inline-flex items-center justify-center rounded-lg bg-slate-100 dark:bg-slate-800 px-4 py-2 text-sm font-semibold text-slate-900 dark:text-white hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
                >
                  Đăng nhập
                </Link>
                <Link 
                  to="/login"
                  state={{ mode: 'register' }}
                  className="inline-flex items-center justify-center rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-600 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 transition-colors"
                >
                  Đăng ký
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default GuestHeader;
