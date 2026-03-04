/**
 * API Configuration
 * Axios instance for making HTTP requests to backend
 * Automatically includes JWT token in request headers
 * Handles token expiry and 401 responses
 */

import axios from 'axios';

// Backend API base URL
const API_URL = 'http://localhost:5000/api';

/**
 * Create axios instance with default configuration
 * Base URL points to backend server
 * All requests use JSON content type
 */
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

/**
 * Request interceptor
 * Automatically adds JWT token to Authorization header if available
 * Token is retrieved from localStorage
 */
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

/**
 * Response interceptor
 * Handles 401 (Unauthorized) responses by clearing auth data
 * and redirecting to login page
 */
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token expired or invalid — clear auth state
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      // Only redirect if not already on login/register page
      if (
        window.location.pathname !== '/login' &&
        window.location.pathname !== '/register'
      ) {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export default api;
