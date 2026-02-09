import { useState } from 'react';
import FilterDropdown from './FilterDropdown';

const CourtTypeFilterDropdown = ({ courtTypes, onChange }) => {
    const [isOpen, setIsOpen] = useState(false);

    const selectedCount = Object.values(courtTypes).filter(Boolean).length;
    const hasFilter = selectedCount !== 2; // Not default (single + double, no VIP)

    const handleToggle = (type) => {
        onChange({ ...courtTypes, [type]: !courtTypes[type] });
    };

    const handleSelectAll = () => {
        onChange({ single: true, double: true, vip: true });
    };

    const handleClear = () => {
        onChange({ single: false, double: false, vip: false });
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
            <span className="material-symbols-outlined text-[20px]">sports_tennis</span>
            <span>Loại sân</span>
            {hasFilter && selectedCount > 0 && (
                <span className="px-1.5 py-0.5 bg-primary text-white text-xs rounded-full">{selectedCount}</span>
            )}
            <span className="material-symbols-outlined text-[20px]">
                {isOpen ? 'expand_less' : 'expand_more'}
            </span>
        </button>
    );

    return (
        <FilterDropdown trigger={trigger} isOpen={isOpen} onToggle={setIsOpen}>
            <div className="p-3 w-56">
                {/* Court Type Options */}
                <div className="space-y-1">
                    <label className="flex items-center gap-3 p-2 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-lg cursor-pointer transition-colors">
                        <input
                            type="checkbox"
                            checked={courtTypes.single}
                            onChange={() => handleToggle('single')}
                            className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary/20 cursor-pointer"
                        />
                        <span className="text-sm text-[#111318] dark:text-white">Sân đơn</span>
                    </label>

                    <label className="flex items-center gap-3 p-2 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-lg cursor-pointer transition-colors">
                        <input
                            type="checkbox"
                            checked={courtTypes.double}
                            onChange={() => handleToggle('double')}
                            className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary/20 cursor-pointer"
                        />
                        <span className="text-sm text-[#111318] dark:text-white">Sân đôi</span>
                    </label>

                    <label className="flex items-center gap-3 p-2 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-lg cursor-pointer transition-colors">
                        <input
                            type="checkbox"
                            checked={courtTypes.vip}
                            onChange={() => handleToggle('vip')}
                            className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary/20 cursor-pointer"
                        />
                        <span className="text-sm text-[#111318] dark:text-white">Sân VIP</span>
                    </label>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-2 pt-2 mt-2 border-t border-gray-200 dark:border-gray-700">
                    <button
                        onClick={handleSelectAll}
                        className="flex-1 px-3 py-1.5 text-xs font-medium text-[#616e89] dark:text-gray-400 hover:text-[#111318] dark:hover:text-white transition-colors"
                    >
                        Tất cả
                    </button>
                    <button
                        onClick={handleClear}
                        className="flex-1 px-3 py-1.5 text-xs font-medium text-[#616e89] dark:text-gray-400 hover:text-[#111318] dark:hover:text-white transition-colors"
                    >
                        Xóa
                    </button>
                </div>
            </div>
        </FilterDropdown>
    );
};

export default CourtTypeFilterDropdown;
