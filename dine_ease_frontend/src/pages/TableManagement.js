import React, { useState, useEffect, useCallback } from 'react';
import { FaPlus, FaTrash } from 'react-icons/fa';

const API_URL = "http://localhost:3001/api";

// A modal form for adding a new table
const AddTableForm = ({ onSave, onCancel }) => {
    const [tableNumber, setTableNumber] = useState(''); // State for table number
    const [capacity, setCapacity] = useState(4); // State for capacity, default to 4

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!tableNumber.trim()) {
            alert('Table number is required.');
            return;
        }
        onSave(tableNumber.trim(), capacity); // Pass both tableNumber and capacity
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
            <div className="bg-white p-6 rounded-lg shadow-xl w-full max-w-sm">
                <h2 className="text-2xl font-bold mb-4">Add New Table</h2>
                <form onSubmit={handleSubmit}>
                    <p className='text-md font-semibold mb-2'>Table Number</p>
                    <input
                        name="tableNumber"
                        value={tableNumber}
                        onChange={(e) => setTableNumber(e.target.value)}
                        placeholder=""
                        className="w-full p-2 border rounded mb-4"
                        required
                        autoFocus
                    />
                    <p className='text-md font-semibold mb-2'>Max Number of Guests</p>
                    <input
                        type="number"
                        name="capacity"
                        value={capacity}
                        onChange={(e) => setCapacity(parseInt(e.target.value) || 1)} // Ensure it's a number, min 1
                        placeholder=""
                        className="w-full p-2 border rounded mb-4"
                        min="1"
                        
                    />
                    <div className="flex justify-end gap-4">
                        <button type="button" onClick={onCancel} className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400">Cancel</button>
                        <button type="submit" className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600">Save Table</button>
                    </div>
                </form>
            </div>
        </div>
    );
};

// The main page component
export default function TableManagement() {
    const [tables, setTables] = useState([]);
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [isFormOpen, setIsFormOpen] = useState(false);

    const fetchData = useCallback(async () => {
        try {
            const [tablesRes, ordersRes] = await Promise.all([
                fetch(`${API_URL}/tables`),
                fetch(`${API_URL}/orders`) // Fetches active orders by default
            ]);

            if (!tablesRes.ok || !ordersRes.ok) {
                throw new Error('Failed to fetch data. Please try again.');
            }

            const tablesData = await tablesRes.json();
            const ordersData = await ordersRes.json();

            setTables(tablesData.sort((a, b) => a.id - b.id));
            setOrders(ordersData);
            setError(null);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchData();
        const interval = setInterval(fetchData, 10000); // Refresh every 10 seconds
        return () => clearInterval(interval);
    }, [fetchData]);

    const handleAddTable = async (tableNumber, capacity) => {
        try {
            const response = await fetch(`${API_URL}/tables`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ tableNumber, capacity }),
            });
            
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Failed to add table.');
            }

            alert(`Table ${tableNumber} added successfully!`);
            setIsFormOpen(false);
            fetchData(); // Refresh data
        } catch (err) {
            alert(err.message);
        }
    };

    const handleDeleteTable = async (tableId) => {
        const table = tables.find(t => t.id === tableId);
        if (!table) return;

        if (!window.confirm(`Are you sure you want to delete Table ${table.tableNumber}? This cannot be undone.`)) {
            return;
        }

        try {
            const response = await fetch(`${API_URL}/tables/${tableId}`, {
                method: 'DELETE',
            });

            if (response.status === 204) {
                alert(`Table ${table.tableNumber} deleted successfully!`);
                fetchData(); // Refresh data
            } else {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Failed to delete table.');
            }
        } catch (err) {
            alert(err.message);
        }
    };

    // Map orders to tables for easy lookup
    const ordersByTableId = orders.reduce((acc, order) => {
        acc[order.tableId] = acc[order.tableId] || [];
        // Ensure order.numberOfGuests is treated as a number, default to 1 if not present
        acc[order.tableId].push(order);
        return acc;
    }, {});

    if (loading) return <div className="p-8 text-center text-lg font-medium">Loading Restaurant View...</div>;
    if (error) return <div className="p-8 text-center text-red-500 bg-red-50 rounded-lg">Error: {error}</div>;

    return (
        <div className="p-8 bg-gray-50 min-h-screen">
            <div className="flex justify-between items-center mb-8">
                <h1 className="text-3xl font-bold text-gray-800">Restaurant Overview</h1>
                <button 
                    onClick={() => setIsFormOpen(true)} 
                    className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg shadow hover:bg-blue-600 transition-colors"
                >
                    <FaPlus size={14} />
                    <span>Add Table</span>
                </button>
            </div>

            {isFormOpen && <AddTableForm onSave={handleAddTable} onCancel={() => setIsFormOpen(false)} />}

            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-6">
                {tables.map(table => {
                    const activeOrdersForTable = ordersByTableId[table.id] || [];
                    const totalGuestsAtTable = activeOrdersForTable.reduce((sum, order) => sum + (order.numberOfGuests || 1), 0);
                    const isOccupied = totalGuestsAtTable > 0;
                    const isFull = totalGuestsAtTable === table.capacity || totalGuestsAtTable > table.capacity;

                    return (
                        <div 
                            key={table.id} 
                            className={`rounded-xl shadow-md p-4 flex flex-col justify-between transition-all border-l-8
                                ${isOccupied 
                                    ? (isFull ? 'bg-red-50 border-red-400' : 'bg-orange-50 border-orange-400')
                                    : 'bg-white border-green-400' // Available
                                }`
                            }
                        >
                            <div className="flex justify-between items-start">
                                <div>
                                    <h2 className={`font-black text-2xl 
                                        ${isFull ? 'text-red-800' : (isOccupied ? 'text-orange-800' : 'text-gray-800')}
                                    `}>
                                        Table {table.tableNumber}
                                    </h2>
                                    <p className={`text-sm font-bold uppercase tracking-wider ${isOccupied ? 'text-orange-600' : 'text-green-600'}`}>
                                        {isOccupied ? isFull ? 'Full' : 'Occupied' : 'Available'}
                                    </p>
                                </div>
                                {!isOccupied && (
                                    <button
                                        onClick={() => handleDeleteTable(table.id)}
                                        title={`Delete Table ${table.tableNumber}`}
                                        className="text-gray-400 hover:text-red-600 transition-colors p-1 -mr-1 -mt-1"
                                    >
                                        <FaTrash />
                                    </button>
                                )}
                            </div>
                            {isOccupied && (
                                <div className="mt-4 pt-3 border-t border-orange-200 space-y-2 text-sm">
                                    <p className={`font-bold ${isFull ? 'text-red-700' : 'text-orange-700'}`}>
                                        Guests: {totalGuestsAtTable} / {table.capacity}
                                    </p>
                                    {activeOrdersForTable.map(order => (
                                        <div key={order.id}>
                                            <div className="flex justify-between items-baseline text-xs">
                                                <p className="text-xs font-bold text-orange-900">Order #{order.id}</p>
                                                <span className="px-2 py-0.5 text-[10px] font-semibold rounded-full bg-orange-200 text-orange-800">{order.status}</span>
                                            </div>
                                            <p className="text-lg font-semibold text-orange-900">Rs. {order.total.toFixed(2)}</p>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>
        </div>
    );
}