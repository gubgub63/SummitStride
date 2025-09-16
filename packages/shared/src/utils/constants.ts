export const API_ROUTES = {
  AUTH: {
    LOGIN: '/auth/login',
    REGISTER: '/auth/register',
    LOGOUT: '/auth/logout',
    REFRESH: '/auth/refresh',
  },
  USERS: {
    PROFILE: '/users/profile',
    PREFERENCES: '/users/preferences',
  },
  TRAINING: {
    PLANS: '/training/plans',
    SESSIONS: '/training/sessions',
    ANALYTICS: '/training/analytics',
  },
  COURSES: {
    LIST: '/courses',
    SEARCH: '/courses/search',
    DETAILS: '/courses/:id',
  },
  NUTRITION: {
    PLANS: '/nutrition/plans',
    TRACKING: '/nutrition/tracking',
  },
} as const

export const TRAINING_TYPES = {
  ENDURANCE: 'ENDURANCE',
  THRESHOLD: 'THRESHOLD',
  INTERVAL: 'INTERVAL',
  RECOVERY: 'RECOVERY',
  STRENGTH: 'STRENGTH',
  CROSS_TRAINING: 'CROSS_TRAINING',
} as const

export const COURSE_DIFFICULTIES = {
  EASY: 'EASY',
  MODERATE: 'MODERATE',
  HARD: 'HARD',
  EXTREME: 'EXTREME',
} as const

export const UNITS = {
  METRIC: {
    DISTANCE: 'km',
    ELEVATION: 'm',
    WEIGHT: 'kg',
    TEMPERATURE: '°C',
  },
  IMPERIAL: {
    DISTANCE: 'mi',
    ELEVATION: 'ft',
    WEIGHT: 'lbs',
    TEMPERATURE: '°F',
  },
} as const
