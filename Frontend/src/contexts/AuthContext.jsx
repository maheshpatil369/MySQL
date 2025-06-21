import React, { createContext, useContext, useState, useEffect } from 'react';

export const AuthContext = createContext(undefined);
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';
const AUTH_API_URL = `${API_BASE_URL}/auth`;

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null); // Initialize token to null
  const [isLoading, setIsLoading] = useState(false); // Set isLoading to false initially as we are not loading from localStorage
  const [error, setError] = useState(null);

  // useEffect to load from localStorage is removed to prevent session persistence

  const login = async (email, password) => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch(`${AUTH_API_URL}/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });
      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.msg || 'Login failed');
      }

      setUser(data.user);
      setToken(data.token);
      // localStorage.setItem('user', JSON.stringify(data.user)); // Do not save to localStorage
      // localStorage.setItem('token', data.token); // Do not save to localStorage
      return { success: true };
    } catch (err) {
      setError(err.message);
      return { success: false, message: err.message };
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (name, email, password) => {
  setIsLoading(true);
  setError(null);
  try {
    const response = await fetch(`${AUTH_API_URL}/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ name, email, password }), // ✅ Correct key
    });
    const data = await response.json();

    if (!response.ok || !data.success) {
      throw new Error(data.msg || 'Registration failed');
    }

    setUser(data.user);
    setToken(data.token);
    // localStorage.setItem('user', JSON.stringify(data.user)); // Do not save to localStorage
    // localStorage.setItem('token', data.token); // Do not save to localStorage
    return { success: true };
  } catch (err) {
    console.error('Registration fetch error:', err); // More detailed logging
    setError(err.message);
    return { success: false, message: err.message, errorDetail: err }; // Include full error
  } finally {
    setIsLoading(false);
  }
};


  const logout = () => {
    setUser(null);
    setToken(null);
    // localStorage.removeItem('user'); // No longer strictly needed as we don't save
    // localStorage.removeItem('token'); // No longer strictly needed
  };

  const value = {
    user,
    token,
    login,
    register,
    logout,
    isLoading,
    error,
    setError,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
