import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { useWebSocket } from '../hooks/useWebSocket';
import { useNotification } from './NotificationProvider';
import {
  Home,
  Map,
  BarChart3,
  AlertTriangle,
  Settings,
  Shield,
  Menu,
  X,
  Bell,
  Search,
  Lock,
  Zap,
  LogOut,
  Wifi,
  WifiOff
} from 'lucide-react';

const Layout = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();
  const { user, logout } = useAuth();
  const { isConnected } = useWebSocket();
  const { success, error } = useNotification();
  const userRole = user?.role || 'user';

  const getNavigation = () => {
    const baseNav = [
      { name: 'Dashboard', href: '/', icon: Home }
    ];

    if (userRole === 'admin') {
      return [
        ...baseNav,
        { name: 'Device Map', href: '/devices', icon: Map },
        { name: 'Analytics', href: '/analytics', icon: BarChart3 },
        { name: 'Alerts', href: '/alerts', icon: AlertTriangle },
        { name: 'SOS Trigger', href: '/sos-trigger', icon: Zap },
        { name: 'Admin Lock', href: '/admin-lock', icon: Lock },
        { name: 'Admin', href: '/admin', icon: Settings }
      ];
    } else if (userRole === 'operator') {
      return [
        ...baseNav,
        { name: 'Device Map', href: '/devices', icon: Map },
        { name: 'Analytics', href: '/analytics', icon: BarChart3 },
        { name: 'Alerts', href: '/alerts', icon: AlertTriangle },
        { name: 'SOS Trigger', href: '/sos-trigger', icon: Zap }
      ];
    } else {
      return baseNav; // User only sees Dashboard
    }
  };

  const navigation = getNavigation();

  const isActive = (path) => {
    return location.pathname === path;
  };

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-gray-600 bg-opacity-75 z-20 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div
        className={`
          fixed inset-y-0 left-0 z-30 w-64 bg-white shadow-lg transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-0
          ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
        `}
      >
        <div className="flex items-center justify-between h-16 px-6 border-b border-gray-200">
          <div className="flex items-center">
            <Shield className="h-8 w-8 text-blue-600 mr-2" />
            <h1 className="text-xl font-bold text-blue-600">RescueLink</h1>
          </div>
          <button
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden p-2 rounded-md text-gray-400 hover:text-gray-600"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <nav className="mt-8 px-4">
          <div className="space-y-2">
            {navigation.map((item) => (
              <Link
                key={item.name}
                to={item.href}
                className={`
                  flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-colors duration-200
                  ${isActive(item.href)
                    ? 'bg-blue-50 text-blue-700 border-r-2 border-blue-600'
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                  }
                `}
                onClick={() => setSidebarOpen(false)}
              >
                <item.icon className="mr-3 h-5 w-5" />
                {item.name}
              </Link>
            ))}
          </div>
        </nav>

        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-gray-200">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div
                className={`h-8 w-8 rounded-full flex items-center justify-center ${
                  userRole === 'admin' ? 'bg-purple-500' :
                  userRole === 'operator' ? 'bg-blue-500' : 'bg-green-500'
                }`}
              >
                <Shield className="h-4 w-4 text-white" />
              </div>
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-700">
                {user?.name || user?.email?.split('@')[0] || 'User'}
              </p>
              <p className="text-xs text-gray-500 capitalize">
                {userRole} • {user?.email || 'user@rescuelink.com'}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top header */}
        <header className="bg-white shadow-sm border-b border-gray-200">
          <div className="flex items-center justify-between h-16 px-6">
            <div className="flex items-center">
              <button
                onClick={() => setSidebarOpen(true)}
                className="lg:hidden p-2 rounded-md text-gray-400 hover:text-gray-600"
              >
                <Menu className="h-5 w-5" />
              </button>

              <div className="hidden md:flex items-center ml-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search devices..."
                    className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent w-64"
                  />
                </div>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              <button className="relative p-2 text-gray-400 hover:text-gray-600 transition-colors">
                <Bell className="h-5 w-5" />
                <span className="absolute top-0 right-0 h-2 w-2 bg-red-500 rounded-full"></span>
              </button>

              <div className="h-6 w-px bg-gray-300"></div>

              <div className="flex items-center space-x-2">
                {isConnected ? (
                  <>
                    <Wifi className="h-4 w-4 text-green-500" />
                    <span className="text-sm text-gray-600">Connected</span>
                  </>
                ) : (
                  <>
                    <WifiOff className="h-4 w-4 text-red-500" />
                    <span className="text-sm text-gray-600">Disconnected</span>
                  </>
                )}
              </div>

              <div className="h-6 w-px bg-gray-300"></div>

              <button
                onClick={async () => {
                  try {
                    await logout();
                    success('Logged out successfully');
                  } catch (err) {
                    error('Logout failed');
                  }
                }}
                className="flex items-center text-sm text-gray-600 hover:text-gray-900 transition-colors"
              >
                <LogOut className="h-4 w-4 mr-1" />
                Logout
              </button>
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-auto">
          {children}
        </main>
      </div>
    </div>
  );
};

export default Layout;
