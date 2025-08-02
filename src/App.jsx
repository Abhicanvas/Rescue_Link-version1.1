import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './hooks/useAuth';
import { authService } from './services/auth';
import ErrorBoundary from './components/ErrorBoundary';
import NotificationProvider from './components/NotificationProvider';
import LoadingSpinner from './components/LoadingSpinner';
import Login from './components/Login';
import ProtectedRoute from './components/ProtectedRoute';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import DeviceMap from './pages/DeviceMap';
import Analytics from './pages/Analytics';
import Alerts from './pages/Alerts';
import Admin from './pages/Admin';
import SOSTrigger from './pages/SOSTrigger';
import AdminLock from './pages/Adminlock';
function AppContent() {
  const { isAuthenticated, isLoading } = useAuth();

  useEffect(() => {
    // Initialize auth service on app startup
    authService.initialize();
  }, []);

  if (isLoading) {
    return <LoadingSpinner fullScreen size="large" text="Loading RescueLink..." />;
  }

  if (!isAuthenticated) {
    return <Login />;
  }

  return (
    <Layout>
      <Routes>
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        <Route 
          path="/dashboard" 
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/devices" 
          element={
            <ProtectedRoute requiredRole="operator">
              <DeviceMap />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/alerts" 
          element={
            <ProtectedRoute>
              <Alerts />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/analytics" 
          element={
            <ProtectedRoute requiredRole="operator">
              <Analytics />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/admin" 
          element={
            <ProtectedRoute requiredRole="admin">
              <Admin />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/sos-trigger" 
          element={
            <ProtectedRoute requiredRole="admin">
              <SOSTrigger />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/adminlock" 
          element={
            <ProtectedRoute requiredRole="admin">
              <AdminLock/>
            </ProtectedRoute>
          } 
        />
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </Layout>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <NotificationProvider>
        <Router>
          <AppContent />
        </Router>
      </NotificationProvider>
    </ErrorBoundary>
  );
}

export default App;
