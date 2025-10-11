import React, { createContext, useState } from 'react';

// Create the context
export const AppContext = createContext();

// Create the provider
export const AppProvider = ({ children }) => {
  const [admin, setAdmin] = useState({
    name: 'Admin User',
    role: 'Administrator',
    loggedIn: true,
  });

  const [settings, setSettings] = useState({
    appName: 'Campus News App',
    allowComments: true,
  });

  return (
    <AppContext.Provider value={{ admin, setAdmin, settings, setSettings }}>
      {children}
    </AppContext.Provider>
  );
};