import { Link } from 'react-router-dom';

const Header = () => {
  return (
    <header className="sticky top-0 z-50 w-full bg-white/95 dark:bg-[#102215]/95 backdrop-blur-sm border-b border-gray-200 dark:border-[#1e3b26]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2">
            <div className="text-[#13ec49]">
              <span className="material-symbols-outlined text-3xl">sports_tennis</span>
            </div>
            <h1 className="text-xl font-bold tracking-tight text-[#0d1b11] dark:text-white">
              BadmintonPro
            </h1>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden md:flex gap-8">
            <Link to="/" className="text-sm font-medium text-[#0d1b11] dark:text-gray-200 hover:text-[#13ec49] transition-colors">
              Home
            </Link>
            <Link to="/courts" className="text-sm font-medium text-[#0d1b11] dark:text-gray-200 hover:text-[#13ec49] transition-colors">
              Courts
            </Link>
            <a href="#" className="text-sm font-medium text-[#0d1b11] dark:text-gray-200 hover:text-[#13ec49] transition-colors">
              Membership
            </a>
            <a href="#" className="text-sm font-medium text-[#0d1b11] dark:text-gray-200 hover:text-[#13ec49] transition-colors">
              Contact
            </a>
          </nav>

          {/* Actions */}
          <div className="flex items-center gap-3">
            <button className="hidden sm:flex items-center justify-center h-9 px-4 rounded-lg bg-transparent hover:bg-[#e7f3ea] dark:hover:bg-[#1e3b26] text-[#0d1b11] dark:text-white text-sm font-bold transition-colors">
              Login
            </button>
            <button className="flex items-center justify-center h-9 px-4 rounded-lg bg-[#13ec49] hover:bg-[#0fb839] text-[#0d1b11] text-sm font-bold shadow-sm transition-colors transform active:scale-95">
              Register
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
