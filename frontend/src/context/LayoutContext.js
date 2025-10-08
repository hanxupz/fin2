import React, { createContext, useContext, useState, useEffect } from 'react';

const LayoutContext = createContext();

export const useLayout = () => {
  const context = useContext(LayoutContext);
  if (!context) {
    throw new Error('useLayout must be used within a LayoutProvider');
  }
  return context;
};

const DEFAULT_LAYOUT = {
  main: [
    { componentId: 'accountSummary', isVisible: true }
  ],
  left: [
    { componentId: 'calendar', isVisible: true },
    { componentId: 'budgetPreferences', isVisible: true },
    { componentId: 'financialInsights', isVisible: true }
  ],
  right: [
    { componentId: 'credits', isVisible: true },
    { componentId: 'filters', isVisible: true },
    { componentId: 'transactionList', isVisible: true }
  ]
};

const LAYOUT_STORAGE_KEY = 'finance_app_layout';

export const LayoutProvider = ({ children }) => {
  const [layout, setLayout] = useState(() => {
    // Try to load layout from localStorage
    try {
      const savedLayout = localStorage.getItem(LAYOUT_STORAGE_KEY);
      if (savedLayout) {
        return JSON.parse(savedLayout);
      }
    } catch (error) {
      console.error('Failed to load layout from localStorage:', error);
    }
    return DEFAULT_LAYOUT;
  });

  // Save layout to localStorage whenever it changes
  useEffect(() => {
    try {
      localStorage.setItem(LAYOUT_STORAGE_KEY, JSON.stringify(layout));
    } catch (error) {
      console.error('Failed to save layout to localStorage:', error);
    }
  }, [layout]);

  const updateLayout = (newLayout) => {
    setLayout(newLayout);
  };

  const resetLayout = () => {
    setLayout(DEFAULT_LAYOUT);
  };

  const getVisibleComponents = (sectionId) => {
    const sectionComponents = layout[sectionId] || [];
    return sectionComponents.filter(item => item.isVisible);
  };

  const isComponentVisible = (componentId) => {
    for (const section of Object.values(layout)) {
      const component = section.find(item => item.componentId === componentId);
      if (component) {
        return component.isVisible;
      }
    }
    return false;
  };

  const getComponentSection = (componentId) => {
    for (const [sectionId, components] of Object.entries(layout)) {
      if (components.some(item => item.componentId === componentId)) {
        return sectionId;
      }
    }
    return null;
  };

  const value = {
    layout,
    updateLayout,
    resetLayout,
    getVisibleComponents,
    isComponentVisible,
    getComponentSection
  };

  return (
    <LayoutContext.Provider value={value}>
      {children}
    </LayoutContext.Provider>
  );
};