import React from "react";
import {
  BarChart, Bar, LineChart, Line,
  XAxis, YAxis, Tooltip, CartesianGrid, Legend, PieChart, Pie, Cell
} from "recharts";

// Sample Data
const weeklyOrders = [
  { day: "Mon", orders: 45, revenue: 750 },
  { day: "Tue", orders: 60, revenue: 950 },
  { day: "Wed", orders: 55, revenue: 890 },
  { day: "Thu", orders: 70, revenue: 1200 },
  { day: "Fri", orders: 90, revenue: 1500 },
  { day: "Sat", orders: 110, revenue: 2000 },
  { day: "Sun", orders: 80, revenue: 1350 },
];

const popularItems = [
  { name: "Cheeseburger", value: 90 },
  { name: "Fries", value: 75 },
  { name: "Cola", value: 65 },
  { name: "Salad", value: 30 },
  { name: "Soup", value: 20 },
];

const staffPerformance = [
  { staff: "John", orders: 45, revenue: 890 },
  { staff: "Sarah", orders: 55, revenue: 1050 },
  { staff: "Mike", orders: 25, revenue: 420 },
];

const COLORS = ["#3b82f6", "#22c55e", "#f97316", "#e11d48", "#8b5cf6"];

export default function ReportsPage() {
  return (
    <div className="p-6 bg-gray-100 min-h-screen">
      {/* Header / Filters */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Reports Dashboard</h1>
        <div className="flex gap-2">
          <select className="px-3 py-2 border rounded-lg shadow-sm">
            <option>Today</option>
            <option>This Week</option>
            <option>This Month</option>
            <option>Custom Range</option>
          </select>
          <button className="px-4 py-2 bg-blue-500 text-white rounded-lg shadow">📄 PDF</button>
          <button className="px-4 py-2 bg-green-500 text-white rounded-lg shadow">📊 Excel</button>
        </div>
      </div>

      {/* Daily Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-white p-4 rounded-xl shadow text-center">
          <p className="text-gray-500">Total Orders</p>
          <h2 className="text-2xl font-bold">125</h2>
        </div>
        <div className="bg-white p-4 rounded-xl shadow text-center">
          <p className="text-gray-500">Total Revenue</p>
          <h2 className="text-2xl font-bold">$2,350</h2>
        </div>
        <div className="bg-white p-4 rounded-xl shadow text-center">
          <p className="text-gray-500">Avg. Order Value</p>
          <h2 className="text-2xl font-bold">$18.80</h2>
        </div>
        <div className="bg-white p-4 rounded-xl shadow text-center">
          <p className="text-gray-500">Peak Time</p>
          <h2 className="text-2xl font-bold">7–9 PM</h2>
        </div>
      </div>

      {/* Weekly Trends */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <div className="bg-white p-4 rounded-xl shadow">
          <h3 className="font-semibold mb-4">Orders per Day</h3>
          <BarChart width={400} height={250} data={weeklyOrders}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="day" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Bar dataKey="orders" fill="#3b82f6" />
          </BarChart>
        </div>

        <div className="bg-white p-4 rounded-xl shadow">
          <h3 className="font-semibold mb-4">Revenue Trend</h3>
          <LineChart width={400} height={250} data={weeklyOrders}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="day" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Line type="monotone" dataKey="revenue" stroke="#22c55e" />
          </LineChart>
        </div>
      </div>

      {/* Popular Items */}
      <div className="bg-white p-4 rounded-xl shadow mb-8">
        <h3 className="font-semibold mb-4">Popular Items</h3>
        <PieChart width={400} height={250}>
          <Pie
            data={popularItems}
            cx="50%"
            cy="50%"
            labelLine={false}
            label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
            outerRadius={100}
            dataKey="value"
          >
            {popularItems.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip />
        </PieChart>
      </div>

      {/* Staff Performance */}
      <div className="bg-white p-4 rounded-xl shadow">
        <h3 className="font-semibold mb-4">Staff Performance</h3>
        <table className="w-full border-collapse">
          <thead>
            <tr className="bg-gray-200 text-left">
              <th className="p-2">Staff</th>
              <th className="p-2">Orders Taken</th>
              <th className="p-2">Revenue</th>
            </tr>
          </thead>
          <tbody>
            {staffPerformance.map((staff, i) => (
              <tr key={i} className="border-b">
                <td className="p-2">{staff.staff}</td>
                <td className="p-2">{staff.orders}</td>
                <td className="p-2">${staff.revenue}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
