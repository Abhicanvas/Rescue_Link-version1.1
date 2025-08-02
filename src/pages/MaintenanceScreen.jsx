import React from 'react';
import { Shield, Wrench, Clock, Mail } from 'lucide-react';

const MaintenanceScreen = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-gray-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full text-center">
        {/* Logo and Icon */}
        <div className="mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-blue-100 rounded-full mb-4">
            <Wrench className="h-10 w-10 text-blue-600" />
          </div>
          <div className="flex items-center justify-center mb-4">
            <Shield className="h-8 w-8 text-blue-600 mr-2" />
            <h1 className="text-2xl font-bold text-blue-600">RescueLink</h1>
          </div>
        </div>

        {/* Maintenance Message */}
        <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-8 mb-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Website Under Maintenance
          </h2>
          
          <div className="space-y-4 text-gray-600">
            <p className="text-lg">
              We're currently performing scheduled maintenance to improve your experience.
            </p>
            
            <div className="flex items-center justify-center space-x-2 text-sm">
              <Clock className="h-4 w-4" />
              <span>Expected completion: Within 2 hours</span>
            </div>
            
            <p className="text-sm">
              Our emergency response systems remain fully operational during this maintenance window.
            </p>
          </div>

          {/* Contact Information */}
          <div className="mt-6 p-4 bg-blue-50 rounded-lg">
            <div className="flex items-center justify-center mb-2">
              <Mail className="h-4 w-4 text-blue-600 mr-2" />
              <span className="text-sm font-medium text-blue-800">Contact Admin</span>
            </div>
            <p className="text-sm text-blue-700">
              For urgent matters, please contact your system administrator
            </p>
            <p className="text-sm text-blue-600 font-medium mt-1">
              admin@rescuelink.com
            </p>
          </div>
        </div>

        {/* Status Indicator */}
        <div className="flex items-center justify-center space-x-2 text-sm text-gray-500">
          <div className="h-2 w-2 bg-yellow-500 rounded-full animate-pulse"></div>
          <span>System maintenance in progress</span>
        </div>

        {/* Footer */}
        <div className="mt-8 text-xs text-gray-400">
          <p>RescueLink Emergency Response System</p>
          <p>© 2024 All rights reserved</p>
        </div>
      </div>
    </div>
  );
};

export default MaintenanceScreen;
