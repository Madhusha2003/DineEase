import React, { useState, useEffect } from 'react';
import StaffForm from '../components/StaffForm'; // Correct import for the new StaffForm

const API_URL = "http://localhost:3001/api";

export default function StaffManagement() {
  const [staff, setStaff] = useState([]); 
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingStaff, setEditingStaff] = useState(null); 

  const fetchStaff = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_URL}/users`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      }); // Fetch users
      if (!response.ok) throw new Error('Failed to fetch staff members.');
      const data = await response.json();
      setStaff(data.sort((a, b) => a.id - b.id)); // Set staff, sorted
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { // Call fetchStaff
    fetchStaff();
  }, []);

  const handleSave = async (staffData) => {
    const isEditing = !!staffData.id;
    const url = isEditing ? `${API_URL}/users/${staffData.id}` : `${API_URL}/users`; // API endpoint for users
    const method = isEditing ? 'PUT' : 'POST';
    const token = localStorage.getItem('token');

    try {
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(staffData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `Failed to ${isEditing ? 'update' : 'create'} staff member.`);
      }

      alert(`Staff member ${isEditing ? 'updated' : 'created'} successfully!`);
      setIsFormOpen(false);
      setEditingStaff(null); // Clear editing staff after save
      fetchStaff(); // Refresh staff list
    } catch (err) {
      alert(err.message);
    }
  };

  const handleDelete = async (staffId) => {
    if (!window.confirm('Are you sure you want to delete this staff member?')) return;

    const token = localStorage.getItem('token');
    try {
      const response = await fetch(`${API_URL}/users/${staffId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` },
      }); // API endpoint for users

      // Handle 204 No Content (success)
      if (response.status === 204) {
        alert('Staff member deleted successfully!');
        fetchStaff(); // Refresh staff list
        return;
      }

      // Handle any other status (error)
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to delete staff member.');
      }
    } catch (err) {
      alert(err.message);
    }
  };

  if (loading) return <div className="p-8 text-center">Loading staff...</div>; // Updated message
  if (error) return <div className="p-8 text-center text-red-500">Error: {error}</div>;

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Staff Management</h1> {/* Updated title */}
        <button onClick={() => { setIsFormOpen(true); setEditingStaff(null); }} className="px-4 py-2 bg-green-500 text-white rounded-lg shadow hover:bg-green-600">Add New Staff Member</button> {/* Updated button text */}
      </div>

      {isFormOpen && <StaffForm staffMember={editingStaff} onSave={handleSave} onCancel={() => { setIsFormOpen(false); setEditingStaff(null); }} />} {/* Pass editingStaff */}

      <div className="bg-white shadow-md rounded-lg overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th> {/* Updated header */}
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Email</th> {/* Updated header */}
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Role</th> {/* Updated header */}
              <th className="px-6 py-3 text-left text-xs font-font-medium text-gray-500 uppercase">Active</th> {/* Updated header */}
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {staff.map(member => ( // Map over staff
              <tr key={member.id}>
                <td className="px-6 py-4"><div className="text-sm font-medium text-gray-900">{member.name}</div></td> {/* Display name */}
                <td className="px-6 py-4 text-sm text-gray-500">{member.email}</td> {/* Display email */}
                <td className="px-6 py-4 text-sm text-gray-500">{member.role}</td> {/* Display role */}
                <td className="px-6 py-4"><span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${member.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>{member.isActive ? 'Yes' : 'No'}</span></td> {/* Display isActive */}
                <td className="px-6 py-4 text-right text-sm font-medium">
                  <button onClick={() => { setEditingStaff(member); setIsFormOpen(true); }} className="text-indigo-600 hover:text-indigo-900 mr-4">Edit</button>
                  <button onClick={() => handleDelete(member.id)} className="text-red-600 hover:text-red-900">Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
