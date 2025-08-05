import React, { useState, useEffect, useRef } from 'react';
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
  const [notificationOpen, setNotificationOpen] = useState(false);
  const notificationRef = useRef(null);
  const location = useLocation();
  const { user, logout } = useAuth();
  const { isConnected } = useWebSocket();
  const { success, error } = useNotification();
  const userRole = user?.role || 'user';

  // Logo marquee data - replace these with your actual logos later
  const marqueeLogos = [
    { id: 1, src: '/New_Signal_Logo-removebg.png', alt: 'Partner Logo 1' },
    { id: 2, src: '/ieee-humanitarian-technologies-ogimage-logo-removebg-preview.png', alt: 'Partner Logo 2' },
    { id: 3, src: '/T4G.png', alt: 'Partner Logo 3' },
    { id: 4, src: '/ieee-1.svg', alt: 'Partner Logo 4' },
  ];

  // Close notification dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (notificationRef.current && !notificationRef.current.contains(event.target)) {
        setNotificationOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const getNavigation = () => {
    const baseNav = [{ name: 'Dashboard', href: '/', icon: Home }];

    if (userRole === 'admin') {
      return [
        ...baseNav,
        { name: 'Device Map', href: '/devices', icon: Map },
        { name: 'Alerts', href: '/alerts', icon: AlertTriangle },
        { name: 'SOS Trigger', href: '/sos-trigger', icon: Zap },
        { name: 'Admin Lock', href: '/adminlock', icon: Lock },
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
      return baseNav;
    }
  };

  const navigation = getNavigation();
  const isActive = (path) => location.pathname === path;

  return (
    <div className="h-screen flex bg-gray-50 overflow-hidden">
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-gray-600 bg-opacity-75 z-20 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div
        className={`fixed inset-y-0 left-0 z-30 h-screen w-64 bg-white shadow-lg transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-0
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
      `}
      >
        <div className="flex items-center justify-between h-16 px-6 border-b border-gray-200">
          <h1 className="text-xl font-bold text-blue-600">
            <img src="/rescue_link_logo_color.png" alt="Logo" />
          </h1>
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
                className={`flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-colors duration-200 ${
                  isActive(item.href)
                    ? 'bg-blue-50 text-blue-700 border-r-2 border-blue-600'
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                }`}
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
                  userRole === 'admin'
                    ? 'bg-purple-500'
                    : userRole === 'operator'
                    ? 'bg-blue-500'
                    : 'bg-green-500'
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

      {/* Main content wrapper */}
      <div className="flex-1 flex flex-col h-screen overflow-hidden">
        {/* Sticky top navbar */}
        <header className="sticky top-0 z-10 bg-white shadow-sm border-b border-gray-200 w-full">
          <div className="flex items-center justify-between h-16 px-6">
            <div className="flex items-center">
              <button
                onClick={() => setSidebarOpen(true)}
                className="lg:hidden p-2 rounded-md text-gray-400 hover:text-gray-600"
              >
                <Menu className="h-5 w-5" />
              </button>
            </div>

            {/* Logo Marquee - Now positioned between menu and user controls */}
            {/* In the marquee content section */}
<div className="hidden md:flex items-center flex-1 overflow-hidden mx-4 h-full">
  <div className="marquee-container w-full h-full flex items-center">
    <div className="marquee-content flex items-center h-full">
      {[...marqueeLogos, ...marqueeLogos].map((logo, index) => (
        <img
          key={`${logo.id}-${index}`}
          src={logo.src}
          alt={logo.alt}
          className="h-8 w-auto mx-6 object-contain opacity-70 hover:opacity-100 transition-all hover:scale-105"
        />
      ))}
    </div>
  </div>
</div>

            <div className="flex items-center space-x-4">
              <div className="relative" ref={notificationRef}>
                <button 
                  onClick={() => setNotificationOpen(!notificationOpen)}
                  className="relative p-2 text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <Bell className="h-5 w-5" />
                  <span className="absolute top-0 right-0 h-2 w-2 bg-red-500 rounded-full"></span>
                </button>
                
                {/* Notification Dropdown */}
                {notificationOpen && (
                  <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-lg border border-gray-200 z-50">
                    <div className="p-4 border-b border-gray-200">
                      <h3 className="text-sm font-semibold text-gray-900">Notifications</h3>
                    </div>
                    <div className="max-h-96 overflow-y-auto">
                      <div className="p-4 text-center text-gray-500">
                        <Bell className="h-8 w-8 mx-auto mb-2 opacity-50" />
                        <p className="text-sm">No new notifications</p>
                      </div>
                    </div>
                    <div className="p-2 border-t border-gray-200">
                      <button 
                        onClick={() => setNotificationOpen(false)}
                        className="w-full text-center text-sm text-blue-600 hover:text-blue-800 py-2"
                      >
                        Close
                      </button>
                    </div>
                  </div>
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

        {/* Scrollable main content area */}
        <main className="flex-1 overflow-y-auto bg-gray-50 p-4">
          {children}
        </main>
      </div>

      {/* Add custom animation for marquee */}
      <style jsx global>{`
  .marquee-container {
    width: 100%;
    overflow: hidden;
    position: relative;
  }
  
  .marquee-content {
    display: flex;
    align-items: center;
    animation: scroll-left 20s linear infinite;
  }
  
  .marquee-content img {
    height: 2rem; /* Equivalent to h-8 */
    margin: 0 1.5rem; /* Equivalent to mx-6 */
    opacity: 0.7;
    transition: opacity 0.3s, transform 0.3s;
  }
  
  .marquee-content img:hover {
    opacity: 1;
    transform: scale(1.1); /* 10% zoom on hover */
  }
  
  @keyframes scroll-left {
    0% {
      transform: translateX(0);
    }
    100% {
      transform: translateX(-50%);
    }
  }
`}</style>
    </div>
  );
};

export default Layout;