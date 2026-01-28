/**
 * Authentication Context
 * Manages user authentication state across the application
 * Provides login, logout, and user update functionality
 */

import { createContext, useContext, useState, useEffect } from 'react';

// Create authentication context
const AuthContext = createContext();

/**
 * Custom hook to access authentication context
 * Must be used within AuthProvider
 * @returns {Object} Authentication context value
 * @throws {Error} If used outside AuthProvider
 */
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

/**
 * Authentication Provider Component
 * Wraps application to provide authentication state and methods
 * 
 * Context value includes:
 * - user: Current user object or null
 * - login: Function to log in user
 * - logout: Function to log out user
 * - updateUser: Function to update user data
 * - loading: Boolean indicating initial auth check
 * - isAuthenticated: Boolean indicating if user is logged in
 */
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  /**
   * On component mount, check if user is already logged in
   * Restores user session from localStorage
   */
  useEffect(() => {
    const token = localStorage.getItem('token');
    const userData = localStorage.getItem('user');
    
    if (token && userData) {
      try {
        // Parse and restore user data
        setUser(JSON.parse(userData));
      } catch (error) {
        console.error('Error parsing user data:', error);
        // Clear invalid data
        localStorage.removeItem('token');
        localStorage.removeItem('user');
      }
    }
    setLoading(false);
  }, []);

  /**
   * Log in user
   * Stores user data and token in state and localStorage
   * @param {Object} userData - User information from backend
   * @param {string} token - JWT authentication token
   */
  const login = (userData, token) => {
    setUser(userData);
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(userData));
  };

  /**
   * Update user information
   * Merges updates with existing user data
   * Updates both state and localStorage
   * @param {Object} updates - Fields to update
   */
  const updateUser = (updates) => {
    setUser((prevUser) => {
      const nextUser = { ...prevUser, ...updates };
      localStorage.setItem('user', JSON.stringify(nextUser));
      return nextUser;
    });
  };

  /**
   * Log out user
   * Clears user data from state and localStorage
   */
  const logout = () => {
    setUser(null);
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  };

  // Context value provided to children
  const value = {
    user,
    login,
    updateUser,
    logout,
    loading,
    isAuthenticated: !!user // True if user exists
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
