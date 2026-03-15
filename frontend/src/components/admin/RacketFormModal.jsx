import { useEffect, useState } from "react";

const initialFormData = {
  racketCode: "",
  brand: "",
  model: "",
  status: "AVAILABLE",
  rentalPrice: "",
  conditionStatus: "",
  description: "",
};

const RacketFormModal = ({
  isOpen,
  onClose,
  onSubmit,
  editData = null,
}) => {
  const [formData, setFormData] = useState(initialFormData);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (editData) {
      setFormData({
        racketCode: editData.racketCode || "",
        brand: editData.brand || "",
        model: editData.model || "",
        status: editData.status || "AVAILABLE",
        rentalPrice: editData.rentalPrice ?? "",
        conditionStatus: editData.conditionStatus || "",
        description: editData.description || "",
      });
    } else {
      setFormData(initialFormData);
    }
    setErrors({});
  }, [editData, isOpen]);

  if (!isOpen) return null;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const validate = () => {
    const nextErrors = {};
    if (!formData.racketCode.trim()) nextErrors.racketCode = "Mã vợt không được để trống";
    if (!formData.brand.trim()) nextErrors.brand = "Thương hiệu không được để trống";
    if (!formData.model.trim()) nextErrors.model = "Model không được để trống";
    if (formData.rentalPrice === "" || Number(formData.rentalPrice) < 0) {
      nextErrors.rentalPrice = "Giá thuê phải lớn hơn hoặc bằng 0";
    }
    if (!formData.conditionStatus.trim()) nextErrors.conditionStatus = "Tình trạng không được để trống";
    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setLoading(true);
    try {
      await onSubmit({
        racketCode: formData.racketCode.trim(),
        brand: formData.brand.trim(),
        model: formData.model.trim(),
        status: formData.status,
        rentalPrice: Number(formData.rentalPrice),
        conditionStatus: formData.conditionStatus.trim(),
        description: formData.description.trim() || null,
      });
    } catch (err) {
      const serverErrors =
        err?.response?.data?.errors || err?.response?.data?.error || null;
      if (serverErrors && typeof serverErrors === "object") {
        setErrors((prev) => ({ ...prev, ...serverErrors }));
      } else if (typeof serverErrors === "string") {
        setErrors((prev) => ({ ...prev, _global: serverErrors }));
      } else {
        setErrors((prev) => ({
          ...prev,
          _global: err?.message || "Lỗi khi lưu dữ liệu",
        }));
      }
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const statusOptions = [
    { value: "AVAILABLE", label: "Có sẵn" },
    { value: "RENTED", label: "Đang cho thuê" },
    { value: "MAINTENANCE", label: "Đang bảo trì" },
    { value: "DAMAGED", label: "Hỏng" },
    { value: "RETIRED", label: "Ngừng sử dụng" },
  ];

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex min-h-screen items-center justify-center p-4">
        <div
          className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm transition-opacity"
          onClick={onClose}
        />

        <div className="relative bg-white dark:bg-[#1a202c] rounded-xl shadow-2xl max-w-xl w-full border border-slate-200 dark:border-slate-800 overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-800">
            <div className="flex items-start justify-between">
              <div>
                <h2 className="text-lg font-semibold text-slate-900 dark:text-white">
                  {editData ? "Chỉnh sửa vợt" : "Thêm vợt mới"}
                </h2>
                <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                  Quản lý thông tin vợt cầu lông.
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

          <form onSubmit={handleSubmit}>
            <div className="px-6 py-4 space-y-4">
              {errors._global && (
                <div className="px-3 py-2 bg-red-50 border border-red-200 text-red-700 rounded-md text-sm">
                  {errors._global}
                </div>
              )}

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-900 dark:text-slate-200 mb-1.5">
                    Mã vợt *
                  </label>
                  <input
                    type="text"
                    name="racketCode"
                    value={formData.racketCode}
                    onChange={handleChange}
                    className="w-full rounded-md border border-slate-300 dark:border-slate-700 px-3 py-2 text-sm text-slate-900 dark:text-white dark:bg-slate-800 focus:ring-2 focus:ring-purple-600 focus:border-transparent"
                    placeholder="Ví dụ: R001"
                  />
                  {errors.racketCode && (
                    <p className="mt-1 text-xs text-red-600">{errors.racketCode}</p>
                  )}
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-900 dark:text-slate-200 mb-1.5">
                    Thương hiệu *
                  </label>
                  <input
                    type="text"
                    name="brand"
                    value={formData.brand}
                    onChange={handleChange}
                    className="w-full rounded-md border border-slate-300 dark:border-slate-700 px-3 py-2 text-sm text-slate-900 dark:text-white dark:bg-slate-800 focus:ring-2 focus:ring-purple-600 focus:border-transparent"
                    placeholder="Ví dụ: YONEX"
                  />
                  {errors.brand && (
                    <p className="mt-1 text-xs text-red-600">{errors.brand}</p>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-900 dark:text-slate-200 mb-1.5">
                    Model *
                  </label>
                  <input
                    type="text"
                    name="model"
                    value={formData.model}
                    onChange={handleChange}
                    className="w-full rounded-md border border-slate-300 dark:border-slate-700 px-3 py-2 text-sm text-slate-900 dark:text-white dark:bg-slate-800 focus:ring-2 focus:ring-purple-600 focus:border-transparent"
                    placeholder="Ví dụ: Arcsaber 11"
                  />
                  {errors.model && (
                    <p className="mt-1 text-xs text-red-600">{errors.model}</p>
                  )}
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-900 dark:text-slate-200 mb-1.5">
                    Trạng thái *
                  </label>
                  <select
                    name="status"
                    value={formData.status}
                    onChange={handleChange}
                    className="w-full rounded-md border border-slate-300 dark:border-slate-700 px-3 py-2 text-sm text-slate-900 dark:text-white dark:bg-slate-800 focus:ring-2 focus:ring-purple-600 focus:border-transparent"
                  >
                    {statusOptions.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                  {errors.status && (
                    <p className="mt-1 text-xs text-red-600">{errors.status}</p>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-900 dark:text-slate-200 mb-1.5">
                    Giá thuê (VND) *
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="1000"
                    name="rentalPrice"
                    value={formData.rentalPrice}
                    onChange={handleChange}
                    className="w-full rounded-md border border-slate-300 dark:border-slate-700 px-3 py-2 text-sm text-slate-900 dark:text-white dark:bg-slate-800 focus:ring-2 focus:ring-purple-600 focus:border-transparent"
                  />
                  {errors.rentalPrice && (
                    <p className="mt-1 text-xs text-red-600">{errors.rentalPrice}</p>
                  )}
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-900 dark:text-slate-200 mb-1.5">
                    Tình trạng *
                  </label>
                  <input
                    type="text"
                    name="conditionStatus"
                    value={formData.conditionStatus}
                    onChange={handleChange}
                    className="w-full rounded-md border border-slate-300 dark:border-slate-700 px-3 py-2 text-sm text-slate-900 dark:text-white dark:bg-slate-800 focus:ring-2 focus:ring-purple-600 focus:border-transparent"
                    placeholder="Ví dụ: Tốt"
                  />
                  {errors.conditionStatus && (
                    <p className="mt-1 text-xs text-red-600">{errors.conditionStatus}</p>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-900 dark:text-slate-200 mb-1.5">
                  Mô tả
                </label>
                <textarea
                  rows="3"
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  className="w-full rounded-md border border-slate-300 dark:border-slate-700 px-3 py-2 text-sm text-slate-900 dark:text-white dark:bg-slate-800 focus:ring-2 focus:ring-purple-600 focus:border-transparent resize-none"
                  placeholder="Ghi chú về vợt này..."
                />
              </div>
            </div>

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
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
                    Đang lưu...
                  </>
                ) : (
                  <>{editData ? "Cập nhật" : "Tạo mới"}</>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default RacketFormModal;
