/**
 * @typedef {Object} Device
 * @property {string} device_id
 * @property {string} timestamp
 * @property {number} vibration_intensity
 * @property {number} tilt_x
 * @property {number} tilt_y
 * @property {number} tilt_z
 * @property {boolean} SOS_triggered
 * @property {boolean} accident_reported
 * @property {number} battery_level
 * @property {'Active'|'Disconnected'|'Faulty'} device_status
 * @property {{lat: number, long: number}} location
 * @property {boolean} actuator_status
 * @property {string} [site_name]
 */

/**
 * @typedef {Object} Alert
 * @property {string} alert_id
 * @property {string} device_id
 * @property {'SOS'|'Accident'|'Low Battery'|'Device Fault'} type
 * @property {string} timestamp
 * @property {boolean} resolved_status
 * @property {'High'|'Medium'|'Low'} severity
 * @property {string} message
 */

/**
 * @typedef {Object} User
 * @property {string} user_id
 * @property {string} email
 * @property {'Admin'|'Operator'|'Viewer'} role
 * @property {string[]} access_scope
 * @property {string} name
 */

/**
 * @typedef {Object} AnalyticsData
 * @property {string} date
 * @property {number} activeDevices
 * @property {number} alerts
 * @property {number} avgBattery
 * @property {number} incidents
 */