import { useState, useEffect, useCallback, useRef } from 'react';
import { api } from '../utils/api';
import { useAuth } from './useAuth';

/**
 * Hook for polling device data at regular intervals
 * @param {number} intervalMs - Polling interval in milliseconds (default: 60000 = 1 minute)
 * @param {boolean} enabled - Whether polling is enabled (default: true)
 * @returns {object} - Device data and polling state
 */
export const useDevicePolling = (intervalMs = 60000, enabled = true) => {
  const [devices, setDevices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lastUpdate, setLastUpdate] = useState(null);
  const [isPolling, setIsPolling] = useState(false);
  
  const { user } = useAuth();
  const intervalRef = useRef(null);

  const userRole = user?.role || 'user';

  const fetchDevices = useCallback(async () => {
    if (!user) return;
    
    try {
      setIsPolling(true);
      setError(null);
      
      let devicesData;
      if (userRole === 'user') {
        devicesData = await api.getMyDevices();
      } else {
        devicesData = await api.getDevices();
      }
      
      setDevices(devicesData || []);
      setLastUpdate(new Date());
      setLoading(false);
      
    } catch (error) {
      console.error('Device Polling - Error fetching devices:', error);
      setError(error.message);
      setLoading(false);
    } finally {
      setIsPolling(false);
    }
  }, [userRole, user]);

  const startPolling = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }
    
    if (enabled && intervalMs > 0 && user) {
      // Fetch immediately
      fetchDevices();
      
      // Set up polling interval
      intervalRef.current = setInterval(fetchDevices, intervalMs);
    }
  }, [fetchDevices, intervalMs, enabled, user]);

  const stopPolling = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    setIsPolling(false);
  }, []);

  const refreshDevices = useCallback(() => {
    fetchDevices();
  }, [fetchDevices]);

  // Start polling when user is available
  useEffect(() => {
    if (user && enabled) {
      startPolling();
    }
    
    return () => {
      stopPolling();
    };
  }, [user, enabled, startPolling, stopPolling]);

  // Handle visibility change to pause/resume polling when tab is hidden/visible
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden) {
        stopPolling();
      } else if (enabled) {
        startPolling();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [enabled, startPolling, stopPolling]);

  return {
    devices,
    loading,
    error,
    lastUpdate,
    isPolling,
    refreshDevices,
    startPolling,
    stopPolling
  };
};

/**
 * Hook for polling specific device data
 * @param {string} deviceId - Device ID to poll
 * @param {number} intervalMs - Polling interval in milliseconds (default: 60000 = 1 minute)
 * @param {boolean} enabled - Whether polling is enabled (default: true)
 * @returns {object} - Device data and polling state
 */
export const useDeviceDataPolling = (deviceId, intervalMs = 60000, enabled = true) => {
  const [deviceData, setDeviceData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lastUpdate, setLastUpdate] = useState(null);
  const [isPolling, setIsPolling] = useState(false);
  
  const intervalRef = useRef(null);
  const mountedRef = useRef(true);

  const fetchDeviceData = useCallback(async () => {
    if (!deviceId || !mountedRef.current) return;
    
    try {
      setIsPolling(true);
      setError(null);
      
      const data = await api.getLatestDeviceData(deviceId);
      
      if (mountedRef.current) {
        setDeviceData(data);
        setLastUpdate(new Date());
        setLoading(false);
      }
    } catch (error) {
      console.error(`Error fetching device data for ${deviceId}:`, error);
      if (mountedRef.current) {
        setError(error.message);
        setLoading(false);
      }
    } finally {
      if (mountedRef.current) {
        setIsPolling(false);
      }
    }
  }, [deviceId]);

  const startPolling = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }
    
    if (enabled && intervalMs > 0 && deviceId) {
      // Fetch immediately
      fetchDeviceData();
      
      // Set up polling interval
      intervalRef.current = setInterval(fetchDeviceData, intervalMs);
    }
  }, [fetchDeviceData, intervalMs, enabled, deviceId]);

  const stopPolling = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    setIsPolling(false);
  }, []);

  const refreshDeviceData = useCallback(() => {
    fetchDeviceData();
  }, [fetchDeviceData]);

  // Start polling on mount and when dependencies change
  useEffect(() => {
    if (deviceId) {
      startPolling();
    }
    
    return () => {
      stopPolling();
    };
  }, [deviceId, startPolling, stopPolling]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      mountedRef.current = false;
      stopPolling();
    };
  }, [stopPolling]);

  return {
    deviceData,
    loading,
    error,
    lastUpdate,
    isPolling,
    refreshDeviceData,
    startPolling,
    stopPolling
  };
};