/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useState } from 'react';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('lavapro_user');
    return saved ? JSON.parse(saved) : null;
  });

  const login = (userData, token) => {
    setUser(userData);
    localStorage.setItem('lavapro_user', JSON.stringify(userData));
    localStorage.setItem('lavapro_token', token);
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('lavapro_user');
    localStorage.removeItem('lavapro_token');
  };

  const updateUser = (newUserData) => {
    setUser(newUserData);
    localStorage.setItem('lavapro_user', JSON.stringify(newUserData));
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, updateUser, currentRole: user?.rol }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
