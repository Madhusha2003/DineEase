import { timeAgo } from "../utility/timeAgo";

export default function OrderCard({ order, updateStatus }) {
    const statusColors = {
        Pending: "bg-yellow-100 text-yellow-700",
        "In Preparation": "bg-blue-100 text-blue-700",
        Ready: "bg-green-100 text-green-700",
        Served: "bg-gray-200 text-gray-700",
        Cancelled: "bg-red-100 text-red-700",
    };

    return (
        <div className="bg-white shadow rounded-xl p-4 border hover:shadow-lg transition-shadow duration-200">
            {/* Header */}
            <div className="flex justify-between items-center mb-2">
                <div>
                    <p className="font-semibold">Table: {order.table}</p>
                    <p className="text-sm text-gray-500">{timeAgo(order.time)}</p>
                </div>
                <span
                    className={`px-3 py-1 text-sm rounded-full ${statusColors[order.status]}`}
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
                {order.status === "Ready" && (
                    <button
                        onClick={() => updateStatus(order.id, "Served")}
                        className="px-3 py-1 bg-green-500 text-white rounded-lg text-sm"
                    >
                        Mark Served
                    </button>
                )}
                {order.status === "Pending" && (
                    <button
                        onClick={() => updateStatus(order.id, "Cancelled")}
                        className="px-3 py-1 bg-red-500 text-white rounded-lg text-sm"
                    >
                        Cancel
                    </button>
                )}
                {order.status === "Served" && (
                    <button
                        onClick={() => updateStatus(order.id, "Settled")}
                        className="px-3 py-1 bg-indigo-500 text-white rounded-lg text-sm"
                    >
                        Settle Payment
                    </button>
                )}
            </div>
        </div>



    );
}