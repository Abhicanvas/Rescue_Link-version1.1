// API service for RescueLink FastAPI backend integration
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://192.168.0.169:8000';

class ApiError extends Error {
  constructor(message, status, data = null) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.data = data;
  }
}

class ApiService {
  constructor() {
    this.baseURL = API_BASE_URL;
    this.token = localStorage.getItem('authToken');
  }

  // Helper method to get headers
  getHeaders(includeAuth = true) {
    const headers = {
      'Content-Type': 'application/json',
    };
    
    if (includeAuth && this.token) {
      headers['Authorization'] = `Bearer ${this.token}`;
    }
    
    return headers;
  }

  // Helper method to handle API responses
  async handleResponse(response) {
    const data = await response.json();
    
    if (!response.ok) {
      if (response.status === 401) {
        // Token expired, clear storage and redirect to login
        this.logout();
        throw new ApiError('Authentication required', 401, data);
      }
      throw new ApiError(data.detail || 'API request failed', response.status, data);
    }
    
    return data;
  }

  // Generic request method
  async request(endpoint, options = {}) {
    const url = `${this.baseURL}${endpoint}`;
    const config = {
      ...options,
      headers: {
        ...this.getHeaders(options.includeAuth !== false),
        ...options.headers,
      },
    };

    try {
      const response = await fetch(url, config);
      return await this.handleResponse(response);
    } catch (error) {
      if (error instanceof ApiError) {
        throw error;
      }
      throw new ApiError('Network error', 0, error);
    }
  }

