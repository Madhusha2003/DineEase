import { FaUtensils, FaList, FaChartBar, FaBell, FaUser } from "react-icons/fa";
import { Link } from "react-router-dom";

export default function Sidebar() {
  return (
    <div className="w-16 bg-gray-200 h-screen flex flex-col items-center py-6 space-y-8 shadow-md">
      <Link to="/menu"><FaUtensils className="text-2xl cursor-pointer" /></Link>
      <Link to="/orders"><FaList className="text-2xl cursor-pointer" /></Link>
      <Link to="/reports"><FaChartBar className="text-2xl cursor-pointer" /></Link>
      <Link to="/notifications"><FaBell className="text-2xl cursor-pointer" /></Link>
      <Link to="/profile"><FaUser className="text-2xl cursor-pointer" /></Link>
    </div>
  );
}
