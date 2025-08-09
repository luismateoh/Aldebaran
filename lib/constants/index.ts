// API Endpoints
export const API_ENDPOINTS = {
  EVENTS: '/api/events',
  COMMENTS: '/api/comments',
  USER: '/api/user',
  ADMIN: '/api/admin',
  PROPOSALS: '/api/proposals',
  AI_EVENT_SEARCH: '/api/ai-event-search',
  ENHANCE_EVENT: '/api/enhance-event',
  SEND_EVENT_EMAIL: '/api/send-event-email',
  WEB_FETCH: '/api/web-fetch',
  WEB_SEARCH: '/api/web-search',
} as const

// External URLs
export const EXTERNAL_URLS = {
  GOOGLE_CALENDAR: 'https://calendar.google.com/calendar/render?action=TEMPLATE',
  GOOGLE_MAPS: 'https://www.google.com/maps/search',
} as const

// Firebase Collections
export const FIREBASE_COLLECTIONS = {
  EVENTS: 'events',
  COMMENTS: 'comments',
  PROPOSALS: 'proposals',
  USERS: 'users',
  ADMINISTRATORS: 'administrators',
  SYSTEM_SETTINGS: 'systemSettings',
  USER_INTERACTIONS: 'userInteractions',
  GOALS: 'goals',
} as const

// UI Constants
export const UI_CONSTANTS = {
  DEFAULT_EVENT_DURATION: 4, // hours
  NOTIFICATION_TIMEOUT: 2000, // ms
  DEFAULT_ALTITUDE: '1000m',
  DEFAULT_AUTHOR: 'Luis Hincapie',
  MAX_SNIPPET_LENGTH: 150,
  SEARCH_TIMEOUT: 10000, // ms
} as const

// Event Categories
export const EVENT_CATEGORIES = {
  RUNNING: 'running',
  MARATHON: 'marathon',
  TRAIL: 'trail',
  CYCLING: 'cycling',
  TRIATHLON: 'triathlon',
  OBSTACLE: 'obstacle',
} as const

// Event Status
export const EVENT_STATUS = {
  PUBLISHED: 'published',
  DRAFT: 'draft',
  ARCHIVED: 'archived',
  CANCELLED: 'cancelled',
} as const

// Proposal Status
export const PROPOSAL_STATUS = {
  PENDING: 'pending',
  APPROVED: 'approved',
  REJECTED: 'rejected',
} as const

// User Roles
export const USER_ROLES = {
  ADMIN: 'admin',
  SUPER_ADMIN: 'super_admin',
  USER: 'user',
} as const

// Common CSS Classes
export const CSS_CLASSES = {
  CARD: 'rounded-lg border bg-card p-4 text-card-foreground shadow-sm',
  BUTTON_ACTION: 'flex items-center justify-center gap-1 px-3 py-2',
  BUTTON_COMPACT: 'h-7 px-2 py-0.5',
  INPUT_BASE: 'flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm',
  ICON_SIZE: {
    SM: 'h-3 w-3',
    MD: 'h-4 w-4',
    LG: 'h-5 w-5',
  }
} as const

// Validation Rules
export const VALIDATION = {
  MIN_TITLE_LENGTH: 5,
  MAX_TITLE_LENGTH: 100,
  MIN_DESCRIPTION_LENGTH: 10,
  MAX_DESCRIPTION_LENGTH: 2000,
  MIN_PASSWORD_LENGTH: 6,
  EMAIL_REGEX: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
} as const

// Date Formats
export const DATE_FORMATS = {
  ISO_DATE: 'YYYY-MM-DD',
  DISPLAY_DATE: 'dd MMMM yyyy',
  SHORT_DATE: 'dd/MM/yyyy',
  DAY_MONTH: 'dd MMMM',
  WEEKDAY: 'EEE',
} as const