import { useState, useEffect, useMemo } from 'react';
import courtPriceService from '../../services/courtPriceService';
import courtService from '../../services/courtService';
import CourtPriceFormModal from '../../components/admin/CourtPriceFormModal';
import ConfirmDialog from '../../components/common/ConfirmDialog';
import Toast from '../../components/common/Toast';
import TableSkeleton from '../../components/common/TableSkeleton';
import useDataStore from '../../store/useDataStore';

import systemConfigService from '../../services/systemConfigService';

const CourtPriceManagement = () => {
  const {
    courtPrices: cachedCourtPrices,
    courts: cachedCourts,
    isCacheValid,
    setCourtPrices,
    setCourts,
    updateCourtPrice,
    addCourtPrice,
    deleteCourtPrice
  } = useDataStore();


  const [allCourtPrices, setAllCourtPrices] = useState([]); // Store all prices
  const [courts, setCourtsLocal] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCourtPrice, setSelectedCourtPrice] = useState(null);
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [priceToDelete, setPriceToDelete] = useState(null);
  const [toast, setToast] = useState({ show: false, message: '', type: '' });
  const [isCreating, setIsCreating] = useState(false);
  const [selectedCourtId, setSelectedCourtId] = useState('all'); // 'all' or specific court id
  const [selectedDayType, setSelectedDayType] = useState('');
  const [viewMode, setViewMode] = useState('all'); // 'all' or 'single'
  const [isInitModalOpen, setIsInitModalOpen] = useState(false);

  const [initTargetCourtId, setInitTargetCourtId] = useState('');

  // Default Price Template State
  const getDefaultTemplate = () => [
    // WEEKDAY prices
    { dayType: 'WEEKDAY', startTime: '06:00', endTime: '08:00', pricePerHour: 60000, label: 'Sáng sớm' },
    { dayType: 'WEEKDAY', startTime: '08:00', endTime: '11:00', pricePerHour: 80000, label: 'Sáng' },
    { dayType: 'WEEKDAY', startTime: '11:00', endTime: '14:00', pricePerHour: 60000, label: 'Trưa' },
    { dayType: 'WEEKDAY', startTime: '14:00', endTime: '17:00', pricePerHour: 80000, label: 'Chiều' },
    { dayType: 'WEEKDAY', startTime: '17:00', endTime: '21:00', pricePerHour: 120000, label: 'Giờ vàng' },
    { dayType: 'WEEKDAY', startTime: '21:00', endTime: '22:00', pricePerHour: 80000, label: 'Tối' },
    // WEEKEND prices
    { dayType: 'WEEKEND', startTime: '06:00', endTime: '08:00', pricePerHour: 80000, label: 'Sáng sớm' },
    { dayType: 'WEEKEND', startTime: '08:00', endTime: '11:00', pricePerHour: 100000, label: 'Sáng' },
    { dayType: 'WEEKEND', startTime: '11:00', endTime: '14:00', pricePerHour: 80000, label: 'Trưa' },
    { dayType: 'WEEKEND', startTime: '14:00', endTime: '17:00', pricePerHour: 100000, label: 'Chiều' },
    { dayType: 'WEEKEND', startTime: '17:00', endTime: '21:00', pricePerHour: 150000, label: 'Giờ vàng' },
    { dayType: 'WEEKEND', startTime: '21:00', endTime: '22:00', pricePerHour: 100000, label: 'Tối' },
    // HOLIDAY prices
    { dayType: 'HOLIDAY', startTime: '06:00', endTime: '08:00', pricePerHour: 100000, label: 'Sáng sớm' },
    { dayType: 'HOLIDAY', startTime: '08:00', endTime: '11:00', pricePerHour: 120000, label: 'Sáng' },
    { dayType: 'HOLIDAY', startTime: '11:00', endTime: '14:00', pricePerHour: 100000, label: 'Trưa' },
    { dayType: 'HOLIDAY', startTime: '14:00', endTime: '17:00', pricePerHour: 120000, label: 'Chiều' },
    { dayType: 'HOLIDAY', startTime: '17:00', endTime: '21:00', pricePerHour: 180000, label: 'Giờ vàng' },
    { dayType: 'HOLIDAY', startTime: '21:00', endTime: '22:00', pricePerHour: 120000, label: 'Tối' },
  ];
  const [defaultPriceTemplate, setDefaultPriceTemplate] = useState(getDefaultTemplate());
  const [deleteExistingFirst, setDeleteExistingFirst] = useState(false);

  // System Config State
  const [isConfigModalOpen, setIsConfigModalOpen] = useState(false);
  const [systemConfigs, setSystemConfigs] = useState({
    openTime: '05:00',
    closeTime: '22:00',
    slotDuration: '60',
    minBookingDuration: '60',
    maxBookingHours: '3'
  });

  // Memoized filtered prices
  const filteredCourtPrices = useMemo(() => {
    let filtered = [...allCourtPrices];

    // Filter by court if not viewing all
    if (selectedCourtId !== 'all') {
      filtered = filtered.filter(
        price => price.courtId === parseInt(selectedCourtId)
      );
    }

    // Filter by day type if selected
    if (selectedDayType) {
      filtered = filtered.filter(price => price.dayType === selectedDayType);
    }

    return filtered;
  }, [allCourtPrices, selectedCourtId, selectedDayType]);

  useEffect(() => {
    fetchInitialData();
  }, []);



  const fetchInitialData = async () => {
    setLoading(true);
    try {
      // Check cache first
      const hasCachedPrices = cachedCourtPrices.data && isCacheValid(cachedCourtPrices.lastFetch);
      const hasCachedCourts = cachedCourts.data && isCacheValid(cachedCourts.lastFetch);

      if (hasCachedPrices && hasCachedCourts) {
        // Use cached data
        console.log('Using cached data');
        const mappedCourts = cachedCourts.data.map(court => ({
          id: court.id,
          courtName: court.name || court.courtName,
          courtType: court.type || court.courtType,
          status: court.status,
          location: court.location
        }));
        setCourtsLocal(mappedCourts);
        setAllCourtPrices(cachedCourtPrices.data);

        if (mappedCourts.length > 0) {
          setSelectedCourtId('all');
        }
        setLoading(false);
        return;
      }

      // Fetch from API
      console.log('Fetching from API');
      const [courtsData, pricesData] = await Promise.all([
        hasCachedCourts ? Promise.resolve(cachedCourts.data) : courtService.getAllCourts(0, 100),
        hasCachedPrices ? Promise.resolve(cachedCourtPrices.data) : courtPriceService.getAllPrices()
      ]);

      // Map courts
      const mappedCourts = (courtsData.content || courtsData).map(court => ({
        id: court.id,
        courtName: court.name || court.courtName,
        courtType: court.type || court.courtType,
        status: court.status,
        location: court.location
      }));
      setCourtsLocal(mappedCourts);

      // Set all prices
      setAllCourtPrices(pricesData || []);

      // Cache the data
      if (!hasCachedCourts) {
        setCourts(courtsData.content || courtsData);
      }
      if (!hasCachedPrices) {
        setCourtPrices(pricesData || []);
      }

      // Select first court by default
      if (mappedCourts.length > 0) {
        setSelectedCourtId('all'); // Start with all courts view
      }
    } catch (error) {
      console.error('Error fetching initial data:', error);
      if (error.response?.status !== 403) {
        showToast('Lỗi khi tải dữ liệu', 'error');
      }
    } finally {
      setLoading(false);
    }
  };



  const fetchCourts = async () => {
    try {
      const data = await courtService.getAllCourts(0, 100);
      const mappedCourts = (data.content || []).map(court => ({
        id: court.id,
        courtName: court.name,
        courtType: court.type,
        status: court.status,
        location: court.location
      }));
      setCourtsLocal(mappedCourts);
      setCourts(data.content || []);
      if (mappedCourts.length > 0) {
        setSelectedCourtId(mappedCourts[0].id.toString());
      }
    } catch (error) {
      showToast('Lỗi khi tải danh sách sân', 'error');
    }
  };

  const fetchCourtPrices = async () => {
    try {
      const data = await courtPriceService.getAllPrices();
      setAllCourtPrices(data || []);
      setCourtPrices(data || []);
    } catch (error) {
      console.error('Error fetching court prices:', error);
      if (error.response?.status !== 403 && error.response?.status !== 404) {
        showToast('Lỗi khi tải giá sân', 'error');
      }
    }
  };

  const showToast = (message, type) => {
    setToast({ show: true, message, type });
  };

  const handleEdit = async (priceId) => {
    setIsCreating(false);
    try {
      // Find price in local state first for faster UI
      const localPrice = allCourtPrices.find(p => p.id === priceId);
      if (localPrice) {
        setSelectedCourtPrice(localPrice);
        setIsFormModalOpen(true);
      } else {
        // Fallback to API if not found locally
        const price = await courtPriceService.getPriceById(priceId);
        setSelectedCourtPrice(price);
        setIsFormModalOpen(true);
      }
    } catch (error) {
      showToast('Lỗi khi tải thông tin giá', 'error');
    }
  };

  const handleDeleteClick = (price) => {
    setPriceToDelete(price);
    setIsDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    const priceId = priceToDelete.id;
    console.log('Deleting price ID:', priceId);

    // Optimistic update - remove from UI and cache immediately
    setAllCourtPrices(prev => prev.filter(p => p.id !== priceId));
    deleteCourtPrice(priceId);
    setIsDeleteDialogOpen(false);
    setPriceToDelete(null);

    try {
      const response = await courtPriceService.deletePrice(priceId);
      console.log('Delete response:', response);
      showToast('Xóa giá thành công', 'success');
    } catch (error) {
      console.error('Error deleting price:', error);
      console.error('Error response:', error.response?.data);
      // Rollback on error
      showToast(error.response?.data?.message || 'Lỗi khi xóa giá', 'error');
      await fetchCourtPrices(); // Refresh to get correct state
    }
  };

  const handleFormSubmit = async (priceData) => {
    console.log('Submitting price data:', priceData);

    try {
      if (isCreating) {
        // Create new price
        const newPrice = await courtPriceService.createPrice(priceData);
        console.log('Created price response:', newPrice);

        // Add courtName from courts list if not included in response
        if (!newPrice.courtName) {
          const court = courts.find(c => c.id === newPrice.courtId);
          newPrice.courtName = court?.courtName || `Sân #${newPrice.courtId}`;
        }

        // Optimistic update - add to UI and cache immediately
        setAllCourtPrices(prev => [...prev, newPrice]);
        addCourtPrice(newPrice);
        showToast('Thêm giá thành công', 'success');
      } else {
        // Update existing price
        const updatedPrice = await courtPriceService.updatePrice(selectedCourtPrice.id, priceData);
        console.log('Updated price response:', updatedPrice);

        // Add courtName from courts list if not included in response
        if (!updatedPrice.courtName) {
          const court = courts.find(c => c.id === updatedPrice.courtId);
          updatedPrice.courtName = court?.courtName || selectedCourtPrice.courtName || `Sân #${updatedPrice.courtId}`;
        }

        // Optimistic update - update in UI and cache immediately
        setAllCourtPrices(prev =>
          prev.map(p => p.id === selectedCourtPrice.id ? updatedPrice : p)
        );
        updateCourtPrice(updatedPrice);
        showToast('Cập nhật giá thành công', 'success');
      }

      setIsFormModalOpen(false);
      setSelectedCourtPrice(null);
      setIsCreating(false);
    } catch (error) {
      console.error('Error submitting form:', error);
      console.error('Error response:', error.response?.data);
      showToast(
        error.response?.data?.message || (isCreating ? 'Lỗi khi thêm giá' : 'Lỗi khi cập nhật giá'),
        'error'
      );
      // Refresh on error to get correct state
      await fetchCourtPrices();
    }
  };

  const handleAddPrice = () => {
    setIsCreating(true);
    setSelectedCourtPrice(null);
    setIsFormModalOpen(true);
  };

  const handleInitDefaultPrices = () => {
    if (viewMode === 'single' && selectedCourtId !== 'all') {
      // In single mode, just confirm
      setInitTargetCourtId(selectedCourtId);
      setIsInitModalOpen(true);
    } else {
      // In all mode, open modal to select court
      setInitTargetCourtId(courts.length > 0 ? courts[0].id : '');
      setIsInitModalOpen(true);
    }
  };

  const handleConfirmInit = async () => {
    if (!initTargetCourtId) return;

    // Validate prices >= 1000
    const invalidPrices = defaultPriceTemplate.filter(t => t.pricePerHour < 1000);
    if (invalidPrices.length > 0) {
      showToast(`Có ${invalidPrices.length} khung giá dưới 1,000đ. Vui lòng sửa lại!`, 'error');
      return;
    }

    try {
      setLoading(true);
      const courtId = parseInt(initTargetCourtId);

      // Prepare prices data for batch API
      const prices = defaultPriceTemplate.map(template => ({
        courtId: courtId,
        dayType: template.dayType,
        startTime: template.startTime,
        endTime: template.endTime,
        pricePerHour: Number(template.pricePerHour),
        isActive: true
      }));

      // Call batch API
      const result = await courtPriceService.createPricesBatch(prices, deleteExistingFirst);

      if (result.successCount > 0) {
        showToast(result.message, 'success');
      } else {
        showToast(result.message, 'warning');
      }

      await fetchCourtPrices();
      setIsInitModalOpen(false);
      setDeleteExistingFirst(false);
    } catch (error) {
      showToast('Lỗi khi tạo bảng giá mặc định', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleResetTemplate = () => {
    setDefaultPriceTemplate(getDefaultTemplate());
    showToast('Đã reset về giá mặc định', 'success');
  };

  const handleTemplateChange = (index, field, value) => {
    setDefaultPriceTemplate(prev =>
      prev.map((item, i) => i === index ? { ...item, [field]: field === 'pricePerHour' ? parseInt(value) || 0 : value } : item)
    );
  };

  const handleOpenConfigModal = async () => {
    try {
      setIsConfigModalOpen(true);
      const configs = await systemConfigService.getAllConfigs();
      // Map array to object
      const configMap = {};
      configs.forEach(c => configMap[c.configKey] = c.configValue);

      setSystemConfigs({
        openTime: configMap['open_time'] || '05:00',
        closeTime: configMap['close_time'] || '22:00',
        slotDuration: configMap['slot_duration'] || '60',
        minBookingDuration: configMap['min_booking_duration'] || '60',
        maxBookingHours: configMap['max_booking_hours'] || '3'
      });
    } catch (error) {
      showToast('Lỗi khi tải cấu hình hệ thống', 'error');
    }
  };

  const handleSaveConfigs = async () => {
    try {
      const updates = [
        { configKey: 'open_time', configValue: systemConfigs.openTime },
        { configKey: 'close_time', configValue: systemConfigs.closeTime },
        { configKey: 'slot_duration', configValue: systemConfigs.slotDuration },
        { configKey: 'min_booking_duration', configValue: systemConfigs.minBookingDuration },
        { configKey: 'max_booking_hours', configValue: systemConfigs.maxBookingHours }
      ];

      await systemConfigService.updateConfigs(updates);
      showToast('Cập nhật cấu hình thành công!', 'success');
      setIsConfigModalOpen(false);
    } catch (error) {
      showToast('Lỗi khi lưu cấu hình', 'error');
      console.error(error);
    }
  };

  const getCourtName = (courtId) => {
    const court = courts.find(c => c.id === courtId);
    return court ? court.courtName : `Sân #${courtId}`;
  };

  const getDayTypeBadge = (dayType) => {
    const config = {
      WEEKDAY: { bg: 'bg-blue-100', text: 'text-blue-700', border: 'border-blue-200', label: 'Ngày thường', icon: 'work' },
      WEEKEND: { bg: 'bg-orange-100', text: 'text-orange-700', border: 'border-orange-200', label: 'Cuối tuần', icon: 'weekend' },
      HOLIDAY: { bg: 'bg-purple-100', text: 'text-purple-700', border: 'border-purple-200', label: 'Ngày lễ', icon: 'celebration' }
    };
    const style = config[dayType] || config.WEEKDAY;
    return (
      <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold ${style.bg} ${style.text} border ${style.border}`}>
        <span className="material-symbols-outlined text-sm">{style.icon}</span>
        {style.label}
      </span>
    );
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(price);
  };

  const getStatusBadge = (isActive) => {
    return (
      <div className="flex items-center gap-1.5">
        <span className={`w-2 h-2 rounded-full ${isActive ? 'bg-green-500' : 'bg-gray-400'}`}></span>
        <span className={`text-sm font-medium ${isActive ? 'text-green-700' : 'text-gray-600'}`}>
          {isActive ? 'Đang áp dụng' : 'Tạm dừng'}
        </span>
      </div>
    );
  };

  const groupedPrices = useMemo(() => {
    return filteredCourtPrices.reduce((acc, price) => {
      if (!acc[price.dayType]) {
        acc[price.dayType] = [];
      }
      acc[price.dayType].push(price);
      return acc;
    }, {});
  }, [filteredCourtPrices]);

  const dayTypeOrder = ['WEEKDAY', 'WEEKEND', 'HOLIDAY'];

  return (
    <div className="flex-1 overflow-y-auto p-4 md:p-8 bg-gray-50">
      <div className="max-w-7xl mx-auto flex flex-col gap-6">
        {/* Page Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-black text-gray-900 tracking-tight">Quản lý giá sân</h1>
            <p className="text-gray-600 text-sm mt-1">Thiết lập giá theo khung giờ và loại ngày cho từng sân.</p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={handleInitDefaultPrices}
              className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg text-gray-900 text-sm font-bold hover:bg-gray-50 transition-colors shadow-sm"
            >
              <span className="material-symbols-outlined text-lg">auto_awesome</span>
              Tạo giá mặc định
            </button>
            <button
              onClick={handleOpenConfigModal}
              className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg text-gray-900 text-sm font-bold hover:bg-gray-50 transition-colors shadow-sm"
              title="Cấu hình giờ mở cửa, thời gian đặt..."
            >
              <span className="material-symbols-outlined text-lg">settings</span>
              Cấu hình chung
            </button>
            <button
              onClick={handleAddPrice}
              className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg text-sm font-bold hover:bg-purple-700 transition-colors shadow-md shadow-purple-600/20"
            >
              <span className="material-symbols-outlined text-lg">add</span>
              Thêm giá
            </button>
          </div>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm">
            <div className="flex justify-between items-start mb-3">
              <p className="text-gray-600 font-medium text-sm">Tổng khung giá</p>
              <span className="material-symbols-outlined text-purple-600 bg-purple-100 p-1 rounded-md text-xl">sell</span>
            </div>
            <p className="text-3xl font-bold text-gray-900">{filteredCourtPrices.length}</p>
          </div>

          <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm">
            <div className="flex justify-between items-start mb-3">
              <p className="text-gray-600 font-medium text-sm">Đang áp dụng</p>
              <span className="material-symbols-outlined text-green-600 bg-green-100 p-1 rounded-md text-xl">check_circle</span>
            </div>
            <p className="text-3xl font-bold text-gray-900">
              {filteredCourtPrices.filter(p => p.isActive).length}
            </p>
          </div>

          <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm">
            <div className="flex justify-between items-start mb-3">
              <p className="text-gray-600 font-medium text-sm">Ngày thường</p>
              <span className="material-symbols-outlined text-blue-600 bg-blue-100 p-1 rounded-md text-xl">work</span>
            </div>
            <p className="text-3xl font-bold text-gray-900">
              {filteredCourtPrices.filter(p => p.dayType === 'WEEKDAY').length}
            </p>
          </div>

          <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm">
            <div className="flex justify-between items-start mb-3">
              <p className="text-gray-600 font-medium text-sm">Cuối tuần</p>
              <span className="material-symbols-outlined text-orange-600 bg-orange-100 p-1 rounded-md text-xl">weekend</span>
            </div>
            <p className="text-3xl font-bold text-gray-900">
              {filteredCourtPrices.filter(p => p.dayType === 'WEEKEND').length}
            </p>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4">
          <div className="flex flex-col gap-4">
            {/* View Mode Toggle */}
            <div className="flex gap-2 p-1 bg-gray-100 rounded-lg w-fit">
              <button
                onClick={() => {
                  setViewMode('all');
                  setSelectedCourtId('all');
                }}
                className={`px-4 py-2 rounded-md text-sm font-bold transition-all ${viewMode === 'all'
                  ? 'bg-white text-purple-600 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
                  }`}
              >
                <span className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-lg">grid_view</span>
                  Tất cả sân
                </span>
              </button>
              <button
                onClick={() => {
                  setViewMode('single');
                  if (courts.length > 0) {
                    setSelectedCourtId(courts[0].id.toString());
                  }
                }}
                className={`px-4 py-2 rounded-md text-sm font-bold transition-all ${viewMode === 'single'
                  ? 'bg-white text-purple-600 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
                  }`}
              >
                <span className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-lg">filter_list</span>
                  Từng sân
                </span>
              </button>
            </div>

            <div className="flex flex-col lg:flex-row gap-4">
              {/* Court Selection - Only show in single mode */}
              {viewMode === 'single' && (
                <div className="flex-1">
                  <label className="block text-sm font-bold text-gray-900 mb-2">Chọn sân</label>
                  <select
                    value={selectedCourtId}
                    onChange={(e) => setSelectedCourtId(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-lg bg-gray-50 border-transparent focus:bg-white focus:border-purple-600 focus:ring-2 focus:ring-purple-600/20 text-sm font-medium text-gray-900 cursor-pointer outline-none transition-all"
                  >
                    {courts.map(court => (
                      <option key={court.id} value={court.id}>
                        {court.courtName} - {court.courtType}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {/* Day Type Filter */}
              <div className={viewMode === 'single' ? 'flex-1' : 'w-full lg:w-80'}>
                <label className="block text-sm font-bold text-gray-900 mb-2">Lọc theo loại ngày</label>
                <select
                  value={selectedDayType}
                  onChange={(e) => setSelectedDayType(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-lg bg-gray-50 border-transparent focus:bg-white focus:border-purple-600 focus:ring-2 focus:ring-purple-600/20 text-sm font-medium text-gray-900 cursor-pointer outline-none transition-all"
                >
                  <option value="">Tất cả loại ngày</option>
                  <option value="WEEKDAY">Ngày thường</option>
                  <option value="WEEKEND">Cuối tuần</option>
                  <option value="HOLIDAY">Ngày lễ</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Price Tables by Day Type */}
        {loading ? (
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
            <TableSkeleton rows={8} columns={6} />
          </div>
        ) : filteredCourtPrices.length === 0 ? (
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-12">
            <div className="flex flex-col items-center gap-3 text-center">
              <span className="material-symbols-outlined text-6xl text-gray-300">sell</span>
              <p className="text-lg font-medium text-gray-500">Chưa có giá nào cho sân này</p>
              <p className="text-sm text-gray-400">Nhấn "Tạo giá mặc định" hoặc "Thêm giá" để bắt đầu</p>
              <div className="flex gap-3 mt-4">
                <button
                  onClick={handleInitDefaultPrices}
                  className="px-4 py-2 bg-white border border-gray-300 text-gray-900 rounded-lg text-sm font-bold hover:bg-gray-50 transition-colors"
                >
                  Tạo giá mặc định
                </button>
                <button
                  onClick={handleAddPrice}
                  className="px-4 py-2 bg-purple-600 text-white rounded-lg text-sm font-bold hover:bg-purple-700 transition-colors"
                >
                  Thêm giá thủ công
                </button>
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            {dayTypeOrder.map(dayType => {
              const prices = groupedPrices[dayType];
              if (!prices || prices.length === 0) return null;

              return (
                <div key={dayType} className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                  <div className="bg-gray-50 px-6 py-4 border-b border-gray-200 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      {getDayTypeBadge(dayType)}
                      <span className="text-sm text-gray-600">
                        {prices.length} khung giờ
                      </span>
                    </div>
                  </div>

                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="bg-gray-50 border-b border-gray-200 text-xs uppercase text-gray-600 font-semibold">
                          {viewMode === 'all' && <th className="p-4">Sân</th>}
                          <th className="p-4">Khung giờ</th>
                          <th className="p-4">Giá/giờ</th>
                          <th className="p-4">Trạng thái</th>
                          <th className="p-4">Cập nhật</th>
                          <th className="p-4 text-right">Thao tác</th>
                        </tr>
                      </thead>
                      <tbody className="text-sm">
                        {prices
                          .sort((a, b) => {
                            // Sort by court name first if in all view, then by time
                            if (viewMode === 'all') {
                              const courtCompare = (a.courtName || '').localeCompare(b.courtName || '');
                              if (courtCompare !== 0) return courtCompare;
                            }
                            return a.startTime.localeCompare(b.startTime);
                          })
                          .map((price) => (
                            <tr
                              key={price.id}
                              className="border-b border-gray-200 hover:bg-gray-50 transition-colors"
                            >
                              {viewMode === 'all' && (
                                <td className="p-4">
                                  <div className="flex items-center gap-2">
                                    <span className="material-symbols-outlined text-purple-600">sports_tennis</span>
                                    <span className="font-bold text-gray-900">{price.courtName}</span>
                                  </div>
                                </td>
                              )}
                              <td className="p-4">
                                <div className="flex items-center gap-2">
                                  <span className="material-symbols-outlined text-purple-600">schedule</span>
                                  <span className="font-bold text-gray-900">
                                    {price.startTime} - {price.endTime}
                                  </span>
                                </div>
                              </td>
                              <td className="p-4">
                                <span className="text-lg font-bold text-purple-600">
                                  {formatPrice(price.pricePerHour)}
                                </span>
                              </td>
                              <td className="p-4">{getStatusBadge(price.isActive)}</td>
                              <td className="p-4 text-gray-600 text-xs">
                                {price.updatedAt ? new Date(price.updatedAt).toLocaleString('vi-VN') : '-'}
                              </td>
                              <td className="p-4 text-right">
                                <div className="flex items-center justify-end gap-2">
                                  <button
                                    onClick={() => handleEdit(price.id)}
                                    className="p-1.5 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors"
                                    title="Chỉnh sửa"
                                  >
                                    <span className="material-symbols-outlined text-lg">edit</span>
                                  </button>
                                  <button
                                    onClick={() => handleDeleteClick(price)}
                                    className="p-1.5 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
                                    title="Xóa"
                                  >
                                    <span className="material-symbols-outlined text-lg">delete</span>
                                  </button>
                                </div>
                              </td>
                            </tr>
                          ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Modals */}
        {/* ... (keep existing modals) ... */}



        {/* System Config Modal */}
        {isConfigModalOpen && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[100] p-4">
            <div className="bg-white rounded-xl shadow-xl w-full max-w-lg overflow-hidden">
              <div className="p-6">
                <div className="flex items-center gap-3 mb-6 text-gray-900 border-b pb-4">
                  <span className="material-symbols-outlined text-3xl text-gray-700">settings</span>
                  <div>
                    <h3 className="text-xl font-bold">Cấu hình chung</h3>
                    <p className="text-sm text-gray-500">Giờ mở cửa và quy tắc đặt sân áp dụng toàn hệ thống</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 mb-6">
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-1">Giờ mở cửa</label>
                    <input
                      type="time"
                      value={systemConfigs.openTime}
                      onChange={(e) => setSystemConfigs({ ...systemConfigs, openTime: e.target.value })}
                      className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:border-purple-600 focus:ring-2 focus:ring-purple-600/20 outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-1">Giờ đóng cửa</label>
                    <input
                      type="time"
                      value={systemConfigs.closeTime}
                      onChange={(e) => setSystemConfigs({ ...systemConfigs, closeTime: e.target.value })}
                      className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:border-purple-600 focus:ring-2 focus:ring-purple-600/20 outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-1">Thời lượng slot (phút)</label>
                    <input
                      type="number"
                      value={systemConfigs.slotDuration}
                      onChange={(e) => setSystemConfigs({ ...systemConfigs, slotDuration: e.target.value })}
                      className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:border-purple-600 focus:ring-2 focus:ring-purple-600/20 outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-1">Đặt tối thiểu (phút)</label>
                    <input
                      type="number"
                      value={systemConfigs.minBookingDuration}
                      onChange={(e) => setSystemConfigs({ ...systemConfigs, minBookingDuration: e.target.value })}
                      className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:border-purple-600 focus:ring-2 focus:ring-purple-600/20 outline-none"
                    />
                  </div>
                  <div className="col-span-2">
                    <label className="block text-sm font-bold text-gray-700 mb-1">Thời gian đặt tối đa (giờ)</label>
                    <input
                      type="number"
                      value={systemConfigs.maxBookingHours}
                      onChange={(e) => setSystemConfigs({ ...systemConfigs, maxBookingHours: e.target.value })}
                      className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:border-purple-600 focus:ring-2 focus:ring-purple-600/20 outline-none"
                    />
                  </div>
                </div>

                <div className="flex gap-3 pt-2">
                  <button
                    onClick={() => setIsConfigModalOpen(false)}
                    className="flex-1 px-4 py-2.5 bg-gray-100 text-gray-700 rounded-lg font-bold hover:bg-gray-200 transition-colors"
                  >
                    Hủy
                  </button>
                  <button
                    onClick={handleSaveConfigs}
                    className="flex-1 px-4 py-2.5 bg-gray-900 text-white rounded-lg font-bold hover:bg-gray-800 transition-colors shadow-md"
                  >
                    Lưu cấu hình
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Init Default Modal - Editable Template */}
        {isInitModalOpen && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[100] p-4">
            <div className="bg-white rounded-xl shadow-xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
              <div className="p-6 border-b">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3 text-purple-600">
                    <span className="material-symbols-outlined text-3xl">auto_awesome</span>
                    <div>
                      <h3 className="text-xl font-bold text-gray-900">Tạo giá mặc định</h3>
                      <p className="text-sm text-gray-500">Chỉnh sửa giá trước khi áp dụng cho sân</p>
                    </div>
                  </div>
                  <button onClick={() => setIsInitModalOpen(false)} className="text-gray-400 hover:text-gray-600">
                    <span className="material-symbols-outlined">close</span>
                  </button>
                </div>
              </div>

              <div className="p-6 overflow-y-auto flex-1">
                {/* Court Selection */}
                <div className="mb-6 flex flex-wrap items-end gap-4">
                  <div>
                    <label className="block text-sm font-bold text-gray-900 mb-2">Chọn sân áp dụng</label>
                    <select
                      value={initTargetCourtId}
                      onChange={(e) => setInitTargetCourtId(e.target.value)}
                      className="w-full max-w-xs px-4 py-2.5 rounded-lg border border-gray-300 focus:border-purple-600 focus:ring-2 focus:ring-purple-600/20 outline-none text-gray-900 bg-white"
                    >
                      {!initTargetCourtId && <option value="">-- Chọn sân --</option>}
                      {courts.map(court => (
                        <option key={court.id} value={court.id} className="text-gray-900">
                          {court.courtName} - {court.courtType}
                        </option>
                      ))}
                    </select>
                  </div>
                  <button
                    onClick={handleResetTemplate}
                    className="px-4 py-2.5 text-sm bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors flex items-center gap-1"
                  >
                    <span className="material-symbols-outlined text-sm">refresh</span>
                    Reset giá mặc định
                  </button>
                </div>

                {/* Delete existing option */}
                <div className="mb-4 p-3 bg-amber-50 border border-amber-200 rounded-lg">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={deleteExistingFirst}
                      onChange={(e) => setDeleteExistingFirst(e.target.checked)}
                      className="w-4 h-4 rounded border-amber-400 text-amber-600 focus:ring-amber-500"
                    />
                    <span className="text-sm text-amber-800 font-medium">
                      ⚠️ Xóa tất cả giá hiện tại của sân này trước khi tạo mới
                    </span>
                  </label>
                </div>

                {/* Price Template Tables */}
                {['WEEKDAY', 'WEEKEND', 'HOLIDAY'].map(dayType => (
                  <div key={dayType} className="mb-6">
                    <h4 className={`text-sm font-bold mb-2 ${dayType === 'WEEKDAY' ? 'text-blue-600' :
                      dayType === 'WEEKEND' ? 'text-orange-600' : 'text-purple-600'
                      }`}>
                      {dayType === 'WEEKDAY' ? '📅 Ngày thường' :
                        dayType === 'WEEKEND' ? '🎉 Cuối tuần' : '🎊 Ngày lễ'}
                    </h4>
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm">
                        <thead>
                          <tr className="bg-gray-50">
                            <th className="text-left py-2 px-3 font-medium text-gray-600">Khung giờ</th>
                            <th className="text-left py-2 px-3 font-medium text-gray-600">Bắt đầu</th>
                            <th className="text-left py-2 px-3 font-medium text-gray-600">Kết thúc</th>
                            <th className="text-left py-2 px-3 font-medium text-gray-600">Giá/giờ (VND)</th>
                          </tr>
                        </thead>
                        <tbody>
                          {defaultPriceTemplate
                            .map((item, index) => ({ ...item, originalIndex: index }))
                            .filter(item => item.dayType === dayType)
                            .map(item => (
                              <tr key={item.originalIndex} className="border-b border-gray-100">
                                <td className="py-2 px-3 text-gray-700">{item.label}</td>
                                <td className="py-2 px-3">
                                  <input
                                    type="time"
                                    value={item.startTime}
                                    onChange={(e) => handleTemplateChange(item.originalIndex, 'startTime', e.target.value)}
                                    className="px-2 py-1 border rounded text-gray-900 bg-white"
                                  />
                                </td>
                                <td className="py-2 px-3">
                                  <input
                                    type="time"
                                    value={item.endTime}
                                    onChange={(e) => handleTemplateChange(item.originalIndex, 'endTime', e.target.value)}
                                    className="px-2 py-1 border rounded text-gray-900 bg-white"
                                  />
                                </td>
                                <td className="py-2 px-3">
                                  <input
                                    type="number"
                                    value={item.pricePerHour}
                                    onChange={(e) => handleTemplateChange(item.originalIndex, 'pricePerHour', e.target.value)}
                                    className="w-28 px-2 py-1 border rounded text-gray-900 bg-white text-right"
                                    step="10000"
                                  />
                                </td>
                              </tr>
                            ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                ))}
              </div>

              <div className="p-6 border-t bg-gray-50 flex gap-3">
                <button
                  onClick={() => setIsInitModalOpen(false)}
                  className="flex-1 px-4 py-2.5 bg-white border border-gray-300 text-gray-700 rounded-lg font-bold hover:bg-gray-100 transition-colors"
                >
                  Hủy
                </button>
                <button
                  onClick={handleConfirmInit}
                  disabled={!initTargetCourtId || loading}
                  className="flex-1 px-4 py-2.5 bg-purple-600 text-white rounded-lg font-bold hover:bg-purple-700 transition-colors shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? 'Đang tạo...' : `Tạo ${defaultPriceTemplate.length} khung giá`}
                </button>
              </div>
            </div>
          </div>
        )}

        {
          isFormModalOpen && (
            <CourtPriceFormModal
              courtPrice={selectedCourtPrice}
              isCreate={isCreating}
              onClose={() => {
                setIsFormModalOpen(false);
                setSelectedCourtPrice(null);
                setIsCreating(false);
              }}
              onSubmit={handleFormSubmit}
            />
          )
        }

        {
          isDeleteDialogOpen && (
            <ConfirmDialog
              isOpen={isDeleteDialogOpen}
              title="Xác nhận xóa"
              message={`Bạn có chắc chắn muốn xóa khung giá ${priceToDelete?.startTime} - ${priceToDelete?.endTime}?`}
              onConfirm={handleDeleteConfirm}
              onCancel={() => {
                setIsDeleteDialogOpen(false);
                setPriceToDelete(null);
              }}
            />
          )
        }

        {
          toast.show && (
            <Toast
              message={toast.message}
              type={toast.type}
              onClose={() => setToast({ show: false, message: '', type: '' })}
            />
          )
        }
      </div >
    </div >
  );
};

export default CourtPriceManagement;
