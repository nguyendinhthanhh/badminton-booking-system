import { useEffect, useMemo, useState } from "react";
import racketService from "../../services/racketService";
import RacketFormModal from "../../components/admin/RacketFormModal";
import RacketDetailModal from "../../components/admin/RacketDetailModal";
import ConfirmDialog from "../../components/common/ConfirmDialog";
import Toast from "../../components/common/Toast";
import TableSkeleton from "../../components/common/TableSkeleton";
import StatCardSkeleton from "../../components/common/StatCardSkeleton";

const pageSize = 10;

const RacketManagement = () => {
  const [rackets, setRackets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  const [searchTerm, setSearchTerm] = useState("");

  const [showFormModal, setShowFormModal] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [deletingItem, setDeletingItem] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [toast, setToast] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [detailItem, setDetailItem] = useState(null);

  const fetchRackets = async (targetPage = 0) => {
    try {
      setLoading(true);
      const data = await racketService.getAllRackets(targetPage, pageSize);
      setRackets(data.content);
      setTotalPages(data.totalPages);
      setTotalElements(data.totalElements);
    } catch (error) {
      console.error("Error fetching rackets:", error);
      setToast({ type: "error", message: "Không tải được danh sách vợt." });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRackets();
  }, []);

  const filteredRackets = useMemo(() => {
    if (!searchTerm) return rackets;
    return rackets.filter(
      (racket) =>
        racket.racketCode?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        racket.brand?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        racket.model?.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [rackets, searchTerm]);

  const handleCreate = () => {
    setEditingItem(null);
    setShowFormModal(true);
  };

  const handleEdit = (racket) => {
    setEditingItem(racket);
    setShowFormModal(true);
  };

  const handleViewDetail = (racket) => {
    setDetailItem(racket);
    setShowDetailModal(true);
  };

  const handleDelete = (racket) => {
    setDeletingItem(racket);
    setShowDeleteDialog(true);
  };

  const confirmDelete = async () => {
    if (!deletingItem) return;
    try {
      setDeleteLoading(true);
      await racketService.deleteRacket(deletingItem.id);
      setToast({ type: "success", message: "Xóa vợt thành công." });
      fetchRackets(page);
    } catch (error) {
      console.error("Error deleting racket:", error);
      setToast({ type: "error", message: "Không thể xóa vợt." });
    } finally {
      setDeleteLoading(false);
      setShowDeleteDialog(false);
      setDeletingItem(null);
    }
  };

  const handleFormSubmit = async (formData) => {
    try {
      if (editingItem) {
        await racketService.updateRacket(editingItem.id, formData);
        setToast({ type: "success", message: "Cập nhật vợt thành công." });
      } else {
        await racketService.createRacket(formData);
        setToast({ type: "success", message: "Thêm vợt thành công." });
      }
      setShowFormModal(false);
      fetchRackets(page);
    } catch (error) {
      console.error("Error saving racket:", error);
      setToast({ type: "error", message: "Không thể lưu vợt." });
      throw error;
    }
  };

  const handlePageChange = (newPage) => {
    setPage(newPage);
    fetchRackets(newPage);
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      AVAILABLE: { label: "Có sẵn", className: "bg-green-100 text-green-800" },
      RENTED: { label: "Đang cho thuê", className: "bg-blue-100 text-blue-800" },
      MAINTENANCE: { label: "Đang bảo trì", className: "bg-yellow-100 text-yellow-800" },
      DAMAGED: { label: "Hỏng", className: "bg-red-100 text-red-800" },
      RETIRED: { label: "Ngừng sử dụng", className: "bg-gray-100 text-gray-800" },
    };
    const config = statusConfig[status] || { label: status, className: "bg-gray-100 text-gray-800" };
    return <span className={`px-2 py-1 text-xs font-medium rounded-full ${config.className}`}>{config.label}</span>;
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Quản lý vợt cầu lông</h1>
        <button
          onClick={handleCreate}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium"
        >
          Thêm vợt mới
        </button>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="p-4 border-b border-gray-200">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-4">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Tìm kiếm theo mã, thương hiệu, model..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 w-80"
                />
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
              </div>
            </div>
            <div className="text-sm text-gray-500">
              Tổng cộng: {totalElements} vợt
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          {loading ? (
            <TableSkeleton rows={pageSize} />
          ) : (
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Mã vợt</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Thương hiệu</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Model</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Trạng thái</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Giá thuê</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tình trạng</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Thao tác</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredRackets.map((racket) => (
                  <tr key={racket.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{racket.racketCode}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{racket.brand}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{racket.model}</td>
                    <td className="px-6 py-4 whitespace-nowrap">{getStatusBadge(racket.status)}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {racket.rentalPrice ? new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(racket.rentalPrice) : 'N/A'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{racket.conditionStatus}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button
                        onClick={() => handleViewDetail(racket)}
                        className="text-blue-600 hover:text-blue-900 mr-3"
                      >
                        Chi tiết
                      </button>
                      <button
                        onClick={() => handleEdit(racket)}
                        className="text-indigo-600 hover:text-indigo-900 mr-3"
                      >
                        Sửa
                      </button>
                      <button
                        onClick={() => handleDelete(racket)}
                        className="text-red-600 hover:text-red-900"
                      >
                        Xóa
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {totalPages > 1 && (
          <div className="px-4 py-3 bg-white border-t border-gray-200 sm:px-6">
            <div className="flex items-center justify-between">
              <div className="text-sm text-gray-700">
                Hiển thị {page * pageSize + 1} đến {Math.min((page + 1) * pageSize, totalElements)} của {totalElements} kết quả
              </div>
              <div className="flex space-x-2">
                <button
                  onClick={() => handlePageChange(page - 1)}
                  disabled={page === 0}
                  className="px-3 py-1 text-sm border border-gray-300 rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                >
                  Trước
                </button>
                {Array.from({ length: totalPages }, (_, i) => (
                  <button
                    key={i}
                    onClick={() => handlePageChange(i)}
                    className={`px-3 py-1 text-sm border rounded-md ${
                      i === page ? "bg-blue-600 text-white border-blue-600" : "border-gray-300 hover:bg-gray-50"
                    }`}
                  >
                    {i + 1}
                  </button>
                ))}
                <button
                  onClick={() => handlePageChange(page + 1)}
                  disabled={page === totalPages - 1}
                  className="px-3 py-1 text-sm border border-gray-300 rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                >
                  Sau
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      <RacketFormModal
        isOpen={showFormModal}
        onClose={() => setShowFormModal(false)}
        onSubmit={handleFormSubmit}
        editData={editingItem}
      />

      <RacketDetailModal
        isOpen={showDetailModal}
        onClose={() => setShowDetailModal(false)}
        racket={detailItem}
      />

      <ConfirmDialog
        isOpen={showDeleteDialog}
        onClose={() => setShowDeleteDialog(false)}
        onConfirm={confirmDelete}
        title="Xác nhận xóa"
        message={`Bạn có chắc chắn muốn xóa vợt "${deletingItem?.racketCode}"?`}
        loading={deleteLoading}
      />

      {toast && <Toast type={toast.type} message={toast.message} onClose={() => setToast(null)} />}
    </div>
  );
};

export default RacketManagement;
