import React, { useState, useEffect } from "react";
import { FaClipboardList, FaDollarSign, FaReceipt, FaClock } from "react-icons/fa";
import {
  BarChart, Bar, LineChart, Line,
  XAxis, YAxis, Tooltip, CartesianGrid, Legend, PieChart, Pie, Cell, ResponsiveContainer
} from "recharts";
import { getTodayRange, getThisWeekRange, getThisMonthRange, getThisYearRange } from "../utils/dateUtils";
import API_URL from "../config/api";

const COLORS = ["#3b82f6", "#22c55e", "#f97316", "#e11d48", "#8b5cf6"];

/**
 * Processes raw order data from the API to calculate all report metrics.
 * @param {Array} orders - An array of order objects from the API.
 * @param {string} timeRange - The selected time range filter (e.g., 'Today', 'This Week').
 * @returns {Object} An object containing all the calculated report data.
 */
const processOrdersForReports = (orders, timeRange) => {
  // 1. Determine date range from utility functions
  let range;
  switch (timeRange) {
    case 'Today':
      range = getTodayRange();
      break;
    case 'This Week':
      range = getThisWeekRange();
      break;
    case 'This Month':
      range = getThisMonthRange();
      break;
    case 'This Year':
      range = getThisYearRange();
      break;
    default:
      range = null; // For 'All Time', 'Custom Range', etc.
  }

  // 2. Filter orders based on the selected time range
  const filteredOrders = range
    ? orders.filter(order => {
      const orderDate = new Date(order.createdAt);
      return orderDate >= range.start && orderDate <= range.end;
    })
    : orders; // If range is null, use all orders

  // 2. Calculate Overview Stats
  const totalOrders = filteredOrders.length;
  const totalRevenue = filteredOrders.reduce((sum, order) => sum + order.total, 0);
  const avgOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;

  let peakTime = 'N/A';
  if (totalOrders > 0) {
    const hourlyCounts = Array(24).fill(0);
    filteredOrders.forEach(order => {
      hourlyCounts[new Date(order.createdAt).getHours()]++;
    });
    let maxCount = 0;
    let peakStartHour = -1;
    for (let i = 0; i < 23; i++) { // Check 2-hour windows
      const currentCount = hourlyCounts[i] + hourlyCounts[i + 1];
      if (currentCount > maxCount) {
        maxCount = currentCount;
        peakStartHour = i;
      }
    }
    if (peakStartHour !== -1) {
      const formatHour = (h) => `${h % 12 || 12} ${h < 12 || h === 24 ? 'AM' : 'PM'}`;
      peakTime = `${formatHour(peakStartHour)}–${formatHour(peakStartHour + 2)}`;
    }
  }
  const overview = { totalOrders, totalRevenue, avgOrderValue, peakTime };

  // 3. Calculate Trends based on timeRange
  let trendData;
  let trendDataKey;
  let trendLabel;

  if (timeRange === 'Today') {
    trendDataKey = 'hour';
    trendLabel = 'Hour';
    const hourlyData = Array.from({ length: 24 }, (_, i) => {
      const hour = i;
      const label = hour === 0 ? '12 AM' : hour < 12 ? `${hour} AM` : hour === 12 ? '12 PM' : `${hour - 12} PM`;
      return { hour: label, orders: 0, revenue: 0, guests: 0 };
    });

    filteredOrders.forEach(order => {
      const hour = new Date(order.createdAt).getHours();
      hourlyData[hour].orders += 1;
      hourlyData[hour].revenue += order.total;
      hourlyData[hour].guests += order.numberOfGuests || 0;
    });
    trendData = hourlyData;
  } else if (timeRange === 'This Month') {
    trendDataKey = 'date';
    trendLabel = 'Day';
    const today = new Date();
    const daysInMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0).getDate();
    const dailyData = Array.from({ length: daysInMonth }, (_, i) => ({
      date: `${i + 1}`,
      orders: 0,
      revenue: 0,
      guests: 0,
    }));

    filteredOrders.forEach(order => {
      const dateIndex = new Date(order.createdAt).getDate() - 1;
      if (dailyData[dateIndex]) {
        dailyData[dateIndex].orders += 1;
        dailyData[dateIndex].revenue += order.total;
        dailyData[dateIndex].guests += order.numberOfGuests || 0;
      }
    });
    trendData = dailyData;
  } else if (timeRange === 'This Year') {
    trendDataKey = 'month';
    trendLabel = 'Month';
    const monthlyData = Array.from({ length: 12 }, (_, i) => ({
      month: new Date(0, i).toLocaleString('default', { month: 'short' }),
      orders: 0,
      revenue: 0,
      guests: 0,
    }));

    filteredOrders.forEach(order => {
      const monthIndex = new Date(order.createdAt).getMonth();
      monthlyData[monthIndex].orders += 1;
      monthlyData[monthIndex].revenue += order.total;
      monthlyData[monthIndex].guests += order.numberOfGuests || 0;
    });
    trendData = monthlyData;
  } else { // 'This Week' or 'All Time'
    trendDataKey = 'day';
    trendLabel = 'Day';
    const weeklyData = {};
    const daysOfWeek = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    daysOfWeek.forEach(day => { weeklyData[day] = { day, orders: 0, revenue: 0, guests: 0 }; });

    filteredOrders.forEach(order => {
      const dayName = daysOfWeek[new Date(order.createdAt).getDay()];
      weeklyData[dayName].orders += 1;
      weeklyData[dayName].revenue += order.total;
      weeklyData[dayName].guests += order.numberOfGuests || 0;
    });
    trendData = Object.values(weeklyData);
  }

  // 4. Calculate Popular Items
  const itemCounts = filteredOrders.reduce((acc, order) => {
    order.items.forEach(item => {
      const name = item.menuItem.title;
      acc[name] = (acc[name] || 0) + item.quantity;
    });
    return acc;
  }, {});
  const popularItems = Object.entries(itemCounts)
    .map(([name, value]) => ({ name, value }))
    .sort((a, b) => b.value - a.value)
    .slice(0, 5); // Top 5

  return { overview, trendData, trendDataKey, trendLabel, popularItems };
};

