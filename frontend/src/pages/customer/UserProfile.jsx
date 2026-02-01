import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import useAuthStore from '../../store/useAuthStore';
import userService from '../../services/userService';
import GuestHeader from '../../components/common/GuestHeader';
import ProfileEditModal from '../../components/customer/ProfileEditModal';
import Toast from '../../components/common/Toast';

const UserProfile = () => {
  const navigate = useNavigate();
  const { user, logout, setUser } = useAuthStore();
  const [activeTab, setActiveTab] = useState('profile');
  const [isEditing, setIsEditing] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [toast, setToast] = useState({ show: false, message: '', type: '' });

  const [formData, setFormData] = useState({
    username: '',
    fullName: '',
    email: '',
    phoneNumber: '',
    gender: 'male',
    dateOfBirth: '',
    address: ''
  });

  useEffect(() => {
    if (user) {
      setFormData({
        username: user.username || '',
        fullName: user.fullName || '',
        email: user.email || '',
        phoneNumber: user.phoneNumber || '',
        gender: user.gender || 'male',
        dateOfBirth: user.dateOfBirth || '',
        address: user.address || ''
      });
    }
  }, [user]);

  const showToast = (message, type) => {
    setToast({ show: true, message, type });
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setIsModalOpen(true);
  };

  const handleProfileUpdate = async (profileData) => {
    try {
      const updatedUser = await userService.updateProfile(profileData);
      setUser(updatedUser); // Update user in store
      showToast('Cập nhật thông tin thành công!', 'success');
      setIsModalOpen(false);
      setIsEditing(false);
    } catch (error) {
      showToast('Lỗi khi cập nhật thông tin', 'error');
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const menuItems = [
    { id: 'profile', icon: 'person', label: 'Thông tin cá nhân', badge: null },
    { id: 'security', icon: 'lock', label: 'Bảo mật', badge: null },
    { id: 'points', icon: 'stars', label: 'Điểm tích lũy', badge: '1200' },
    { id: 'payment', icon: 'payments', label: 'Thanh toán', badge: null }
  ];

  return (
    <div className="bg-background-light dark:bg-background-dark min-h-screen flex flex-col">
      <GuestHeader />
      
      <main className="flex-grow w-full max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Breadcrumbs */}
        <nav aria-label="Breadcrumb" className="flex mb-6">
          <ol className="inline-flex items-center space-x-1 md:space-x-3">
            <li className="inline-flex items-center">
              <Link to="/" className="inline-flex items-center text-sm font-medium text-[#616e89] hover:text-primary dark:text-gray-400 dark:hover:text-white">
                <span className="material-symbols-outlined text-[20px] mr-2">home</span>
                Trang chủ
              </Link>
            </li>
            <li>
              <div className="flex items-center">
                <span className="material-symbols-outlined text-gray-400 text-[20px]">chevron_right</span>
                <span className="ml-1 text-sm font-medium text-[#111318] md:ml-2 dark:text-white">Hồ sơ của tôi</span>
              </div>
            </li>
          </ol>
        </nav>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Sidebar */}
          <aside className="lg:col-span-3">
            <div className="bg-white dark:bg-surface-dark rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden sticky top-24">
              {/* User Brief Info */}
              <div className="p-6 border-b border-gray-100 dark:border-gray-700 flex flex-col items-center text-center">
                <div className="relative mb-3">
                  <div className="bg-center bg-no-repeat bg-cover rounded-full size-20 border-4 border-white dark:border-gray-800 shadow-md bg-primary/10 flex items-center justify-center text-primary text-3xl font-bold">
                    {user?.fullName?.charAt(0) || 'U'}
                  </div>
                  <div className="absolute bottom-0 right-0 bg-green-500 rounded-full p-1 border-2 border-white dark:border-gray-800">
                    <span className="material-symbols-outlined text-white text-[12px] font-bold block">check</span>
                  </div>
                </div>
                <h3 className="text-lg font-bold text-[#111318] dark:text-white">{user?.fullName || 'User'}</h3>
                <div className="flex items-center gap-1 mt-1 text-sm text-yellow-600 bg-yellow-50 px-2 py-0.5 rounded-full dark:bg-yellow-900/30 dark:text-yellow-400">
                  <span className="material-symbols-outlined text-[16px]">emoji_events</span>
                  <span>Hạng Vàng</span>
                </div>
              </div>

              {/* Navigation Menu */}
              <nav className="flex flex-col p-3 gap-1">
                {menuItems.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => setActiveTab(item.id)}
                    className={`flex items-center gap-3 px-4 py-3 rounded-lg font-medium transition-colors ${
                      activeTab === item.id
                        ? 'bg-primary/10 text-primary'
                        : 'text-[#616e89] hover:bg-gray-50 hover:text-[#111318] dark:text-gray-400 dark:hover:bg-gray-700/50 dark:hover:text-white'
                    }`}
                  >
                    <span className={`material-symbols-outlined text-[22px] ${activeTab === item.id ? 'fill' : ''}`}>
                      {item.icon}
                    </span>
                    {item.label}
                    {item.badge && (
                      <span className="ml-auto bg-primary text-white text-xs font-bold px-2 py-0.5 rounded-full">
                        {item.badge}
                      </span>
                    )}
                  </button>
                ))}
                <button
                  onClick={handleLogout}
                  className="flex items-center gap-3 px-4 py-3 rounded-lg text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 mt-2 border-t border-gray-100 dark:border-gray-700 transition-colors"
                >
                  <span className="material-symbols-outlined text-[22px]">logout</span>
                  Đăng xuất
                </button>
              </nav>
            </div>
          </aside>

          {/* Main Content Form */}
          <div className="lg:col-span-9">
            <div className="bg-white dark:bg-surface-dark rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-6 sm:p-8">
              {/* Header */}
              <div className="border-b border-gray-100 dark:border-gray-700 pb-6 mb-8">
                <h1 className="text-2xl font-bold text-[#111318] dark:text-white mb-2">Hồ sơ của tôi</h1>
                <p className="text-[#616e89] dark:text-gray-400 text-sm">
                  Quản lý thông tin hồ sơ để bảo mật tài khoản
                </p>
              </div>

              <form onSubmit={handleSubmit} className="flex flex-col-reverse lg:flex-row gap-10">
                {/* Form Fields */}
                <div className="flex-1 flex flex-col gap-6">
                  {/* Username */}
                  <div className="flex flex-col gap-2">
                    <label className="text-sm font-medium text-[#616e89] dark:text-gray-300">
                      Tên đăng nhập
                    </label>
                    <div className="relative">
                      <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-[20px]">
                        account_circle
                      </span>
                      <input
                        className="w-full pl-10 pr-4 py-2.5 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-lg text-[#111318] dark:text-white focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all placeholder-gray-400"
                        placeholder="Nhập tên đăng nhập"
                        type="text"
                        value={formData.username}
                        onChange={(e) => handleInputChange('username', e.target.value)}
                        disabled={!isEditing}
                      />
                    </div>
                  </div>

                  {/* Full Name */}
                  <div className="flex flex-col gap-2">
                    <label className="text-sm font-medium text-[#616e89] dark:text-gray-300">
                      Họ và tên
                    </label>
                    <input
                      className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-lg text-[#111318] dark:text-white focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all"
                      placeholder="Nhập họ và tên"
                      type="text"
                      value={formData.fullName}
                      onChange={(e) => handleInputChange('fullName', e.target.value)}
                      disabled={!isEditing}
                    />
                  </div>

                  {/* Email (Verified) */}
                  <div className="flex flex-col gap-2">
                    <label className="text-sm font-medium text-[#616e89] dark:text-gray-300">Email</label>
                    <div className="flex items-center gap-3">
                      <div className="relative flex-1 opacity-75">
                        <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-[20px]">
                          mail
                        </span>
                        <input
                          className="w-full pl-10 pr-4 py-2.5 bg-gray-100 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg text-[#616e89] dark:text-gray-400 cursor-not-allowed"
                          disabled
                          type="email"
                          value={formData.email}
                        />
                      </div>
                      <span className="flex items-center gap-1 text-xs font-medium text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/30 px-2 py-1 rounded">
                        <span className="material-symbols-outlined text-[16px]">verified</span>
                        Đã xác thực
                      </span>
                      <button type="button" className="text-sm font-medium text-primary hover:underline whitespace-nowrap">
                        Thay đổi
                      </button>
                    </div>
                  </div>

                  {/* Phone (Verified) */}
                  <div className="flex flex-col gap-2">
                    <label className="text-sm font-medium text-[#616e89] dark:text-gray-300">Số điện thoại</label>
                    <div className="flex items-center gap-3">
                      <div className="relative flex-1 opacity-75">
                        <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-[20px]">
                          call
                        </span>
                        <input
                          className="w-full pl-10 pr-4 py-2.5 bg-gray-100 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg text-[#616e89] dark:text-gray-400 cursor-not-allowed"
                          disabled
                          type="tel"
                          value={formData.phoneNumber}
                        />
                      </div>
                      <span className="flex items-center gap-1 text-xs font-medium text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/30 px-2 py-1 rounded">
                        <span className="material-symbols-outlined text-[16px]">verified</span>
                        Đã xác thực
                      </span>
                      <button type="button" className="text-sm font-medium text-primary hover:underline whitespace-nowrap">
                        Thay đổi
                      </button>
                    </div>
                  </div>

                  {/* Gender */}
                  <div className="flex flex-col gap-2">
                    <label className="text-sm font-medium text-[#616e89] dark:text-gray-300">Giới tính</label>
                    <div className="flex gap-6 mt-1">
                      {['male', 'female', 'other'].map((gender) => (
                        <label key={gender} className="flex items-center gap-2 cursor-pointer group">
                          <input
                            className="peer sr-only"
                            name="gender"
                            type="radio"
                            value={gender}
                            checked={formData.gender === gender}
                            onChange={(e) => handleInputChange('gender', e.target.value)}
                            disabled={!isEditing}
                          />
                          <div className="size-4 rounded-full border border-gray-300 peer-checked:border-primary peer-checked:border-[5px] transition-all"></div>
                          <span className="text-[#111318] dark:text-white group-hover:text-primary transition-colors">
                            {gender === 'male' ? 'Nam' : gender === 'female' ? 'Nữ' : 'Khác'}
                          </span>
                        </label>
                      ))}
                    </div>
                  </div>

                  {/* DOB & Address Group */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="flex flex-col gap-2">
                      <label className="text-sm font-medium text-[#616e89] dark:text-gray-300">Ngày sinh</label>
                      <div className="relative">
                        <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-[20px]">
                          calendar_today
                        </span>
                        <input
                          className="w-full pl-10 pr-4 py-2.5 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-lg text-[#111318] dark:text-white focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all"
                          type="date"
                          value={formData.dateOfBirth}
                          onChange={(e) => handleInputChange('dateOfBirth', e.target.value)}
                          disabled={!isEditing}
                        />
                      </div>
                    </div>

                    <div className="flex flex-col gap-2">
                      <label className="text-sm font-medium text-[#616e89] dark:text-gray-300">Địa chỉ</label>
                      <div className="relative">
                        <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-[20px]">
                          location_on
                        </span>
                        <input
                          className="w-full pl-10 pr-4 py-2.5 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-lg text-[#111318] dark:text-white focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all"
                          type="text"
                          value={formData.address}
                          onChange={(e) => handleInputChange('address', e.target.value)}
                          disabled={!isEditing}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Buttons */}
                  <div className="flex items-center gap-4 mt-4 pt-4 border-t border-gray-100 dark:border-gray-700">
                    {isEditing ? (
                      <>
                        <button
                          className="bg-primary hover:bg-primary-hover text-white px-8 py-2.5 rounded-lg font-medium transition-all shadow-md hover:shadow-lg active:scale-95"
                          type="submit"
                        >
                          Cập nhật
                        </button>
                        <button
                          className="bg-white border border-gray-300 hover:bg-gray-50 text-[#616e89] px-8 py-2.5 rounded-lg font-medium transition-all dark:bg-gray-800 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700"
                          type="button"
                          onClick={() => setIsEditing(false)}
                        >
                          Hủy
                        </button>
                      </>
                    ) : (
                      <button
                        className="bg-primary hover:bg-primary-hover text-white px-8 py-2.5 rounded-lg font-medium transition-all shadow-md hover:shadow-lg active:scale-95"
                        type="button"
                        onClick={() => setIsEditing(true)}
                      >
                        Chỉnh sửa
                      </button>
                    )}
                  </div>
                </div>

                {/* Avatar Upload Section */}
                <div className="w-full lg:w-72 flex flex-col items-center gap-6 lg:border-l lg:border-gray-100 lg:dark:border-gray-700 lg:pl-10">
                  <div className="relative group">
                    <div className="size-36 rounded-full bg-cover bg-center border-4 border-gray-100 dark:border-gray-700 shadow-sm overflow-hidden bg-primary/10 flex items-center justify-center text-primary text-6xl font-bold">
                      {user?.fullName?.charAt(0) || 'U'}
                      {/* Overlay on hover */}
                      <div className="absolute inset-0 bg-black/40 hidden group-hover:flex items-center justify-center transition-all cursor-pointer">
                        <span className="material-symbols-outlined text-white">edit</span>
                      </div>
                    </div>
                    <button
                      className="absolute bottom-1 right-1 bg-white dark:bg-surface-dark border border-gray-200 dark:border-gray-600 p-2 rounded-full shadow-md text-[#616e89] hover:text-primary transition-colors"
                      title="Chọn ảnh"
                      type="button"
                    >
                      <span className="material-symbols-outlined text-[20px]">photo_camera</span>
                    </button>
                  </div>
                  <div className="text-center">
                    <button
                      className="text-sm font-medium text-primary border border-primary/20 bg-primary/5 hover:bg-primary/10 px-4 py-2 rounded-lg transition-colors mb-3 w-full"
                      type="button"
                    >
                      Chọn ảnh
                    </button>
                    <p className="text-xs text-[#616e89] dark:text-gray-400">
                      Dụng lượng file tối đa 3 MB<br />
                      Định dạng: .JPEG, .PNG
                    </p>
                  </div>
                </div>
              </form>
            </div>
          </div>
        </div>
      </main>

      {/* Profile Edit Modal */}
      {isModalOpen && (
        <ProfileEditModal
          user={user}
          onClose={() => setIsModalOpen(false)}
          onSubmit={handleProfileUpdate}
        />
      )}

      {/* Toast */}
      {toast.show && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast({ show: false, message: '', type: '' })}
        />
      )}
    </div>
  );
};

export default UserProfile;
