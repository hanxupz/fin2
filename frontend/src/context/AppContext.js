import React, { createContext, useContext, useReducer } from 'react';

// Action types
export const APP_ACTIONS = {
  SET_THEME: 'SET_THEME',
  SET_LOADING: 'SET_LOADING',
  SET_ERROR: 'SET_ERROR',
  CLEAR_ERROR: 'CLEAR_ERROR'
};

// Initial state
const initialState = {
  theme: 'dark',
  loading: false,
  error: null
};

// Reducer
const appReducer = (state, action) => {
  switch (action.type) {
    case APP_ACTIONS.SET_THEME:
      return { ...state, theme: action.payload };
    case APP_ACTIONS.SET_LOADING:
      return { ...state, loading: action.payload };
    case APP_ACTIONS.SET_ERROR:
      return { ...state, error: action.payload };
    case APP_ACTIONS.CLEAR_ERROR:
      return { ...state, error: null };
    default:
      return state;
  }
};

// Context
const AppContext = createContext();

// Provider component
export const AppProvider = ({ children }) => {
  const [state, dispatch] = useReducer(appReducer, initialState);

  const actions = {
    setTheme: (theme) => dispatch({ type: APP_ACTIONS.SET_THEME, payload: theme }),
    setLoading: (loading) => dispatch({ type: APP_ACTIONS.SET_LOADING, payload: loading }),
    setError: (error) => dispatch({ type: APP_ACTIONS.SET_ERROR, payload: error }),
    clearError: () => dispatch({ type: APP_ACTIONS.CLEAR_ERROR })
  };

  return (
    <AppContext.Provider value={{ state, actions }}>
      {children}
    </AppContext.Provider>
  );
};

// Hook to use the context
export const useAppContext = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useAppContext must be used within an AppProvider');
  }
  return context;
};
