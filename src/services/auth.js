// Authentication service for JWT token management and user state
import { api } from '../utils/api';

class AuthService {
  constructor() {
    this.listeners = [];
    this.refreshTimer = null;
    this.isRefreshing = false;
  }

  // Subscribe to auth state changes
  subscribe(callback) {
    this.listeners.push(callback);
    return () => {
      this.listeners = this.listeners.filter(listener => listener !== callback);
    };
  }

  // Notify all listeners of auth state changes
  notifyListeners() {
    const isAuthenticated = this.isAuthenticated();
    const user = this.getCurrentUser();
    this.listeners.forEach(callback => callback({ isAuthenticated, user }));
  }

  // Login with email and password
  async login(email, password) {
    try {
      const result = await api.login(email, password);
      this.setupTokenRefresh();
      this.notifyListeners();
      return result;
    } catch (error) {
      throw error;
    }
  }

  // Logout user
  async logout() {
    try {
      await api.logout();
    } catch (error) {
      console.warn('Logout API call failed:', error);
    } finally {
      this.clearTokenRefresh();
      this.notifyListeners();
    }
  }

  // Check if user is authenticated
  isAuthenticated() {
    const token = localStorage.getItem('authToken');
    if (!token) return false;

    // Check if token is expired
    try {
      const payload = this.parseJWT(token);
      const currentTime = Date.now() / 1000;
      return payload.exp > currentTime;
    } catch (error) {
      console.warn('Invalid token:', error);
      this.logout();
      return false;
    }
  }

  // Get current user data
  getCurrentUser() {
    if (!this.isAuthenticated()) return null;

    return {
      email: localStorage.getItem('userEmail'),
      name: localStorage.getItem('userName'),
      role: localStorage.getItem('userRole'),
    };
  }

  // Get user role
  getUserRole() {
    return localStorage.getItem('userRole');
  }

  // Check if user has specific role
  hasRole(role) {
    const userRole = this.getUserRole();
    const roleHierarchy = {
      admin: ['admin', 'operator', 'user'],
      operator: ['operator', 'user'],
      user: ['user']
    };

    return roleHierarchy[userRole]?.includes(role) || false;
  }

  // Check if user can access admin features
  isAdmin() {
    return this.getUserRole() === 'admin';
  }

  // Check if user can access operator features
  isOperator() {
    const role = this.getUserRole();
    return role === 'admin' || role === 'operator';
  }

  // Parse JWT token (without verification - for client-side use only)
  parseJWT(token) {
    try {
      const base64Url = token.split('.')[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const jsonPayload = decodeURIComponent(
        atob(base64)
          .split('')
          .map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
          .join('')
      );
      return JSON.parse(jsonPayload);
    } catch (error) {
      throw new Error('Invalid JWT token');
    }
  }

  // Setup automatic token refresh
  setupTokenRefresh() {
    this.clearTokenRefresh();

    const token = localStorage.getItem('authToken');
    if (!token) return;

    try {
      const payload = this.parseJWT(token);
      const currentTime = Date.now() / 1000;
      const expirationTime = payload.exp;
      
      // Refresh token 5 minutes before expiration
      const refreshTime = (expirationTime - currentTime - 300) * 1000;
      
      if (refreshTime > 0) {
        this.refreshTimer = setTimeout(() => {
          this.refreshToken();
        }, refreshTime);
      }
    } catch (error) {
      console.warn('Failed to setup token refresh:', error);
    }
  }

  // Clear token refresh timer
  clearTokenRefresh() {
    if (this.refreshTimer) {
      clearTimeout(this.refreshTimer);
      this.refreshTimer = null;
    }
  }

  // Refresh authentication token
  async refreshToken() {
    if (this.isRefreshing) return;

    this.isRefreshing = true;
    try {
      await api.refreshToken();
      this.setupTokenRefresh();
      this.notifyListeners();
    } catch (error) {
      console.error('Token refresh failed:', error);
      await this.logout();
    } finally {
      this.isRefreshing = false;
    }
  }

  // Initialize auth service (call on app startup)
  async initialize() {
    if (this.isAuthenticated()) {
      this.setupTokenRefresh();
      try {
        // Verify token with backend and update user data
        await api.getProfile();
        this.notifyListeners();
      } catch (error) {
        console.warn('Failed to verify token on startup:', error);
        await this.logout();
      }
    }
  }

  // Get authorization header for manual API calls
  getAuthHeader() {
    const token = localStorage.getItem('authToken');
    return token ? `Bearer ${token}` : null;
  }

  // Handle API errors (401 responses)
  handleApiError(error) {
    if (error.status === 401) {
      this.logout();
      // Redirect to login page could be handled here
      return true; // Indicates the error was handled
    }
    return false;
  }
}

// Create and export singleton instance
export const authService = new AuthService();