
import './App.css';

import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Sidebar from "./components/sideBar";


import CustomerMenu from "./pages/customerMenu";
import WaiterOrders from './pages/waiterOrders';
import Profile from './pages/Profile';
import Report from './pages/Report';

function App() {
  return (
    <Router>
      <div className="flex">
        <Sidebar/>
         <div className="flex-1 p-6">
          <Routes>
            <Route path="/menu" element={<CustomerMenu/>} />
            <Route path="/orders" element={<WaiterOrders/>} />
            <Route path="/reports" element={<Report/>} />
            <Route path="/notifications" element={<h1>🔔 Notifications Page</h1>} />
            <Route path="/profile" element={<Profile/>} />
          </Routes>
        </div>
      </div>
    </Router>
    
  );
}

export default App;
