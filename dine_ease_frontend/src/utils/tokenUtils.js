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
 * Get user ID from localStorage token
 */
export const getUserId = () => {
  const token = localStorage.getItem('token');
  if (!token) return null;
  
  const decoded = decodeToken(token);
  // The user ID is expected in the 'id' field of the JWT payload
  return decoded?.id || null;
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
/**
 * Check if token is expired
 */
export const isTokenExpired = () => {
  const token = localStorage.getItem('token');
  if (!token) return true;
  
  const decoded = decodeToken(token);
  if (!decoded || !decoded.exp) return true;
  
  // exp is in seconds, convert to milliseconds
  const expirationTime = decoded.exp * 1000;
  const currentTime = Date.now();
  
  return currentTime > expirationTime;
};

/**
 * Logout user by clearing token and user data
 */
export const logout = () => {
  localStorage.removeItem('token');
};