// Token validation helper function
export const isTokenValid = (token) => {
  if (!token) return false;
  
  try {
    // Decode JWT payload (basic validation)
    const payload = JSON.parse(atob(token.split('.')[1]));
    const currentTime = Date.now() / 1000;
    
    // Check if token is expired
    if (payload.exp && payload.exp < currentTime) {
      return false;
    }
    
    return true;
  } catch (error) {
    console.error('Invalid token format:', error);
    return false;
  }
};

// Token storage helpers
export const getStoredToken = () => {
  return localStorage.getItem('token');
};

export const setStoredToken = (token) => {
  localStorage.setItem('token', token);
};

export const removeStoredToken = () => {
  localStorage.removeItem('token');
};
