import './App.css';
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Sidebar from "./components/sideBar";
import ProtectedRoute from "./components/ProtectedRoute";
import { useAutoLogout } from './utils/useAutoLogout';

import CustomerMenu from "./pages/customerMenu";
import WaiterOrders from './pages/waiterOrders';
import KitchenDisplay from "./pages/kitchenDisplay";
import Profile from './pages/Profile';
import Report from './pages/Report';
import MenuManagement from './pages/MenuManagement';
import TableManagement from './pages/TableManagement';
import OrderManagement from './pages/orderManagement';
import StaffManagement from './pages/StaffManagement';
import { Toaster } from 'react-hot-toast';


function AppContent() {
  // Setup auto logout on token expiration
  useAutoLogout();

  return (
    <div className="flex">
      <Sidebar />
      <div className="flex-1 p-6">
        <Routes>
          {/* ADMIN: all pages */}
          <Route path="/menu" element={<ProtectedRoute Component={CustomerMenu} requiredRoles={['ADMIN', 'WAITER']} />} />
          <Route path="/orders" element={<ProtectedRoute Component={WaiterOrders} requiredRoles={['ADMIN', 'WAITER']} />} />
          <Route path="/kitchen" element={<ProtectedRoute Component={KitchenDisplay} requiredRoles={['ADMIN', 'KITCHENSTAFF']} />} />
          <Route path="/reports" element={<ProtectedRoute Component={Report} requiredRoles={['ADMIN']} />} />
          <Route path="/menu_management" element={<ProtectedRoute Component={MenuManagement} requiredRoles={['ADMIN']} />} />
          <Route path="/table_management" element={<ProtectedRoute Component={TableManagement} requiredRoles={['ADMIN']} />} />
          <Route path="/order_management" element={<ProtectedRoute Component={OrderManagement} requiredRoles={['ADMIN']} />} />
          <Route path="/staff_management" element={<ProtectedRoute Component={StaffManagement} requiredRoles={['ADMIN']} />} />

          {/* Profile/Login - public */}
          <Route path="/profile" element={<Profile />} />

          {/* Fallback to profile */}
          <Route path="/" element={<Profile />} />
        </Routes>
      </div>
      <Toaster position='top-right' reverseOrder={false} />
    </div>
  );
}

function App() {
  return (
    <Router>
      <AppContent />
    </Router>
  );
}

export default App;