  // Authentication methods
  async login(email, password) {
    // Use the exact format from your API documentation
    const response = await fetch(`${this.baseURL}/api/v1/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: email,
        password: password
      }),
    });

    const data = await this.handleResponse(response);
    return await this.handleLoginSuccess(data, email);
  }

  async handleLoginSuccess(data, email) {
    if (data.access_token) {
      this.token = data.access_token;
      localStorage.setItem('authToken', data.access_token);
      
      // Try to get user profile after successful login
      try {
        const profile = await this.getProfile();
        localStorage.setItem('userRole', profile.role);
        localStorage.setItem('userEmail', profile.email);
        localStorage.setItem('userName', profile.email.split('@')[0]);
        
        return { token: data.access_token, user: profile };
      } catch (profileError) {
        console.warn('Failed to get profile due to CORS, using email-based role detection:', profileError);
        // Extract role from email for demo purposes
        let role = 'user';
        if (email.includes('admin')) {
          role = 'admin';
        } else if (email.includes('operator')) {
          role = 'operator';
        }
        
        const user = {
          email: email,
          role: role,
          name: email.split('@')[0]
        };
        
        localStorage.setItem('userRole', user.role);
        localStorage.setItem('userEmail', user.email);
        localStorage.setItem('userName', user.name);
        
        return { token: data.access_token, user };
      }
    }
    
    throw new ApiError('Invalid login response', 400);
  }

  async logout() {
    try {
      await this.request('/api/v1/auth/logout', { method: 'POST' });
    } catch (error) {
      console.warn('Logout request failed:', error);
    } finally {
      localStorage.removeItem('authToken');
      localStorage.removeItem('userRole');
      localStorage.removeItem('userEmail');
      localStorage.removeItem('userName');
      this.token = null;
    }
  }

  async refreshToken() {
    const data = await this.request('/api/v1/auth/refresh', { method: 'POST' });
    
    if (data.access_token) {
      this.token = data.access_token;
      localStorage.setItem('authToken', data.access_token);
      return data.access_token;
    }
    
    throw new ApiError('Token refresh failed', 401);
  }

  async getProfile() {
    return await this.request('/api/v1/auth/profile');
  }

  async signup(userData) {
    return await this.request('/api/v1/auth/signup', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
  }

  // Device methods
  async getDevices() {
    return await this.request('/api/v1/devices');
  }

  async getMyDevices() {
    return await this.request('/api/v1/devices/my-devices');
  }

  async getDevice(deviceId) {
    return await this.request(`/api/v1/devices/details/${deviceId}`);
  }

  async addDevice(deviceData) {
    return await this.request('/api/v1/devices/add', {
      method: 'POST',
      body: JSON.stringify(deviceData),
    });
  }

  async updateDevice(deviceId, deviceData) {
    return await this.request(`/api/v1/devices/${deviceId}`, {
      method: 'PUT',
      body: JSON.stringify(deviceData),
    });
  }

  async deleteDevice(deviceId) {
    return await this.request(`/api/v1/devices/${deviceId}`, {
      method: 'DELETE',
    });
  }

  async getDeviceSummary() {
    return await this.request('/api/v1/devices/summary');
  }

  async getDeviceAnalytics(deviceId) {
    return await this.request(`/api/v1/devices/${deviceId}/analytics`);
  }

  async getLatestDeviceData(deviceId) {
    return await this.request(`/api/v1/devices/data/${deviceId}/latest`);
  }

  async getDeviceHistory(deviceId, params = {}) {
    const queryString = new URLSearchParams(params).toString();
    const endpoint = `/api/v1/devices/data/${deviceId}/history${queryString ? `?${queryString}` : ''}`;
    return await this.request(endpoint);
  }

  // Alert methods
  async getAlerts(params = {}) {
    const queryString = new URLSearchParams(params).toString();
    const endpoint = `/api/v1/alerts${queryString ? `?${queryString}` : ''}`;
    return await this.request(endpoint);
  }

  async getAlert(alertId) {
    return await this.request(`/api/v1/alerts/${alertId}`);
  }

  async createAlert(alertData) {
    return await this.request('/api/v1/alerts', {
      method: 'POST',
      body: JSON.stringify(alertData),
    });
  }

  async updateAlert(alertId, alertData) {
    return await this.request(`/api/v1/alerts/${alertId}`, {
      method: 'PUT',
      body: JSON.stringify(alertData),
    });
  }

  async resolveAlert(alertId, resolvedBy = null) {
    const data = resolvedBy ? { resolved_by: resolvedBy } : {};
    return await this.request(`/api/v1/alerts/${alertId}/resolve`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async deleteAlert(alertId) {
    return await this.request(`/api/v1/alerts/${alertId}`, {
      method: 'DELETE',
    });
  }

  async getAlertSummary() {
    return await this.request('/api/v1/alerts/analytics/summary');
  }

  async getDeviceAlerts(deviceId) {
    return await this.request(`/api/v1/alerts/device/${deviceId}`);
  }

  // Analytics methods
  async getDashboardAnalytics() {
    return await this.request('/api/v1/analytics/dashboard');
  }

  async getSystemMetrics() {
    return await this.request('/api/v1/analytics/system');
  }

  async getTrendAnalytics(days = 7) {
    return await this.request(`/api/v1/analytics/trends?days=${days}`);
  }

  // Legacy method mappings for backward compatibility
  async getAnalyticsData() {
    return await this.getTrendAnalytics();
  }

  // Real-time subscription placeholder (will be replaced with WebSocket service)
  subscribeToRealTimeUpdates(callback) {
    console.warn('Real-time updates should use WebSocket service');
    return () => {}; // Return empty unsubscribe function
  }

  // Utility methods
  isAuthenticated() {
    return !!this.token;
  }

  getUserRole() {
    return localStorage.getItem('userRole');
  }

  getUserEmail() {
    return localStorage.getItem('userEmail');
  }

  getUserName() {
    return localStorage.getItem('userName');
  }
}

// Create and export API instance
export const api = new ApiService();
export { ApiError };

// Admin-specific API exports for backward compatibility with your Admin component
export const userAPI = {
  getAll: async () => {
    const data = await api.request('/api/v1/auth/users');
    return { data }; // Wrap in data property for compatibility
  },
  create: async (user) => {
    const data = await api.request('/api/v1/auth/users', {
      method: 'POST',
      body: JSON.stringify(user),
    });
    return { data };
  },
  update: async (id, user) => {
    const data = await api.request(`/api/v1/auth/users/${id}`, {
      method: 'PUT',
      body: JSON.stringify(user),
    });
    return { data };
  },
  delete: async (id) => {
    const data = await api.request(`/api/v1/auth/users/${id}`, {
      method: 'DELETE',
    });
    return { data };
  },
  getById: async (id) => {
    const data = await api.request(`/api/v1/auth/users/${id}`);
    return { data };
  },
};

export const deviceAPI = {
  getAll: async () => {
    const data = await api.getDevices();
    return { data };
  },
  create: async (device) => {
    const data = await api.addDevice(device);
    return { data };
  },
  update: async (id, device) => {
    const data = await api.updateDevice(id, device);
    return { data };
  },
  delete: async (id) => {
    const data = await api.deleteDevice(id);
    return { data };
  },
};

export const settingsAPI = {
  get: async () => {
    const data = await api.request('/api/v1/settings');
    return { data };
  },
  update: async (settings) => {
    const data = await api.request('/api/v1/settings', {
      method: 'PUT',
      body: JSON.stringify(settings),
    });
    return { data };
  },
};

export const exportAPI = {
  devices: async (format = 'csv') => {
    const data = await api.request(`/api/v1/export/devices?format=${format}`, {
      includeAuth: true,
      headers: {
        'Accept': format === 'csv' ? 'text/csv' : 'application/pdf',
      },
    });
    return { data };
  },
  alerts: async (format = 'csv') => {
    const data = await api.request(`/api/v1/export/alerts?format=${format}`, {
      includeAuth: true,
      headers: {
        'Accept': format === 'csv' ? 'text/csv' : 'application/pdf',
      },
    });
    return { data };
  },
  reports: async (format = 'pdf') => {
    const data = await api.request(`/api/v1/export/reports?format=${format}`, {
      includeAuth: true,
      headers: {
        'Accept': 'application/pdf',
      },
    });
    return { data };
  },
};

// Auth API for additional admin functionality
export const authAPI = {
  login: async (credentials) => {
    const data = await api.login(credentials.email, credentials.password);
    return { data };
  },
  register: async (userData) => {
    const data = await api.signup(userData);
    return { data };
  },
  logout: async () => {
    await api.logout();
    return { data: { message: 'Logged out successfully' } };
  },
  getCurrentUser: async () => {
    const data = await api.getProfile();
    return { data };
  },
  refreshToken: async () => {
    const token = await api.refreshToken();
    return { data: { access_token: token } };
  },
};
