import React from 'react';
import { useAuth } from '../hooks/useAuth';
import { Shield, AlertTriangle } from 'lucide-react';

const ProtectedRoute = ({ children, requiredRole = null, fallback = null }) => {
  const { isAuthenticated, user } = useAuth();

  if (!isAuthenticated) {
    return fallback || (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <Shield className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">Authentication Required</h3>
          <p className="mt-1 text-sm text-gray-500">
            Please log in to access this page.
          </p>
        </div>
      </div>
    );
  }

  if (requiredRole) {
    const userRole = user?.role;
    const roleHierarchy = {
      admin: ['admin', 'operator', 'user'],
      operator: ['operator', 'user'],
      user: ['user']
    };

    const hasPermission = roleHierarchy[userRole]?.includes(requiredRole);

    if (!hasPermission) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
          <div className="text-center">
            <AlertTriangle className="mx-auto h-12 w-12 text-red-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">Access Denied</h3>
            <p className="mt-1 text-sm text-gray-500">
              You don't have permission to access this page.
            </p>
            <p className="mt-1 text-xs text-gray-400">
              Required role: {requiredRole} | Your role: {userRole}
            </p>
          </div>
        </div>
      );
    }
  }

  return children;
};

export default ProtectedRoute;
