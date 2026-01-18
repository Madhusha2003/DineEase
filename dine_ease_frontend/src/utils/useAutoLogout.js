import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { isTokenExpired, logout } from './tokenUtils';

/**
 * Custom hook to automatically logout user when token expires
 * Checks token expiration every 60 seconds
 */
export const useAutoLogout = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const checkTokenExpiration = () => {
      if (isTokenExpired()) {
        logout();
        navigate('/profile', { replace: true });
      }
    };

    // Check immediately on mount
    checkTokenExpiration();

    // Check every 60 seconds
    const interval = setInterval(checkTokenExpiration, 60000);

    return () => clearInterval(interval);
  }, [navigate]);
};
