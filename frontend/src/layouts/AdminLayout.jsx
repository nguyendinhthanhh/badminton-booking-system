import { Outlet } from 'react-router-dom';
import AdminSidebar from '../components/layout/AdminSidebar';
import AdminHeader from '../components/layout/AdminHeader';

const AdminLayout = () => {
  return (
    <div className="flex h-screen w-full overflow-hidden bg-gray-50">
      <AdminSidebar />
      
      <main className="flex-1 flex flex-col h-full overflow-hidden">
        <AdminHeader />
        <div className="flex-1 overflow-y-auto">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default AdminLayout;
