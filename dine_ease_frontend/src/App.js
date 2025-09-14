
import './App.css';

import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Sidebar from "./components/sideBar";


import CustomerMenu from "./pages/customerMenu";

function App() {
  return (
    <Router>
      <div className="flex">
        <Sidebar/>
         <div className="flex-1 p-6">
          <Routes>
            <Route path="/menu" element={<CustomerMenu/>} />
            <Route path="/orders" element={<h1>📋 Orders Page</h1>} />
            <Route path="/reports" element={<h1>📊 Reports Page</h1>} />
            <Route path="/notifications" element={<h1>🔔 Notifications Page</h1>} />
            <Route path="/profile" element={<h1>👤 Profile Page</h1>} />
          </Routes>
        </div>
      </div>
    </Router>
    
  );
}

export default App;
