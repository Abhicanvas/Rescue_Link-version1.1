import React, { useState, useEffect } from 'react';
import { Zap, AlertTriangle, Shield } from 'lucide-react';
import { api } from '../utils/api';
import { SimpleNotification } from '../components/NotificationProvider';

const SOSTrigger = () => {
  const [devices, setDevices] = useState([]);
  const [selectedDevice, setSelectedDevice] = useState('');
  const [panicFlag, setPanicFlag] = useState(1);
  const [panicReason, setPanicReason] = useState(1);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [notification, setNotification] = useState(null);
  const userRole = localStorage.getItem('userRole') || 'user';

  const panicMessages = [
    { label: "General Panic", value: 1 },
    { label: "Landslide", value: 2 },
    { label: "Flood", value: 3 },
    { label: "Earthquake", value: 4 }
  ];

  useEffect(() => {
    const loadDevices = async () => {
      try {
        const devicesData = await api.getDevices();
        setDevices(devicesData);
      } catch (error) {
        console.error('Error loading devices:', error);
      }
    };

    loadDevices();
  }, []);


  const handleConfirmTrigger = async () => {
    setLoading(true);

    try {
      // Make API call to downlink endpoint
      const response = await api.request('/api/v1/downlink/send-downlink', {
        method: 'POST',
        body: JSON.stringify({
          device_id: selectedDevice,
          panic_flag: panicFlag,
          panic_reason: panicReason,
          trigger_flag: true
        })
      });

      setLoading(false);
      setShowConfirmModal(false);
      setSuccess(true);
      setNotification({ 
        type: 'success', 
        message: `SOS alert triggered successfully! Alert ID: ${response.alert_id}` 
      });

      // Reset success message after 3 seconds
      setTimeout(() => {
        setSuccess(false);
        setNotification(null);
      }, 3000);
    } catch (error) {
      setLoading(false);
      setNotification({ 
        type: 'error', 
        message: `Failed to trigger SOS: ${error.message}` 
      });
    }
  };

  const getDeviceName = (deviceId) => {
    const device = devices.find(d => d.device_id === deviceId);
    return device ? `${device.device_id} - ${device.device_name}` : deviceId;
  };

  const getPanicMessageLabel = (value) => {
    const message = panicMessages.find(m => m.value === value);
    return message ? message.label : 'Unknown';
  };

  const validateForm = () => {
    return selectedDevice && panicReason;
  };

  const showConfirmDialog = () => {
    if (!validateForm()) {
      setNotification({ type: 'error', message: 'Please select a device and panic message type.' });
      return;
    }
    setShowConfirmModal(true);
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center">
            <Zap className="h-8 w-8 text-orange-600 mr-3" />
            SOS Alert Trigger
          </h1>
          <p className="text-gray-600">Send emergency alerts to devices in the field</p>
        </div>

        <div className="flex items-center space-x-2 text-sm">
          <div className="h-2 w-2 bg-red-500 rounded-full animate-pulse"></div>
          <span className="text-red-600 font-medium">EMERGENCY SYSTEM</span>
        </div>
      </div>

      {/* Warning Banner */}
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <div className="flex items-center">
          <AlertTriangle className="h-5 w-5 text-red-600 mr-2" />
          <div>
            <h3 className="text-sm font-medium text-red-800">Critical System Warning</h3>
            <p className="text-sm text-red-700 mt-1">
              This system sends emergency alerts to field devices. Use only in genuine emergency situations.
              Misuse may result in unnecessary panic and resource deployment.
            </p>
          </div>
        </div>
      </div>

      {/* Success Message */}
      {success && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <div className="flex items-center">
            <Shield className="h-5 w-5 text-green-600 mr-2" />
            <div>
              <h3 className="text-sm font-medium text-green-800">Alert Sent Successfully</h3>
              <p className="text-sm text-green-700 mt-1">
                Emergency alert has been transmitted to {selectedDevice === 'all' ? 'all devices' : getDeviceName(selectedDevice)}.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* SOS Trigger Form */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">Emergency Alert Configuration</h2>
        </div>

        <div className="p-6 space-y-6">
          {/* Device Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Target Device *
            </label>
            <select
              value={selectedDevice}
              onChange={(e) => setSelectedDevice(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
              required
            >
              <option value="">Select a device...</option>
              {devices.map((device) => (
                <option key={device.device_id} value={device.device_id}>
                  {getDeviceName(device.device_name)}
                </option>
              ))}
            </select>
            <p className="text-sm text-gray-500 mt-1">
              Select the device to receive the SOS alert. Device ID must be in hex format.
            </p>
          </div>

          {/* Panic Message Type */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Emergency Alert Type *
            </label>
            <select
              value={panicReason}
              onChange={(e) => setPanicReason(Number(e.target.value))}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
              required
            >
              {panicMessages.map((message) => (
                <option key={message.value} value={message.value}>
                  {message.label}
                </option>
              ))}
            </select>
            <p className="text-sm text-gray-500 mt-1">
              Select the type of emergency alert to send to the device.
            </p>
          </div>

          {/* Panic Mode Toggle */}
          <div>
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={panicFlag === 1}
                onChange={(e) => setPanicFlag(e.target.checked ? 1 : 0)}
                className="rounded border-gray-300 text-red-600 focus:ring-red-500"
              />
              <span className="ml-2 text-sm font-medium text-gray-700">
                Activate Panic Mode
              </span>
            </label>
            <p className="text-sm text-gray-500 mt-1">
              When enabled, this will trigger immediate panic mode on the device.
            </p>
          </div>

          {/* Preview */}
          <div className="bg-gray-50 rounded-lg p-4">
            <h4 className="text-sm font-medium text-gray-700 mb-2">Alert Preview</h4>
            <div className="bg-red-100 border border-red-300 rounded-lg p-3">
              <div className="flex items-center mb-2">
                <AlertTriangle className="h-4 w-4 text-red-600 mr-2" />
                <span className="text-sm font-medium text-red-800">SOS EMERGENCY ALERT</span>
              </div>
              <p className="text-sm text-red-700 font-medium">{getPanicMessageLabel(panicReason)}</p>
              <p className="text-xs text-red-600 mt-2">
                Device: {selectedDevice ? getDeviceName(selectedDevice) : 'No device selected'}
              </p>
              <p className="text-xs text-red-600">
                Panic Mode: {panicFlag ? 'Activated' : 'Deactivated'}
              </p>
            </div>
          </div>

          {/* Trigger Button */}
          <div className="flex justify-end">
            <button
              onClick={showConfirmDialog}
              disabled={!validateForm()}
              className="inline-flex items-center px-6 py-3 bg-red-600 text-white font-medium rounded-lg hover:bg-red-700 focus:ring-2 focus:ring-red-500 focus:ring-offset-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Zap className="h-5 w-5 mr-2" />
              Trigger SOS Alert
            </button>
          </div>
        </div>
      </div>

      {/* Confirmation Modal */}
      {showConfirmModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
            <div className="p-6">
              <div className="flex items-center mb-4">
                <Shield className="h-6 w-6 text-red-600 mr-2" />
                <h3 className="text-lg font-semibold text-gray-900">Confirm SOS Alert</h3>
              </div>

              <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
                <div className="flex items-center mb-3">
                  <AlertTriangle className="h-5 w-5 text-red-600 mr-2" />
                  <span className="text-sm font-medium text-red-800">EMERGENCY ALERT CONFIRMATION</span>
                </div>
                <p className="text-sm text-red-700 mb-2">
                  You are about to send a <strong>{getPanicMessageLabel(panicReason)}</strong> SOS alert to:
                </p>
                <ul className="text-sm text-red-700 ml-4 space-y-1">
                  <li>• <strong>Device:</strong> {getDeviceName(selectedDevice)}</li>
                  <li>• <strong>Alert Type:</strong> {getPanicMessageLabel(panicReason)}</li>
                  <li>• <strong>Panic Mode:</strong> {panicFlag ? 'ACTIVATED' : 'DEACTIVATED'}</li>
                </ul>
                <p className="text-sm text-red-700 mt-3 font-medium">
                  Are you sure you want to proceed with this emergency alert?
                </p>
              </div>

              <div className="flex justify-end space-x-3">
                <button
                  onClick={() => setShowConfirmModal(false)}
                  disabled={loading}
                  className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleConfirmTrigger}
                  disabled={loading}
                  className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? (
                    <div className="flex items-center">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Sending SOS Alert...
                    </div>
                  ) : (
                    <div className="flex items-center">
                      <Zap className="h-4 w-4 mr-2" />
                      Send SOS Alert
                    </div>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Notification */}
      {notification && (
        <SimpleNotification
          message={notification.message}
          type={notification.type}
          onClose={() => setNotification(null)}
        />
      )}
    </div>
  );
};

export default SOSTrigger;
