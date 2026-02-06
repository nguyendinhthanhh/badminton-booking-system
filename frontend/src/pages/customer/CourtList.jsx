import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import GuestHeader from '../../components/common/GuestHeader';
import CourtCard from '../../components/common/CourtCard';
import CourtCardSkeleton from '../../components/common/CourtCardSkeleton';
import courtService from '../../services/courtService';
import Toast from '../../components/common/Toast';

const CourtList = () => {
  const navigate = useNavigate();
  const [courts, setCourts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState({ show: false, message: '', type: '' });
  const [viewMode, setViewMode] = useState('grid'); // 'grid' or 'list'
  const [sortBy, setSortBy] = useState('recommended');
  const [pagination, setPagination] = useState({
    page: 0,
    size: 20,
    totalElements: 0,
    totalPages: 0
  });

  // Filter states
  const [filters, setFilters] = useState({
    priceRange: [50000, 500000],
    courtTypes: {
      single: true,
      double: true,
      vip: false
    },
    surfaces: {
      pvc: false,
      wood: false,
      concrete: false
    }
  });

  const defaultCourtImage = 'https://images.unsplash.com/photo-1626224583764-f87db24ac4ea?w=800';

  useEffect(() => {
    fetchCourts();
  }, []);

  const fetchCourts = async (page = 0) => {
    setLoading(true);
    try {
      const response = await courtService.getAllCourts(page, 20);
      setCourts(response.content || []);
      setPagination({
        page: response.number || 0,
        size: response.size || 20,
        totalElements: response.totalElements || response.content?.length || 0,
        totalPages: response.totalPages || 1
      });
    } catch (error) {
      console.error('Error fetching courts:', error);
      showToast('Lỗi khi tải danh sách sân', 'error');
    } finally {
      setLoading(false);
    }
  };

  const showToast = (message, type) => {
    setToast({ show: true, message, type });
  };

  const handleCourtClick = (courtId) => {
    navigate(`/courts/${courtId}`);
  };

  const handleBookNow = (courtId) => {
    navigate(`/courts/${courtId}?action=book`);
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('vi-VN').format(price) + 'đ';
  };

  const resetFilters = () => {
    setFilters({
      priceRange: [50000, 500000],
      courtTypes: {
        single: true,
        double: true,
        vip: false
      },
      surfaces: {
        pvc: false,
        wood: false,
        concrete: false
      }
    });
  };

  const handlePageChange = (newPage) => {
    if (newPage >= 0 && newPage < pagination.totalPages) {
      fetchCourts(newPage);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  return (
    <div className="bg-background-light dark:bg-background-dark text-text-main dark:text-white flex flex-col min-h-screen">


      <main className="flex-1 w-full max-w-7xl mx-auto px-4 md:px-10 py-6">
        {/* Breadcrumbs */}
        <nav className="flex items-center gap-2 text-sm text-[#616e89] dark:text-gray-400 mb-6">
          <a className="hover:text-primary transition-colors" href="/">Trang chủ</a>
          <span className="material-symbols-outlined text-[16px]">chevron_right</span>
          <span className="text-[#111318] dark:text-white font-medium">Danh sách sân</span>
        </nav>

        {/* Page Heading */}
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-[#111318] dark:text-white mb-2">
            DANH SÁCH SÂN CẦU LÔNG
          </h1>
          <p className="text-[#616e89] dark:text-gray-400">
            Tìm kiếm và đặt sân cầu lông tốt nhất tại Việt Nam
          </p>
        </div>

        <div className="flex flex-col lg:flex-row gap-8">
          {/* Left Sidebar (Filters) */}
          <aside className="w-full lg:w-72 flex-shrink-0 space-y-6">
            {/* Mobile Filter Toggle */}
            <div className="lg:hidden mb-4">
              <button className="w-full flex items-center justify-center gap-2 bg-white dark:bg-surface-dark border border-gray-200 dark:border-gray-700 rounded-lg py-2 font-medium">
                <span className="material-symbols-outlined">tune</span>
                Bộ lọc tìm kiếm
              </button>
            </div>

            <div className="bg-white dark:bg-surface-dark rounded-xl border border-gray-100 dark:border-gray-700 p-5 shadow-sm hidden lg:block">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-bold text-lg text-[#111318] dark:text-white">Bộ lọc tìm kiếm</h3>
                <button
                  onClick={resetFilters}
                  className="text-sm text-primary font-medium hover:underline"
                >
                  Xóa lọc
                </button>
              </div>

              {/* Price Range */}
              <div className="border-t border-gray-100 dark:border-gray-700 py-4">
                <p className="font-semibold mb-3 text-sm text-[#111318] dark:text-white">Khoảng giá (VND)</p>
                <div className="relative mb-4">
                  <input
                    type="range"
                    min="0"
                    max="500000"
                    step="10000"
                    value={filters.priceRange[0]}
                    onChange={(e) => setFilters({ ...filters, priceRange: [parseInt(e.target.value), filters.priceRange[1]] })}
                    className="w-full h-1 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-primary"
                  />
                </div>
                <div className="flex justify-between text-xs text-[#616e89] dark:text-gray-400 font-medium bg-gray-50 dark:bg-gray-800 rounded px-3 py-2">
                  <span className="font-semibold text-[#111318] dark:text-white">0đ</span>
                  <span className="font-semibold text-[#111318] dark:text-white">500.000đ+</span>
                </div>
              </div>

              {/* Court Type */}
              <div className="border-t border-gray-100 dark:border-gray-700 py-4">
                <p className="font-semibold mb-3 text-sm text-[#111318] dark:text-white">Loại sân</p>
                <div className="space-y-3">
                  <label className="flex items-center gap-3 cursor-pointer group">
                    <input
                      type="checkbox"
                      checked={filters.courtTypes.single}
                      onChange={(e) => setFilters({ ...filters, courtTypes: { ...filters.courtTypes, single: e.target.checked } })}
                      className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary/20 cursor-pointer"
                    />
                    <span className="text-sm text-[#111318] dark:text-white group-hover:text-primary transition-colors">
                      Sân đơn
                    </span>
                  </label>
                  <label className="flex items-center gap-3 cursor-pointer group">
                    <input
                      type="checkbox"
                      checked={filters.courtTypes.double}
                      onChange={(e) => setFilters({ ...filters, courtTypes: { ...filters.courtTypes, double: e.target.checked } })}
                      className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary/20 cursor-pointer"
                    />
                    <span className="text-sm text-[#111318] dark:text-white group-hover:text-primary transition-colors">
                      Sân đôi
                    </span>
                  </label>
                  <label className="flex items-center gap-3 cursor-pointer group">
                    <input
                      type="checkbox"
                      checked={filters.courtTypes.vip}
                      onChange={(e) => setFilters({ ...filters, courtTypes: { ...filters.courtTypes, vip: e.target.checked } })}
                      className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary/20 cursor-pointer"
                    />
                    <span className="text-sm text-[#111318] dark:text-white group-hover:text-primary transition-colors">
                      Sân VIP
                    </span>
                  </label>
                </div>
              </div>

              {/* Surface Type */}
              <div className="border-t border-gray-100 dark:border-gray-700 py-4">
                <p className="font-semibold mb-3 text-sm text-[#111318] dark:text-white">Mặt sân</p>
                <div className="space-y-3">
                  <label className="flex items-center gap-3 cursor-pointer group">
                    <input
                      type="checkbox"
                      checked={filters.surfaces.pvc}
                      onChange={(e) => setFilters({ ...filters, surfaces: { ...filters.surfaces, pvc: e.target.checked } })}
                      className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary/20 cursor-pointer"
                    />
                    <span className="text-sm text-[#111318] dark:text-white group-hover:text-primary transition-colors">
                      Thảm PVC
                    </span>
                  </label>
                  <label className="flex items-center gap-3 cursor-pointer group">
                    <input
                      type="checkbox"
                      checked={filters.surfaces.wood}
                      onChange={(e) => setFilters({ ...filters, surfaces: { ...filters.surfaces, wood: e.target.checked } })}
                      className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary/20 cursor-pointer"
                    />
                    <span className="text-sm text-[#111318] dark:text-white group-hover:text-primary transition-colors">
                      Sàn gỗ
                    </span>
                  </label>
                  <label className="flex items-center gap-3 cursor-pointer group">
                    <input
                      type="checkbox"
                      checked={filters.surfaces.concrete}
                      onChange={(e) => setFilters({ ...filters, surfaces: { ...filters.surfaces, concrete: e.target.checked } })}
                      className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary/20 cursor-pointer"
                    />
                    <span className="text-sm text-[#111318] dark:text-white group-hover:text-primary transition-colors">
                      Bê tông sơn
                    </span>
                  </label>
                </div>
              </div>

              {/* Status */}
              <div className="border-t border-gray-100 dark:border-gray-700 py-4">
                <p className="font-semibold mb-3 text-sm text-[#111318] dark:text-white">Trạng thái</p>
                <div className="space-y-3">
                  <label className="flex items-center gap-3 cursor-pointer group">
                    <input
                      type="checkbox"
                      defaultChecked
                      className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary/20 cursor-pointer"
                    />
                    <span className="text-sm text-[#111318] dark:text-white group-hover:text-primary transition-colors">
                      Còn trống
                    </span>
                  </label>
                </div>
              </div>
            </div>
          </aside>

          {/* Right Content (Grid) */}
          <div className="flex-1">
            {/* Toolbar */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
              <p className="text-[#111318] dark:text-white font-medium">
                Hiển thị <span className="font-bold text-primary">{courts.length}</span> trên <span className="font-bold">{pagination.totalElements}</span> kết quả
              </p>
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2 text-sm text-[#616e89] dark:text-gray-400">
                  <span>Sắp xếp:</span>
                </div>
                <div className="relative">
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="appearance-none bg-white dark:bg-surface-dark border border-gray-200 dark:border-gray-700 rounded-lg py-2 pl-4 pr-10 text-sm font-medium text-[#111318] dark:text-white focus:outline-none focus:ring-2 focus:ring-primary/20 cursor-pointer"
                  >
                    <option value="recommended">Giá thấp đến cao</option>
                    <option value="price-low">Giá cao đến thấp</option>
                    <option value="price-high">Đánh giá cao nhất</option>
                    <option value="rating">Mới nhất</option>
                  </select>
                  <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-[#616e89] dark:text-gray-400">
                    <span className="material-symbols-outlined text-[18px]">expand_more</span>
                  </div>
                </div>
                <div className="flex bg-white dark:bg-surface-dark rounded-lg p-1 border border-gray-200 dark:border-gray-700">
                  <button
                    onClick={() => setViewMode('grid')}
                    className={`p-1.5 rounded transition-colors ${viewMode === 'grid' ? 'bg-primary text-white shadow-sm' : 'text-[#616e89] dark:text-gray-400 hover:text-[#111318] dark:hover:text-white'}`}
                  >
                    <span className="material-symbols-outlined text-[20px]">grid_view</span>
                  </button>
                  <button
                    onClick={() => setViewMode('list')}
                    className={`p-1.5 rounded transition-colors ${viewMode === 'list' ? 'bg-primary text-white shadow-sm' : 'text-[#616e89] dark:text-gray-400 hover:text-[#111318] dark:hover:text-white'}`}
                  >
                    <span className="material-symbols-outlined text-[20px]">view_list</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Court Cards Grid */}
            <div className={`grid ${viewMode === 'grid' ? 'grid-cols-1 md:grid-cols-2 xl:grid-cols-3' : 'grid-cols-1'} gap-6`}>
              {loading ? (
                /* Skeleton Grid */
                Array.from({ length: 6 }).map((_, index) => (
                  <CourtCardSkeleton key={index} />
                ))
              ) : (
                /* Actual Card Grid */
                courts.map((court) => (
                  <CourtCard
                    key={court.id}
                    court={court}
                    onViewDetails={handleCourtClick}
                    onBookNow={handleBookNow}
                  />
                ))
              )}
            </div>

            {/* Pagination */}
            {!loading && pagination.totalPages > 1 && (
              <div className="flex items-center justify-center gap-2 mt-8">
                <button
                  onClick={() => handlePageChange(pagination.page - 1)}
                  disabled={pagination.page === 0}
                  className="size-10 rounded-lg border border-gray-200 dark:border-gray-700 flex items-center justify-center text-[#616e89] dark:text-gray-400 hover:bg-background-light dark:hover:bg-gray-700 hover:text-primary transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <span className="material-symbols-outlined text-[20px]">chevron_left</span>
                </button>

                {[...Array(pagination.totalPages)].map((_, index) => {
                  // Show first page, last page, current page, and pages around current
                  const showPage =
                    index === 0 ||
                    index === pagination.totalPages - 1 ||
                    (index >= pagination.page - 1 && index <= pagination.page + 1);

                  const showEllipsis =
                    (index === pagination.page - 2 && pagination.page > 2) ||
                    (index === pagination.page + 2 && pagination.page < pagination.totalPages - 3);

                  if (showEllipsis) {
                    return (
                      <span key={index} className="px-2 text-[#616e89] dark:text-gray-400">
                        ...
                      </span>
                    );
                  }

                  if (!showPage) return null;

                  return (
                    <button
                      key={index}
                      onClick={() => handlePageChange(index)}
                      className={`size-10 rounded-lg border flex items-center justify-center text-sm font-medium transition-colors ${pagination.page === index
                        ? 'bg-primary text-white border-primary shadow-md shadow-primary/20'
                        : 'border-gray-200 dark:border-gray-700 text-[#616e89] dark:text-gray-400 hover:bg-background-light dark:hover:bg-gray-700 hover:text-primary'
                        }`}
                    >
                      {index + 1}
                    </button>
                  );
                })}

                <button
                  onClick={() => handlePageChange(pagination.page + 1)}
                  disabled={pagination.page === pagination.totalPages - 1}
                  className="size-10 rounded-lg border border-gray-200 dark:border-gray-700 flex items-center justify-center text-[#616e89] dark:text-gray-400 hover:bg-background-light dark:hover:bg-gray-700 hover:text-primary transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <span className="material-symbols-outlined text-[20px]">chevron_right</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Toast */}
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

export default CourtList;
