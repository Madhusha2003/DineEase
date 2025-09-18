import { useState } from "react";

export default function WaiterOrders() {
  // Sample orders
  const [orders, setOrders] = useState([
    {
      id: 1,
      table: "T1",
      time: "5 min ago",
      status: "Served",
      items: [
        { name: "Fried Rice", qty: 2, note: "No onions" },
        { name: "Iced Tea", qty: 1, note: "" },
      ],
      total: 2500,
    },
    {
      id: 2,
      table: "T3",
      time: "12 min ago",
      status: "Ready",
      items: [{ name: "Chicken Curry", qty: 1, note: "Extra spicy" }],
      total: 1500,
    },
    {
      id: 3,
      table: "T4",
      time: "10 min ago",
      status: "Pending",
      items: [{ name: "Biriyani", qty: 1, note: "Extra spicy" }],
      total: 1500,
    },
  ]);

  const updateStatus = (id, newStatus) => {
    setOrders(
      orders.map((order) =>
        order.id === id ? { ...order, status: newStatus } : order
      )
    );
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <h1 className="text-2xl font-bold mb-6">Waiter POS – Orders</h1>

      <div className="grid md:grid-cols-2 gap-6">
        {orders.map((order) => (
          <div
            key={order.id}
            className="bg-white shadow rounded-xl p-4 border"
          >
            {/* Order Header */}
            <div className="flex justify-between items-center mb-2">
              <div>
                <p className="font-semibold">Table: {order.table}</p>
                <p className="text-sm text-gray-500">{order.time}</p>
              </div>
              <span
                className={`px-3 py-1 text-sm rounded-full ${
                  order.status === "Pending"
                    ? "bg-yellow-100 text-yellow-700"
                    : order.status === "In Preparation"
                    ? "bg-blue-100 text-blue-700"
                    : order.status === "Ready"
                    ? "bg-green-100 text-green-700"
                    : "bg-gray-200 text-gray-700"
                }`}
              >
                {order.status}
              </span>
            </div>

            {/* Items */}
            <div className="mb-3">
              {order.items.map((item, i) => (
                <div key={i} className="flex justify-between text-sm">
                  <p>
                    {item.qty} × {item.name}
                    {item.note && (
                      <span className="text-gray-500"> ({item.note})</span>
                    )}
                  </p>
                </div>
              ))}
            </div>

            {/* Total */}
            <p className="font-semibold mb-3">Total: Rs. {order.total}</p>

            {/* Actions */}
            <div className="flex gap-2">
              {order.status == "Ready" && (
                <button
                  onClick={() => updateStatus(order.id, "Served")}
                  className="px-3 py-1 bg-green-500 text-white rounded-lg text-sm"
                >
                  Mark Served
                </button>
              )}
              {order.status == "Pending" && (
                <button
                  onClick={() => updateStatus(order.id, "Cancelled")}
                  className="px-3 py-1 bg-red-500 text-white rounded-lg text-sm"
                >
                  Cancel
                </button>
              )}
              {order.status === "Served" && (
                <button
                  onClick={() => alert("Payment settled!")}
                  className="px-3 py-1 bg-indigo-500 text-white rounded-lg text-sm"
                >
                  Settle Payment
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
