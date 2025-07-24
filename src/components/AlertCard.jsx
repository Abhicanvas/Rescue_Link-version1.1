import React from 'react';
import { 
  AlertTriangle, 
  AlertCircle, 
  Info,
  Clock,
  CheckCircle
} from 'lucide-react';

const AlertCard = ({ alert, onResolve }) => {
  const getSeverityColor = (severity) => {
    switch (severity) {
      case 'High':
        return 'bg-red-50 border-red-200 text-red-800';
      case 'Medium':
        return 'bg-yellow-50 border-yellow-200 text-yellow-800';
      case 'Low':
        return 'bg-blue-50 border-blue-200 text-blue-800';
      default:
        return 'bg-gray-50 border-gray-200 text-gray-800';
    }
  };

  const getSeverityIcon = (severity) => {
    switch (severity) {
      case 'High':
        return <AlertTriangle className="h-5 w-5" />;
      case 'Medium':
        return <AlertCircle className="h-5 w-5" />;
      case 'Low':
        return <Info className="h-5 w-5" />;
      default:
        return <Info className="h-5 w-5" />;
    }
  };

  const getTypeColor = (type) => {
    switch (type) {
      case 'SOS':
        return 'bg-red-100 text-red-800';
      case 'Accident':
        return 'bg-orange-100 text-orange-800';
      case 'Low Battery':
        return 'bg-yellow-100 text-yellow-800';
      case 'Device Fault':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const formatTimestamp = (timestamp) => {
    return new Date(timestamp).toLocaleString();
  };

  return (
    <div className={`border rounded-lg p-4 ${getSeverityColor(alert.severity)} ${alert.resolved_status ? 'opacity-60' : ''}`}>
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center">
          {getSeverityIcon(alert.severity)}
          <div className="ml-3">
            <h4 className="text-sm font-semibold">{alert.type}</h4>
            <p className="text-xs opacity-75">Device: {alert.device_id}</p>
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getTypeColor(alert.type)}`}>
            {alert.type}
          </span>
          
          {alert.resolved_status && (
            <CheckCircle className="h-4 w-4 text-green-600" />
          )}
        </div>
      </div>

      <p className="text-sm mb-3">{alert.message}</p>

      <div className="flex items-center justify-between">
        <div className="flex items-center text-xs opacity-75">
          <Clock className="h-3 w-3 mr-1" />
          {formatTimestamp(alert.timestamp)}
        </div>
        
        {!alert.resolved_status && onResolve && (
          <button
            onClick={() => onResolve(alert.alert_id)}
            className="text-xs bg-white bg-opacity-50 hover:bg-opacity-75 px-3 py-1 rounded-full transition-colors duration-200"
          >
            Mark Resolved
          </button>
        )}
      </div>
    </div>
  );
};

export default AlertCard;
