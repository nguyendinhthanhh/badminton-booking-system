import { Link } from 'react-router-dom';

const Footer = () => {
  return (
    <footer className="bg-white pt-20 pb-10 border-t border-gray-100">
      <div className="max-w-[1440px] mx-auto px-4 md:px-8">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-12 mb-16">
          {/* Brand & Description */}
          <div className="md:col-span-5 space-y-6">
            <Link to="/" className="flex items-center gap-2">
              <span className="text-2xl font-black text-blue-600 tracking-tight">BadmintonBooking</span>
            </Link>
            <p className="text-sm font-bold text-gray-500 leading-relaxed max-w-sm">
              Nền tảng đặt sân cầu lông hàng đầu tại Việt Nam. Mang lại trải nghiệm chơi thể thao chuyên nghiệp và tiện lợi nhất cho mọi người.
            </p>
          </div>

          {/* Quick Links */}
          <div className="md:col-span-3">
            <h3 className="text-base font-black text-gray-900 mb-6 uppercase tracking-wider">Liên kết</h3>
            <ul className="space-y-4">
              <li><Link to="/about" className="text-sm font-bold text-gray-500 hover:text-blue-600 transition-colors">Về chúng tôi</Link></li>
              <li><Link to="/support" className="text-sm font-bold text-gray-500 hover:text-blue-600 transition-colors">Trung tâm hỗ trợ</Link></li>
              <li><Link to="/privacy" className="text-sm font-bold text-gray-500 hover:text-blue-600 transition-colors">Chính sách bảo mật</Link></li>
            </ul>
          </div>

          {/* Social Track */}
          <div className="md:col-span-4">
            <h3 className="text-base font-black text-gray-900 mb-6 uppercase tracking-wider">Theo dõi</h3>
            <div className="flex gap-4">
              <button className="size-10 rounded-full bg-gray-50 flex items-center justify-center text-gray-400 hover:bg-blue-50 hover:text-blue-600 transition-all">
                <span className="material-symbols-outlined text-[20px]">share</span>
              </button>
              <button className="size-10 rounded-full bg-gray-50 flex items-center justify-center text-gray-400 hover:bg-blue-50 hover:text-blue-600 transition-all">
                <span className="material-symbols-outlined text-[20px]">thumb_up</span>
              </button>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t border-gray-50 text-center">
          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
            © 2024 BadmintonBooking. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
