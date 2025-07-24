import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  Activity, 
  AlertTriangle, 
  Battery, 
  Wifi,
  MapPin,
  Clock
} from 'lucide-react';

import { api } from '../utils/api';
import DeviceCard from '../components/DeviceCard';
import AlertCard from '../components/AlertCard';

const Dashboard = () => {
  const [devices, setDevices] = useState([]);
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        const [devicesData, alertsData] = await Promise.all([
          api.getDevices(),
          api.getAlerts()
        ]);
        setDevices(devicesData);
        setAlerts(alertsData);
      } catch (error) {
        console.error('Error loading dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };

    loadData();

    const unsubscribe = api.subscribeToRealTimeUpdates((update) => {
      console.log('Real-time update:', update);
    });

    return unsubscribe;
  }, []);

  const activeDevices = devices.filter(d => d.device_status === 'Active').length;
  const disconnectedDevices = devices.filter(d => d.device_status === 'Disconnected').length;
  const faultyDevices = devices.filter(d => d.device_status === 'Faulty').length;
  const urgentAlerts = alerts.filter(a => !a.resolved_status && a.severity === 'High').length;
  const avgBatteryLevel = devices.length > 0 
    ? Math.round(devices.reduce((sum, d) => sum + d.battery_level, 0) / devices.length)
    : 0;

  const recentAlerts = alerts.filter(a => !a.resolved_status).slice(0, 5);
  const recentDevices = devices.slice(0, 6);

  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-300 rounded w-48 mb-6"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-32 bg-gray-300 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
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

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Active Devices */}
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

        {/* Urgent Alerts */}
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

        {/* Avg Battery */}
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
            {devices.filter(d => d.battery_level < 20).length} devices low battery
          </div>
        </div>

        {/* Network */}
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
                <Link to="/alerts" className="text-sm text-blue-600 hover:text-blue-800 transition-colors">
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
                  <Link to="/devices" className="text-sm text-blue-600 hover:text-blue-800 transition-colors">View Map</Link>
                  <span className="text-gray-300">|</span>
                  <Link to="/analytics" className="text-sm text-blue-600 hover:text-blue-800 transition-colors">Analytics</Link>
                </div>
              </div>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {recentDevices.map((device) => (
                  <DeviceCard 
                    key={device.device_id} 
                    device={device}
                    onClick={() => console.log('Navigate to device:', device.device_id)}
                  />
                ))}
              </div>
              {devices.length > 6 && (
                <div className="mt-6 text-center">
                  <Link to="/devices" className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors">
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
