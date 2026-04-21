import React, { useState, useEffect } from 'react';
import { getTodayRange, getThisWeekRange, getThisYearRange } from '../utils/dateUtils';
import API_URL from "../config/api";
import { notify } from '../utils/notify';
import {useConfirm} from '../hooks/useConfirm';


export default function OrderManagement() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [statusFilter, setStatusFilter] = useState('ALL'); // ALL, PAID, CANCELLED
  const [dateFilter, setDateFilter] = useState('ALL'); // ALL, TODAY, WEEK, YEAR

  const {confirm, ConfirmUI} = useConfirm(null);
  // Helper function to get date range based on filter
  const getDateRange = (filterType) => {
    switch (filterType) {
      case 'TODAY':
        return getTodayRange();
      case 'WEEK':
        return getThisWeekRange();
      case 'YEAR':
        return getThisYearRange();
      case 'ALL':
      default:
        return { start: null, end: null };
    }
  };

  const fetchOrders = async () => {
    setLoading(true);
    setError(null); // Reset error on new fetch
    try {
      // Fetch all paid and cancelled orders for the management view
      const response = await fetch(`${API_URL}/orders?statuses=PAID,CANCELLED`);
      if (!response.ok) throw new Error('Failed to fetch historical orders.');
      const data = await response.json();
      // Sort by most recent first
      setOrders(data.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)));
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const handleDeleteAll = async () => {
    const ok = await confirm("Confirm Deletion", "Are you sure you want to delete ALL historical (Paid and Cancelled) orders? This action cannot be undone.");
    if (!ok) {
      return;
    }

    try {
      const response = await fetch(`${API_URL}/orders/historical`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to delete historical orders.');
      }
      
      const result = await response.json();
      notify.success(result.message || 'Historical orders deleted successfully!');
      fetchOrders(); // Refresh the list, which should now be empty
    } catch (err) {
      notify.error(`Error: ${err.message}`);
    }
  };

  const filteredOrders = orders.filter(order => {
    // Status filter
    if (statusFilter !== 'ALL' && order.status !== statusFilter) {
      return false;
    }

    // Date range filter
    const { start, end } = getDateRange(dateFilter);
    if (start && end) {
      const orderDate = new Date(order.createdAt);
      if (orderDate < start || orderDate > end) {
        return false;
      }
    }

    return true;
  });

  if (loading) return <div className="p-8 text-center">Loading order history...</div>;
  if (error) return <div className="p-8 text-center text-red-500">Error: {error}</div>;

  return (
    <div className="p-3 md:p-12 min-h-screen">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Order History</h1>
        <div className="flex items-center gap-4">
            {/* Date Range Filter Dropdown */}
            <select 
              value={dateFilter} 
              onChange={(e) => setDateFilter(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg bg-white text-gray-700 hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="ALL">All Time</option>
              <option value="TODAY">Today</option>
              <option value="WEEK">This Week</option>
              <option value="YEAR">This Year</option>
            </select>

            {/* Status Filter buttons */}
            <div className="flex gap-2">
                <button onClick={() => setStatusFilter('ALL')} className={`px-4 py-2 rounded-lg transition-colors ${statusFilter === 'ALL' ? 'bg-blue-500 text-white shadow' : 'bg-gray-200 hover:bg-gray-300'}`}>All</button>
                <button onClick={() => setStatusFilter('PAID')} className={`px-4 py-2 rounded-lg transition-colors ${statusFilter === 'PAID' ? 'bg-green-500 text-white shadow' : 'bg-gray-200 hover:bg-gray-300'}`}>Paid</button>
                <button onClick={() => setStatusFilter('CANCELLED')} className={`px-4 py-2 rounded-lg transition-colors ${statusFilter === 'CANCELLED' ? 'bg-red-500 text-white shadow' : 'bg-gray-200 hover:bg-gray-300'}`}>Cancelled</button>
            </div>
            {/* Delete Button */}
            <button 
                onClick={handleDeleteAll} 
                className="px-4 py-2 bg-red-600 text-white rounded-lg shadow hover:bg-red-700 disabled:bg-red-400 disabled:cursor-not-allowed"
                disabled={orders.length === 0}
                title={orders.length === 0 ? "No orders to delete" : "Delete all historical orders"}>
                Delete All
            </button>
        <ConfirmUI />
        </div>
      </div>

      <div className="bg-white shadow-md rounded-lg overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Order ID</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Table</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Customer</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredOrders.length > 0 ? (
              filteredOrders.map(order => (
                <tr key={order.id}>
                  <td className="px-6 py-4 whitespace-nowrap"><div className="text-sm font-medium text-gray-900">#{order.id}</div></td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{new Date(order.createdAt).toLocaleString()}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{order.table?.tableNumber || 'N/A'}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{order.customerName || 'N/A'}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">Rs. {order.total.toFixed(2)}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          order.status === 'PAID' 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-red-100 text-red-800'
                      }`}>
                          {order.status}
                      </span>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="6" className="text-center p-8 text-gray-500">
                  No orders match the current filter.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}