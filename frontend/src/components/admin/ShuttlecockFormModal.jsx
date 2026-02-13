import { useEffect, useState } from 'react';

const initialFormData = {
  name: '',
  sku: '',
  basePrice: '',
  quantity: '',
  description: ''
};

const ShuttlecockFormModal = ({ isOpen, onClose, onSubmit, editData = null }) => {
  const [formData, setFormData] = useState(initialFormData);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (editData) {
      setFormData({
        name: editData.name || '',
        sku: editData.sku || '',
        basePrice: editData.basePrice ?? '',
        quantity: editData.quantity ?? '',
        description: editData.description || ''
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
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  const validate = () => {
    const nextErrors = {};
    if (!formData.name.trim()) nextErrors.name = 'Tên cầu không được để trống';
    if (formData.basePrice === '' || Number(formData.basePrice) < 0) {
      nextErrors.basePrice = 'Giá phải lớn hơn hoặc bằng 0';
    }
    if (formData.quantity === '' || Number(formData.quantity) < 0) {
      nextErrors.quantity = 'Số lượng phải lớn hơn hoặc bằng 0';
    }
    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setLoading(true);
    try {
      await onSubmit({
        name: formData.name.trim(),
        sku: formData.sku.trim() || null,
        basePrice: Number(formData.basePrice),
        quantity: Number(formData.quantity),
        description: formData.description.trim() || null
      });
    } finally {
      setLoading(false);
    }
  };

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
                  {editData ? 'Chỉnh sửa loại cầu' : 'Thêm loại cầu mới'}
                </h2>
                <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                  Quản lý thông tin loại cầu lông và số lượng tồn kho.
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
              <div>
                <label className="block text-xs font-medium text-slate-900 dark:text-slate-200 mb-1.5">Tên cầu *</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  className="w-full rounded-md border border-slate-300 dark:border-slate-700 px-3 py-2 text-sm text-slate-900 dark:text-white dark:bg-slate-800 focus:ring-2 focus:ring-purple-600 focus:border-transparent"
                  placeholder="Ví dụ: YONEX AS-50"
                />
                {errors.name && <p className="mt-1 text-xs text-red-600">{errors.name}</p>}
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-900 dark:text-slate-200 mb-1.5">Mã SKU</label>
                  <input
                    type="text"
                    name="sku"
                    value={formData.sku}
                    onChange={handleChange}
                    className="w-full rounded-md border border-slate-300 dark:border-slate-700 px-3 py-2 text-sm text-slate-900 dark:text-white dark:bg-slate-800 focus:ring-2 focus:ring-purple-600 focus:border-transparent"
                    placeholder="Ví dụ: YAS50"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-900 dark:text-slate-200 mb-1.5">Số lượng *</label>
                  <input
                    type="number"
                    min="0"
                    name="quantity"
                    value={formData.quantity}
                    onChange={handleChange}
                    className="w-full rounded-md border border-slate-300 dark:border-slate-700 px-3 py-2 text-sm text-slate-900 dark:text-white dark:bg-slate-800 focus:ring-2 focus:ring-purple-600 focus:border-transparent"
                  />
                  {errors.quantity && <p className="mt-1 text-xs text-red-600">{errors.quantity}</p>}
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-900 dark:text-slate-200 mb-1.5">Giá cơ bản (VND) *</label>
                <input
                  type="number"
                  min="0"
                  step="1000"
                  name="basePrice"
                  value={formData.basePrice}
                  onChange={handleChange}
                  className="w-full rounded-md border border-slate-300 dark:border-slate-700 px-3 py-2 text-sm text-slate-900 dark:text-white dark:bg-slate-800 focus:ring-2 focus:ring-purple-600 focus:border-transparent"
                />
                {errors.basePrice && <p className="mt-1 text-xs text-red-600">{errors.basePrice}</p>}
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-900 dark:text-slate-200 mb-1.5">Mô tả</label>
                <textarea
                  rows="3"
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  className="w-full rounded-md border border-slate-300 dark:border-slate-700 px-3 py-2 text-sm text-slate-900 dark:text-white dark:bg-slate-800 focus:ring-2 focus:ring-purple-600 focus:border-transparent resize-none"
                  placeholder="Ghi chú về loại cầu này..."
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
                  <>{editData ? 'Cập nhật' : 'Tạo mới'}</>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ShuttlecockFormModal;
