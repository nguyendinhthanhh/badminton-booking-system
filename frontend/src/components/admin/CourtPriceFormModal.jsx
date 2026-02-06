import { useState, useEffect, useRef } from 'react';
import courtService from '../../services/courtService';
import LoadingSpinner from '../common/LoadingSpinner';

const CourtPriceFormModal = ({ courtPrice, isCreate, onClose, onSubmit }) => {
  const [formData, setFormData] = useState({
    courtId: '',
    dayType: 'WEEKDAY',
    startTime: '',
    endTime: '',
    pricePerHour: '',
    isActive: true
  });

  const [courts, setCourts] = useState([]);
  const [filteredCourts, setFilteredCourts] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [showDropdown, setShowDropdown] = useState(false);
  const [selectedCourtName, setSelectedCourtName] = useState('');
  const [loadingCourts, setLoadingCourts] = useState(true);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const dropdownRef = useRef(null);
  const searchInputRef = useRef(null);

  const dayTypes = [
    { value: 'WEEKDAY', label: 'Ngày thường', icon: 'work', color: 'blue' },
    { value: 'WEEKEND', label: 'Cuối tuần', icon: 'weekend', color: 'orange' },
    { value: 'HOLIDAY', label: 'Ngày lễ', icon: 'celebration', color: 'purple' }
  ];

  useEffect(() => {
    fetchCourts();
    if (!isCreate && courtPrice) {
      console.log('Editing court price:', courtPrice);
      setFormData({
        courtId: courtPrice.courtId || '',
        dayType: courtPrice.dayType || 'WEEKDAY',
        startTime: courtPrice.startTime || '',
        endTime: courtPrice.endTime || '',
        pricePerHour: courtPrice.pricePerHour || '',
        isActive: courtPrice.isActive !== undefined ? courtPrice.isActive : true
      });
      
      // Set selected court name for display
      if (courtPrice.courtName) {
        setSelectedCourtName(courtPrice.courtName);
        setSearchTerm(courtPrice.courtName);
      }
    }
  }, [courtPrice, isCreate]);

  useEffect(() => {
    // Filter courts based on search term
    if (searchTerm) {
      const filtered = courts.filter(court =>
        court.courtName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        court.courtType.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredCourts(filtered);
    } else {
      setFilteredCourts(courts);
    }
  }, [searchTerm, courts]);

  useEffect(() => {
    // Close dropdown when clicking outside
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const fetchCourts = async () => {
    try {
      setLoadingCourts(true);
      const data = await courtService.getAllCourts(0, 100);
      // Map API response to match expected format
      const mappedCourts = (data.content || []).map(court => ({
        id: court.id,
        courtName: court.name,
        courtType: court.type,
        status: court.status,
        location: court.location,
        description: court.description
      }));
      setCourts(mappedCourts);
      setFilteredCourts(mappedCourts);
    } catch (error) {
      console.error('Error fetching courts:', error);
    } finally {
      setLoadingCourts(false);
    }
  };

  const handleCourtSelect = (court) => {
    setFormData(prev => ({ ...prev, courtId: court.id }));
    setSelectedCourtName(court.courtName);
    setSearchTerm(court.courtName);
    setShowDropdown(false);
    if (errors.courtId) {
      setErrors(prev => ({ ...prev, courtId: '' }));
    }
  };

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
    setShowDropdown(true);
    if (!e.target.value) {
      setFormData(prev => ({ ...prev, courtId: '' }));
      setSelectedCourtName('');
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
    
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validate = () => {
    const newErrors = {};
    
    if (!formData.courtId) newErrors.courtId = 'Vui lòng chọn sân';
    if (!formData.dayType) newErrors.dayType = 'Vui lòng chọn loại ngày';
    if (!formData.startTime) newErrors.startTime = 'Vui lòng chọn giờ bắt đầu';
    if (!formData.endTime) newErrors.endTime = 'Vui lòng chọn giờ kết thúc';
    if (!formData.pricePerHour || formData.pricePerHour < 1000) {
      newErrors.pricePerHour = 'Giá phải từ 1,000đ trở lên';
    }
    
    if (formData.startTime && formData.endTime) {
      if (formData.startTime >= formData.endTime) {
        newErrors.endTime = 'Giờ kết thúc phải sau giờ bắt đầu';
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
        courtId: parseInt(formData.courtId),
        dayType: formData.dayType,
        startTime: formData.startTime, // Already in HH:mm format from input type="time"
        endTime: formData.endTime,     // Already in HH:mm format from input type="time"
        pricePerHour: Number(formData.pricePerHour), // Backend will convert to BigDecimal
        isActive: formData.isActive
      };
      
      console.log('Submitting data:', submitData);
      await onSubmit(submitData);
    } catch (error) {
      console.error('Error submitting form:', error);
    } finally {
      setLoading(false);
    }
  };

  const getDayTypeConfig = (type) => {
    return dayTypes.find(dt => dt.value === type) || dayTypes[0];
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[100] p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between flex-shrink-0">
          <div>
            <h2 className="text-2xl font-black text-gray-900">
              {isCreate ? 'Thêm giá sân mới' : 'Chỉnh sửa giá sân'}
            </h2>
            <p className="text-sm text-gray-600 mt-1">
              {isCreate ? 'Thiết lập giá cho sân theo khung giờ và loại ngày' : 'Cập nhật thông tin giá sân'}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <span className="material-symbols-outlined text-gray-600">close</span>
          </button>
        </div>

        {/* Form - Scrollable */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto">
          <div className="p-6 space-y-6">
          {/* Court Selection with Search */}
          <div>
            <label className="block text-sm font-bold text-gray-900 mb-2">
              Sân <span className="text-red-500">*</span>
            </label>
            {loadingCourts ? (
              <div className="h-11 bg-gray-100 rounded-lg animate-pulse"></div>
            ) : (
              <div className="relative" ref={dropdownRef}>
                <div className="relative">
                  <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                    search
                  </span>
                  <input
                    ref={searchInputRef}
                    type="text"
                    value={searchTerm}
                    onChange={handleSearchChange}
                    onFocus={() => setShowDropdown(true)}
                    placeholder="Tìm kiếm sân..."
                    className={`w-full pl-10 pr-4 py-2.5 rounded-lg border ${
                      errors.courtId ? 'border-red-500' : 'border-gray-300'
                    } focus:border-purple-600 focus:ring-2 focus:ring-purple-600/20 outline-none transition-all text-gray-900 placeholder:text-gray-400`}
                  />
                  {formData.courtId && (
                    <button
                      type="button"
                      onClick={() => {
                        setFormData(prev => ({ ...prev, courtId: '' }));
                        setSearchTerm('');
                        setSelectedCourtName('');
                        searchInputRef.current?.focus();
                      }}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      <span className="material-symbols-outlined text-lg">close</span>
                    </button>
                  )}
                </div>
                
                {/* Dropdown */}
                {showDropdown && filteredCourts.length > 0 && (
                  <div className="absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                    {filteredCourts.map(court => (
                      <button
                        key={court.id}
                        type="button"
                        onClick={() => handleCourtSelect(court)}
                        className={`w-full px-4 py-3 text-left hover:bg-purple-50 transition-colors flex items-center justify-between ${
                          formData.courtId === court.id ? 'bg-purple-50' : ''
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <span className="material-symbols-outlined text-purple-600">sports_tennis</span>
                          <div>
                            <p className="font-bold text-gray-900">{court.courtName}</p>
                            <p className="text-xs text-gray-600">{court.courtType} • {court.location || 'Không có vị trí'}</p>
                          </div>
                        </div>
                        {formData.courtId === court.id && (
                          <span className="material-symbols-outlined text-purple-600">check</span>
                        )}
                      </button>
                    ))}
                  </div>
                )}
                
                {showDropdown && searchTerm && filteredCourts.length === 0 && (
                  <div className="absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg p-4 text-center text-gray-600">
                    Không tìm thấy sân nào
                  </div>
                )}
              </div>
            )}
            {errors.courtId && <p className="text-red-500 text-xs mt-1">{errors.courtId}</p>}
          </div>

          {/* Day Type Selection */}
          <div>
            <label className="block text-sm font-bold text-gray-900 mb-3">
              Loại ngày <span className="text-red-500">*</span>
            </label>
            <div className="grid grid-cols-3 gap-3">
              {dayTypes.map(type => (
                <label
                  key={type.value}
                  className={`relative flex flex-col items-center gap-2 p-4 rounded-lg border-2 cursor-pointer transition-all ${
                    formData.dayType === type.value
                      ? `border-${type.color}-600 bg-${type.color}-50`
                      : 'border-gray-200 hover:border-gray-300 bg-white'
                  }`}
                >
                  <input
                    type="radio"
                    name="dayType"
                    value={type.value}
                    checked={formData.dayType === type.value}
                    onChange={handleChange}
                    className="sr-only"
                  />
                  <span className={`material-symbols-outlined text-3xl ${
                    formData.dayType === type.value ? `text-${type.color}-600` : 'text-gray-400'
                  }`}>
                    {type.icon}
                  </span>
                  <span className={`text-sm font-bold ${
                    formData.dayType === type.value ? `text-${type.color}-700` : 'text-gray-700'
                  }`}>
                    {type.label}
                  </span>
                  {formData.dayType === type.value && (
                    <div className={`absolute top-2 right-2 w-5 h-5 bg-${type.color}-600 rounded-full flex items-center justify-center`}>
                      <span className="material-symbols-outlined text-white text-sm">check</span>
                    </div>
                  )}
                </label>
              ))}
            </div>
            {errors.dayType && <p className="text-red-500 text-xs mt-1">{errors.dayType}</p>}
          </div>

          {/* Time Range */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-bold text-gray-900 mb-2">
                Giờ bắt đầu <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                  schedule
                </span>
                <input
                  type="time"
                  name="startTime"
                  value={formData.startTime}
                  onChange={handleChange}
                  className={`w-full pl-10 pr-4 py-2.5 rounded-lg border ${
                    errors.startTime ? 'border-red-500' : 'border-gray-300'
                  } focus:border-purple-600 focus:ring-2 focus:ring-purple-600/20 outline-none transition-all text-gray-900`}
                />
              </div>
              {errors.startTime && <p className="text-red-500 text-xs mt-1">{errors.startTime}</p>}
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-900 mb-2">
                Giờ kết thúc <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                  schedule
                </span>
                <input
                  type="time"
                  name="endTime"
                  value={formData.endTime}
                  onChange={handleChange}
                  className={`w-full pl-10 pr-4 py-2.5 rounded-lg border ${
                    errors.endTime ? 'border-red-500' : 'border-gray-300'
                  } focus:border-purple-600 focus:ring-2 focus:ring-purple-600/20 outline-none transition-all text-gray-900`}
                />
              </div>
              {errors.endTime && <p className="text-red-500 text-xs mt-1">{errors.endTime}</p>}
            </div>
          </div>

          {/* Price */}
          <div>
            <label className="block text-sm font-bold text-gray-900 mb-2">
              Giá mỗi giờ (VNĐ) <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                payments
              </span>
              <input
                type="number"
                name="pricePerHour"
                value={formData.pricePerHour}
                onChange={handleChange}
                placeholder="Nhập giá"
                min="1000"
                step="1000"
                className={`w-full pl-10 pr-20 py-2.5 rounded-lg border ${
                  errors.pricePerHour ? 'border-red-500' : 'border-gray-300'
                } focus:border-purple-600 focus:ring-2 focus:ring-purple-600/20 outline-none transition-all text-gray-900 placeholder:text-gray-400`}
              />
              <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 text-sm font-medium">
                VNĐ/giờ
              </span>
            </div>
            {errors.pricePerHour && <p className="text-red-500 text-xs mt-1">{errors.pricePerHour}</p>}
            {formData.pricePerHour && formData.pricePerHour >= 1000 && (
              <p className="text-xs text-gray-600 mt-1">
                ≈ {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(formData.pricePerHour)}
              </p>
            )}
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
                <span className="text-sm font-bold text-gray-900 block">Kích hoạt giá</span>
                <span className="text-xs text-gray-600">Giá sẽ được áp dụng ngay lập tức</span>
              </div>
            </label>
          </div>
          </div>

          {/* Actions - Fixed at bottom */}
          <div className="flex-shrink-0 bg-white border-t border-gray-200 px-6 py-4">
            <div className="flex gap-3">
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
                  <span>{isCreate ? 'Tạo giá sân' : 'Cập nhật'}</span>
                )}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CourtPriceFormModal;
