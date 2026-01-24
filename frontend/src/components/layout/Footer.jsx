const Footer = () => {
  return (
    <footer className="bg-[#102215] text-white pt-16 pb-8 border-t border-white/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-12">
          {/* Brand */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-[#13ec49]">
              <span className="material-symbols-outlined text-3xl">sports_tennis</span>
              <span className="text-2xl font-bold text-white tracking-tight">BadmintonPro</span>
            </div>
            <p className="text-gray-400 text-sm leading-relaxed">
              The ultimate destination for badminton enthusiasts. Premium courts, professional coaching, and a vibrant community.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="font-bold text-lg mb-4">Quick Links</h3>
            <ul className="space-y-3">
              <li><a href="#" className="text-gray-400 hover:text-[#13ec49] transition-colors text-sm">About Us</a></li>
              <li><a href="#" className="text-gray-400 hover:text-[#13ec49] transition-colors text-sm">Our Courts</a></li>
              <li><a href="#" className="text-gray-400 hover:text-[#13ec49] transition-colors text-sm">Coaching</a></li>
              <li><a href="#" className="text-gray-400 hover:text-[#13ec49] transition-colors text-sm">Memberships</a></li>
              <li><a href="#" className="text-gray-400 hover:text-[#13ec49] transition-colors text-sm">Tournaments</a></li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="font-bold text-lg mb-4">Contact Us</h3>
            <ul className="space-y-4">
              <li className="flex items-start gap-3 text-sm text-gray-400">
                <span className="material-symbols-outlined text-[#13ec49] mt-0.5">location_on</span>
                <span>123 Sports Lane,<br/>Badminton City, BC 54321</span>
              </li>
              <li className="flex items-center gap-3 text-sm text-gray-400">
                <span className="material-symbols-outlined text-[#13ec49]">call</span>
                <span>+1 (234) 567-890</span>
              </li>
              <li className="flex items-center gap-3 text-sm text-gray-400">
                <span className="material-symbols-outlined text-[#13ec49]">mail</span>
                <span>hello@badmintonpro.com</span>
              </li>
            </ul>
          </div>

          {/* Newsletter */}
          <div>
            <h3 className="font-bold text-lg mb-4">Stay Updated</h3>
            <p className="text-gray-400 text-sm mb-4">Subscribe to our newsletter for the latest updates and offers.</p>
            <div className="flex gap-2">
              <input 
                type="email" 
                placeholder="Enter your email" 
                className="flex-1 h-10 px-3 rounded bg-white/10 border border-white/10 text-white placeholder:text-gray-500 text-sm focus:outline-none focus:ring-1 focus:ring-[#13ec49]"
              />
              <button className="h-10 px-3 bg-[#13ec49] hover:bg-[#0fb839] text-[#0d1b11] font-bold rounded transition-colors">
                <span className="material-symbols-outlined text-xl">send</span>
              </button>
            </div>
          </div>
        </div>

        <div className="border-t border-white/10 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-gray-500 text-sm">© 2024 BadmintonPro. All rights reserved.</p>
          <div className="flex gap-6">
            <a href="#" className="text-gray-400 hover:text-white transition-colors">
              <span className="sr-only">Facebook</span>
              <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
              </svg>
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
