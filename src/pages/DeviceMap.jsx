import React, { useState, useEffect } from 'react';
import { MapPin, Filter, Search, Layers } from 'lucide-react';
import { api } from '../utils/api';
import DeviceCard from '../components/DeviceCard';

const DeviceMap = () => {
  const [devices, setDevices] = useState([]);
  const [filteredDevices, setFilteredDevices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedDevice, setSelectedDevice] = useState(null);
  const [filterStatus, setFilterStatus] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const loadDevices = async () => {
      try {
        const devicesData = await api.getDevices();
        setDevices(devicesData);
        setFilteredDevices(devicesData);
      } catch (error) {
        console.error('Error loading devices:', error);
      } finally {
        setLoading(false);
      }
    };

    loadDevices();
  }, []);

  useEffect(() => {
    let filtered = devices;

    if (filterStatus !== 'all') {
      filtered = filtered.filter(device => device.device_status === filterStatus);
    }

    if (searchTerm) {
      filtered = filtered.filter(device =>
        device.device_id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        device.site_name?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    setFilteredDevices(filtered);
  }, [devices, filterStatus, searchTerm]);

  const getStatusColor = (status) => {
    switch (status) {
      case 'Active': return 'bg-green-500';
      case 'Disconnected': return 'bg-gray-500';
      case 'Faulty': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  const MapPin3D = ({ device, onClick }) => (
    <div
      className="relative cursor-pointer transform hover:scale-110 transition-transform duration-200"
      onClick={onClick}
    >
      <div className={`w-4 h-4 rounded-full ${getStatusColor(device.device_status)} border-2 border-white shadow-lg`}></div>
      {device.SOS_triggered && (
        <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-600 rounded-full border border-white animate-pulse"></div>
      )}
    </div>
  );

  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-300 rounded w-48 mb-6"></div>
          <div className="h-96 bg-gray-300 rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Device Map</h1>
          <p className="text-gray-600">Live locations and status of all RescueLink devices</p>
        </div>

        <div className="flex items-center space-x-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search devices..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent w-64"
            />
          </div>

          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="all">All Status</option>
            <option value="Active">Active</option>
            <option value="Disconnected">Disconnected</option>
            <option value="Faulty">Faulty</option>
          </select>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="relative">
          <div className="h-96 bg-gradient-to-br from-blue-50 to-green-50 relative overflow-hidden">
            <div className="absolute inset-0 opacity-10">
              <div className="grid grid-cols-12 grid-rows-8 h-full">
                {[...Array(96)].map((_, i) => (
                  <div key={i} className="border border-gray-300"></div>
                ))}
              </div>
            </div>

            {filteredDevices.map((device, index) => {
              const x = (device.location.long - 90.3) * 2000 + 200 + (index * 30) % 300;
              const y = (23.8 - device.location.lat) * 2000 + 100 + (index * 40) % 200;

              return (
                <div
                  key={device.device_id}
                  className="absolute transform -translate-x-1/2 -translate-y-1/2"
                  style={{ left: `${x}px`, top: `${y}px` }}
                >
                  <MapPin3D
                    device={device}
                    onClick={() => setSelectedDevice(device)}
                  />
                  <div className="absolute top-6 left-1/2 transform -translate-x-1/2 bg-white px-2 py-1 rounded shadow-lg text-xs font-medium whitespace-nowrap">
                    {device.device_id}
                  </div>
                </div>
              );
            })}

            <div className="absolute top-4 right-4 space-y-2">
              <button className="bg-white p-2 rounded-lg shadow-lg hover:bg-gray-50 transition-colors">
                <Layers className="h-4 w-4 text-gray-600" />
              </button>
            </div>

            <div className="absolute bottom-4 left-4 bg-white p-3 rounded-lg shadow-lg">
              <h4 className="text-sm font-medium text-gray-900 mb-2">Status Legend</h4>
              <div className="space-y-1">
                <div className="flex items-center">
                  <div className="w-3 h-3 bg-green-500 rounded-full mr-2"></div>
                  <span className="text-xs text-gray-600">Active</span>
                </div>
                <div className="flex items-center">
                  <div className="w-3 h-3 bg-gray-500 rounded-full mr-2"></div>
                  <span className="text-xs text-gray-600">Disconnected</span>
                </div>
                <div className="flex items-center">
                  <div className="w-3 h-3 bg-red-500 rounded-full mr-2"></div>
                  <span className="text-xs text-gray-600">Faulty</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="p-6 border-t border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">
              Devices ({filteredDevices.length})
            </h3>
            <div className="text-sm text-gray-500">
              {devices.filter(d => d.device_status === 'Active').length} active,{' '}
              {devices.filter(d => d.device_status === 'Disconnected').length} disconnected,{' '}
              {devices.filter(d => d.device_status === 'Faulty').length} faulty
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredDevices.map((device) => (
              <DeviceCard
                key={device.device_id}
                device={device}
                onClick={() => setSelectedDevice(device)}
              />
            ))}
          </div>

          {filteredDevices.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              <MapPin className="h-8 w-8 mx-auto mb-2 opacity-50" />
              <p>No devices found matching the current filters</p>
            </div>
          )}
        </div>
      </div>

      {selectedDevice && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-screen overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-gray-900">
                  Device Details: {selectedDevice.device_id}
                </h2>
                <button
                  onClick={() => setSelectedDevice(null)}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  ✕
                </button>
              </div>

              <DeviceCard device={selectedDevice} />

              <div className="mt-6 grid grid-cols-2 gap-4">
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h4 className="font-medium text-gray-900 mb-2">Sensor Data</h4>
                  <div className="space-y-2 text-sm text-gray-600">
                    <div>Vibration: {selectedDevice.vibration_intensity.toFixed(2)}</div>
                    <div>Tilt X: {selectedDevice.tilt_x.toFixed(2)}°</div>
                    <div>Tilt Y: {selectedDevice.tilt_y.toFixed(2)}°</div>
                    <div>Tilt Z: {selectedDevice.tilt_z.toFixed(2)}°</div>
                  </div>
                </div>

                <div className="bg-gray-50 p-4 rounded-lg">
                  <h4 className="font-medium text-gray-900 mb-2">Status</h4>
                  <div className="space-y-2 text-sm text-gray-600">
                    <div>Battery: {selectedDevice.battery_level}%</div>
                    <div>Actuator: {selectedDevice.actuator_status ? 'Active' : 'Inactive'}</div>
                    <div>SOS: {selectedDevice.SOS_triggered ? 'TRIGGERED' : 'Normal'}</div>
                    <div>Accident: {selectedDevice.accident_reported ? 'DETECTED' : 'None'}</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DeviceMap;
