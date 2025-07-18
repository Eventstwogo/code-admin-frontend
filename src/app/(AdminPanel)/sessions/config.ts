export const SESSION_CONFIG = {
  // Default pagination settings
  DEFAULT_LIMIT: 10,
  MAX_LIMIT: 100,
  MIN_LIMIT: 1,

  // Default filter settings
  DEFAULT_ACTIVE_ONLY: true,

  // Time format settings
  DATE_FORMAT: 'localeString',
  TIME_AGO_THRESHOLDS: {
    SECONDS: 60,
    MINUTES: 3600,
    HOURS: 86400,
  },

  // UI Settings
  REFRESH_INTERVAL: 30000, // 30 seconds
  DEFAULT_TOAST_DURATION: 3000,

  // Device type mappings
  DEVICE_KEYWORDS: {
    MOBILE: ['mobile', 'phone', 'android', 'ios'],
    TABLET: ['tablet', 'ipad'],
    DESKTOP: ['desktop', 'windows', 'mac', 'linux'],
  },

  // Status colors
  STATUS_COLORS: {
    ACTIVE: 'bg-green-100 text-green-800',
    INACTIVE: 'bg-gray-100 text-gray-800',
  },

  // API endpoints
  API_ENDPOINTS: {
    GET_SESSIONS: '/api/v1/admin/sessions/',
    TERMINATE_SESSION: '/api/v1/admin/sessions/',
    TERMINATE_ALL_SESSIONS: '/api/v1/admin/sessions/',
  },

  // Error messages
  ERROR_MESSAGES: {
    INVALID_USER_ID: 'Please enter a valid user ID',
    INVALID_SESSION_ID: 'Invalid session ID',
    FETCH_FAILED: 'Failed to fetch sessions',
    TERMINATE_FAILED: 'Failed to terminate session',
    TERMINATE_ALL_FAILED: 'Failed to terminate sessions',
    NETWORK_ERROR: 'Network error. Please try again.',
    UNAUTHORIZED: 'You are not authorized to perform this action',
  },

  // Success messages
  SUCCESS_MESSAGES: {
    SESSION_TERMINATED: 'Session terminated successfully',
    ALL_SESSIONS_TERMINATED: 'All sessions terminated successfully',
    SESSIONS_REFRESHED: 'Sessions refreshed',
  },
} as const;

export type SessionConfig = typeof SESSION_CONFIG;