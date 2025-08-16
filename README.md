# RescueLink - Emergency Response Management System

A comprehensive emergency response management web application built with React + Vite, designed to monitor IoT devices, track alerts, and coordinate rescue operations in real-time.

## 🚨 Project Overview

**RescueLink** is an advanced emergency response management system that provides real-time monitoring of rescue devices, alert management, and comprehensive analytics for emergency response teams. The application serves as a central command center for coordinating rescue operations and managing IoT-enabled emergency devices.

## 📁 Project Structure

```
RescueLink-version1.1/
├── public/                 # Static assets
├── src/
│   ├── components/         # Reusable UI components
│   │   ├── AlertCard.jsx
│   │   ├── DeviceCard.jsx
│   │   ├── Layout.jsx
│   │   ├── Login.jsx
│   │   └── NotificationProvider.jsx
│   ├── hooks/             # Custom React hooks
│   │   ├── useAuth.js
│   │   ├── useAlertPolling.js
│   │   ├── useDevicePolling.js
│   │   └── useWebSocket.js
│   ├── pages/             # Application pages/screens
│   │   ├── Dashboard.jsx
│   │   ├── DeviceMap.jsx
│   │   ├── Analytics.jsx
│   │   ├── Alerts.jsx
│   │   ├── Admin.jsx
│   │   ├── SOSTrigger.jsx
│   │   └── ResetPassword.jsx
│   ├── services/          # API and external services
│   │   ├── auth.js
│   │   ├── adminServices.js
│   │   └── websocket.js
│   ├── data/              # Static data and configurations
│   ├── types/             # TypeScript type definitions
│   ├── utils/             # Utility functions
│   └── App.jsx            # Main application component
├── .env                   # Environment variables
├── package.json           # Project dependencies
├── tailwind.config.js     # TailwindCSS configuration
├── vite.config.js         # Vite build configuration
└── vercel.json            # Deployment configuration
```

## 🚀 Key Features

### **Real-time Device Monitoring**
- **IoT Device Tracking**: Monitor connected rescue devices with live status updates
- **Battery Level Monitoring**: Track device battery levels with low-battery alerts
- **Connection Status**: Real-time device connectivity monitoring via LoRaWAN
- **Device Location Tracking**: GPS coordinates and mapping integration

### **Alert Management System**
- **Multi-severity Alerts**: Handle critical, high, medium, and low priority alerts
- **Real-time Notifications**: Instant alert notifications for emergency situations
- **SOS Trigger System**: Emergency SOS activation and response coordination
- **Alert Resolution Tracking**: Monitor alert status from creation to resolution

### **Interactive Dashboard**
- **Role-based Access**: Different dashboards for users, operators, and administrators
- **Real-time Metrics**: Live statistics on device status, alerts, and system health
- **Device Analytics**: Comprehensive device performance and usage analytics
- **Historical Data**: Track trends and generate reports

### **Mapping & Geolocation**
- **Interactive Maps**: Real-time device locations using Leaflet/React-Leaflet
- **Geospatial Analytics**: Location-based emergency response coordination
- **Route Planning**: Emergency route optimization for rescue operations

### **Advanced Analytics**
- **Performance Metrics**: Device uptime, response times, and efficiency tracking
- **Data Visualization**: Charts and graphs using Recharts library
- **Predictive Analytics**: Emergency pattern analysis and forecasting
- **Custom Reports**: Generate detailed operational reports

### **Security & Authentication**
- **Multi-role Authentication**: User, operator, and admin access levels
- **Secure Login System**: JWT-based authentication with password reset
- **Admin Panel**: Administrative controls for user and system management
- **Protected Routes**: Role-based route protection and access control

## 🛠 Technology Stack

### **Frontend Technologies**
- **React 19.1.1** - Modern React with latest features and concurrent rendering
- **Vite 7.0.4** - Lightning-fast build tool and development server
- **React Router DOM 7.7.1** - Client-side routing and navigation
- **TailwindCSS 3.4.17** - Utility-first CSS framework for responsive design

### **Mapping & Visualization**
- **Leaflet 1.9.4** - Open-source interactive mapping library
- **React-Leaflet 5.0.0** - React components for Leaflet maps
- **Recharts 3.1.0** - Composable charting library for data visualization
- **Lucide-React 0.536.0** - Beautiful & customizable icon library

