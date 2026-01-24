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
    <div className="fixed inset-0 z-50 overflow-hidden">
      <div 
        className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      ></div>

      <div className="fixed inset-y-0 right-0 flex max-w-full pl-0 md:pl-10">
        <div className="w-screen max-w-md transform transition-transform duration-300">
          <div className="flex h-full flex-col overflow-y-scroll bg-white dark:bg-[#1a202c] shadow-2xl">
            <div className="px-6 py-6 border-b border-slate-200 dark:border-slate-800">
              <div className="flex items-start justify-between">
                <div>
                  <h2 className="text-xl font-semibold text-slate-900 dark:text-white">
                    {isEditMode ? 'Edit Court' : 'Add New Court'}
                  </h2>
                  <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                    {isEditMode ? 'Update court information below.' : 'Fill in the information below to create a new badminton court.'}
                  </p>
                </div>
                <button
                  onClick={onClose}
                  className="rounded-md text-slate-400 hover:text-slate-500 focus:outline-none"
                >
                  <span className="material-symbols-outlined">close</span>
                </button>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="flex-1 px-6 py-6 space-y-6">
              <div>
                <label className="block text-sm font-medium text-slate-900 dark:text-slate-200 mb-2">
                  Court Name *
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  placeholder="e.g. VIP Court 1"
                  className="w-full rounded-md border border-slate-300 dark:border-slate-700 px-3 py-2.5 text-slate-900 dark:text-white dark:bg-slate-800 focus:ring-2 focus:ring-[#135bec] focus:border-transparent"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-900 dark:text-slate-200 mb-2">
                    Court Type *
                  </label>
                  <select
                    name="type"
                    value={formData.type}
                    onChange={handleChange}
                    className="w-full rounded-md border border-slate-300 dark:border-slate-700 px-3 py-2.5 text-slate-900 dark:text-white dark:bg-slate-800 focus:ring-2 focus:ring-[#135bec] focus:border-transparent"
                  >
                    {courtTypes.map(type => (
                      <option key={type.value} value={type.value}>{type.label}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-900 dark:text-slate-200 mb-2">
                    Status *
                  </label>
                  <select
                    name="status"
                    value={formData.status}
                    onChange={handleChange}
                    className="w-full rounded-md border border-slate-300 dark:border-slate-700 px-3 py-2.5 text-slate-900 dark:text-white dark:bg-slate-800 focus:ring-2 focus:ring-[#135bec] focus:border-transparent"
                  >
                    {courtStatuses.map(status => (
                      <option key={status.value} value={status.value}>{status.label}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-900 dark:text-slate-200 mb-2">
                  Location *
                </label>
                <input
                  type="text"
                  name="location"
                  value={formData.location}
                  onChange={handleChange}
                  required
                  placeholder="e.g. West Wing, Ground Floor"
                  className="w-full rounded-md border border-slate-300 dark:border-slate-700 px-3 py-2.5 text-slate-900 dark:text-white dark:bg-slate-800 focus:ring-2 focus:ring-[#135bec] focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-900 dark:text-slate-200 mb-2">
                  Capacity (Players) *
                </label>
                <input
                  type="number"
                  name="capacity"
                  value={formData.capacity}
                  onChange={handleChange}
                  required
                  min="2"
                  max="10"
                  className="w-full rounded-md border border-slate-300 dark:border-slate-700 px-3 py-2.5 text-slate-900 dark:text-white dark:bg-slate-800 focus:ring-2 focus:ring-[#135bec] focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-900 dark:text-slate-200 mb-2">
                  Image URL
                </label>
                <input
                  type="url"
                  name="imageUrl"
                  value={formData.imageUrl}
                  onChange={handleChange}
                  placeholder="https://example.com/image.jpg"
                  className="w-full rounded-md border border-slate-300 dark:border-slate-700 px-3 py-2.5 text-slate-900 dark:text-white dark:bg-slate-800 focus:ring-2 focus:ring-[#135bec] focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-900 dark:text-slate-200 mb-2">
                  Description
                </label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  rows="4"
                  placeholder="Describe the court features..."
                  className="w-full rounded-md border border-slate-300 dark:border-slate-700 px-3 py-2.5 text-slate-900 dark:text-white dark:bg-slate-800 focus:ring-2 focus:ring-[#135bec] focus:border-transparent resize-none"
                ></textarea>
              </div>
            </form>

            <div className="flex justify-end gap-3 px-6 py-4 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50">
              <button
                type="button"
                onClick={onClose}
                disabled={loading}
                className="px-4 py-2 rounded-md bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-200 border border-slate-300 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700 font-medium text-sm disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                onClick={handleSubmit}
                disabled={loading}
                className="px-4 py-2 rounded-md bg-[#135bec] hover:bg-blue-600 text-white font-semibold text-sm disabled:opacity-50 flex items-center gap-2"
              >
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    {isEditMode ? 'Updating...' : 'Creating...'}
                  </>
                ) : (
                  <>{isEditMode ? 'Update Court' : 'Save Court'}</>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CourtFormModal;
