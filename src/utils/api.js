import '../types';

// Mock API functions - replace with actual API calls when backend is ready
export const api = {
  // Device endpoints
  getDevices: async () => {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 500));
    const { mockDevices } = await import('../data/mockData');
    return mockDevices;
  },

  getDevice: async (deviceId) => {
    await new Promise(resolve => setTimeout(resolve, 300));
    const { mockDevices } = await import('../data/mockData');
    return mockDevices.find(device => device.device_id === deviceId) || null;
  },

  // Alert endpoints
  getAlerts: async () => {
    await new Promise(resolve => setTimeout(resolve, 400));
    const { mockAlerts } = await import('../data/mockData');
    return mockAlerts;
  },

  resolveAlert: async (alertId) => {
    await new Promise(resolve => setTimeout(resolve, 500));
    // Mock resolution - in real implementation, update backend
    return true;
  },

  // Analytics endpoints
  getAnalyticsData: async () => {
    await new Promise(resolve => setTimeout(resolve, 600));
    const { mockAnalyticsData } = await import('../data/mockData');
    return mockAnalyticsData;
  },

  // WebSocket simulation for real-time updates
  subscribeToRealTimeUpdates: (callback) => {
    const interval = setInterval(() => {
      // Simulate real-time data updates
      callback({
        type: 'device_update',
        data: {
          device_id: 'RLK001',
          battery_level: Math.floor(Math.random() * 100),
          timestamp: new Date().toISOString()
        }
      });
    }, 10000);

    return () => clearInterval(interval);
  }
};