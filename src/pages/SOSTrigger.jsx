import React, { useState, useEffect } from 'react';
import { Zap, AlertTriangle, Shield, Eye, EyeOff } from 'lucide-react';
import { api } from '../utils/api';

const SOSTrigger = () => {
  const [devices, setDevices] = useState([]);
  const [selectedDevice, setSelectedDevice] = useState('all');
  const [message, setMessage] = useState('Emergency Alert: Please evacuate immediately and move to safety.');
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const userRole = localStorage.getItem('userRole') || 'user';

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

  const handleTriggerSOS = () => {
    setShowPasswordModal(true);
  };

  const handleConfirmTrigger = async () => {
    setLoading(true);

    // Simulate password verification
    const correctPassword = userRole === 'admin' ? 'admin123' : 'operator123';

    if (password !== correctPassword) {
      alert('Incorrect password. Please try again.');
      setLoading(false);
      return;
    }

    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 2000));

    setLoading(false);
    setShowPasswordModal(false);
    setPassword('');
    setSuccess(true);

    // Reset success message after 3 seconds
    setTimeout(() => setSuccess(false), 3000);
  };

  const getDeviceName = (deviceId) => {
    const device = devices.find(d => d.device_id === deviceId);
    return device ? `${device.device_id} - ${device.site_name}` : deviceId;
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
              Target Device(s)
            </label>
            <select
              value={selectedDevice}
              onChange={(e) => setSelectedDevice(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
            >
              <option value="all">All Devices (Broadcast Alert)</option>
              {devices.map((device) => (
                <option key={device.device_id} value={device.device_id}>
                  {getDeviceName(device.device_id)}
                </option>
              ))}
            </select>
          </div>

          {/* Alert Message */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Emergency Alert Message
            </label>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              rows={4}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
              placeholder="Enter emergency alert message..."
            />
            <p className="text-sm text-gray-500 mt-1">
              This message will be displayed on the device and sent to associated contacts.
            </p>
          </div>

          {/* Preview */}
          <div className="bg-gray-50 rounded-lg p-4">
            <h4 className="text-sm font-medium text-gray-700 mb-2">Alert Preview</h4>
            <div className="bg-red-100 border border-red-300 rounded-lg p-3">
              <div className="flex items-center mb-2">
                <AlertTriangle className="h-4 w-4 text-red-600 mr-2" />
                <span className="text-sm font-medium text-red-800">EMERGENCY ALERT</span>
              </div>
              <p className="text-sm text-red-700">{message}</p>
              <p className="text-xs text-red-600 mt-2">
                Target: {selectedDevice === 'all' ? 'All Devices' : getDeviceName(selectedDevice)}
              </p>
            </div>
          </div>

          {/* Trigger Button */}
          <div className="flex justify-end">
            <button
              onClick={handleTriggerSOS}
              disabled={!message.trim()}
              className="inline-flex items-center px-6 py-3 bg-red-600 text-white font-medium rounded-lg hover:bg-red-700 focus:ring-2 focus:ring-red-500 focus:ring-offset-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Zap className="h-5 w-5 mr-2" />
              Trigger Emergency Alert
            </button>
          </div>
        </div>
      </div>

      {/* Password Confirmation Modal */}
      {showPasswordModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
            <div className="p-6">
              <div className="flex items-center mb-4">
                <Shield className="h-6 w-6 text-red-600 mr-2" />
                <h3 className="text-lg font-semibold text-gray-900">Confirm Emergency Alert</h3>
              </div>

              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-sm text-red-700">
                  You are about to send an emergency alert to{' '}
                  <strong>{selectedDevice === 'all' ? 'ALL DEVICES' : getDeviceName(selectedDevice)}</strong>.
                  Please confirm your {userRole} password to proceed.
                </p>
              </div>

              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {userRole === 'admin' ? 'Admin' : 'Operator'} Password
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                    placeholder="Enter your password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </button>
                </div>
              </div>

              <div className="flex justify-end space-x-3">
                <button
                  onClick={() => {
                    setShowPasswordModal(false);
                    setPassword('');
                  }}
                  className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleConfirmTrigger}
                  disabled={loading || !password.trim()}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? (
                    <div className="flex items-center">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Sending...
                    </div>
                  ) : (
                    'Confirm & Send Alert'
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SOSTrigger;
