import React, { createContext, useContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  // Initialize auth state from local storage on first load
  useEffect(() => {
    const storedUser = localStorage.getItem('employeeUser');
    const storedToken = localStorage.getItem('employeeToken');

    if (storedUser && storedToken) {
      setUser(JSON.parse(storedUser));
      setToken(storedToken);
    }
    setLoading(false);
  }, []);

  // Multi-tab logout sync
  useEffect(() => {
    const syncLogout = (e) => {
      if (e.key === 'employeeToken' && e.oldValue && !e.newValue) {
        // Token was removed in another tab
        setUser(null);
        setToken(null);
        navigate('/login');
      }
      
      // Keeping user profiles synced across tabs
      if (e.key === 'employeeUser' && e.newValue) {
        setUser(JSON.parse(e.newValue));
      }
    };
    
    window.addEventListener('storage', syncLogout);
    return () => window.removeEventListener('storage', syncLogout);
  }, [navigate]);

  const login = (userData, authToken) => {
    localStorage.setItem('employeeUser', JSON.stringify(userData));
    localStorage.setItem('employeeToken', authToken);
    setUser(userData);
    setToken(authToken);
  };

  const logout = () => {
    localStorage.removeItem('employeeUser');
    localStorage.removeItem('employeeToken');
    setUser(null);
    setToken(null);
    navigate('/login');
  };

  const updateUser = (updates) => {
    const newUser = { ...user, ...updates };
    localStorage.setItem('employeeUser', JSON.stringify(newUser));
    setUser(newUser);
  };

  if (loading) {
    return <div className="loading-screen animate-fade-in">Initializing Application...</div>;
  }

  return (
    <AuthContext.Provider value={{ user, token, login, logout, updateUser }}>
      {children}
    </AuthContext.Provider>
  );
};
