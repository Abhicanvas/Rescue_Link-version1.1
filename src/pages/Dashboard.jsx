import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import {
  Activity,
  AlertTriangle,
  Battery,
  Wifi,
  TrendingUp,
  MapPin,
  Clock,
  RefreshCw
} from 'lucide-react';
import { api } from '../utils/api';
import { useAuth } from '../hooks/useAuth';
import { useNotification } from '../components/NotificationProvider';
import DeviceCard from '../components/DeviceCard';
import AlertCard from '../components/AlertCard';
import LoadingSpinner, { SkeletonCard } from '../components/LoadingSpinner';

// Enhanced WebSocket hook
function useWebSocketConnection(url, onMessage) {
  const [socket, setSocket] = useState(null);
  const [connectionStatus, setConnectionStatus] = useState('connecting');
  const [retryCount, setRetryCount] = useState(0);
  const maxRetries = 5;

  const connect = useCallback(() => {
    if (!url) return;

    const ws = new WebSocket(url);

    ws.onopen = () => {
      console.log('WebSocket connected');
      setConnectionStatus('connected');
      setRetryCount(0);
    };

    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        onMessage(data);
      } catch (error) {
        console.error('Error parsing WebSocket message:', error);
      }
    };

    ws.onerror = (error) => {
      console.error('WebSocket error:', error);
      setConnectionStatus('error');
    };

    ws.onclose = (event) => {
      console.log('WebSocket closed:', event.code, event.reason);
      setConnectionStatus('disconnected');

      if (!event.wasClean && retryCount < maxRetries) {
        const delay = Math.min(1000 * Math.pow(2, retryCount), 30000);
        setTimeout(() => {
          setRetryCount(prev => prev + 1);
          connect();
        }, delay);
      }
    };

    setSocket(ws);
    return ws;
  }, [url, onMessage, retryCount]);

  useEffect(() => {
    const ws = connect();

    return () => {
      if (ws) {
        ws.close();
      }
    };
  }, [connect]);

  const reconnect = () => {
    if (socket) {
      socket.close();
    }
    setRetryCount(0);
    connect();
  };

  return { socket, connectionStatus, reconnect };
}

// Custom hook for alert updates
function useAlertUpdates() {
  const { user } = useAuth();
  const [alerts, setAlerts] = useState([]);
  const [newAlert, setNewAlert] = useState(null);
  const [fallbackPolling, setFallbackPolling] = useState(false);
  const [lastUpdate, setLastUpdate] = useState(null);

  const handleMessage = useCallback((data) => {
    if (data.type === 'new_alert') {
      const alert = normalizeAlert(data.payload);
      setNewAlert(alert);
      setAlerts(prev => [alert, ...prev]);
      setLastUpdate(new Date());
    } else if (data.type === 'alert_update') {
      const alert = normalizeAlert(data.payload);
      setAlerts(prev => prev.map(a =>
        a.alert_id === alert.alert_id ? alert : a
      ));
      setLastUpdate(new Date());
    }
  }, []);

  // Normalize alert structure to match API response
  const normalizeAlert = (alert) => {
    return {
      alert_id: alert.alert_id || alert.id,
      device_id: alert.device_id,
      message: alert.message,
      severity: alert.severity || 'Medium',
      timestamp: alert.timestamp || new Date().toISOString(),
      resolved_status: alert.resolved_status || false,
      // Add any other required fields
    };
  };

  const wsUrl = user?.token
    ? `ws://192.168.0.169:8000/alert-updates?token=${user.token}`
    : null;

  const { connectionStatus, reconnect } = useWebSocketConnection(wsUrl, handleMessage);

  // Fallback to polling if WebSocket fails
  useEffect(() => {
    if (connectionStatus === 'disconnected' && !fallbackPolling) {
      const timer = setTimeout(() => {
        setFallbackPolling(true);
      }, 10000);
      return () => clearTimeout(timer);
    }
  }, [connectionStatus, fallbackPolling]);

  useEffect(() => {
    if (fallbackPolling) {
      const fetchAlerts = async () => {
        try {
          const response = await api.getAlerts();
          setAlerts(response.data.map(normalizeAlert));
          setLastUpdate(new Date());
        } catch (error) {
          console.error('Error fetching alerts:', error);
        }
      };

      fetchAlerts();
      const interval = setInterval(fetchAlerts, 5000);
      return () => clearInterval(interval);
    }
  }, [fallbackPolling]);

  return {
    alerts,
    newAlert,
    connectionStatus,
    reconnect,
    isUsingFallback: fallbackPolling,
    lastUpdate
  };
}

