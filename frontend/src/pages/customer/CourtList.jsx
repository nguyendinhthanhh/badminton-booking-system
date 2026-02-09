import { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import GuestHeader from '../../components/common/GuestHeader';
import CourtCard from '../../components/common/CourtCard';
import CourtCardSkeleton from '../../components/common/CourtCardSkeleton';
import PriceFilterDropdown from '../../components/common/PriceFilterDropdown';
import CourtTypeFilterDropdown from '../../components/common/CourtTypeFilterDropdown';
import FilterChip from '../../components/common/FilterChip';
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
    priceRange: [0, 500000],
    courtTypes: {
      single: true,
      double: true,
      vip: true
    },
    availableOnly: false
  });

  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);
  const [isFiltering, setIsFiltering] = useState(false);

  // Debounce helper
  const debounceTimeout = useRef(null);

  // Court data cache with TTL
  const courtCache = useRef({});

  const defaultCourtImage = 'https://images.unsplash.com/photo-1626224583764-f87db24ac4ea?w=800';

  // Debounced filter update for price slider
  const debouncedFilterUpdate = useCallback((newFilters) => {
    if (debounceTimeout.current) {
      clearTimeout(debounceTimeout.current);
    }
    debounceTimeout.current = setTimeout(() => {
      setFilters(newFilters);
    }, 500);
  }, []);

  // Fetch courts when filters change (excluding price during drag)
  useEffect(() => {
    fetchCourts();
  }, [filters]);

  // Client-side sorting
  const sortedCourts = useMemo(() => {
    if (!courts || courts.length === 0) return [];

    const sorted = [...courts];
    switch (sortBy) {
      case 'price-asc':
        return sorted.sort((a, b) => (a.minPricePerHour || 0) - (b.minPricePerHour || 0));
      case 'price-desc':
        return sorted.sort((a, b) => (b.minPricePerHour || 0) - (a.minPricePerHour || 0));
      case 'name-asc':
        return sorted.sort((a, b) => (a.name || '').localeCompare(b.name || ''));
      case 'recommended':
      default:
        return sorted;
    }
  }, [courts, sortBy]);

  // Check if any filters are active
  const hasActiveFilters = () => {
    const hasTypeFilter = !filters.courtTypes.single || !filters.courtTypes.double || filters.courtTypes.vip;
    const hasPriceFilter = filters.priceRange[0] > 0 || filters.priceRange[1] < 500000;
    return hasTypeFilter || hasPriceFilter;
  };

  // Get active filter count
  const getActiveFilterCount = () => {
    let count = 0;
    if (filters.priceRange[0] > 0 || filters.priceRange[1] < 500000) count++;
    if (!filters.courtTypes.single || !filters.courtTypes.double || filters.courtTypes.vip) count++;
    if (!filters.availableOnly) count++;
    return count;
  };

  // Generate cache key from filters
  const getCacheKey = (filterParams, pageNum) => {
    return JSON.stringify({
      ...filterParams,
      page: pageNum,
      availableOnly: filters.availableOnly
    });
  };

  const fetchCourts = async (page = 0) => {
    // Build filter params first
    const filterParams = {};
    let useFilterAPI = false;

    // Add price filters
    if (filters.priceRange[0] > 0) {
      filterParams.minPrice = filters.priceRange[0];
      useFilterAPI = true;
    }
    if (filters.priceRange[1] < 500000) {
      filterParams.maxPrice = filters.priceRange[1];
      useFilterAPI = true;
    }

    // Add court type filters - FIXED LOGIC
    const types = [];
    if (filters.courtTypes.single) types.push('SINGLE');
    if (filters.courtTypes.double) types.push('DOUBLE');
    if (filters.courtTypes.vip) types.push('VIP');

    // Send filter if:
    // 1. At least one type is selected AND
    // 2. Not all three types are selected (that would be redundant)
    if (types.length > 0 && types.length < 3) {
      filterParams.types = types;
      useFilterAPI = true;
    } else if (types.length === 0) {
      // No types selected - return empty result
      setCourts([]);
      setPagination({ page: 0, size: 20, totalElements: 0, totalPages: 0 });
      return;
    }

    // Check cache first
    const cacheKey = getCacheKey(filterParams, page);
    const cached = courtCache.current[cacheKey];

    if (cached && Date.now() - cached.timestamp < 5 * 60 * 1000) {
      // Use cached data (less than 5 minutes old)
      console.log('📦 Using cached court data');
      setCourts(cached.courts);
      setPagination(cached.pagination);
      return;
    }

    // Fetch from API
    setLoading(true);
    setIsFiltering(true);
    try {
      let response;

      if (useFilterAPI) {
        response = await courtService.filterCourts(filterParams, page, 20);
      } else {
        response = await courtService.getAllCourts(page, 20);
      }

      console.log('✅ API Response:', response);

      // Client-side filter by availability if needed

      let filteredCourts = response.content || [];
      if (filters.availableOnly) {
        filteredCourts = filteredCourts.filter(court => court.isAvailableToday === true);
      }

      // Store in cache
      courtCache.current[cacheKey] = {
        courts: filteredCourts,
        pagination: {
          page: response.number || 0,
          size: response.size || 20,
          totalElements: filteredCourts.length,
          totalPages: response.totalPages || 1
        },
        timestamp: Date.now()
      };

      setCourts(filteredCourts);
      setPagination({
        page: response.number || 0,
        size: response.size || 20,
        totalElements: filteredCourts.length,
        totalPages: response.totalPages || 1
      });
    } catch (error) {
      console.error('Error fetching courts:', error);
      showToast('Lỗi khi tải danh sách sân', 'error');
    } finally {
      setLoading(false);
      setTimeout(() => setIsFiltering(false), 300);
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
      priceRange: [0, 500000],
      courtTypes: {
        single: true,
        double: true,
        vip: true
      },
      availableOnly: false
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

        {/* Filter Toolbar */}
        <div className="mb-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 mb-4">
            {/* Dropdown Filters */}
            <div className="flex flex-wrap items-center gap-2">
              <PriceFilterDropdown
                priceRange={filters.priceRange}
                onChange={(newRange) => setFilters({ ...filters, priceRange: newRange })}
                formatPrice={formatPrice}
              />

              <CourtTypeFilterDropdown
                courtTypes={filters.courtTypes}
                onChange={(newTypes) => setFilters({ ...filters, courtTypes: newTypes })}
              />

              {/* Availability Toggle */}
              <label className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-surface-dark border border-gray-200 dark:border-gray-700 rounded-lg cursor-pointer hover:border-gray-300 transition-colors">
                <input
                  type="checkbox"
                  checked={filters.availableOnly}
                  onChange={(e) => setFilters({ ...filters, availableOnly: e.target.checked })}
                  className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary/20 cursor-pointer"
                />
                <span className="text-sm font-medium text-[#111318] dark:text-white">Chỉ sân còn trống</span>
              </label>
            </div>
          </div>

          {/* Active Filters Display */}
          {getActiveFilterCount() > 0 && (
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-sm text-[#616e89] dark:text-gray-400">Đang lọc:</span>

              {(filters.priceRange[0] > 0 || filters.priceRange[1] < 500000) && (
                <FilterChip
                  label={`${formatPrice(filters.priceRange[0])} - ${formatPrice(filters.priceRange[1])}`}
                  onRemove={() => setFilters({ ...filters, priceRange: [0, 500000] })}
                />
              )}

              {filters.courtTypes.single && !filters.courtTypes.double && !filters.courtTypes.vip && (
                <FilterChip
                  label="Sân đơn"
                  onRemove={() => setFilters({ ...filters, courtTypes: { ...filters.courtTypes, single: false } })}
                />
              )}

              {filters.courtTypes.double && !filters.courtTypes.single && !filters.courtTypes.vip && (
                <FilterChip
                  label="Sân đôi"
                  onRemove={() => setFilters({ ...filters, courtTypes: { ...filters.courtTypes, double: false } })}
                />
              )}

              {filters.courtTypes.vip && (
                <FilterChip
                  label="Sân VIP"
                  onRemove={() => setFilters({ ...filters, courtTypes: { ...filters.courtTypes, vip: false } })}
                />
              )}

              {!filters.availableOnly && (
                <FilterChip
                  label="Tất cả sân"
                  onRemove={() => setFilters({ ...filters, availableOnly: true })}
                />
              )}

              <button
                onClick={resetFilters}
                className="text-sm text-primary font-medium hover:underline"
              >
                Xóa tất cả
              </button>
            </div>
          )}
        </div>

        {/* Main Content */}
        <div className="w-full">
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
                  <option value="recommended">Mặc định</option>
                  <option value="price-asc">Giá thấp đến cao</option>
                  <option value="price-desc">Giá cao đến thấp</option>
                  <option value="name-asc">Tên A-Z</option>
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
            ) : sortedCourts.length > 0 ? (
              /* Actual Card Grid */
              sortedCourts.map((court) => (
                <CourtCard
                  key={court.id}
                  court={court}
                  onViewDetails={handleCourtClick}
                  onBookNow={handleBookNow}
                />
              ))
            ) : (
              /* Empty State */
              <div className="col-span-full flex flex-col items-center justify-center py-16 text-center">
                <span className="material-symbols-outlined text-6xl text-gray-300 dark:text-gray-600 mb-4">sports_tennis</span>
                <h3 className="text-xl font-semibold text-[#111318] dark:text-white mb-2">Không tìm thấy sân</h3>
                <p className="text-[#616e89] dark:text-gray-400 mb-4">
                  Không có sân nào phù hợp với bộ lọc của bạn
                </p>
                <button
                  onClick={resetFilters}
                  className="px-6 py-2 bg-primary text-white rounded-lg font-medium hover:bg-primary/90 transition-colors"
                >
                  Xóa bộ lọc
                </button>
              </div>
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
