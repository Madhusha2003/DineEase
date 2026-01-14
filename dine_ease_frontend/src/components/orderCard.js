import { timeAgo } from "../utility/timeAgo";

export default function OrderCard({ order, updateStatus }) {
    const statusConfig = {
        NEW: { label: "Pending", color: "bg-yellow-100 text-yellow-700", borderColor:"border-yellow-400"},
        PROCESSING: { label: "In Preparation", color: "bg-blue-100 text-blue-700", borderColor:"border-blue-400" },
        READY: { label: "Ready", color: "bg-green-100 text-green-700", borderColor:"border-green-400" },
        SERVED: { label: "Served", color: "bg-gray-200 text-gray-700", borderColor:"border-gray-400" },
        CANCELLED: { label: "Cancelled", color: "bg-red-100 text-red-700" },
    };

    const currentStatus = statusConfig[order.status] || { label: order.status, color: "bg-gray-100" };

    return (
    <div
            className={`flex flex-col h-full rounded-xl shadow p-4 border-t-8 transition-all duration-200 hover:shadow-lg
             ${currentStatus.borderColor} 
            `}
        >
    {/* Header */}
    <div className="flex justify-between items-start mb-2">
        <div>
            <p className="font-bold text-lg text-gray-900">Table {order.table?.tableNumber}</p>
            <p className="text-[12px] font-bold text-gray-800 tracking-widest">{order.customerName.toUpperCase()}</p>
            <p className="mt-1 text-[10px] font-bold text-gray-500 uppercase tracking-widest">Order #{order.id}</p>
            <p className="text-xs text-gray-500 mb-4 italic">
                {order.createdAt ? timeAgo(new Date(order.createdAt)) : "Just now"}
            </p>
        </div>
        <span className={`px-3 py-1 text-xs rounded-full font-bold  ${currentStatus.color}`}>
            {currentStatus.label}
        </span>
    </div>

    {/* Items Section */}
<div className="mb-4 justify-center px-2 self-center">
    {order.items.map((item) => (
        <div key={item.id} className="grid grid-cols-[35px_1fr] items-baseline text-md mb-1">
            {/* Quantity column */}
            <span className="text-gray-800 font-medium">
                {item.quantity} <span className="text-md">×</span>
            </span>
            
            {/* Item Name column */}
            <span className="text-gray-900 font-medium truncate">
                {item.menuItem.title}
            </span>
        </div>
    ))}
</div>

    {/* Bottom Footer Section */}
    <div className="flex justify-between items-center mt-auto pt-3 border-t">
        <p className="font-bold text-gray-800">Total: Rs. {order.total}</p>
        
        <div className="flex gap-2">
            {order.status === "NEW" && (
                <button
                    onClick={() => updateStatus(order.id, "CANCELLED")}
                    className="px-4 py-1.5 bg-red-500 hover:bg-red-600 text-white rounded-lg text-sm font-medium transition-colors"
                >
                    Cancel
                </button>
            )}
            {order.status === "READY" && (
                <button
                    onClick={() => updateStatus(order.id, "SERVED")}
                    className="px-4 py-1.5 bg-green-500 hover:bg-green-600 text-white rounded-lg text-sm font-medium transition-colors"
                >
                    Mark Served
                </button>
            )}
            {order.status === "SERVED" && (
                <button
                    onClick={() => updateStatus(order.id, "SETTLED")}
                    className="px-4 py-1.5 bg-indigo-500 hover:bg-indigo-600 text-white rounded-lg text-sm font-medium transition-colors"
                >
                    Settle Payment
                </button>
            )}
        </div>
    </div>
</div>



    );
}