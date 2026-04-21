/**
 * API Configuration
 * Smart Path detection for Local, Network, and Production
 */

const isDevelopment = window.location.port === "3000";

const API_URL = isDevelopment 
  ? `http://${window.location.hostname}:3001/api` 
  : "/api";

export default API_URL;
