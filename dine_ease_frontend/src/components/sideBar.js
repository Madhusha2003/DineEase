import { FaUtensils, FaList, FaChartBar, FaUser, FaFire, FaSignOutAlt, FaEdit, FaTable } from "react-icons/fa";
import { Link, useNavigate } from "react-router-dom";
import { getUserRole } from "../utils/tokenUtils";

export default function Sidebar() {
  const userRole = getUserRole();
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/profile');
  };

  const isLoggedIn = userRole !== null;

  return (
    <div className="w-16 bg-gray-200 h-screen flex flex-col items-center py-6 space-y-8 shadow-md">
      {isLoggedIn ? (
        <>
          {/* Customer Menu - ADMIN, WAITER */}
          {['ADMIN', 'WAITER'].includes(userRole) && (
            <Link to="/menu" title="Menu">
              <FaUtensils className="text-2xl cursor-pointer hover:text-orange-600" />
            </Link>
          )}

          {/* Orders - ADMIN, WAITER */}
          {['ADMIN', 'WAITER'].includes(userRole) && (
            <Link to="/orders" title="Orders">
              <FaList className="text-2xl cursor-pointer hover:text-orange-600" />
            </Link>
          )}

          {/* Reports - ADMIN only */}
          {userRole === 'ADMIN' && (
            <Link to="/reports" title="Reports">
              <FaChartBar className="text-2xl cursor-pointer hover:text-orange-600" />
            </Link>
          )}

          {/* Menu Management - ADMIN only */}
          {userRole === 'ADMIN' && (
            <Link to="/menu_management" title="Manage Menu">
              <FaEdit className="text-2xl cursor-pointer hover:text-orange-600" />
            </Link>
          )}

          {/* Table Management - ADMIN only */}
          {userRole === 'ADMIN' && (
            <Link to="/table_management" title="Manage Tables">
              <FaTable className="text-2xl cursor-pointer hover:text-orange-600" />
            </Link>
          )}

          {/* Kitchen Display - ADMIN, KITCHENSTAFF */}
          {['ADMIN', 'KITCHENSTAFF'].includes(userRole) && (
            <Link to="/kitchen" title="Kitchen Display">
              <FaFire className="text-2xl cursor-pointer hover:text-orange-600" />
            </Link>
          )}

          {/* Logout */}
          <button
            onClick={handleLogout}
            title="Logout"
            className="text-2xl cursor-pointer hover:text-orange-600 bg-transparent border-none"
          >
            <FaSignOutAlt />
          </button>
        </>
      ) : (
        <Link to="/profile" title="Login">
          <FaUser className="text-2xl cursor-pointer hover:text-orange-600" />
        </Link>
      )}
    </div>
  );
}
