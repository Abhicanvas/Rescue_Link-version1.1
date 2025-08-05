import { useState, useEffect, useCallback, useRef } from 'react';
import { api } from '../utils/api';
import { useAuth } from './useAuth';

/**
 * Hook for polling alert data at regular intervals
 * @param {number} intervalMs - Polling interval in milliseconds (default: 60000 = 1 minute)
 * @param {boolean} enabled - Whether polling is enabled (default: true)
 * @returns {object} - Alert data and polling state
 */
export const useAlertPolling = (intervalMs = 60000, enabled = true) => {
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lastUpdate, setLastUpdate] = useState(null);
  const [isPolling, setIsPolling] = useState(false);
  const [newAlert, setNewAlert] = useState(null);
  
  const { user } = useAuth();
  const intervalRef = useRef(null);
  const previousAlertsRef = useRef([]);
  const isInitialLoadRef = useRef(true);

  const userRole = user?.role || 'user';

  const fetchAlerts = useCallback(async () => {
    if (!user) return; // Don't fetch if user is not loaded yet
    
    try {
      setIsPolling(true);
      setError(null);
      
      const alertsData = await api.getAlerts();
      console.log('Alert Polling - Fetched alerts:', alertsData);
      
      const normalizedAlerts = (alertsData || []).map(alert => ({
        alert_id: alert.alert_id || alert.id,
        device_id: alert.device_id,
        message: alert.message,
        severity: alert.severity || 'Medium',
        timestamp: alert.timestamp || new Date().toISOString(),
        resolved_status: alert.resolved_status || false,
        type: alert.type || 'Alert',
        ...alert
      }));
      
      // Check for new alerts by comparing with previous alerts
      // Skip new alert detection on initial load to prevent false notifications
      if (!isInitialLoadRef.current) {
        const previousAlertIds = new Set(previousAlertsRef.current.map(a => a.alert_id));
        const newAlerts = normalizedAlerts.filter(alert => 
          !previousAlertIds.has(alert.alert_id) && !alert.resolved_status
        );
        
        // If there are new alerts, set the newest one as newAlert for notifications
        if (newAlerts.length > 0) {
          const newestAlert = newAlerts.sort((a, b) => 
            new Date(b.timestamp) - new Date(a.timestamp)
          )[0];
          setNewAlert(newestAlert);
          console.log('Alert Polling - New alert detected:', newestAlert);
        }
      } else {
        // Mark initial load as complete
        isInitialLoadRef.current = false;
        console.log('Alert Polling - Initial load completed, future polls will check for new alerts');
      }
      
      setAlerts(normalizedAlerts);
      previousAlertsRef.current = normalizedAlerts;
      setLastUpdate(new Date());
      setLoading(false);
    } catch (error) {
      console.error('Alert Polling - Error fetching alerts:', error);
      setError(error.message);
      setLoading(false);
    } finally {
      setIsPolling(false);
    }
  }, [user]);

  const startPolling = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }
    
    if (enabled && intervalMs > 0 && user) {
      console.log(`Alert Polling - Starting polling every ${intervalMs/1000} seconds`);
      // Fetch immediately
      fetchAlerts();
      
      // Set up polling interval
      intervalRef.current = setInterval(fetchAlerts, intervalMs);
    }
  }, [fetchAlerts, intervalMs, enabled, user]);

  const stopPolling = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    setIsPolling(false);
    console.log('Alert Polling - Stopped polling');
  }, []);

  const refreshAlerts = useCallback(() => {
    fetchAlerts();
  }, [fetchAlerts]);

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
      } else if (enabled && user) {
        startPolling();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [enabled, user, startPolling, stopPolling]);

  return {
    alerts,
    loading,
    error,
    lastUpdate,
    isPolling,
    newAlert,
    refreshAlerts,
    startPolling,
    stopPolling
  };
};