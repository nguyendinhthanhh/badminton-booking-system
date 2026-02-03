import { useState, useEffect } from 'react';
import courtService from '../../services/courtService';
import CourtFormModal from '../../components/admin/CourtFormModal';
import CourtDetailModal from '../../components/admin/CourtDetailModal';
import ConfirmDialog from '../../components/common/ConfirmDialog';
import Toast from '../../components/common/Toast';
import StatCardSkeleton from '../../components/common/StatCardSkeleton';
import TableSkeleton from '../../components/common/TableSkeleton';
import CacheIndicator from '../../components/common/CacheIndicator';
import ModalSkeleton from '../../components/common/ModalSkeleton';
import useDataStore from '../../store/useDataStore';

const CourtManagement = () => {
  const {
    courts: cachedCourts,
    setCourts: setCachedCourts,
    setCourtSearchTerm,
    invalidateCourts,
    isCacheValid
  } = useDataStore();

  const [courts, setCourts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [searchTerm, setSearchTerm] = useState(cachedCourts.searchTerm);
  const [editingCourt, setEditingCourt] = useState(null);
  const [selectedCourt, setSelectedCourt] = useState(null);
  const [deletingCourt, setDeletingCourt] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [loadingCourt, setLoadingCourt] = useState(false);
  const [loadingModalType, setLoadingModalType] = useState(null);
  const [toast, setToast] = useState(null);
  const [isUsingCache, setIsUsingCache] = useState(false);
  const [isCreating, setIsCreating] = useState(false);

  const [stats, setStats] = useState({
    total: 0,
    active: 0,
    maintenance: 0,
    revenue: 4200000
  });

  useEffect(() => {
    if (isCacheValid(cachedCourts.lastFetch) && cachedCourts.data) {
      setCourts(cachedCourts.data);
      calculateStats(cachedCourts.data);
      setLoading(false);
      setIsUsingCache(true);
      setTimeout(() => setIsUsingCache(false), 3000);
    } else {
      setIsUsingCache(false);
      fetchCourts();
    }
  }, []);

  const calculateStats = (courtsData) => {
    const total = courtsData.length;
    const active = courtsData.filter(c => c.status === 'ACTIVE').length;
    const maintenance = courtsData.filter(c => c.status === 'MAINTENANCE').length;
    
    setStats({
      total,
      active,
      maintenance,
      revenue: 4200000
    });
  };

  const fetchCourts = async () => {
    try {
      setLoading(true);
      const response = await courtService.getAllCourts(0, 100);
      const courtsData = response.content || [];
      setCourts(courtsData);
      setCachedCourts(courtsData);
      calculateStats(courtsData);
    } catch (error) {
      console.error('Error fetching courts:', error);
      showToast('Lỗi khi tải danh sách sân', 'error');
    } finally {
      setLoading(false);
    }
  };

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
  };

  const handleCreateCourt = async (courtData) => {
    try {
      await courtService.createCourt(courtData);
      invalidateCourts();
      await fetchCourts();
      showToast('Thêm sân thành công!', 'success');
      setShowModal(false);
      setIsCreating(false);
    } catch (error) {
      console.error('Error creating court:', error);
      showToast('Lỗi khi thêm sân', 'error');
      throw error;
    }
  };

  const handleUpdateCourt = async (courtData) => {
    try {
      await courtService.updateCourt(editingCourt.id, courtData);
      invalidateCourts();
      await fetchCourts();
      showToast('Cập nhật sân thành công!', 'success');
      setEditingCourt(null);
      setShowModal(false);
    } catch (error) {
      console.error('Error updating court:', error);
      showToast('Lỗi khi cập nhật sân', 'error');
      throw error;
    }
  };

  const handleDeleteCourt = async () => {
    if (!deletingCourt) return;
    
    try {
      setDeleteLoading(true);
      await courtService.deleteCourt(deletingCourt.id);
      invalidateCourts();
      await fetchCourts();
      showToast('Xóa sân thành công!', 'success');
      setShowDeleteDialog(false);
      setDeletingCourt(null);
    } catch (error) {
      console.error('Error deleting court:', error);
      showToast('Lỗi khi xóa sân', 'error');
    } finally {
      setDeleteLoading(false);
    }
  };

  const handleEdit = async (court) => {
    setIsCreating(false);
    setLoadingCourt(true);
    setLoadingModalType('form');
    
    try {
      const details = await courtService.getCourtById(court.id);
      setLoadingModalType(null);
      setEditingCourt(details);
      setShowModal(true);
    } catch (error) {
      setLoadingModalType(null);
      console.error('Error fetching court details:', error);
      showToast('Lỗi khi tải thông tin sân', 'error');
    } finally {
      setLoadingCourt(false);
    }
  };

  const handleViewDetails = async (court) => {
    setShowDetailModal(true);
    setLoadingCourt(true);
    setSelectedCourt(null);
    
    try {
      const details = await courtService.getCourtById(court.id);
      setSelectedCourt(details);
    } catch (error) {
      console.error('Error fetching court details:', error);
      showToast('Lỗi khi tải thông tin sân', 'error');
      setShowDetailModal(false);
    } finally {
      setLoadingCourt(false);
    }
  };

  const handleDeleteClick = (court) => {
    setDeletingCourt(court);
    setShowDeleteDialog(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingCourt(null);
    setIsCreating(false);
  };

  const handleSearchChange = (value) => {
    setSearchTerm(value);
    setCourtSearchTerm(value);
  };

  const handleAddCourt = () => {
    setIsCreating(true);
    setEditingCourt(null);
    setShowModal(true);
  };

  const getStatusBadge = (status) => {
    const config = {
      ACTIVE: { bg: 'bg-green-100', text: 'text-green-700', border: 'border-green-200', label: 'Hoạt động' },
      MAINTENANCE: { bg: 'bg-yellow-100', text: 'text-yellow-700', border: 'border-yellow-200', label: 'Bảo trì' },
      INACTIVE: { bg: 'bg-gray-100', text: 'text-gray-600', border: 'border-gray-200', label: 'Không hoạt động' },
      RESERVED: { bg: 'bg-blue-100', text: 'text-blue-700', border: 'border-blue-200', label: 'Đã đặt' }
    };
    const style = config[status] || config.INACTIVE;
    return (
      <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold ${style.bg} ${style.text} border ${style.border}`}>
        {style.label}
      </span>
    );
  };

  const filteredCourts = courts.filter(court =>
    court.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="flex-1 overflow-y-auto p-4 md:p-8 bg-gray-50">
      <div className="max-w-7xl mx-auto flex flex-col gap-6">
        {/* Page Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-3xl font-black text-gray-900 tracking-tight">Quản lý sân</h1>
              <CacheIndicator isCached={isUsingCache} />
            </div>
            <p className="text-gray-600 text-sm mt-1">Theo dõi trạng thái, cơ sở vật chất và doanh thu sân.</p>
          </div>
          <div className="flex gap-3">
            <button className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg text-gray-900 text-sm font-bold hover:bg-gray-50 transition-colors shadow-sm">
              <span className="material-symbols-outlined text-lg">download</span>
              Xuất Excel
            </button>
            <button 
              onClick={handleAddCourt}
              className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg text-sm font-bold hover:bg-purple-700 transition-colors shadow-md shadow-purple-600/20"
            >
              <span className="material-symbols-outlined text-lg">add</span>
              Thêm sân mới
            </button>
          </div>
        </div>

        {/* Statistics */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {loading ? (
            <>
              <StatCardSkeleton />
              <StatCardSkeleton />
              <StatCardSkeleton />
              <StatCardSkeleton />
            </>
          ) : (
            <>
              <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm flex flex-col justify-between h-32">
                <div className="flex justify-between items-start">
                  <p className="text-gray-600 font-medium text-sm">Tổng số sân</p>
                  <span className="material-symbols-outlined text-purple-600 bg-purple-100 p-1 rounded-md text-xl">sports_tennis</span>
                </div>
                <div>
                  <p className="text-3xl font-bold text-gray-900">{stats.total}</p>
                  <div className="flex items-center gap-1 text-green-600 text-xs font-medium mt-1">
                    <span className="material-symbols-outlined text-base">trending_up</span>
                    <span>Tất cả đã nhỏ đếm</span>
                  </div>
                </div>
              </div>

              <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm flex flex-col justify-between h-32">
                <div className="flex justify-between items-start">
                  <p className="text-gray-600 font-medium text-sm">Sân đang sử dụng</p>
                  <span className="material-symbols-outlined text-green-600 bg-green-100 p-1 rounded-md text-xl">check_circle</span>
                </div>
                <div>
                  <p className="text-3xl font-bold text-gray-900">{stats.active}</p>
                  <div className="flex items-center gap-1 text-green-600 text-xs font-medium mt-1">
                    <span className="material-symbols-outlined text-base">trending_up</span>
                    <span>Hoạt động tốt</span>
                  </div>
                </div>
              </div>

              <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm flex flex-col justify-between h-32">
                <div className="flex justify-between items-start">
                  <p className="text-gray-600 font-medium text-sm">Sân đang bảo trì</p>
                  <span className="material-symbols-outlined text-orange-600 bg-orange-100 p-1 rounded-md text-xl">construction</span>
                </div>
                <div>
                  <p className="text-3xl font-bold text-gray-900">{stats.maintenance}</p>
                  <div className="flex items-center gap-1 text-orange-600 text-xs font-medium mt-1">
                    <span className="material-symbols-outlined text-base">info</span>
                    <span>Đang bảo trì</span>
                  </div>
                </div>
              </div>

              <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm flex flex-col justify-between h-32">
                <div className="flex justify-between items-start">
                  <p className="text-gray-600 font-medium text-sm">Doanh thu hôm nay</p>
                  <span className="material-symbols-outlined text-blue-600 bg-blue-100 p-1 rounded-md text-xl">payments</span>
                </div>
                <div>
                  <p className="text-3xl font-bold text-gray-900">{(stats.revenue / 1000000).toFixed(1)}M</p>
                  <div className="flex items-center gap-1 text-green-600 text-xs font-medium mt-1">
                    <span className="material-symbols-outlined text-base">trending_up</span>
                    <span>+15% so với hôm qua</span>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>

        {/* Search & Table */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm flex flex-col overflow-hidden">
          {/* Search */}
          <div className="p-4 border-b border-gray-200 flex flex-col lg:flex-row gap-4 items-center justify-between">
            <div className="relative w-full lg:w-96">
              <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 text-xl">search</span>
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => handleSearchChange(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 rounded-lg bg-gray-50 border-transparent focus:bg-white focus:border-purple-600 focus:ring-2 focus:ring-purple-600/20 text-sm font-medium text-gray-900 transition-all outline-none placeholder:text-gray-500"
                placeholder="Tìm kiếm sân..."
              />
            </div>
            <button className="px-3 py-2.5 rounded-lg bg-gray-50 text-gray-600 hover:text-gray-900 hover:bg-gray-200 transition-colors">
              <span className="material-symbols-outlined text-xl">filter_list</span>
            </button>
          </div>

          {/* Table */}
          {loading ? (
            <div className="overflow-x-auto">
              <TableSkeleton rows={8} columns={6} />
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-200 text-xs uppercase text-gray-600 font-semibold">
                    <th className="p-4 min-w-[250px]">Tên sân</th>
                    <th className="p-4">Loại</th>
                    <th className="p-4">Sức chứa</th>
                    <th className="p-4">Trạng thái</th>
                    <th className="p-4 text-right">Thao tác</th>
                  </tr>
                </thead>
                <tbody className="text-sm">
                  {filteredCourts.length === 0 ? (
                    <tr>
                      <td colSpan="5" className="p-12 text-center text-gray-500">
                        Không tìm thấy sân nào
                      </td>
                    </tr>
                  ) : (
                    filteredCourts.map((court) => (
                      <tr
                        key={court.id}
                        className="border-b border-gray-200 hover:bg-gray-50 transition-colors"
                      >
                        <td className="p-4">
                          <div className="flex items-center gap-3">
                            <img
                              src={court.imageUrl}
                              alt={court.name}
                              className="w-12 h-12 rounded-lg object-cover border border-gray-200"
                              onError={(e) => {
                                e.target.src = 'https://images.unsplash.com/photo-1626224583764-f87db24ac4ea?w=400';
                              }}
                            />
                            <div className="flex flex-col">
                              <span className="font-bold text-gray-900">{court.name}</span>
                              <span className="text-gray-600 text-xs">ID: #{court.id}</span>
                            </div>
                          </div>
                        </td>
                        <td className="p-4 text-gray-900 font-medium">{court.type}</td>
                        <td className="p-4 text-gray-900 font-medium">{court.capacity} Người</td>
                        <td className="p-4">{getStatusBadge(court.status)}</td>
                        <td className="p-4 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <button
                              onClick={() => handleViewDetails(court)}
                              disabled={loadingCourt}
                              className="p-1.5 text-gray-600 hover:text-purple-600 hover:bg-purple-50 rounded transition-colors disabled:opacity-50"
                              title="Xem chi tiết"
                            >
                              <span className="material-symbols-outlined text-lg">visibility</span>
                            </button>
                            <button
                              onClick={() => handleEdit(court)}
                              disabled={loadingCourt}
                              className="p-1.5 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors disabled:opacity-50"
                              title="Chỉnh sửa"
                            >
                              <span className="material-symbols-outlined text-lg">edit</span>
                            </button>
                            <button
                              onClick={() => handleDeleteClick(court)}
                              disabled={loadingCourt}
                              className="p-1.5 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded transition-colors disabled:opacity-50"
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
        </div>
      </div>

      {/* Modals */}
      <CourtFormModal
        isOpen={showModal}
        onClose={handleCloseModal}
        onSubmit={isCreating ? handleCreateCourt : handleUpdateCourt}
        editData={editingCourt}
      />

      <CourtDetailModal
        isOpen={showDetailModal}
        onClose={() => {
          setShowDetailModal(false);
          setSelectedCourt(null);
        }}
        court={selectedCourt}
        loading={loadingCourt}
      />

      <ConfirmDialog
        isOpen={showDeleteDialog}
        title="Xóa sân"
        message={`Bạn có chắc chắn muốn xóa sân "${deletingCourt?.name}"? Hành động này không thể hoàn tác.`}
        onConfirm={handleDeleteCourt}
        onCancel={() => {
          setShowDeleteDialog(false);
          setDeletingCourt(null);
        }}
        loading={deleteLoading}
      />

      {/* Toast Notification */}
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}
    </div>
  );
};

export default CourtManagement;
