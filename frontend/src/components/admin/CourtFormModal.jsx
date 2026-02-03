import { useState, useEffect } from 'react';

const CourtFormModal = ({ isOpen, onClose, onSubmit, editData = null }) => {
  const [formData, setFormData] = useState({
    name: '',
    type: 'SINGLE',
    status: 'ACTIVE',
    location: '',
    description: '',
    imageUrl: '',
    capacity: 4
  });
  const [loading, setLoading] = useState(false);

  const courtTypes = [
    { value: 'SINGLE', label: 'Singles Court' },
    { value: 'DOUBLE', label: 'Doubles Court' },
    { value: 'STANDARD', label: 'Standard Court' },
    { value: 'VIP', label: 'VIP Court' },
    { value: 'OUTDOOR', label: 'Outdoor Court' },
    { value: 'INDOOR', label: 'Indoor Court' }
  ];

  const courtStatuses = [
    { value: 'ACTIVE', label: 'Active', color: 'text-green-600' },
    { value: 'MAINTENANCE', label: 'Maintenance', color: 'text-yellow-600' },
    { value: 'INACTIVE', label: 'Inactive', color: 'text-slate-600' },
    { value: 'RESERVED', label: 'Reserved', color: 'text-blue-600' }
  ];

  useEffect(() => {
    if (editData) {
      setFormData({
        name: editData.name || '',
        type: editData.type || 'SINGLE',
        status: editData.status || 'ACTIVE',
        location: editData.location || '',
        description: editData.description || '',
        imageUrl: editData.imageUrl || '',
        capacity: editData.capacity || 4
      });
    } else {
      setFormData({
        name: '',
        type: 'SINGLE',
        status: 'ACTIVE',
        location: '',
        description: '',
        imageUrl: '',
        capacity: 4
      });
    }
  }, [editData, isOpen]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'capacity' ? parseInt(value) : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await onSubmit(formData);
      setFormData({
        name: '',
        type: 'SINGLE',
        status: 'ACTIVE',
        location: '',
        description: '',
        imageUrl: '',
        capacity: 4
      });
      onClose();
    } catch (error) {
      console.error('Error submitting form:', error);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  const isEditMode = !!editData;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex min-h-screen items-center justify-center p-4">
        {/* Backdrop */}
        <div 
          className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm transition-opacity"
          onClick={onClose}
        ></div>

        {/* Modal */}
        <div className="relative bg-white dark:bg-[#1a202c] rounded-xl shadow-2xl max-w-lg w-full border border-slate-200 dark:border-slate-800 overflow-hidden">
          {/* Header */}
          <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-800">
            <div className="flex items-start justify-between">
              <div>
                <h2 className="text-lg font-semibold text-slate-900 dark:text-white">
                  {isEditMode ? 'Chỉnh sửa sân' : 'Thêm sân mới'}
                </h2>
                <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                  {isEditMode ? 'Cập nhật thông tin sân bên dưới.' : 'Vui lòng điền đầy đủ thông tin bên dưới để khởi tạo sân cầu lông mới.'}
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

          {/* Content */}
          <form onSubmit={handleSubmit} className="max-h-[calc(100vh-200px)] overflow-y-auto">
            <div className="px-6 py-4 space-y-4">
              <div>
                <label className="block text-xs font-medium text-slate-900 dark:text-slate-200 mb-1.5">
                  Tên sân *
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  placeholder="Nhập tên sân (vd: Court 10)"
                  className="w-full rounded-md border border-slate-300 dark:border-slate-700 px-3 py-2 text-sm text-slate-900 dark:text-white dark:bg-slate-800 focus:ring-2 focus:ring-purple-600 focus:border-transparent"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-900 dark:text-slate-200 mb-1.5">
                    Loại sân *
                  </label>
                  <select
                    name="type"
                    value={formData.type}
                    onChange={handleChange}
                    className="w-full rounded-md border border-slate-300 dark:border-slate-700 px-3 py-2 text-sm text-slate-900 dark:text-white dark:bg-slate-800 focus:ring-2 focus:ring-purple-600 focus:border-transparent"
                  >
                    {courtTypes.map(type => (
                      <option key={type.value} value={type.value}>{type.label}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-900 dark:text-slate-200 mb-1.5">
                    Sức chứa (người) *
                  </label>
                  <input
                    type="number"
                    name="capacity"
                    value={formData.capacity}
                    onChange={handleChange}
                    required
                    min="2"
                    max="10"
                    className="w-full rounded-md border border-slate-300 dark:border-slate-700 px-3 py-2 text-sm text-slate-900 dark:text-white dark:bg-slate-800 focus:ring-2 focus:ring-purple-600 focus:border-transparent"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-900 dark:text-slate-200 mb-1.5">
                  Vị trí *
                </label>
                <input
                  type="text"
                  name="location"
                  value={formData.location}
                  onChange={handleChange}
                  required
                  placeholder="Tầng, khu vực..."
                  className="w-full rounded-md border border-slate-300 dark:border-slate-700 px-3 py-2 text-sm text-slate-900 dark:text-white dark:bg-slate-800 focus:ring-2 focus:ring-purple-600 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-900 dark:text-slate-200 mb-1.5">
                  Mô tả chi tiết
                </label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  rows="3"
                  placeholder="Thông tin bổ sung về sân, thiết bị..."
                  className="w-full rounded-md border border-slate-300 dark:border-slate-700 px-3 py-2 text-sm text-slate-900 dark:text-white dark:bg-slate-800 focus:ring-2 focus:ring-purple-600 focus:border-transparent resize-none"
                ></textarea>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-900 dark:text-slate-200 mb-1.5">
                  Ảnh sân
                </label>
                <div className="space-y-2">
                  <input
                    type="url"
                    name="imageUrl"
                    value={formData.imageUrl}
                    onChange={handleChange}
                    placeholder="Tải ảnh lên hoặc kéo thả vào đây"
                    className="w-full rounded-md border border-slate-300 dark:border-slate-700 px-3 py-2 text-sm text-slate-900 dark:text-white dark:bg-slate-800 focus:ring-2 focus:ring-purple-600 focus:border-transparent"
                  />
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    PNG, JPG, GIF lên đến 10MB
                  </p>
                  {formData.imageUrl && (
                    <div className="mt-2 rounded-lg overflow-hidden border border-slate-200 dark:border-slate-700">
                      <img 
                        src={formData.imageUrl} 
                        alt="Preview" 
                        className="w-full h-40 object-cover"
                        onError={(e) => {
                          e.target.src = 'https://images.unsplash.com/photo-1626224583764-f87db24ac4ea?w=400';
                        }}
                      />
                    </div>
                  )}
                </div>
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
                  {courtStatuses.map(status => (
                    <option key={status.value} value={status.value}>{status.label}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Footer */}
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
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    {isEditMode ? 'Đang cập nhật...' : 'Đang tạo...'}
                  </>
                ) : (
                  <>{isEditMode ? 'Cập nhật sân' : 'Lưu sân'}</>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default CourtFormModal;
