/**
 * Application constants
 * Centralized location for all magic numbers and configuration values
 */

// ==================
// REACT QUERY CONFIG
// ==================

export const QUERY_CONFIG = {
  // Cache duration before data is considered stale
  STALE_TIME: 5 * 60 * 1000, // 5 minutes
  
  // Garbage collection time - how long to keep unused data in cache
  GC_TIME: 10 * 60 * 1000, // 10 minutes
  
  // Number of retry attempts for failed queries
  RETRY_COUNT: 3,
  
  // Number of retry attempts for failed mutations
  MUTATION_RETRY_COUNT: 1,
}

// ==================
// API TIMEOUTS
// ==================

export const API_TIMEOUTS = {
  // Default API request timeout
  DEFAULT: 10000, // 10 seconds
  
  // Avatar upload/download timeout (larger files)
  AVATAR: 30000, // 30 seconds
  
  // File upload timeout
  FILE_UPLOAD: 60000, // 60 seconds
}

// ==================
// PAGINATION
// ==================

export const PAGINATION = {
  // Default page size for directory listing
  DEFAULT_PAGE_SIZE: 12,
  
  // Default maximum distance for directory search
  DEFAULT_MAX_DISTANCE: 15, // km
  
  // Minimum distance for search
  MIN_DISTANCE: 1, // km
  
  // Maximum distance for search
  MAX_DISTANCE: 50, // km
}

// ==================
// GPS COORDINATES
// ==================

export const GPS_BOUNDS = {
  // Latitude bounds
  LAT_MIN: -90,
  LAT_MAX: 90,
  
  // Longitude bounds
  LNG_MIN: -180,
  LNG_MAX: 180,
}

// ==================
// RESOURCE STATUS
// ==================

export const RESOURCE_STATUS = {
  ACTIVE: 'active',
  INACTIVE: 'inactive',
  PENDING: 'pending',
}

// ==================
// MAP CONFIG
// ==================

export const MAP_CONFIG = {
  // Default center for France (Marseille area)
  DEFAULT_CENTER: [43.294, 5.58],
  
  // Default zoom level
  DEFAULT_ZOOM: 12,
  
  // Map height
  DEFAULT_HEIGHT: 420, // px
}

// ==================
// FORM VALIDATION
// ==================

export const VALIDATION = {
  // SIRET number length
  SIRET_LENGTH: 14,
  
  // French phone number length (without spaces)
  PHONE_MIN_LENGTH: 10,
  PHONE_MAX_LENGTH: 15,
  
  // Password requirements
  PASSWORD_MIN_LENGTH: 8,
}

// ==================
// UI CONSTANTS
// ==================

export const UI = {
  // Toast notification duration
  TOAST_DURATION: 3000, // ms
  
  // Debounce delay for search inputs
  SEARCH_DEBOUNCE: 300, // ms
  
  // Animation durations
  ANIMATION_FAST: 150, // ms
  ANIMATION_NORMAL: 300, // ms
  ANIMATION_SLOW: 500, // ms
}
