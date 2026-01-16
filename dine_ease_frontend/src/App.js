
import './App.css';

import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Sidebar from "./components/sideBar";
import ProtectedRoute from "./components/ProtectedRoute";

import CustomerMenu from "./pages/customerMenu";
import WaiterOrders from './pages/waiterOrders';
import KitchenDisplay from "./pages/kitchenDisplay";
import Profile from './pages/Profile';
import Report from './pages/Report';

function App() {
  return (
    <Router>
      <div className="flex">
        <Sidebar/>
         <div className="flex-1 p-6">
          <Routes>
            {/* ADMIN: all pages */}
            <Route path="/menu" element={<ProtectedRoute Component={CustomerMenu} requiredRoles={['ADMIN', 'WAITER']} />} />
            <Route path="/orders" element={<ProtectedRoute Component={WaiterOrders} requiredRoles={['ADMIN', 'WAITER']} />} />
            <Route path="/kitchen" element={<ProtectedRoute Component={KitchenDisplay} requiredRoles={['ADMIN', 'KITCHENSTAFF']} />} />
            <Route path="/reports" element={<ProtectedRoute Component={Report} requiredRoles={['ADMIN']} />} />
            
            {/* Profile/Login - public */}
            <Route path="/profile" element={<Profile/>} />
            
            {/* Fallback to profile */}
            <Route path="/" element={<Profile/>} />
          </Routes>
        </div>
      </div>
    </Router>
    
  );
}

export default App;
