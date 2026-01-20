import React, { useState, useEffect } from 'react';

// A modal form for adding/editing staff members
const StaffForm = ({ staffMember, onSave, onCancel }) => {
  const getInitialState = () => ({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: 'WAITER', // Default to a non-admin role
    isActive: true,
  });

  const [formData, setFormData] = useState(getInitialState());

  const isEditing = !!staffMember;

  useEffect(() => {
    if (isEditing) {
      setFormData({
        id: staffMember.id,
        name: staffMember.name || '',
        email: staffMember.email || '',
        password: '', // Password fields are for entering a new password
        confirmPassword: '',
        role: staffMember.role || 'WAITER',
        isActive: typeof staffMember.isActive === 'boolean' ? staffMember.isActive : true,
      });
    } else {
      // Reset for "Add New"
      setFormData(getInitialState());
    }
  }, [staffMember, isEditing]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.name || !formData.email) {
      alert('Name and Email are required.');
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      alert('Passwords do not match.');
      return;
    }

    if (!isEditing && !formData.password) {
      alert('Password is required for new staff members.');
      return;
    }

    const { confirmPassword, ...dataToSave } = formData;

    if (isEditing && !dataToSave.password) {
      delete dataToSave.password;
    }

    onSave(dataToSave);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
      <div className="bg-white p-6 rounded-lg shadow-xl w-full max-w-md">
        <h2 className="text-2xl font-bold mb-4">{isEditing ? 'Edit Staff Member' : 'Add New Staff Member'}</h2>
        <form onSubmit={handleSubmit}>
          <div className="space-y-4">
            <input name="name" value={formData.name} onChange={handleChange} placeholder="Full Name" className="w-full p-2 border rounded" required />
            <input name="email" type="email" value={formData.email} onChange={handleChange} placeholder="Email" className="w-full p-2 border rounded" required />
            <input name="password" type="password" value={formData.password} onChange={handleChange} placeholder={isEditing ? "New Password (optional)" : "Password"} className="w-full p-2 border rounded" required={!isEditing} />
            <input name="confirmPassword" type="password" value={formData.confirmPassword} onChange={handleChange} placeholder="Confirm Password" className="w-full p-2 border rounded" required={!isEditing || !!formData.password} />
            <select name="role" value={formData.role} onChange={handleChange} className="w-full p-2 border rounded">
              <option value="ADMIN">Admin</option>
              <option value="WAITER">Waiter</option>
              <option value="KITCHENSTAFF">Kitchen Staff</option>
            </select>
            <label className="flex items-center gap-2">
              <input name="isActive" type="checkbox" checked={formData.isActive} onChange={handleChange} className="h-5 w-5" />
              <span>Account is Active</span>
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

export default StaffForm;