### **HTTP & Communication**
- **Axios 1.11.0** - Promise-based HTTP client for API communication
- **WebSocket Integration** - Real-time bidirectional communication
- **Custom Polling Hooks** - Automated data fetching and updates

### **Development & Build Tools**
- **ESLint** - Code linting and quality assurance
- **PostCSS & Autoprefixer** - CSS processing and browser compatibility
- **TypeScript Support** - Type definitions for enhanced development

### **Deployment & Infrastructure**
- **Vercel** - Cloud deployment platform (rescue-link-ui.vercel.app)
- **Environment Configuration** - Secure API key and configuration management

## 📋 Getting Started

### **Prerequisites**
- Node.js 18+ (LTS recommended)
- npm or yarn package manager
- Modern web browser with WebSocket support

### **Installation**

1. **Clone the repository:**
   ```bash
   git clone https://github.com/Abhicanvas/Rescue_Link-version1.1.git
   cd Rescue_Link-version1.1
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Environment setup:**
   Create a `.env` file in the root directory:


4. **Start development server:**
   ```bash
   npm run dev
   ```

5. **Access the application:**
   Open [http://localhost:5173](http://localhost:5173) in your browser

### **Build for Production**
```bash
npm run build
npm run preview
```

## 🎯 Application Features

### **Dashboard Views**

**User Dashboard:**
- Personal device monitoring
- Individual alert management
- Device-specific analytics
- SOS trigger access

**Admin/Operator Dashboard:**
- System-wide device overview
- All alerts and notifications
- Comprehensive analytics
- User management capabilities

### **Core Functionalities**

**Device Management:**
- Real-time device status monitoring
- Battery level tracking with alerts
- Location-based device mapping
- Device configuration and control

**Alert System:**
- Multi-level alert categorization
- Automated notification system
- Alert resolution workflow
- Emergency escalation procedures

**Analytics & Reporting:**
- Real-time performance metrics
- Historical data analysis
- Custom report generation
- Predictive maintenance insights

**Security Features:**
- Role-based access control
- Secure authentication system
- Admin panel for user management
- Password reset functionality

## 🔧 Development

### **Available Scripts**
- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint code analysis

### **Project Architecture**
- **Component-based Design**: Modular, reusable UI components
- **Custom Hooks**: Specialized hooks for authentication, polling, and WebSocket
- **Service Layer**: Centralized API communication and business logic
- **Real-time Updates**: WebSocket integration for live data streaming

### **Code Organization**
- Clean separation of concerns with dedicated folders
- Reusable components with prop-based customization
- Custom hooks for complex state management
- Utility functions for common operations

## 🌐 Deployment

The application is deployed on Vercel at [rescue-link-ui.vercel.app](https://rescue-link-ui.vercel.app)

**Deployment Features:**
- Automatic deployments from Git commits
- Environment variable management
- CDN distribution for optimal performance
- SSL/TLS encryption

## 🔐 User Roles & Permissions

**User Role:**
- View assigned device status
- Receive device-specific alerts
- Access personal dashboard
- Trigger SOS emergencies

**Operator Role:**
- Monitor all system devices
- Manage alerts and notifications
- Access analytics and reports
- Coordinate emergency responses

**Administrator Role:**
- Full system access and control
- User management capabilities
- System configuration
- Advanced analytics and reporting

## 🚨 Emergency Features

**SOS System:**
- One-click emergency activation
- Automatic location broadcasting
- Multi-channel alert distribution
- Emergency contact notification

**Real-time Monitoring:**
- Live device status updates
- Automatic polling every 60 seconds
- WebSocket-based instant notifications
- Connection status monitoring

## 📄 License

This project is proprietary software. All rights reserved.

## 👨‍💻 Development Team

**Developers:** 
- GitHub: [@Abhicanvas](https://github.com/Abhicanvas)
- DATAPIRATE17
- RohitRgt8


## 🆘 Support & Contact

For technical support or emergency system issues:
- GitHub Issues: [Report bugs and feature requests](https://github.com/Abhicanvas/Rescue_Link-version1.1/issues)
- Email: Contact through GitHub profile

## 🏷️ Version Information

**Current Version:** 1.1
**Build Status:** Production Ready
**Last Updated:** January 2025

---

*RescueLink - Connecting Lives, Saving Time in Emergency Response Operations*
