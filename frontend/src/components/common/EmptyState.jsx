const EmptyState = ({ icon = 'inbox', title, description, action }) => {
  return (
    <div className="flex flex-col items-center justify-center py-12 px-4">
      <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
        <span className="material-symbols-outlined text-4xl text-gray-400">{icon}</span>
      </div>
      <h3 className="text-lg font-semibold text-gray-900 mb-2">{title}</h3>
      {description && <p className="text-sm text-gray-600 text-center mb-4">{description}</p>}
      {action && action}
    </div>
  );
};

export default EmptyState;
