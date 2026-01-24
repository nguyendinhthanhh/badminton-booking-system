const AdminHeader = () => {
  return (
    <header className="h-16 flex items-center justify-between px-6 bg-white dark:bg-[#1a3322] border-b border-slate-200 dark:border-slate-800 transition-colors duration-200 z-10">
      {/* Mobile Menu Button */}
      <button className="md:hidden p-2 text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200">
        <span className="material-symbols-outlined">menu</span>
      </button>

      {/* Search Bar */}
      <div className="flex-1 max-w-lg mx-auto md:mx-0 md:mr-auto hidden md:block">
        <div className="relative group">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500 group-focus-within:text-[#13ec49] transition-colors material-symbols-outlined">
            search
          </span>
          <input
            type="text"
            placeholder="Search bookings, users, or courts..."
            className="w-full h-10 pl-10 pr-4 bg-slate-100 dark:bg-slate-800/50 border-none rounded-lg text-sm text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:ring-2 focus:ring-[#13ec49] focus:bg-white dark:focus:bg-slate-800 transition-all"
          />
        </div>
      </div>

      {/* Right Actions */}
      <div className="flex items-center gap-4">
        <button className="relative p-2 text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
          <span className="material-symbols-outlined">notifications</span>
          <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border border-white dark:border-[#1a3322]"></span>
        </button>

        <div className="h-8 w-[1px] bg-slate-200 dark:bg-slate-700 hidden md:block"></div>

        <button className="flex items-center gap-3 pl-1 pr-2 py-1 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
          <div className="w-8 h-8 rounded-full bg-slate-200 bg-center bg-cover border border-slate-300 dark:border-slate-600">
            <div className="w-full h-full rounded-full bg-gradient-to-br from-[#13ec49] to-[#0ea332] flex items-center justify-center text-white font-bold text-sm">
              A
            </div>
          </div>
          <span className="text-sm font-medium text-slate-700 dark:text-slate-200 hidden md:block">
            Admin User
          </span>
          <span className="material-symbols-outlined text-slate-400 text-[20px] hidden md:block">
            expand_more
          </span>
        </button>
      </div>
    </header>
  );
};

export default AdminHeader;
