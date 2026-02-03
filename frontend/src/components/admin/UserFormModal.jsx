import { useState, useEffect } from 'react';

const UserFormModal = ({ user, onClose, onSubmit, isCreate = false }) => {
  const [formData, setFormData] = useState({
    username: '',
    fullName: '',
    email: '',
    phoneNumber: '',
    gender: '',
    dateOfBirth: '',
    roleName: '',
    avatar: ''
  });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (user && !isCreate) {
      setFormData({
        username: user.username || '',
        fullName: user.fullName || '',
        email: user.email || '',
        phoneNumber: user.phoneNumber || '',
        gender: user.gender || '',
        dateOfBirth: user.dateOfBirth || '',
        roleName: user.roleName || '',
        avatar: user.avatar || ''
      });
    } else {
      setFormData({
        username: '',
        fullName: '',
        email: '',
        phoneNumber: '',
        gender: '',
        dateOfBirth: '',
        roleName: '',
        avatar: ''
      });
    }
  }, [user, isCreate]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validate = () => {
    const newErrors = {};
    
    if (isCreate && !formData.username.trim()) {
      newErrors.username = 'Tên đăng nhập không được để trống';
    }
    
    if (!formData.fullName.trim()) {
      newErrors.fullName = 'Họ tên không được để trống';
    }
    
    if (!formData.email.trim()) {
      newErrors.email = 'Email không được để trống';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email không hợp lệ';
    }
    
    if (!formData.phoneNumber.trim()) {
      newErrors.phoneNumber = 'Số điện thoại không được để trống';
    } else if (!/^[0-9]{10,11}$/.test(formData.phoneNumber)) {
      newErrors.phoneNumber = 'Số điện thoại không hợp lệ';
    }
    
    if (!formData.roleName) {
      newErrors.roleName = 'Vui lòng chọn vai trò';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validate()) {
      return;
    }

    setLoading(true);
    try {
      const submitData = isCreate ? formData : { ...formData };
      if (!isCreate) {
        delete submitData.username;
      }
      
      await onSubmit(submitData);
      onClose();
    } catch (error) {
      console.error('Error submitting form:', error);
    } finally {
      setLoading(false);
    }
  };

  if (!onClose) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex min-h-screen items-center justify-center p-4">
        {/* Backdrop */}
        <div 
          className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm transition-opacity"
          onClick={onClose}
        ></div>

        {/* Modal */}
        <div className="relative bg-white dark:bg-[#1a202c] rounded-xl shadow-2xl max-w-2xl w-full border border-slate-200 dark:border-slate-800 overflow-hidden">
          {/* Header */}
          <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-800">
            <div className="flex items-start justify-between">
              <div>
                <h2 className="text-lg font-semibold text-slate-900 dark:text-white">
                  {isCreate ? 'Thêm người dùng mới' : 'Chỉnh sửa người dùng'}
                </h2>
                <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                  {isCreate ? 'Tạo tài khoản người dùng mới trong hệ thống.' : 'Cập nhật thông tin người dùng bên dưới.'}
                </p>
              </div>
              <button
                onClick={onClose}
                className="rounded-md text-slate-400 hover:text-slate-500 focus:outline-none"
              >
                <span className="material-symbols-outlined text-xl">close</span>
              </button>
            </div>
          </div>

          {/* Content */}
          <form onSubmit={handleSubmit} className="max-h-[calc(100vh-200px)] overflow-y-auto">
            <div className="px-6 py-4 space-y-4">
              {isCreate && (
                <div>
                  <label className="block text-xs font-medium text-slate-900 dark:text-slate-200 mb-1.5">
                    Tên đăng nhập *
                  </label>
                  <input
                    type="text"
                    name="username"
                    value={formData.username}
                    onChange={handleChange}
                    required
                    placeholder="Nhập tên đăng nhập"
                    className={`w-full rounded-md border px-3 py-2 text-sm text-slate-900 dark:text-white dark:bg-slate-800 focus:ring-2 focus:ring-purple-600 focus:border-transparent ${
                      errors.username ? 'border-red-500' : 'border-slate-300 dark:border-slate-700'
                    }`}
                  />
                  {errors.username && (
                    <p className="mt-1 text-xs text-red-600">{errors.username}</p>
                  )}
                </div>
              )}

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-900 dark:text-slate-200 mb-1.5">
                    Họ và tên *
                  </label>
                  <input
                    type="text"
                    name="fullName"
                    value={formData.fullName}
                    onChange={handleChange}
                    required
                    placeholder="Nhập họ và tên"
                    className={`w-full rounded-md border px-3 py-2 text-sm text-slate-900 dark:text-white dark:bg-slate-800 focus:ring-2 focus:ring-purple-600 focus:border-transparent ${
                      errors.fullName ? 'border-red-500' : 'border-slate-300 dark:border-slate-700'
                    }`}
                  />
                  {errors.fullName && (
                    <p className="mt-1 text-xs text-red-600">{errors.fullName}</p>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-900 dark:text-slate-200 mb-1.5">
                    Email *
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    placeholder="example@email.com"
                    className={`w-full rounded-md border px-3 py-2 text-sm text-slate-900 dark:text-white dark:bg-slate-800 focus:ring-2 focus:ring-purple-600 focus:border-transparent ${
                      errors.email ? 'border-red-500' : 'border-slate-300 dark:border-slate-700'
                    }`}
                  />
                  {errors.email && (
                    <p className="mt-1 text-xs text-red-600">{errors.email}</p>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-900 dark:text-slate-200 mb-1.5">
                    Số điện thoại *
                  </label>
                  <input
                    type="tel"
                    name="phoneNumber"
                    value={formData.phoneNumber}
                    onChange={handleChange}
                    required
                    placeholder="0123456789"
                    className={`w-full rounded-md border px-3 py-2 text-sm text-slate-900 dark:text-white dark:bg-slate-800 focus:ring-2 focus:ring-purple-600 focus:border-transparent ${
                      errors.phoneNumber ? 'border-red-500' : 'border-slate-300 dark:border-slate-700'
                    }`}
                  />
                  {errors.phoneNumber && (
                    <p className="mt-1 text-xs text-red-600">{errors.phoneNumber}</p>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-900 dark:text-slate-200 mb-1.5">
                    Giới tính
                  </label>
                  <select
                    name="gender"
                    value={formData.gender}
                    onChange={handleChange}
                    className="w-full rounded-md border border-slate-300 dark:border-slate-700 px-3 py-2 text-sm text-slate-900 dark:text-white dark:bg-slate-800 focus:ring-2 focus:ring-purple-600 focus:border-transparent"
                  >
                    <option value="">Chọn giới tính</option>
                    <option value="MALE">Nam</option>
                    <option value="FEMALE">Nữ</option>
                    <option value="OTHER">Khác</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-900 dark:text-slate-200 mb-1.5">
                    Ngày sinh
                  </label>
                  <input
                    type="date"
                    name="dateOfBirth"
                    value={formData.dateOfBirth}
                    onChange={handleChange}
                    className="w-full rounded-md border border-slate-300 dark:border-slate-700 px-3 py-2 text-sm text-slate-900 dark:text-white dark:bg-slate-800 focus:ring-2 focus:ring-purple-600 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-900 dark:text-slate-200 mb-1.5">
                    Vai trò *
                  </label>
                  <select
                    name="roleName"
                    value={formData.roleName}
                    onChange={handleChange}
                    required
                    className={`w-full rounded-md border px-3 py-2 text-sm text-slate-900 dark:text-white dark:bg-slate-800 focus:ring-2 focus:ring-purple-600 focus:border-transparent ${
                      errors.roleName ? 'border-red-500' : 'border-slate-300 dark:border-slate-700'
                    }`}
                  >
                    <option value="">Chọn vai trò</option>
                    <option value="ADMIN">ADMIN</option>
                    <option value="MANAGER">MANAGER</option>
                    <option value="STAFF">STAFF</option>
                    <option value="USER">USER</option>
                  </select>
                  {errors.roleName && (
                    <p className="mt-1 text-xs text-red-600">{errors.roleName}</p>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-900 dark:text-slate-200 mb-1.5">
                  Avatar URL
                </label>
                <div className="space-y-2">
                  <input
                    type="url"
                    name="avatar"
                    value={formData.avatar}
                    onChange={handleChange}
                    placeholder="https://example.com/avatar.jpg"
                    className="w-full rounded-md border border-slate-300 dark:border-slate-700 px-3 py-2 text-sm text-slate-900 dark:text-white dark:bg-slate-800 focus:ring-2 focus:ring-purple-600 focus:border-transparent"
                  />
                  {formData.avatar && (
                    <div className="mt-2 rounded-lg overflow-hidden border border-slate-200 dark:border-slate-700 w-24 h-24">
                      <img 
                        src={formData.avatar} 
                        alt="Avatar Preview" 
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          e.target.src = 'https://ui-avatars.com/api/?name=' + (formData.fullName || 'User');
                        }}
                      />
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="flex justify-end gap-3 px-6 py-3 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50">
              <button
                type="button"
                onClick={onClose}
                disabled={loading}
                className="px-3 py-1.5 rounded-md bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-200 border border-slate-300 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700 font-medium text-sm disabled:opacity-50"
              >
                Hủy
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-3 py-1.5 rounded-md bg-purple-600 hover:bg-purple-700 text-white font-semibold text-sm disabled:opacity-50 flex items-center gap-2"
              >
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    {isCreate ? 'Đang tạo...' : 'Đang cập nhật...'}
                  </>
                ) : (
                  <>{isCreate ? 'Tạo người dùng' : 'Cập nhật'}</>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default UserFormModal;
