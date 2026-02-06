import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import useAuthStore from '../../store/useAuthStore';
import userService from '../../services/userService';
import passwordService from '../../services/passwordService';

import Toast from '../../components/common/Toast';

const UserProfile = () => {
  const navigate = useNavigate();
  const { user, logout, setUser } = useAuthStore();
  const [activeTab, setActiveTab] = useState('profile');
  const [isEditing, setIsEditing] = useState(false);
  const [toast, setToast] = useState({ show: false, message: '', type: '' });

  const [formData, setFormData] = useState({
    username: '',
    fullName: '',
    email: '',
    phoneNumber: '',
    gender: 'MALE',
    dateOfBirth: '',
    avatar: ''
  });

  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);
  const [avatarPreview, setAvatarPreview] = useState(null);
  const [isEditingAvatar, setIsEditingAvatar] = useState(false);

  // Password change state
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [passwordErrors, setPasswordErrors] = useState({});
  const [changingPassword, setChangingPassword] = useState(false);

  useEffect(() => {
    if (user) {
      setFormData({
        username: user.username || '',
        fullName: user.fullName || '',
        email: user.email || '',
        phoneNumber: user.phoneNumber || '',
        gender: user.gender || 'MALE',
        dateOfBirth: user.dateOfBirth || '',
        avatar: user.avatar || ''
      });
      setAvatarPreview(user.avatar || null);
    }
  }, [user]);

  const validate = () => {
    const newErrors = {};

    if (!formData.fullName || formData.fullName.trim().length < 2) {
      newErrors.fullName = 'Họ tên phải có ít nhất 2 ký tự';
    }

    if (!formData.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Email không hợp lệ';
    }

    if (!formData.phoneNumber || !/^[0-9]{10,11}$/.test(formData.phoneNumber)) {
      newErrors.phoneNumber = 'Số điện thoại phải có 10-11 chữ số';
    }

    if (formData.dateOfBirth) {
      const birthDate = new Date(formData.dateOfBirth);
      const today = new Date();
      const age = today.getFullYear() - birthDate.getFullYear();
      if (age < 13 || age > 120) {
        newErrors.dateOfBirth = 'Tuổi phải từ 13-120';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const showToast = (message, type) => {
    setToast({ show: true, message, type });
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error when user types
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validate()) {
      showToast('Vui lòng kiểm tra lại thông tin', 'error');
      return;
    }

    setSaving(true);
    try {
      const profileData = {
        fullName: formData.fullName,
        email: formData.email,
        phoneNumber: formData.phoneNumber,
        gender: formData.gender,
        dateOfBirth: formData.dateOfBirth,
        avatar: formData.avatar
      };

      const updatedUser = await userService.updateProfile(profileData);
      setUser(updatedUser);
      showToast('Cập nhật thông tin thành công!', 'success');
      setIsEditing(false);
    } catch (error) {
      console.error('Update profile error:', error);
      showToast(error.response?.data?.message || 'Lỗi khi cập nhật thông tin', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    // Reset form to original user data
    if (user) {
      setFormData({
        username: user.username || '',
        fullName: user.fullName || '',
        email: user.email || '',
        phoneNumber: user.phoneNumber || '',
        gender: user.gender || 'MALE',
        dateOfBirth: user.dateOfBirth || '',
        avatar: user.avatar || ''
      });
      setAvatarPreview(user.avatar || null);
    }
    setErrors({});
    setIsEditing(false);
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const validatePassword = () => {
    const newErrors = {};

    if (!passwordData.currentPassword) {
      newErrors.currentPassword = 'Vui lòng nhập mật khẩu hiện tại';
    }

    if (!passwordData.newPassword) {
      newErrors.newPassword = 'Vui lòng nhập mật khẩu mới';
    } else if (passwordData.newPassword.length < 6) {
      newErrors.newPassword = 'Mật khẩu mới phải có ít nhất 6 ký tự';
    }

    if (!passwordData.confirmPassword) {
      newErrors.confirmPassword = 'Vui lòng xác nhận mật khẩu mới';
    } else if (passwordData.newPassword !== passwordData.confirmPassword) {
      newErrors.confirmPassword = 'Mật khẩu xác nhận không khớp';
    }

    if (passwordData.currentPassword && passwordData.newPassword &&
      passwordData.currentPassword === passwordData.newPassword) {
      newErrors.newPassword = 'Mật khẩu mới phải khác mật khẩu hiện tại';
    }

    setPasswordErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();

    if (!validatePassword()) {
      showToast('Vui lòng kiểm tra lại thông tin', 'error');
      return;
    }

    setChangingPassword(true);
    try {
      await passwordService.changePassword({
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword,
        confirmPassword: passwordData.confirmPassword
      });

      showToast('Đổi mật khẩu thành công!', 'success');

      // Reset form
      setPasswordData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      });
      setPasswordErrors({});
    } catch (error) {
      console.error('Change password error:', error);
      showToast(error.response?.data?.message || 'Lỗi khi đổi mật khẩu', 'error');
    } finally {
      setChangingPassword(false);
    }
  };

  const handlePasswordInputChange = (field, value) => {
    setPasswordData(prev => ({ ...prev, [field]: value }));
    // Clear error when user types
    if (passwordErrors[field]) {
      setPasswordErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const menuItems = [
    { id: 'profile', icon: 'person', label: 'Thông tin cá nhân', badge: null },
    { id: 'security', icon: 'lock', label: 'Bảo mật', badge: null },
    { id: 'points', icon: 'stars', label: 'Điểm tích lũy', badge: '1200' },
    { id: 'payment', icon: 'payments', label: 'Thanh toán', badge: null }
  ];

  return (
    <div className="bg-background-light dark:bg-background-dark min-h-screen flex flex-col">


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
              {/* User Brief Info with Avatar */}
              <div className="p-6 border-b border-gray-100 dark:border-gray-700 flex flex-col items-center text-center">
                {/* Avatar with Edit */}
                <div className="relative mb-4">
                  {(avatarPreview || user?.avatar) ? (
                    <img
                      src={avatarPreview || user?.avatar}
                      alt="Avatar"
                      className="size-24 rounded-full object-cover border-4 border-white dark:border-gray-800 shadow-lg"
                      onError={(e) => {
                        e.target.onerror = null; // Prevent infinite loop
                        e.target.style.display = 'none';
                        const fallback = e.target.nextElementSibling;
                        if (fallback) fallback.style.display = 'flex';
                      }}
                    />
                  ) : null}
                  <div
                    className="size-24 rounded-full border-4 border-white dark:border-gray-800 shadow-lg overflow-hidden bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center text-primary text-4xl font-bold"
                    style={{ display: (avatarPreview || user?.avatar) ? 'none' : 'flex' }}
                  >
                    {user?.fullName?.charAt(0)?.toUpperCase() || user?.username?.charAt(0)?.toUpperCase() || 'U'}
                  </div>

                  {/* Edit Avatar Button */}
                  <button
                    type="button"
                    onClick={() => setIsEditingAvatar(!isEditingAvatar)}
                    className="absolute bottom-0 right-0 bg-primary text-white p-1.5 rounded-full shadow-md hover:bg-primary-hover transition-all hover:scale-110"
                    title={isEditingAvatar ? 'Đóng' : 'Chỉnh sửa ảnh'}
                  >
                    <span className="material-symbols-outlined text-[14px]">
                      {isEditingAvatar ? 'close' : 'edit'}
                    </span>
                  </button>
                </div>

                {/* Avatar URL Input - Only show when editing */}
                {isEditingAvatar && (
                  <div className="w-full mb-4 animate-fadeIn">
                    <div className="flex gap-2">
                      <input
                        type="url"
                        placeholder="https://example.com/avatar.jpg"
                        value={formData.avatar}
                        onChange={(e) => {
                          handleInputChange('avatar', e.target.value);
                          setAvatarPreview(e.target.value);
                        }}
                        className="flex-1 px-3 py-2 rounded-lg text-xs text-[#111318] dark:text-white focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600"
                      />
                      {formData.avatar && (
                        <button
                          type="button"
                          onClick={() => {
                            handleInputChange('avatar', '');
                            setAvatarPreview(null);
                          }}
                          className="px-2 py-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors"
                          title="Xóa"
                        >
                          <span className="material-symbols-outlined text-[18px]">delete</span>
                        </button>
                      )}
                    </div>
                    <p className="text-xs text-[#616e89] dark:text-gray-400 mt-2">
                      Nhập URL ảnh
                    </p>

                    {/* Save Avatar Button */}
                    <button
                      type="button"
                      onClick={async () => {
                        if (!formData.avatar) {
                          showToast('Vui lòng nhập link ảnh', 'error');
                          return;
                        }

                        setSaving(true);
                        try {
                          const profileData = {
                            fullName: formData.fullName,
                            email: formData.email,
                            phoneNumber: formData.phoneNumber,
                            gender: formData.gender,
                            dateOfBirth: formData.dateOfBirth,
                            avatar: formData.avatar
                          };

                          const updatedUser = await userService.updateProfile(profileData);
                          setUser(updatedUser);
                          showToast('Cập nhật ảnh thành công!', 'success');
                          setIsEditingAvatar(false);
                        } catch (error) {
                          console.error('Update avatar error:', error);
                          showToast(error.response?.data?.message || 'Lỗi khi cập nhật ảnh', 'error');
                        } finally {
                          setSaving(false);
                        }
                      }}
                      disabled={saving}
                      className="w-full mt-2 px-3 py-2 bg-primary hover:bg-primary-hover text-white rounded-lg text-xs font-medium transition-all shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-1"
                    >
                      {saving ? (
                        <>
                          <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-white"></div>
                          Đang lưu...
                        </>
                      ) : (
                        <>
                          <span className="material-symbols-outlined text-[16px]">check</span>
                          Lưu ảnh
                        </>
                      )}
                    </button>
                  </div>
                )}

                <h3 className="text-lg font-bold text-[#111318] dark:text-white">{user?.fullName || 'User'}</h3>
                <p className="text-sm text-[#616e89] dark:text-gray-400 mb-2">@{user?.username || 'username'}</p>
                <div className="flex items-center gap-1 text-sm text-yellow-600 bg-yellow-50 px-2 py-0.5 rounded-full dark:bg-yellow-900/30 dark:text-yellow-400">
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
                    className={`flex items-center gap-3 px-4 py-3 rounded-lg font-medium transition-colors ${activeTab === item.id
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
              </nav>
            </div>
          </aside>

          {/* Main Content Form */}
          <div className="lg:col-span-9">
            {activeTab === 'profile' && (
              <div className="bg-white dark:bg-surface-dark rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-6 sm:p-8">
                {/* Header */}
                <div className="border-b border-gray-100 dark:border-gray-700 pb-5 mb-6">
                  <div className="flex items-center gap-3 mb-2">
                    <span className="material-symbols-outlined text-primary text-3xl">account_circle</span>
                    <h1 className="text-2xl font-bold text-[#111318] dark:text-white">Hồ sơ của tôi</h1>
                  </div>
                  <p className="text-[#616e89] dark:text-gray-400 text-sm ml-11">
                    Quản lý thông tin hồ sơ để bảo mật tài khoản
                  </p>
                </div>

                <form onSubmit={handleSubmit} className="flex flex-col gap-6">
                  {/* Form Fields */}
                  <div className="flex flex-col gap-6">
                    {/* Username - Read only */}
                    <div className="flex flex-col gap-2">
                      <label className="text-sm font-medium text-[#616e89] dark:text-gray-300">
                        Tên đăng nhập
                      </label>
                      <div className="relative opacity-75">
                        <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-[20px]">
                          account_circle
                        </span>
                        <input
                          className="w-full pl-10 pr-4 py-2.5 bg-gray-100 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg text-[#616e89] dark:text-gray-400 cursor-not-allowed"
                          type="text"
                          value={formData.username}
                          disabled
                        />
                      </div>
                      <p className="text-xs text-gray-500">Tên đăng nhập không thể thay đổi</p>
                    </div>

                    {/* Full Name */}
                    <div className="flex flex-col gap-2">
                      <label className="text-sm font-medium text-[#616e89] dark:text-gray-300">
                        Họ và tên <span className="text-red-500">*</span>
                      </label>
                      <input
                        className={`w-full px-4 py-2.5 rounded-lg text-[#111318] dark:text-white focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all ${isEditing
                            ? `bg-white dark:bg-gray-800 border ${errors.fullName ? 'border-red-500' : 'border-gray-200 dark:border-gray-600'}`
                            : 'bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-600 cursor-not-allowed'
                          }`}
                        placeholder="Nhập họ và tên"
                        type="text"
                        value={formData.fullName}
                        onChange={(e) => handleInputChange('fullName', e.target.value)}
                        disabled={!isEditing}
                      />
                      {errors.fullName && (
                        <p className="text-red-500 text-xs mt-1">{errors.fullName}</p>
                      )}
                    </div>

                    {/* Email */}
                    <div className="flex flex-col gap-2">
                      <label className="text-sm font-medium text-[#616e89] dark:text-gray-300">
                        Email <span className="text-red-500">*</span>
                      </label>
                      <div className="relative">
                        <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-[20px]">
                          mail
                        </span>
                        <input
                          className={`w-full pl-10 pr-4 py-2.5 rounded-lg text-[#111318] dark:text-white focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all ${isEditing
                              ? `bg-white dark:bg-gray-800 border ${errors.email ? 'border-red-500' : 'border-gray-200 dark:border-gray-600'}`
                              : 'bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-600 cursor-not-allowed'
                            }`}
                          type="email"
                          placeholder="Nhập email"
                          value={formData.email}
                          onChange={(e) => handleInputChange('email', e.target.value)}
                          disabled={!isEditing}
                        />
                      </div>
                      {errors.email && (
                        <p className="text-red-500 text-xs mt-1">{errors.email}</p>
                      )}
                    </div>

                    {/* Phone */}
                    <div className="flex flex-col gap-2">
                      <label className="text-sm font-medium text-[#616e89] dark:text-gray-300">
                        Số điện thoại <span className="text-red-500">*</span>
                      </label>
                      <div className="relative">
                        <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-[20px]">
                          call
                        </span>
                        <input
                          className={`w-full pl-10 pr-4 py-2.5 rounded-lg text-[#111318] dark:text-white focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all ${isEditing
                              ? `bg-white dark:bg-gray-800 border ${errors.phoneNumber ? 'border-red-500' : 'border-gray-200 dark:border-gray-600'}`
                              : 'bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-600 cursor-not-allowed'
                            }`}
                          type="tel"
                          placeholder="Nhập số điện thoại"
                          value={formData.phoneNumber}
                          onChange={(e) => handleInputChange('phoneNumber', e.target.value)}
                          disabled={!isEditing}
                        />
                      </div>
                      {errors.phoneNumber && (
                        <p className="text-red-500 text-xs mt-1">{errors.phoneNumber}</p>
                      )}
                    </div>

                    {/* Gender */}
                    <div className="flex flex-col gap-2">
                      <label className="text-sm font-medium text-[#616e89] dark:text-gray-300">Giới tính</label>
                      <div className="flex gap-6 mt-1">
                        {[
                          { value: 'MALE', label: 'Nam' },
                          { value: 'FEMALE', label: 'Nữ' },
                          { value: 'OTHER', label: 'Khác' }
                        ].map((gender) => (
                          <label key={gender.value} className={`flex items-center gap-2 ${isEditing ? 'cursor-pointer' : 'cursor-not-allowed opacity-60'} group`}>
                            <input
                              className="peer sr-only"
                              name="gender"
                              type="radio"
                              value={gender.value}
                              checked={formData.gender === gender.value}
                              onChange={(e) => handleInputChange('gender', e.target.value)}
                              disabled={!isEditing}
                            />
                            <div className="size-4 rounded-full border border-gray-300 peer-checked:border-primary peer-checked:border-[5px] transition-all"></div>
                            <span className="text-[#111318] dark:text-white group-hover:text-primary transition-colors">
                              {gender.label}
                            </span>
                          </label>
                        ))}
                      </div>
                    </div>

                    {/* DOB */}
                    <div className="flex flex-col gap-2">
                      <label className="text-sm font-medium text-[#616e89] dark:text-gray-300">Ngày sinh</label>
                      <div className="relative">
                        <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-[20px]">
                          calendar_today
                        </span>
                        <input
                          className={`w-full pl-10 pr-4 py-2.5 rounded-lg text-[#111318] dark:text-white focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all ${isEditing
                              ? `bg-white dark:bg-gray-800 border ${errors.dateOfBirth ? 'border-red-500' : 'border-gray-200 dark:border-gray-600'}`
                              : 'bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-600 cursor-not-allowed'
                            }`}
                          type="date"
                          value={formData.dateOfBirth}
                          onChange={(e) => handleInputChange('dateOfBirth', e.target.value)}
                          disabled={!isEditing}
                        />
                      </div>
                      {errors.dateOfBirth && (
                        <p className="text-red-500 text-xs mt-1">{errors.dateOfBirth}</p>
                      )}
                    </div>

                    {/* Buttons */}
                    <div className="flex items-center gap-4 mt-4 pt-4 border-t border-gray-100 dark:border-gray-700">
                      {isEditing ? (
                        <>
                          <button
                            className="bg-primary hover:bg-primary-hover text-white px-8 py-2.5 rounded-lg font-medium transition-all shadow-md hover:shadow-lg active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                            type="submit"
                            disabled={saving}
                          >
                            {saving ? (
                              <>
                                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                                Đang lưu...
                              </>
                            ) : (
                              'Cập nhật'
                            )}
                          </button>
                          <button
                            className="bg-white border border-gray-300 hover:bg-gray-50 text-[#616e89] px-8 py-2.5 rounded-lg font-medium transition-all dark:bg-gray-800 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700 disabled:opacity-50"
                            type="button"
                            onClick={handleCancel}
                            disabled={saving}
                          >
                            Hủy
                          </button>
                        </>
                      ) : (
                        <button
                          className="bg-primary hover:bg-primary-hover text-white px-8 py-2.5 rounded-lg font-medium transition-all shadow-md hover:shadow-lg active:scale-95 flex items-center gap-2"
                          type="button"
                          onClick={(e) => {
                            e.preventDefault();
                            setIsEditing(true);
                          }}
                        >
                          <span className="material-symbols-outlined text-[20px]">edit</span>
                          Chỉnh sửa
                        </button>
                      )}
                    </div>
                  </div>
                </form>
              </div>
            )}

            {activeTab === 'security' && (
              <div className="bg-white dark:bg-surface-dark rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-6 sm:p-8">
                {/* Header */}
                <div className="border-b border-gray-100 dark:border-gray-700 pb-5 mb-6">
                  <div className="flex items-center gap-3 mb-2">
                    <span className="material-symbols-outlined text-primary text-3xl">lock</span>
                    <h1 className="text-2xl font-bold text-[#111318] dark:text-white">Bảo mật</h1>
                  </div>
                  <p className="text-[#616e89] dark:text-gray-400 text-sm ml-11">
                    Thay đổi mật khẩu để bảo vệ tài khoản của bạn
                  </p>
                </div>

                <form onSubmit={handlePasswordChange} className="flex flex-col gap-6 max-w-2xl">
                  {/* Current Password */}
                  <div className="flex flex-col gap-2">
                    <label className="text-sm font-medium text-[#616e89] dark:text-gray-300">
                      Mật khẩu hiện tại <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-[20px]">
                        lock
                      </span>
                      <input
                        className={`w-full pl-10 pr-4 py-2.5 rounded-lg text-[#111318] dark:text-white focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all bg-white dark:bg-gray-800 border ${passwordErrors.currentPassword ? 'border-red-500' : 'border-gray-200 dark:border-gray-600'
                          }`}
                        type="password"
                        placeholder="Nhập mật khẩu hiện tại"
                        value={passwordData.currentPassword}
                        onChange={(e) => handlePasswordInputChange('currentPassword', e.target.value)}
                      />
                    </div>
                    {passwordErrors.currentPassword && (
                      <p className="text-red-500 text-xs mt-1">{passwordErrors.currentPassword}</p>
                    )}
                  </div>

                  {/* New Password */}
                  <div className="flex flex-col gap-2">
                    <label className="text-sm font-medium text-[#616e89] dark:text-gray-300">
                      Mật khẩu mới <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-[20px]">
                        lock_reset
                      </span>
                      <input
                        className={`w-full pl-10 pr-4 py-2.5 rounded-lg text-[#111318] dark:text-white focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all bg-white dark:bg-gray-800 border ${passwordErrors.newPassword ? 'border-red-500' : 'border-gray-200 dark:border-gray-600'
                          }`}
                        type="password"
                        placeholder="Nhập mật khẩu mới"
                        value={passwordData.newPassword}
                        onChange={(e) => handlePasswordInputChange('newPassword', e.target.value)}
                      />
                    </div>
                    {passwordErrors.newPassword && (
                      <p className="text-red-500 text-xs mt-1">{passwordErrors.newPassword}</p>
                    )}
                    <p className="text-xs text-gray-500">Mật khẩu phải có ít nhất 6 ký tự</p>
                  </div>

                  {/* Confirm Password */}
                  <div className="flex flex-col gap-2">
                    <label className="text-sm font-medium text-[#616e89] dark:text-gray-300">
                      Xác nhận mật khẩu mới <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-[20px]">
                        check_circle
                      </span>
                      <input
                        className={`w-full pl-10 pr-4 py-2.5 rounded-lg text-[#111318] dark:text-white focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all bg-white dark:bg-gray-800 border ${passwordErrors.confirmPassword ? 'border-red-500' : 'border-gray-200 dark:border-gray-600'
                          }`}
                        type="password"
                        placeholder="Nhập lại mật khẩu mới"
                        value={passwordData.confirmPassword}
                        onChange={(e) => handlePasswordInputChange('confirmPassword', e.target.value)}
                      />
                    </div>
                    {passwordErrors.confirmPassword && (
                      <p className="text-red-500 text-xs mt-1">{passwordErrors.confirmPassword}</p>
                    )}
                  </div>

                  {/* Security Tips */}
                  <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                    <div className="flex gap-3">
                      <span className="material-symbols-outlined text-blue-600 dark:text-blue-400 text-[24px]">
                        info
                      </span>
                      <div className="flex-1">
                        <h3 className="text-sm font-semibold text-blue-900 dark:text-blue-300 mb-2">
                          Mẹo bảo mật
                        </h3>
                        <ul className="text-xs text-blue-800 dark:text-blue-400 space-y-1 list-disc list-inside">
                          <li>Sử dụng mật khẩu mạnh với ít nhất 8 ký tự</li>
                          <li>Kết hợp chữ hoa, chữ thường, số và ký tự đặc biệt</li>
                          <li>Không sử dụng thông tin cá nhân dễ đoán</li>
                          <li>Thay đổi mật khẩu định kỳ</li>
                        </ul>
                      </div>
                    </div>
                  </div>

                  {/* Submit Button */}
                  <div className="flex items-center gap-4 pt-4 border-t border-gray-100 dark:border-gray-700">
                    <button
                      className="bg-primary hover:bg-primary-hover text-white px-8 py-2.5 rounded-lg font-medium transition-all shadow-md hover:shadow-lg active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                      type="submit"
                      disabled={changingPassword}
                    >
                      {changingPassword ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                          Đang xử lý...
                        </>
                      ) : (
                        <>
                          <span className="material-symbols-outlined text-[20px]">check</span>
                          Đổi mật khẩu
                        </>
                      )}
                    </button>
                  </div>
                </form>
              </div>
            )}

            {activeTab === 'points' && (
              <div className="bg-white dark:bg-surface-dark rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-6 sm:p-8">
                <div className="flex flex-col items-center justify-center py-12">
                  <span className="material-symbols-outlined text-gray-300 dark:text-gray-600 text-[80px] mb-4">
                    stars
                  </span>
                  <h3 className="text-xl font-semibold text-[#111318] dark:text-white mb-2">
                    Điểm tích lũy
                  </h3>
                  <p className="text-[#616e89] dark:text-gray-400 text-center">
                    Tính năng đang được phát triển
                  </p>
                </div>
              </div>
            )}

            {activeTab === 'payment' && (
              <div className="bg-white dark:bg-surface-dark rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-6 sm:p-8">
                <div className="flex flex-col items-center justify-center py-12">
                  <span className="material-symbols-outlined text-gray-300 dark:text-gray-600 text-[80px] mb-4">
                    payments
                  </span>
                  <h3 className="text-xl font-semibold text-[#111318] dark:text-white mb-2">
                    Thanh toán
                  </h3>
                  <p className="text-[#616e89] dark:text-gray-400 text-center">
                    Tính năng đang được phát triển
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>

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
