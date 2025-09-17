import { CourseDifficulty } from '@coach-ia-hugo/shared'
import { CreateCourseRequest, UpdateCourseRequest, TrailCategory, CourseResponse } from '../types/course.js'

export class CourseUtils {
  static validateCourseData(data: CreateCourseRequest | UpdateCourseRequest): string[] {
    const errors: string[] = []

    // Validate distance
    if (data.distance !== undefined) {
      if (data.distance <= 0 || data.distance > 1000) {
        errors.push('La distance doit être entre 0.1 et 1000 km')
      }
    }

    // Validate elevation gain
    if (data.elevationGain !== undefined) {
      if (data.elevationGain < 0 || data.elevationGain > 10000) {
        errors.push('Le dénivelé positif doit être entre 0 et 10000 mètres')
      }
    }

    // Validate elevation loss
    if (data.elevationLoss !== undefined) {
      if (data.elevationLoss < 0 || data.elevationLoss > 10000) {
        errors.push('Le dénivelé négatif doit être entre 0 et 10000 mètres')
      }
    }

    // Validate name
    if (data.name !== undefined) {
      if (data.name.trim().length < 3 || data.name.trim().length > 200) {
        errors.push('Le nom de la course doit contenir entre 3 et 200 caractères')
      }
    }

    // Validate location
    if (data.location !== undefined) {
      if (data.location.trim().length < 2 || data.location.trim().length > 100) {
        errors.push('La localisation doit contenir entre 2 et 100 caractères')
      }
    }

    // Validate description
    if (data.description !== undefined && data.description !== null) {
      if (data.description.length > 2000) {
        errors.push('La description ne peut pas dépasser 2000 caractères')
      }
    }

    return errors
  }

  static determineTrailCategory(distance: number): TrailCategory {
    if (distance < 25) {
      return TrailCategory.SHORT
    } else if (distance <= 50) {
      return TrailCategory.LONG
    } else {
      return TrailCategory.ULTRA
    }
  }

  static calculateAutomaticDifficulty(distance: number, elevationGain: number): CourseDifficulty {
    // Calculate difficulty based on distance and elevation
    // This is a simplified algorithm - could be more sophisticated

    const elevationRatio = elevationGain / distance // meters per km

    // Score based on distance
    let distanceScore = 0
    if (distance < 10) distanceScore = 1
    else if (distance < 25) distanceScore = 2
    else if (distance < 50) distanceScore = 3
    else distanceScore = 4

    // Score based on elevation ratio
    let elevationScore = 0
    if (elevationRatio < 20) elevationScore = 1
    else if (elevationRatio < 50) elevationScore = 2
    else if (elevationRatio < 100) elevationScore = 3
    else elevationScore = 4

    // Combined score
    const totalScore = (distanceScore + elevationScore) / 2

    if (totalScore <= 1.5) return CourseDifficulty.EASY
    else if (totalScore <= 2.5) return CourseDifficulty.MODERATE
    else if (totalScore <= 3.5) return CourseDifficulty.HARD
    else return CourseDifficulty.EXTREME
  }

  static formatCourseResponse(course: any): CourseResponse {
    return {
      ...course,
      category: this.determineTrailCategory(course.distance),
      registrationCount: course.raceRegistrations?.length || 0
    }
  }

  static buildSearchQuery(filters: any) {
    const where: any = {}

    // Text search in name, location, and description
    if (filters.search) {
      where.OR = [
        { name: { contains: filters.search, mode: 'insensitive' } },
        { location: { contains: filters.search, mode: 'insensitive' } },
        { description: { contains: filters.search, mode: 'insensitive' } }
      ]
    }

    // Difficulty filter
    if (filters.difficulty && filters.difficulty.length > 0) {
      where.difficulty = { in: filters.difficulty }
    }

    // Distance range
    if (filters.minDistance !== undefined || filters.maxDistance !== undefined) {
      where.distance = {}
      if (filters.minDistance !== undefined) {
        where.distance.gte = filters.minDistance
      }
      if (filters.maxDistance !== undefined) {
        where.distance.lte = filters.maxDistance
      }
    }

    // Elevation range
    if (filters.minElevation !== undefined || filters.maxElevation !== undefined) {
      where.elevationGain = {}
      if (filters.minElevation !== undefined) {
        where.elevationGain.gte = filters.minElevation
      }
      if (filters.maxElevation !== undefined) {
        where.elevationGain.lte = filters.maxElevation
      }
    }

    // Location filter
    if (filters.location) {
      where.location = { contains: filters.location, mode: 'insensitive' }
    }

    // Category filter (based on distance)
    if (filters.category && filters.category.length > 0) {
      const distanceConditions = []

      if (filters.category.includes(TrailCategory.SHORT)) {
        distanceConditions.push({ distance: { lt: 25 } })
      }
      if (filters.category.includes(TrailCategory.LONG)) {
        distanceConditions.push({ distance: { gte: 25, lte: 50 } })
      }
      if (filters.category.includes(TrailCategory.ULTRA)) {
        distanceConditions.push({ distance: { gt: 50 } })
      }

      if (distanceConditions.length > 0) {
        where.OR = where.OR
          ? [...where.OR, ...distanceConditions]
          : distanceConditions
      }
    }

    return where
  }

  static buildOrderBy(sortBy?: string, sortOrder?: string) {
    const order = sortOrder === 'desc' ? 'desc' : 'asc'

    switch (sortBy) {
      case 'name':
        return { name: order }
      case 'distance':
        return { distance: order }
      case 'elevationGain':
        return { elevationGain: order }
      case 'difficulty':
        return { difficulty: order }
      case 'createdAt':
        return { createdAt: order }
      default:
        return { createdAt: 'desc' }
    }
  }

  static calculatePagination(page?: number, limit?: number) {
    const currentPage = Math.max(1, page || 1)
    const itemsPerPage = Math.min(100, Math.max(1, limit || 20))
    const skip = (currentPage - 1) * itemsPerPage

    return {
      page: currentPage,
      limit: itemsPerPage,
      skip
    }
  }

  static extractUniqueLocations(courses: any[]): string[] {
    const locations = courses.map(course => course.location.trim())
    return [...new Set(locations)].sort()
  }

  static validateRouteData(routeData: any): string[] {
    const errors: string[] = []

    if (!routeData) return errors

    // Validate GPX data if present
    if (routeData.gpxData && typeof routeData.gpxData !== 'string') {
      errors.push('Les données GPX doivent être au format texte')
    }

    // Validate segments
    if (routeData.segments && !Array.isArray(routeData.segments)) {
      errors.push('Les segments doivent être un tableau')
    }

    // Validate checkpoints
    if (routeData.checkpoints && !Array.isArray(routeData.checkpoints)) {
      errors.push('Les checkpoints doivent être un tableau')
    }

    return errors
  }
}
