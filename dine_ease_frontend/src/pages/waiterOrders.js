import { useState, useEffect } from "react";
import OrderCard from "../components/orderCard";

const API_URL = "http://localhost:3001/api";

export default function WaiterOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // 1. Fetch orders from API
  useEffect(() => {
    const fetchOrders = async () => {
      try {
        setLoading(true);
        const response = await fetch(`${API_URL}/orders`);
        if (!response.ok) throw new Error("Failed to fetch orders");
        const data = await response.json();
        setOrders(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchOrders();
  }, []);

  // Optimized Update Status Function
  const updateStatus = async (id, newStatus) => {
    try {
      let response;
      // Note: Backend uses Uppercase Enums (CANCELLED, SETTLED, etc.)
      if (newStatus === "CANCELLED" || newStatus === "SETTLED") {
        response = await fetch(`${API_URL}/orders/${id}`, {
          method: "DELETE",
        });
        // need to add a API to add cancelled orders to new table also settled
       // response = await fetch
      } else {
        response = await fetch(`${API_URL}/orders/${id}/status`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ status: newStatus }),
        });
      }

      if (!response.ok) throw new Error("Action failed on server");

      // Update Local State
      if (newStatus === "CANCELLED" || newStatus === "SETTLED") {
        setOrders((prev) => prev.filter((order) => order.id !== id));
      } else {
        setOrders((prev) =>
          prev.map((order) =>
            order.id === id ? { ...order, status: newStatus } : order
          )
        );
      }
    } catch (err) {
      console.error(err);
      alert("Error: " + err.message);
    }
  };

  //Sorting Logic 
  const statusPriority = {
    NEW: 1,
    PROCESSING: 2,
    READY: 3,
    SERVED: 4,
  };

  const sortedOrders = [...orders].sort((a, b) => {
    if (statusPriority[a.status] !== statusPriority[b.status]) {
      return (statusPriority[a.status] || 99) - (statusPriority[b.status] || 99);
    } else {
      // Prisma uses 'createdAt'
      return new Date(a.createdAt) - new Date(b.createdAt);
    }
  });

  // Handle Loading and Error views
  if (loading) return <div className="p-6 text-center text-gray-500">Loading orders...</div>;
  if (error) return <div className="p-6 text-center text-red-500 font-bold">Error: {error}</div>;

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Waiter POS – Orders</h1>
        <span className="bg-indigo-100 text-indigo-700 px-3 py-1 rounded-full text-sm font-medium">
          {orders.length} Active Orders
        </span>
      </div>

      {sortedOrders.length === 0 ? (
        <div className="bg-white p-10 rounded-xl border text-center text-gray-400">
          No active orders found.
        </div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {sortedOrders.map((order) => (
            <OrderCard key={order.id} order={order} updateStatus={updateStatus} />
          ))}
        </div>
      )}
    </div>
  );
}