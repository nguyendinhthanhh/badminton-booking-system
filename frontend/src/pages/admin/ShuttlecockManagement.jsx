import { useEffect, useMemo, useState } from "react";
import shuttlecockService from "../../services/shuttlecockService";
import ShuttlecockFormModal from "../../components/admin/ShuttlecockFormModal";
import ShuttlecockDetailModal from "../../components/admin/ShuttlecockDetailModal";
import ConfirmDialog from "../../components/common/ConfirmDialog";
import Toast from "../../components/common/Toast";
import TableSkeleton from "../../components/common/TableSkeleton";
import StatCardSkeleton from "../../components/common/StatCardSkeleton";

const pageSize = 10;

const ShuttlecockManagement = () => {
  const [warehouses, setWarehouses] = useState([]);
  const [warehouseId, setWarehouseId] = useState("");
  const [shuttlecocks, setShuttlecocks] = useState([]);
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

  const fetchWarehouses = async () => {
    try {
      const data = await shuttlecockService.getWarehouses();
      setWarehouses(data);
      if (data.length > 0) {
        setWarehouseId(String(data[0].id));
      }
    } catch (error) {
      console.error("Error fetching warehouses:", error);
      setToast({ type: "error", message: "Không tải được danh sách kho." });
      setLoading(false);
    }
  };

  const fetchShuttlecocks = async (targetWarehouseId, targetPage = 0) => {
    if (!targetWarehouseId) return;
    try {
      setLoading(true);
      const data = await shuttlecockService.getShuttlecocksByWarehouse(
        targetWarehouseId,
        targetPage,
        pageSize,
      );
      setShuttlecocks(data.content || []);
      setTotalPages(data.totalPages || 0);
      setTotalElements(data.totalElements || 0);
    } catch (error) {
      console.error("Error fetching shuttlecocks:", error);
      setToast({
        type: "error",
        message: "Không tải được danh sách cầu lông.",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWarehouses();
  }, []);

  useEffect(() => {
    if (warehouseId) {
      fetchShuttlecocks(Number(warehouseId), page);
    }
  }, [warehouseId, page]);

  const handleCreate = () => {
    setEditingItem(null);
    setShowFormModal(true);
  };

  const handleEdit = (item) => {
    setEditingItem(item);
    setShowFormModal(true);
  };

  const handleViewDetail = (item) => {
    setDetailItem(item);
    setShowDetailModal(true);
  };

  const handleSubmit = async (payload) => {
    try {
      const numericWarehouseId = Number(warehouseId);
      if (editingItem) {
        await shuttlecockService.updateShuttlecock(
          numericWarehouseId,
          editingItem.id,
          payload,
        );
        setToast({ type: "success", message: "Cập nhật loại cầu thành công." });
      } else {
        await shuttlecockService.createShuttlecock(numericWarehouseId, payload);
        setToast({ type: "success", message: "Tạo loại cầu thành công." });
      }
      setShowFormModal(false);
      setEditingItem(null);
      setPage(0);
      try {
        await fetchShuttlecocks(numericWarehouseId, 0);
      } catch (refreshError) {
        console.error(
          "Error refreshing shuttlecocks after save:",
          refreshError,
        );
      }
    } catch (error) {
      console.error("Error saving shuttlecock:", error);
      setToast({ type: "error", message: "Lưu dữ liệu thất bại." });
      throw error;
    }
  };

  const openDeleteDialog = (item) => {
    setDeletingItem(item);
    setShowDeleteDialog(true);
  };

  const handleDelete = async () => {
    if (!deletingItem) return;
    setDeleteLoading(true);
    try {
      const numericWarehouseId = Number(warehouseId);
      await shuttlecockService.deleteShuttlecock(
        numericWarehouseId,
        deletingItem.id,
      );
      setToast({ type: "success", message: "Xóa loại cầu thành công." });
      setShowDeleteDialog(false);
      setDeletingItem(null);
      setPage(0);
      try {
        await fetchShuttlecocks(numericWarehouseId, 0);
      } catch (refreshError) {
        console.error(
          "Error refreshing shuttlecocks after delete:",
          refreshError,
        );
      }
    } catch (error) {
      console.error("Error deleting shuttlecock:", error);
      setToast({ type: "error", message: "Xóa loại cầu thất bại." });
    } finally {
      setDeleteLoading(false);
    }
  };

  const filteredRows = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();
    if (!term) return shuttlecocks;
    return shuttlecocks.filter(
      (item) =>
        item.name?.toLowerCase().includes(term) ||
        item.sku?.toLowerCase().includes(term),
    );
  }, [shuttlecocks, searchTerm]);

  const totalStock = shuttlecocks.reduce(
    (sum, item) => sum + (item.quantity || 0),
    0,
  );
  const lowStockCount = shuttlecocks.filter(
    (item) => (item.quantity || 0) > 0 && (item.quantity || 0) < 20,
  ).length;
  const outOfStockCount = shuttlecocks.filter(
    (item) => (item.quantity || 0) === 0,
  ).length;

  return (
    <div className="flex-1 overflow-y-auto p-4 md:p-8 bg-gray-50">
      <div className="max-w-7xl mx-auto flex flex-col gap-6">
        {/* Page Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-black text-gray-900 tracking-tight">
              Quản lý cầu lông
            </h1>
            <p className="text-gray-600 text-sm mt-1">
              Quản lý danh mục cầu lông theo từng kho hàng.
            </p>
          </div>
          <button
            onClick={handleCreate}
            disabled={!warehouseId}
            className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg text-sm font-bold hover:bg-purple-700 transition-colors shadow-md shadow-purple-600/20 disabled:opacity-50"
          >
            <span className="material-symbols-outlined text-lg">add</span>
            Thêm loại cầu
          </button>
        </div>

        {/* Warehouse Selector */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4">
          <label className="block text-xs font-medium text-gray-700 mb-1.5">
            Kho hàng
          </label>
          <select
            value={warehouseId}
            onChange={(e) => {
              setWarehouseId(e.target.value);
              setPage(0);
            }}
            className="w-full md:w-96 rounded-md border border-slate-300 px-3 py-2 text-sm text-slate-900 focus:ring-2 focus:ring-purple-600 focus:border-transparent"
          >
            {warehouses.map((warehouse) => (
              <option key={warehouse.id} value={warehouse.id}>
                {warehouse.name} - {warehouse.address || "N/A"}
              </option>
            ))}
          </select>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {loading ? (
            <>
              <StatCardSkeleton />
              <StatCardSkeleton />
              <StatCardSkeleton />
            </>
          ) : (
            <>
              <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm flex flex-col justify-between h-32">
                <div className="flex justify-between items-start">
                  <p className="text-gray-600 font-medium text-sm">
                    Tổng loại cầu
                  </p>
                  <span className="material-symbols-outlined text-purple-600 bg-purple-100 p-1 rounded-md text-xl">
                    sports_baseball
                  </span>
                </div>
                <div>
                  <p className="text-3xl font-bold text-gray-900">
                    {totalElements}
                  </p>
                  <div className="flex items-center gap-1 text-purple-600 text-xs font-medium mt-1">
                    <span className="material-symbols-outlined text-base">
                      inventory
                    </span>
                    <span>Trong kho đã chọn</span>
                  </div>
                </div>
              </div>

              <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm flex flex-col justify-between h-32">
                <div className="flex justify-between items-start">
                  <p className="text-gray-600 font-medium text-sm">
                    Tổng tồn kho
                  </p>
                  <span className="material-symbols-outlined text-blue-600 bg-blue-100 p-1 rounded-md text-xl">
                    inventory_2
                  </span>
                </div>
                <div>
                  <p className="text-3xl font-bold text-gray-900">
                    {totalStock}
                  </p>
                  <div className="flex items-center gap-1 text-blue-600 text-xs font-medium mt-1">
                    <span className="material-symbols-outlined text-base">
                      package_2
                    </span>
                    <span>Trang hiện tại</span>
                  </div>
                </div>
              </div>

              <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm flex flex-col justify-between h-32">
                <div className="flex justify-between items-start">
                  <p className="text-gray-600 font-medium text-sm">
                    Cảnh báo tồn kho
                  </p>
                  <span className="material-symbols-outlined text-orange-600 bg-orange-100 p-1 rounded-md text-xl">
                    warning
                  </span>
                </div>
                <div>
                  <div className="flex items-center gap-3 mt-1">
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-yellow-100 text-yellow-700 text-xs font-bold border border-yellow-200">
                      <span className="material-symbols-outlined text-sm">
                        trending_down
                      </span>
                      Sắp hết: {lowStockCount}
                    </span>
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-red-100 text-red-600 text-xs font-bold border border-red-200">
                      <span className="material-symbols-outlined text-sm">
                        block
                      </span>
                      Hết hàng: {outOfStockCount}
                    </span>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>

        {/* Search & Table */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
          <div className="p-4 border-b border-gray-200 flex flex-col lg:flex-row gap-4 items-center justify-between">
            <div className="relative w-full lg:w-96">
              <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 text-xl">
                search
              </span>
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 rounded-lg bg-gray-50 border-transparent focus:bg-white focus:border-purple-600 focus:ring-2 focus:ring-purple-600/20 text-sm font-medium text-gray-900 transition-all outline-none placeholder:text-gray-500"
                placeholder="Tìm theo tên hoặc SKU..."
              />
            </div>
          </div>

          {loading ? (
            <div className="overflow-x-auto">
              <TableSkeleton rows={8} columns={6} />
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-200 text-xs uppercase text-gray-600 font-semibold">
                    <th className="p-4 min-w-[250px]">Tên cầu</th>
                    <th className="p-4">SKU</th>
                    <th className="p-4">Giá cơ bản</th>
                    <th className="p-4">Số lượng</th>
                    <th className="p-4">Mô tả</th>
                    <th className="p-4 text-right">Thao tác</th>
                  </tr>
                </thead>
                <tbody className="text-sm">
                  {filteredRows.length === 0 ? (
                    <tr>
                      <td
                        colSpan="6"
                        className="p-12 text-center text-gray-500"
                      >
                        <div className="flex flex-col items-center gap-2">
                          <span className="material-symbols-outlined text-4xl text-gray-300">
                            sports_baseball
                          </span>
                          <span>Không có dữ liệu cầu lông</span>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    filteredRows.map((item) => (
                      <tr
                        key={item.id}
                        className="border-b border-gray-200 hover:bg-gray-50 transition-colors"
                      >
                        <td className="p-4">
                          <div className="flex items-center gap-3">
                            <span className="material-symbols-outlined text-purple-500 bg-purple-50 p-1.5 rounded-lg text-lg">
                              sports_baseball
                            </span>
                            <div className="flex flex-col items-start">
                              <button
                                onClick={() => handleViewDetail(item)}
                                className="text-left font-bold text-gray-900 hover:text-purple-600 hover:underline transition-colors"
                              >
                                {item.name}
                              </button>
                              <span className="text-gray-500 text-xs">
                                ID: #{item.id}
                              </span>
                            </div>
                          </div>
                        </td>
                        <td className="p-4 text-gray-600 font-mono text-xs">
                          {item.sku || "-"}
                        </td>
                        <td className="p-4 text-blue-700 font-semibold">
                          {Number(item.basePrice || 0).toLocaleString("vi-VN")}{" "}
                          đ
                        </td>
                        <td className="p-4">
                          <span
                            className={`inline-flex items-center gap-1 font-bold rounded-full px-2.5 py-1 text-xs ${item.quantity === 0 ? "bg-red-100 text-red-600 border border-red-200" : item.quantity < 20 ? "bg-yellow-100 text-yellow-700 border border-yellow-200" : "bg-green-100 text-green-700 border border-green-200"}`}
                          >
                            {item.quantity || 0}
                          </span>
                        </td>
                        <td className="p-4 text-gray-600 max-w-xs truncate">
                          {item.description || "-"}
                        </td>
                        <td className="p-4 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <button
                              onClick={() => handleViewDetail(item)}
                              className="p-1.5 text-gray-600 hover:text-purple-600 hover:bg-purple-50 rounded transition-colors"
                              title="Xem chi tiết"
                            >
                              <span className="material-symbols-outlined text-lg">
                                visibility
                              </span>
                            </button>
                            <button
                              onClick={() => handleEdit(item)}
                              className="p-1.5 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors"
                              title="Chỉnh sửa"
                            >
                              <span className="material-symbols-outlined text-lg">
                                edit
                              </span>
                            </button>
                            <button
                              onClick={() => openDeleteDialog(item)}
                              className="p-1.5 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
                              title="Xóa"
                            >
                              <span className="material-symbols-outlined text-lg">
                                delete
                              </span>
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

          {totalPages > 1 && (
            <div className="p-4 border-t border-gray-200 flex items-center justify-between">
              <p className="text-sm text-gray-600">
                Trang {page + 1} / {totalPages} — Tổng {totalElements} loại cầu
              </p>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setPage((p) => Math.max(0, p - 1))}
                  disabled={page === 0}
                  className="flex items-center gap-1 px-3 py-1.5 rounded-lg border border-gray-300 bg-white text-gray-600 text-sm font-medium hover:bg-gray-50 disabled:opacity-50 transition-colors"
                >
                  <span className="material-symbols-outlined text-base">
                    chevron_left
                  </span>
                  Trước
                </button>
                <button
                  onClick={() =>
                    setPage((p) => Math.min(totalPages - 1, p + 1))
                  }
                  disabled={page >= totalPages - 1}
                  className="flex items-center gap-1 px-3 py-1.5 rounded-lg border border-gray-300 bg-white text-gray-600 text-sm font-medium hover:bg-gray-50 disabled:opacity-50 transition-colors"
                >
                  Sau
                  <span className="material-symbols-outlined text-base">
                    chevron_right
                  </span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Modals */}
      <ShuttlecockFormModal
        isOpen={showFormModal}
        onClose={() => {
          setShowFormModal(false);
          setEditingItem(null);
        }}
        onSubmit={handleSubmit}
        editData={editingItem}
        existingShuttlecocks={shuttlecocks}
      />

      <ShuttlecockDetailModal
        isOpen={showDetailModal}
        onClose={() => {
          setShowDetailModal(false);
          setDetailItem(null);
        }}
        data={detailItem}
      />

      <ConfirmDialog
        isOpen={showDeleteDialog}
        title="Xóa loại cầu"
        message={`Bạn có chắc chắn muốn xóa "${deletingItem?.name}"? Hành động này không thể hoàn tác.`}
        onConfirm={handleDelete}
        onCancel={() => setShowDeleteDialog(false)}
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

export default ShuttlecockManagement;
