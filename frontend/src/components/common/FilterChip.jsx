const FilterChip = ({ label, onRemove }) => {
    return (
        <div className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-primary/10 text-primary rounded-full text-sm font-medium">
            <span>{label}</span>
            <button
                onClick={onRemove}
                className="hover:bg-primary/20 rounded-full p-0.5 transition-colors"
                aria-label={`Xóa bộ lọc ${label}`}
            >
                <span className="material-symbols-outlined text-[16px]">close</span>
            </button>
        </div>
    );
};

export default FilterChip;
