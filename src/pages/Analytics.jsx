import React, { useState, useEffect } from 'react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  LineChart, 
  Line, 
  PieChart, 
  Pie, 
  Cell,
  ResponsiveContainer
} from 'recharts';
import { api } from '../utils/api';
import { TrendingUp, Activity, AlertTriangle, Battery } from 'lucide-react';

const Analytics = () => {
  const [analyticsData, setAnalyticsData] = useState([]);
  const [devices, setDevices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState('7d');

  useEffect(() => {
    const loadData = async () => {
      try {
        const [analyticsDataResponse, devicesData] = await Promise.all([
          api.getAnalyticsData(),
          api.getDevices()
        ]);
        setAnalyticsData(analyticsDataResponse);
        setDevices(devicesData);
      } catch (error) {
        console.error('Error loading analytics data:', error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [timeRange]);

  const deviceStatusData = [
    { name: 'Active', value: devices.filter(d => d.device_status === 'Active').length, color: '#10B981' },
    { name: 'Disconnected', value: devices.filter(d => d.device_status === 'Disconnected').length, color: '#6B7280' },
    { name: 'Faulty', value: devices.filter(d => d.device_status === 'Faulty').length, color: '#EF4444' }
  ];

  const batteryDistribution = [
    { name: 'High (>70%)', value: devices.filter(d => d.battery_level > 70).length, color: '#10B981' },
    { name: 'Medium (30-70%)', value: devices.filter(d => d.battery_level >= 30 && d.battery_level <= 70).length, color: '#F59E0B' },
    { name: 'Low (<30%)', value: devices.filter(d => d.battery_level < 30).length, color: '#EF4444' }
  ];

  const alertFrequencyData = analyticsData.map(data => ({
    date: new Date(data.date).toLocaleDateString(),
    alerts: data.alerts,
    incidents: data.incidents
  }));

  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-300 rounded w-48 mb-6"></div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-64 bg-gray-300 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Analytics Dashboard</h1>
          <p className="text-gray-600">Insights and trends from RescueLink device data</p>
        </div>
        <select
          value={timeRange}
          onChange={(e) => setTimeRange(e.target.value)}
          className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        >
          <option value="7d">Last 7 days</option>
          <option value="30d">Last 30 days</option>
          <option value="90d">Last 90 days</option>
        </select>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Devices</p>
              <p className="text-2xl font-bold text-blue-600">{devices.length}</p>
            </div>
            <div className="h-12 w-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <Activity className="h-6 w-6 text-blue-600" />
            </div>
          </div>
          <div className="mt-4 text-sm text-green-600">
            +{devices.filter(d => d.device_status === 'Active').length} active
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Alerts</p>
              <p className="text-2xl font-bold text-orange-600">
                {analyticsData.reduce((sum, d) => sum + d.alerts, 0)}
              </p>
            </div>
            <div className="h-12 w-12 bg-orange-100 rounded-lg flex items-center justify-center">
              <AlertTriangle className="h-6 w-6 text-orange-600" />
            </div>
          </div>
          <div className="mt-4 text-sm text-red-600">
            {analyticsData.reduce((sum, d) => sum + d.incidents, 0)} incidents
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Avg Battery</p>
              <p className="text-2xl font-bold text-green-600">
                {Math.round(devices.reduce((sum, d) => sum + d.battery_level, 0) / devices.length)}%
              </p>
            </div>
            <div className="h-12 w-12 bg-green-100 rounded-lg flex items-center justify-center">
              <Battery className="h-6 w-6 text-green-600" />
            </div>
          </div>
          <div className="mt-4 text-sm text-yellow-600">
            {devices.filter(d => d.battery_level < 30).length} low battery
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Uptime</p>
              <p className="text-2xl font-bold text-purple-600">98.5%</p>
            </div>
            <div className="h-12 w-12 bg-purple-100 rounded-lg flex items-center justify-center">
              <TrendingUp className="h-6 w-6 text-purple-600" />
            </div>
          </div>
          <div className="mt-4 text-sm text-green-600">
            +2% from last week
          </div>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Device Performance</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={analyticsData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="activeDevices" stroke="#2563EB" strokeWidth={2} name="Active Devices" />
              <Line type="monotone" dataKey="avgBattery" stroke="#10B981" strokeWidth={2} name="Avg Battery %" />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Alert Frequency</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={alertFrequencyData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="alerts" fill="#F59E0B" name="Total Alerts" />
              <Bar dataKey="incidents" fill="#EF4444" name="Incidents" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Device Status Distribution</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie data={deviceStatusData} cx="50%" cy="50%" outerRadius={80} fill="#8884d8" dataKey="value"
                label={({ name, value }) => `${name}: ${value}`}>
                {deviceStatusData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Battery Level Distribution</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie data={batteryDistribution} cx="50%" cy="50%" outerRadius={80} fill="#8884d8" dataKey="value"
                label={({ name, value }) => `${name}: ${value}`}>
                {batteryDistribution.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">Device Performance Summary</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Device ID</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Battery</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Last Update</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Alerts</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {devices.map((device) => (
                <tr key={device.device_id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{device.device_id}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                      device.device_status === 'Active' ? 'bg-green-100 text-green-800' :
                      device.device_status === 'Disconnected' ? 'bg-gray-100 text-gray-800' :
                      'bg-red-100 text-red-800'
                    }`}>
                      {device.device_status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    <div className="flex items-center">
                      <div className="w-16 bg-gray-200 rounded-full h-2 mr-2">
                        <div 
                          className={`h-2 rounded-full ${
                            device.battery_level > 50 ? 'bg-green-500' :
                            device.battery_level > 20 ? 'bg-yellow-500' : 'bg-red-500'
                          }`}
                          style={{ width: `${device.battery_level}%` }}
                        />
                      </div>
                      <span>{device.battery_level}%</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(device.timestamp).toLocaleString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {device.SOS_triggered || device.accident_reported ? (
                      <span className="text-red-600 font-medium">Active</span>
                    ) : (
                      <span className="text-gray-500">None</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Analytics;
