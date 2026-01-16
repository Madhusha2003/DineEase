/**
 * Decode JWT token to extract user role
 * JWT format: header.payload.signature
 */
export const decodeToken = (token) => {
  try {
    if (!token) return null;
    const parts = token.split('.');
    if (parts.length !== 3) return null;
    
    const payload = JSON.parse(atob(parts[1]));
    return payload;
  } catch (error) {
    console.error('Failed to decode token:', error);
    return null;
  }
};

/**
 * Get user role from localStorage token
 */
export const getUserRole = () => {
  const token = localStorage.getItem('token');
  if (!token) return null;
  
  const decoded = decodeToken(token);
  return decoded?.role || null;
};

/**
 * Check if user is authenticated
 */
export const isAuthenticated = () => {
  return localStorage.getItem('token') !== null;
};

/**
 * Check if user has required role
 */
export const hasRole = (requiredRoles) => {
  const userRole = getUserRole();
  if (!userRole) return false;
  
  // Handle single role or array of roles
  if (Array.isArray(requiredRoles)) {
    return requiredRoles.includes(userRole);
  }
  return userRole === requiredRoles;
};
