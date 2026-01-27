const CourtDetailModal = ({ isOpen, onClose, court }) => {
  if (!isOpen || !court) return null;

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

  const getTypeLabel = (type) => {
    const types = {
      'SINGLE': 'Singles Court',
      'DOUBLE': 'Doubles Court',
      'STANDARD': 'Standard Court',
      'VIP': 'VIP Court',
      'OUTDOOR': 'Outdoor Court',
      'INDOOR': 'Indoor Court'
    };
    return types[type] || type;
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
              Court Details
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
            {/* Image */}
            {court.imageUrl && (
              <div className="aspect-video rounded-lg overflow-hidden bg-slate-100 dark:bg-slate-800">
                <img 
                  src={court.imageUrl} 
                  alt={court.name}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    e.target.src = 'https://images.unsplash.com/photo-1626224583764-f87db24ac4ea?w=800';
                  }}
                />
              </div>
            )}

            {/* Info Grid */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                  Court ID
                </label>
                <p className="mt-1 text-sm font-medium text-slate-900 dark:text-white">
                  #{court.id}
                </p>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                  Status
                </label>
                <div className="mt-1">
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(court.status)}`}>
                    {court.status}
                  </span>
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                  Court Name
                </label>
                <p className="mt-1 text-sm font-medium text-slate-900 dark:text-white">
                  {court.name}
                </p>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                  Type
                </label>
                <p className="mt-1 text-sm font-medium text-slate-900 dark:text-white">
                  {getTypeLabel(court.type)}
                </p>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                  Capacity
                </label>
                <p className="mt-1 text-sm font-medium text-slate-900 dark:text-white flex items-center gap-1">
                  <span className="material-symbols-outlined text-[18px]">group</span>
                  {court.capacity} Players
                </p>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                  Location
                </label>
                <p className="mt-1 text-sm font-medium text-slate-900 dark:text-white">
                  {court.location}
                </p>
              </div>
            </div>

            {/* Description */}
            {court.description && (
              <div>
                <label className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                  Description
                </label>
                <p className="mt-2 text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                  {court.description}
                </p>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="px-6 py-4 bg-slate-50 dark:bg-slate-900/50 border-t border-slate-200 dark:border-slate-800 flex justify-end">
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-lg bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-medium text-sm hover:bg-slate-800 dark:hover:bg-slate-100 transition-colors"
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
