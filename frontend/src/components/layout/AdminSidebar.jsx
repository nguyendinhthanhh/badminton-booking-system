import { Link, useLocation } from 'react-router-dom';

const AdminSidebar = () => {
  const location = useLocation();

  const menuItems = [
    { path: '/admin', icon: 'dashboard', label: 'Dashboard', exact: true },
    { path: '/admin/courts', icon: 'stadium', label: 'Courts' },
    { path: '/admin/time-slots', icon: 'schedule', label: 'Time Slots' },
    { path: '/admin/prices', icon: 'payments', label: 'Prices' },
    { path: '/admin/bookings', icon: 'calendar_month', label: 'Bookings' },
    { path: '/admin/users', icon: 'group', label: 'Users' },
    { path: '/admin/reports', icon: 'description', label: 'Reports' }
  ];

  const isActive = (path, exact = false) => {
    if (exact) {
      return location.pathname === path;
    }
    return location.pathname.startsWith(path);
  };

  return (
    <aside className="flex w-64 flex-col bg-white dark:bg-[#1a3322] border-r border-slate-200 dark:border-slate-800 transition-colors duration-200 hidden md:flex">
      {/* Logo */}
      <div className="flex items-center gap-3 px-6 py-6 border-b border-slate-100 dark:border-slate-800/50">
        <div className="flex items-center justify-center rounded-lg bg-[#13ec49]/20 p-2 text-[#0ea332] dark:text-[#13ec49]">
          <span className="material-symbols-outlined">sports_tennis</span>
        </div>
        <div className="flex flex-col">
          <h1 className="text-slate-900 dark:text-slate-100 text-lg font-bold leading-none tracking-tight">
            CourtManager
          </h1>
          <span className="text-slate-500 dark:text-slate-400 text-xs font-medium mt-1">
            Admin Console
          </span>
        </div>
      </div>

      {/* Menu Items */}
      <div className="flex flex-1 flex-col overflow-y-auto px-3 py-6 gap-1">
        {menuItems.map((item) => (
          <Link
            key={item.path}
            to={item.path}
            className={`flex items-center gap-3 px-3 py-2.5 rounded-lg font-medium transition-colors ${
              isActive(item.path, item.exact)
                ? 'bg-[#13ec49]/15 text-[#0ea332] dark:text-[#13ec49]'
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/50 hover:text-slate-900 dark:hover:text-slate-200'
            }`}
          >
            <span className="material-symbols-outlined">{item.icon}</span>
            <span>{item.label}</span>
          </Link>
        ))}
      </div>

      {/* Logout */}
      <div className="p-4 border-t border-slate-100 dark:border-slate-800/50">
        <button className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-slate-600 dark:text-slate-400 hover:bg-red-50 dark:hover:bg-red-900/20 hover:text-red-600 dark:hover:text-red-400 transition-colors group w-full">
          <span className="material-symbols-outlined">logout</span>
          <span>Logout</span>
        </button>
      </div>
    </aside>
  );
};

export default AdminSidebar;
