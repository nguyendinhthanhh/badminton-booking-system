import { Link } from 'react-router-dom';

const CourtCard = ({ court }) => {
  const { id, name, type, image, status, capacity, features, price, location } = court;
  
  const isAvailable = status === 'available';
  // Type color based on court type
  const typeColor = type === 'Singles' ? 'text-orange-500' : 'text-[#13ec49]';
  const typeLabel = type === 'Singles' ? 'Singles' : 'Doubles';

  return (
    <div className="group bg-white dark:bg-[#1a2e21] rounded-xl overflow-hidden shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 border border-gray-100 dark:border-gray-800">
      <div className="relative h-48 overflow-hidden">
        <div className={`absolute top-3 right-3 z-10 px-2 py-1 ${isAvailable ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'} text-xs font-bold rounded flex items-center gap-1`}>
          <span className={`w-1.5 h-1.5 rounded-full ${isAvailable ? 'bg-green-600 animate-pulse' : 'bg-red-600'}`}></span>
          {isAvailable ? 'Available' : 'Occupied'}
        </div>
        <div 
          className="absolute inset-0 bg-cover bg-center transition-transform duration-500 group-hover:scale-105"
          style={{ backgroundImage: `url(${image})` }}
        ></div>
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-60"></div>
      </div>

      <div className="p-5">
        <div className="flex justify-between items-start mb-2">
          <div>
            <span className={`text-xs font-semibold ${typeColor} uppercase tracking-wide`}>{typeLabel}</span>
            <h3 className="text-lg font-bold text-[#0d1b11] dark:text-white">{name}</h3>
          </div>
        </div>

        {location && (
          <p className="text-xs text-gray-500 dark:text-gray-400 mb-2 flex items-center gap-1">
            <span className="material-symbols-outlined text-[14px]">location_on</span>
            {location}
          </p>
        )}

        <div className="flex items-center gap-4 text-sm text-gray-500 dark:text-gray-400 mb-4">
          <div className="flex items-center gap-1.5">
            <span className="material-symbols-outlined text-[18px]">group</span>
            <span>{capacity}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="material-symbols-outlined text-[18px]">{features.icon}</span>
            <span>{features.label}</span>
          </div>
        </div>

        <div className="pt-4 border-t border-gray-100 dark:border-gray-700 flex items-center justify-between">
          <div>
            <p className="text-xs text-gray-500 dark:text-gray-400">Price per hour</p>
            <p className="text-xl font-bold text-[#0d1b11] dark:text-white">${price.toFixed(2)}</p>
          </div>
          {isAvailable ? (
            <Link 
              to={`/courts/${id}`}
              className="h-9 px-4 rounded-lg border-2 border-[#13ec49] text-[#13ec49] hover:bg-[#13ec49] hover:text-[#0d1b11] font-bold text-sm transition-colors"
            >
              View Detail
            </Link>
          ) : (
            <button 
              disabled
              className="h-9 px-4 rounded-lg bg-gray-100 dark:bg-gray-800 text-gray-400 cursor-not-allowed font-bold text-sm"
            >
              Booked
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default CourtCard;
