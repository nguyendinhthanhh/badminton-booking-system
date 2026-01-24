import { useParams, Link } from 'react-router-dom';
import { useState, useEffect } from 'react';
import courtService from '../../services/courtService';

const CourtDetails = () => {
  const { id } = useParams();
  const [court, setCourt] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchCourtDetails();
  }, [id]);

  const fetchCourtDetails = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await courtService.getCourtById(id);
      
      // Transform API data
      const transformedCourt = {
        id: data.id,
        name: data.name,
        location: data.location || 'West Wing, Ground Floor, Smash Sports Center',
        type: data.type === 'SINGLE' ? 'Singles' : 'Doubles',
        mainImage: data.imageUrl || 'https://images.unsplash.com/photo-1626224583764-f87db24ac4ea?w=1200',
        gallery: [
          data.imageUrl || 'https://images.unsplash.com/photo-1626224583764-f87db24ac4ea?w=400',
          'https://images.unsplash.com/photo-1553778263-73a83bab9b0c?w=400',
          'https://images.unsplash.com/photo-1626224583764-f87db24ac4ea?w=400'
        ],
        amenities: [
          { icon: 'warehouse', label: 'Indoor' },
          { icon: 'ac_unit', label: 'Air Conditioned' },
          { icon: 'layers', label: 'BWF Certified Mat' },
          { icon: 'light_mode', label: 'Pro Lighting' },
          { icon: 'shower', label: 'Showers' }
        ],
        description: data.description || 'Experience professional-grade play on this court. Located in the quiet West Wing, this court features newly installed synthetic mats that meet BWF standards, ensuring excellent grip and shock absorption to protect your knees.',
        capacity: data.capacity,
        status: data.status,
        pricing: [
          { slot: 'Weekdays (9AM - 5PM)', price: 10.00 },
          { slot: 'Weekdays (5PM - 11PM)', price: 15.00 },
          { slot: 'Weekends & Holidays', price: 18.00 }
        ]
      };

      setCourt(transformedCourt);
    } catch (err) {
      setError('Không thể tải thông tin sân. Vui lòng thử lại sau.');
      console.error('Error fetching court details:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#f6f8f6] dark:bg-[#102215]">
        <main className="flex-1 w-full max-w-[1280px] mx-auto px-4 md:px-10 py-6">
          {/* Breadcrumbs Skeleton */}
          <div className="flex gap-2 py-4 mb-2">
            <div className="h-4 w-16 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
            <div className="h-4 w-4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
            <div className="h-4 w-20 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
            <div className="h-4 w-4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
            <div className="h-4 w-32 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* LEFT COLUMN Skeleton */}
            <div className="lg:col-span-7 xl:col-span-8 flex flex-col gap-8">
              {/* Title Skeleton */}
              <div className="flex flex-col gap-3">
                <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded w-3/4 animate-pulse"></div>
                <div className="h-5 bg-gray-200 dark:bg-gray-700 rounded w-1/2 animate-pulse"></div>
              </div>

              {/* Hero Image Skeleton */}
              <div className="aspect-video bg-gray-200 dark:bg-gray-700 rounded-xl animate-pulse"></div>

              {/* Thumbnails Skeleton */}
              <div className="flex gap-3">
                <div className="min-w-[120px] w-[120px] h-20 bg-gray-200 dark:bg-gray-700 rounded-lg animate-pulse"></div>
                <div className="min-w-[120px] w-[120px] h-20 bg-gray-200 dark:bg-gray-700 rounded-lg animate-pulse"></div>
                <div className="min-w-[120px] w-[120px] h-20 bg-gray-200 dark:bg-gray-700 rounded-lg animate-pulse"></div>
              </div>

              {/* Amenities Skeleton */}
              <div>
                <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-32 mb-3 animate-pulse"></div>
                <div className="flex gap-3 flex-wrap">
                  {[1, 2, 3, 4, 5].map(i => (
                    <div key={i} className="h-9 w-32 bg-gray-200 dark:bg-gray-700 rounded-lg animate-pulse"></div>
                  ))}
                </div>
              </div>

              {/* Description Skeleton */}
              <div>
                <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-40 mb-2 animate-pulse"></div>
                <div className="space-y-2">
                  <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-full animate-pulse"></div>
                  <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-full animate-pulse"></div>
                  <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4 animate-pulse"></div>
                </div>
              </div>
            </div>

            {/* RIGHT COLUMN Skeleton */}
            <div className="lg:col-span-5 xl:col-span-4 flex flex-col gap-6">
              {/* Pricing Card Skeleton */}
              <div className="bg-white dark:bg-[#1a2e20] rounded-xl border border-gray-200 dark:border-white/10 p-5 shadow-sm">
                <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-40 mb-4 animate-pulse"></div>
                <div className="space-y-3">
                  <div className="h-32 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
                </div>
              </div>

              {/* Calendar Skeleton */}
              <div className="bg-white dark:bg-[#1a2e20] rounded-xl border border-gray-200 dark:border-white/10 p-5 shadow-sm">
                <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-32 mb-4 animate-pulse"></div>
                <div className="h-48 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
              </div>

              {/* CTA Skeleton */}
              <div className="bg-white dark:bg-[#1a2e20] rounded-xl border-2 border-gray-200 dark:border-gray-700 p-6 shadow-sm">
                <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-40 mb-2 animate-pulse"></div>
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-full mb-4 animate-pulse"></div>
                <div className="h-12 bg-gray-200 dark:bg-gray-700 rounded-lg animate-pulse"></div>
              </div>
            </div>
          </div>
        </main>
      </div>
    );
  }

  if (error || !court) {
    return (
      <div className="min-h-screen bg-[#f6f8f6] dark:bg-[#102215] flex items-center justify-center">
        <div className="text-center">
          <span className="material-symbols-outlined text-6xl text-red-500 mb-4">error</span>
          <p className="text-lg text-gray-600 dark:text-gray-400 mb-4">{error || 'Không tìm thấy sân'}</p>
          <Link 
            to="/"
            className="px-6 py-2 bg-[#13ec49] hover:bg-[#0fb839] text-[#0d1b11] font-bold rounded-lg transition-colors inline-block"
          >
            Quay lại trang chủ
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f6f8f6] dark:bg-[#102215]">
      <main className="flex-1 w-full max-w-[1280px] mx-auto px-4 md:px-10 py-6">
        {/* Breadcrumbs */}
        <div className="flex flex-wrap gap-2 py-4 mb-2">
          <Link to="/" className="text-[#4c9a5f] hover:text-[#13ec49] text-sm md:text-base font-medium">
            Home
          </Link>
          <span className="text-[#4c9a5f] text-sm md:text-base font-medium">/</span>
          <Link to="/" className="text-[#4c9a5f] hover:text-[#13ec49] text-sm md:text-base font-medium">
            Courts
          </Link>
          <span className="text-[#4c9a5f] text-sm md:text-base font-medium">/</span>
          <span className="text-[#0d1b11] dark:text-white text-sm md:text-base font-medium">
            {court.name}
          </span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* LEFT COLUMN: Visuals & Details */}
          <div className="lg:col-span-7 xl:col-span-8 flex flex-col gap-8">
            {/* Page Heading & Location */}
            <div className="flex flex-col gap-3">
              <h1 className="text-3xl md:text-4xl font-black leading-tight tracking-[-0.033em] text-[#0d1b11] dark:text-white">
                {court.name}
              </h1>
              <div className="flex items-center gap-2 text-[#4c9a5f]">
                <span className="material-symbols-outlined text-xl">location_on</span>
                <p className="text-base font-normal">{court.location}</p>
              </div>
            </div>

            {/* Hero Image */}
            <div className="flex overflow-hidden rounded-xl shadow-sm aspect-video relative group">
              <div 
                className="w-full h-full bg-center bg-no-repeat bg-cover"
                style={{ backgroundImage: `url(${court.mainImage})` }}
              ></div>
              <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent"></div>
              <div className="absolute bottom-4 right-4 bg-black/60 backdrop-blur-md text-white px-3 py-1 rounded-full text-xs font-medium flex items-center gap-1">
                <span className="material-symbols-outlined text-sm">photo_camera</span> View Gallery
              </div>
            </div>

            {/* Thumbnails Strip */}
            <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
              {court.gallery.map((img, index) => (
                <div 
                  key={index}
                  className={`min-w-[120px] w-[120px] h-20 rounded-lg bg-cover bg-center cursor-pointer ${
                    index === 0 
                      ? 'border-2 border-[#13ec49]' 
                      : 'border border-transparent opacity-70 hover:opacity-100'
                  } transition-opacity`}
                  style={{ backgroundImage: `url(${img})` }}
                ></div>
              ))}
            </div>

            {/* Facilities Chips */}
            <div>
              <h3 className="text-lg font-bold mb-3">Amenities</h3>
              <div className="flex gap-3 flex-wrap">
                {court.amenities.map((amenity, index) => (
                  <div 
                    key={index}
                    className="flex h-9 shrink-0 items-center justify-center gap-x-2 rounded-lg bg-white dark:bg-[#1a2e20] border border-gray-200 dark:border-white/10 px-4 shadow-sm"
                  >
                    <span className="material-symbols-outlined text-[#13ec49] text-[20px]">{amenity.icon}</span>
                    <p className="text-sm font-medium">{amenity.label}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Description */}
            <div>
              <h3 className="text-lg font-bold mb-2">About this Court</h3>
              <p className="text-base text-gray-600 dark:text-gray-300 leading-relaxed">
                {court.description}
              </p>
            </div>
          </div>

          {/* RIGHT COLUMN: Pricing, Calendar & CTA */}
          <div className="lg:col-span-5 xl:col-span-4 flex flex-col gap-6">
            {/* Pricing Card */}
            <div className="bg-white dark:bg-[#1a2e20] rounded-xl border border-gray-200 dark:border-white/10 p-5 shadow-sm">
              <div className="flex items-center gap-2 mb-4 text-[#0d1b11] dark:text-white">
                <span className="material-symbols-outlined text-[#13ec49]">payments</span>
                <h3 className="text-lg font-bold">Pricing Rates</h3>
              </div>
              <div className="overflow-hidden rounded-lg border border-gray-200 dark:border-white/10">
                <table className="w-full text-sm text-left">
                  <thead className="bg-gray-50 dark:bg-white/5 text-gray-500 dark:text-gray-400 font-medium">
                    <tr>
                      <th className="px-4 py-3">Time Slot</th>
                      <th className="px-4 py-3 text-right">Price / Hour</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 dark:divide-white/10 bg-white dark:bg-transparent">
                    {court.pricing.map((price, index) => (
                      <tr key={index}>
                        <td className="px-4 py-3 font-medium">{price.slot}</td>
                        <td className="px-4 py-3 text-right font-bold text-[#0d1b11] dark:text-white">
                          ${price.price.toFixed(2)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <p className="text-xs text-gray-500 mt-3 flex items-center gap-1">
                <span className="material-symbols-outlined text-[14px]">info</span>
                Free cancellation up to 4 hours before booking.
              </p>
            </div>

            {/* Availability Calendar */}
            <div className="bg-white dark:bg-[#1a2e20] rounded-xl border border-gray-200 dark:border-white/10 p-5 shadow-sm relative overflow-hidden">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-[#13ec49]">calendar_month</span>
                  <h3 className="text-lg font-bold">Availability</h3>
                </div>
                <span className="bg-gray-100 dark:bg-white/10 text-xs font-semibold px-2 py-1 rounded">
                  Read Only
                </span>
              </div>

              {/* Calendar Grid Mockup */}
              <div className="flex flex-col gap-2 relative">
                {/* Dates Header */}
                <div className="grid grid-cols-4 gap-2 text-center text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">
                  <div>Mon 12</div>
                  <div>Tue 13</div>
                  <div>Wed 14</div>
                  <div>Thu 15</div>
                </div>

                {/* Time Slots */}
                <div className="grid grid-cols-4 gap-2">
                  {/* 9:00 AM */}
                  <div className="h-8 rounded bg-gray-200 dark:bg-white/5 flex items-center justify-center text-xs text-gray-400 cursor-not-allowed">Booked</div>
                  <div className="h-8 rounded bg-[#13ec49]/20 border border-[#13ec49]/30 flex items-center justify-center text-xs text-[#0fb839] font-medium">9:00 AM</div>
                  <div className="h-8 rounded bg-[#13ec49]/20 border border-[#13ec49]/30 flex items-center justify-center text-xs text-[#0fb839] font-medium">9:00 AM</div>
                  <div className="h-8 rounded bg-gray-200 dark:bg-white/5 flex items-center justify-center text-xs text-gray-400 cursor-not-allowed">Booked</div>
                  
                  {/* 10:00 AM */}
                  <div className="h-8 rounded bg-[#13ec49]/20 border border-[#13ec49]/30 flex items-center justify-center text-xs text-[#0fb839] font-medium">10:00 AM</div>
                  <div className="h-8 rounded bg-gray-200 dark:bg-white/5 flex items-center justify-center text-xs text-gray-400 cursor-not-allowed">Booked</div>
                  <div className="h-8 rounded bg-gray-200 dark:bg-white/5 flex items-center justify-center text-xs text-gray-400 cursor-not-allowed">Booked</div>
                  <div className="h-8 rounded bg-[#13ec49]/20 border border-[#13ec49]/30 flex items-center justify-center text-xs text-[#0fb839] font-medium">10:00 AM</div>
                  
                  {/* 11:00 AM */}
                  <div className="h-8 rounded bg-[#13ec49]/20 border border-[#13ec49]/30 flex items-center justify-center text-xs text-[#0fb839] font-medium">11:00 AM</div>
                  <div className="h-8 rounded bg-[#13ec49]/20 border border-[#13ec49]/30 flex items-center justify-center text-xs text-[#0fb839] font-medium">11:00 AM</div>
                  <div className="h-8 rounded bg-[#13ec49]/20 border border-[#13ec49]/30 flex items-center justify-center text-xs text-[#0fb839] font-medium">11:00 AM</div>
                  <div className="h-8 rounded bg-gray-200 dark:bg-white/5 flex items-center justify-center text-xs text-gray-400 cursor-not-allowed">Booked</div>
                </div>

                {/* Blur Overlay for Guest */}
                <div className="absolute inset-0 bg-white/40 dark:bg-black/40 backdrop-blur-[1px] flex items-center justify-center rounded-lg z-10">
                  <div className="bg-black/80 text-white text-xs px-3 py-1.5 rounded-full shadow-lg flex items-center gap-2">
                    <span className="material-symbols-outlined text-[14px]">lock</span>
                    Login to view full schedule
                  </div>
                </div>
              </div>

              <div className="mt-4 flex justify-between items-center text-xs">
                <div className="flex items-center gap-2">
                  <div className="size-3 rounded-full bg-[#13ec49]/30 border border-[#13ec49]/50"></div>
                  <span className="text-gray-600 dark:text-gray-300">Available</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="size-3 rounded-full bg-gray-200 dark:bg-white/10"></div>
                  <span className="text-gray-500">Booked</span>
                </div>
              </div>
            </div>

            {/* Main CTA Section */}
            <div className="bg-white dark:bg-[#1a2e20] border-2 border-[#13ec49] rounded-xl p-6 shadow-[0_4px_20px_-5px_rgba(19,236,73,0.3)] sticky bottom-4 z-40">
              <h2 className="text-xl font-black mb-2 text-[#0d1b11] dark:text-white">Ready to Play?</h2>
              <p className="text-sm text-gray-600 dark:text-gray-300 mb-4">
                Create an account to book this court instantly, manage your schedule, and get exclusive member discounts.
              </p>
              <button className="w-full flex items-center justify-center gap-2 bg-[#13ec49] hover:bg-[#0fb839] text-[#0d1b11] font-bold text-base h-12 rounded-lg transition-all transform active:scale-[0.98]">
                <span>Register Now to Book</span>
                <span className="material-symbols-outlined text-[20px]">arrow_forward</span>
              </button>
              <div className="mt-3 text-center">
                <span className="text-xs text-gray-500">
                  Already a member? <a href="#" className="text-[#13ec49] hover:underline font-bold">Log in</a>
                </span>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default CourtDetails;
