const UserDetailModal = ({ user, onClose }) => {
  if (!user) return null;

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
      case 'ADMIN': return 'bg-red-100 text-red-800 border-red-200';
      case 'MANAGER': return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'STAFF': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'USER': return 'bg-green-100 text-green-800 border-green-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const InfoRow = ({ icon, label, value, badge = false, badgeColor = '' }) => (
    <div className="flex items-start gap-4 p-4 hover:bg-gray-50 rounded-lg transition-colors">
      <div className="flex-shrink-0 w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center">
        <span className="material-symbols-outlined text-blue-600 text-xl">{icon}</span>
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-gray-500 mb-1">{label}</p>
        {badge ? (
          <span className={`px-3 py-1 inline-flex text-sm font-semibold rounded-full border ${badgeColor}`}>
            {value}
          </span>
        ) : (
          <p className="text-base font-medium text-gray-900 break-words">{value}</p>
        )}
      </div>
    </div>
  );

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div className="bg-white rounded-2xl w-full max-w-3xl max-h-[90vh] overflow-hidden shadow-2xl" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center">
                <span className="text-2xl font-bold text-blue-600">
                  {user.username?.charAt(0).toUpperCase()}
                </span>
              </div>
              <div>
                <h2 className="text-2xl font-bold text-white">Chi tiết người dùng</h2>
                <p className="text-blue-100 text-sm mt-1">ID: #{user.id}</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="text-white hover:bg-white/20 rounded-lg p-2 transition-colors"
            >
              <span className="material-symbols-outlined text-2xl">close</span>
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-140px)]">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <InfoRow
              icon="badge"
              label="Tên đăng nhập"
              value={user.username}
            />
            
            <InfoRow
              icon="person"
              label="Họ và tên"
              value={user.fullName || 'Chưa cập nhật'}
            />
            
            <InfoRow
              icon="email"
              label="Email"
              value={user.email || 'Chưa cập nhật'}
            />
            
            <InfoRow
              icon="phone"
              label="Số điện thoại"
              value={user.phoneNumber || 'Chưa cập nhật'}
            />
            
            <InfoRow
              icon="wc"
              label="Giới tính"
              value={getGenderText(user.gender)}
            />
            
            <InfoRow
              icon="cake"
              label="Ngày sinh"
              value={formatDate(user.dateOfBirth)}
            />
            
            <InfoRow
              icon="shield"
              label="Vai trò"
              value={user.roleName}
              badge={true}
              badgeColor={getRoleBadgeColor(user.roleName)}
            />
            
            <InfoRow
              icon="schedule"
              label="Ngày tạo"
              value={formatDate(user.createdAt)}
            />
          </div>
        </div>

        {/* Footer */}
        <div className="border-t border-gray-200 px-6 py-4 bg-gray-50">
          <div className="flex justify-end">
            <button
              onClick={onClose}
              className="px-6 py-2.5 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors font-medium"
            >
              Đóng
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserDetailModal;
