/**
 * useCourses Hook - SummitStride
 * Hook pour la gestion des données de courses avec cache et états
 *
 * Intégration avec les APIs backend développées en Phase 3
 */

'use client'

import { useState, useEffect, useCallback } from 'react'
import {
  courseService,
  Course,
  CourseSearchFilters,
  CourseListResponse,
  CourseMetadata,
  CourseStatistics,
  SearchSuggestion
} from '../services/courseService'

export interface UseCoursesReturn {
  // Data
  courses: Course[]
  selectedCourse: Course | null
  metadata: CourseMetadata | null
  statistics: CourseStatistics | null
  suggestions: SearchSuggestion[]

  // Pagination
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
  } | null

  // Filters state
  filters: CourseSearchFilters
  availableFilters: {
    difficulties: string[]
    categories: string[]
    locations: string[]
  }

  // Loading states
  loading: boolean
  loadingCourse: boolean
  loadingMetadata: boolean
  loadingStatistics: boolean
  loadingSuggestions: boolean

  // Error states
  error: string | null
  courseError: string | null

  // Actions
  searchCourses: (filters: CourseSearchFilters) => Promise<void>
  getCourse: (id: string) => Promise<void>
  resetSearch: () => void
  updateFilters: (newFilters: Partial<CourseSearchFilters>) => void
  loadMetadata: () => Promise<void>
  loadStatistics: () => Promise<void>
  searchSuggestions: (query: string) => Promise<void>
  clearError: () => void
}

const DEFAULT_FILTERS: CourseSearchFilters = {
  page: 1,
  limit: 12,
  sortBy: 'name',
  sortOrder: 'asc'
}

export function useCourses(): UseCoursesReturn {
  // Data states
  const [courses, setCourses] = useState<Course[]>([])
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null)
  const [metadata, setMetadata] = useState<CourseMetadata | null>(null)
  const [statistics, setStatistics] = useState<CourseStatistics | null>(null)
  const [suggestions, setSuggestions] = useState<SearchSuggestion[]>([])
  const [pagination, setPagination] = useState<CourseListResponse['pagination'] | null>(null)
  const [availableFilters, setAvailableFilters] = useState<{
    difficulties: string[]
    categories: string[]
    locations: string[]
  }>({
    difficulties: [],
    categories: [],
    locations: []
  })

  // Filter state
  const [filters, setFilters] = useState<CourseSearchFilters>(DEFAULT_FILTERS)

  // Loading states
  const [loading, setLoading] = useState(false)
  const [loadingCourse, setLoadingCourse] = useState(false)
  const [loadingMetadata, setLoadingMetadata] = useState(false)
  const [loadingStatistics, setLoadingStatistics] = useState(false)
  const [loadingSuggestions, setLoadingSuggestions] = useState(false)

  // Error states
  const [error, setError] = useState<string | null>(null)
  const [courseError, setCourseError] = useState<string | null>(null)

  // Search courses with filters
  const searchCourses = useCallback(async (searchFilters: CourseSearchFilters) => {
    try {
      setLoading(true)
      setError(null)

      const mergedFilters = { ...DEFAULT_FILTERS, ...searchFilters }
      const response = await courseService.getCourses(mergedFilters)

      setCourses(response.courses)
      setPagination(response.pagination)
      setAvailableFilters(response.filters)
      setFilters(mergedFilters)

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors du chargement des courses')
      setCourses([])
      setPagination(null)
    } finally {
      setLoading(false)
    }
  }, [])

  // Get single course by ID
  const getCourse = useCallback(async (id: string) => {
    try {
      setLoadingCourse(true)
      setCourseError(null)

      const response = await courseService.getCourse(id)
      setSelectedCourse(response.course)

    } catch (err) {
      setCourseError(err instanceof Error ? err.message : 'Erreur lors du chargement de la course')
      setSelectedCourse(null)
    } finally {
      setLoadingCourse(false)
    }
  }, [])

  // Load metadata (difficulties, categories, sort options)
  const loadMetadata = useCallback(async () => {
    try {
      setLoadingMetadata(true)

      const metadata = await courseService.getCourseMetadata()
      setMetadata(metadata)

    } catch (err) {
      console.error('Erreur lors du chargement des métadonnées:', err)
    } finally {
      setLoadingMetadata(false)
    }
  }, [])

  // Load statistics
  const loadStatistics = useCallback(async () => {
    try {
      setLoadingStatistics(true)

      const stats = await courseService.getCourseStatistics()
      setStatistics(stats)

    } catch (err) {
      console.error('Erreur lors du chargement des statistiques:', err)
    } finally {
      setLoadingStatistics(false)
    }
  }, [])

  // Search suggestions for autocomplete
  const searchSuggestions = useCallback(async (query: string) => {
    try {
      setLoadingSuggestions(true)

      const response = await courseService.getSearchSuggestions(query)
      setSuggestions(response.suggestions)

    } catch (err) {
      console.error('Erreur lors du chargement des suggestions:', err)
      setSuggestions([])
    } finally {
      setLoadingSuggestions(false)
    }
  }, [])

  // Update filters and trigger search
  const updateFilters = useCallback((newFilters: Partial<CourseSearchFilters>) => {
    const updatedFilters = { ...filters, ...newFilters }

    // Reset to page 1 when filters change (except for page changes)
    if (!('page' in newFilters)) {
      updatedFilters.page = 1
    }

    searchCourses(updatedFilters)
  }, [filters, searchCourses])

  // Reset search to default state
  const resetSearch = useCallback(() => {
    setFilters(DEFAULT_FILTERS)
    searchCourses(DEFAULT_FILTERS)
  }, [searchCourses])

  // Clear errors
  const clearError = useCallback(() => {
    setError(null)
    setCourseError(null)
  }, [])

  // Load initial data on mount
  useEffect(() => {
    searchCourses(DEFAULT_FILTERS)
    loadMetadata()
  }, [searchCourses, loadMetadata])

  return {
    // Data
    courses,
    selectedCourse,
    metadata,
    statistics,
    suggestions,
    pagination,
    filters,
    availableFilters,

    // Loading states
    loading,
    loadingCourse,
    loadingMetadata,
    loadingStatistics,
    loadingSuggestions,

    // Error states
    error,
    courseError,

    // Actions
    searchCourses,
    getCourse,
    resetSearch,
    updateFilters,
    loadMetadata,
    loadStatistics,
    searchSuggestions,
    clearError,
  }
}