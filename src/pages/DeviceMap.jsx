import React, { useState, useEffect } from 'react';
import { MapPin, Search } from 'lucide-react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { useDevicePolling } from '../hooks/useDevicePolling';
import DeviceCard from '../components/DeviceCard';

// Fix for default marker icons in React-Leaflet
import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png';
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconUrl: markerIcon,
  iconRetinaUrl: markerIcon2x,
  shadowUrl: markerShadow,
});

const DeviceMap = () => {
  const [filteredDevices, setFilteredDevices] = useState([]);
  const [selectedDevice, setSelectedDevice] = useState(null);
  const [filterStatus, setFilterStatus] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

  // Use device polling hook for automatic device updates
  const { devices, loading } = useDevicePolling(60000, true); // Poll every 1 minute

  // --- START: CORRECTED FILTERING LOGIC ---
  useEffect(() => {
    // Helper to reliably get device status, handling different fields and cases
    const getDeviceStatus = (device) => (device.device_status || device.status || 'unknown').toLowerCase();

    let filtered = devices;

    // 1. Filter by status
    if (filterStatus !== 'all') {
      const lowercasedFilter = filterStatus.toLowerCase();
      if (lowercasedFilter === 'disconnected') {
        // Include 'inactive' when filtering for 'disconnected'
        filtered = filtered.filter(device => ['disconnected', 'inactive'].includes(getDeviceStatus(device)));
      } else {
        filtered = filtered.filter(device => getDeviceStatus(device) === lowercasedFilter);
      }
    }

    // 2. Filter by search term (applied to the already status-filtered list)
    if (searchTerm) {
      const lowercasedSearchTerm = searchTerm.toLowerCase();
      filtered = filtered.filter(device =>
        String(device.device_id || '').toLowerCase().includes(lowercasedSearchTerm) ||
        String(device.site_name || '').toLowerCase().includes(lowercasedSearchTerm) ||
        String(device.device_name || '').toLowerCase().includes(lowercasedSearchTerm)
      );
    }

    setFilteredDevices(filtered);
  }, [devices, filterStatus, searchTerm]);
  // --- END: CORRECTED FILTERING LOGIC ---

  // Create custom markers based on device status
  const createCustomIcon = (device) => {
    // Use the same robust helper function here
    const getDeviceStatus = (device) => (device.device_status || device.status || 'unknown').toLowerCase();
    
    const getColor = (status) => {
      switch (status) {
        case 'active': return '#10b981'; // green-500
        case 'disconnected': return '#6b7280'; // gray-500
        case 'inactive': return '#6b7280'; // gray-500
        case 'faulty': return '#ef4444'; // red-500
        default: return '#6b7280';
      }
    };

    const color = getColor(getDeviceStatus(device));
    const hasAlert = device.SOS_triggered || device.accident_reported || device.telemetry?.sos_flag === 1;

    return new L.DivIcon({
      className: 'custom-div-icon',
      html: `
        <div style="position: relative;">
          <div style="
            background-color: ${color};
            width: 20px;
            height: 20px;
            border: 3px solid white;
            border-radius: 50%;
            box-shadow: 0 2px 6px rgba(0,0,0,0.3);
          "></div>
          ${hasAlert ? `
            <div style="
              position: absolute;
              top: -2px;
              right: -2px;
              width: 8px;
              height: 8px;
              background-color: #dc2626;
              border: 1px solid white;
              border-radius: 50%;
              animation: pulse 2s infinite;
            "></div>
          ` : ''}
        </div>
      `,
      iconSize: [20, 20],
      iconAnchor: [10, 10],
    });
  };

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

  // --- START: CORRECTED COUNT CALCULATION ---
  // Calculate counts and center position using robust logic
  const getDeviceStatus = (device) => (device.device_status || device.status || 'unknown').toLowerCase();
  const activeCount = devices.filter(d => getDeviceStatus(d) === 'active').length;
  const disconnectedCount = devices.filter(d => ['disconnected', 'inactive'].includes(getDeviceStatus(d))).length;
  const faultyCount = devices.filter(d => getDeviceStatus(d) === 'faulty').length;

  const devicesWithLocation = devices.filter(d => d.location && d.location.lat && d.location.long);
  const centerPosition = devicesWithLocation.length > 0
    ? [
        devicesWithLocation.reduce((sum, d) => sum + d.location.lat, 0) / devicesWithLocation.length,
        devicesWithLocation.reduce((sum, d) => sum + d.location.long, 0) / devicesWithLocation.length
      ]
    : [20.5937, 78.9629]; // Default to center of India
  // --- END: CORRECTED COUNT CALCULATION ---

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Device Map</h1>
          <p className="text-gray-600">Live locations and status of all RescueLink devices</p>
        </div>
        
        <div className="flex items-center space-x-4">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search by ID or name..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent w-64"
            />
          </div>
          
          {/* Filter */}
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

      {/* Map Container */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 ">
        <div className="relative">
          {/* OpenStreetMap */}
          <div style={{ height: '400px', width: '100%' }}>
            <MapContainer
              center={centerPosition}
              zoom={5} // Adjusted zoom for a country view
              style={{ height: '100%', width: '100%' }}
              zoomControl={true}
            >
              <TileLayer
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              />
              
              {/* Show markers only for devices with location data */}
              {filteredDevices.filter(device => device.location && device.location.lat && device.location.long).map(device => (
                <Marker
                  key={device.device_id}
                  position={[device.location.lat, device.location.long]}
                  icon={createCustomIcon(device)}
                  eventHandlers={{
                    click: () => setSelectedDevice(device),
                  }}
                >
                  <Popup>
                    <div className="p-2">
                      <div className="font-semibold text-lg mb-2">{device.device_id}</div>
                      <div className="space-y-1 text-sm">
                        <div>Status: <span className={`font-medium ${
                          getDeviceStatus(device) === 'active' ? 'text-green-600' :
                          getDeviceStatus(device) === 'faulty' ? 'text-red-600' : 'text-gray-600'
                        }`}>{device.device_status || device.status || 'Unknown'}</span></div>
                        <div>Battery: {device.telemetry?.battery || device.battery_level || 'N/A'}%</div>
                        {(device.site_name || device.device_name) && <div>Site: {device.site_name || device.device_name}</div>}
                        {(device.SOS_triggered || device.sos_flag === 1 || device.telemetry?.sos_flag === 1) && <div className="text-red-600 font-medium">🚨 SOS TRIGGERED</div>}
                        {device.accident_reported && <div className="text-red-600 font-medium">⚠️ ACCIDENT DETECTED</div>}
                      </div>
                    </div>
                  </Popup>
                </Marker>
              ))}
            </MapContainer>
          </div>

          {/* Legend */}
          <div className="absolute bottom-4 left-4 bg-white p-3 rounded-lg shadow-lg z-[1000]">
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
              <div className="flex items-center">
                <div className="w-2 h-2 bg-red-600 rounded-full mr-3 animate-pulse"></div>
                <span className="text-xs text-gray-600">Alert</span>
              </div>
            </div>
          </div>
        </div>

        {/* Device List */}
        <div className="p-6 border-t border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">
              Devices ({filteredDevices.length})
            </h3>
            {/* Using the corrected counts */}
            <div className="text-sm text-gray-500">
              {activeCount} active,{' '}
              {disconnectedCount} disconnected,{' '}
              {faultyCount} faulty
              {devicesWithLocation.length !== devices.length && (
                <span className="block mt-1 text-orange-600">
                  {devicesWithLocation.length} of {devices.length} devices have location data
                </span>
              )}
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

      {/* Device Detail Modal */}
      {selectedDevice && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4" style={{ zIndex: 9999 }}>
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-screen overflow-y-auto" style={{ zIndex: 10000 }}>
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-gray-900">
                  Device Details: {selectedDevice.device_id}
                </h2>
                <button
                  onClick={() => setSelectedDevice(null)}
                  className="text-gray-400 hover:text-gray-600 transition-colors text-xl"
                  aria-label="Close device details"
                >
                  ✕
                </button>
              </div>
              
              <DeviceCard device={selectedDevice} isDetailedView={true} />
              
              <div className="mt-6 grid grid-cols-2 gap-4">
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h4 className="font-medium text-gray-900 mb-2">Sensor Data</h4>
                  <div className="space-y-2 text-sm text-gray-600">
                    <div>Vibration: {selectedDevice.telemetry?.vibration?.toFixed(2) || selectedDevice.vibration_intensity?.toFixed(2) || 'N/A'}</div>
                    <div>Tilt X: {selectedDevice.telemetry?.tilt_x?.toFixed(2) || selectedDevice.tilt_x?.toFixed(2) || 'N/A'}°</div>
                    <div>Tilt Y: {selectedDevice.telemetry?.tilt_y?.toFixed(2) || selectedDevice.tilt_y?.toFixed(2) || 'N/A'}°</div>
                    <div>Tilt Z: {selectedDevice.telemetry?.tilt_z?.toFixed(2) || selectedDevice.tilt_z?.toFixed(2) || 'N/A'}°</div>
                  </div>
                </div>
                
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h4 className="font-medium text-gray-900 mb-2">Status</h4>
                  <div className="space-y-2 text-sm text-gray-600">
                    <div>Battery: {selectedDevice.telemetry?.battery || selectedDevice.battery_level || 'N/A'}%</div>
                    <div>Actuator: {selectedDevice.telemetry?.actuator_status !== undefined ? (selectedDevice.telemetry?.actuator_status ? 'Active' : 'Inactive') : selectedDevice.actuator_status !== undefined ? (selectedDevice.actuator_status ? 'Active' : 'Inactive') : 'N/A'}</div>
                    <div>SOS: {selectedDevice.SOS_triggered || selectedDevice.telemetry?.sos_flag === 1 ? 'TRIGGERED' : 'Normal'}</div>
                    <div>Accident: {selectedDevice.accident_reported ? 'DETECTED' : 'None'}</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Add CSS for pulse animation */}
      <style jsx>{`
        @keyframes pulse {
          0%, 100% {
            opacity: 1;
          }
          50% {
            opacity: 0.5;
          }
        }
      `}</style>
    </div>
  );
};

export default DeviceMap;