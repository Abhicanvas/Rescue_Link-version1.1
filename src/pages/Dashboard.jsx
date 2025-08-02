import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  Activity, 
  AlertTriangle, 
  Battery, 
  Wifi,
  TrendingUp,
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
  const userRole = localStorage.getItem('userRole') || 'user';
  const userEmail = localStorage.getItem('userEmail') || '';

  useEffect(() => {
    const loadData = async () => {
      try {
        const [devicesData, alertsData] = await Promise.all([
          api.getDevices(),
          api.getAlerts()
        ]);
        
        // Filter data based on user role
        if (userRole === 'user') {
          // For user, show only their assigned device (mock: first device for demo)
          const userDevice = devicesData.filter(d => d.device_id === 'RLK001'); // Mock user device
          const userAlerts = alertsData.filter(a => a.device_id === 'RLK001');
          setDevices(userDevice);
          setAlerts(userAlerts);
        } else {
          // Admin and Operator see all devices
          setDevices(devicesData);
          setAlerts(alertsData);
        }
      } catch (error) {
        console.error('Error loading dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };

    loadData();

    // Subscribe to real-time updates
    const unsubscribe = api.subscribeToRealTimeUpdates((update) => {
      console.log('Real-time update:', update);
      // Handle real-time updates here
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

  // User Dashboard - Different layout for users
  if (userRole === 'user') {
    const userDevice = devices[0];
    const userAlerts = alerts.slice(0, 3);

    if (loading) {
      return (
        <div className="p-6">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-300 rounded w-48 mb-6"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {[...Array(2)].map((_, i) => (
                <div key={i} className="h-32 bg-gray-300 rounded"></div>
              ))}
            </div>
          </div>
        </div>
      );
    }

    return (
      <div className="p-6 space-y-6">
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
                          userDevice.battery_level > 50 ? 'bg-green-500' :
                          userDevice.battery_level > 20 ? 'bg-yellow-500' : 'bg-red-500'
                        }`}
                        style={{ width: `${userDevice.battery_level}%` }}
                      />
                    </div>
                    <span className="font-medium">{userDevice.battery_level}%</span>
                  </div>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Device Status</span>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    userDevice.device_status === 'Active' ? 'bg-green-100 text-green-800' :
                    userDevice.device_status === 'Disconnected' ? 'bg-gray-100 text-gray-800' :
                    'bg-red-100 text-red-800'
                  }`}>
                    {userDevice.device_status}
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

  // Admin/Operator Dashboard (existing layout)
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
            {devices.filter(d => d.battery_level < 20).length} devices low battery
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
