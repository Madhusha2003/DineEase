import { timeAgo } from "../utility/timeAgo";

export default function KitchenCard({ order, updateStatus, cancelOrder }) {
    const statusConfig = {
        NEW: {
            label: "New",
            color: "bg-blue-50 text-blue-800",
            borderColor: "border-blue-400",
            badge: "bg-blue-200 text-blue-900",
        },
        PROCESSING: {
            label: "Processing",
            color: "bg-yellow-50 text-yellow-800",
            borderColor: "border-yellow-400",
            badge: "bg-yellow-200 text-yellow-900",
        },
        READY: {
            label: "Ready",
            color: "bg-green-50 text-green-800",
            borderColor: "border-green-400",
            badge: "bg-green-200 text-green-900",
        },
    };

    const currentStatus = statusConfig[order.status] || { 
        label: order.status, 
        color: "bg-gray-50", 
        borderColor: "border-gray-300",
        badge: "bg-gray-200" 
    };

    return (
        <div
            className={`flex flex-col h-full rounded-xl shadow p-4 border-t-8 transition-all duration-200 hover:shadow-lg 
            ${currentStatus.color} ${currentStatus.borderColor} 
            `}
        >
            {/* Header */}
            <div className="flex justify-between items-start mb-1">
                <div>
                    <p className="font-bold text-lg text-gray-900">Table {order.table?.tableNumber}</p>
                    <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Order #{order.id}</p>
                </div>
                <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${currentStatus.badge}`}>
                    {currentStatus.label}
                </span>
            </div>

            {/* Time Info */}
            <div className="text-xs text-gray-500 mb-4 italic">
                {timeAgo(new Date(order.createdAt))}
            </div>

            {/* Items - Grid Layout */}
            <div className="flex-grow mb-6">
                {order.items.map((item) => (
                    <div key={item.id} className="grid grid-cols-[30px_1fr] gap-1 items-baseline text-md mb-2">
                        <span className="font-black text-gray-900">{item.quantity}x</span>
                        <span className="text-gray-800 font-medium leading-tight">{item.menuItem.title}</span>
                    </div>
                ))}
            </div>

            {/* Actions  */}
            <div className="mt-auto pt-3 border-t border-black/5 flex gap-2">
                {order.status === "NEW" && (
                    <>
                        <button
                            className="flex-1 px-3 py-2 bg-blue-400 hover:bg-blue-500 text-white rounded-lg font-bold text-sm transition-colors"
                            onClick={() => updateStatus(order.id, "PROCESSING")}
                        >
                            Start Prep
                        </button>
                        <button
                            className="px-3 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg font-bold text-sm transition-colors"
                            onClick={() => cancelOrder(order.id)}
                        >
                            Cancel
                        </button>
                    </>
                )}
                
                {order.status === "PROCESSING" && (
                    <button
                        className="w-full px-3 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg font-bold text-sm transition-colors"
                        onClick={() => updateStatus(order.id, "READY")}
                    >
                        Mark Ready
                    </button>
                )}
                
                {order.status === "READY" && (
                    <div className="w-full text-center py-2 bg-white/50 rounded-lg border border-green-200">
                        <p className="text-green-700 text-xs font-bold uppercase tracking-tighter">Waiting for Waiter</p>
                    </div>
                )}
            </div>
        </div>
    );
}