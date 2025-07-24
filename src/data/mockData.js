export const mockDevices = [
  {
    device_id: 'RLK001',
    timestamp: new Date().toISOString(),
    vibration_intensity: 2.3,
    tilt_x: 1.2,
    tilt_y: -0.8,
    tilt_z: 0.3,
    SOS_triggered: false,
    accident_reported: false,
    battery_level: 85,
    device_status: 'Active',
    location: { lat: 23.8103, long: 90.4125 },
    actuator_status: false,
    site_name: 'Dhaka Central'
  },
  {
    device_id: 'RLK002',
    timestamp: new Date(Date.now() - 300000).toISOString(),
    vibration_intensity: 8.7,
    tilt_x: 3.4,
    tilt_y: -2.1,
    tilt_z: 1.8,
    SOS_triggered: true,
    accident_reported: true,
    battery_level: 23,
    device_status: 'Active',
    location: { lat: 23.7805, long: 90.3492 },
    actuator_status: true,
    site_name: 'Wari Junction'
  },
  {
    device_id: 'RLK003',
    timestamp: new Date(Date.now() - 900000).toISOString(),
    vibration_intensity: 1.1,
    tilt_x: 0.5,
    tilt_y: -0.3,
    tilt_z: 0.1,
    SOS_triggered: false,
    accident_reported: false,
    battery_level: 92,
    device_status: 'Active',
    location: { lat: 23.7461, long: 90.3742 },
    actuator_status: false,
    site_name: 'Motijheel Area'
  },
  {
    device_id: 'RLK004',
    timestamp: new Date(Date.now() - 1800000).toISOString(),
    vibration_intensity: 0.0,
    tilt_x: 0.0,
    tilt_y: 0.0,
    tilt_z: 0.0,
    SOS_triggered: false,
    accident_reported: false,
    battery_level: 0,
    device_status: 'Disconnected',
    location: { lat: 23.8223, long: 90.3654 },
    actuator_status: false,
    site_name: 'Gulshan Circle'
  },
  {
    device_id: 'RLK005',
    timestamp: new Date(Date.now() - 120000).toISOString(),
    vibration_intensity: 4.2,
    tilt_x: 1.8,
    tilt_y: -1.2,
    tilt_z: 0.9,
    SOS_triggered: false,
    accident_reported: false,
    battery_level: 15,
    device_status: 'Faulty',
    location: { lat: 23.7279, long: 90.4084 },
    actuator_status: false,
    site_name: 'Dhanmondi Lake'
  }
];

export const mockAlerts = [
  {
    alert_id: 'ALT001',
    device_id: 'RLK002',
    type: 'SOS',
    timestamp: new Date(Date.now() - 300000).toISOString(),
    resolved_status: false,
    severity: 'High',
    message: 'Emergency SOS triggered at Wari Junction'
  },
  {
    alert_id: 'ALT002',
    device_id: 'RLK002',
    type: 'Accident',
    timestamp: new Date(Date.now() - 300000).toISOString(),
    resolved_status: false,
    severity: 'High',
    message: 'Sudden shock detected - possible accident'
  },
  {
    alert_id: 'ALT003',
    device_id: 'RLK005',
    type: 'Low Battery',
    timestamp: new Date(Date.now() - 600000).toISOString(),
    resolved_status: false,
    severity: 'Medium',
    message: 'Battery level critically low (15%)'
  },
  {
    alert_id: 'ALT004',
    device_id: 'RLK004',
    type: 'Device Fault',
    timestamp: new Date(Date.now() - 1800000).toISOString(),
    resolved_status: false,
    severity: 'Medium',
    message: 'Device disconnected - check connectivity'
  }
];

export const mockAnalyticsData = [
  { date: '2024-01-01', activeDevices: 15, alerts: 3, avgBattery: 78, incidents: 1 },
  { date: '2024-01-02', activeDevices: 14, alerts: 5, avgBattery: 76, incidents: 2 },
  { date: '2024-01-03', activeDevices: 15, alerts: 2, avgBattery: 74, incidents: 0 },
  { date: '2024-01-04', activeDevices: 13, alerts: 8, avgBattery: 72, incidents: 3 },
  { date: '2024-01-05', activeDevices: 15, alerts: 1, avgBattery: 70, incidents: 0 },
  { date: '2024-01-06', activeDevices: 14, alerts: 4, avgBattery: 68, incidents: 1 },
  { date: '2024-01-07', activeDevices: 12, alerts: 6, avgBattery: 66, incidents: 2 }
];
