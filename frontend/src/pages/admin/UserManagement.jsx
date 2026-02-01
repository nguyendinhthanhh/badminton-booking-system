import { useState, useEffect } from 'react';
import userService from '../../services/userService';
import UserFormModal from '../../components/admin/UserFormModal';
import UserDetailModal from '../../components/admin/UserDetailModal';
import ConfirmDialog from '../../components/common/ConfirmDialog';
import Toast from '../../components/common/Toast';
import StatCardSkeleton from '../../components/common/StatCardSkeleton';
import TableSkeleton from '../../components/common/TableSkeleton';
import CacheIndicator from '../../components/common/CacheIndicator';
import ModalSkeleton from '../../components/common/ModalSkeleton';
import useDataStore from '../../store/useDataStore';

const UserManagement = () => {
  // Get cached data from store
  const {
    users: cachedUsers,
    setUsers: setCachedUsers,
    setUserStats: setCachedStats,
    setUserFilters,
    setUserPage,
    invalidateUsers,
    isCacheValid
  } = useDataStore();

  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(cachedUsers.page);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  const [selectedUser, setSelectedUser] = useState(null);
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState(null);
  const [toast, setToast] = useState({ show: false, message: '', type: '' });
  const [loadingUser, setLoadingUser] = useState(false);
  const [loadingModalType, setLoadingModalType] = useState(null); // 'detail' or 'form'
  const [isUsingCache, setIsUsingCache] = useState(false);
  
  const [filters, setFilters] = useState(cachedUsers.filters);

  // Real stats from API
  const [stats, setStats] = useState(
    cachedUsers.stats || {
      total: 0,
      active: 0,
      locked: 0,
      roles: { admin: 0, manager: 0, staff: 0, user: 0 }
    }
  );

  useEffect(() => {
    // Check if we have valid cached data
    if (isCacheValid(cachedUsers.lastFetch) && cachedUsers.data) {
      // Use cached data
      setUsers(cachedUsers.data.content || []);
      setTotalPages(cachedUsers.data.totalPages || 0);
      setTotalElements(cachedUsers.data.totalElements || 0);
      if (cachedUsers.stats) {
        setStats(cachedUsers.stats);
      }
      setLoading(false);
      setIsUsingCache(true);
      
      // Hide cache indicator after 3 seconds
      setTimeout(() => setIsUsingCache(false), 3000);
    } else {
      // Fetch fresh data
      setIsUsingCache(false);
      fetchUsers();
      fetchStats();
    }
  }, [page, filters.sortBy, filters.sortDir]);

  const fetchStats = async () => {
    try {
      // Fetch all users to calculate stats
      const allUsersData = await userService.getAllUsers(0, 10000, {});
      const allUsers = allUsersData.content || [];
      
      const total = allUsers.length;
      const active = allUsers.filter(u => u.status !== 'LOCKED').length;
      const locked = allUsers.filter(u => u.status === 'LOCKED').length;
      
      const roleCount = {
        admin: allUsers.filter(u => u.roleName === 'ADMIN').length,
        manager: allUsers.filter(u => u.roleName === 'MANAGER').length,
        staff: allUsers.filter(u => u.roleName === 'STAFF').length,
        user: allUsers.filter(u => u.roleName === 'USER').length
      };

      const newStats = {
        total,
        active,
        locked,
        roles: roleCount
      };

      setStats(newStats);
      setCachedStats(newStats);
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const data = await userService.getAllUsers(page, 10, filters);
      setUsers(data.content || []);
      setTotalPages(data.totalPages || 0);
      setTotalElements(data.totalElements || 0);
      
      // Cache the data
      setCachedUsers(data);
      setUserFilters(filters);
      setUserPage(page);
    } catch (error) {
      showToast('Lỗi khi tải danh sách người dùng', 'error');
    } finally {
      setLoading(false);
    }
  };

  const showToast = (message, type) => {
    setToast({ show: true, message, type });
  };

  const handleFilterChange = (name, value) => {
    setFilters(prev => ({ ...prev, [name]: value }));
  };

  const handleSearch = () => {
    setPage(0);
    fetchUsers();
  };

  const handleViewDetail = async (userId) => {
    setLoadingUser(true);
    
    // Only show skeleton if API takes longer than 300ms
    const skeletonTimer = setTimeout(() => {
      setLoadingModalType('detail');
    }, 300);
    
    try {
      const user = await userService.getUserById(userId);
      clearTimeout(skeletonTimer);
      setLoadingModalType(null);
      setSelectedUser(user);
      setIsDetailModalOpen(true);
    } catch (error) {
      clearTimeout(skeletonTimer);
      setLoadingModalType(null);
      showToast('Lỗi khi tải thông tin người dùng', 'error');
    } finally {
      setLoadingUser(false);
    }
  };

  const handleEdit = async (userId) => {
    setLoadingUser(true);
    
    // Only show skeleton if API takes longer than 300ms
    const skeletonTimer = setTimeout(() => {
      setLoadingModalType('form');
    }, 300);
    
    try {
      const user = await userService.getUserById(userId);
      clearTimeout(skeletonTimer);
      setLoadingModalType(null);
      
      // Set user data first
      setSelectedUser(user);
      
      // Wait a tiny bit to ensure state is updated before opening modal
      setTimeout(() => {
        setIsFormModalOpen(true);
      }, 10);
    } catch (error) {
      clearTimeout(skeletonTimer);
      setLoadingModalType(null);
      showToast('Lỗi khi tải thông tin người dùng', 'error');
    } finally {
      setLoadingUser(false);
    }
  };

  const handleDeleteClick = (user) => {
    setUserToDelete(user);
    setIsDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    try {
      await userService.deleteUser(userToDelete.id);
      showToast('Xóa người dùng thành công', 'success');
      invalidateUsers(); // Invalidate cache
      await fetchUsers();
      await fetchStats();
    } catch (error) {
      showToast('Lỗi khi xóa người dùng', 'error');
    } finally {
      setIsDeleteDialogOpen(false);
      setUserToDelete(null);
    }
  };

  const handleFormSubmit = async (userData) => {
    try {
      await userService.updateUser(selectedUser.id, userData);
      showToast('Cập nhật người dùng thành công', 'success');
      setIsFormModalOpen(false);
      setSelectedUser(null);
      invalidateUsers(); // Invalidate cache
      await fetchUsers();
      await fetchStats();
    } catch (error) {
      showToast('Lỗi khi cập nhật người dùng', 'error');
    }
  };

  const getRoleBadge = (role) => {
    const config = {
      ADMIN: { bg: 'bg-purple-100', text: 'text-purple-700', border: 'border-purple-200', label: 'Admin' },
      MANAGER: { bg: 'bg-blue-100', text: 'text-blue-700', border: 'border-blue-200', label: 'Chủ sân' },
      STAFF: { bg: 'bg-blue-100', text: 'text-blue-700', border: 'border-blue-200', label: 'Nhân viên' },
      USER: { bg: 'bg-gray-100', text: 'text-gray-600', border: 'border-gray-200', label: 'Khách' }
    };
    const style = config[role] || config.USER;
    return (
      <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold ${style.bg} ${style.text} border ${style.border}`}>
        {style.label}
      </span>
    );
  };

  const getStatusBadge = (status) => {
    // Assuming status field exists, otherwise use a default
    const isActive = status !== 'LOCKED';
    return (
      <div className="flex items-center gap-1.5">
        <span className={`w-2 h-2 rounded-full ${isActive ? 'bg-green-500' : 'bg-red-500'}`}></span>
        <span className="text-gray-900 font-medium text-sm">{isActive ? 'Active' : 'Locked'}</span>
      </div>
    );
  };

  const formatDate = (dateString) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString('vi-VN');
  };

  return (
    <div className="flex-1 overflow-y-auto p-4 md:p-8 bg-gray-50">
      <div className="max-w-7xl mx-auto flex flex-col gap-6">
        {/* Page Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-3xl font-black text-gray-900 tracking-tight">Quản lý người dùng</h1>
              <CacheIndicator isCached={isUsingCache} />
            </div>
            <p className="text-gray-600 text-sm mt-1">Xem, chỉnh sửa và quản lý tất cả tài khoản hệ thống.</p>
          </div>
          <div className="flex gap-3">
            <button className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg text-gray-900 text-sm font-bold hover:bg-gray-50 transition-colors shadow-sm">
              <span className="material-symbols-outlined text-lg">download</span>
              Xuất Excel
            </button>
            <button className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg text-sm font-bold hover:bg-purple-700 transition-colors shadow-md shadow-purple-600/20">
              <span className="material-symbols-outlined text-lg">add</span>
              Thêm người dùng
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
                  <p className="text-gray-600 font-medium text-sm">Tổng người dùng</p>
                  <span className="material-symbols-outlined text-purple-600 bg-purple-100 p-1 rounded-md text-xl">groups</span>
                </div>
                <div>
                  <p className="text-3xl font-bold text-gray-900">{stats.total.toLocaleString()}</p>
                  <div className="flex items-center gap-1 text-green-600 text-xs font-medium mt-1">
                    <span className="material-symbols-outlined text-base">trending_up</span>
                    <span>+12% so với tháng trước</span>
                  </div>
                </div>
              </div>

              <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm flex flex-col justify-between h-32">
                <div className="flex justify-between items-start">
                  <p className="text-gray-600 font-medium text-sm">Đang hoạt động</p>
                  <span className="material-symbols-outlined text-green-600 bg-green-100 p-1 rounded-md text-xl">check_circle</span>
                </div>
                <div>
                  <p className="text-3xl font-bold text-gray-900">{stats.active.toLocaleString()}</p>
                  <div className="flex items-center gap-1 text-green-600 text-xs font-medium mt-1">
                    <span className="material-symbols-outlined text-base">trending_up</span>
                    <span>+5% tuần này</span>
                  </div>
                </div>
              </div>

              <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm flex flex-col justify-between h-32">
                <div className="flex justify-between items-start">
                  <p className="text-gray-600 font-medium text-sm">Bị khóa</p>
                  <span className="material-symbols-outlined text-red-600 bg-red-100 p-1 rounded-md text-xl">lock</span>
                </div>
                <div>
                  <p className="text-3xl font-bold text-gray-900">{stats.locked}</p>
                  <div className="flex items-center gap-1 text-red-600 text-xs font-medium mt-1">
                    <span className="material-symbols-outlined text-base">trending_down</span>
                    <span>-2% mới bị khóa</span>
                  </div>
                </div>
              </div>

              <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm flex flex-col justify-between h-32">
                <div className="flex justify-between items-start">
                  <p className="text-gray-600 font-medium text-sm">Phân loại vai trò</p>
                  <span className="material-symbols-outlined text-blue-600 bg-blue-100 p-1 rounded-md text-xl">badge</span>
                </div>
                <div className="flex flex-col gap-1">
                  <div className="flex justify-between text-xs">
                    <span className="text-gray-600">Admin:</span>
                    <span className="font-bold text-gray-900">{stats.roles.admin}</span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-gray-600">Chủ sân:</span>
                    <span className="font-bold text-gray-900">{stats.roles.manager}</span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-gray-600">Khách:</span>
                    <span className="font-bold text-gray-900">{stats.roles.user.toLocaleString()}</span>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>

        {/* Filters & Table */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm flex flex-col overflow-hidden">
          {/* Search & Filters */}
          <div className="p-4 border-b border-gray-200 flex flex-col lg:flex-row gap-4 items-center justify-between">
            <div className="relative w-full lg:w-96">
              <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 text-xl">search</span>
              <input
                type="text"
                value={filters.keyword}
                onChange={(e) => handleFilterChange('keyword', e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                className="w-full pl-10 pr-4 py-2.5 rounded-lg bg-gray-50 border-transparent focus:bg-white focus:border-purple-600 focus:ring-2 focus:ring-purple-600/20 text-sm font-medium text-gray-900 transition-all outline-none placeholder:text-gray-500"
                placeholder="Tìm kiếm theo tên, email, SĐT..."
              />
            </div>

            <div className="flex flex-wrap gap-3 w-full lg:w-auto">
              <div className="relative">
                <select
                  value={filters.roleName}
                  onChange={(e) => {
                    handleFilterChange('roleName', e.target.value);
                    handleSearch();
                  }}
                  className="appearance-none pl-4 pr-10 py-2.5 rounded-lg bg-gray-50 border-transparent focus:bg-white focus:border-purple-600 focus:ring-2 focus:ring-purple-600/20 text-sm font-medium text-gray-900 cursor-pointer outline-none transition-all"
                >
                  <option value="">Vai trò: Tất cả</option>
                  <option value="ADMIN">Admin</option>
                  <option value="MANAGER">Chủ sân</option>
                  <option value="STAFF">Nhân viên</option>
                  <option value="USER">Khách hàng</option>
                </select>
                <span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none text-sm">expand_more</span>
              </div>
              <button
                onClick={handleSearch}
                className="px-3 py-2.5 rounded-lg bg-gray-50 text-gray-600 hover:text-gray-900 hover:bg-gray-200 transition-colors"
                title="Tìm kiếm"
              >
                <span className="material-symbols-outlined text-xl">search</span>
              </button>
            </div>
          </div>

          {/* Table */}
          {loading ? (
            <div className="overflow-x-auto">
              <TableSkeleton rows={10} columns={6} />
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-200 text-xs uppercase text-gray-600 font-semibold">
                    <th className="p-4 min-w-[250px]">Người dùng</th>
                    <th className="p-4 min-w-[150px]">Số điện thoại</th>
                    <th className="p-4">Vai trò</th>
                    <th className="p-4">Trạng thái</th>
                    <th className="p-4">Ngày tạo</th>
                    <th className="p-4 text-right">Thao tác</th>
                  </tr>
                </thead>
                <tbody className="text-sm">
                  {users.length === 0 ? (
                    <tr>
                      <td colSpan="6" className="p-12 text-center text-gray-500">
                        Không tìm thấy người dùng nào
                      </td>
                    </tr>
                  ) : (
                    users.map((user) => (
                      <tr
                        key={user.id}
                        className={`border-b border-gray-200 hover:bg-gray-50 transition-colors ${
                          user.status === 'LOCKED' ? 'bg-gray-50/50' : ''
                        }`}
                      >
                        <td className="p-4">
                          <div className="flex items-center gap-3">
                            {user.avatar ? (
                              <img
                                src={user.avatar}
                                alt={user.fullName}
                                className="w-10 h-10 rounded-full object-cover border border-gray-200"
                              />
                            ) : (
                              <div className="w-10 h-10 rounded-full bg-purple-100 text-purple-600 flex items-center justify-center font-bold border border-purple-200">
                                {user.username?.charAt(0).toUpperCase()}
                              </div>
                            )}
                            <div className="flex flex-col">
                              <span className={`font-bold ${user.status === 'LOCKED' ? 'text-gray-600' : 'text-gray-900'}`}>
                                {user.fullName || user.username}
                              </span>
                              <span className="text-gray-600 text-xs">{user.email}</span>
                            </div>
                          </div>
                        </td>
                        <td className="p-4 text-gray-900 font-medium">{user.phoneNumber || '-'}</td>
                        <td className="p-4">{getRoleBadge(user.roleName)}</td>
                        <td className="p-4">{getStatusBadge(user.status)}</td>
                        <td className="p-4 text-gray-600">{formatDate(user.createdAt)}</td>
                        <td className="p-4 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <button
                              onClick={() => handleViewDetail(user.id)}
                              disabled={loadingUser}
                              className="p-1.5 text-gray-600 hover:text-purple-600 hover:bg-purple-50 rounded transition-colors disabled:opacity-50"
                              title="Xem chi tiết"
                            >
                              <span className="material-symbols-outlined text-lg">visibility</span>
                            </button>
                            <button
                              onClick={() => handleEdit(user.id)}
                              disabled={loadingUser}
                              className="p-1.5 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors disabled:opacity-50"
                              title="Chỉnh sửa"
                            >
                              <span className="material-symbols-outlined text-lg">edit</span>
                            </button>
                            <button
                              onClick={() => handleDeleteClick(user)}
                              disabled={loadingUser}
                              className="p-1.5 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded transition-colors disabled:opacity-50"
                              title={user.status === 'LOCKED' ? 'Mở khóa' : 'Khóa tài khoản'}
                            >
                              <span className="material-symbols-outlined text-lg">
                                {user.status === 'LOCKED' ? 'lock_open' : 'lock'}
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

          {/* Pagination */}
          {totalPages > 0 && (
            <div className="p-4 border-t border-gray-200 flex flex-col sm:flex-row items-center justify-between gap-4">
              <p className="text-sm text-gray-600">
                Hiển thị <span className="font-bold text-gray-900">{page * 10 + 1}</span> đến{' '}
                <span className="font-bold text-gray-900">{Math.min((page + 1) * 10, totalElements)}</span> trong tổng số{' '}
                <span className="font-bold text-gray-900">{totalElements.toLocaleString()}</span> kết quả
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
                {totalPages > 5 && page < totalPages - 3 && (
                  <>
                    <span className="text-gray-600 px-1">...</span>
                    <button
                      onClick={() => setPage(totalPages - 1)}
                      className="px-3 py-1.5 rounded-lg border border-gray-300 bg-white text-gray-600 text-sm font-medium hover:bg-gray-50 hover:text-purple-600"
                    >
                      {totalPages}
                    </button>
                  </>
                )}
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

      {/* Modal Skeleton Loading */}
      {loadingUser && loadingModalType && (
        <ModalSkeleton type={loadingModalType} />
      )}

      {/* Modals */}
      {isFormModalOpen && (
        <UserFormModal
          user={selectedUser}
          onClose={() => {
            setIsFormModalOpen(false);
            setSelectedUser(null);
          }}
          onSubmit={handleFormSubmit}
        />
      )}

      {isDetailModalOpen && (
        <UserDetailModal
          user={selectedUser}
          onClose={() => {
            setIsDetailModalOpen(false);
            setSelectedUser(null);
          }}
        />
      )}

      {isDeleteDialogOpen && (
        <ConfirmDialog
          title="Xác nhận xóa"
          message={`Bạn có chắc chắn muốn xóa người dùng "${userToDelete?.fullName}"?`}
          onConfirm={handleDeleteConfirm}
          onCancel={() => {
            setIsDeleteDialogOpen(false);
            setUserToDelete(null);
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

export default UserManagement;
