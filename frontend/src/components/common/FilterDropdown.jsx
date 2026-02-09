import { useEffect, useRef } from 'react';

const FilterDropdown = ({ trigger, children, isOpen, onToggle, align = 'left' }) => {
    const dropdownRef = useRef(null);

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                onToggle(false);
            }
        };

        if (isOpen) {
            document.addEventListener('mousedown', handleClickOutside);
        }

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [isOpen, onToggle]);

    return (
        <div className="relative" ref={dropdownRef}>
            {/* Trigger Button */}
            <div onClick={() => onToggle(!isOpen)}>
                {trigger}
            </div>

            {/* Dropdown Panel */}
            {isOpen && (
                <div
                    className={`
            absolute top-full mt-2 
            bg-white dark:bg-surface-dark 
            shadow-lg rounded-lg border border-gray-200 dark:border-gray-700 
            z-50 animate-slideDown
            ${align === 'right' ? 'right-0' : 'left-0'}
          `}
                >
                    {children}
                </div>
            )}
        </div>
    );
};

export default FilterDropdown;
