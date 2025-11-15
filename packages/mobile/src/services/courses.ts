import { apiRequest } from './api'

export interface CourseListItem {
  id: string
  name: string
  location: string
  distance: number
  elevationGain: number
  elevationLoss: number
  difficulty: string
  category: string
  description?: string | null
  registrationCount?: number
  createdAt: string
  updatedAt: string
}

export interface CourseListResponse {
  courses: CourseListItem[]
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

export interface CourseSearchParams {
  search?: string
  difficulty?: string[]
  category?: string[]
  minDistance?: number
  maxDistance?: number
  limit?: number
  page?: number
}

export async function getCourses(token: string | null, params: CourseSearchParams = {}) {
  const query = new URLSearchParams()
  if (params.search) query.set('search', params.search)
  if (params.limit) query.set('limit', params.limit.toString())
  if (params.page) query.set('page', params.page.toString())
  if (params.minDistance) query.set('minDistance', params.minDistance.toString())
  if (params.maxDistance) query.set('maxDistance', params.maxDistance.toString())
  if (params.difficulty?.length) {
    params.difficulty.forEach(value => query.append('difficulty', value))
  }
  if (params.category?.length) {
    params.category.forEach(value => query.append('category', value))
  }

  const endpoint = query.toString() ? `/api/courses?${query.toString()}` : '/api/courses'

  return apiRequest<CourseListResponse>(endpoint, {
    method: 'GET',
    token: token ?? undefined,
  })
}

export interface CreateCoursePayload {
  name: string
  location: string
  distance: number
  elevationGain: number
  elevationLoss: number
  description?: string
}

export async function createCourse(token: string, payload: CreateCoursePayload) {
  return apiRequest<{ course: CourseListItem }>(`/api/courses/user`, {
    method: 'POST',
    token,
    body: payload,
  })
}
