import React from 'react';
import { Navigate } from 'react-router-dom';
import MaintenanceScreen from '../pages/MaintenanceScreen';

const ProtectedRoute = ({ children }) => {
  const isAuthenticated = localStorage.getItem('isAuthenticated') === 'true';
  const isSystemLocked = localStorage.getItem('systemLocked') === 'true';
  const userRole = localStorage.getItem('userRole') || 'user';

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // Show maintenance screen if system is locked and user is not admin
  if (isSystemLocked && userRole !== 'admin') {
    return <MaintenanceScreen />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;
