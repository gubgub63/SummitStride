/**
 * Course Service - SummitStride
 * Service pour les appels API liés aux courses
 *
 * Backend APIs disponibles (développées en Phase 3):
 * - GET /api/courses - Liste avec filtres et pagination
 * - GET /api/courses/:id - Détail d'une course
 * - POST /api/courses - Créer une course (admin)
 * - PUT /api/courses/:id - Modifier une course (admin)
 * - DELETE /api/courses/:id - Supprimer une course (admin)
 * - GET /api/courses/meta/* - Métadonnées (difficultés, catégories, stats)
 */

export interface Course {
  id: string
  name: string
  location: string
  distance: number
  elevationGain: number
  elevationLoss: number
  difficulty: 'EASY' | 'MODERATE' | 'HARD' | 'EXTREME'
  category: 'SHORT' | 'LONG' | 'ULTRA'
  description?: string
  routeData?: any
  createdAt: string
  updatedAt: string
  registrationCount?: number
}

export interface CourseSearchFilters {
  search?: string
  difficulty?: string[]
  category?: string[]
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

export interface CourseListResponse {
  courses: Course[]
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
  filters: {
    difficulties: string[]
    categories: string[]
    locations: string[]
  }
}

export interface CourseMetadata {
  difficulties: Record<string, string>
  categories: Record<string, string>
  sortOptions: Array<{ value: string; label: string }>
}

export interface CourseStatistics {
  totalCourses: number
  byDifficulty: Record<string, number>
  byCategory: Record<string, number>
  averageDistance: number
  averageElevation: number
}

export interface SearchSuggestion {
  type: 'course' | 'location'
  value: string
}

class CourseService {
  private baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000'

  private async fetchWithAuth(url: string, options: RequestInit = {}) {
    const token = localStorage.getItem('auth_token')

    const response = await fetch(`${this.baseUrl}${url}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...(token && { Authorization: `Bearer ${token}` }),
        ...options.headers,
      },
    })

    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: 'Network error' }))
      throw new Error(error.error || `HTTP ${response.status}`)
    }

    return response.json()
  }

  private async fetchPublic(url: string, options: RequestInit = {}) {
    const response = await fetch(`${this.baseUrl}${url}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
    })

    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: 'Network error' }))
      throw new Error(error.error || `HTTP ${response.status}`)
    }

    return response.json()
  }

  /**
   * Récupère la liste des courses avec filtres et pagination
   */
  async getCourses(filters: CourseSearchFilters = {}): Promise<CourseListResponse> {
    const searchParams = new URLSearchParams()

    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        if (Array.isArray(value)) {
          value.forEach(v => searchParams.append(key, v.toString()))
        } else {
          searchParams.set(key, value.toString())
        }
      }
    })

    const queryString = searchParams.toString()
    const url = `/api/courses${queryString ? `?${queryString}` : ''}`

    return this.fetchPublic(url)
  }

  /**
   * Récupère le détail d'une course par son ID
   */
  async getCourse(id: string): Promise<{ course: Course }> {
    return this.fetchWithAuth(`/api/courses/${id}`)
  }

  /**
   * Récupère les métadonnées pour les filtres et formulaires
   */
  async getCourseDifficulties(): Promise<{ difficulties: Record<string, string> }> {
    return this.fetchWithAuth('/api/courses/meta/difficulties')
  }

  async getCourseCategories(): Promise<{ categories: Record<string, string> }> {
    return this.fetchWithAuth('/api/courses/meta/categories')
  }

  async getCourseSortOptions(): Promise<{ sortOptions: Array<{ value: string; label: string }> }> {
    return this.fetchWithAuth('/api/courses/meta/sort-options')
  }

  /**
   * Récupère toutes les métadonnées en une fois
   */
  async getCourseMetadata(): Promise<CourseMetadata> {
    const [difficulties, categories, sortOptions] = await Promise.all([
      this.getCourseDifficulties(),
      this.getCourseCategories(),
      this.getCourseSortOptions(),
    ])

    return {
      difficulties: difficulties.difficulties,
      categories: categories.categories,
      sortOptions: sortOptions.sortOptions,
    }
  }

  /**
   * Récupère les statistiques des courses
   */
  async getCourseStatistics(): Promise<CourseStatistics> {
    return this.fetchWithAuth('/api/courses/meta/statistics')
  }

  /**
   * Récupère les suggestions de recherche pour l'autocomplétion
   */
  async getSearchSuggestions(query: string): Promise<{ suggestions: SearchSuggestion[] }> {
    if (!query || query.length < 2) {
      return { suggestions: [] }
    }

    const searchParams = new URLSearchParams({ q: query })
    return this.fetchWithAuth(`/api/courses/meta/search-suggestions?${searchParams}`)
  }

  /**
   * Fonctions utilitaires pour formatage
   */

  formatDistance(distance: number): string {
    return `${distance} km`
  }

  formatElevation(elevation: number): string {
    return `${elevation} m D+`
  }

  getDifficultyLabel(difficulty: string): string {
    const labels = {
      EASY: 'Facile',
      MODERATE: 'Modéré',
      HARD: 'Difficile',
      EXTREME: 'Extrême'
    }
    return labels[difficulty as keyof typeof labels] || difficulty
  }

  getCategoryLabel(category: string): string {
    const labels = {
      SHORT: 'Trail Court',
      LONG: 'Trail Long',
      ULTRA: 'Ultra Trail'
    }
    return labels[category as keyof typeof labels] || category
  }

  getDifficultyColor(difficulty: string): string {
    const colors = {
      EASY: 'text-green-600 bg-green-50',
      MODERATE: 'text-blue-600 bg-blue-50',
      HARD: 'text-orange-600 bg-orange-50',
      EXTREME: 'text-red-600 bg-red-50'
    }
    return colors[difficulty as keyof typeof colors] || 'text-gray-600 bg-gray-50'
  }

  getCategoryColor(category: string): string {
    const colors = {
      SHORT: 'text-green-600 bg-green-50',
      LONG: 'text-blue-600 bg-blue-50',
      ULTRA: 'text-purple-600 bg-purple-50'
    }
    return colors[category as keyof typeof colors] || 'text-gray-600 bg-gray-50'
  }
}

export const courseService = new CourseService()