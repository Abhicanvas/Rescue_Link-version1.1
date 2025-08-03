import React, { useState } from 'react';
import { 
  AlertTriangle, 
  AlertCircle, 
  Info,
  Clock,
  CheckCircle,
  Shield
} from 'lucide-react';
import { api } from '../utils/api';
import { formatLocalTimestamp } from '../utils/timezone';

const AlertCard = ({ alert, onResolve, onDeescalate }) => {
  const [isDeescalating, setIsDeescalating] = useState(false);
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
    return formatLocalTimestamp(timestamp);
  };

  const getAlertId = (alert) => {
    return alert.alertId || alert.alert_id || alert.id;
  };

  const getDeviceId = (alert) => {
    return alert.device_id || alert.deviceId || alert.device;
  };

  const handleDeescalate = async () => {
    const deviceId = getDeviceId(alert);
    
    if (!deviceId) {
      alert('Error: Device ID not found in alert data.');
      return;
    }
    
    const confirmed = window.confirm(
      `Are you sure you want to de-escalate this alert and send reset command to device ${deviceId}?`
    );
    
    if (!confirmed) return;
    
    setIsDeescalating(true);
    
    try {
      console.log('De-escalating alert with data:', {
        device_id: deviceId,
        panic_flag: 0,
        panic_reason: 0,
        trigger_flag: false,
        alert_id: getAlertId(alert)
      });
      
      await api.sendDownlink(
        deviceId,
        0, // panic_flag: 0 for de-escalation
        0, // panic_reason: 0 for de-escalation
        false, // trigger_flag: false for de-escalation
        getAlertId(alert)
      );
      
      // Show success message
      alert('Alert de-escalated successfully! Reset command sent to device.');
      
      // Call parent callback to refresh alerts list
      if (onDeescalate) {
        onDeescalate(getAlertId(alert));
      }
    } catch (error) {
      console.error('De-escalation error:', error);
      alert(`Failed to de-escalate alert: ${error.message}`);
    } finally {
      setIsDeescalating(false);
    }
  };

  const isResolved = alert.isResolved || alert.is_resolved || alert.resolved_status;
  
  return (
    <div className={`alert-card border rounded-lg p-4 ${getSeverityColor(alert.severity)} ${isResolved ? 'resolved opacity-60' : 'active'}`}>
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
          
          <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
            isResolved ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
          }`}>
            {isResolved ? 'Resolved' : 'Active'}
          </span>
          
          {isResolved && (
            <CheckCircle className="h-4 w-4 text-green-600" />
          )}
        </div>
      </div>

      <p className="text-sm mb-3">{alert.message}</p>

      <div className="flex items-center justify-between">
        <div className="flex items-center text-xs opacity-75">
          <Clock className="h-3 w-3 mr-1" />
          {formatTimestamp(alert.timestamp)}
          {isResolved && alert.resolvedAt && (
            <span className="ml-2">
              • Resolved: {formatTimestamp(alert.resolvedAt)}
            </span>
          )}
        </div>
        
        <div className="flex items-center space-x-2">
          {!isResolved && onResolve && (
            <button
              onClick={() => onResolve(getAlertId(alert))}
              className="text-xs bg-white bg-opacity-50 hover:bg-opacity-75 px-3 py-1 rounded-full transition-colors duration-200"
            >
              Mark Resolved
            </button>
          )}
          
          {!isResolved && (
            <button
              onClick={handleDeescalate}
              disabled={isDeescalating}
              className="inline-flex items-center text-xs bg-yellow-500 hover:bg-yellow-600 text-white px-3 py-1 rounded-full transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isDeescalating ? (
                <div className="flex items-center">
                  <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-white mr-1"></div>
                  De-escalating...
                </div>
              ) : (
                <>
                  <Shield className="h-3 w-3 mr-1" />
                  De-escalate Alert
                </>
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default AlertCard;
