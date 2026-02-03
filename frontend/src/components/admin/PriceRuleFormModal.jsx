import { useState, useEffect } from 'react';
import courtService from '../../services/courtService';
import LoadingSpinner from '../common/LoadingSpinner';

const PriceRuleFormModal = ({ priceRule, isCreate, onClose, onSubmit }) => {
  const [formData, setFormData] = useState({
    courtId: '',
    slotId: '',
    price: '',
    isWeekend: false,
    dayOfWeek: '',
    effectiveFrom: '',
    effectiveTo: '',
    isActive: true
  });

  const [courts, setCourts] = useState([]);
  const [timeSlots, setTimeSlots] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loadingCourts, setLoadingCourts] = useState(true);
  const [errors, setErrors] = useState({});

  const daysOfWeek = [
    { value: 1, label: 'Thứ 2' },
    { value: 2, label: 'Thứ 3' },
    { value: 3, label: 'Thứ 4' },
    { value: 4, label: 'Thứ 5' },
    { value: 5, label: 'Thứ 6' },
    { value: 6, label: 'Thứ 7' },
    { value: 0, label: 'Chủ nhật' }
  ];

  useEffect(() => {
    fetchCourts();
    if (!isCreate && priceRule) {
      setFormData({
        courtId: priceRule.courtId || '',
        slotId: priceRule.slotId || '',
        price: priceRule.price || '',
        isWeekend: priceRule.isWeekend || false,
        dayOfWeek: priceRule.dayOfWeek !== undefined ? priceRule.dayOfWeek : '',
        effectiveFrom: priceRule.effectiveFrom || '',
        effectiveTo: priceRule.effectiveTo || '',
        isActive: priceRule.isActive !== undefined ? priceRule.isActive : true
      });
    }
  }, [priceRule, isCreate]);

  const fetchCourts = async () => {
    try {
      setLoadingCourts(true);
      const data = await courtService.getAllCourts(0, 100, {});
      setCourts(data.content || []);
    } catch (error) {
      console.error('Error fetching courts:', error);
    } finally {
      setLoadingCourts(false);
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
    
    // Clear error when user types
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validate = () => {
    const newErrors = {};
    
    if (!formData.courtId) newErrors.courtId = 'Vui lòng chọn sân';
    if (!formData.slotId) newErrors.slotId = 'Vui lòng chọn khung giờ';
    if (!formData.price || formData.price <= 0) newErrors.price = 'Giá phải lớn hơn 0';
    if (!formData.effectiveFrom) newErrors.effectiveFrom = 'Vui lòng chọn ngày bắt đầu';
    if (!formData.effectiveTo) newErrors.effectiveTo = 'Vui lòng chọn ngày kết thúc';
    
    if (formData.effectiveFrom && formData.effectiveTo) {
      if (new Date(formData.effectiveFrom) > new Date(formData.effectiveTo)) {
        newErrors.effectiveTo = 'Ngày kết thúc phải sau ngày bắt đầu';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validate()) return;

    setLoading(true);
    try {
      const submitData = {
        ...formData,
        courtId: parseInt(formData.courtId),
        slotId: parseInt(formData.slotId),
        price: parseFloat(formData.price),
        dayOfWeek: formData.dayOfWeek !== '' ? parseInt(formData.dayOfWeek) : null
      };
      
      await onSubmit(submitData);
    } catch (error) {
      console.error('Error submitting form:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between z-10">
          <div>
            <h2 className="text-2xl font-black text-gray-900">
              {isCreate ? 'Thêm quy tắc giá mới' : 'Chỉnh sửa quy tắc giá'}
            </h2>
            <p className="text-sm text-gray-600 mt-1">
              {isCreate ? 'Tạo quy tắc giá cho sân và khung giờ' : 'Cập nhật thông tin quy tắc giá'}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <span className="material-symbols-outlined text-gray-600">close</span>
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Court & Time Slot Selection */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-bold text-gray-900 mb-2">
                Sân <span className="text-red-500">*</span>
              </label>
              {loadingCourts ? (
                <div className="h-11 bg-gray-100 rounded-lg animate-pulse"></div>
              ) : (
                <select
                  name="courtId"
                  value={formData.courtId}
                  onChange={handleChange}
                  className={`w-full px-4 py-2.5 rounded-lg border ${
                    errors.courtId ? 'border-red-500' : 'border-gray-300'
                  } focus:border-purple-600 focus:ring-2 focus:ring-purple-600/20 outline-none transition-all`}
                >
                  <option value="">Chọn sân</option>
                  {courts.map(court => (
                    <option key={court.id} value={court.id}>
                      {court.courtName} - {court.courtType}
                    </option>
                  ))}
                </select>
              )}
              {errors.courtId && <p className="text-red-500 text-xs mt-1">{errors.courtId}</p>}
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-900 mb-2">
                Khung giờ <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                name="slotId"
                value={formData.slotId}
                onChange={handleChange}
                placeholder="ID khung giờ"
                className={`w-full px-4 py-2.5 rounded-lg border ${
                  errors.slotId ? 'border-red-500' : 'border-gray-300'
                } focus:border-purple-600 focus:ring-2 focus:ring-purple-600/20 outline-none transition-all`}
              />
              {errors.slotId && <p className="text-red-500 text-xs mt-1">{errors.slotId}</p>}
            </div>
          </div>

          {/* Price */}
          <div>
            <label className="block text-sm font-bold text-gray-900 mb-2">
              Giá (VNĐ) <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <input
                type="number"
                name="price"
                value={formData.price}
                onChange={handleChange}
                placeholder="Nhập giá"
                min="0"
                step="1000"
                className={`w-full px-4 py-2.5 rounded-lg border ${
                  errors.price ? 'border-red-500' : 'border-gray-300'
                } focus:border-purple-600 focus:ring-2 focus:ring-purple-600/20 outline-none transition-all`}
              />
              <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 text-sm font-medium">
                VNĐ
              </span>
            </div>
            {errors.price && <p className="text-red-500 text-xs mt-1">{errors.price}</p>}
          </div>

          {/* Weekend & Day of Week */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-bold text-gray-900 mb-2">
                Ngày trong tuần
              </label>
              <select
                name="dayOfWeek"
                value={formData.dayOfWeek}
                onChange={handleChange}
                className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:border-purple-600 focus:ring-2 focus:ring-purple-600/20 outline-none transition-all"
              >
                <option value="">Tất cả các ngày</option>
                {daysOfWeek.map(day => (
                  <option key={day.value} value={day.value}>
                    {day.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex items-end">
              <label className="flex items-center gap-3 cursor-pointer bg-gray-50 px-4 py-3 rounded-lg border border-gray-200 hover:bg-gray-100 transition-colors w-full">
                <input
                  type="checkbox"
                  name="isWeekend"
                  checked={formData.isWeekend}
                  onChange={handleChange}
                  className="w-5 h-5 text-purple-600 rounded focus:ring-2 focus:ring-purple-600/20"
                />
                <span className="text-sm font-bold text-gray-900">Áp dụng cuối tuần</span>
              </label>
            </div>
          </div>

          {/* Effective Dates */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-bold text-gray-900 mb-2">
                Ngày bắt đầu <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                name="effectiveFrom"
                value={formData.effectiveFrom}
                onChange={handleChange}
                className={`w-full px-4 py-2.5 rounded-lg border ${
                  errors.effectiveFrom ? 'border-red-500' : 'border-gray-300'
                } focus:border-purple-600 focus:ring-2 focus:ring-purple-600/20 outline-none transition-all`}
              />
              {errors.effectiveFrom && <p className="text-red-500 text-xs mt-1">{errors.effectiveFrom}</p>}
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-900 mb-2">
                Ngày kết thúc <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                name="effectiveTo"
                value={formData.effectiveTo}
                onChange={handleChange}
                className={`w-full px-4 py-2.5 rounded-lg border ${
                  errors.effectiveTo ? 'border-red-500' : 'border-gray-300'
                } focus:border-purple-600 focus:ring-2 focus:ring-purple-600/20 outline-none transition-all`}
              />
              {errors.effectiveTo && <p className="text-red-500 text-xs mt-1">{errors.effectiveTo}</p>}
            </div>
          </div>

          {/* Active Status */}
          <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                name="isActive"
                checked={formData.isActive}
                onChange={handleChange}
                className="w-5 h-5 text-purple-600 rounded focus:ring-2 focus:ring-purple-600/20"
              />
              <div>
                <span className="text-sm font-bold text-gray-900 block">Kích hoạt quy tắc giá</span>
                <span className="text-xs text-gray-600">Quy tắc giá sẽ được áp dụng ngay lập tức</span>
              </div>
            </label>
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-4 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="flex-1 px-4 py-2.5 bg-white border border-gray-300 text-gray-900 rounded-lg font-bold hover:bg-gray-50 transition-colors disabled:opacity-50"
            >
              Hủy
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 px-4 py-2.5 bg-purple-600 text-white rounded-lg font-bold hover:bg-purple-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <LoadingSpinner size="sm" />
                  <span>Đang xử lý...</span>
                </>
              ) : (
                <span>{isCreate ? 'Tạo quy tắc giá' : 'Cập nhật'}</span>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default PriceRuleFormModal;
