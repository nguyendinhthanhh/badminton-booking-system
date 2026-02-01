import { useState, useEffect } from 'react';

const UserFormModal = ({ user, onClose, onSubmit }) => {
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phoneNumber: '',
    gender: '',
    dateOfBirth: '',
    roleName: '',
    avatar: ''
  });

  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (user) {
      setFormData({
        fullName: user.fullName || '',
        email: user.email || '',
        phoneNumber: user.phoneNumber || '',
        gender: user.gender || '',
        dateOfBirth: user.dateOfBirth || '',
        roleName: user.roleName || '',
        avatar: user.avatar || ''
      });
    }
  }, [user]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    // Clear error when user types
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validate = () => {
    const newErrors = {};
    
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

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!validate()) {
      return;
    }

    console.log('Submitting data:', formData);
    onSubmit(formData);
  };

  const InputField = ({ icon, label, name, type = 'text', required = false, placeholder = '', options = null }) => (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-2">
        <div className="flex items-center gap-2">
          <span className="material-symbols-outlined text-lg text-gray-500">{icon}</span>
          <span>{label}</span>
          {required && <span className="text-red-500">*</span>}
        </div>
      </label>
      {options ? (
        <select
          name={name}
          value={formData[name]}
          onChange={handleChange}
          required={required}
          className={`w-full px-4 py-2.5 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors text-gray-900 bg-white ${
            errors[name] ? 'border-red-500' : 'border-gray-300'
          }`}
        >
          <option value="">Chọn {label.toLowerCase()}</option>
          {options.map(opt => (
            <option key={opt.value} value={opt.value}>{opt.label}</option>
          ))}
        </select>
      ) : (
        <input
          type={type}
          name={name}
          value={formData[name]}
          onChange={handleChange}
          required={required}
          placeholder={placeholder}
          className={`w-full px-4 py-2.5 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors text-gray-900 bg-white ${
            errors[name] ? 'border-red-500' : 'border-gray-300'
          }`}
        />
      )}
      {errors[name] && (
        <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
          <span className="material-symbols-outlined text-sm">error</span>
          {errors[name]}
        </p>
      )}
    </div>
  );

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div className="bg-white rounded-2xl w-full max-w-3xl max-h-[90vh] overflow-hidden shadow-2xl" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="bg-gradient-to-r from-indigo-600 to-indigo-700 px-6 py-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-white rounded-lg flex items-center justify-center">
                <span className="material-symbols-outlined text-indigo-600 text-2xl">edit</span>
              </div>
              <div>
                <h2 className="text-2xl font-bold text-white">Chỉnh sửa người dùng</h2>
                <p className="text-indigo-100 text-sm mt-1">Cập nhật thông tin người dùng</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="text-white hover:bg-white/20 rounded-lg p-2 transition-colors"
            >
              <span className="material-symbols-outlined text-2xl">close</span>
            </button>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto max-h-[calc(90vh-180px)]">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <InputField
              icon="person"
              label="Họ và tên"
              name="fullName"
              required={true}
              placeholder="Nhập họ và tên"
            />

            <InputField
              icon="email"
              label="Email"
              name="email"
              type="email"
              required={true}
              placeholder="example@email.com"
            />

            <InputField
              icon="phone"
              label="Số điện thoại"
              name="phoneNumber"
              type="tel"
              required={true}
              placeholder="0123456789"
            />

            <InputField
              icon="wc"
              label="Giới tính"
              name="gender"
              options={[
                { value: 'MALE', label: 'Nam' },
                { value: 'FEMALE', label: 'Nữ' },
                { value: 'OTHER', label: 'Khác' }
              ]}
            />

            <InputField
              icon="cake"
              label="Ngày sinh"
              name="dateOfBirth"
              type="date"
            />

            <InputField
              icon="shield"
              label="Vai trò"
              name="roleName"
              required={true}
              options={[
                { value: 'ADMIN', label: 'ADMIN' },
                { value: 'MANAGER', label: 'MANAGER' },
                { value: 'STAFF', label: 'STAFF' },
                { value: 'USER', label: 'USER' }
              ]}
            />

            <InputField
              icon="image"
              label="Avatar URL"
              name="avatar"
              placeholder="https://example.com/avatar.jpg"
            />
          </div>
        </form>

        {/* Footer */}
        <div className="border-t border-gray-200 px-6 py-4 bg-gray-50">
          <div className="flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2.5 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-100 transition-colors font-medium"
            >
              Hủy
            </button>
            <button
              type="submit"
              onClick={handleSubmit}
              className="px-6 py-2.5 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors font-medium flex items-center gap-2"
            >
              <span className="material-symbols-outlined text-xl">save</span>
              <span>Lưu thay đổi</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserFormModal;
