import { Outlet } from 'react-router-dom';
import AdminSidebar from '../components/layout/AdminSidebar';
import AdminHeader from '../components/layout/AdminHeader';

const AdminLayout = () => {
  return (
    <div className="flex h-screen w-full overflow-hidden bg-[#f6f8f6] dark:bg-[#102215]">
      <AdminSidebar />
      
      <div className="flex flex-1 flex-col h-full overflow-hidden relative">
        <AdminHeader />
        
        <main className="flex-1 overflow-y-auto p-4 md:p-8">
          <div className="max-w-7xl mx-auto">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
