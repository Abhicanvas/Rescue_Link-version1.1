import React, { useState, useEffect } from 'react';
import { Lock, Unlock, Shield, Eye, EyeOff, AlertTriangle } from 'lucide-react';

const AdminLock = () => {
  const [isSystemLocked, setIsSystemLocked] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [action, setAction] = useState('lock'); // 'lock' | 'unlock'

  useEffect(() => {
    // Check if system is locked (in real app, this would be from backend)
    const systemLocked = localStorage.getItem('systemLocked') === 'true';
    setIsSystemLocked(systemLocked);
  }, []);

  const handleLockAction = (actionType) => {
    setAction(actionType);
    setShowPasswordModal(true);
  };

  const handleConfirmAction = async () => {
    setLoading(true);

    // Simulate password verification
    if (password !== 'admin123') {
      alert('Incorrect admin password. Please try again.');
      setLoading(false);
      return;
    }

    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1500));

    if (action === 'lock') {
      localStorage.setItem('systemLocked', 'true');
      setIsSystemLocked(true);
    } else {
      localStorage.removeItem('systemLocked');
      setIsSystemLocked(false);
    }

    setLoading(false);
    setShowPasswordModal(false);
    setPassword('');
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center">
            <Shield className="h-8 w-8 text-purple-600 mr-3" />
            Admin System Lock
          </h1>
          <p className="text-gray-600">Control system access for maintenance and updates</p>
        </div>

        <div className="flex items-center space-x-2 text-sm">
          <div className={`h-2 w-2 rounded-full ${isSystemLocked ? 'bg-red-500' : 'bg-green-500'}`}></div>
          <span className={`font-medium ${isSystemLocked ? 'text-red-600' : 'text-green-600'}`}>
            {isSystemLocked ? 'SYSTEM LOCKED' : 'SYSTEM ACTIVE'}
          </span>
        </div>
      </div>

      {/* Current Status */}
      <div
        className={`rounded-lg p-6 ${
          isSystemLocked ? 'bg-red-50 border border-red-200' : 'bg-green-50 border border-green-200'
        }`}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            {isSystemLocked ? (
              <Lock className="h-8 w-8 text-red-600 mr-4" />
            ) : (
              <Unlock className="h-8 w-8 text-green-600 mr-4" />
            )}
            <div>
              <h2 className={`text-xl font-semibold ${isSystemLocked ? 'text-red-800' : 'text-green-800'}`}>
                {isSystemLocked ? 'System is Currently Locked' : 'System is Currently Active'}
              </h2>
              <p className={`text-sm ${isSystemLocked ? 'text-red-700' : 'text-green-700'}`}>
                {isSystemLocked
                  ? 'Users and operators will see maintenance screen when trying to access the system'
                  : 'All users and operators have normal access to the system'}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Warning Information */}
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
        <div className="flex items-start">
          <AlertTriangle className="h-5 w-5 text-yellow-600 mr-2 mt-0.5" />
          <div>
            <h3 className="text-sm font-medium text-yellow-800">Important Information</h3>
            <div className="text-sm text-yellow-700 mt-1 space-y-1">
              <p>• When system is locked, users and operators will see "Website under maintenance" message</p>
              <p>• Only admin users can access the system when locked</p>
              <p>• Use this feature during system updates, maintenance, or emergency situations</p>
              <p>• Remember to unlock the system after maintenance is complete</p>
            </div>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">System Control Actions</h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Lock System */}
          <div className="border border-red-200 rounded-lg p-4">
            <div className="flex items-center mb-3">
              <Lock className="h-6 w-6 text-red-600 mr-2" />
              <h4 className="font-medium text-red-800">Lock System</h4>
            </div>
            <p className="text-sm text-red-700 mb-4">
              Prevent users and operators from accessing the system. Show maintenance message.
            </p>
            <button
              onClick={() => handleLockAction('lock')}
              disabled={isSystemLocked}
              className="w-full bg-red-600 text-white py-2 px-4 rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSystemLocked ? 'System Already Locked' : 'Lock System'}
            </button>
          </div>

          {/* Unlock System */}
          <div className="border border-green-200 rounded-lg p-4">
            <div className="flex items-center mb-3">
              <Unlock className="h-6 w-6 text-green-600 mr-2" />
              <h4 className="font-medium text-green-800">Unlock System</h4>
            </div>
            <p className="text-sm text-green-700 mb-4">
              Restore normal access for all users and operators. Remove maintenance message.
            </p>
            <button
              onClick={() => handleLockAction('unlock')}
              disabled={!isSystemLocked}
              className="w-full bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {!isSystemLocked ? 'System Already Active' : 'Unlock System'}
            </button>
          </div>
        </div>
      </div>

      {/* System Status Log */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">Recent System Actions</h3>
        </div>
        <div className="p-6">
          <div className="space-y-3">
            <div className="flex items-center justify-between py-2 border-b border-gray-100">
              <div className="flex items-center">
                <div className="h-2 w-2 bg-green-500 rounded-full mr-3"></div>
                <span className="text-sm text-gray-700">System unlocked by admin</span>
              </div>
              <span className="text-xs text-gray-500">2 hours ago</span>
            </div>
            <div className="flex items-center justify-between py-2 border-b border-gray-100">
              <div className="flex items-center">
                <div className="h-2 w-2 bg-red-500 rounded-full mr-3"></div>
                <span className="text-sm text-gray-700">System locked for maintenance</span>
              </div>
              <span className="text-xs text-gray-500">4 hours ago</span>
            </div>
            <div className="flex items-center justify-between py-2">
              <div className="flex items-center">
                <div className="h-2 w-2 bg-green-500 rounded-full mr-3"></div>
                <span className="text-sm text-gray-700">System unlocked after update</span>
              </div>
              <span className="text-xs text-gray-500">1 day ago</span>
            </div>
          </div>
        </div>
      </div>

      {/* Password Confirmation Modal */}
      {showPasswordModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
            <div className="p-6">
              <div className="flex items-center mb-4">
                <Shield className="h-6 w-6 text-purple-600 mr-2" />
                <h3 className="text-lg font-semibold text-gray-900">
                  Confirm {action === 'lock' ? 'System Lock' : 'System Unlock'}
                </h3>
              </div>

              <div className="mb-4 p-3 bg-purple-50 border border-purple-200 rounded-lg">
                <p className="text-sm text-purple-700">
                  You are about to <strong>{action}</strong> the entire system.
                  {action === 'lock'
                    ? ' Users and operators will see a maintenance message.'
                    : ' Normal system access will be restored for all users.'}
                </p>
              </div>

              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">Admin Password</label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    placeholder="Enter admin password"
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
                  onClick={handleConfirmAction}
                  disabled={loading || !password.trim()}
                  className={`px-4 py-2 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${
                    action === 'lock' ? 'bg-red-600 hover:bg-red-700' : 'bg-green-600 hover:bg-green-700'
                  }`}
                >
                  {loading ? (
                    <div className="flex items-center">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Processing...
                    </div>
                  ) : (
                    `Confirm ${action === 'lock' ? 'Lock' : 'Unlock'}`
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

export default AdminLock;
