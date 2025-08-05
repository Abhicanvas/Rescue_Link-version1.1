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
import { useDevicePolling } from '../hooks/useDevicePolling';
import { useAlertPolling } from '../hooks/useAlertPolling';
import { formatLocalTime, formatSystemTime } from '../utils/timezone';
import DeviceCard from '../components/DeviceCard';
import AlertCard from '../components/AlertCard';
import LoadingSpinner, { SkeletonCard } from '../components/LoadingSpinner';


const Dashboard = () => {
  const { user } = useAuth();
  const { success, error: notifyError } = useNotification();
  
  const userRole = user?.role || 'user';
  const userEmail = user?.email || '';
  
  // Use device polling hook for automatic device updates every 1 minute
  const {
    devices,
    loading: devicesLoading,
    error: devicesError,
    lastUpdate: devicesLastUpdate,
    isPolling: devicesPolling,
    refreshDevices
  } = useDevicePolling(60000, true); // Poll every 1 minute
  
  // Use alert polling hook for automatic alert updates every 1 minute  
  const {
    alerts,
    loading: alertsLoading,
    error: alertsError,
    lastUpdate: alertsLastUpdate,
    isPolling: alertsPolling,
    newAlert,
    refreshAlerts
  } = useAlertPolling(60000, true); // Poll every 1 minute
  
  // Temporary: Early return for debugging
  if (!user) {
    return (
      <div className="p-6">
        <div className="text-center">
          <h1>Loading user data...</h1>
          <p>User: {JSON.stringify(user)}</p>
        </div>
      </div>
    );
  }

  // --- START: UNIFIED CONNECTION STATUS COMPONENT ---
  // This component now handles the combined status of both hooks
  const ConnectionStatus = () => {
    const isPolling = devicesPolling || alertsPolling;

    // Find the most recent update time between the two hooks
    let lastUpdate = null;
    if (devicesLastUpdate && alertsLastUpdate) {
      lastUpdate = devicesLastUpdate > alertsLastUpdate ? devicesLastUpdate : alertsLastUpdate;
    } else {
      lastUpdate = devicesLastUpdate || alertsLastUpdate;
    }

    // Create a single refresh function to trigger both
    const handleRefreshAll = () => {
      refreshDevices();
      refreshAlerts();
    };

    return (
      <div className={`flex items-center text-xs px-3 py-1 rounded-full ${isPolling ? 'bg-blue-100 text-blue-800' : 'bg-green-100 text-green-800'} space-x-2`}>
        <div className="flex items-center">
          <span className="mr-1">
            {isPolling ? 'Updating...' : 'Auto-refresh'}
          </span>
          {lastUpdate && (
            <span className="text-xs text-gray-500">
              {formatSystemTime ? formatSystemTime(lastUpdate) : lastUpdate.toLocaleTimeString()}
            </span>
          )}
        </div>
        <button
          onClick={handleRefreshAll}
          className="hover:opacity-80 transition-opacity"
          title="Refresh All Data"
        >
          <RefreshCw className={`h-3 w-3 ${isPolling ? 'animate-spin' : ''}`} />
        </button>
      </div>
    );
  };
  // --- END: UNIFIED CONNECTION STATUS COMPONENT ---

  // Filter alerts for user role
  const filteredAlerts = userRole === 'user' 
    ? alerts.filter(a => devices.some(device => device.device_id === a.device_id))
    : alerts;

  // Handle new alert notifications
  useEffect(() => {
    if (newAlert) {
      notifyError(`New ${newAlert.severity} alert: ${newAlert.message}`);
    }
  }, [newAlert, notifyError]);

  // Helper function to check if alert is resolved
  const isAlertResolved = (alert) => {
    return alert.resolved_status === true || 
           alert.isResolved === true || 
           alert.is_resolved === true ||
           alert.status === 'resolved' ||
           alert.resolved === true;
  };

  // Helper function to normalize and get device status
  const getDeviceStatus = (device) => {
    return (device.device_status || device.status || 'unknown').toLowerCase();
  };
  
  // Calculate dashboard metrics using the helper function
  const activeDevices = devices.filter(d => getDeviceStatus(d) === 'active').length;
  const disconnectedDevices = devices.filter(d => ['disconnected', 'inactive'].includes(getDeviceStatus(d))).length;
  const faultyDevices = devices.filter(d => getDeviceStatus(d) === 'faulty').length;
  const urgentAlerts = alerts.filter(a => !isAlertResolved(a) && a.severity === 'High').length;
  
  const avgBatteryLevel = devices.length > 0
    ? Math.round(devices.reduce((sum, d) => sum + (d.telemetry?.battery || d.battery_level || 0), 0) / devices.length)
    : 0;

  const recentAlerts = filteredAlerts
    .filter(a => !isAlertResolved(a))
    .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
    .slice(0, 5);

  const recentDevices = devices.slice(0, 6);

  // User Dashboard View
  if (userRole === 'user') {
    const userDevice = devices[0];
    const userAlerts = filteredAlerts
      .filter(a => !isAlertResolved(a))
      .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

    const loading = devicesLoading || alertsLoading;
    const error = devicesError || alertsError;

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
        {/* Render the single, unified connection status */}
        <div className="flex justify-end">
          <ConnectionStatus />
        </div>

        {/* User Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">My Device Dashboard</h1>
            <p className="text-gray-600">Monitor your assigned RescueLink device</p>
          </div>

          <div className="flex items-center space-x-2 text-sm text-gray-500">
            <Clock className="h-4 w-4" />
            <span>Last updated: {formatSystemTime ? formatSystemTime(new Date()) : new Date().toLocaleTimeString()}</span>
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
  const loading = devicesLoading || alertsLoading;
  const error = devicesError || alertsError;

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
      {/* Render the single, unified connection status */}
      <div className="flex justify-end">
        <ConnectionStatus />
      </div>

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-600">Monitor all RescueLink devices and alerts</p>
        </div>

        <div className="flex items-center space-x-2 text-sm text-gray-500">
          <Clock className="h-4 w-4" />
          <span>Last updated: {formatSystemTime ? formatSystemTime(new Date()) : new Date().toLocaleTimeString()}</span>
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
            {alerts.filter(a => !isAlertResolved(a)).length} total unresolved
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
                {/* --- START: CORRECTED LINKS --- */}
                <div className="flex items-center space-x-2">
                  <Link
                    to="/devicemap"
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
                {/* --- END: CORRECTED LINKS --- */}
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