import { useState } from 'react';
import FilterDropdown from './FilterDropdown';

const PriceFilterDropdown = ({ priceRange, onChange, formatPrice }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [tempRange, setTempRange] = useState(priceRange);

    const PRICE_PRESETS = [
        { label: '< 100k', range: [0, 100000] },
        { label: '100k-200k', range: [100000, 200000] },
        { label: '200k-300k', range: [200000, 300000] },
        { label: '300k+', range: [300000, 500000] },
    ];

    const hasFilter = priceRange[0] > 0 || priceRange[1] < 500000;

    const handleApply = () => {
        onChange(tempRange);
        setIsOpen(false);
    };

    const handleReset = () => {
        setTempRange([0, 500000]);
        onChange([0, 500000]);
        setIsOpen(false);
    };

    const handlePreset = (range) => {
        setTempRange(range);
        onChange(range);
        setIsOpen(false);
    };

    const trigger = (
        <button
            className={`
        flex items-center gap-2 px-4 py-2 rounded-lg border font-medium text-sm transition-all
        ${hasFilter
                    ? 'border-primary bg-primary/5 text-primary'
                    : 'border-gray-200 dark:border-gray-700 text-[#111318] dark:text-white hover:border-gray-300'
                }
      `}
        >
            <span className="material-symbols-outlined text-[20px]">payments</span>
            <span>Khoảng giá</span>
            {hasFilter && (
                <span className="px-1.5 py-0.5 bg-primary text-white text-xs rounded-full">1</span>
            )}
            <span className="material-symbols-outlined text-[20px]">
                {isOpen ? 'expand_less' : 'expand_more'}
            </span>
        </button>
    );

    return (
        <FilterDropdown trigger={trigger} isOpen={isOpen} onToggle={setIsOpen}>
            <div className="p-4 w-80">
                <h4 className="font-semibold text-[#111318] dark:text-white mb-4">Khoảng giá (VND)</h4>

                {/* Min Price Slider */}
                <div className="mb-4">
                    <label className="text-xs text-[#616e89] dark:text-gray-400 mb-2 block">
                        Giá tối thiểu
                    </label>
                    <input
                        type="range"
                        min="0"
                        max={tempRange[1]}
                        step="10000"
                        value={tempRange[0]}
                        onChange={(e) => setTempRange([parseInt(e.target.value), tempRange[1]])}
                        className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer accent-primary"
                    />
                    <div className="text-right mt-1">
                        <span className="text-sm font-semibold text-primary">{formatPrice(tempRange[0])}</span>
                    </div>
                </div>

                {/* Max Price Slider */}
                <div className="mb-4">
                    <label className="text-xs text-[#616e89] dark:text-gray-400 mb-2 block">
                        Giá tối đa
                    </label>
                    <input
                        type="range"
                        min={tempRange[0]}
                        max="500000"
                        step="10000"
                        value={tempRange[1]}
                        onChange={(e) => setTempRange([tempRange[0], parseInt(e.target.value)])}
                        className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer accent-primary"
                    />
                    <div className="text-right mt-1">
                        <span className="text-sm font-semibold text-primary">{formatPrice(tempRange[1])}</span>
                    </div>
                </div>

                {/* Price Range Display */}
                <div className="flex justify-between text-sm bg-gray-50 dark:bg-gray-800 rounded-lg px-4 py-2.5 mb-4">
                    <span className="font-semibold text-[#111318] dark:text-white">{formatPrice(tempRange[0])}</span>
                    <span className="text-[#616e89] dark:text-gray-400">-</span>
                    <span className="font-semibold text-[#111318] dark:text-white">{formatPrice(tempRange[1])}</span>
                </div>

                {/* Quick Presets */}
                <div className="mb-4">
                    <p className="text-xs text-[#616e89] dark:text-gray-400 mb-2">Lựa chọn nhanh:</p>
                    <div className="grid grid-cols-2 gap-2">
                        {PRICE_PRESETS.map((preset) => (
                            <button
                                key={preset.label}
                                onClick={() => handlePreset(preset.range)}
                                className="px-3 py-1.5 text-sm text-[#111318] dark:text-white border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                            >
                                {preset.label}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-2 pt-3 border-t border-gray-200 dark:border-gray-700">
                    <button
                        onClick={handleReset}
                        className="flex-1 px-4 py-2 text-sm font-medium text-[#616e89] dark:text-gray-400 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                    >
                        Xóa
                    </button>
                    <button
                        onClick={handleApply}
                        className="flex-1 px-4 py-2 text-sm font-medium bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors"
                    >
                        Áp dụng
                    </button>
                </div>
            </div>
        </FilterDropdown>
    );
};

export default PriceFilterDropdown;
