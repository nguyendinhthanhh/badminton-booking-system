import { useState, useEffect } from 'react';
import courtService from '../../services/courtService';
import CourtFormModal from '../../components/admin/CourtFormModal';
import CourtDetailModal from '../../components/admin/CourtDetailModal';
import ConfirmDialog from '../../components/common/ConfirmDialog';
import Toast from '../../components/common/Toast';

const CourtManagement = () => {
  const [courts, setCourts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [editingCourt, setEditingCourt] = useState(null);
  const [selectedCourt, setSelectedCourt] = useState(null);
  const [deletingCourt, setDeletingCourt] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [toast, setToast] = useState(null);

  useEffect(() => {
    fetchCourts();
  }, []);

  const fetchCourts = async () => {
    try {
      setLoading(true);
      const response = await courtService.getAllCourts(0, 20);
      setCourts(response.content);
    } catch (error) {
      console.error('Error fetching courts:', error);
      showToast('Failed to load courts', 'error');
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
      await fetchCourts();
      showToast('Court created successfully!', 'success');
    } catch (error) {
      console.error('Error creating court:', error);
      showToast('Failed to create court. Please try again.', 'error');
      throw error;
    }
  };

  const handleUpdateCourt = async (courtData) => {
    try {
      await courtService.updateCourt(editingCourt.id, courtData);
      await fetchCourts();
      showToast('Court updated successfully!', 'success');
      setEditingCourt(null);
    } catch (error) {
      console.error('Error updating court:', error);
      showToast('Failed to update court. Please try again.', 'error');
      throw error;
    }
  };

  const handleDeleteCourt = async () => {
    if (!deletingCourt) return;
    
    try {
      setDeleteLoading(true);
      await courtService.deleteCourt(deletingCourt.id);
      await fetchCourts();
      showToast('Court deleted successfully!', 'success');
      setShowDeleteDialog(false);
      setDeletingCourt(null);
    } catch (error) {
      console.error('Error deleting court:', error);
      showToast('Failed to delete court. Please try again.', 'error');
    } finally {
      setDeleteLoading(false);
    }
  };

  const handleEdit = (court) => {
    setEditingCourt(court);
    setShowModal(true);
  };

  const handleViewDetails = async (court) => {
    try {
      const details = await courtService.getCourtById(court.id);
      setSelectedCourt(details);
      setShowDetailModal(true);
    } catch (error) {
      console.error('Error fetching court details:', error);
      showToast('Failed to load court details', 'error');
    }
  };

  const handleDeleteClick = (court) => {
    setDeletingCourt(court);
    setShowDeleteDialog(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingCourt(null);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'ACTIVE':
        return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400';
      case 'MAINTENANCE':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400';
      case 'INACTIVE':
        return 'bg-slate-100 text-slate-800 dark:bg-slate-700 dark:text-slate-300';
      case 'RESERVED':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400';
      default:
        return 'bg-slate-100 text-slate-800 dark:bg-slate-700 dark:text-slate-300';
    }
  };

  const filteredCourts = courts.filter(court =>
    court.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="flex flex-col gap-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Courts Management</h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">
            Manage inventory, surfaces, and availability.
          </p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 rounded-lg bg-[#135bec] hover:bg-blue-700 px-5 py-2.5 text-white shadow-sm"
        >
          <span className="material-symbols-outlined text-[20px]">add</span>
          Add New Court
        </button>
      </div>

      {/* Search */}
      <div className="bg-white dark:bg-[#1a202c] rounded-xl border border-slate-200 dark:border-slate-800 p-4">
        <div className="relative max-w-md">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 material-symbols-outlined text-slate-400">search</span>
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search courts..."
            className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-slate-200 dark:border-slate-700 dark:bg-slate-800 focus:ring-2 focus:ring-[#135bec]"
          />
        </div>
      </div>

      {/* Table */}
      <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#1a202c] overflow-hidden">
        {loading ? (
          <div className="p-12 text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#135bec] mx-auto"></div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-800">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase">Court Name</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase">Type</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase">Capacity</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase">Status</th>
                  <th className="px-6 py-3 text-right text-xs font-semibold text-slate-500 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                {filteredCourts.map((court) => (
                  <tr key={court.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <img 
                          src={court.imageUrl} 
                          alt={court.name} 
                          className="w-10 h-10 rounded-lg object-cover cursor-pointer hover:opacity-80 transition-opacity"
                          onClick={() => handleViewDetails(court)}
                          onError={(e) => {
                            e.target.src = 'https://images.unsplash.com/photo-1626224583764-f87db24ac4ea?w=400';
                          }}
                        />
                        <div>
                          <div 
                            className="font-medium cursor-pointer hover:text-[#135bec] transition-colors"
                            onClick={() => handleViewDetails(court)}
                          >
                            {court.name}
                          </div>
                          <div className="text-xs text-slate-500">ID: #{court.id}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm">{court.type}</td>
                    <td className="px-6 py-4 text-sm">{court.capacity} Players</td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(court.status)}`}>
                        {court.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button 
                          onClick={() => handleViewDetails(court)}
                          className="text-slate-400 hover:text-blue-600 p-1 transition-colors"
                          title="View Details"
                        >
                          <span className="material-symbols-outlined text-[20px]">visibility</span>
                        </button>
                        <button 
                          onClick={() => handleEdit(court)}
                          className="text-slate-400 hover:text-[#135bec] p-1 transition-colors"
                          title="Edit"
                        >
                          <span className="material-symbols-outlined text-[20px]">edit</span>
                        </button>
                        <button 
                          onClick={() => handleDeleteClick(court)}
                          className="text-slate-400 hover:text-red-600 p-1 transition-colors"
                          title="Delete"
                        >
                          <span className="material-symbols-outlined text-[20px]">delete</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modals */}
      <CourtFormModal
        isOpen={showModal}
        onClose={handleCloseModal}
        onSubmit={editingCourt ? handleUpdateCourt : handleCreateCourt}
        editData={editingCourt}
      />

      <CourtDetailModal
        isOpen={showDetailModal}
        onClose={() => setShowDetailModal(false)}
        court={selectedCourt}
      />

      <ConfirmDialog
        isOpen={showDeleteDialog}
        title="Delete Court"
        message={`Are you sure you want to delete "${deletingCourt?.name}"? This action cannot be undone.`}
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
