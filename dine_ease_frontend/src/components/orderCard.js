import { timeAgo } from "../utility/timeAgo";

export default function OrderCard({ order, updateStatus }) {
    const statusConfig = {
        NEW: { label: "Pending", color: "bg-yellow-100 text-yellow-700" },
        PROCESSING: { label: "In Preparation", color: "bg-blue-100 text-blue-700" },
        READY: { label: "Ready", color: "bg-green-100 text-green-700" },
        SERVED: { label: "Served", color: "bg-gray-200 text-gray-700" },
        CANCELLED: { label: "Cancelled", color: "bg-red-100 text-red-700" },
    };

    const currentStatus = statusConfig[order.status] || { label: order.status, color: "bg-gray-100" };

    return (
        <div className="bg-white shadow rounded-xl p-4 border hover:shadow-lg transition-shadow duration-200">
            {/* Header */}
            <div className="flex justify-between items-center mb-2">
                <div>
                    <p className="font-semibold">Table: {order.table?.tableNumber}</p>
                    <p className="text-sm text-gray-500">
                     {order.createdAt ? timeAgo(new Date(order.createdAt)) : "Just now"}
                    </p>
                </div>
                <span className={`px-3 py-1 text-sm rounded-full ${currentStatus.color}`}>
                    {currentStatus.label}
                </span>
            </div>

            {/* Items */}
            <div className="mb-3">
                {order.items.map((item) => (
                    <div key={item.id} className="flex justify-between text-sm">
                        <p>
                            {item.quantity} × {item.menuItem.title}   
                        </p>
                    </div>
                ))}
            </div>

            {/* Total */}
            <p className="font-semibold mb-3">Total: Rs. {order.total}</p>

            {/* Actions */}
            <div className="flex gap-2">
                {order.status === "NEW" && (
                    <button
                        onClick={() => updateStatus(order.id, "CANCELLED")}
                        className="px-3 py-1 bg-red-500 text-white rounded-lg text-sm"
                    >
                        Cancel
                    </button>
                )}
                {order.status === "READY" && (
                    <button
                        onClick={() => updateStatus(order.id, "SERVED")}
                        className="px-3 py-1 bg-green-500 text-white rounded-lg text-sm"
                    >
                        Mark Served
                    </button>
                )}
                {order.status === "SERVED" && (
                    <button
                        onClick={() => updateStatus(order.id, "SETTLED")}
                        className="px-3 py-1 bg-indigo-500 text-white rounded-lg text-sm"
                    >
                        Settle Payment
                    </button>
                )}
            </div>
        </div>



    );
}