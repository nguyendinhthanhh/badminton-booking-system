import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import GuestLayout from './layouts/GuestLayout';
import AdminLayout from './layouts/AdminLayout';
import GuestHome from './pages/customer/GuestHome';
import CourtDetails from './pages/customer/CourtDetails';
import Dashboard from './pages/admin/Dashboard';
import CourtManagement from './pages/admin/CourtManagement';
import './App.css';

function App() {
  return (
    <Router>
      <Routes>
        {/* Guest Routes */}
        <Route element={<GuestLayout />}>
          <Route path="/" element={<GuestHome />} />
          <Route path="/courts/:id" element={<CourtDetails />} />
        </Route>

        {/* Admin Routes */}
        <Route path="/admin" element={<AdminLayout />}>
          <Route index element={<Dashboard />} />
          <Route path="courts" element={<CourtManagement />} />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;
