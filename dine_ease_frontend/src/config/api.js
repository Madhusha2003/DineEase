/**
 * API Configuration
 * Change this URL for different environments
 */

// In production, we use relative paths so it works on any IP/device.
// In development (port 3000), we fallback to localhost:3001.
const API_URL = process.env.REACT_APP_API_URL || (
  window.location.port === "3000" 
    ? "http://localhost:3001/api" 
    : "/api"
);

export default API_URL;


