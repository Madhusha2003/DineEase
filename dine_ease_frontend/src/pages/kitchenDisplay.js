import { useState, useEffect, use } from "react";
import KitchenCard from "../components/kitchenCard";
import API_URL from "../config/api";
import { notify } from "../utils/notify";
import { useConfirm } from "../hooks/useConfirm";


export default function KitchenDisplay() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lastUpdated, setLastUpdated] = useState(new Date());
  const {confirm, ConfirmUI} = useConfirm();

  const fetchOrders = async () => {
    try {
      // Fetch only the orders relevant to the kitchen to improve efficiency.
      const response = await fetch(`${API_URL}/orders?statuses=NEW,PROCESSING,READY`);
      if (!response.ok) throw new Error("Failed to fetch orders");
      const data = await response.json();
      setOrders(data); // No more frontend filtering needed!
      setLastUpdated(new Date());
      setError(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
    const interval = setInterval(fetchOrders, 10000); // Polling every 10s
    return () => clearInterval(interval);
  }, []);

  const updateStatus = async (id, newStatus) => {
    try {
      const response = await fetch(`${API_URL}/orders/${id}/status`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
      if (!response.ok) throw new Error("Action failed");
      fetchOrders(); // Refresh list to ensure sorting is correct
    } catch (err) {
      notify.error("Error: " + err.message);
    }
  };

  const cancelOrder = async (id) => {
    const ok = await confirm("Confirm Cancel", "Are you sure you want to cancel this order?");
    if (!ok) return;
    try {
      await fetch(`${API_URL}/orders/${id}/status`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "CANCELLED" }),
      });
      setOrders((prev) => prev.filter((o) => o.id !== id));
      notify.success("Order cancelled successfully");
    } catch (err) {
      notify.error("Error: " + err.message);
    }
  };

  const statusPriority = { NEW: 1, PROCESSING: 2, READY: 3 };
  const sortedOrders = [...orders].sort((a, b) => {
    const pA = statusPriority[a.status] || 99;
    const pB = statusPriority[b.status] || 99;
    return pA !== pB ? pA - pB : new Date(a.createdAt) - new Date(b.createdAt);
  });

  const statsConfig = {
    NEW: { label: "New Orders", color: "text-blue-600", bg: "bg-blue-100" },
    PROCESSING: { label: "In Prep", color: "text-yellow-500", bg: "bg-yellow-100" },
    READY: { label: "Ready", color: "text-green-600", bg: "bg-green-100" },
  };

  if (loading && orders.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-slate-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="p-12 pt-6 bg-slate-50 min-h-screen">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row justify-between items-end mb-10 gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="relative flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
            </span>
            <h1 className="text-3xl font-black text-slate-800 tracking-tight">KITCHEN LIVE</h1>
          </div>
          <p className="text-slate-500 font-medium">
            Last sync: {lastUpdated.toLocaleTimeString()}
          </p>
        </div>

        {/* Status Summary Counters */}
        <div className="flex gap-4">
          {Object.keys(statsConfig).map((stage) => (
            <div key={stage} className="bg-white px-6 py-3 rounded-2xl shadow-sm border border-slate-200 flex flex-col items-center min-w-[110px]">
              <span className={`text-2xl font-black ${statsConfig[stage].color}`}>
                {orders.filter((o) => o.status === stage).length}
              </span>
              <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
                {statsConfig[stage].label}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Orders Grid */}
      {error ? (
        <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-xl text-center font-bold">
          Connection Error: {error}
        </div>
      ) : sortedOrders.length === 0 ? (
        <div className="bg-white p-20 rounded-3xl border-2 border-dashed border-slate-200 text-center">
          <p className="text-slate-400 text-xl font-medium">All clear! No pending orders.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-6 auto-rows-fr">
          {sortedOrders.map((order) => (
            <KitchenCard
              key={order.id}
              order={order}
              updateStatus={updateStatus}
              cancelOrder={cancelOrder}
            />
          ))}
        </div>
      )}
      <ConfirmUI />
    </div>
  );
}