const Dashboard = () => {
  // Mock data
  const stats = [
    {
      label: 'Total Bookings',
      value: '1,240',
      change: '+12%',
      trend: 'up',
      icon: 'calendar_month'
    },
    {
      label: 'Revenue',
      value: '$12,450',
      change: '+5%',
      trend: 'up',
      icon: 'attach_money'
    },
    {
      label: 'Active Users',
      value: '350',
      change: '0%',
      trend: 'flat',
      icon: 'group'
    },
    {
      label: 'Occupancy Rate',
      value: '85%',
      change: '+8%',
      trend: 'up',
      icon: 'stadium',
      progress: 85
    }
  ];

  const recentBookings = [
    {
      id: '#BK-001',
      customer: { name: 'John Doe', type: 'Premium Member', avatar: 'JD' },
      court: 'Court A - Synthetic',
      time: '18:00 - 19:00',
      status: 'paid'
    },
    {
      id: '#BK-002',
      customer: { name: 'Jane Smith', type: 'Guest', avatar: 'JS' },
      court: 'Court B - Wooden',
      time: '19:00 - 20:00',
      status: 'pending'
    },
    {
      id: '#BK-003',
      customer: { name: 'Robert Brown', type: 'Member', avatar: 'RB' },
      court: 'Court A - Synthetic',
      time: '10:00 - 11:00',
      status: 'paid'
    },
    {
      id: '#BK-004',
      customer: { name: 'Alice Johnson', type: 'New', avatar: 'AJ' },
      court: 'Court C - Synthetic',
      time: '14:00 - 15:00',
      status: 'cancelled'
    },
    {
      id: '#BK-005',
      customer: { name: 'Michael Lee', type: 'Pro', avatar: 'ML' },
      court: 'Court B - Wooden',
      time: '20:00 - 21:00',
      status: 'paid'
    }
  ];

  const getStatusColor = (status) => {
    switch (status) {
      case 'paid':
        return 'bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-300';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/40 dark:text-yellow-300';
      case 'cancelled':
        return 'bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-300';
      default:
        return 'bg-slate-100 text-slate-800 dark:bg-slate-700 dark:text-slate-300';
    }
  };

  const getTrendColor = (trend) => {
    switch (trend) {
      case 'up':
        return 'text-green-600 bg-green-100 dark:bg-green-900/30 dark:text-green-400';
      case 'down':
        return 'text-red-600 bg-red-100 dark:bg-red-900/30 dark:text-red-400';
      default:
        return 'text-slate-600 bg-slate-100 dark:bg-slate-700 dark:text-slate-300';
    }
  };

  const getTrendIcon = (trend) => {
    switch (trend) {
      case 'up':
        return 'trending_up';
      case 'down':
        return 'trending_down';
      default:
        return 'trending_flat';
    }
  };

  return (
    <div className="flex flex-col gap-8">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
            Dashboard Overview
          </h2>
          <p className="text-slate-500 dark:text-slate-400 mt-1">
            Welcome back! Here's what's happening at your courts today.
          </p>
        </div>
        <div className="flex gap-3">
          <button className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-[#1a3322] border border-slate-200 dark:border-slate-700 rounded-lg text-sm font-medium hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 transition-colors">
            <span className="material-symbols-outlined text-[18px]">download</span>
            Export
          </button>
          <button className="flex items-center gap-2 px-4 py-2 bg-[#13ec49] hover:bg-[#0fb839] text-slate-900 font-bold rounded-lg text-sm transition-colors shadow-sm shadow-[#13ec49]/20">
            <span className="material-symbols-outlined text-[20px]">add</span>
            New Booking
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
        {stats.map((stat, index) => (
          <div
            key={index}
            className="bg-white dark:bg-[#1a3322] p-6 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm relative overflow-hidden group"
          >
            <div className="absolute right-0 top-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
              <span className="material-symbols-outlined text-6xl text-[#13ec49]">
                {stat.icon}
              </span>
            </div>
            <div className="flex flex-col gap-1 relative z-10">
              <p className="text-sm font-medium text-slate-500 dark:text-slate-400">
                {stat.label}
              </p>
              <div className="flex items-baseline gap-2">
                <h3 className="text-3xl font-bold text-slate-900 dark:text-white">
                  {stat.value}
                </h3>
                <span className={`flex items-center text-xs font-bold px-1.5 py-0.5 rounded-full ${getTrendColor(stat.trend)}`}>
                  <span className="material-symbols-outlined text-[14px] mr-0.5">
                    {getTrendIcon(stat.trend)}
                  </span>
                  {stat.change}
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-2">vs. last month</p>
              {stat.progress !== undefined && (
                <div className="w-full bg-slate-100 dark:bg-slate-700 h-1.5 rounded-full mt-3 overflow-hidden">
                  <div
                    className="bg-[#13ec49] h-full rounded-full transition-all duration-500"
                    style={{ width: `${stat.progress}%` }}
                  ></div>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Recent Bookings */}
      <div className="flex flex-col gap-4">
        <div className="flex items-center justify-between px-1">
          <h3 className="text-lg font-bold text-slate-900 dark:text-white">
            Recent Bookings
          </h3>
          <a href="#" className="text-sm font-medium text-[#0ea332] dark:text-[#13ec49] hover:underline">
            View All
          </a>
        </div>

        <div className="bg-white dark:bg-[#1a3322] border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="bg-slate-50 dark:bg-slate-800/50 text-slate-500 dark:text-slate-400 border-b border-slate-200 dark:border-slate-800">
                <tr>
                  <th className="px-6 py-4 font-semibold whitespace-nowrap">Booking ID</th>
                  <th className="px-6 py-4 font-semibold whitespace-nowrap">Customer</th>
                  <th className="px-6 py-4 font-semibold whitespace-nowrap">Court</th>
                  <th className="px-6 py-4 font-semibold whitespace-nowrap">Time</th>
                  <th className="px-6 py-4 font-semibold whitespace-nowrap">Status</th>
                  <th className="px-6 py-4 font-semibold text-right whitespace-nowrap">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {recentBookings.map((booking) => (
                  <tr
                    key={booking.id}
                    className="group hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors"
                  >
                    <td className="px-6 py-4 font-medium text-slate-900 dark:text-white">
                      {booking.id}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#13ec49] to-[#0ea332] flex items-center justify-center text-white font-bold text-xs">
                          {booking.customer.avatar}
                        </div>
                        <div className="flex flex-col">
                          <span className="text-slate-900 dark:text-white font-medium">
                            {booking.customer.name}
                          </span>
                          <span className="text-xs text-slate-500">
                            {booking.customer.type}
                          </span>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-slate-600 dark:text-slate-300">
                      {booking.court}
                    </td>
                    <td className="px-6 py-4 text-slate-600 dark:text-slate-300">
                      <div className="flex items-center gap-1.5">
                        <span className="material-symbols-outlined text-[16px] text-slate-400">
                          schedule
                        </span>
                        {booking.time}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(booking.status)}`}>
                        {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button className="text-slate-400 hover:text-[#13ec49] transition-colors p-1">
                        <span className="material-symbols-outlined text-[20px]">edit</span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Table Footer */}
          <div className="bg-white dark:bg-[#1a3322] px-6 py-4 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between">
            <span className="text-sm text-slate-500 dark:text-slate-400">
              Showing 5 of 50 entries
            </span>
            <div className="flex gap-2">
              <button
                disabled
                className="px-3 py-1 rounded border border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 text-sm disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Previous
              </button>
              <button className="px-3 py-1 rounded border border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 text-sm">
                Next
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
