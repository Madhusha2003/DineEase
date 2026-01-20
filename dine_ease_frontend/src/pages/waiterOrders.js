import { useState, useEffect } from "react";
import OrderCard from "../components/orderCard";
import API_URL from "../config/api";


export default function WaiterOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lastSync, setLastSync] = useState(new Date());

  const fetchOrders = async () => {
    try {
      const response = await fetch(`${API_URL}/orders`);
      if (!response.ok) throw new Error("Failed to fetch orders");
      const data = await response.json();
      // The backend now returns only active orders by default, so no frontend filtering is needed.
      setOrders(data);
      setLastSync(new Date());
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
    const interval = setInterval(fetchOrders, 5000); // Poll every 5 seconds
    return () => clearInterval(interval);
  }, []);

  const updateStatus = async (id, newStatus) => {
    try {
      // All status updates (including PAID and CANCELLED) are now PUT requests.
      // This preserves the order for reporting instead of deleting it.
      const response = await fetch(`${API_URL}/orders/${id}/status`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });

      if (!response.ok) throw new Error("Action failed");

      // Immediate local update for better UX
      if (newStatus === "PAID" || newStatus === "CANCELLED") {
        // If an order is paid or cancelled, remove it from the active view.
        setOrders(prev => prev.filter(o => o.id !== id));
      } else {
        // For other status changes (e.g., NEW -> SERVED), refresh the whole list
        // to ensure correct sorting and data.
        fetchOrders();
      }
    } catch (err) {
      alert("Error: " + err.message);
    }
  };

  const statusPriority = { READY: 1, NEW: 2, PROCESSING: 3, SERVED: 4 };

  const sortedOrders = [...orders].sort((a, b) => {
    const pA = statusPriority[a.status] || 99;
    const pB = statusPriority[b.status] || 99;
    return pA !== pB ? pA - pB : new Date(a.createdAt) - new Date(b.createdAt);
  });

  if (loading && orders.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-slate-50">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-600 mb-4"></div>
        <p className="text-slate-500 font-medium">Loading active orders...</p>
      </div>
    );
  }

  return (
    <div className="p-8 pt-1 bg-slate-50 min-h-screen">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row justify-between items-end mb-8 gap-4">
        <div className="flex items-center gap-2 mb-1">
          <span className="relative flex h-3 w-3">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3 w-3 bg-blue-500"></span>
          </span>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight flex items-center gap-3"> WAITER TERMINAL</h1>
        </div>

        {/* Quick Stats Summary */}
        <div className="flex gap-3">
          <div className="bg-green-100 border border-green-200 px-5 py-2 rounded-2xl flex flex-col items-center">
            <span className="text-xl font-black text-green-700">
              {orders.filter(o => o.status === "READY").length}
            </span>
            <span className="text-[10px] font-bold uppercase text-green-600 tracking-wider">To Serve</span>
          </div>
          <div className="bg-indigo-100 border border-indigo-200 px-5 py-2 rounded-2xl flex flex-col items-center">
            <span className="text-xl font-black text-indigo-700">
              {orders.length}
            </span>
            <span className="text-[10px] font-bold uppercase text-indigo-600 tracking-wider">Active</span>
          </div>
        </div>
      </div>

      {/* Error State */}
      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-700 rounded-xl flex justify-between items-center">
          <span className="font-medium">Connection issue: {error}</span>
          <button onClick={fetchOrders} className="text-xs font-bold underline">RETRY</button>
        </div>
      )}

      {/* Orders Grid */}
      {sortedOrders.length === 0 ? (
        <div className="bg-white p-20 rounded-3xl border-2 border-dashed border-slate-200 text-center">
          <p className="text-slate-400 text-lg font-medium">No active orders right now.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 auto-rows-fr">
          {sortedOrders.map((order) => (
            <OrderCard
              key={order.id}
              order={order}
              updateStatus={updateStatus}
            />
          ))}
        </div>
      )}
    </div>
  );
}