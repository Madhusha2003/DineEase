import { useState } from "react";
import OrderCard from "../components/orderCard";

export default function WaiterOrders() {
  // Sample orders
  const [orders, setOrders] = useState([
  {
    id: 1,
    table: "T1",
    time: new Date("2025-09-22T14:10:00").getTime(),
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
    time: new Date("2025-09-22T14:12:00").getTime(),
    status: "Ready",
    items: [{ name: "Chicken Curry", qty: 1, note: "Extra spicy" }],
    total: 1500,
  },
  {
    id: 3,
    table: "T4",
    time: new Date("2025-09-22T14:10:00").getTime(),
    status: "Pending",
    items: [{ name: "Biriyani", qty: 1, note: "Extra spicy" }],
    total: 1500,
  },
  {
    id: 4,
    table: "T2",
    time: new Date("2025-09-22T14:15:00").getTime(),
    status: "Pending",
    items: [
      { name: "Noodles", qty: 2, note: "Less oil" },
      { name: "Lemonade", qty: 1, note: "" },
    ],
    total: 1800,
  },
  {
    id: 5,
    table: "T5",
    time: new Date("2025-09-22T14:20:00").getTime(),
    status: "In Preparation",
    items: [
      { name: "Pizza", qty: 1, note: "Extra cheese" },
      { name: "Coke", qty: 2, note: "" },
    ],
    total: 3200,
  },
  {
    id: 6,
    table: "T6",
    time: new Date("2025-09-22T14:05:00").getTime(),
    status: "Ready",
    items: [
      { name: "Burger", qty: 2, note: "" },
      { name: "Fries", qty: 1, note: "Extra salt" },
    ],
    total: 2000,
  },
  {
    id: 7,
    table: "T7",
    time: new Date("2025-09-22T14:25:00").getTime(),
    status: "Cancelled",
    items: [
      { name: "Pasta", qty: 1, note: "" },
      { name: "Iced Coffee", qty: 1, note: "" },
    ],
    total: 1400,
  },
  {
    id: 8,
    table: "T8",
    time: new Date("2025-09-22T14:18:00").getTime(),
    status: "Served",
    items: [
      { name: "Fried Chicken", qty: 1, note: "Spicy" },
      { name: "Masala Chai", qty: 2, note: "" },
    ],
    total: 2300,
  },
  {
    id: 9,
    table: "T9",
    time: new Date("2025-09-22T14:22:00").getTime(),
    status: "Pending",
    items: [{ name: "Salad", qty: 1, note: "No dressing" }],
    total: 800,
  },
]);


  const updateStatus = (id, newStatus) => {
    if (newStatus === "Cancelled" || newStatus === "Settled") {
      // Remove the order completely
      setOrders(orders.filter((order) => order.id !== id));
    } else {
      setOrders(
        orders.map((order) =>
          order.id === id ? { ...order, status: newStatus } : order
        )
      );
    }
  };
  // sort orders
  const statusPriority = {
    Pending: 1,
    "In Preparation": 2,
    Ready: 3,
    Served: 4,
    Cancelled: 5,
  };
  const sortedOrders = [...orders].sort((a, b) => {
    if (statusPriority[a.status] !== statusPriority[b.status]) {
      return statusPriority[a.status] - statusPriority[b.status];
    } else {
      return new Date(a.time) - new Date(b.time);
    }
  });

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <h1 className="text-2xl font-bold mb-6">Waiter POS – Orders</h1>
      <div className="grid md:grid-cols-2 gap-6">
        {sortedOrders.map((order) => (
          <OrderCard key={order.id} order={order} updateStatus={updateStatus} />
        ))}
      </div>
    </div>
  );
}
