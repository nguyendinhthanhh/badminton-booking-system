import { Outlet } from 'react-router-dom';

const GuestLayout = () => {
  return (
    <div className="flex flex-col min-h-screen">
      <Outlet />
    </div>
  );
};

export default GuestLayout;
