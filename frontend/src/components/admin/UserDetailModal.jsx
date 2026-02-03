const UserDetailModal = ({ user, onClose, loading = false, isOpen = true }) => {
  if (!isOpen) return null;

  const formatDate = (dateString) => {
    if (!dateString) return 'Chưa cập nhật';
    return new Date(dateString).toLocaleDateString('vi-VN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getGenderText = (gender) => {
    switch (gender) {
      case 'MALE': return 'Nam';
      case 'FEMALE': return 'Nữ';
      case 'OTHER': return 'Khác';
      default: return 'Chưa cập nhật';
    }
  };

  const getRoleBadgeColor = (role) => {
    switch (role) {
      case 'ADMIN': return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400';
      case 'MANAGER': return 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400';
      case 'STAFF': return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400';
      case 'USER': return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400';
      default: return 'bg-slate-100 text-slate-800 dark:bg-slate-700 dark:text-slate-300';
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex min-h-screen items-center justify-center p-4">
        {/* Backdrop */}
        <div 
          className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm transition-opacity"
          onClick={onClose}
        ></div>

        {/* Modal */}
        <div className="relative bg-white dark:bg-[#1a202c] rounded-xl shadow-2xl max-w-2xl w-full border border-slate-200 dark:border-slate-800 overflow-hidden">
          {/* Header */}
          <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
            <h2 className="text-xl font-semibold text-slate-900 dark:text-white">
              Chi tiết người dùng
            </h2>
            <button
              onClick={onClose}
              className="text-slate-400 hover:text-slate-500 dark:hover:text-slate-300"
            >
              <span className="material-symbols-outlined">close</span>
            </button>
          </div>

          {/* Content */}
          <div className="p-6 space-y-6">
            {loading ? (
              <>
                {/* Avatar Skeleton */}
                <div className="flex justify-center">
                  <div className="w-24 h-24 rounded-full bg-slate-200 dark:bg-slate-700 animate-pulse"></div>
                </div>

                {/* Info Grid Skeleton */}
                <div className="grid grid-cols-2 gap-4">
                  {[...Array(8)].map((_, i) => (
                    <div key={i} className="space-y-2">
                      <div className="h-3 w-24 bg-slate-200 dark:bg-slate-700 rounded animate-pulse"></div>
                      <div className="h-5 w-full bg-slate-200 dark:bg-slate-700 rounded animate-pulse"></div>
                    </div>
                  ))}
                </div>
              </>
            ) : user ? (
              <>
                {/* Avatar */}
                <div className="flex justify-center">
                  <div className="w-24 h-24 rounded-full overflow-hidden bg-slate-100 dark:bg-slate-800 border-4 border-slate-200 dark:border-slate-700">
                    <img 
                      src={user.avatar || `https://ui-avatars.com/api/?name=${user.fullName || user.username}&size=200`} 
                      alt={user.fullName || user.username}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.target.src = `https://ui-avatars.com/api/?name=${user.fullName || user.username}&size=200`;
                      }}
                    />
                  </div>
                </div>

                {/* Info Grid */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                      User ID
                    </label>
                    <p className="mt-1 text-sm font-medium text-slate-900 dark:text-white">
                      #{user.id}
                    </p>
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                      Vai trò
                    </label>
                    <div className="mt-1">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getRoleBadgeColor(user.roleName)}`}>
                        {user.roleName}
                      </span>
                    </div>
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                      Tên đăng nhập
                    </label>
                    <p className="mt-1 text-sm font-medium text-slate-900 dark:text-white">
                      {user.username}
                    </p>
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                      Họ và tên
                    </label>
                    <p className="mt-1 text-sm font-medium text-slate-900 dark:text-white">
                      {user.fullName || 'Chưa cập nhật'}
                    </p>
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                      Email
                    </label>
                    <p className="mt-1 text-sm font-medium text-slate-900 dark:text-white break-all">
                      {user.email || 'Chưa cập nhật'}
                    </p>
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                      Số điện thoại
                    </label>
                    <p className="mt-1 text-sm font-medium text-slate-900 dark:text-white">
                      {user.phoneNumber || 'Chưa cập nhật'}
                    </p>
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                      Giới tính
                    </label>
                    <p className="mt-1 text-sm font-medium text-slate-900 dark:text-white">
                      {getGenderText(user.gender)}
                    </p>
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                      Ngày sinh
                    </label>
                    <p className="mt-1 text-sm font-medium text-slate-900 dark:text-white">
                      {formatDate(user.dateOfBirth)}
                    </p>
                  </div>

                  <div className="col-span-2">
                    <label className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                      Ngày tạo
                    </label>
                    <p className="mt-1 text-sm font-medium text-slate-900 dark:text-white">
                      {formatDate(user.createdAt)}
                    </p>
                  </div>
                </div>
              </>
            ) : null}
          </div>

          {/* Footer */}
          <div className="px-6 py-4 bg-slate-50 dark:bg-slate-900/50 border-t border-slate-200 dark:border-slate-800 flex justify-end">
            <button
              onClick={onClose}
              disabled={loading}
              className="px-4 py-2 rounded-lg bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-medium text-sm hover:bg-slate-800 dark:hover:bg-slate-100 transition-colors disabled:opacity-50"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserDetailModal;
