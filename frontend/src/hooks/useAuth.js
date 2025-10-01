import { useState, useEffect } from 'react';
import { getStoredToken, isTokenValid, setStoredToken, removeStoredToken } from '../utils/auth';

export const useAuth = () => {
  const [token, setToken] = useState('');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const storedToken = getStoredToken();
    if (storedToken && isTokenValid(storedToken)) {
      setToken(storedToken);
      setIsAuthenticated(true);
    } else if (storedToken) {
      // Token exists but is invalid, remove it
      removeStoredToken();
    }
    setLoading(false);
  }, []);

  const login = (newToken) => {
    setStoredToken(newToken);
    setToken(newToken);
    setIsAuthenticated(true);
  };

  const logout = () => {
    removeStoredToken();
    setToken('');
    setIsAuthenticated(false);
  };

  return {
    token,
    isAuthenticated,
    loading,
    login,
    logout
  };
};