const Dashboard = () => {
  const [devices, setDevices] = useState([]);
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { user } = useAuth();
  const {
    alerts: realtimeAlerts,
    newAlert,
    connectionStatus: alertsConnectionStatus,
    reconnect: reconnectAlerts,
    isUsingFallback: alertsUsingFallback,
    lastUpdate: alertsLastUpdate
  } = useAlertUpdates();
  const { success, error: notifyError } = useNotification();

  const userRole = user?.role || 'user';
  const userEmail = user?.email || '';

  // Load initial data
  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        setError(null);

        if (userRole === 'user') {
          const [userDevices, alertsData] = await Promise.all([
            api.getMyDevices(),
            api.getAlerts()
          ]);

          console.log(userDevices, alertsData)

          const userAlerts = alertsData.filter(a =>
            userDevices.some(device => device.device_id === a.deviceId)
          );
          setDevices(userDevices);
          setAlerts(userAlerts);
        } else {
          const [devicesData, alertsData] = await Promise.all([
            api.getDevices(),
            api.getAlerts()
          ]);
          setDevices(devicesData);
          setAlerts(alertsData);
        }
      } catch (error) {
        console.error('Error loading dashboard data:', error);
        setError(error.message);
        notifyError('Failed to load dashboard data');
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [userRole, userEmail, notifyError]);

  // Handle new real-time alerts notifications
  useEffect(() => {
    if (newAlert) {
      notifyError(`New ${newAlert.severity} alert: ${newAlert.message}`);
    }
  }, [newAlert, notifyError]);

  // ✅ CORRECTED: Merge real-time alerts with existing alerts
  useEffect(() => {
    // Only proceed if there are real-time alerts to process
    if (realtimeAlerts.length > 0) {
      // Get a set of the user's device IDs for quick lookups.
      // This is essential for filtering alerts for the 'user' role.
      const userDeviceIds = new Set(devices.map(d => d.device_id));

      setAlerts(prevAlerts => {
        // Use a Map to efficiently handle updates and prevent duplicates.
        // Initialize it with the current alerts.
        const alertsMap = new Map(prevAlerts.map(a => [a.alert_id, a]));

        // Process each incoming real-time alert
        for (const realtimeAlert of realtimeAlerts) {
          // IMPORTANT: For a 'user', only add/update an alert if it belongs to them.
          // Admins/operators will see all alerts.
          if (userRole !== 'user' || userDeviceIds.has(realtimeAlert.device_id)) {
            alertsMap.set(realtimeAlert.alert_id, realtimeAlert);
          }
        }

        // Convert the map back to an array and sort it by timestamp to keep it ordered.
        return Array.from(alertsMap.values())
          .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
      });
    }
  }, [realtimeAlerts, devices, userRole]);

  // Connection status component
  const ConnectionStatus = ({ type }) => {
    const status = type === 'alert' ? alertsConnectionStatus : 'n/a';
    const isFallback = type === 'alert' ? alertsUsingFallback : false;
    const reconnect = type === 'alert' ? reconnectAlerts : () => {};
    const lastUpdate = type === 'alert' ? alertsLastUpdate : null;

    const statusMap = {
      connected: { text: 'Live', color: 'bg-green-100 text-green-800' },
      connecting: { text: 'Connecting...', color: 'bg-yellow-100 text-yellow-800' },
      disconnected: { text: 'Disconnected', color: 'bg-red-100 text-red-800' },
      error: { text: 'Error', color: 'bg-red-100 text-red-800' }
    };

    return (
      <div className={`flex items-center text-xs px-3 py-1 rounded-full ${statusMap[status]?.color || 'bg-gray-100'} space-x-2`}>
        <div className="flex items-center">
          <span className="mr-1">{isFallback ? 'Polling' : statusMap[status]?.text}</span>
          {lastUpdate && (
            <span className="text-xs text-gray-500">
              {new Date(lastUpdate).toLocaleTimeString()}
            </span>
          )}
        </div>
        {status !== 'connected' && (
          <button
            onClick={reconnect}
            className="hover:opacity-80 transition-opacity"
            title="Reconnect"
          >
            <RefreshCw className="h-3 w-3" />
          </button>
        )}
      </div>
    );
  };

  // Calculate dashboard metrics
  const activeDevices = devices.filter(d => d.device_status === 'Active').length;
  const disconnectedDevices = devices.filter(d => d.device_status === 'Disconnected').length;
  const faultyDevices = devices.filter(d => d.device_status === 'Faulty').length;
  const urgentAlerts = alerts.filter(a => !a.resolved_status && a.severity === 'High').length;
  const avgBatteryLevel = devices.length > 0
    ? Math.round(devices.reduce((sum, d) => sum + (d.telemetry?.battery || d.battery_level || 0), 0) / devices.length)
    : 0;

  const recentAlerts = alerts
    .filter(a => !a.resolved_status)
    .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
    .slice(0, 5);

  const recentDevices = devices.slice(0, 6);

  // User Dashboard View
  if (userRole === 'user') {
    const userDevice = devices[0];
    const userAlerts = alerts
      .filter(a => !a.resolved_status)
      .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
      // .slice(0, 3);

    if (loading) {
      return (
        <div className="p-6">
          <div className="mb-6">
            <div className="h-8 bg-gray-300 rounded w-48 mb-2 animate-pulse"></div>
            <div className="h-4 bg-gray-200 rounded w-64 animate-pulse"></div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {[...Array(4)].map((_, i) => (
              <SkeletonCard key={i} />
            ))}
          </div>
        </div>
      );
    }

    if (error) {
      return (
        <div className="p-6">
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-center">
            <AlertTriangle className="h-8 w-8 text-red-500 mx-auto mb-2" />
            <h3 className="text-lg font-medium text-red-800 mb-2">Error Loading Dashboard</h3>
            <p className="text-red-600 mb-4">{error}</p>
            <button
              onClick={() => window.location.reload()}
              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
            >
              Retry
            </button>
          </div>
        </div>
      );
    }

    return (
      <div className="p-6 space-y-6">
        {/* Connection Status */}
        <div className="flex justify-end space-x-2">
          <ConnectionStatus type="alert" />
        </div>

        {/* User Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">My Device Dashboard</h1>
            <p className="text-gray-600">Monitor your assigned RescueLink device</p>
          </div>

          <div className="flex items-center space-x-2 text-sm text-gray-500">
            <Clock className="h-4 w-4" />
            <span>Last updated: {new Date().toLocaleTimeString()}</span>
          </div>
        </div>

        {/* User Device Status */}
        {userDevice && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Device Info */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Device Information</h2>
              <DeviceCard device={userDevice} />
            </div>
          {console.log('Full device object:', userDevice)}
            {/* Device Stats */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Device Status</h2>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Battery Level</span>
                  <div className="flex items-center">
                    <div className="w-24 bg-gray-200 rounded-full h-2 mr-2">
                      <div
                        className={`h-2 rounded-full ${
                          (userDevice.telemetry?.battery || userDevice.battery_level || 0) > 50 ? 'bg-green-500' :
                          (userDevice.telemetry?.battery || userDevice.battery_level || 0) > 20 ? 'bg-yellow-500' : 'bg-red-500'
                        }`}
                        style={{ width: `${userDevice.telemetry?.battery || userDevice.battery_level || 0}%` }}
                      />
                    </div>
                    <span className="font-medium">{userDevice.telemetry?.battery || userDevice.battery_level || 0}%</span>
                  </div>
                </div>
                {console.log('Device status:', userDevice.device_status)}
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Device Status</span>
                 <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                  userDevice.status === 'Active' ? 'bg-green-100 text-green-800' :
                  userDevice.status === 'Disconnected' ? 'bg-gray-100 text-gray-800' :
                  'bg-red-100 text-red-800'
                    }`}>
                  {userDevice.status || 'Unknown'}
                </span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-gray-600">SOS Status</span>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    userDevice.SOS_triggered ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'
                  }`}>
                    {userDevice.SOS_triggered ? 'TRIGGERED' : 'Normal'}
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* User Alerts */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">Recent Alerts</h2>
          </div>
          <div className="p-6">
            {userAlerts.length > 0 ? (
              <div className="space-y-4">
                {userAlerts.map((alert) => (
                  <AlertCard key={alert.alert_id} alert={alert} />
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                <AlertTriangle className="h-8 w-8 mx-auto mb-2 opacity-50" />
                <p>No recent alerts for your device</p>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  // Admin/Operator Dashboard View
  if (loading) {
    return (
      <div className="p-6">
        <div className="mb-6">
          <div className="h-8 bg-gray-300 rounded w-48 mb-2 animate-pulse"></div>
          <div className="h-4 bg-gray-200 rounded w-64 animate-pulse"></div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {[...Array(4)].map((_, i) => (
            <SkeletonCard key={i} />
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-center">
          <AlertTriangle className="h-8 w-8 text-red-500 mx-auto mb-2" />
          <h3 className="text-lg font-medium text-red-800 mb-2">Error Loading Dashboard</h3>
          <p className="text-red-600 mb-4">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Connection Status */}
      <div className="flex justify-end space-x-2">
        <ConnectionStatus type="alert" />
      </div>

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-600">Monitor all RescueLink devices and alerts</p>
        </div>

        <div className="flex items-center space-x-2 text-sm text-gray-500">
          <Clock className="h-4 w-4" />
          <span>Last updated: {new Date().toLocaleTimeString()}</span>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Active Devices</p>
              <p className="text-2xl font-bold text-green-600">{activeDevices}</p>
            </div>
            <div className="h-12 w-12 bg-green-100 rounded-lg flex items-center justify-center">
              <Activity className="h-6 w-6 text-green-600" />
            </div>
          </div>
          <div className="mt-4 text-xs text-gray-500">
            {disconnectedDevices} disconnected, {faultyDevices} faulty
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Urgent Alerts</p>
              <p className="text-2xl font-bold text-red-600">{urgentAlerts}</p>
            </div>
            <div className="h-12 w-12 bg-red-100 rounded-lg flex items-center justify-center">
              <AlertTriangle className="h-6 w-6 text-red-600" />
            </div>
          </div>
          <div className="mt-4 text-xs text-gray-500">
            {alerts.filter(a => !a.resolved_status).length} total unresolved
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Avg Battery</p>
              <p className="text-2xl font-bold text-blue-600">{avgBatteryLevel}%</p>
            </div>
            <div className="h-12 w-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <Battery className="h-6 w-6 text-blue-600" />
            </div>
          </div>
          <div className="mt-4 text-xs text-gray-500">
            {devices.filter(d => (d.telemetry?.battery || d.battery_level || 0) < 20).length} devices low battery
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Network Status</p>
              <p className="text-2xl font-bold text-green-600">Online</p>
            </div>
            <div className="h-12 w-12 bg-green-100 rounded-lg flex items-center justify-center">
              <Wifi className="h-6 w-6 text-green-600" />
            </div>
          </div>
          <div className="mt-4 text-xs text-gray-500">
            LoRaWAN gateway connected
          </div>
        </div>
      </div>

      {/* Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Alerts */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200">
            <div className="px-6 py-4 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold text-gray-900">Recent Alerts</h2>
                <Link
                  to="/alerts"
                  className="text-sm text-blue-600 hover:text-blue-800 transition-colors"
                >
                  View All
                </Link>
              </div>
            </div>
            <div className="p-6 space-y-4 max-h-96 overflow-y-auto">
              {recentAlerts.length > 0 ? (
                recentAlerts.map((alert) => (
                  <AlertCard key={alert.alert_id} alert={alert} />
                ))
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <AlertTriangle className="h-8 w-8 mx-auto mb-2 opacity-50" />
                  <p>No active alerts</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Device Status */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200">
            <div className="px-6 py-4 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold text-gray-900">Device Status</h2>
                <div className="flex space-x-2">
                  <Link
                    to="/devices"
                    className="text-sm text-blue-600 hover:text-blue-800 transition-colors"
                  >
                    View Map
                  </Link>
                  <span className="text-gray-300">|</span>
                  <Link
                    to="/analytics"
                    className="text-sm text-blue-600 hover:text-blue-800 transition-colors"
                  >
                    Analytics
                  </Link>
                </div>
              </div>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {recentDevices.map((device) => (
                  <DeviceCard
                    key={device.device_id}
                    device={device}
                    onClick={() => {
                      // Navigate to device detail - implement with router
                      console.log('Navigate to device:', device.device_id);
                    }}
                  />
                ))}
              </div>
              {devices.length > 6 && (
                <div className="mt-6 text-center">
                  <Link
                    to="/devices"
                    className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
                  >
                    <MapPin className="h-4 w-4 mr-2" />
                    View All {devices.length} Devices
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;