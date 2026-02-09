const CourtDetailModal = ({ isOpen, onClose, court, loading = false }) => {
  if (!isOpen) return null;

  const getStatusBadge = (status) => {
    const configs = {
      'ACTIVE': { bg: 'bg-green-100', text: 'text-green-700', label: 'Active' },
      'MAINTENANCE': { bg: 'bg-yellow-100', text: 'text-yellow-700', label: 'Maintenance' },
      'INACTIVE': { bg: 'bg-gray-100', text: 'text-gray-700', label: 'Inactive' },
      'RESERVED': { bg: 'bg-blue-100', text: 'text-blue-700', label: 'Reserved' }
    };
    const config = configs[status] || configs.INACTIVE;
    return (
      <span className={`inline-flex items-center px-2 py-1 rounded-md text-xs font-semibold ${config.bg} ${config.text}`}>
        {config.label}
      </span>
    );
  };

  const getTypeLabel = (type) => {
    const types = {
      'SINGLE': 'Singles',
      'DOUBLE': 'Doubles',
      'STANDARD': 'Standard',
      'VIP': 'VIP',
      'OUTDOOR': 'Outdoor',
      'INDOOR': 'Indoor'
    };
    return types[type] || type;
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex min-h-screen items-center justify-center p-4">
        {/* Backdrop */}
        <div 
          className="fixed inset-0 bg-black/50 backdrop-blur-sm"
          onClick={onClose}
        ></div>

        {/* Modal */}
        <div className="relative bg-white dark:bg-slate-900 rounded-lg shadow-xl max-w-2xl w-full border border-gray-200 dark:border-slate-700">
          {/* Header */}
          <div className="flex items-center justify-between px-5 py-4 border-b border-gray-200 dark:border-slate-700">
            <h2 className="text-lg font-bold text-gray-900 dark:text-white">
              Court Details
            </h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
            >
              <span className="material-symbols-outlined">close</span>
            </button>
          </div>

          {/* Content */}
          <div className="p-5 max-h-[calc(100vh-200px)] overflow-y-auto">
            {loading ? (
              <div className="space-y-4">
                <div className="aspect-video bg-gray-200 dark:bg-slate-700 rounded-lg animate-pulse"></div>
                <div className="grid grid-cols-2 gap-3">
                  {[...Array(4)].map((_, i) => (
                    <div key={i} className="h-16 bg-gray-200 dark:bg-slate-700 rounded-lg animate-pulse"></div>
                  ))}
                </div>
              </div>
            ) : court ? (
              <div className="space-y-4">
                {/* Main Image */}
                <div className="aspect-video rounded-lg overflow-hidden bg-gray-100 dark:bg-slate-800">
                  <img 
                    id="main-court-image"
                    src={court.imageUrl || (court.images && court.images.length > 0 ? court.images[0] : 'https://images.unsplash.com/photo-1626224583764-f87db24ac4ea?w=800')} 
                    alt={court.name}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.target.src = 'https://images.unsplash.com/photo-1626224583764-f87db24ac4ea?w=800';
                    }}
                  />
                </div>

                {/* Gallery Thumbnails */}
                {court.images && court.images.length > 0 && (
                  <div className="flex gap-2 overflow-x-auto pb-2">
                    {court.images.map((imgUrl, index) => (
                      <div 
                        key={index} 
                        className="flex-shrink-0 w-20 h-20 rounded-md overflow-hidden bg-gray-100 dark:bg-slate-800 border-2 border-gray-200 dark:border-slate-700 hover:border-blue-500 cursor-pointer transition-colors"
                        onClick={() => {
                          const mainImg = document.getElementById('main-court-image');
                          if (mainImg) mainImg.src = imgUrl;
                        }}
                      >
                        <img 
                          src={imgUrl} 
                          alt={`Gallery ${index + 1}`}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            e.target.src = 'https://images.unsplash.com/photo-1626224583764-f87db24ac4ea?w=200';
                          }}
                        />
                      </div>
                    ))}
                  </div>
                )}

                {/* Info Grid */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-gray-50 dark:bg-slate-800 rounded-lg p-3">
                    <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Court ID</p>
                    <p className="text-sm font-bold text-gray-900 dark:text-white">#{court.id}</p>
                  </div>

                  <div className="bg-gray-50 dark:bg-slate-800 rounded-lg p-3">
                    <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Status</p>
                    {getStatusBadge(court.status)}
                  </div>

                  <div className="bg-gray-50 dark:bg-slate-800 rounded-lg p-3">
                    <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Court Name</p>
                    <p className="text-sm font-bold text-gray-900 dark:text-white">{court.name}</p>
                  </div>

                  <div className="bg-gray-50 dark:bg-slate-800 rounded-lg p-3">
                    <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Type</p>
                    <p className="text-sm font-bold text-gray-900 dark:text-white">{getTypeLabel(court.type)}</p>
                  </div>

                  <div className="bg-gray-50 dark:bg-slate-800 rounded-lg p-3">
                    <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Capacity</p>
                    <p className="text-sm font-bold text-gray-900 dark:text-white">{court.capacity} Players</p>
                  </div>

                  <div className="bg-gray-50 dark:bg-slate-800 rounded-lg p-3">
                    <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Location</p>
                    <p className="text-sm font-bold text-gray-900 dark:text-white">{court.location}</p>
                  </div>
                </div>

                {/* Description */}
                {court.description && (
                  <div className="bg-gray-50 dark:bg-slate-800 rounded-lg p-3">
                    <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Description</p>
                    <p className="text-sm text-gray-700 dark:text-gray-300">{court.description}</p>
                  </div>
                )}
              </div>
            ) : null}
          </div>

          {/* Footer */}
          <div className="flex justify-end gap-2 px-5 py-4 border-t border-gray-200 dark:border-slate-700">
            <button
              onClick={onClose}
              disabled={loading}
              className="px-4 py-2 bg-gray-900 dark:bg-white text-white dark:text-gray-900 rounded-lg text-sm font-semibold hover:bg-gray-800 dark:hover:bg-gray-100 transition-colors disabled:opacity-50"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CourtDetailModal;
