import React, { useState, useEffect } from "react";
import {
  Settings,
  Users,
  Database,
  Download,
  Upload,
  Plus,
  Edit,
  Trash2,
  Save,
  Key,
  Loader,
} from "lucide-react";
import { deviceAPI, userAPI, settingsAPI, exportAPI, api, ApiError } from '../services/adminServices.js';

const Admin = () => {
  const [activeTab, setActiveTab] = useState("devices");
  const [showAddDevice, setShowAddDevice] = useState(false);
  const [showEditDevice, setShowEditDevice] = useState(false);
  const [showAddUser, setShowAddUser] = useState(false);
  const [showEditUser, setShowEditUser] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // State for devices and users
  const [devices, setDevices] = useState([]);
  const [users, setUsers] = useState([]);
  const [settings, setSettingsState] = useState({
    sosAlertThreshold: 30,
    lowBatteryThreshold: 20,
    vibrationSensitivity: "Medium",
    lorawanGatewayIP: "192.168.1.100",
    dataUpdateInterval: 60,
    backupServerURL: "",
  });

  const [editingDevice, setEditingDevice] = useState(null);
  const [newDeviceData, setNewDeviceData] = useState({
    id: "",
    siteName: "",
    deviceName: "",
    assignedUser: "",
    latitude: "",
    longitude: "",
    status: "Active",
  });

  const [editingUser, setEditingUser] = useState(null);
  const [newUserData, setNewUserData] = useState({
    id: "",
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    role: "user",
    password: "",
  });

  const tabs = [
    { id: "devices", label: "Device Management", icon: Settings },
    { id: "users", label: "User Management", icon: Users },
    { id: "settings", label: "System Settings", icon: Settings },
    { id: "data", label: "Data Management", icon: Database },
  ];

  // Test API connection on component mount
  useEffect(() => {
    const testConnection = async () => {
      try {
        if (api.isAuthenticated()) {
          console.log('API connection test: authenticated');
          const profile = await api.getProfile();
          console.log('API connection successful, user:', profile);
        } else {
          console.warn('API connection test: not authenticated');
          setError('Authentication required. Please log in.');
        }
      } catch (err) {
        if (err instanceof ApiError) {
          console.error('API connection test failed:', err.message);
          if (err.status === 401) {
            setError('Authentication expired. Please log in again.');
          } else {
            setError(`Connection failed: ${err.message}`);
          }
        } else {
          console.error('API connection test failed:', err);
          setError('Network connection failed. Please check your connection.');
        }
      }
    };
    
    testConnection();
  }, []);

  // Fetch data on component mount and tab change
  useEffect(() => {
    if (activeTab === "devices") {
      fetchDevices();
    } else if (activeTab === "users") {
      fetchUsers();
    } else if (activeTab === "settings") {
      fetchSettings();
    }
  }, [activeTab]);

  // Helper function to extract data from API response
  const extractResponseData = (response, dataKey = null) => {
    if (dataKey && response.data[dataKey]) {
      return response.data[dataKey];
    }
    
    if (response.data.data) return response.data.data;
    if (response.data.users) return response.data.users;
    if (response.data.results) return response.data.results;
    
    return response.data;
  };

  // API call functions
  const fetchDevices = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await deviceAPI.getAll();
      const deviceData = extractResponseData(response);
      setDevices(Array.isArray(deviceData) ? deviceData : []);
    } catch (err) {
      let errorMessage = 'Failed to fetch devices';
      
      if (err instanceof ApiError) {
        errorMessage = err.message;
        if (err.status === 401) {
          window.location.href = '/login';
          return;
        }
      }
      
      setError(errorMessage);
      console.error('Error fetching devices:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchUsers = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await userAPI.getAll();
      console.log('Users API Response:', response.data);
      
      const userData = extractResponseData(response);
      setUsers(Array.isArray(userData) ? userData : []);
    } catch (err) {
      let errorMessage = 'Failed to fetch users';
      
      if (err instanceof ApiError) {
        errorMessage = err.message;
        if (err.status === 401) {
          window.location.href = '/login';
          return;
        }
      } else if (err.response?.data?.message) {
        errorMessage = err.response.data.message;
      }
      
      setError(errorMessage);
      console.error('Error fetching users:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchSettings = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await settingsAPI.get();
      const settingsData = extractResponseData(response);
      setSettingsState(settingsData);
    } catch (err) {
      let errorMessage = 'Failed to fetch settings';
      
      if (err instanceof ApiError) {
        errorMessage = err.message;
      }
      
      setError(errorMessage);
      console.error('Error fetching settings:', err);
    } finally {
      setLoading(false);
    }
  };

  // Device operations
  const handleAddDevice = async () => {
    if (
      !newDeviceData.id ||
      !newDeviceData.siteName ||
      !newDeviceData.deviceName ||
      !newDeviceData.assignedUser ||
      !newDeviceData.latitude ||
      !newDeviceData.longitude
    ) {
      alert("Please fill all required fields.");
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const response = await deviceAPI.create(newDeviceData);
      const newDevice = extractResponseData(response);
      setDevices(prev => [...prev, newDevice]);
      
      setNewDeviceData({
        id: "",
        siteName: "",
        deviceName: "",
        assignedUser: "",
        latitude: "",
        longitude: "",
        status: "Active",
      });
      setShowAddDevice(false);
      alert('Device added successfully!');
    } catch (err) {
      let errorMessage = 'Failed to add device';
      
      if (err instanceof ApiError) {
        errorMessage = err.message;
      }
      
      setError(errorMessage);
      console.error('Error adding device:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateDevice = async () => {
    if (
      !newDeviceData.id ||
      !newDeviceData.siteName ||
      !newDeviceData.deviceName ||
      !newDeviceData.assignedUser ||
      !newDeviceData.latitude ||
      !newDeviceData.longitude
    ) {
      alert("Please fill all required fields.");
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const response = await deviceAPI.update(editingDevice.id, newDeviceData);
      const updatedDevice = extractResponseData(response);
      
      setDevices(prev => prev.map(dev => 
        dev.id === editingDevice.id ? updatedDevice : dev
      ));
      
      setEditingDevice(null);
      setShowEditDevice(false);
      setNewDeviceData({
        id: "",
        siteName: "",
        deviceName: "",
        assignedUser: "",
        latitude: "",
        longitude: "",
        status: "Active",
      });
      alert('Device updated successfully!');
    } catch (err) {
      let errorMessage = 'Failed to update device';
      
      if (err instanceof ApiError) {
        errorMessage = err.message;
      }
      
      setError(errorMessage);
      console.error('Error updating device:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteDevice = async (deviceId) => {
    if (!window.confirm('Are you sure you want to delete this device?')) {
      return;
    }

    try {
      setLoading(true);
      setError(null);
      await deviceAPI.delete(deviceId);
      setDevices(prev => prev.filter(dev => dev.id !== deviceId));
      alert('Device deleted successfully!');
    } catch (err) {
      let errorMessage = 'Failed to delete device';
      
      if (err instanceof ApiError) {
        errorMessage = err.message;
      }
      
      setError(errorMessage);
      console.error('Error deleting device:', err);
    } finally {
      setLoading(false);
    }
  };

  // User operations
  const handleAddUser = async () => {
    if (
      !newUserData.firstName ||
      !newUserData.lastName ||
      !newUserData.email ||
      !newUserData.phone ||
      !newUserData.password
    ) {
      alert("Please fill all required fields.");
      return;
    }

    try {
      setLoading(true);
      setError(null);
      
      const userData = {
        first_name: newUserData.firstName,
        last_name: newUserData.lastName,
        email: newUserData.email,
        phone: newUserData.phone,
        role: newUserData.role,
        password: newUserData.password,
      };

      const response = await userAPI.create(userData);
      const newUser = extractResponseData(response);
      setUsers(prev => [...prev, newUser]);
      
      setNewUserData({
        id: "",
        firstName: "",
        lastName: "",
        email: "",
        phone: "",
        role: "user",
        password: "",
      });
      setShowAddUser(false);
      alert('User added successfully!');
    } catch (err) {
      let errorMessage = 'Failed to add user';
      
      if (err instanceof ApiError) {
        errorMessage = err.message;
      } else if (typeof err === 'object' && err.message) {
        errorMessage = err.message;
      }
      
      setError(errorMessage);
      console.error('Error adding user:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateUser = async () => {
    if (
      !newUserData.firstName ||
      !newUserData.lastName ||
      !newUserData.email ||
      !newUserData.phone
    ) {
      alert("Please fill all required fields.");
      return;
    }

    try {
      setLoading(true);
      setError(null);
      
      const userData = {
        first_name: newUserData.firstName,
        last_name: newUserData.lastName,
        email: newUserData.email,
        phone: newUserData.phone,
        role: newUserData.role,
      };

      const response = await userAPI.update(editingUser.id, userData);
      const updatedUser = extractResponseData(response);
      
      setUsers(prev => prev.map(usr => 
        usr.id === editingUser.id ? updatedUser : usr
      ));
      
      setEditingUser(null);
      setShowEditUser(false);
      setNewUserData({
        id: "",
        firstName: "",
        lastName: "",
        email: "",
        phone: "",
        role: "user",
        password: "",
      });
      alert('User updated successfully!');
    } catch (err) {
      let errorMessage = 'Failed to update user';
      
      if (err instanceof ApiError) {
        errorMessage = err.message;
      } else if (typeof err === 'object' && err.message) {
        errorMessage = err.message;
      }
      
      setError(errorMessage);
      console.error('Error updating user:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteUser = async (userId) => {
    if (!window.confirm('Are you sure you want to delete this user?')) {
      return;
    }

    try {
      setLoading(true);
      setError(null);
      await userAPI.delete(userId);
      setUsers(prev => prev.filter(usr => usr.id !== userId));
      alert('User deleted successfully!');
    } catch (err) {
      let errorMessage = 'Failed to delete user';
      
      if (err instanceof ApiError) {
        errorMessage = err.message;
      }
      
      setError(errorMessage);
      console.error('Error deleting user:', err);
    } finally {
      setLoading(false);
    }
  };

  // Settings operations
  const handleSaveSettings = async () => {
    try {
      setLoading(true);
      setError(null);
      await settingsAPI.update(settings);
      alert('Settings saved successfully!');
    } catch (err) {
      let errorMessage = 'Failed to save settings';
      
      if (err instanceof ApiError) {
        errorMessage = err.message;
      }
      
      setError(errorMessage);
      console.error('Error saving settings:', err);
    } finally {
      setLoading(false);
    }
  };

  // Export operations
  const handleExport = async (type, format = 'csv') => {
    try {
      setLoading(true);
      setError(null);
      let response;
      
      switch (type) {
        case 'devices':
          response = await exportAPI.devices(format);
          break;
        case 'alerts':
          response = await exportAPI.alerts(format);
          break;
        case 'reports':
          response = await exportAPI.reports(format);
          break;
        default:
          throw new Error('Invalid export type');
      }

      // Handle the response data
      const blob = new Blob([response.data], {
        type: format === 'csv' ? 'text/csv' : 'application/pdf'
      });
      
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `${type}_export.${format}`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      
      alert(`${type} exported successfully!`);
    } catch (err) {
      let errorMessage = `Failed to export ${type}`;
      
      if (err instanceof ApiError) {
        errorMessage = err.message;
      }
      
      setError(errorMessage);
      console.error(`Error exporting ${type}:`, err);
    } finally {
      setLoading(false);
    }
  };

  // Generate random password
  const generatePassword = () => {
    const chars =
      "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*";
    let password = "";
    for (let i = 0; i < 12; i++) {
      password += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setNewUserData(d => ({ ...d, password }));
  };

  // Helper functions
  const startEditDevice = (device) => {
    setEditingDevice(device);
    setNewDeviceData({ ...device });
    setShowEditDevice(true);
  };

  const startEditUser = (user) => {
    setEditingUser(user);
    // Handle different user name formats
    const fullName = user.name || `${user.first_name || ''} ${user.last_name || ''}`.trim();
    const [firstName, ...lastNameParts] = fullName.split(" ");
    
    setNewUserData({
      id: user.id,
      firstName: firstName || user.first_name || '',
      lastName: lastNameParts.join(" ") || user.last_name || '',
      email: user.email,
      phone: user.phone,
      role: user.role ? user.role.toLowerCase() : 'user',
      password: "",
    });
    setShowEditUser(true);
  };

  // Error display component
  const ErrorMessage = ({ message, onClose }) => (
    <div className="bg-red-50 border border-red-200 rounded-md p-4 mb-4">
      <div className="flex justify-between items-center">
        <p className="text-red-800">{message}</p>
        <button
          onClick={onClose}
          className="text-red-600 hover:text-red-800 text-xl font-bold"
        >
          ×
        </button>
      </div>
    </div>
  );

  // Loading spinner component
  const LoadingSpinner = () => (
    <div className="flex justify-center items-center py-4">
      <Loader className="animate-spin h-6 w-6 text-blue-600" />
    </div>
  );

  // Simple reusable modal component
  const Modal = ({ children, onClose, title }) => (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded shadow-lg max-w-lg w-full max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center border-b px-6 py-3">
          <h3 className="text-lg font-semibold">{title}</h3>
          <button onClick={onClose} className="text-xl font-bold leading-none">&times;</button>
        </div>
        <div className="p-6">{children}</div>
      </div>
    </div>
  );

  // Device form component for Add/Edit
  const DeviceForm = ({ deviceData, setDeviceData, users, onSubmit, submitText, onCancel, loading }) => (
    <form onSubmit={(e) => { e.preventDefault(); onSubmit(); }}>
      <div className="space-y-4">
        <div>
          <label className="block mb-1 font-medium">Device ID</label>
          <input
            type="text"
            value={deviceData.id}
            onChange={(e) => setDeviceData({ ...deviceData, id: e.target.value })}
            className="w-full border rounded px-3 py-2"
            required
            disabled={submitText === "Update Device"}
          />
        </div>
        <div>
          <label className="block mb-1 font-medium">Site Name</label>
          <input
            type="text"
            value={deviceData.siteName}
            onChange={(e) => setDeviceData({ ...deviceData, siteName: e.target.value })}
            className="w-full border rounded px-3 py-2"
            required
          />
        </div>
        <div>
          <label className="block mb-1 font-medium">Device Name</label>
          <input
            type="text"
            value={deviceData.deviceName}
            onChange={(e) => setDeviceData({ ...deviceData, deviceName: e.target.value })}
            className="w-full border rounded px-3 py-2"
            required
          />
        </div>
        <div>
          <label className="block mb-1 font-medium">Assigned User</label>
          <select
            value={deviceData.assignedUser}
            onChange={(e) => setDeviceData({ ...deviceData, assignedUser: e.target.value })}
            className="w-full border rounded px-3 py-2"
            required
          >
            <option value="">Select User</option>
            {users
              .filter(u => (u.role || '').toLowerCase() === "user")
              .map(u => (
                <option key={u.id} value={u.full_name}>
                  {u.full_name}
                </option>
            ))}
          </select>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block mb-1 font-medium">Latitude</label>
            <input
              type="number"
              step="0.000001"
              value={deviceData.latitude}
              onChange={(e) => setDeviceData({ ...deviceData, latitude: e.target.value })}
              className="w-full border rounded px-3 py-2"
              required
            />
          </div>
          <div>
            <label className="block mb-1 font-medium">Longitude</label>
            <input
              type="number"
              step="0.000001"
              value={deviceData.longitude}
              onChange={(e) => setDeviceData({ ...deviceData, longitude: e.target.value })}
              className="w-full border rounded px-3 py-2"
              required
            />
          </div>
        </div>
        <div className="flex justify-end space-x-3 pt-4">
          <button 
            type="button" 
            onClick={onCancel} 
            className="border px-4 py-2 rounded"
            disabled={loading}
          >
            Cancel
          </button>
          <button 
            type="submit" 
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:opacity-50 flex items-center"
            disabled={loading}
          >
            {loading && <Loader className="animate-spin h-4 w-4 mr-2" />}
            {submitText}
          </button>
        </div>
      </div>
    </form>
  );

  // User form component Add/Edit
  const UserForm = ({ userData, setUserData, onSubmit, generatePassword, submitText, onCancel, loading }) => (
    <form onSubmit={(e) => { e.preventDefault(); onSubmit(); }}>
      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block mb-1 font-medium">First Name</label>
            <input
              type="text"
              value={userData.firstName}
              onChange={(e) => setUserData({ ...userData, firstName: e.target.value })}
              className="w-full border rounded px-3 py-2"
              required
            />
          </div>
          <div>
            <label className="block mb-1 font-medium">Last Name</label>
            <input
              type="text"
              value={userData.lastName}
              onChange={(e) => setUserData({ ...userData, lastName: e.target.value })}
              className="w-full border rounded px-3 py-2"
              required
            />
          </div>
        </div>
        <div>
          <label className="block mb-1 font-medium">Email</label>
          <input
            type="email"
            value={userData.email}
            onChange={(e) => setUserData({ ...userData, email: e.target.value })}
            className="w-full border rounded px-3 py-2"
            required
            disabled={submitText === "Update User"}
          />
        </div>
        <div>
          <label className="block mb-1 font-medium">Phone</label>
          <input
            type="tel"
            value={userData.phone}
            onChange={(e) => setUserData({ ...userData, phone: e.target.value })}
            className="w-full border rounded px-3 py-2"
            required
          />
        </div>
        <div>
          <label className="block mb-1 font-medium">Role</label>
          <select
            value={userData.role}
            onChange={(e) => setUserData({ ...userData, role: e.target.value })}
            className="w-full border rounded px-3 py-2"
            required
          >
            <option value="user">User</option>
            <option value="operator">Operator</option>
            <option value="admin">Admin</option>
          </select>
        </div>
        {submitText === "Add User" && (
          <div>
            <label className="block mb-1 font-medium">Password</label>
            <div className="flex gap-2">
              <input
                type="text"
                value={userData.password || ""}
                onChange={(e) => setUserData({ ...userData, password: e.target.value })}
                className="flex-1 border rounded px-3 py-2"
                placeholder="Enter password or generate one"
                required
              />
              <button
                type="button"
                onClick={generatePassword}
                className="border px-3 py-2 rounded flex items-center gap-1"
              >
                <Key size={16} /> Generate
              </button>
            </div>
          </div>
        )}
        <div className="flex justify-end space-x-3 pt-4">
          <button 
            type="button" 
            onClick={onCancel} 
            className="border px-4 py-2 rounded"
            disabled={loading}
          >
            Cancel
          </button>
          <button 
            type="submit" 
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:opacity-50 flex items-center"
            disabled={loading}
          >
            {loading && <Loader className="animate-spin h-4 w-4 mr-2" />}
            {submitText}
          </button>
        </div>
      </div>
    </form>
  );

  // Device Management component
  const DeviceManagement = () => (
    <div className="space-y-6">
      {error && <ErrorMessage message={error} onClose={() => setError(null)} />}
      
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold text-gray-900">Device Management</h2>
        <button
          onClick={() => setShowAddDevice(true)}
          disabled={loading}
          className="inline-flex items-center px-3 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
        >
          <Plus className="mr-1" size={16} />
          Add Device
        </button>
      </div>

      {loading ? (
        <LoadingSpinner />
      ) : (
        <div className="bg-white rounded shadow divide-y divide-gray-200 overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                {["Device ID", "Site Name", "Device Name", "Assigned User", "Status", "Latitude", "Longitude", "Date", "Actions"].map(
                  (header) => (
                    <th
                      key={header}
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      {header}
                    </th>
                  )
                )}
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {devices.map((device) => (
                <tr key={device.id}>
                  <td className="px-6 py-2 whitespace-nowrap text-sm font-medium text-gray-900">{device.device_id}</td>
                  <td className="px-6 py-2 whitespace-nowrap text-sm text-gray-700">{device.site_name}</td>
                  <td className="px-6 py-2 whitespace-nowrap text-sm text-gray-700">{device.device_name}</td>
                  <td className="px-6 py-2 whitespace-nowrap text-sm text-gray-700">{device.user_id}</td>
                  <td className={`px-6 py-2 whitespace-nowrap text-sm ${device.status === "Active" ? "text-green-600" : "text-red-600"}`}>{device.status}</td>
                  <td className="px-6 py-2 whitespace-nowrap text-sm text-gray-700">{device.location.lat}</td>
                  <td className="px-6 py-2 whitespace-nowrap text-sm text-gray-700">{device.location.long}</td>
                  <td className="px-6 py-2 whitespace-nowrap text-sm text-gray-700">
                    {device.created_at ? new Date(device.created_at).toLocaleString() : "N/A"}
                  </td>
                  <td className="px-6 py-2 whitespace-nowrap text-sm text-gray-700">
                    <button
                      onClick={() => startEditDevice(device)}
                      className="text-blue-600 hover:text-blue-900 mr-3"
                      title="Edit Device"
                    >
                      <Edit size={16} />
                    </button>
                    <button 
                      onClick={() => handleDeleteDevice(device.id)}
                      className="text-red-600 hover:text-red-900" 
                      title="Delete Device"
                    >
                      <Trash2 size={16} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Add Device Modal */}
      {showAddDevice && (
        <Modal onClose={() => setShowAddDevice(false)} title="Add New Device">
          <DeviceForm
            deviceData={newDeviceData}
            setDeviceData={setNewDeviceData}
            users={users}
            onSubmit={handleAddDevice}
            submitText="Add Device"
            onCancel={() => setShowAddDevice(false)}
            loading={loading}
          />
        </Modal>
      )}

      {/* Edit Device Modal */}
      {showEditDevice && (
        <Modal onClose={() => {
          setShowEditDevice(false);
          setEditingDevice(null);
          setNewDeviceData({
            id: "",
            siteName: "",
            deviceName: "",
            assignedUser: "",
            latitude: "",
            longitude: "",
            status: "Active",
          });
        }} title={`Edit Device ${editingDevice?.id}`}>
          <DeviceForm
            deviceData={newDeviceData}
            setDeviceData={setNewDeviceData}
            users={users}
            onSubmit={handleUpdateDevice}
            submitText="Update Device"
            onCancel={() => {
              setShowEditDevice(false);
              setEditingDevice(null);
            }}
            loading={loading}
          />
        </Modal>
      )}
    </div>
  );

  // User Management component
  const UserManagement = () => (
    <div className="space-y-6">
      {error && <ErrorMessage message={error} onClose={() => setError(null)} />}
      
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold text-gray-900">User Management</h2>
        <button
          onClick={() => setShowAddUser(true)}
          disabled={loading}
          className="inline-flex items-center px-3 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
        >
          <Plus className="mr-1" size={16} />
          Add User
        </button>
      </div>

      {loading ? (
        <LoadingSpinner />
      ) : (
        <div className="bg-white rounded shadow divide-y divide-gray-200 overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                {["Name", "Email", "Phone", "Role", "Last Login", "Actions"].map(
                  (header) => (
                    <th
                      key={header}
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      {header}
                    </th>
                  )
                )}
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {users.map((user) => (
                <tr key={user.id}>
                  <td className="px-6 py-2 whitespace-nowrap text-sm font-medium text-gray-900">
                    {user.full_name}
                  </td>
                  <td className="px-6 py-2 whitespace-nowrap text-sm text-gray-700">{user.email}</td>
                  <td className="px-6 py-2 whitespace-nowrap text-sm text-gray-700">{user.phone_number}</td>
                  <td className="px-6 py-2 whitespace-nowrap text-sm text-gray-700">{user.role}</td>
                  <td className="px-6 py-2 whitespace-nowrap text-sm text-gray-700">{user.lastLogin || user.last_login || 'N/A'}</td>
                  <td className="px-6 py-2 whitespace-nowrap text-sm text-gray-700">
                    <button
                      onClick={() => startEditUser(user)}
                      className="text-blue-600 hover:text-blue-900 mr-3"
                      title="Edit User"
                    >
                      <Edit size={16} />
                    </button>
                    <button 
                      onClick={() => handleDeleteUser(user.id)}
                      className="text-red-600 hover:text-red-900" 
                      title="Delete User"
                    >
                      <Trash2 size={16} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Add User Modal */}
      {showAddUser && (
        <Modal onClose={() => setShowAddUser(false)} title="Add New User">
          <UserForm
            userData={newUserData}
            setUserData={setNewUserData}
            onSubmit={handleAddUser}
            generatePassword={generatePassword}
            submitText="Add User"
            onCancel={() => setShowAddUser(false)}
            loading={loading}
          />
        </Modal>
      )}

      {/* Edit User Modal */}
      {showEditUser && (
        <Modal onClose={() => {
          setShowEditUser(false);
          setEditingUser(null);
          setNewUserData({
            id: "",
            firstName: "",
            lastName: "",
            email: "",
            phone: "",
            role: "user",
            password: "",
          });
        }} title={`Edit User ${editingUser?.name || `${editingUser?.first_name || ''} ${editingUser?.last_name || ''}`.trim()}`}>
          <UserForm
            userData={newUserData}
            setUserData={setNewUserData}
            onSubmit={handleUpdateUser}
            generatePassword={generatePassword}
            submitText="Update User"
            onCancel={() => {
              setShowEditUser(false);
              setEditingUser(null);
            }}
            loading={loading}
          />
        </Modal>
      )}
    </div>
  );

  // System Settings component
  const SystemSettings = () => (
    <div className="space-y-6">
      {error && <ErrorMessage message={error} onClose={() => setError(null)} />}
      
      <h2 className="text-xl font-semibold text-gray-900">System Settings</h2>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Alert Configuration</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                SOS Alert Threshold (seconds)
              </label>
              <input
                type="number"
                value={settings.sosAlertThreshold}
                onChange={(e) => setSettingsState({...settings, sosAlertThreshold: parseInt(e.target.value)})}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Low Battery Threshold (%)
              </label>
              <input
                type="number"
                value={settings.lowBatteryThreshold}
                onChange={(e) => setSettingsState({...settings, lowBatteryThreshold: parseInt(e.target.value)})}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Vibration Sensitivity
              </label>
              <select 
                value={settings.vibrationSensitivity}
                onChange={(e) => setSettingsState({...settings, vibrationSensitivity: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option>Low</option>
                <option>Medium</option>
                <option>High</option>
              </select>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Network Configuration</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                LoRaWAN Gateway IP
              </label>
              <input
                type="text"
                value={settings.lorawanGatewayIP}
                onChange={(e) => setSettingsState({...settings, lorawanGatewayIP: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Data Update Interval (seconds)
              </label>
              <input
                type="number"
                value={settings.dataUpdateInterval}
                onChange={(e) => setSettingsState({...settings, dataUpdateInterval: parseInt(e.target.value)})}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Backup Server URL
              </label>
              <input
                type="url"
                value={settings.backupServerURL}
                onChange={(e) => setSettingsState({...settings, backupServerURL: e.target.value})}
                placeholder="https://backup.rescuelink.com"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>
        </div>
      </div>

      <div className="flex justify-end">
        <button 
          onClick={handleSaveSettings}
          disabled={loading}
          className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
        >
          {loading ? <Loader className="animate-spin h-4 w-4 mr-2" /> : <Save className="h-4 w-4 mr-2" />}
          Save Settings
        </button>
      </div>
    </div>
  );

  // Data Management component
  const DataManagement = () => (
    <div className="space-y-6">
      {error && <ErrorMessage message={error} onClose={() => setError(null)} />}
      
      <h2 className="text-xl font-semibold text-gray-900">Data Management</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Export Data</h3>
          <p className="text-gray-600 mb-4">Download historical data for analysis and reporting.</p>
          <div className="space-y-3">
            <button 
              onClick={() => handleExport('devices', 'csv')}
              disabled={loading}
              className="w-full inline-flex items-center justify-center px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors disabled:opacity-50"
            >
              <Download className="h-4 w-4 mr-2" />
              Export Device Data (CSV)
            </button>
            <button 
              onClick={() => handleExport('alerts', 'csv')}
              disabled={loading}
              className="w-full inline-flex items-center justify-center px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors disabled:opacity-50"
            >
              <Download className="h-4 w-4 mr-2" />
              Export Alert History (CSV)
            </button>
            <button 
              onClick={() => handleExport('reports', 'pdf')}
              disabled={loading}
              className="w-full inline-flex items-center justify-center px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors disabled:opacity-50"
            >
              <Download className="h-4 w-4 mr-2" />
              Export Analytics Report (PDF)
            </button>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Import Data</h3>
          <p className="text-gray-600 mb-4">Import device configurations and historical data.</p>
          <div className="space-y-3">
            <button className="w-full inline-flex items-center justify-center px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors">
              <Upload className="h-4 w-4 mr-2" />
              Import Device Configuration
            </button>
            <button className="w-full inline-flex items-center justify-center px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors">
              <Upload className="h-4 w-4 mr-2" />
              Import Historical Data
            </button>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Database Maintenance</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="text-center p-4 border border-gray-200 rounded-lg">
            <div className="text-2xl font-bold text-blue-600">2.4 GB</div>
            <div className="text-sm text-gray-600">Database Size</div>
          </div>
          <div className="text-center p-4 border border-gray-200 rounded-lg">
            <div className="text-2xl font-bold text-green-600">15,847</div>
            <div className="text-sm text-gray-600">Total Records</div>
          </div>
          <div className="text-center p-4 border border-gray-200 rounded-lg">
            <div className="text-2xl font-bold text-orange-600">7 days</div>
            <div className="text-sm text-gray-600">Last Backup</div>
          </div>
        </div>
        
        <div className="mt-6 flex space-x-4">
          <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
            Create Backup
          </button>
          <button className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors">
            Optimize Database
          </button>
          <button className="px-4 py-2 border border-red-300 text-red-700 rounded-lg hover:bg-red-50 transition-colors">
            Clean Old Data
          </button>
        </div>
      </div>
    </div>
  );

  // Main tab content selector
  const renderTabContent = () => {
    switch (activeTab) {
      case "devices":
        return <DeviceManagement />;
      case "users":
        return <UserManagement />;
      case "settings":
        return <SystemSettings />;
      case "data":
        return <DataManagement />;
      default:
        return null;
    }
  };

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Administration</h1>
        <p className="text-gray-600">Manage devices, users, and system configuration</p>
      </div>

      {/* Tabs */}
      <nav className="mb-4 border-b border-gray-300 flex space-x-4">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-1 border-b-2 pb-2 ${
              activeTab === tab.id
                ? "border-blue-600 text-blue-600 font-semibold"
                : "border-transparent text-gray-600 hover:text-gray-900"
            }`}
          >
            <tab.icon size={20} />
            {tab.label}
          </button>
        ))}
      </nav>

      {/* Content */}
      {renderTabContent()}
    </div>
  );
};

export default Admin;
