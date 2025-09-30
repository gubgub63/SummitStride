import { CourseDifficulty } from '@summitstride/shared'

export interface CreateCourseRequest {
  name: string
  location: string
  distance: number // in kilometers
  elevationGain: number // in meters
  elevationLoss: number // in meters
  difficulty?: CourseDifficulty // Optional, can be auto-calculated
  description?: string
  routeData?: any // GPX data, waypoints, etc.
}

export interface UpdateCourseRequest {
  name?: string
  location?: string
  distance?: number
  elevationGain?: number
  elevationLoss?: number
  difficulty?: CourseDifficulty
  description?: string
  routeData?: any
}

export interface CourseSearchQuery {
  search?: string // Search in name, location, description
  difficulty?: CourseDifficulty[]
  category?: TrailCategory[]
  minDistance?: number
  maxDistance?: number
  minElevation?: number
  maxElevation?: number
  location?: string
  sortBy?: 'name' | 'distance' | 'elevationGain' | 'difficulty' | 'createdAt'
  sortOrder?: 'asc' | 'desc'
  page?: number
  limit?: number
}

export interface CourseResponse {
  id: string
  name: string
  location: string
  distance: number
  elevationGain: number
  elevationLoss: number
  difficulty: CourseDifficulty
  category: TrailCategory
  description?: string
  routeData?: any
  createdAt: Date
  updatedAt: Date
  registrationCount?: number
}

export interface CourseListResponse {
  courses: CourseResponse[]
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
  filters: {
    difficulties: CourseDifficulty[]
    categories: TrailCategory[]
    locations: string[]
  }
}

export enum TrailCategory {
  SHORT = 'SHORT', // < 25km
  LONG = 'LONG',   // 25-50km
  ULTRA = 'ULTRA'  // > 50km
}

export const COURSE_DIFFICULTIES = {
  EASY: 'Facile - Débutant accessible',
  MODERATE: 'Modéré - Niveau intermédiaire requis',
  HARD: 'Difficile - Bon niveau d\'entraînement nécessaire',
  EXTREME: 'Extrême - Réservé aux experts'
} as const

export const TRAIL_CATEGORIES = {
  SHORT: 'Trail Court (< 25km)',
  LONG: 'Trail Long (25-50km)',
  ULTRA: 'Ultra Trail (> 50km)'
} as const

export const COURSE_SORT_OPTIONS = [
  { value: 'name', label: 'Nom' },
  { value: 'distance', label: 'Distance' },
  { value: 'elevationGain', label: 'Dénivelé positif' },
  { value: 'difficulty', label: 'Difficulté' },
  { value: 'createdAt', label: 'Date d\'ajout' }
] as const

// GPX and route data structures
export interface RoutePoint {
  lat: number
  lng: number
  elevation?: number
  timestamp?: string
}

export interface RouteSegment {
  name?: string
  points: RoutePoint[]
  distance: number
  elevationGain: number
  elevationLoss: number
}

export interface Checkpoint {
  name: string
  position: RoutePoint
  type: 'start' | 'finish' | 'checkpoint' | 'aid_station'
  services?: string[] // ['water', 'food', 'medical', 'gear']
}

export interface RouteData {
  gpxData?: string // Raw GPX content
  segments?: RouteSegment[]
  checkpoints?: Checkpoint[]
  elevationProfile?: {
    distance: number[]
    elevation: number[]
  }
  metadata?: {
    source: string
    uploadedAt: string
    originalFilename?: string
  }
}
