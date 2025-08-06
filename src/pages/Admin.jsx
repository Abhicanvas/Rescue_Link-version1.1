import React, { useState, useEffect, useCallback } from "react";
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

const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://rescuelink-server.tail8351b9.ts.net';

// DeviceForm with internal state and API-consistent field names
const DeviceForm = React.memo(({ initialData, users, onSubmit, submitText, onCancel, loading }) => {
  const [deviceData, setDeviceData] = useState(initialData);

  const handleInputChange = useCallback(
    (e) => {
      const { name, value } = e.target;
      setDeviceData((prev) => ({ ...prev, [name]: value }));
    },
    []
  );

  const handleSubmit = useCallback(() => {
    onSubmit(deviceData);
  }, [onSubmit, deviceData]);

  return (
    <form onSubmit={(e) => { e.preventDefault(); handleSubmit(); }}>
      <div className="space-y-4">
        <div>
          <label className="block mb-1 font-medium">Device ID</label>
          <input
            key="device-id"
            type="text"
            name="device_id"
            value={deviceData.device_id || ''}
            onChange={handleInputChange}
            className="w-full border rounded px-3 py-2"
            required
            disabled={submitText === "Update Device"}
          />
        </div>
        <div>
          <label className="block mb-1 font-medium">Site Name</label>
          <input
            key="site-name"
            type="text"
            name="site_name"
            value={deviceData.site_name || ''}
            onChange={handleInputChange}
            className="w-full border rounded px-3 py-2"
            required
          />
        </div>
        <div>
          <label className="block mb-1 font-medium">Device Name</label>
          <input
            key="device-name"
            type="text"
            name="device_name"
            value={deviceData.device_name || ''}
            onChange={handleInputChange}
            className="w-full border rounded px-3 py-2"
            required
          />
        </div>
        <div>
          <label className="block mb-1 font-medium">Assigned User</label>
          <select
            key="assigned-user"
            name="user_id"
            value={deviceData.user_id || ''}
            onChange={handleInputChange}
            className="w-full border rounded px-3 py-2"
            required
          >
            <option value="">Select User</option>
            {(() => {
              console.log('DeviceForm - All users:', users);
              console.log('DeviceForm - Users count:', users.length);
              
              // More lenient filtering - check for user role in various formats
              const filteredUsers = users.filter(u => {
                const role = (u.role || '').toLowerCase();
                return role === "user" || role === "users" || !u.role; // Include users without role too
              });
              
              console.log('DeviceForm - Filtered users:', filteredUsers);
              console.log('DeviceForm - Filtered users count:', filteredUsers.length);
              
              // Show all users temporarily for debugging if no filtered users
              const usersToShow = filteredUsers.length > 0 ? filteredUsers : users;
              console.log('DeviceForm - Users to show:', usersToShow);
              
              return usersToShow.map(u => (
                <option key={u.id} value={u.id}>
                  {u.full_name || u.name || u.email || `User ${u.id}`} {u.role && `(${u.role})`}
                </option>
              ));
            })()}
          </select>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block mb-1 font-medium">Latitude</label>
            <input
              key="latitude"
              type="number"
              name="latitude"
              step="0.000001"
              value={deviceData.latitude || ''}
              onChange={handleInputChange}
              className="w-full border rounded px-3 py-2"
              required
            />
          </div>
          <div>
            <label className="block mb-1 font-medium">Longitude</label>
            <input
              key="longitude"
              type="number"
              name="longitude"
              step="0.000001"
              value={deviceData.longitude || ''}
              onChange={handleInputChange}
              className="w-full border rounded px-3 py-2"
              required
            />
          </div>
        </div>
        <div>
          <label className="block mb-1 font-medium">Status</label>
          <select
            key="status"
            name="status"
            value={deviceData.status || 'Active'}
            onChange={handleInputChange}
            className="w-full border rounded px-3 py-2"
            required
          >
            <option value="Active">Active</option>
            <option value="Inactive">Inactive</option>
          </select>
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
});

// UserForm with fixed password generation and API-consistent field names - FIXED ROLE ISSUE
const UserForm = React.memo(({ initialData, onSubmit, generatePassword, submitText, onCancel, loading }) => {
  const [userData, setUserData] = useState(() => {
    // Initialize with proper role handling
    const role = initialData.role ? initialData.role.toLowerCase() : 'user';
    console.log('UserForm - Initial role:', initialData.role, 'Normalized:', role);
    
    return {
      ...initialData,
      role: role,
      full_name: `${initialData.first_name || ''} ${initialData.last_name || ''}`.trim(),
    };
  });

  // Add useEffect to sync with initialData changes (for edit mode)
  useEffect(() => {
    const role = initialData.role ? initialData.role.toLowerCase() : 'user';
    console.log('UserForm - useEffect updating role:', initialData.role, 'to:', role);
    
    setUserData(prev => ({
      ...initialData,
      role: role,
      full_name: `${initialData.first_name || ''} ${initialData.last_name || ''}`.trim(),
    }));
  }, [initialData]);

  const handleInputChange = useCallback(
    (e) => {
      const { name, value } = e.target;
      console.log('UserForm - Input change:', name, value);
      
      setUserData((prev) => {
        const updatedData = { ...prev, [name]: value };
        
        // Update full_name whenever first_name or last_name changes
        if (name === 'first_name' || name === 'last_name') {
          updatedData.full_name = `${updatedData.first_name || ''} ${updatedData.last_name || ''}`.trim();
        }
        
        console.log('UserForm - Updated userData:', updatedData);
        return updatedData;
      });
    },
    []
  );

  const handleGeneratePassword = useCallback(() => {
    const newPassword = generatePassword();
    setUserData((prev) => ({ ...prev, password: newPassword }));
  }, [generatePassword]);

  const handleSubmit = useCallback(() => {
    console.log('UserForm - Submitting userData:', userData);
    onSubmit(userData);
  }, [onSubmit, userData]);

  console.log('UserForm - Render userData:', userData);
  console.log('UserForm - Current role value:', userData.role);

  return (
    <form onSubmit={(e) => { e.preventDefault(); handleSubmit(); }}>
      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block mb-1 font-medium">First Name</label>
            <input
              key="first-name"
              type="text"
              name="first_name"
              value={userData.first_name || ''}
              onChange={handleInputChange}
              className="w-full border rounded px-3 py-2"
              required
            />
          </div>
          <div>
            <label className="block mb-1 font-medium">Last Name</label>
            <input
              key="last-name"
              type="text"
              name="last_name"
              value={userData.last_name || ''}
              onChange={handleInputChange}
              className="w-full border rounded px-3 py-2"
              required
            />
          </div>
        </div>

        <div>
          <label className="block mb-1 font-medium">Email</label>
          <input
            key="email"
            type="email"
            name="email"
            value={userData.email || ''}
            onChange={handleInputChange}
            className="w-full border rounded px-3 py-2"
            required
          />
        </div>

        <div>
          <label className="block mb-1 font-medium">Phone Number</label>
          <input
            key="phone_number"
            type="tel"
            name="phone_number"
            value={userData.phone_number || ''}
            onChange={handleInputChange}
            className="w-full border rounded px-3 py-2"
            required
          />
        </div>

        <div>
          <label className="block mb-1 font-medium">Emergency Contact Name</label>
          <input
            key="emergency_contact_name"
            type="text"
            name="emergency_contact_name"
            value={userData.emergency_contact_name || ''}
            onChange={handleInputChange}
            className="w-full border rounded px-3 py-2"
            required={submitText === "Add User"}
          />
        </div>

        <div>
          <label className="block mb-1 font-medium">Emergency Contact Number</label>
          <input
            key="emergency_contact_number"
            type="tel"
            name="emergency_contact_number"
            value={userData.emergency_contact_number || ''}
            onChange={handleInputChange}
            className="w-full border rounded px-3 py-2"
            required={submitText === "Add User"}
          />
        </div>

        {/* FIXED ROLE SELECT */}
        <div>
          <label className="block mb-1 font-medium">Role</label>
          <select
            key={`role-${userData.id || 'new'}`} // Add unique key to force re-render
            name="role"
            value={userData.role || 'user'}
            onChange={handleInputChange}
            className="w-full border rounded px-3 py-2"
            required
          >
            <option value="user">User</option>
            <option value="operator">Operator</option>
            <option value="admin">Admin</option>
          </select>
          {/* Debug info - remove in production */}
          <small className="text-gray-500">Current role: {userData.role}</small>
        </div>

        {submitText === "Add User" && (
          <div>
            <label className="block mb-1 font-medium">Password</label>
            <div className="flex gap-2">
              <input
                key="password"
                type="password"
                name="password"
                value={userData.password || ""}
                onChange={handleInputChange}
                className="flex-1 border rounded px-3 py-2"
                placeholder="Enter password or generate one"
                required
              />
              <button
                type="button"
                onClick={handleGeneratePassword}
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
});

// Add display names for debugging
DeviceForm.displayName = 'DeviceForm';
UserForm.displayName = 'UserForm';

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
  const [editingUser, setEditingUser] = useState(null);

  const tabs = [
    { id: "devices", label: "Device Management", icon: Settings },
    { id: "users", label: "User Management", icon: Users },
    // { id: "settings", label: "System Settings", icon: Settings },
    // { id: "data", label: "Data Management", icon: Database },
  ];

  // Test API connection on component mount
  useEffect(() => {
    const testConnection = async () => {
      try {
        if (api.isAuthenticated()) {
          console.log('API connection test: authenticated');
          const profile = await api.getProfile();
          console.log('API connection successful, user:', profile);
          
          // Test users API directly
          try {
            console.log('Testing users API directly...');
            const usersResponse = await fetch(`${API_BASE_URL}/api/v1/auth/users`, {
              method: 'GET',
              headers: {
                'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
                'Content-Type': 'application/json'
              }
            });
            
            console.log('Users API direct response status:', usersResponse.status);
            const usersData = await usersResponse.json();
            console.log('Users API direct response data:', usersData);
          } catch (directApiError) {
            console.error('Direct users API test failed:', directApiError);
          }
          
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
      // Also fetch users for device assignment dropdown
      if (users.length === 0) {
        console.log('Fetching users for device management...');
        fetchUsers();
      }
    } else if (activeTab === "users") {
      fetchUsers();
    } else if (activeTab === "settings") {
      fetchSettings();
    }
  }, [activeTab]);

  // Helper function to extract data from API response
  const extractResponseData = (response, dataKey = null) => {
    console.log('extractResponseData - Input response:', response);
    if (dataKey && response.data && response.data[dataKey]) {
      console.log('extractResponseData - Extracted with dataKey:', response.data[dataKey]);
      return response.data[dataKey];
    }
    
    if (response.data) {
      console.log('extractResponseData - Extracted data:', response.data);
      return response.data;
    }
    if (response.users) {
      console.log('extractResponseData - Extracted users:', response.users);
      return response.users;
    }
    if (response.results) {
      console.log('extractResponseData - Extracted results:', response.results);
      return response.results;
    }
    
    console.log('extractResponseData - Fallback to response:', response);
    return response;
  };

  // API call functions
  const fetchDevices = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await deviceAPI.getAll();
      const deviceData = extractResponseData(response);
      console.log('fetchDevices - Device data:', deviceData);
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
      
      // Try the primary users endpoint
      let response;
      let userData;
      
      try {
        response = await userAPI.getAll();
        console.log('fetchUsers - Users API Response (primary):', response);
        console.log('fetchUsers - Users API Response Data (primary):', response.data);
        userData = extractResponseData(response);
      } catch (primaryError) {
        console.warn('fetchUsers - Primary users API failed, trying alternative endpoints:', primaryError);
        
        // Try alternative endpoints
        try {
          // Try direct API call to /api/v1/users (without auth prefix)
          const altResponse = await api.request('/api/v1/users');
          console.log('fetchUsers - Alternative users API response:', altResponse);
          userData = Array.isArray(altResponse) ? altResponse : altResponse.data || altResponse.users || [];
        } catch (altError) {
          console.warn('fetchUsers - Alternative users API also failed:', altError);
          throw primaryError; // Re-throw the original error
        }
      }
      
      console.log('fetchUsers - Final extracted User Data:', userData);
      console.log('fetchUsers - Users array length:', Array.isArray(userData) ? userData.length : 'Not an array');
      
      if (Array.isArray(userData)) {
        userData.forEach((user, index) => {
          console.log(`fetchUsers - User ${index}:`, {
            id: user.id,
            full_name: user.full_name,
            name: user.name,
            role: user.role,
            email: user.email
          });
        });
      }
      
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
      console.log('fetchSettings - Settings data:', settingsData);
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

  // Device operations with stable callbacks
  const handleAddDevice = useCallback(async (deviceData) => {
    if (
      !deviceData.device_id ||
      !deviceData.site_name ||
      !deviceData.device_name ||
      !deviceData.user_id ||
      !deviceData.latitude ||
      !deviceData.longitude
    ) {
      alert("Please fill all required fields.");
      return;
    }

    const lat = parseFloat(deviceData.latitude);
    const lon = parseFloat(deviceData.longitude);
    if (isNaN(lat) || lat < -90 || lat > 90 || isNaN(lon) || lon < -180 || lon > 180) {
      alert("Invalid latitude or longitude values.");
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const payload = {
        device_id: deviceData.device_id,
        site_name: deviceData.site_name,
        device_name: deviceData.device_name,
        user_id: deviceData.user_id,
        latitude: lat,
        longitude: lon,
        status: deviceData.status || 'Active',
      };
      console.log('handleAddDevice - Sending payload:', payload);
      const response = await deviceAPI.create(payload);
      console.log('handleAddDevice - Device API Response:', response.data);
      const newDevice = extractResponseData(response);
      console.log('handleAddDevice - Extracted new device:', newDevice);
      setDevices(prev => [...prev, newDevice]);
      setShowAddDevice(false);
      alert('Device added successfully!');
    } catch (err) {
      let errorMessage = 'Failed to add device';
      if (err instanceof ApiError) {
        if (err.status === 409) {
          errorMessage = 'Device ID already exists';
        } else {
          errorMessage = err.message;
        }
      }
      setError(errorMessage);
      console.error('Error adding device:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  const handleUpdateDevice = useCallback(async (deviceData) => {
    if (
      !deviceData.device_id ||
      !deviceData.site_name ||
      !deviceData.device_name ||
      !deviceData.user_id ||
      !deviceData.latitude ||
      !deviceData.longitude
    ) {
      alert("Please fill all required fields.");
      return;
    }

    const lat = parseFloat(deviceData.latitude);
    const lon = parseFloat(deviceData.longitude);
    if (isNaN(lat) || lat < -90 || lat > 90 || isNaN(lon) || lon < -180 || lon > 180) {
      alert("Invalid latitude or longitude values.");
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const payload = {
        device_id: deviceData.device_id,
        site_name: deviceData.site_name,
        device_name: deviceData.device_name,
        user_id: deviceData.user_id,
        latitude: lat,
        longitude: lon,
        status: deviceData.status || 'Active',
      };
      console.log('handleUpdateDevice - Sending payload:', payload);
      const response = await deviceAPI.updateDevice(editingDevice.device_id, payload);
      console.log('handleUpdateDevice - Device API Response:', response.data);
      const updatedDevice = extractResponseData(response);
      console.log('handleUpdateDevice - Extracted updated device:', updatedDevice);
      
      setDevices(prev => prev.map(dev => dev.device_id === editingDevice.device_id ? updatedDevice : dev));
      
      setEditingDevice(null);
      setShowEditDevice(false);
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
  }, [editingDevice]);

  const handleDeleteDevice = async (device_id) => {
    if (!window.confirm('Are you sure you want to delete this device?')) {
      return;
    }

    try {
      setLoading(true);
      setError(null);
      console.log('handleDeleteDevice - Deleting device:', device_id);
      await deviceAPI.delete(device_id);
      setDevices(prev => prev.filter(dev => dev.device_id !== device_id));
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

  // User operations with stable callbacks
  const handleAddUser = useCallback(async (userData) => {
    if (
      !userData.first_name ||
      !userData.last_name ||
      !userData.email ||
      !userData.phone_number ||
      !userData.password
    ) {
      alert("Please fill all required fields.");
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const phoneRegex = /^\+?[\d\s-]{10,}$/;
    if (!emailRegex.test(userData.email)) {
      alert("Invalid email format.");
      return;
    }
    if (!phoneRegex.test(userData.phone_number)) {
      alert("Invalid phone number format.");
      return;
    }

    try {
      setLoading(true);
      setError(null);
      
      const userPayload = {
        full_name: `${userData.first_name} ${userData.last_name}`.trim(),
        email: userData.email,
        phone_number: userData.phone_number,
        role: userData.role.toLowerCase(),
        password: userData.password,
        emergency_contact_name: userData.emergency_contact_name,
        emergency_contact_number: userData.emergency_contact_number,
      };

      console.log('handleAddUser - Sending user creation request:', userPayload);
      const response = await userAPI.create(userPayload);
      console.log('handleAddUser - User API Response:', response);
      const newUser = extractResponseData(response);
      console.log('handleAddUser - Extracted new user:', newUser);
      
      // Ensure newUser has all required fields
      const normalizedUser = {
        id: newUser.id || Date.now().toString(), // Fallback ID if not provided
        full_name: newUser.full_name || `${newUser.first_name || userData.first_name} ${newUser.last_name || userData.last_name}`.trim(),
        first_name: newUser.first_name || userData.first_name,
        last_name: newUser.last_name || userData.last_name,
        email: newUser.email || userData.email,
        phone_number: newUser.phone_number || userData.phone_number,
        role: newUser.role || userData.role.toLowerCase(),
        emergency_contact_name: newUser.emergency_contact_name || userData.emergency_contact_name,
        emergency_contact_number: newUser.emergency_contact_number || userData.emergency_contact_number,
        last_login: newUser.last_login || null,
      };
      
      console.log('handleAddUser - Normalized user:', normalizedUser);
      setUsers(prev => [...prev, normalizedUser]);
      
      setShowAddUser(false);
      alert('User added successfully!');
    } catch (err) {
      let errorMessage = 'Failed to add user';
      
      if (err instanceof ApiError) {
        if (err.status === 405) {
          errorMessage = 'User creation is not allowed. Please check the API configuration.';
        } else if (err.status === 409) {
          errorMessage = 'Email already exists';
        } else if (err.status === 422 && err.data?.detail) {
          errorMessage = Array.isArray(err.data.detail)
            ? err.data.detail.map(detail => detail.msg).join('; ')
            : err.data.detail || err.message;
        } else {
          errorMessage = err.data?.detail || err.message || 'Unknown error';
        }
      } else {
        errorMessage = err.message || 'Network error';
      }
      
      setError(errorMessage);
      console.error('Error adding user:', {
        message: err.message,
        status: err.status,
        data: err.data,
        response: err.response?.data
      });
    } finally {
      setLoading(false);
    }
  }, []);

  const handleUpdateUser = useCallback(async (userData) => {
    console.log('handleUpdateUser - Starting with userData:', userData);
    
    if (
      !userData.first_name ||
      !userData.last_name ||
      !userData.email ||
      !userData.phone_number ||
      !userData.role
    ) {
      alert("Please fill all required fields.");
      return;
    }

    const validRoles = ['user', 'operator', 'admin'];
    if (!validRoles.includes(userData.role.toLowerCase())) {
      alert("Please select a valid role.");
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const phoneRegex = /^\+?[\d\s-]{10,}$/;
    if (!emailRegex.test(userData.email)) {
      alert("Invalid email format.");
      return;
    }
    if (!phoneRegex.test(userData.phone_number)) {
      alert("Invalid phone number format.");
      return;
    }

    try {
      setLoading(true);
      setError(null);
      
      const userPayload = {
        first_name: userData.first_name.trim(),
        last_name: userData.last_name.trim(),
        full_name: `${userData.first_name.trim()} ${userData.last_name.trim()}`.trim(),
        email: userData.email.trim(),
        phone_number: userData.phone_number.trim(),
        role: userData.role.toLowerCase(), // Ensure role is properly sent
        emergency_contact_name: userData.emergency_contact_name?.trim() || '',
        emergency_contact_number: userData.emergency_contact_number?.trim() || '',
      };

      console.log('handleUpdateUser - Sending user update request:', {
        userId: editingUser.id,
        payload: userPayload
      });

      const response = await userAPI.updateUser(editingUser.id, userPayload);
      console.log('handleUpdateUser - User API Response:', response);

      const updatedUser = extractResponseData(response);
      console.log('handleUpdateUser - Extracted updated user:', updatedUser);

      // Validate and normalize the updated user data
      if (!updatedUser || !updatedUser.id) {
        throw new Error('Invalid user data returned from API');
      }

      // Normalize the response to ensure all required fields are present
      const normalizedUser = {
        id: updatedUser.id,
        full_name: updatedUser.full_name || `${updatedUser.first_name || userData.first_name} ${updatedUser.last_name || userData.last_name}`.trim(),
        first_name: updatedUser.first_name || userData.first_name,
        last_name: updatedUser.last_name || userData.last_name,
        email: updatedUser.email || userData.email,
        phone_number: updatedUser.phone_number || userData.phone_number,
        role: updatedUser.role || userData.role.toLowerCase(), // Ensure role is preserved
        emergency_contact_name: updatedUser.emergency_contact_name || userData.emergency_contact_name || '',
        emergency_contact_number: updatedUser.emergency_contact_number || userData.emergency_contact_number || '',
        last_login: updatedUser.last_login || null,
      };

      console.log('handleUpdateUser - Normalized user:', normalizedUser);

      // Update the users state
      setUsers(prev => {
        const newUsers = prev.map(usr => 
          usr.id === editingUser.id ? normalizedUser : usr
        );
        console.log('handleUpdateUser - Updated users state:', newUsers);
        return newUsers;
      });
      
      setEditingUser(null);
      setShowEditUser(false);
      alert('User updated successfully!');
    } catch (err) {
      let errorMessage = 'Failed to update user';
      
      if (err instanceof ApiError) {
        if (err.status === 400) {
          errorMessage = 'Invalid user data provided';
        } else if (err.status === 401) {
          errorMessage = 'Unauthorized: Please log in again';
          window.location.href = '/login';
          return;
        } else if (err.status === 404) {
          errorMessage = 'User not found';
        } else if (err.status === 422 && err.data?.detail) {
          errorMessage = Array.isArray(err.data.detail)
            ? err.data.detail.map(detail => detail.msg).join('; ')
            : err.data.detail || err.message;
        } else {
          errorMessage = err.data?.detail || err.message || 'Unknown error';
        }
      } else {
        errorMessage = err.message || 'Network error';
      }
      
      setError(errorMessage);
      console.error('Error updating user:', {
        message: err.message,
        status: err.status,
        data: err.data,
        response: err.response?.data
      });
    } finally {
      setLoading(false);
    }
  }, [editingUser]);

  const handleDeleteUser = async (userId) => {
    if (!window.confirm('Are you sure you want to delete this user?')) {
      return;
    }

    try {
      setLoading(true);
      setError(null);
      console.log('handleDeleteUser - Deleting user:', userId);
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
      console.log('handleSaveSettings - Sending settings:', settings);
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

      console.log(`handleExport - Export ${type} response:`, response);
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

  // Generate random password with stable callback
  const generatePassword = useCallback(() => {
    const chars =
      "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*";
    let password = "";
    for (let i = 0; i < 12; i++) {
      password += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return password;
  }, []);

  // Helper functions with stable callbacks - FIXED startEditUser
  const startEditDevice = useCallback((device) => {
    console.log('startEditDevice - Device to edit:', device);
    setEditingDevice({
      device_id: device.device_id || '',
      site_name: device.site_name || '',
      device_name: device.device_name || '',
      user_id: device.user_id || '',
      latitude: device.latitude || '',
      longitude: device.longitude || '',
      status: device.status || 'Active',
    });
    setShowEditDevice(true);
  }, []);

  const startEditUser = useCallback((user) => {
    console.log('startEditUser - User to edit:', user);
    console.log('startEditUser - Original user role:', user.role);
    
    // Split full_name if first_name and last_name are not provided
    let first_name = user.first_name || '';
    let last_name = user.last_name || '';
    if (!first_name && !last_name && user.full_name) {
      const names = user.full_name.split(' ');
      first_name = names[0] || '';
      last_name = names.slice(1).join(' ') || '';
    }

    // Normalize role to lowercase and ensure it's valid
    const normalizedRole = user.role ? user.role.toLowerCase() : 'user';
    const validRoles = ['user', 'operator', 'admin'];
    const finalRole = validRoles.includes(normalizedRole) ? normalizedRole : 'user';

    const editingUserData = {
      id: user.id,
      first_name,
      last_name,
      full_name: `${first_name} ${last_name}`.trim(),
      email: user.email || '',
      phone_number: user.phone_number || user.phone || '',
      role: finalRole, // Use normalized and validated role
      emergency_contact_name: user.emergency_contact_name || '',
      emergency_contact_number: user.emergency_contact_number || '',
    };

    console.log('startEditUser - Setting editingUser with role:', editingUserData.role);
    console.log('startEditUser - Complete editingUser data:', editingUserData);
    
    setEditingUser(editingUserData);
    setShowEditUser(true);
  }, []);

  const closeAddDevice = useCallback(() => setShowAddDevice(false), []);
  const closeAddUser = useCallback(() => setShowAddUser(false), []);

  // Device Management component
  const DeviceManagement = () => (
    <div className="space-y-6">
      {error && <ErrorMessage message={error} onClose={() => setError(null)} />}
      
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold text-gray-900">Device Management</h2>
        <button
          onClick={() => {
            if (users.length === 0) {
              console.log('No users loaded, fetching users...');
              fetchUsers();
            }
            setShowAddDevice(true);
          }}
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
                {["Device ID", "Device Name", "Assigned User", "Status", "Latitude", "Longitude", "Actions"].map(
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
                <tr key={device.device_id}>
                  <td className="px-6 py-2 whitespace-nowrap text-sm font-medium text-gray-900">{device.device_id}</td>
                  <td className="px-6 py-2 whitespace-nowrap text-sm text-gray-700">{device.device_name}</td>
                  <td className="px-6 py-2 whitespace-nowrap text-sm text-gray-700">{device.user_id}</td>
                  <td className={`px-6 py-2 whitespace-nowrap text-sm ${device.status === "Active" ? "text-green-600" : "text-red-600"}`}>{device.status}</td>
                  <td className="px-6 py-2 whitespace-nowrap text-sm text-gray-700">{device.latitude}</td>
                  <td className="px-6 py-2 whitespace-nowrap text-sm text-gray-700">{device.longitude}</td>
                  <td className="px-6 py-2 whitespace-nowrap text-sm text-gray-700">
                    {/* <button 
                      onClick={() => handleDeleteDevice(device.device_id)}
                      className="text-red-600 hover:text-red-900" 
                      title="Delete Device"
                    >
                      <Trash2 size={16} />
                    </button> */}
                    <button
                      onClick={() => startEditDevice(device)}
                      className="text-blue-600 hover:text-blue-900 ml-3"
                      title="Edit Device"
                    >
                      <Edit size={16} />
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
        <Modal onClose={closeAddDevice} title="Add New Device">
          <DeviceForm
            initialData={{
              device_id: "",
              site_name: "",
              device_name: "",
              user_id: "",
              latitude: "",
              longitude: "",
              status: "Active",
            }}
            users={users}
            onSubmit={handleAddDevice}
            submitText="Add Device"
            onCancel={closeAddDevice}
            loading={loading}
          />
        </Modal>
      )}

      {/* Edit Device Modal */}
      {showEditDevice && (
        <Modal onClose={() => {
          setShowEditDevice(false);
          setEditingDevice(null);
        }} title={`Edit Device ${editingDevice?.device_id}`}>
          <DeviceForm
            initialData={{
              device_id: editingDevice.device_id || '',
              site_name: editingDevice.site_name || '',
              device_name: editingDevice.device_name || '',
              user_id: editingDevice.user_id || '',
              latitude: editingDevice.latitude || '',
              longitude: editingDevice.longitude || '',
              status: editingDevice.status || 'Active',
            }}
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
                {["Name", "Email", "Phone", "Role", "Actions"].map(
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
                    {user.full_name || `${user.first_name || ''} ${user.last_name || ''}`.trim() || 'N/A'}
                  </td>
                  <td className="px-6 py-2 whitespace-nowrap text-sm text-gray-700">{user.email || 'N/A'}</td>
                  <td className="px-6 py-2 whitespace-nowrap text-sm text-gray-700">{user.phone_number || user.phone || 'N/A'}</td>
                  <td className="px-6 py-2 whitespace-nowrap text-sm text-gray-700">{user.role || 'N/A'}</td>
                  {/* <td className="px-6 py-2 whitespace-nowrap text-sm text-gray-700">{user.last_login || 'N/A'}</td> */}
                  <td className="px-6 py-2 whitespace-nowrap text-sm text-gray-700">
                    <button
                      onClick={() => startEditUser(user)}
                      className="text-blue-600 hover:text-blue-900 mr-3"
                      title="Edit User"
                    >
                      <Edit size={16} />
                    </button>
                    {/* <button 
                      onClick={() => handleDeleteUser(user.id)}
                      className="text-red-600 hover:text-red-900" 
                      title="Delete User"
                    >
                      <Trash2 size={16} />
                    </button> */}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Add User Modal */}
      {showAddUser && (
        <Modal onClose={closeAddUser} title="Add New User">
          <UserForm
            initialData={{
              id: "",
              first_name: "",
              last_name: "",
              email: "",
              phone_number: "",
              role: "user",
              emergency_contact_name: "",
              emergency_contact_number: "",
              password: "",
            }}
            onSubmit={handleAddUser}
            generatePassword={generatePassword}
            submitText="Add User"
            onCancel={closeAddUser}
            loading={loading}
          />
        </Modal>
      )}

      {/* Edit User Modal - FIXED with proper key to force re-render */}
      {showEditUser && editingUser && (
        <Modal 
          key={`edit-user-${editingUser.id}-${editingUser.role}`} // Force re-render when user changes
          onClose={() => {
            setShowEditUser(false);
            setEditingUser(null);
          }} 
          title={`Edit User ${editingUser?.full_name || `${editingUser?.first_name || ''} ${editingUser?.last_name || ''}`.trim()}`}
        >
          <UserForm
            key={`user-form-${editingUser.id}-${editingUser.role}`} // Force UserForm re-render
            initialData={{
              id: editingUser.id,
              first_name: editingUser.first_name || '',
              last_name: editingUser.last_name || '',
              full_name: `${editingUser.first_name || ''} ${editingUser.last_name || ''}`.trim(),
              email: editingUser.email || '',
              phone_number: editingUser.phone_number || editingUser.phone || '',
              role: editingUser.role || 'user',
              emergency_contact_name: editingUser.emergency_contact_name || '',
              emergency_contact_number: editingUser.emergency_contact_number || '',
              password: "",
            }}
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

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Admin Dashboard</h1>
      
      <div className="mb-6">
        <nav className="flex space-x-1">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-2 rounded-t-lg flex items-center gap-2 ${
                activeTab === tab.id
                  ? "bg-blue-600 text-white"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
            >
              <tab.icon size={16} />
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      <div className="bg-white rounded-b-lg shadow p-6">
        {activeTab === "devices" && <DeviceManagement />}
        {activeTab === "users" && <UserManagement />}
      </div>
    </div>
  );
};

export default Admin;