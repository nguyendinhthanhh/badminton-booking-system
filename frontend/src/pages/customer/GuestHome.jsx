import { useState, useEffect } from 'react';
import CourtCard from '../../components/common/CourtCard';
import courtService from '../../services/courtService';

const GuestHome = () => {
  const [selectedFilter, setSelectedFilter] = useState('all');
  const [courts, setCourts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState({
    page: 0,
    size: 20,
    totalPages: 0,
    totalElements: 0
  });

  // Fetch courts từ API
  useEffect(() => {
    fetchCourts();
  }, [pagination.page]);

  const fetchCourts = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await courtService.getAllCourts(pagination.page, pagination.size);
      
      // Transform API data sang format component
      const transformedCourts = response.content.map(court => ({
        id: court.id,
        name: court.name,
        type: court.type === 'SINGLE' ? 'Singles' : 'Doubles',
        image: court.imageUrl || 'https://images.unsplash.com/photo-1626224583764-f87db24ac4ea?w=800',
        status: court.status === 'ACTIVE' ? 'available' : 'occupied',
        capacity: court.type === 'SINGLE' ? 'Singles (2)' : 'Doubles (4)',
        capacityNumber: court.capacity,
        location: court.location,
        description: court.description,
        features: getCourtFeatures(court),
        price: calculatePrice(court)
      }));

      setCourts(transformedCourts);
      setPagination(prev => ({
        ...prev,
        totalPages: response.totalPages,
        totalElements: response.totalElements
      }));
    } catch (err) {
      setError('Không thể tải danh sách sân. Vui lòng thử lại sau.');
      console.error('Error fetching courts:', err);
    } finally {
      setLoading(false);
    }
  };

  // Helper function để lấy features dựa trên court data
  const getCourtFeatures = (court) => {
    // Có thể customize dựa trên court type hoặc properties khác
    const features = {
      'SINGLE': { icon: 'person', label: 'Singles' },
      'DOUBLE': { icon: 'group', label: 'Doubles' }
    };
    return features[court.type] || { icon: 'sports_tennis', label: 'Standard' };
  };

  // Helper function để tính giá (có thể lấy từ API sau)
  const calculatePrice = (court) => {
    // Tạm thời return giá mặc định, sau này có thể lấy từ API
    return court.type === 'SINGLE' ? 15.00 : 25.00;
  };

  // Filter courts dựa trên selectedFilter
  const filteredCourts = courts.filter(court => {
    if (selectedFilter === 'all') return true;
    if (selectedFilter === 'vip') return court.price >= 25;
    if (selectedFilter === 'standard') return court.price < 25;
    return true;
  });

  return (
    <div className="min-h-screen bg-[#f6f8f6] dark:bg-[#102215]">
      {/* Hero Section */}
      <section 
        className="relative w-full min-h-[600px] flex items-center justify-center bg-cover bg-center py-20 px-4"
        style={{
          backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.4), rgba(0, 0, 0, 0.6)), url('https://images.unsplash.com/photo-1626224583764-f87db24ac4ea?w=1600')`
        }}
      >
        <div className="relative z-10 w-full max-w-4xl flex flex-col items-center gap-8">
          <div className="text-center space-y-4">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-black text-white leading-tight tracking-tight drop-shadow-sm">
              Book Your Court.<br/>Play Your Game.
            </h1>
            <p className="text-lg md:text-xl text-gray-200 font-normal max-w-2xl mx-auto">
              Premium standard and synthetic courts available for instant booking. Join the community of passionate players.
            </p>
          </div>

          {/* Search Card */}
          <div className="w-full bg-white dark:bg-[#1a2e21] rounded-xl shadow-xl p-4 md:p-6 mt-4">
            <form className="flex flex-col md:flex-row gap-4 items-end">
              {/* Date Picker */}
              <div className="w-full md:flex-1 space-y-1.5">
                <label className="text-xs font-semibold uppercase text-gray-500 dark:text-gray-400 tracking-wider">Date</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-[#13ec49]">
                    <span className="material-symbols-outlined text-[20px]">calendar_today</span>
                  </div>
                  <input 
                    type="date" 
                    required
                    className="w-full h-11 pl-10 pr-3 rounded-lg border border-gray-200 dark:border-gray-600 bg-[#f6f8f6] dark:bg-[#102215] text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-[#13ec49] focus:border-transparent outline-none transition-shadow"
                  />
                </div>
              </div>

              {/* Time Range */}
              <div className="w-full md:flex-1 space-y-1.5">
                <label className="text-xs font-semibold uppercase text-gray-500 dark:text-gray-400 tracking-wider">Time</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-[#13ec49]">
                    <span className="material-symbols-outlined text-[20px]">schedule</span>
                  </div>
                  <select className="w-full h-11 pl-10 pr-8 rounded-lg border border-gray-200 dark:border-gray-600 bg-[#f6f8f6] dark:bg-[#102215] text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-[#13ec49] focus:border-transparent outline-none appearance-none transition-shadow">
                    <option value="">Select Time</option>
                    <option>06:00 AM - 07:00 AM</option>
                    <option>07:00 AM - 08:00 AM</option>
                    <option>08:00 AM - 09:00 AM</option>
                    <option>05:00 PM - 06:00 PM</option>
                    <option>06:00 PM - 07:00 PM</option>
                  </select>
                  <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none text-gray-400">
                    <span className="material-symbols-outlined text-[20px]">expand_more</span>
                  </div>
                </div>
              </div>

              {/* Court Type */}
              <div className="w-full md:flex-1 space-y-1.5">
                <label className="text-xs font-semibold uppercase text-gray-500 dark:text-gray-400 tracking-wider">Surface</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-[#13ec49]">
                    <span className="material-symbols-outlined text-[20px]">layers</span>
                  </div>
                  <select className="w-full h-11 pl-10 pr-8 rounded-lg border border-gray-200 dark:border-gray-600 bg-[#f6f8f6] dark:bg-[#102215] text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-[#13ec49] focus:border-transparent outline-none appearance-none transition-shadow">
                    <option value="any">Any Surface</option>
                    <option value="synthetic">Pro Synthetic</option>
                    <option value="wooden">Standard Wooden</option>
                  </select>
                  <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none text-gray-400">
                    <span className="material-symbols-outlined text-[20px]">expand_more</span>
                  </div>
                </div>
              </div>

              {/* Submit Button */}
              <div className="w-full md:w-auto">
                <button 
                  type="button"
                  className="w-full md:min-w-[140px] h-11 bg-[#13ec49] hover:bg-[#0fb839] text-[#0d1b11] text-base font-bold rounded-lg shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2"
                >
                  <span className="material-symbols-outlined">search</span>
                  Find Court
                </button>
              </div>
            </form>
          </div>
        </div>
      </section>

      {/* Available Courts Section */}
      <main className="flex-grow w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
          <div>
            <h2 className="text-2xl md:text-3xl font-bold text-[#0d1b11] dark:text-white tracking-tight">Available Courts</h2>
            <p className="text-gray-600 dark:text-gray-400 mt-1">Select a court to view details and book your slot.</p>
          </div>

          {/* Filter Tags */}
          <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
            <button 
              onClick={() => setSelectedFilter('all')}
              className={`px-4 py-1.5 rounded-full text-sm font-medium whitespace-nowrap ${
                selectedFilter === 'all' 
                  ? 'bg-[#0d1b11] text-white' 
                  : 'bg-white dark:bg-[#1a2e21] border border-gray-200 dark:border-gray-700 hover:border-[#13ec49] text-gray-700 dark:text-gray-200'
              } transition-colors`}
            >
              All Courts
            </button>
            <button 
              onClick={() => setSelectedFilter('vip')}
              className={`px-4 py-1.5 rounded-full text-sm font-medium whitespace-nowrap ${
                selectedFilter === 'vip' 
                  ? 'bg-[#0d1b11] text-white' 
                  : 'bg-white dark:bg-[#1a2e21] border border-gray-200 dark:border-gray-700 hover:border-[#13ec49] text-gray-700 dark:text-gray-200'
              } transition-colors`}
            >
              VIP
            </button>
            <button 
              onClick={() => setSelectedFilter('standard')}
              className={`px-4 py-1.5 rounded-full text-sm font-medium whitespace-nowrap ${
                selectedFilter === 'standard' 
                  ? 'bg-[#0d1b11] text-white' 
                  : 'bg-white dark:bg-[#1a2e21] border border-gray-200 dark:border-gray-700 hover:border-[#13ec49] text-gray-700 dark:text-gray-200'
              } transition-colors`}
            >
              Standard
            </button>
          </div>
        </div>

        {/* Courts Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {loading ? (
            // Loading skeleton
            Array.from({ length: 6 }).map((_, index) => (
              <div key={index} className="bg-white dark:bg-[#1a2e21] rounded-xl overflow-hidden shadow-sm border border-gray-100 dark:border-gray-800 animate-pulse">
                <div className="h-48 bg-gray-200 dark:bg-gray-700"></div>
                <div className="p-5 space-y-3">
                  <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
                  <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-full"></div>
                  <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
                </div>
              </div>
            ))
          ) : error ? (
            // Error state
            <div className="col-span-full flex flex-col items-center justify-center py-12">
              <span className="material-symbols-outlined text-6xl text-red-500 mb-4">error</span>
              <p className="text-lg text-gray-600 dark:text-gray-400 mb-4">{error}</p>
              <button 
                onClick={fetchCourts}
                className="px-6 py-2 bg-[#13ec49] hover:bg-[#0fb839] text-[#0d1b11] font-bold rounded-lg transition-colors"
              >
                Thử lại
              </button>
            </div>
          ) : filteredCourts.length === 0 ? (
            // Empty state
            <div className="col-span-full flex flex-col items-center justify-center py-12">
              <span className="material-symbols-outlined text-6xl text-gray-400 mb-4">search_off</span>
              <p className="text-lg text-gray-600 dark:text-gray-400">Không tìm thấy sân nào</p>
            </div>
          ) : (
            // Courts list
            filteredCourts.map(court => (
              <CourtCard key={court.id} court={court} />
            ))
          )}
        </div>

        {/* Pagination */}
        {!loading && !error && pagination.totalPages > 1 && (
          <div className="mt-8 flex justify-center items-center gap-2">
            <button
              onClick={() => setPagination(prev => ({ ...prev, page: Math.max(0, prev.page - 1) }))}
              disabled={pagination.page === 0}
              className="px-4 py-2 rounded-lg bg-white dark:bg-[#1a2e21] border border-gray-200 dark:border-gray-700 text-[#0d1b11] dark:text-white font-semibold hover:bg-gray-50 dark:hover:bg-[#233d2c] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <span className="material-symbols-outlined">chevron_left</span>
            </button>
            
            <span className="text-sm text-gray-600 dark:text-gray-400">
              Trang {pagination.page + 1} / {pagination.totalPages}
            </span>
            
            <button
              onClick={() => setPagination(prev => ({ ...prev, page: Math.min(prev.totalPages - 1, prev.page + 1) }))}
              disabled={pagination.page >= pagination.totalPages - 1}
              className="px-4 py-2 rounded-lg bg-white dark:bg-[#1a2e21] border border-gray-200 dark:border-gray-700 text-[#0d1b11] dark:text-white font-semibold hover:bg-gray-50 dark:hover:bg-[#233d2c] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <span className="material-symbols-outlined">chevron_right</span>
            </button>
          </div>
        )}

        <div className="mt-12 flex justify-center">
          <button className="flex items-center gap-2 px-6 py-3 rounded-lg bg-white dark:bg-[#1a2e21] border border-gray-200 dark:border-gray-700 text-[#0d1b11] dark:text-white font-semibold hover:bg-gray-50 dark:hover:bg-[#233d2c] transition-colors">
            <span>View All Courts</span>
            <span className="material-symbols-outlined">arrow_forward</span>
          </button>
        </div>
      </main>
    </div>
  );
};

export default GuestHome;
