import { useState } from 'react';
import { Link } from 'react-router-dom';
import StatCard from '../../components/common/StatCard';
import PageHeader from '../../components/common/PageHeader';

const Dashboard = () => {
  const [dateRange] = useState('01/10/2023 - 31/10/2023');

  const stats = [
    {
      title: 'Doanh thu tháng này',
      value: '125.000.000đ',
      change: '+12.5%',
      trend: 'up',
      icon: 'payments',
      iconBg: 'bg-green-50',
      iconColor: 'text-green-600'
    },
    {
      title: 'Lượt đặt sân',
      value: '342',
      change: '+5.2%',
      trend: 'up',
      icon: 'event',
      iconBg: 'bg-blue-50',
      iconColor: 'text-blue-600'
    },
    {
      title: 'Khách hàng mới',
      value: '45',
      change: '+2.4%',
      trend: 'up',
      icon: 'person_add',
      iconBg: 'bg-purple-50',
      iconColor: 'text-purple-600'
    },
    {
      title: 'Tỷ lệ lấp đầy',
      value: '85%',
      change: '-1.1%',
      trend: 'down',
      icon: 'analytics',
      iconBg: 'bg-orange-50',
      iconColor: 'text-orange-600'
    }
  ];

  const topCourts = [
    { name: 'Sân 01 - VIP', bookings: 85, percentage: 85, color: 'bg-blue-600' },
    { name: 'Sân 03 - Thường', bookings: 62, percentage: 62, color: 'bg-blue-500' },
    { name: 'Sân 02 - Thường', bookings: 54, percentage: 54, color: 'bg-blue-400' },
    { name: 'Sân 05 - Đôi', bookings: 41, percentage: 41, color: 'bg-blue-300' }
  ];

  const recentBookings = [
    { id: '#BK-9023', customer: 'Lê Minh Tú', avatar: 'L', court: 'Sân 01', time: '18:00 - 19:00', status: 'paid', statusText: 'Đã thanh toán' },
    { id: '#BK-9022', customer: 'Phạm Thu Hương', avatar: 'P', court: 'Sân 03', time: '19:30 - 20:30', status: 'pending', statusText: 'Chờ xác nhận' },
    { id: '#BK-9021', customer: 'Trần Văn Nam', avatar: 'T', court: 'Sân 02', time: '17:00 - 18:00', status: 'paid', statusText: 'Đã thanh toán' },
    { id: '#BK-9020', customer: 'Nguyễn Thị Bích', avatar: 'N', court: 'Sân 01', time: '09:00 - 11:00', status: 'cancelled', statusText: 'Đã hủy' }
  ];

  const getStatusColor = (status) => {
    switch (status) {
      case 'paid':
        return 'bg-green-50 text-green-700 border-green-200';
      case 'pending':
        return 'bg-amber-50 text-amber-700 border-amber-200';
      case 'cancelled':
        return 'bg-red-50 text-red-700 border-red-200';
      default:
        return 'bg-gray-50 text-gray-700 border-gray-200';
    }
  };

  return (
    <div className="p-6">
      <div className="max-w-[1400px] mx-auto">
        <PageHeader
          title="Dashboard"
          subtitle="Chào mừng quay trở lại, đây là tình hình kinh doanh hôm nay"
          actions={
            <>
              <button className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
                <span className="material-symbols-outlined text-xl">calendar_today</span>
                <span className="text-sm font-medium">{dateRange}</span>
              </button>
              <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                <span className="material-symbols-outlined text-xl">download</span>
                <span className="text-sm font-medium">Xuất báo cáo</span>
              </button>
            </>
          }
        />

        <div className="mb-6 bg-blue-50 border border-blue-200 rounded-xl p-4 flex items-center gap-3">
          <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
            <span className="material-symbols-outlined text-blue-600">pending_actions</span>
          </div>
          <div className="flex-1">
            <p className="text-sm font-medium text-blue-900">
              Cần xử lý: <span className="font-bold">5 thanh toán chờ xác nhận</span> từ khách hàng chuyển khoản
            </p>
          </div>
          <button className="text-sm text-blue-600 font-semibold hover:text-blue-700">Xem ngay</button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
          {stats.map((stat, index) => (
            <StatCard key={index} {...stat} />
          ))}
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-bold text-gray-900">Biểu đồ doanh thu (30 ngày)</h3>
            <select className="px-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
              <option>Tháng này</option>
              <option>Tháng trước</option>
              <option>Q3 2023</option>
            </select>
          </div>
          
          <div className="relative w-full h-64 flex items-end gap-2 pb-6 pt-10 border-b border-l border-gray-200">
            <div className="absolute -left-12 top-0 bottom-6 flex flex-col justify-between text-xs text-gray-500 text-right w-10">
              <span>10M</span>
              <span>7.5M</span>
              <span>5M</span>
              <span>2.5M</span>
              <span>0</span>
            </div>
            
            <div className="flex-1 flex items-end justify-between h-full pl-2">
              {[40, 65, 30, 80, 95, 50, 70, 45, 60, 85].map((height, index) => (
                <div 
                  key={index}
                  className={`group relative w-full mx-1 rounded-t-lg transition-all cursor-pointer ${
                    index === 4 ? 'bg-blue-600 hover:bg-blue-700 shadow-lg' : 'bg-blue-100 hover:bg-blue-200'
                  }`}
                  style={{ height: `${height}%` }}
                >
                  <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-gray-900 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                    {(height * 100000).toLocaleString()}đ
                  </div>
                </div>
              ))}
            </div>
          </div>
          
          <div className="flex justify-between text-xs text-gray-500 mt-2 px-2">
            <span>01/10</span>
            <span>05/10</span>
            <span>10/10</span>
            <span>15/10</span>
            <span>20/10</span>
            <span>25/10</span>
            <span>30/10</span>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-6">Sân được đặt nhiều nhất</h3>
            <div className="space-y-5">
              {topCourts.map((court, index) => (
                <div key={index}>
                  <div className="flex justify-between text-sm mb-2">
                    <span className="font-medium text-gray-900">{court.name}</span>
                    <span className={`font-bold ${index === 0 ? 'text-blue-600' : 'text-gray-600'}`}>
                      {court.bookings} lượt
                    </span>
                  </div>
                  <div className="w-full bg-gray-100 rounded-full h-2">
                    <div className={`${court.color} h-2 rounded-full transition-all`} style={{ width: `${court.percentage}%` }}></div>
                  </div>
                </div>
              ))}
            </div>
            <button className="mt-6 w-full py-2.5 text-sm font-medium text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors">
              Xem chi tiết báo cáo
            </button>
          </div>

          <div className="lg:col-span-2 bg-white rounded-xl border border-gray-200 overflow-hidden">
            <div className="p-6 border-b border-gray-200 flex items-center justify-between">
              <h3 className="text-lg font-bold text-gray-900">Booking gần đây</h3>
              <Link to="/admin/bookings" className="text-sm font-medium text-blue-600 hover:text-blue-700">
                Xem tất cả
              </Link>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase">ID</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Khách hàng</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Sân</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Thời gian</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Trạng thái</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {recentBookings.map((booking, index) => (
                    <tr key={index} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 text-sm font-medium text-gray-900">{booking.id}</td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
                            <span className="text-sm font-semibold text-blue-600">{booking.avatar}</span>
                          </div>
                          <span className="text-sm text-gray-900">{booking.customer}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">{booking.court}</td>
                      <td className="px-6 py-4 text-sm text-gray-600">{booking.time}</td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${getStatusColor(booking.status)}`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${
                            booking.status === 'paid' ? 'bg-green-600' :
                            booking.status === 'pending' ? 'bg-amber-600' : 'bg-red-600'
                          }`}></span>
                          {booking.statusText}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
