import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import courtService from '../../services/courtService';


const GuestHome = () => {
  const navigate = useNavigate();
  const [courts, setCourts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchForm, setSearchForm] = useState({
    location: '',
    date: '',
    time: '07:00'
  });

  const defaultCourtImage = 'https://images.unsplash.com/photo-1626224583764-f87db24ac4ea?w=800';
  const heroImage = 'https://images.unsplash.com/photo-1626224583764-f87db24ac4ea?w=1600';

  useEffect(() => {
    fetchCourts();
  }, []);

  const fetchCourts = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await courtService.getAllCourts(0, 4);
      setCourts(response.content || []);
    } catch (err) {
      setError('Không thể tải danh sách sân. Vui lòng thử lại sau.');
      console.error('Error fetching courts:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    console.log('Search:', searchForm);
  };

  const handleCourtClick = (courtId) => {
    navigate(`/courts/${courtId}`);
  };

  return (
    <div className="bg-background-light dark:bg-background-dark text-[#111318] dark:text-white font-display overflow-x-hidden">


      {/* Hero Section */}
      <section className="relative">
        <div className="absolute inset-0 bg-black/40 z-10"></div>
        <div
          className="h-[500px] sm:h-[600px] lg:h-[700px] w-full bg-cover bg-center bg-no-repeat"
          style={{ backgroundImage: `url(${heroImage})` }}
        />
        <div className="absolute inset-0 z-20 flex flex-col items-center justify-center px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="max-w-4xl text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-extrabold tracking-tight text-white drop-shadow-md">
            ĐẶT SÂN CẦU LÔNG <br className="hidden sm:block" /> NHANH CHÓNG - DỄ DÀNG
          </h1>
          <p className="mt-4 sm:mt-6 max-w-2xl text-base sm:text-lg lg:text-xl text-slate-100 drop-shadow px-4">
            Kết nối đam mê cầu lông tại hàng trăm sân bãi chất lượng trên toàn quốc. Đặt lịch ngay chỉ với vài cú click.
          </p>

          {/* Search Widget */}
          <div className="mt-8 sm:mt-10 w-full max-w-4xl rounded-xl bg-white p-4 sm:p-6 shadow-xl dark:bg-[#1a202c]">
            <form onSubmit={handleSearchSubmit} className="flex flex-col gap-4 md:flex-row md:items-end">
              {/* Location */}
              <div className="flex-1">
                <label className="block text-left text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Khu vực</label>
                <div className="relative">
                  <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">
                    <span className="material-symbols-outlined text-[20px]">location_on</span>
                  </div>
                  <input
                    className="block w-full rounded-lg border border-slate-300 py-3 pl-10 pr-3 text-sm focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none dark:bg-slate-800 dark:border-slate-600 dark:text-white"
                    placeholder="Quận, Huyện, Tên sân..."
                    type="text"
                    value={searchForm.location}
                    onChange={(e) => setSearchForm({ ...searchForm, location: e.target.value })}
                  />
                </div>
              </div>

              {/* Date */}
              <div className="w-full md:w-48">
                <label className="block text-left text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Ngày</label>
                <div className="relative">
                  <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">
                    <span className="material-symbols-outlined text-[20px]">calendar_today</span>
                  </div>
                  <input
                    className="block w-full rounded-lg border border-slate-300 py-3 pl-10 pr-3 text-sm focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none dark:bg-slate-800 dark:border-slate-600 dark:text-white"
                    type="date"
                    value={searchForm.date}
                    onChange={(e) => setSearchForm({ ...searchForm, date: e.target.value })}
                  />
                </div>
              </div>

              {/* Time */}
              <div className="w-full md:w-40">
                <label className="block text-left text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Giờ</label>
                <div className="relative">
                  <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">
                    <span className="material-symbols-outlined text-[20px]">schedule</span>
                  </div>
                  <select
                    className="block w-full appearance-none rounded-lg border border-slate-300 py-3 pl-10 pr-8 text-sm focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none dark:bg-slate-800 dark:border-slate-600 dark:text-white"
                    value={searchForm.time}
                    onChange={(e) => setSearchForm({ ...searchForm, time: e.target.value })}
                  >
                    <option>07:00</option>
                    <option>08:00</option>
                    <option>09:00</option>
                    <option>17:00</option>
                    <option>18:00</option>
                    <option>19:00</option>
                  </select>
                </div>
              </div>

              {/* Submit Button */}
              <div className="w-full md:w-auto">
                <button
                  type="button"
                  onClick={() => navigate('/courts')}
                  className="flex w-full items-center justify-center gap-2 rounded-lg bg-primary px-6 py-3 text-sm font-bold text-white shadow-sm hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 transition-all active:scale-95"
                >
                  <span className="material-symbols-outlined text-[20px]">search</span>
                  Tìm sân
                </button>
              </div>
            </form>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-12 sm:py-16 lg:py-24 bg-white dark:bg-[#111621]">
        <div className="mx-auto max-w-[1280px] px-4 sm:px-6 lg:px-8">
          <div className="mb-10 sm:mb-12 text-center">
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight text-slate-900 dark:text-white">Tại sao chọn BadmintonHub?</h2>
            <p className="mt-3 sm:mt-4 text-base sm:text-lg text-slate-600 dark:text-slate-400">Nền tảng đặt sân hiện đại, tiện lợi hàng đầu Việt Nam.</p>
          </div>
          <div className="grid grid-cols-1 gap-6 sm:gap-8 md:grid-cols-3">
            <div className="flex flex-col items-center rounded-2xl border border-slate-200 bg-slate-50 p-6 sm:p-8 text-center transition-all hover:shadow-lg dark:border-slate-700 dark:bg-slate-800">
              <div className="mb-4 flex h-12 w-12 sm:h-14 sm:w-14 items-center justify-center rounded-full bg-primary/10 text-primary">
                <span className="material-symbols-outlined text-2xl sm:text-3xl">history_toggle_off</span>
              </div>
              <h3 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white">Đặt lịch 24/7</h3>
              <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">Hệ thống hoạt động liên tục, cho phép bạn đặt sân bất cứ lúc nào, bất cứ nơi đâu.</p>
            </div>

            <div className="flex flex-col items-center rounded-2xl border border-slate-200 bg-slate-50 p-6 sm:p-8 text-center transition-all hover:shadow-lg dark:border-slate-700 dark:bg-slate-800">
              <div className="mb-4 flex h-12 w-12 sm:h-14 sm:w-14 items-center justify-center rounded-full bg-secondary/10 text-secondary">
                <span className="material-symbols-outlined text-2xl sm:text-3xl">verified_user</span>
              </div>
              <h3 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white">Thanh toán an toàn</h3>
              <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">Tích hợp đa dạng cổng thanh toán, bảo mật tuyệt đối thông tin giao dịch của bạn.</p>
            </div>

            <div className="flex flex-col items-center rounded-2xl border border-slate-200 bg-slate-50 p-6 sm:p-8 text-center transition-all hover:shadow-lg dark:border-slate-700 dark:bg-slate-800">
              <div className="mb-4 flex h-12 w-12 sm:h-14 sm:w-14 items-center justify-center rounded-full bg-primary/10 text-primary">
                <span className="material-symbols-outlined text-2xl sm:text-3xl">price_check</span>
              </div>
              <h3 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white">Giá cả minh bạch</h3>
              <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">Không phí ẩn, giá niêm yết rõ ràng. So sánh giá dễ dàng giữa các sân.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Popular Courts Section */}
      <section className="py-12 sm:py-16 lg:py-24 bg-slate-50 dark:bg-[#0d1117]">
        <div className="mx-auto max-w-[1280px] px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center mb-8 sm:mb-10">
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 dark:text-white">Sân cầu lông phổ biến</h2>
            <button
              className="group flex items-center gap-1 text-sm font-semibold text-primary hover:text-blue-700 transition-colors"
              onClick={() => navigate('/courts')}
            >
              Xem tất cả
              <span className="material-symbols-outlined text-[18px] transition-transform group-hover:translate-x-1">arrow_forward</span>
            </button>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 gap-4 sm:gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {Array.from({ length: 4 }).map((_, index) => (
                <div key={index} className="flex flex-col overflow-hidden rounded-xl bg-white shadow-sm dark:bg-[#1a202c] animate-pulse">
                  <div className="aspect-[4/3] w-full bg-slate-200 dark:bg-slate-700"></div>
                  <div className="p-4 space-y-3">
                    <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-3/4"></div>
                    <div className="h-3 bg-slate-200 dark:bg-slate-700 rounded w-1/2"></div>
                    <div className="h-6 bg-slate-200 dark:bg-slate-700 rounded w-full"></div>
                  </div>
                </div>
              ))}
            </div>
          ) : error ? (
            <div className="text-center py-12">
              <p className="text-slate-600 dark:text-slate-400">{error}</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4 sm:gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {courts.map((court) => (
                <div
                  key={court.id}
                  className="group relative flex flex-col overflow-hidden rounded-xl bg-white shadow-sm transition-all hover:shadow-md dark:bg-[#1a202c] cursor-pointer"
                  onClick={() => handleCourtClick(court.id)}
                >
                  <div className="aspect-[4/3] w-full overflow-hidden bg-slate-200 relative">
                    <div
                      className="h-full w-full bg-cover bg-center transition-transform duration-300 group-hover:scale-105"
                      style={{ backgroundImage: `url(${court.imageUrl || defaultCourtImage})` }}
                    ></div>
                    <div className="absolute top-3 right-3 rounded bg-white/90 px-2 py-1 text-xs font-bold text-slate-900 shadow-sm backdrop-blur-sm dark:bg-black/70 dark:text-white">
                      <span className="flex items-center gap-1">
                        <span className="material-symbols-outlined text-yellow-500 text-[14px]">star</span> 4.8
                      </span>
                    </div>
                  </div>
                  <div className="flex flex-1 flex-col p-4">
                    <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white line-clamp-1">{court.name}</h3>
                    <p className="mt-1 flex items-center gap-1 text-xs text-slate-500 dark:text-slate-400 line-clamp-1">
                      <span className="material-symbols-outlined text-[14px]">location_on</span>
                      {court.location || 'TP.HCM'}
                    </p>
                    <div className="mt-4 flex items-center justify-between">
                      <div className="flex flex-col">
                        <span className="text-xs text-slate-500 dark:text-slate-400">Giá từ</span>
                        <span className="text-base font-bold text-primary">
                          80.000đ<span className="text-xs font-normal text-slate-500">/h</span>
                        </span>
                      </div>
                      <button
                        className="rounded-lg bg-slate-100 px-3 py-2 text-xs font-bold text-slate-900 hover:bg-slate-200 dark:bg-slate-700 dark:text-white dark:hover:bg-slate-600 transition-colors"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleCourtClick(court.id);
                        }}
                      >
                        Đặt ngay
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>


      {/* How it works */}
      <section className="py-12 sm:py-16 lg:py-24 bg-white dark:bg-[#111621]">
        <div className="mx-auto max-w-[1280px] px-4 sm:px-6 lg:px-8">
          <div className="mb-12 sm:mb-16 text-center">
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 dark:text-white">Quy trình đặt sân</h2>
            <p className="mt-3 sm:mt-4 text-sm sm:text-base text-slate-600 dark:text-slate-400">Dễ dàng chỉ với 4 bước đơn giản</p>
          </div>
          <div className="relative">
            <div className="absolute left-0 top-1/2 hidden h-0.5 w-full -translate-y-1/2 bg-slate-200 dark:bg-slate-700 md:block lg:w-[85%] lg:left-[7.5%]"></div>
            <div className="grid grid-cols-1 gap-8 sm:gap-12 md:grid-cols-4">
              <div className="relative flex flex-col items-center text-center">
                <div className="z-10 flex h-14 w-14 sm:h-16 sm:w-16 items-center justify-center rounded-full bg-primary text-white shadow-lg ring-4 sm:ring-8 ring-white dark:ring-[#111621]">
                  <span className="material-symbols-outlined text-2xl sm:text-3xl">search</span>
                </div>
                <h3 className="mt-4 sm:mt-6 text-base sm:text-lg font-bold text-slate-900 dark:text-white">1. Tìm sân</h3>
                <p className="mt-2 text-sm text-slate-600 dark:text-slate-400 px-2">Nhập khu vực và tìm sân phù hợp gần bạn nhất.</p>
              </div>

              <div className="relative flex flex-col items-center text-center">
                <div className="z-10 flex h-14 w-14 sm:h-16 sm:w-16 items-center justify-center rounded-full bg-white border-2 border-primary text-primary shadow-lg ring-4 sm:ring-8 ring-white dark:bg-[#1a202c] dark:ring-[#111621]">
                  <span className="material-symbols-outlined text-2xl sm:text-3xl">event_available</span>
                </div>
                <h3 className="mt-4 sm:mt-6 text-base sm:text-lg font-bold text-slate-900 dark:text-white">2. Chọn giờ</h3>
                <p className="mt-2 text-sm text-slate-600 dark:text-slate-400 px-2">Xem lịch trống và chọn khung giờ mong muốn.</p>
              </div>

              <div className="relative flex flex-col items-center text-center">
                <div className="z-10 flex h-14 w-14 sm:h-16 sm:w-16 items-center justify-center rounded-full bg-white border-2 border-primary text-primary shadow-lg ring-4 sm:ring-8 ring-white dark:bg-[#1a202c] dark:ring-[#111621]">
                  <span className="material-symbols-outlined text-2xl sm:text-3xl">payments</span>
                </div>
                <h3 className="mt-4 sm:mt-6 text-base sm:text-lg font-bold text-slate-900 dark:text-white">3. Thanh toán</h3>
                <p className="mt-2 text-sm text-slate-600 dark:text-slate-400 px-2">Thanh toán trực tuyến an toàn và nhanh chóng.</p>
              </div>

              <div className="relative flex flex-col items-center text-center">
                <div className="z-10 flex h-14 w-14 sm:h-16 sm:w-16 items-center justify-center rounded-full bg-secondary text-white shadow-lg ring-4 sm:ring-8 ring-white dark:ring-[#111621]">
                  <span className="material-symbols-outlined text-2xl sm:text-3xl">qr_code_2</span>
                </div>
                <h3 className="mt-4 sm:mt-6 text-base sm:text-lg font-bold text-slate-900 dark:text-white">4. Nhận mã</h3>
                <p className="mt-2 text-sm text-slate-600 dark:text-slate-400 px-2">Nhận mã đặt sân và đến sân trải nghiệm.</p>
              </div>
            </div>
          </div>
        </div>
      </section>


    </div>
  );
};

export default GuestHome;
