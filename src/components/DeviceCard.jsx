import React from 'react';
import { 
  MapPin, 
  Battery, 
  Wifi, 
  WifiOff, 
  AlertTriangle,
  CheckCircle,
  XCircle
} from 'lucide-react';
import { formatLocalTimestamp } from '../utils/timezone';

// No TypeScript: remove interface and type annotations
// DeviceCard expects { device, onClick } as props

const DeviceCard = ({ device, onClick }) => {
  const getStatusColor = (status) => {
    switch (status) {
      case 'ACTIVE':
        return 'bg-green-100 text-green-800';
      case 'Disconnected':
        return 'bg-gray-100 text-gray-800';
      case 'Faulty':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'Active':
        return <CheckCircle className="h-4 w-4" />;
      case 'Disconnected':
        return <WifiOff className="h-4 w-4" />;
      case 'Faulty':
        return <XCircle className="h-4 w-4" />;
      default:
        return <AlertTriangle className="h-4 w-4" />;
    }
  };

  const getBatteryColor = (level) => {
    if (level > 50) return 'text-green-600';
    if (level > 20) return 'text-yellow-600';
    return 'text-red-600';
  };

  const formatTimestamp = (timestamp) => {
    return formatLocalTimestamp(timestamp);
  };

  return (
    <div 
      className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow duration-200 cursor-pointer"
      onClick={onClick}
    >
      <div className="flex items-start justify-between mb-4">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">{device.device_id || 'Unknown Device'}</h3>
          <p className="text-sm text-gray-500">{device.device_name || device.site_name || 'No name available'}</p>
        </div>
        
        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(device.status || 'Unknown')}`}>
          {getStatusIcon(device.status || 'Unknown')}
          <span className="ml-1">{device.status || 'Unknown'}</span>
        </span>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-4">
        <div className="flex items-center">
          <Battery className={`h-4 w-4 mr-2 ${getBatteryColor(device.telemetry?.battery || device.battery_level || 0)}`} />
          <span className="text-sm text-gray-600">
            {device.telemetry?.battery || device.battery_level || 'N/A'}%
          </span>
        </div>
        
        <div className="flex items-center">
          <MapPin className="h-4 w-4 mr-2 text-gray-400" />
          <span className="text-sm text-gray-600">
            {device.location 
              ? `${device.location.lat?.toFixed(4) || 'N/A'}, ${device.location.long?.toFixed(4) || device.location.longitude?.toFixed(4) || 'N/A'}`
              : 'Location not available'
            }
          </span>
        </div>
      </div>

      {(device.SOS_triggered || device.sos_flag === 1 || device.telemetry?.sos_flag === 1) && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
          <div className="flex items-center">
            <AlertTriangle className="h-4 w-4 text-red-600 mr-2" />
            <span className="text-sm font-medium text-red-800">SOS TRIGGERED</span>
          </div>
        </div>
      )}

      {device.accident_reported && (
        <div className="mb-4 p-3 bg-orange-50 border border-orange-200 rounded-lg">
          <div className="flex items-center">
            <AlertTriangle className="h-4 w-4 text-orange-600 mr-2" />
            <span className="text-sm font-medium text-orange-800">ACCIDENT DETECTED</span>
          </div>
        </div>
      )}

      <div className="border-t border-gray-200 pt-4">
        <div className="flex items-center justify-between text-sm text-gray-500">
          <span>Last Update:</span>
          <span>{device.last_updated ? formatTimestamp(device.last_updated) : 'N/A'}</span>
        </div>
        
        <div className="mt-2 grid grid-cols-3 gap-2 text-xs text-gray-600">
          <div>Vibration: {device.telemetry?.vibration?.toFixed(1) || device.vibration_intensity?.toFixed(1) || device.vibration?.toFixed(1) || 'N/A'}</div>
          <div>Tilt: {device.telemetry?.tilt?.toFixed(1) || device.tilt?.toFixed(1) || device.tilt?.toFixed(1) || 'N/A'}°</div>
          <div>Actuator: {device.telemetry?.actuator_status !== undefined ? (device.telemetry?.actuator_status ? 'ON' : 'OFF') : device.actuator_status !== undefined ? (device.actuator_status ? 'ON' : 'OFF') : 'N/A'}</div>
        </div>
      </div>
    </div>
  );
};

export default DeviceCard;
