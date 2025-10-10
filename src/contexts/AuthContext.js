import React, { createContext, useContext, useState, useEffect } from 'react';
import { authAPI } from '../services/api';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [loading, setLoading] = useState(true);

  // Initialize auth state
  useEffect(() => {
    const initializeAuth = async () => {
      const storedToken = localStorage.getItem('token');

      if (storedToken) {
        try {
          // Verify token with backend
          const response = await authAPI.verifyToken(storedToken);
          setUser(response.data.user);
          setToken(storedToken);
        } catch (error) {
          // Token is invalid, remove it
          localStorage.removeItem('token');
          setToken(null);
          setUser(null);
        }
      }

      setLoading(false);
    };

    initializeAuth();
  }, []);

  const login = async (email, password) => {
    try {
      const response = await authAPI.login(email, password);
      const { user: userData, token: authToken } = response.data;

      setUser(userData);
      setToken(authToken);
      localStorage.setItem('token', authToken);

      return { success: true };
    } catch (error) {
      const errorData = error.response?.data?.error || error.response?.data;
      const errorMessage = errorData?.message || errorData || 'Login failed';
      const errorDetails = errorData?.details || null;

      return {
        success: false,
        error: {
          message: errorMessage,
          details: errorDetails
        }
      };
    }
  };

  const register = async (email, password, username = null) => {
    try {
      const userData = {
        email,
        password,
        ...(username && { username })
      };

      const response = await authAPI.register(userData);
      const { user: userInfo, token: authToken } = response.data;

      setUser(userInfo);
      setToken(authToken);
      localStorage.setItem('token', authToken);

      return { success: true };
    } catch (error) {
      const errorData = error.response?.data?.error || error.response?.data;
      const errorMessage = errorData?.message || errorData || 'Registration failed';
      const errorDetails = errorData?.details || null;

      return {
        success: false,
        error: {
          message: errorMessage,
          details: errorDetails
        }
      };
    }
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('token');
  };

  const updateUser = (userData) => {
    setUser(prev => ({ ...prev, ...userData }));
  };

  const isAuthenticated = () => {
    return !!token && !!user;
  };

  const isAdmin = () => {
    return user?.role === 'admin';
  };

  const value = {
    user,
    token,
    loading,
    login,
    register,
    logout,
    updateUser,
    isAuthenticated,
    isAdmin,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
