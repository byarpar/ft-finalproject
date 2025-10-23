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

      // authAPI.login already extracts .data, so response is the actual data object
      const { user: userData, token: authToken } = response.data;

      setUser(userData);
      setToken(authToken);
      localStorage.setItem('token', authToken);

      return { success: true, user: userData };
    } catch (error) {
      // The error.response.data is the full error object from backend
      const fullErrorResponse = error.response?.data;

      // Extract error details from the backend response structure
      const errorInfo = fullErrorResponse?.error || {};
      const errorMessage = errorInfo.message || fullErrorResponse?.message || 'Login failed';
      const errorDetails = errorInfo.details || null;
      const errorData = errorInfo.data || {};

      return {
        success: false,
        error: {
          message: errorMessage,
          details: errorDetails,
          data: errorData
        }
      };
    }
  };

  const register = async (email, password, full_name, username = null) => {
    try {
      const userData = {
        email,
        password,
        full_name,
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

  const loginWithToken = async (authToken) => {
    try {
      setToken(authToken);
      localStorage.setItem('token', authToken);

      // Verify token and get user data
      const response = await authAPI.verifyToken(authToken);
      setUser(response.data.user);

      return { success: true };
    } catch (error) {
      // Token is invalid, remove it
      localStorage.removeItem('token');
      setToken(null);
      setUser(null);

      const errorData = error.response?.data?.error || error.response?.data;
      const errorMessage = errorData?.message || errorData || 'Token verification failed';

      return {
        success: false,
        error: {
          message: errorMessage
        }
      };
    }
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
    loginWithToken,
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
