const ShuttlecockDetailModal = ({ isOpen, onClose, data }) => {
  if (!isOpen || !data) return null;

  const infoRows = [
    { label: "Tên cầu", value: data.name || "-" },
    { label: "Mã SKU", value: data.sku || "-" },
    {
      label: "Giá cơ bản",
      value: `${Number(data.basePrice || 0).toLocaleString("vi-VN")} đ`,
    },
    { label: "Số lượng tồn kho", value: data.quantity ?? 0 },
    { label: "Mô tả", value: data.description || "-" },
  ];

  const getStockStatus = (quantity) => {
    if (quantity === 0)
      return {
        label: "Hết hàng",
        className: "bg-red-100 text-red-700 border-red-200",
        icon: "error",
      };
    if (quantity <= 10)
      return {
        label: "Sắp hết",
        className: "bg-amber-100 text-amber-700 border-amber-200",
        icon: "warning",
      };
    return {
      label: "Còn hàng",
      className: "bg-green-100 text-green-700 border-green-200",
      icon: "check_circle",
    };
  };

  const stockStatus = getStockStatus(data.quantity || 0);

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex min-h-screen items-center justify-center p-4">
        <div
          className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm transition-opacity"
          onClick={onClose}
        />

        <div className="relative bg-white dark:bg-[#1a202c] rounded-xl shadow-2xl max-w-lg w-full border border-slate-200 dark:border-slate-800 overflow-hidden">
          {/* Header */}
          <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-800">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center">
                  <span className="material-symbols-outlined text-purple-600 dark:text-purple-400">
                    sports_tennis
                  </span>
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-slate-900 dark:text-white">
                    Chi tiết loại cầu
                  </h2>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Thông tin chi tiết sản phẩm cầu lông
                  </p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="rounded-md text-slate-400 hover:text-slate-500 focus:outline-none"
              >
                <span className="material-symbols-outlined text-xl">close</span>
              </button>
            </div>
          </div>

          {/* Body */}
          <div className="px-6 py-5 space-y-5">
            {/* Title + Status */}
            <div className="flex items-center justify-between">
              <h3 className="text-xl font-bold text-slate-900 dark:text-white">
                {data.name}
              </h3>
              <span
                className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold border ${stockStatus.className}`}
              >
                <span className="material-symbols-outlined text-sm">
                  {stockStatus.icon}
                </span>
                {stockStatus.label}
              </span>
            </div>

            {/* Info grid */}
            <div className="space-y-3">
              {infoRows.map((row, index) => (
                <div
                  key={index}
                  className="flex items-start justify-between py-2.5 border-b border-slate-100 dark:border-slate-800 last:border-0"
                >
                  <span className="text-sm text-slate-500 dark:text-slate-400 font-medium">
                    {row.label}
                  </span>
                  <span className="text-sm text-slate-900 dark:text-white font-semibold text-right max-w-[60%]">
                    {row.value}
                  </span>
                </div>
              ))}
            </div>

            {/* SKU badge */}
            {data.sku && (
              <div className="flex items-center gap-2 p-3 bg-slate-50 dark:bg-slate-800/50 rounded-lg border border-slate-200 dark:border-slate-700">
                <span className="material-symbols-outlined text-slate-400 text-lg">
                  qr_code_2
                </span>
                <div>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Mã sản phẩm (SKU)
                  </p>
                  <p className="text-sm font-mono font-bold text-slate-900 dark:text-white tracking-wider">
                    {data.sku}
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="flex justify-end px-6 py-3 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50">
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-md bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-200 border border-slate-300 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700 font-medium text-sm"
            >
              Đóng
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ShuttlecockDetailModal;