const RADIAN = Math.PI / 180;
const renderCustomizedLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent }) => {
  const radius = innerRadius + (outerRadius - innerRadius) * 0.6;
  const x = cx + radius * Math.cos(-midAngle * RADIAN);
  const y = cy + radius * Math.sin(-midAngle * RADIAN);

  if (percent < 0.05) return null; // Don't render label for small slices

  return (
    <text x={x} y={y} fill="white" textAnchor="middle" dominantBaseline="central" fontSize={14} fontWeight="bold">
      {`${(percent * 100).toFixed(0)}%`}
    </text>
  );
};
export default function ReportsPage() {
  const [reportData, setReportData] = useState({
    overview: { totalOrders: 0, totalRevenue: 0, avgOrderValue: 0, peakTime: 'N/A' },
    trendData: [],
    trendDataKey: 'day',
    trendLabel: 'Day',
    popularItems: [],
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [timeRange, setTimeRange] = useState('This Week');

  useEffect(() => {
    const fetchAndProcessOrders = async () => {
      setLoading(true);
      setError(null);
      try {
        // Fetch all completed orders. For a full report, you might want to fetch more statuses.
        // The backend would be more efficient if it could filter by date range directly.
        const response = await fetch(`${API_URL}/orders?statuses=PAID`);
        if (!response.ok) {
          throw new Error('Failed to fetch order data.');
        }
        const allPaidOrders = await response.json();

        // Process the raw order data into report-friendly structures
        const processedData = processOrdersForReports(allPaidOrders, timeRange);
        setReportData(processedData);

      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchAndProcessOrders();
  }, [timeRange]); // Re-fetch and re-process data when the timeRange changes

  if (loading) {
    return <div className="p-6 text-center font-semibold">Loading reports...</div>;
  }

  if (error) {
    return <div className="p-6 text-center text-red-500">Error: {error}</div>;
  }

  return (
    <div className="p-4 sm:p-6 bg-gray-100 min-h-screen">
      {/* Header / Filters */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
        <h1 className="text-3xl font-bold text-gray-800">Reports Dashboard</h1>
        <div className="flex items-center gap-4">
          <label htmlFor="time-range-select" className="font-medium text-gray-600">Period:</label>
          <select
            id="time-range-select"
            className="px-4 py-2 border border-gray-300 bg-white rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value)}
          >
            <option>Today</option>
            <option>This Week</option>
            <option>This Month</option>
            <option>This Year</option>
            <option>All Time</option>
          </select>
        </div>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white p-5 rounded-xl shadow-md flex items-center gap-4">
          <div className="bg-blue-100 p-3 rounded-full">
            <FaClipboardList className="text-blue-500 text-2xl" />
          </div>
          <div>
            <p className="text-sm text-gray-500 font-medium">Total Orders</p>
            <h2 className="text-2xl font-bold text-gray-800">{reportData.overview.totalOrders}</h2>
          </div>
        </div>
        <div className="bg-white p-5 rounded-xl shadow-md flex items-center gap-4">
          <div className="bg-green-100 p-3 rounded-full">
            <FaDollarSign className="text-green-500 text-2xl" />
          </div>
          <div>
            <p className="text-sm text-gray-500 font-medium">Total Revenue</p>
            <h2 className="text-2xl font-bold text-gray-800">Rs.{reportData.overview.totalRevenue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</h2>
          </div>
        </div>
        <div className="bg-white p-5 rounded-xl shadow-md flex items-center gap-4">
          <div className="bg-orange-100 p-3 rounded-full">
            <FaReceipt className="text-orange-500 text-2xl" />
          </div>
          <div>
            <p className="text-sm text-gray-500 font-medium">Avg. Order Value</p>
            <h2 className="text-2xl font-bold text-gray-800">Rs.{reportData.overview.avgOrderValue.toFixed(2)}</h2>
          </div>
        </div>
        <div className="bg-white p-5 rounded-xl shadow-md flex items-center gap-4">
          <div className="bg-purple-100 p-3 rounded-full">
            <FaClock className="text-purple-500 text-2xl" />
          </div>
          <div>
            <p className="text-sm text-gray-500 font-medium">Peak Time</p>
            <h2 className="text-2xl font-bold text-gray-800">{reportData.overview.peakTime}</h2>
          </div>
        </div>
      </div>

      {/* Dynamic Trends */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <div className="bg-white p-6 rounded-xl shadow-md">
          <h3 className="font-semibold text-lg text-gray-700 mb-4">Orders per {reportData.trendLabel}</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={reportData.trendData} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
              <XAxis dataKey={reportData.trendDataKey} tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip contentStyle={{ backgroundColor: '#fff', border: '1px solid #ccc' }} />
              <Legend wrapperStyle={{ fontSize: 14 }} />
              <Bar dataKey="orders" fill="#3b82f6" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-md">
          <h3 className="font-semibold text-lg text-gray-700 mb-4">Revenue per {reportData.trendLabel}</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={reportData.trendData} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
              <XAxis dataKey={reportData.trendDataKey} tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} tickFormatter={(value) => `Rs.${value / 1000}k`} />
              <Tooltip formatter={(value) => `Rs.${Number(value).toLocaleString()}`} />
              <Legend wrapperStyle={{ fontSize: 14 }} />
              <Line type="monotone" dataKey="revenue" stroke="#22c55e" strokeWidth={2} dot={{ r: 4 }} activeDot={{ r: 6 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        {/* Popular Items */}
        <div className="bg-white p-6 rounded-xl shadow-md">
          <h3 className="font-semibold text-lg text-gray-700 mb-4">Popular Items</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={reportData.popularItems}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={renderCustomizedLabel}
                outerRadius={110}
                dataKey="value"
              >
                {reportData.popularItems.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip formatter={(value, name) => [`${value} sold`, name]} />
              <Legend iconSize={12} wrapperStyle={{ fontSize: 14 }} />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Guests per Trend */}
        <div className="bg-white p-6 rounded-xl shadow-md">
          <h3 className="font-semibold text-lg text-gray-700 mb-4">Guests per {reportData.trendLabel}</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={reportData.trendData} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
              <XAxis dataKey={reportData.trendDataKey} tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip contentStyle={{ backgroundColor: '#fff', border: '1px solid #ccc' }} />
              <Legend wrapperStyle={{ fontSize: 14 }} />
              <Bar dataKey="guests" name="Total Guests" fill="#f97316" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
