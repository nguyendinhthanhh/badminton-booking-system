const TableSkeleton = ({ rows = 5, columns = 6 }) => {
  return (
    <div className="animate-pulse">
      <table className="w-full">
        <thead className="bg-gray-50 border-b border-gray-200">
          <tr>
            {[...Array(columns)].map((_, i) => (
              <th key={i} className="px-6 py-3 text-left">
                <div className="h-3 bg-gray-200 rounded w-20"></div>
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200">
          {[...Array(rows)].map((_, rowIndex) => (
            <tr key={rowIndex} className="hover:bg-gray-50">
              {[...Array(columns)].map((_, colIndex) => (
                <td key={colIndex} className="px-6 py-4">
                  {colIndex === 0 ? (
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-gray-200 rounded-full"></div>
                      <div className="space-y-2">
                        <div className="h-3 bg-gray-200 rounded w-32"></div>
                        <div className="h-2 bg-gray-200 rounded w-24"></div>
                      </div>
                    </div>
                  ) : colIndex === columns - 1 ? (
                    <div className="flex justify-end gap-2">
                      <div className="w-8 h-8 bg-gray-200 rounded"></div>
                      <div className="w-8 h-8 bg-gray-200 rounded"></div>
                      <div className="w-8 h-8 bg-gray-200 rounded"></div>
                    </div>
                  ) : (
                    <div className="h-3 bg-gray-200 rounded w-24"></div>
                  )}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default TableSkeleton;
