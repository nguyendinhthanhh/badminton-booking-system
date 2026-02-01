const CacheIndicator = ({ isCached }) => {
  if (!isCached) return null;

  return (
    <div className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-green-50 border border-green-200 rounded-lg text-xs font-medium text-green-700">
      <span className="material-symbols-outlined text-sm">bolt</span>
      <span>Tải nhanh từ bộ nhớ đệm</span>
    </div>
  );
};

export default CacheIndicator;
