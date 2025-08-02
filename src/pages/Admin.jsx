import React, { useState } from "react";
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
} from "lucide-react";

const Admin = () => {
  const [activeTab, setActiveTab] = useState("devices");
  const [showAddDevice, setShowAddDevice] = useState(false);
  const [showEditDevice, setShowEditDevice] = useState(false);
  const [showAddUser, setShowAddUser] = useState(false);
  const [showEditUser, setShowEditUser] = useState(false);

  // Use state for devices and users to allow updating on add/edit
  const [devices, setDevices] = useState([
    {
      id: "RLK001",
      siteName: "Dhaka Central",
      deviceName: "Emergency Sensor 1",
      assignedUser: "John Smith",
      latitude: "23.8103",
      longitude: "90.4125",
      status: "Active",
    },
    {
      id: "RLK002",
      siteName: "Wari Junction",
      deviceName: "Emergency Sensor 2",
      assignedUser: "Jane Operator",
      latitude: "23.7805",
      longitude: "90.3492",
      status: "Active",
    },
    {
      id: "RLK003",
      siteName: "Motijheel Area",
      deviceName: "Emergency Sensor 3",
      assignedUser: "Mike Admin",
      latitude: "23.7461",
      longitude: "90.3742",
      status: "Disconnected",
    },
  ]);

  const [users, setUsers] = useState([
    {
      id: "1",
      name: "John Smith",
      email: "john@rescuelink.com",
      role: "User",
      phone: "+1234567890",
      lastLogin: "2024-01-07",
    },
    {
      id: "2",
      name: "Jane Operator",
      email: "jane@rescuelink.com",
      role: "Operator",
      phone: "+1234567891",
      lastLogin: "2024-01-06",
    },
    {
      id: "3",
      name: "Mike Admin",
      email: "mike@rescuelink.com",
      role: "Admin",
      phone: "+1234567892",
      lastLogin: "2024-01-05",
    },
  ]);

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
  });

  const tabs = [
    { id: "devices", label: "Device Management", icon: Settings },
    { id: "users", label: "User Management", icon: Users },
    { id: "settings", label: "System Settings", icon: Settings },
    { id: "data", label: "Data Management", icon: Database },
  ];

  // Generate random password
  const generatePassword = () => {
    const chars =
      "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*";
    let password = "";
    for (let i = 0; i < 12; i++) {
      password += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setNewUserData((d) => ({ ...d, password }));
  };

  // Add Device
  const handleAddDevice = () => {
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
    // Create new device object
    const deviceToAdd = {
      ...newDeviceData,
      status: "Active", // default status
    };
    setDevices((d) => [...d, deviceToAdd]);
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
  };

  // Update Device
  const handleUpdateDevice = () => {
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
    setDevices((d) =>
      d.map((dev) =>
        dev.id === editingDevice.id ? { ...newDeviceData } : dev
      )
    );
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
    alert(`Device ${newDeviceData.id} updated successfully!`);
  };

  // Begin editing a device
  const startEditDevice = (device) => {
    setEditingDevice(device);
    setNewDeviceData({ ...device });
    setShowEditDevice(true);
  };

  // Add User
  const handleAddUser = () => {
    if (
      !newUserData.firstName ||
      !newUserData.lastName ||
      !newUserData.email ||
      !newUserData.phone
    ) {
      alert("Please fill all required fields.");
      return;
    }
    const fullName = `${newUserData.firstName} ${newUserData.lastName}`;
    const newUser = {
      id: (users.length + 1).toString(),
      name: fullName,
      email: newUserData.email,
      phone: newUserData.phone,
      role: newUserData.role,
      lastLogin: "N/A",
    };
    setUsers((u) => [...u, newUser]);
    setNewUserData({
      id: "",
      firstName: "",
      lastName: "",
      email: "",
      phone: "",
      role: "user",
    });
    setShowAddUser(false);
    alert(`User ${newUserData.email} added successfully.`);
  };

  // Update User
  const handleUpdateUser = () => {
    if (
      !newUserData.firstName ||
      !newUserData.lastName ||
      !newUserData.email ||
      !newUserData.phone
    ) {
      alert("Please fill all required fields.");
      return;
    }
    const fullName = `${newUserData.firstName} ${newUserData.lastName}`;

    setUsers((u) =>
      u.map((usr) =>
        usr.id === editingUser.id
          ? { ...usr, name: fullName, email: newUserData.email, phone: newUserData.phone, role: newUserData.role }
          : usr
      )
    );
    setEditingUser(null);
    setShowEditUser(false);
    setNewUserData({
      id: "",
      firstName: "",
      lastName: "",
      email: "",
      phone: "",
      role: "user",
    });
    alert(`User ${newUserData.email} updated successfully.`);
  };

  // Begin editing user
  const startEditUser = (user) => {
    setEditingUser(user);
    const [firstName, ...lastNameParts] = user.name.split(" ");
    setNewUserData({
      id: user.id,
      firstName,
      lastName: lastNameParts.join(" "),
      email: user.email,
      phone: user.phone,
      role: user.role.toLowerCase(),
    });
    setShowEditUser(true);
  };

  // Component for Device Management tab
  const DeviceManagement = () => (
    <div className="space-y-6">
      {/* Header with Add */}
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold text-gray-900">Device Management</h2>
        <button
          onClick={() => setShowAddDevice(true)}
          className="inline-flex items-center px-3 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          <Plus className="mr-1" size={16} />
          Add Device
        </button>
      </div>
      {/* Table */}
      <div className="bg-white rounded shadow divide-y divide-gray-200 overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              {["Device ID", "Site Name", "Device Name", "Assigned User", "Status", "Latitude", "Longitude", "Actions"].map(
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
                <td className="px-6 py-2 whitespace-nowrap text-sm font-medium text-gray-900">
                  {device.id}
                </td>
                <td className="px-6 py-2 whitespace-nowrap text-sm text-gray-700">{device.siteName}</td>
                <td className="px-6 py-2 whitespace-nowrap text-sm text-gray-700">{device.deviceName}</td>
                <td className="px-6 py-2 whitespace-nowrap text-sm text-gray-700">{device.assignedUser}</td>
                <td className={`px-6 py-2 whitespace-nowrap text-sm ${device.status === "Active" ? "text-green-600" : "text-red-600"}`}>
                  {device.status}
                </td>
                <td className="px-6 py-2 whitespace-nowrap text-sm text-gray-700">{device.latitude}</td>
                <td className="px-6 py-2 whitespace-nowrap text-sm text-gray-700">{device.longitude}</td>
                <td className="px-6 py-2 whitespace-nowrap text-sm text-gray-700">
                  <button
                    onClick={() => startEditDevice(device)}
                    className="text-blue-600 hover:text-blue-900 mr-3"
                    title="Edit Device"
                  >
                    <Edit size={16} />
                  </button>
                  {/* Optional Delete Button */}
                  {/* <button onClick={() => {}} className="text-red-600 hover:text-red-900" title="Delete Device">
                  <Trash2 size={16} />
                  </button> */}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

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
          />
        </Modal>
      )}
    </div>
  );

  // Component for User Management tab
  const UserManagement = () => (
    <div className="space-y-6">
      {/* Header with Add */}
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold text-gray-900">User Management</h2>
        <button
          onClick={() => setShowAddUser(true)}
          className="inline-flex items-center px-3 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          <Plus className="mr-1" size={16} />
          Add User
        </button>
      </div>
      {/* Table */}
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
                  {user.name}
                </td>
                <td className="px-6 py-2 whitespace-nowrap text-sm text-gray-700">{user.email}</td>
                <td className="px-6 py-2 whitespace-nowrap text-sm text-gray-700">{user.phone}</td>
                <td className="px-6 py-2 whitespace-nowrap text-sm text-gray-700">{user.role}</td>
                <td className="px-6 py-2 whitespace-nowrap text-sm text-gray-700">{user.lastLogin}</td>
                <td className="px-6 py-2 whitespace-nowrap text-sm text-gray-700">
                  <button
                    onClick={() => startEditUser(user)}
                    className="text-blue-600 hover:text-blue-900 mr-3"
                    title="Edit User"
                  >
                    <Edit size={16} />
                  </button>
                  {/* Optional delete */}
                  {/* <button onClick={() => {}} className="text-red-600 hover:text-red-900" title="Delete User">
                    <Trash2 size={16} />
                  </button> */}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

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
          });
        }} title={`Edit User ${editingUser?.name}`}>
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
          />
        </Modal>
      )}
    </div>
  );

  // Stub Settings and Data tabs
  const SettingsTab = () => (
    <div className="p-6 text-gray-700">
      <p>System Settings content goes here.</p>
    </div>
  );

  const DataTab = () => (
    <div className="p-6 text-gray-700">
      <p>Data Management content goes here.</p>
    </div>
  );

  // Simple reusable modal component
  const Modal = ({ children, onClose, title }) => (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded shadow-lg max-w-lg w-full">
        <div className="flex justify-between items-center border-b px-6 py-3">
          <h3 className="text-lg font-semibold">{title}</h3>
          <button onClick={onClose} className="text-xl font-bold leading-none">&times;</button>
        </div>
        <div className="p-6">{children}</div>
      </div>
    </div>
  );

  // Device form component for Add/Edit
  const DeviceForm = ({ deviceData, setDeviceData, users, onSubmit, submitText, onCancel }) => (
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
            disabled={submitText === "Update Device"} // Disable editing id when updating
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
            {users.filter(u => u.role.toLowerCase() === "user").map(u => (
              <option key={u.id} value={u.name}>{u.name}</option>
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
          <button type="button" onClick={onCancel} className="border px-4 py-2 rounded">
            Cancel
          </button>
          <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">
            {submitText}
          </button>
        </div>
      </div>
    </form>
  );

  // User form component Add/Edit
  const UserForm = ({ userData, setUserData, onSubmit, generatePassword, submitText, onCancel }) => (
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
            disabled={submitText === "Update User"} // Disable email edit on update
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
        <div>
          <label className="block mb-1 font-medium">Password</label>
          <div className="flex gap-2">
            <input
              type="text"
              value={userData.password || ""}
              onChange={(e) => setUserData({ ...userData, password: e.target.value })}
              className="flex-1 border rounded px-3 py-2"
              placeholder="Enter password or generate one"
              required={submitText === "Add User"}
              disabled={submitText === "Update User"} // Disable password editing on update for simplicity
            />
            {submitText === "Add User" && (
              <button
                type="button"
                onClick={generatePassword}
                className="border px-3 py-2 rounded flex items-center gap-1"
              >
                <Key size={16} /> Generate
              </button>
            )}
          </div>
        </div>
        <div className="flex justify-end space-x-3 pt-4">
          <button type="button" onClick={onCancel} className="border px-4 py-2 rounded">
            Cancel
          </button>
          <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">
            {submitText}
          </button>
        </div>
      </div>
    </form>
  );
const SystemSettings = () => (
    <div className="space-y-6">
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
                defaultValue={30}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Low Battery Threshold (%)
              </label>
              <input
                type="number"
                defaultValue={20}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Vibration Sensitivity
              </label>
              <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent">
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
                defaultValue="192.168.1.100"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Data Update Interval (seconds)
              </label>
              <input
                type="number"
                defaultValue={60}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Backup Server URL
              </label>
              <input
                type="url"
                placeholder="https://backup.rescuelink.com"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>
        </div>
      </div>

      <div className="flex justify-end">
        <button className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
          <Save className="h-4 w-4 mr-2" />
          Save Settings
        </button>
      </div>
    </div>
  );

  const DataManagement = () => (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold text-gray-900">Data Management</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Export Data</h3>
          <p className="text-gray-600 mb-4">Download historical data for analysis and reporting.</p>
          <div className="space-y-3">
            <button className="w-full inline-flex items-center justify-center px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors">
              <Download className="h-4 w-4 mr-2" />
              Export Device Data (CSV)
            </button>
            <button className="w-full inline-flex items-center justify-center px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors">
              <Download className="h-4 w-4 mr-2" />
              Export Alert History (CSV)
            </button>
            <button className="w-full inline-flex items-center justify-center px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors">
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
        return <SystemSettings/>
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
