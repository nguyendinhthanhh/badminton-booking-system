import { useState, useEffect } from 'react';
import priceRuleService from '../../services/priceRuleService';
import courtService from '../../services/courtService';
import PriceRuleFormModal from '../../components/admin/PriceRuleFormModal';
import ConfirmDialog from '../../components/common/ConfirmDialog';
import Toast from '../../components/common/Toast';
import TableSkeleton from '../../components/common/TableSkeleton';

const PriceRuleManagement = () => {
  const [priceRules, setPriceRules] = useState([]);
  const [courts, setCourts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  const [selectedPriceRule, setSelectedPriceRule] = useState(null);
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [priceRuleToDelete, setPriceRuleToDelete] = useState(null);
  const [toast, setToast] = useState({ show: false, message: '', type: '' });
  const [isCreating, setIsCreating] = useState(false);
  
  const [filters, setFilters] = useState({
    courtId: '',
    isActive: ''
  });

  useEffect(() => {
    fetchPriceRules();
    fetchCourts();
  }, [page, filters.courtId, filters.isActive]);

  const fetchCourts = async () => {
    try {
      const data = await courtService.getAllCourts(0, 100, {});
      setCourts(data.content || []);
    } catch (error) {
      console.error('Error fetching courts:', error);
    }
  };

  const fetchPriceRules = async () => {
    setLoading(true);
    try {
      const filterParams = {};
      if (filters.courtId) filterParams.courtId = filters.courtId;
      if (filters.isActive !== '') filterParams.isActive = filters.isActive;
      
      const data = await priceRuleService.getAllPriceRules(page, 10, filterParams);
      setPriceRules(data.content || []);
      setTotalPages(data.totalPages || 0);
      setTotalElements(data.totalElements || 0);
    } catch (error) {
      showToast('Lỗi khi tải danh sách quy tắc giá', 'error');
    } finally {
      setLoading(false);
    }
  };

  const showToast = (message, type) => {
    setToast({ show: true, message, type });
  };

  const handleFilterChange = (name, value) => {
    setFilters(prev => ({ ...prev, [name]: value }));
    setPage(0);
  };

  const handleEdit = async (priceRuleId) => {
    setIsCreating(false);
    try {
      const priceRule = await priceRuleService.getPriceRuleById(priceRuleId);
      setSelectedPriceRule(priceRule);
      setIsFormModalOpen(true);
    } catch (error) {
      showToast('Lỗi khi tải thông tin quy tắc giá', 'error');
    }
  };

  const handleDeleteClick = (priceRule) => {
    setPriceRuleToDelete(priceRule);
    setIsDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    try {
      await priceRuleService.deletePriceRule(priceRuleToDelete.id);
      showToast('Xóa quy tắc giá thành công', 'success');
      await fetchPriceRules();
    } catch (error) {
      showToast('Lỗi khi xóa quy tắc giá', 'error');
    } finally {
      setIsDeleteDialogOpen(false);
      setPriceRuleToDelete(null);
    }
  };

  const handleFormSubmit = async (priceRuleData) => {
    try {
      if (isCreating) {
        await priceRuleService.createPriceRule(priceRuleData);
        showToast('Thêm quy tắc giá thành công', 'success');
      } else {
        await priceRuleService.updatePriceRule(selectedPriceRule.id, priceRuleData);
        showToast('Cập nhật quy tắc giá thành công', 'success');
      }
      setIsFormModalOpen(false);
      setSelectedPriceRule(null);
      setIsCreating(false);
      await fetchPriceRules();
    } catch (error) {
      showToast(isCreating ? 'Lỗi khi thêm quy tắc giá' : 'Lỗi khi cập nhật quy tắc giá', 'error');
    }
  };

  const handleAddPriceRule = () => {
    setIsCreating(true);
    setSelectedPriceRule(null);
    setIsFormModalOpen(true);
  };

  const getCourtName = (courtId) => {
    const court = courts.find(c => c.id === courtId);
    return court ? court.courtName : `Sân #${courtId}`;
  };

  const getDayOfWeekLabel = (dayOfWeek) => {
    const days = ['Chủ nhật', 'Thứ 2', 'Thứ 3', 'Thứ 4', 'Thứ 5', 'Thứ 6', 'Thứ 7'];
    return dayOfWeek !== null && dayOfWeek !== undefined ? days[dayOfWeek] : 'Tất cả';
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(price);
  };

  const formatDate = (dateString) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString('vi-VN');
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

  return (
    <div className="flex-1 overflow-y-auto p-4 md:p-8 bg-gray-50">
      <div className="max-w-7xl mx-auto flex flex-col gap-6">
        {/* Page Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-black text-gray-900 tracking-tight">Quản lý giá sân</h1>
            <p className="text-gray-600 text-sm mt-1">Thiết lập và quản lý quy tắc giá cho từng sân và khung giờ.</p>
          </div>
          <div className="flex gap-3">
            <button className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg text-gray-900 text-sm font-bold hover:bg-gray-50 transition-colors shadow-sm">
              <span className="material-symbols-outlined text-lg">download</span>
              Xuất Excel
            </button>
            <button 
              onClick={handleAddPriceRule}
              className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg text-sm font-bold hover:bg-purple-700 transition-colors shadow-md shadow-purple-600/20"
            >
              <span className="material-symbols-outlined text-lg">add</span>
              Thêm quy tắc giá
            </button>
          </div>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm">
            <div className="flex justify-between items-start mb-3">
              <p className="text-gray-600 font-medium text-sm">Tổng quy tắc</p>
              <span className="material-symbols-outlined text-purple-600 bg-purple-100 p-1 rounded-md text-xl">rule</span>
            </div>
            <p className="text-3xl font-bold text-gray-900">{totalElements}</p>
          </div>

          <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm">
            <div className="flex justify-between items-start mb-3">
              <p className="text-gray-600 font-medium text-sm">Đang áp dụng</p>
              <span className="material-symbols-outlined text-green-600 bg-green-100 p-1 rounded-md text-xl">check_circle</span>
            </div>
            <p className="text-3xl font-bold text-gray-900">
              {priceRules.filter(pr => pr.isActive).length}
            </p>
          </div>

          <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm">
            <div className="flex justify-between items-start mb-3">
              <p className="text-gray-600 font-medium text-sm">Tạm dừng</p>
              <span className="material-symbols-outlined text-gray-600 bg-gray-100 p-1 rounded-md text-xl">pause_circle</span>
            </div>
            <p className="text-3xl font-bold text-gray-900">
              {priceRules.filter(pr => !pr.isActive).length}
            </p>
          </div>

          <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm">
            <div className="flex justify-between items-start mb-3">
              <p className="text-gray-600 font-medium text-sm">Số sân</p>
              <span className="material-symbols-outlined text-blue-600 bg-blue-100 p-1 rounded-md text-xl">sports_tennis</span>
            </div>
            <p className="text-3xl font-bold text-gray-900">{courts.length}</p>
          </div>
        </div>

        {/* Filters & Table */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm flex flex-col overflow-hidden">
          {/* Filters */}
          <div className="p-4 border-b border-gray-200 flex flex-col lg:flex-row gap-4 items-center justify-between">
            <div className="flex flex-wrap gap-3 w-full lg:w-auto">
              <div className="relative">
                <select
                  value={filters.courtId}
                  onChange={(e) => handleFilterChange('courtId', e.target.value)}
                  className="appearance-none pl-4 pr-10 py-2.5 rounded-lg bg-gray-50 border-transparent focus:bg-white focus:border-purple-600 focus:ring-2 focus:ring-purple-600/20 text-sm font-medium text-gray-900 cursor-pointer outline-none transition-all"
                >
                  <option value="">Tất cả sân</option>
                  {courts.map(court => (
                    <option key={court.id} value={court.id}>
                      {court.courtName}
                    </option>
                  ))}
                </select>
                <span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none text-sm">expand_more</span>
              </div>

              <div className="relative">
                <select
                  value={filters.isActive}
                  onChange={(e) => handleFilterChange('isActive', e.target.value)}
                  className="appearance-none pl-4 pr-10 py-2.5 rounded-lg bg-gray-50 border-transparent focus:bg-white focus:border-purple-600 focus:ring-2 focus:ring-purple-600/20 text-sm font-medium text-gray-900 cursor-pointer outline-none transition-all"
                >
                  <option value="">Trạng thái: Tất cả</option>
                  <option value="true">Đang áp dụng</option>
                  <option value="false">Tạm dừng</option>
                </select>
                <span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none text-sm">expand_more</span>
              </div>
            </div>
          </div>

          {/* Table */}
          {loading ? (
            <div className="overflow-x-auto">
              <TableSkeleton rows={10} columns={7} />
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-200 text-xs uppercase text-gray-600 font-semibold">
                    <th className="p-4">Sân</th>
                    <th className="p-4">Khung giờ</th>
                    <th className="p-4">Giá</th>
                    <th className="p-4">Ngày trong tuần</th>
                    <th className="p-4">Thời gian áp dụng</th>
                    <th className="p-4">Trạng thái</th>
                    <th className="p-4 text-right">Thao tác</th>
                  </tr>
                </thead>
                <tbody className="text-sm">
                  {priceRules.length === 0 ? (
                    <tr>
                      <td colSpan="7" className="p-12 text-center text-gray-500">
                        <div className="flex flex-col items-center gap-3">
                          <span className="material-symbols-outlined text-6xl text-gray-300">rule</span>
                          <p className="text-lg font-medium">Chưa có quy tắc giá nào</p>
                          <button
                            onClick={handleAddPriceRule}
                            className="mt-2 px-4 py-2 bg-purple-600 text-white rounded-lg text-sm font-bold hover:bg-purple-700 transition-colors"
                          >
                            Thêm quy tắc giá đầu tiên
                          </button>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    priceRules.map((priceRule) => (
                      <tr
                        key={priceRule.id}
                        className="border-b border-gray-200 hover:bg-gray-50 transition-colors"
                      >
                        <td className="p-4">
                          <div className="flex items-center gap-2">
                            <span className="material-symbols-outlined text-purple-600 text-xl">sports_tennis</span>
                            <span className="font-bold text-gray-900">{getCourtName(priceRule.courtId)}</span>
                          </div>
                        </td>
                        <td className="p-4">
                          <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold bg-blue-100 text-blue-700 border border-blue-200">
                            Slot #{priceRule.slotId}
                          </span>
                        </td>
                        <td className="p-4">
                          <span className="text-lg font-bold text-purple-600">
                            {formatPrice(priceRule.price)}
                          </span>
                        </td>
                        <td className="p-4">
                          <div className="flex flex-col gap-1">
                            <span className="text-gray-900 font-medium">{getDayOfWeekLabel(priceRule.dayOfWeek)}</span>
                            {priceRule.isWeekend && (
                              <span className="inline-flex items-center gap-1 text-xs text-orange-600">
                                <span className="material-symbols-outlined text-sm">weekend</span>
                                Cuối tuần
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="p-4">
                          <div className="flex flex-col gap-1 text-xs text-gray-600">
                            <div className="flex items-center gap-1">
                              <span className="material-symbols-outlined text-sm">calendar_today</span>
                              <span>{formatDate(priceRule.effectiveFrom)}</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <span className="material-symbols-outlined text-sm">event</span>
                              <span>{formatDate(priceRule.effectiveTo)}</span>
                            </div>
                          </div>
                        </td>
                        <td className="p-4">{getStatusBadge(priceRule.isActive)}</td>
                        <td className="p-4 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <button
                              onClick={() => handleEdit(priceRule.id)}
                              className="p-1.5 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors"
                              title="Chỉnh sửa"
                            >
                              <span className="material-symbols-outlined text-lg">edit</span>
                            </button>
                            <button
                              onClick={() => handleDeleteClick(priceRule)}
                              className="p-1.5 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
                              title="Xóa"
                            >
                              <span className="material-symbols-outlined text-lg">delete</span>
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          )}

          {/* Pagination */}
          {totalPages > 0 && (
            <div className="p-4 border-t border-gray-200 flex flex-col sm:flex-row items-center justify-between gap-4">
              <p className="text-sm text-gray-600">
                Hiển thị <span className="font-bold text-gray-900">{page * 10 + 1}</span> đến{' '}
                <span className="font-bold text-gray-900">{Math.min((page + 1) * 10, totalElements)}</span> trong tổng số{' '}
                <span className="font-bold text-gray-900">{totalElements}</span> kết quả
              </p>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setPage(p => Math.max(0, p - 1))}
                  disabled={page === 0}
                  className="px-3 py-1.5 rounded-lg border border-gray-300 bg-white text-gray-600 text-sm font-medium hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Trước
                </button>
                {[...Array(Math.min(5, totalPages))].map((_, idx) => {
                  let pageNum;
                  if (totalPages <= 5) {
                    pageNum = idx;
                  } else if (page < 3) {
                    pageNum = idx;
                  } else if (page > totalPages - 4) {
                    pageNum = totalPages - 5 + idx;
                  } else {
                    pageNum = page - 2 + idx;
                  }
                  
                  return (
                    <button
                      key={pageNum}
                      onClick={() => setPage(pageNum)}
                      className={`px-3 py-1.5 rounded-lg text-sm font-bold ${
                        page === pageNum
                          ? 'border border-purple-600 bg-purple-600 text-white'
                          : 'border border-gray-300 bg-white text-gray-600 hover:bg-gray-50 hover:text-purple-600'
                      }`}
                    >
                      {pageNum + 1}
                    </button>
                  );
                })}
                <button
                  onClick={() => setPage(p => Math.min(totalPages - 1, p + 1))}
                  disabled={page >= totalPages - 1}
                  className="px-3 py-1.5 rounded-lg border border-gray-300 bg-white text-gray-600 text-sm font-medium hover:bg-gray-50 hover:text-purple-600 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Sau
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Modals */}
      {isFormModalOpen && (
        <PriceRuleFormModal
          priceRule={selectedPriceRule}
          isCreate={isCreating}
          onClose={() => {
            setIsFormModalOpen(false);
            setSelectedPriceRule(null);
            setIsCreating(false);
          }}
          onSubmit={handleFormSubmit}
        />
      )}

      {isDeleteDialogOpen && (
        <ConfirmDialog
          title="Xác nhận xóa"
          message={`Bạn có chắc chắn muốn xóa quy tắc giá này?`}
          onConfirm={handleDeleteConfirm}
          onCancel={() => {
            setIsDeleteDialogOpen(false);
            setPriceRuleToDelete(null);
          }}
        />
      )}

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

export default PriceRuleManagement;
