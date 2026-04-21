import React, { useState, useEffect } from 'react';
import MenuItemForm from '../components/MenuItemForm';
import API_URL from "../config/api";
import { notify } from '../utils/notify';
import { useConfirm } from '../hooks/useConfirm';


export default function MenuManagement() {
  const [menuItems, setMenuItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const {confirm, ConfirmUI} = useConfirm();

  const fetchMenuItems = async () => {
    setLoading(true);
    try {
      // Fetch all items (including unavailable ones) for the management view
      const response = await fetch(`${API_URL}/menu-items?showAll=true`);
      if (!response.ok) throw new Error('Failed to fetch menu items.');
      const data = await response.json();
      setMenuItems(data.sort((a, b) => a.id - b.id));
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMenuItems();
  }, []);

  const handleSave = async (itemData) => {
    const isEditing = !!itemData.id;
    const url = isEditing ? `${API_URL}/menu-items/${itemData.id}` : `${API_URL}/menu-items`;
    const method = isEditing ? 'PUT' : 'POST';

    try {
      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(itemData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `Failed to ${isEditing ? 'update' : 'create'} item.`);
      }

      notify.success(`Item ${isEditing ? 'updated' : 'created'} successfully!`);
      setIsFormOpen(false);
      fetchMenuItems();
    } catch (err) {
      notify.error(err.message);
    }
  };

  const handleDelete = async (itemId) => {
    const ok = await confirm("Confirm Delete", "Are you sure you want to delete this item?");
    if (!ok) return;

    try {
      const response = await fetch(`${API_URL}/menu-items/${itemId}`, { method: 'DELETE' });
      
      // Handle 204 No Content (success)
      if (response.status === 204) {
        notify.success('Item deleted successfully!');
        fetchMenuItems();
        return;
      }

      // Handle any other status (error)
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to delete item.');
      }
    } catch (err) {
      notify.error(err.message);
    }
  };

  if (loading) return <div className="p-8 text-center">Loading menu...</div>;
  if (error) return <div className="p-8 text-center text-red-500">Error: {error}</div>;

  return (
    <div className="p-3 md:p-12 min-h-screen">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Menu Management</h1>
        <button onClick={() => setIsFormOpen(true)} className="px-4 py-2 bg-green-500 text-white rounded-lg shadow hover:bg-green-600">Add New Item</button>
      </div>

      {isFormOpen && <MenuItemForm item={editingItem} onSave={handleSave} onCancel={() => { setIsFormOpen(false); setEditingItem(null); }} />}

      <div className="bg-white shadow-md rounded-lg overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Item</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Price</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {menuItems.map(item => (
              <tr key={item.id}>
                <td className="px-6 py-4"><div className="text-sm font-medium text-gray-900">{item.title}</div></td>
                <td className="px-6 py-4 text-sm text-gray-500">Rs. {item.price.toFixed(2)}</td>
                <td className="px-6 py-4"><span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${item.isAvailable ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>{item.isAvailable ? 'Available' : 'Unavailable'}</span></td>
                <td className="px-6 py-4 text-right text-sm font-medium">
                  <button onClick={() => { setEditingItem(item); setIsFormOpen(true); }} className="text-indigo-600 hover:text-indigo-900 mr-4">Edit</button>
                  <button onClick={() => handleDelete(item.id)} className="text-red-600 hover:text-red-900">Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <ConfirmUI />
    </div>
  );
}