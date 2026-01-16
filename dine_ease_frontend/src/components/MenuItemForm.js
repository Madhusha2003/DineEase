import React, { useState } from 'react';

// A modal form for adding/editing menu items
const MenuItemForm = ({ item, onSave, onCancel }) => {
  const [formData, setFormData] = useState(
    item || {
      title: '',
      price: '',
      description: '',
      category: 'food',
      image: '',
      isAvailable: true,
    }
  );

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.title || !formData.price) {
      alert('Title and Price are required.');
      return;
    }
    onSave({
      ...formData,
      price: parseFloat(formData.price) // Ensure price is a number
    });
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
      <div className="bg-white p-6 rounded-lg shadow-xl w-full max-w-md">
        <h2 className="text-2xl font-bold mb-4">{item ? 'Edit Menu Item' : 'Add New Menu Item'}</h2>
        <form onSubmit={handleSubmit}>
          <div className="space-y-4">
            <input name="title" value={formData.title} onChange={handleChange} placeholder="Title" className="w-full p-2 border rounded" required />
            <input name="price" type="number" step="0.01" value={formData.price} onChange={handleChange} placeholder="Price" className="w-full p-2 border rounded" required />
            <textarea name="description" value={formData.description} onChange={handleChange} placeholder="Description" className="w-full p-2 border rounded" />
            <select name="category" value={formData.category} onChange={handleChange} className="w-full p-2 border rounded">
              <option value="food">Food</option>
              <option value="drink">Drink</option>
              <option value="dessert">Dessert</option>
            </select>
            <input name="image" value={formData.image} onChange={handleChange} placeholder="Image URL" className="w-full p-2 border rounded" />
            <label className="flex items-center gap-2">
              <input name="isAvailable" type="checkbox" checked={formData.isAvailable} onChange={handleChange} className="h-5 w-5" />
              <span>Available on menu</span>
            </label>
          </div>
          <div className="flex justify-end gap-4 mt-6">
            <button type="button" onClick={onCancel} className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400">Cancel</button>
            <button type="submit" className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600">Save</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default MenuItemForm;