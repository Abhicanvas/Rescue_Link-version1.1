/**
 * Timezone utility functions for converting UTC timestamps to IST (UTC + 5:30)
 */

/**
 * Convert UTC timestamp to IST (UTC + 5:30) - for API timestamps
 * @param {string|Date} utcTimestamp - UTC timestamp string or Date object
 * @returns {Date} - Date object adjusted to IST
 */
export const convertUTCToLocal = (utcTimestamp) => {
  if (!utcTimestamp) return null;
  
  try {
    // Handle both string and Date objects
    const utcDate = typeof utcTimestamp === 'string' ? new Date(utcTimestamp) : utcTimestamp;
    
    // Check if date is valid
    if (isNaN(utcDate.getTime())) {
      console.warn('Invalid timestamp provided:', utcTimestamp);
      return null;
    }
    
    // Add 5 hours and 30 minutes (IST offset) to UTC time
    const istDate = new Date(utcDate.getTime() + (5.5 * 60 * 60 * 1000));
    
    return istDate;
  } catch (error) {
    console.error('Error converting timestamp:', error);
    return null;
  }
};

/**
 * Convert local timestamp without adding IST offset - for system times
 * @param {string|Date} timestamp - Local timestamp string or Date object
 * @returns {Date} - Date object as-is (for system times like "Last updated")
 */
export const convertSystemTime = (timestamp) => {
  if (!timestamp) return null;
  
  try {
    // Handle both string and Date objects
    const date = typeof timestamp === 'string' ? new Date(timestamp) : timestamp;
    
    // Check if date is valid
    if (isNaN(date.getTime())) {
      console.warn('Invalid timestamp provided:', timestamp);
      return null;
    }
    
    // Return as-is for system times (no IST offset)
    return date;
  } catch (error) {
    console.error('Error converting timestamp:', error);
    return null;
  }
};

/**
 * Format timestamp to IST string
 * @param {string|Date} utcTimestamp - UTC timestamp string or Date object
 * @param {object} options - Intl.DateTimeFormat options
 * @returns {string} - Formatted date string in IST
 */
export const formatLocalTimestamp = (utcTimestamp, options = {}) => {
  const localDate = convertUTCToLocal(utcTimestamp);
  
  if (!localDate) return 'N/A';
  
  const defaultOptions = {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    ...options
  };
  
  try {
    return localDate.toLocaleString(undefined, defaultOptions);
  } catch (error) {
    console.error('Error formatting timestamp:', error);
    return localDate.toString();
  }
};

/**
 * Format timestamp to IST date string only
 * @param {string|Date} utcTimestamp - UTC timestamp string or Date object
 * @returns {string} - Formatted date string in IST
 */
export const formatLocalDate = (utcTimestamp) => {
  const localDate = convertUTCToLocal(utcTimestamp);
  
  if (!localDate) return 'N/A';
  
  try {
    return localDate.toLocaleDateString();
  } catch (error) {
    console.error('Error formatting date:', error);
    return localDate.toString();
  }
};

/**
 * Format timestamp to IST time string only
 * @param {string|Date} utcTimestamp - UTC timestamp string or Date object
 * @returns {string} - Formatted time string in IST
 */
export const formatLocalTime = (utcTimestamp) => {
  const localDate = convertUTCToLocal(utcTimestamp);
  
  if (!localDate) return 'N/A';
  
  try {
    return localDate.toLocaleTimeString();
  } catch (error) {
    console.error('Error formatting time:', error);
    return localDate.toString();
  }
};

/**
 * Format system time without IST offset (for "Last updated" times)
 * @param {string|Date} timestamp - System timestamp string or Date object
 * @returns {string} - Formatted time string without IST offset
 */
export const formatSystemTime = (timestamp) => {
  const date = convertSystemTime(timestamp);
  
  if (!date) return 'N/A';
  
  try {
    return date.toLocaleTimeString();
  } catch (error) {
    console.error('Error formatting system time:', error);
    return date.toString();
  }
};

/**
 * Get relative time string (e.g., "2 minutes ago")
 * @param {string|Date} utcTimestamp - UTC timestamp string or Date object
 * @returns {string} - Relative time string
 */
export const getRelativeTime = (utcTimestamp) => {
  const localDate = convertUTCToLocal(utcTimestamp);
  
  if (!localDate) return 'N/A';
  
  const now = new Date();
  const diffMs = now.getTime() - localDate.getTime();
  const diffSeconds = Math.floor(diffMs / 1000);
  const diffMinutes = Math.floor(diffSeconds / 60);
  const diffHours = Math.floor(diffMinutes / 60);
  const diffDays = Math.floor(diffHours / 24);
  
  if (diffSeconds < 60) {
    return 'Just now';
  } else if (diffMinutes < 60) {
    return `${diffMinutes} minute${diffMinutes !== 1 ? 's' : ''} ago`;
  } else if (diffHours < 24) {
    return `${diffHours} hour${diffHours !== 1 ? 's' : ''} ago`;
  } else if (diffDays < 30) {
    return `${diffDays} day${diffDays !== 1 ? 's' : ''} ago`;
  } else {
    return formatLocalDate(utcTimestamp);
  }
};

/**
 * Check if timestamp is recent (within specified minutes)
 * @param {string|Date} utcTimestamp - UTC timestamp string or Date object
 * @param {number} thresholdMinutes - Threshold in minutes (default: 5)
 * @returns {boolean} - True if timestamp is recent
 */
export const isRecentTimestamp = (utcTimestamp, thresholdMinutes = 5) => {
  const localDate = convertUTCToLocal(utcTimestamp);
  
  if (!localDate) return false;
  
  const now = new Date();
  const diffMs = now.getTime() - localDate.getTime();
  const diffMinutes = diffMs / (1000 * 60);
  
  return diffMinutes <= thresholdMinutes;
};