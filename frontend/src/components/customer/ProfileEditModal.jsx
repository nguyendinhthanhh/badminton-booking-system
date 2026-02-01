import { useState, useEffect } from "react";

const ProfileEditModal = ({ user, onClose, onSubmit }) => {
  const [formData, setFormData] = useState({
    username: "",
    fullName: "",
    email: "",
    phoneNumber: "",
    gender: "male",
    dateOfBirth: "",
    address: "",
  });

  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (user) {
      setFormData({
        username: user.username || "",
        fullName: user.fullName || "",
        email: user.email || "",
        phoneNumber: user.phoneNumber || "",
        gender: user.gender || "male",
        dateOfBirth: user.dateOfBirth || "",
        address: user.address || "",
      });
    }
  }, [user]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    // Clear error when user types
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const validate = () => {
    const newErrors = {};

    if (!formData.fullName.trim()) {
      newErrors.fullName = "Họ tên không được để trống";
    }

    if (!formData.username.trim()) {
      newErrors.username = "Tên đăng nhập không được để trống";
    }

    if (formData.phoneNumber && !/^[0-9]{10,11}$/.test(formData.phoneNumber)) {
      newErrors.phoneNumber = "Số điện thoại không hợp lệ";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validate()) {
      return;
    }

    setIsLoading(true);
    try {
      await onSubmit(formData);
    } finally {
      setIsLoading(false);
    }
  };

  const InputField = ({
    icon,
    label,
    name,
    type = "text",
    required = false,
    placeholder = "",
    disabled = false,
  }) => (
    <div>
      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
        <div className="flex items-center gap-2">
          <span className="material-symbols-outlined text-lg text-gray-500">
            {icon}
          </span>
          <span>{label}</span>
          {required && <span className="text-red-500">*</span>}
        </div>
      </label>
      <input
        type={type}
        name={name}
        value={formData[name]}
        onChange={handleChange}
        required={required}
        placeholder={placeholder}
        disabled={disabled}
        className={`w-full px-4 py-2.5 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary transition-colors text-gray-900 dark:text-white bg-white dark:bg-gray-800 ${
          errors[name]
            ? "border-red-500"
            : "border-gray-300 dark:border-gray-600"
        } ${disabled ? "opacity-60 cursor-not-allowed bg-gray-100 dark:bg-gray-700" : ""}`}
      />
      {errors[name] && (
        <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
          <span className="material-symbols-outlined text-sm">error</span>
          {errors[name]}
        </p>
      )}
    </div>
  );

  return (
    <div
      className="fixed inset-0 flex items-center justify-center z-50 p-4 bg-black/50"
      onClick={onClose}
    >
      <div
        className="bg-white dark:bg-surface-dark rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-primary to-primary-hover px-6 py-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-white rounded-lg flex items-center justify-center">
                <span className="material-symbols-outlined text-primary text-2xl">
                  person_edit
                </span>
              </div>
              <div>
                <h2 className="text-2xl font-bold text-white">
                  Xác nhận cập nhật
                </h2>
                <p className="text-white/80 text-sm mt-1">
                  Kiểm tra lại thông tin trước khi lưu
                </p>
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
        <form
          onSubmit={handleSubmit}
          className="p-6 overflow-y-auto max-h-[calc(90vh-180px)]"
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <InputField
              icon="account_circle"
              label="Tên đăng nhập"
              name="username"
              required
              placeholder="Nhập tên đăng nhập"
            />

            <InputField
              icon="badge"
              label="Họ và tên"
              name="fullName"
              required
              placeholder="Nhập họ và tên"
            />

            <InputField
              icon="mail"
              label="Email"
              name="email"
              type="email"
              placeholder="Nhập email"
              disabled
            />

            <InputField
              icon="call"
              label="Số điện thoại"
              name="phoneNumber"
              type="tel"
              placeholder="Nhập số điện thoại"
              disabled
            />

            {/* Gender */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-lg text-gray-500">
                    wc
                  </span>
                  <span>Giới tính</span>
                </div>
              </label>
              <div className="flex gap-4 mt-2">
                {[
                  { value: "male", label: "Nam" },
                  { value: "female", label: "Nữ" },
                  { value: "other", label: "Khác" },
                ].map((option) => (
                  <label
                    key={option.value}
                    className="flex items-center gap-2 cursor-pointer group"
                  >
                    <input
                      type="radio"
                      name="gender"
                      value={option.value}
                      checked={formData.gender === option.value}
                      onChange={handleChange}
                      className="peer sr-only"
                    />
                    <div className="size-4 rounded-full border border-gray-300 peer-checked:border-primary peer-checked:border-[5px] transition-all"></div>
                    <span className="text-gray-700 dark:text-gray-300 group-hover:text-primary transition-colors">
                      {option.label}
                    </span>
                  </label>
                ))}
              </div>
            </div>

            <InputField
              icon="calendar_today"
              label="Ngày sinh"
              name="dateOfBirth"
              type="date"
            />

            <div className="md:col-span-2">
              <InputField
                icon="location_on"
                label="Địa chỉ"
                name="address"
                placeholder="Nhập địa chỉ"
              />
            </div>
          </div>

          {/* Footer Buttons */}
          <div className="flex items-center justify-end gap-3 mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 font-medium transition-colors"
            >
              Hủy
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="px-6 py-2.5 bg-primary hover:bg-primary-hover text-white rounded-lg font-medium transition-colors shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {isLoading ? (
                <>
                  <span className="material-symbols-outlined animate-spin text-lg">
                    progress_activity
                  </span>
                  Đang lưu...
                </>
              ) : (
                <>
                  <span className="material-symbols-outlined text-lg">
                    save
                  </span>
                  Lưu thay đổi
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ProfileEditModal;
