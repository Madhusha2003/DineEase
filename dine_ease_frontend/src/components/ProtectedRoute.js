import React from 'react';
import { Navigate } from 'react-router-dom';
import { hasRole, isAuthenticated } from '../utils/tokenUtils';

/**
 * ProtectedRoute component enforces role-based access control
 * @param {React.Component} Component - Page component to render
 * @param {string|string[]} requiredRoles - Single role or array of roles allowed
 */
const ProtectedRoute = ({ Component, requiredRoles }) => {
  if (!isAuthenticated()) {
    return <Navigate to="/profile" replace />;
  }

  if (!hasRole(requiredRoles)) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-100">
        <div className="bg-white p-8 rounded-xl shadow-lg text-center">
          <h2 className="text-2xl font-semibold text-gray-800 mb-4">Access Denied</h2>
          <p className="text-gray-600 mb-6">You don't have permission to access this page.</p>
          
        </div>
      </div>
    );
  }

  return <Component />;
};

export default ProtectedRoute;
