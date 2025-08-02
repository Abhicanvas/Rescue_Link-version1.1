import { useState, useEffect } from 'react';
import { wsService } from '../services/websocket';

// React hook for WebSocket connection
export function useWebSocket() {
  const [isConnected, setIsConnected] = useState(wsService.isConnected());

  useEffect(() => {
    const unsubscribe = wsService.onConnectionChange(setIsConnected);
    return unsubscribe;
  }, []);

  return {
    isConnected,
    connect: () => wsService.connect(),
    disconnect: () => wsService.disconnect(),
    subscribe: wsService.subscribe.bind(wsService),
    subscribeToAll: wsService.subscribeToAll.bind(wsService),
    send: wsService.send.bind(wsService),
  };
}

// React hook for subscribing to specific message types
export function useWebSocketSubscription(messageType, callback, dependencies = []) {
  useEffect(() => {
    if (!callback) return;

    const unsubscribe = wsService.subscribe(messageType, callback);
    return unsubscribe;
  }, [messageType, ...dependencies]);
}

// React hook for real-time device data
export function useDeviceUpdates(deviceId = null) {
  const [deviceData, setDeviceData] = useState(null);
  const [lastUpdate, setLastUpdate] = useState(null);

  useEffect(() => {
    const unsubscribe = wsService.subscribe('device_data', (data) => {
      if (!deviceId || data.device_id === deviceId) {
        setDeviceData(data);
        setLastUpdate(new Date(data.timestamp));
      }
    });

    return unsubscribe;
  }, [deviceId]);

  return { deviceData, lastUpdate };
}

// React hook for real-time alerts
export function useAlertUpdates() {
  const [alerts, setAlerts] = useState([]);
  const [newAlert, setNewAlert] = useState(null);

  useEffect(() => {
    const unsubscribeNewAlert = wsService.subscribe('new_alert', (data) => {
      setNewAlert(data);
      setAlerts(prev => [data, ...prev]);
    });

    const unsubscribeResolvedAlert = wsService.subscribe('alert_resolved', (data) => {
      setAlerts(prev => prev.map(alert => 
        alert.alertId === data.alertId 
          ? { ...alert, isResolved: true, resolvedAt: data.resolvedAt }
          : alert
      ));
    });

    return () => {
      unsubscribeNewAlert();
      unsubscribeResolvedAlert();
    };
  }, []);

  return { alerts, newAlert };
}