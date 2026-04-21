import { FaUtensils, FaList, FaChartBar, FaUser, FaFire, FaSignOutAlt, FaEdit, FaTable, FaUserEdit, FaHistory, FaCog } from "react-icons/fa";
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
    <div className="w-full h-16 md:w-16 md:h-screen bg-gray-900 flex flex-row md:flex-col items-center justify-around md:justify-start py-3 md:py-6 md:space-y-8 shadow-md z-[100] fixed bottom-0 md:relative">
      {isLoggedIn ? (
        <>
          {/* Customer Menu - ADMIN, WAITER */}
          {['ADMIN', 'WAITER'].includes(userRole) && (
            <Link to="/menu" title="Menu">
              <FaUtensils className="text-2xl text-slate-200 cursor-pointer hover:text-orange-500" />
            </Link>
          )}

          {/* Orders - ADMIN, WAITER */}
          {['ADMIN', 'WAITER'].includes(userRole) && (
            <Link to="/orders" title="Orders">
              <FaList className="text-2xl text-slate-200 cursor-pointer hover:text-orange-500" />
            </Link>
          )}

          {/* Kitchen Display - ADMIN, KITCHENSTAFF */}
          {['ADMIN', 'KITCHENSTAFF'].includes(userRole) && (
            <Link to="/kitchen" title="Kitchen Display">
              <FaFire className="text-2xl text-slate-200 cursor-pointer hover:text-orange-500" />
            </Link>
          )}

          {/* Reports - ADMIN only */}
          {userRole === 'ADMIN' && (
            <Link to="/reports" title="Reports">
              <FaChartBar className="text-2xl text-slate-200 cursor-pointer hover:text-orange-500" />
            </Link>
          )}

          {/* Table Management - ADMIN only */}
          {userRole === 'ADMIN' && (
            <Link to="/table_management" title="Manage Tables">
              <FaTable className="text-2xl text-slate-200 cursor-pointer hover:text-orange-500" />
            </Link>
          )}

          {/* Menu Management - ADMIN only */}
          {userRole === 'ADMIN' && (
            <Link to="/menu_management" title="Manage Menu">
              <FaEdit className="text-2xl text-slate-200 cursor-pointer hover:text-orange-500" />
            </Link>
          )}

          {/* Order Management - ADMIN */}
          {userRole === 'ADMIN' && (
            <Link to="/order_management" title="Manage Orders">
              <FaHistory className="text-2xl text-slate-200 cursor-pointer hover:text-orange-500" />
            </Link>
          )}

          {/* Staff Management - ADMIN only */}
          {userRole === 'ADMIN' && (
            <Link to="/staff_management" title="Manage Staff">
              <FaUserEdit className="text-2xl text-slate-200 cursor-pointer hover:text-orange-500" />
            </Link>
          )}

          {/* Settings - ADMIN only */}
          {userRole === 'ADMIN' && (
            <Link to="/settings" title="Settings">
              <FaCog className="text-2xl text-slate-200 cursor-pointer hover:text-orange-500" />
            </Link>
          )}

          {/* Logout */}
          <button
            onClick={handleLogout}
            title="Logout"
            className="text-2xl text-slate-200 cursor-pointer hover:text-orange-500 bg-transparent border-none"
          >
            <FaSignOutAlt />
          </button>
        </>
      ) : (
        <Link to="/profile" title="Login">
          <FaUser className="text-2xl text-slate-200 cursor-pointer hover:text-orange-500" />
        </Link>
      )}
    </div>
  );
}
