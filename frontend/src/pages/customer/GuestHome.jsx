import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import courtService from '../../services/courtService';
import GuestHeader from '../../components/common/GuestHeader';

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
      <GuestHeader />
      
      {/* Hero Section */}
      <section className="relative">
        <div className="absolute inset-0 bg-black/40 z-10"></div>
        <div 
          className="h-[500px] sm:h-[600px] lg:h-[700px] w-full bg-cover bg-center bg-no-repeat" 
          style={{backgroundImage: `url(${heroImage})`}}
        />
        <div className="absolute inset-0 z-20 flex flex-col items-center justify-center px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="max-w-4xl text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-extrabold tracking-tight text-white drop-shadow-md">
            ĐẶT SÂN CẦU LÔNG <br className="hidden sm:block"/> NHANH CHÓNG - DỄ DÀNG
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
                    onChange={(e) => setSearchForm({...searchForm, location: e.target.value})}
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
                    onChange={(e) => setSearchForm({...searchForm, date: e.target.value})}
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
                    onChange={(e) => setSearchForm({...searchForm, time: e.target.value})}
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
                  type="submit"
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
            <a className="group flex items-center gap-1 text-sm font-semibold text-primary hover:text-blue-700" href="#">
              Xem tất cả
              <span className="material-symbols-outlined text-[18px] transition-transform group-hover:translate-x-1">arrow_forward</span>
            </a>
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
                      style={{backgroundImage: `url(${court.imageUrl || defaultCourtImage})`}}
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


      {/* Footer */}
      <footer className="relative bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 dark:from-[#0a0f14] dark:via-[#111621] dark:to-[#0a0f14]">
        {/* Decorative Elements */}
        <div className="absolute inset-0 bg-grid-slate-700/25 [mask-image:linear-gradient(0deg,transparent,black)] pointer-events-none"></div>
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-primary/50 to-transparent"></div>
        
        <div className="relative mx-auto max-w-[1280px] px-4 py-16 sm:px-6 lg:px-8">
          {/* Main Footer Content */}
          <div className="grid grid-cols-1 gap-12 lg:grid-cols-12 lg:gap-8">
            {/* Brand Section - Takes more space */}
            <div className="lg:col-span-5">
              <div className="flex items-center gap-3 mb-6">
                <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-gradient-to-br from-primary to-blue-600 shadow-lg shadow-primary/20">
                  <span className="material-symbols-outlined text-3xl text-white">sports_tennis</span>
                </div>
                <span className="text-2xl font-bold text-white">BadmintonHub</span>
              </div>
              <p className="text-base leading-relaxed text-slate-300 mb-6 max-w-md">
                Nền tảng đặt sân cầu lông hàng đầu Việt Nam. Kết nối đam mê, chia sẻ niềm vui thể thao cùng cộng đồng yêu cầu lông.
              </p>
              
              {/* Social Links */}
              <div className="flex items-center gap-3">
                <span className="text-sm font-medium text-slate-400">Kết nối với chúng tôi:</span>
                <div className="flex gap-2">
                  <a 
                    href="#" 
                    className="flex items-center justify-center w-10 h-10 rounded-lg bg-slate-800 hover:bg-primary text-slate-400 hover:text-white transition-all duration-300 hover:scale-110 hover:shadow-lg hover:shadow-primary/20"
                  >
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                    </svg>
                  </a>
                  <a 
                    href="#" 
                    className="flex items-center justify-center w-10 h-10 rounded-lg bg-slate-800 hover:bg-primary text-slate-400 hover:text-white transition-all duration-300 hover:scale-110 hover:shadow-lg hover:shadow-primary/20"
                  >
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                    </svg>
                  </a>
                  <a 
                    href="#" 
                    className="flex items-center justify-center w-10 h-10 rounded-lg bg-slate-800 hover:bg-primary text-slate-400 hover:text-white transition-all duration-300 hover:scale-110 hover:shadow-lg hover:shadow-primary/20"
                  >
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 012.8 9.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84"/>
                    </svg>
                  </a>
                  <a 
                    href="#" 
                    className="flex items-center justify-center w-10 h-10 rounded-lg bg-slate-800 hover:bg-primary text-slate-400 hover:text-white transition-all duration-300 hover:scale-110 hover:shadow-lg hover:shadow-primary/20"
                  >
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-5.2 1.74 2.89 2.89 0 012.31-4.64 2.93 2.93 0 01.88.13V9.4a6.84 6.84 0 00-1-.05A6.33 6.33 0 005 20.1a6.34 6.34 0 0010.86-4.43v-7a8.16 8.16 0 004.77 1.52v-3.4a4.85 4.85 0 01-1-.1z"/>
                    </svg>
                  </a>
                </div>
              </div>
            </div>

            {/* Links Sections */}
            <div className="lg:col-span-7 grid grid-cols-2 gap-8 sm:grid-cols-3">
              {/* Khám phá */}
              <div>
                <h3 className="text-sm font-bold uppercase tracking-wider text-white mb-4">Khám phá</h3>
                <ul className="space-y-3">
                  <li>
                    <a className="text-sm text-slate-400 hover:text-primary transition-colors duration-200 flex items-center gap-2 group" href="#">
                      <span className="w-0 group-hover:w-1.5 h-1.5 bg-primary rounded-full transition-all duration-200"></span>
                      Về chúng tôi
                    </a>
                  </li>
                  <li>
                    <a className="text-sm text-slate-400 hover:text-primary transition-colors duration-200 flex items-center gap-2 group" href="#">
                      <span className="w-0 group-hover:w-1.5 h-1.5 bg-primary rounded-full transition-all duration-200"></span>
                      Danh sách sân
                    </a>
                  </li>
                  <li>
                    <a className="text-sm text-slate-400 hover:text-primary transition-colors duration-200 flex items-center gap-2 group" href="#">
                      <span className="w-0 group-hover:w-1.5 h-1.5 bg-primary rounded-full transition-all duration-200"></span>
                      Tin tức
                    </a>
                  </li>
                  <li>
                    <a className="text-sm text-slate-400 hover:text-primary transition-colors duration-200 flex items-center gap-2 group" href="#">
                      <span className="w-0 group-hover:w-1.5 h-1.5 bg-primary rounded-full transition-all duration-200"></span>
                      Sự kiện
                    </a>
                  </li>
                </ul>
              </div>

              {/* Hỗ trợ */}
              <div>
                <h3 className="text-sm font-bold uppercase tracking-wider text-white mb-4">Hỗ trợ</h3>
                <ul className="space-y-3">
                  <li>
                    <a className="text-sm text-slate-400 hover:text-primary transition-colors duration-200 flex items-center gap-2 group" href="#">
                      <span className="w-0 group-hover:w-1.5 h-1.5 bg-primary rounded-full transition-all duration-200"></span>
                      Trung tâm trợ giúp
                    </a>
                  </li>
                  <li>
                    <a className="text-sm text-slate-400 hover:text-primary transition-colors duration-200 flex items-center gap-2 group" href="#">
                      <span className="w-0 group-hover:w-1.5 h-1.5 bg-primary rounded-full transition-all duration-200"></span>
                      Chính sách bảo mật
                    </a>
                  </li>
                  <li>
                    <a className="text-sm text-slate-400 hover:text-primary transition-colors duration-200 flex items-center gap-2 group" href="#">
                      <span className="w-0 group-hover:w-1.5 h-1.5 bg-primary rounded-full transition-all duration-200"></span>
                      Điều khoản sử dụng
                    </a>
                  </li>
                  <li>
                    <a className="text-sm text-slate-400 hover:text-primary transition-colors duration-200 flex items-center gap-2 group" href="#">
                      <span className="w-0 group-hover:w-1.5 h-1.5 bg-primary rounded-full transition-all duration-200"></span>
                      FAQs
                    </a>
                  </li>
                </ul>
              </div>

              {/* Liên hệ */}
              <div>
                <h3 className="text-sm font-bold uppercase tracking-wider text-white mb-4">Liên hệ</h3>
                <ul className="space-y-3">
                  <li className="flex items-start gap-3 text-sm text-slate-400 group">
                    <span className="material-symbols-outlined text-[18px] text-primary mt-0.5">mail</span>
                    <a href="mailto:contact@badmintonhub.vn" className="hover:text-primary transition-colors">
                      contact@badmintonhub.vn
                    </a>
                  </li>
                  <li className="flex items-start gap-3 text-sm text-slate-400 group">
                    <span className="material-symbols-outlined text-[18px] text-primary mt-0.5">phone</span>
                    <a href="tel:19001234" className="hover:text-primary transition-colors">
                      1900 1234
                    </a>
                  </li>
                  <li className="flex items-start gap-3 text-sm text-slate-400">
                    <span className="material-symbols-outlined text-[18px] text-primary mt-0.5">location_on</span>
                    <span>123 Đường ABC, Quận 1, TP.HCM</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>

          {/* Bottom Bar */}
          <div className="mt-12 pt-8 border-t border-slate-700/50">
            <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
              <p className="text-sm text-slate-400">
                © 2024 <span className="text-white font-semibold">BadmintonHub</span>. All rights reserved.
              </p>
              <div className="flex items-center gap-6 text-xs text-slate-500">
                <a href="#" className="hover:text-primary transition-colors">Privacy Policy</a>
                <span>•</span>
                <a href="#" className="hover:text-primary transition-colors">Terms of Service</a>
                <span>•</span>
                <a href="#" className="hover:text-primary transition-colors">Cookie Policy</a>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default GuestHome;
