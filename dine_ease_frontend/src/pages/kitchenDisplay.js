import { useState } from "react";

export default function KitchenDisplay() {
  const [orders, setOrders] = useState([
    { id: 11613, table: 1, time: "01:50 PM", items: [{ name: "Crispy Chicken Burger", size: "Regular", qty: 2 }, { name: "Coke", size: "Medium", qty: 1 }], status: "new", wait: "5 mins" },
    { id: 11614, table: 2, time: "01:52 PM", items: [{ name: "Cheese Veg Wrap", size: "Regular", qty: 1 }, { name: "Lemonade", size: "Large", qty: 2 }], status: "process", wait: "10 mins" },
    { id: 11615, table: 3, time: "01:53 PM", items: [{ name: "Margherita Pizza", size: "Medium", qty: 1 }, { name: "Pepsi", size: "Medium", qty: 1 }], status: "ready", wait: "0 mins" },
    { id: 11616, table: 4, time: "01:54 PM", items: [{ name: "Veggie Wrap", size: "Regular", qty: 2 }, { name: "Iced Tea", size: "Medium", qty: 1 }], status: "served", wait: "0 mins" },
    { id: 11617, table: 5, time: "01:55 PM", items: [{ name: "Chicken Caesar Salad", size: "Regular", qty: 1 }, { name: "Water", size: "Medium", qty: 2 }], status: "new", wait: "7 mins" },
    { id: 11618, table: 6, time: "01:56 PM", items: [{ name: "BBQ Chicken Pizza", size: "Large", qty: 1 }], status: "process", wait: "12 mins" },
    { id: 11619, table: 7, time: "01:57 PM", items: [{ name: "Paneer Tikka Wrap", size: "Regular", qty: 2 }, { name: "Mango Smoothie", size: "Medium", qty: 1 }], status: "ready", wait: "0 mins" },
    { id: 11620, table: 8, time: "01:58 PM", items: [{ name: "Veg Burger", size: "Regular", qty: 1 }, { name: "Coke", size: "Medium", qty: 1 }], status: "served", wait: "0 mins" },
    { id: 11621, table: 9, time: "01:59 PM", items: [{ name: "Grilled Chicken Sandwich", size: "Regular", qty: 2 }], status: "new", wait: "6 mins" },
    { id: 11622, table: 10, time: "02:00 PM", items: [{ name: "Cheese Pizza", size: "Medium", qty: 1 }, { name: "Orange Juice", size: "Medium", qty: 2 }], status: "process", wait: "8 mins" },
  ]);

  const updateStatus = (id, newStatus) => setOrders(orders.map(o => o.id === id ? { ...o, status: newStatus } : o));
  const cancelOrder = id => setOrders(orders.filter(o => o.id !== id));

  const statusColor = status => {
    switch (status) {
      case "new": return "bg-blue-100 text-blue-800 border-blue-200";
      case "process": return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "ready": return "bg-green-100 text-green-800 border-green-200";
      case "served": return "bg-gray-100 text-gray-600 border-gray-200";
      default: return "bg-gray-50 text-gray-700 border-gray-100";
    }
  };

  return (
    <div className="flex flex-col p-6">
      {/* Status summary counters */}
      <div className="flex flex-wrap gap-6 mb-6">
        {["new", "process", "ready", "served"].map(stage => (
          <div key={stage} className="bg-black text-white text-center px-4 py-2 rounded w-28 shadow">
            <div className="text-2xl font-bold">{orders.filter(o => o.status === stage).length}</div>
            <div className="capitalize">{stage}</div>
          </div>
        ))}
      </div>

      {/* Orders grid */}
      <div className="grid sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {orders.map(order => (
          <div
            key={order.id}
            className={`relative rounded shadow p-4 border-t-4 hover:scale-105 transition-transform duration-200 ${statusColor(order.status)}`}
          >
            <div className="flex justify-between font-semibold mb-2">
              <span>Table {order.table} – Order #{order.id}</span>
              <span className={`capitalize px-2 py-1 rounded text-sm font-bold ${statusColor(order.status)}`}>
                {order.status}
              </span>
            </div>

            <div className="text-sm text-gray-600 mb-2">{order.time} | {order.wait}</div>

            {order.items.map((it, i) => (
              <div key={i} className="text-sm">
                {it.qty}x {it.name} <em className="text-gray-500">{it.size}</em>
              </div>
            ))}

            <div className="flex gap-3 mt-4">
              {order.status === "new" && <button className="px-3 py-1 bg-green-200 text-green-800 rounded" onClick={() => updateStatus(order.id, "process")}>Start</button>}
              {order.status === "process" && <button className="px-3 py-1 bg-green-200 text-green-800 rounded" onClick={() => updateStatus(order.id, "ready")}>Finish</button>}
              {order.status === "ready" && <button className="px-3 py-1 bg-green-200 text-green-800 rounded" onClick={() => updateStatus(order.id, "served")}>Served</button>}
            </div>

            <button
              className="absolute bottom-3 right-3 px-3 py-1 bg-red-200 text-red-800 rounded"
              onClick={() => cancelOrder(order.id)}
            >
              Cancel
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
