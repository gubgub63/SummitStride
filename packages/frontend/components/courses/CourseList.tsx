/**
 * CourseList Component - Coach IA Hugo
 * Liste principale des courses avec pagination
 */

'use client'

import React from 'react'
import Link from 'next/link'
import { Course } from '../../lib/services/courseService'
import { CourseCard } from '../ui/Card'
import { Button } from '../ui/Button'

interface CourseListProps {
  courses: Course[]
  loading?: boolean
  pagination?: {
    page: number
    limit: number
    total: number
    totalPages: number
  } | null
  onPageChange?: (page: number) => void
  emptyMessage?: string
  className?: string
}

export function CourseList({
  courses,
  loading = false,
  pagination,
  onPageChange,
  emptyMessage = "Aucune course trouvée",
  className = ""
}: CourseListProps) {

  const formatCourseForCard = (course: Course) => ({
    id: course.id,
    name: course.name,
    location: course.location,
    distance: course.distance,
    elevationGain: course.elevationGain,
    difficulty: course.difficulty,
    description: course.description,
  })

  if (loading) {
    return (
      <div className={`space-y-6 ${className}`}>
        {/* Loading skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="animate-pulse">
              <div className="bg-surface border border-border rounded-lg p-6">
                <div className="space-y-3">
                  <div className="flex justify-between items-start">
                    <div className="space-y-2 flex-1">
                      <div className="h-5 bg-muted rounded w-3/4"></div>
                      <div className="h-4 bg-muted rounded w-1/2"></div>
                    </div>
                    <div className="h-6 bg-muted rounded-full w-16"></div>
                  </div>
                  <div className="flex space-x-4">
                    <div className="h-4 bg-muted rounded w-20"></div>
                    <div className="h-4 bg-muted rounded w-24"></div>
                  </div>
                  <div className="h-4 bg-muted rounded w-full"></div>
                  <div className="h-4 bg-muted rounded w-2/3"></div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  if (courses.length === 0) {
    return (
      <div className={`text-center py-12 ${className}`}>
        <div className="mx-auto w-24 h-24 bg-muted rounded-full flex items-center justify-center mb-4">
          <svg className="w-12 h-12 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
          </svg>
        </div>
        <h3 className="text-lg font-medium text-foreground mb-2">
          {emptyMessage}
        </h3>
        <p className="text-muted-foreground mb-6">
          Essayez de modifier vos critères de recherche ou parcourez toutes les courses disponibles.
        </p>
        <Link href="/courses">
          <Button variant="outline">
            Voir toutes les courses
          </Button>
        </Link>
      </div>
    )
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Results summary */}
      {pagination && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            Affichage de <span className="font-medium">{((pagination.page - 1) * pagination.limit) + 1}</span> à{' '}
            <span className="font-medium">
              {Math.min(pagination.page * pagination.limit, pagination.total)}
            </span>{' '}
            sur <span className="font-medium">{pagination.total}</span> courses
          </p>
        </div>
      )}

      {/* Course grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {courses.map((course) => (
          <Link key={course.id} href={`/courses/${course.id}`}>
            <CourseCard
              course={formatCourseForCard(course)}
              className="h-full hover:shadow-lg transition-shadow"
            />
          </Link>
        ))}
      </div>

      {/* Pagination */}
      {pagination && pagination.totalPages > 1 && (
        <div className="flex items-center justify-center space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => onPageChange?.(pagination.page - 1)}
            disabled={pagination.page <= 1}
          >
            <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Précédent
          </Button>

          {/* Page numbers */}
          <div className="flex items-center space-x-1">
            {Array.from({ length: Math.min(5, pagination.totalPages) }, (_, i) => {
              let pageNum: number

              if (pagination.totalPages <= 5) {
                pageNum = i + 1
              } else if (pagination.page <= 3) {
                pageNum = i + 1
              } else if (pagination.page >= pagination.totalPages - 2) {
                pageNum = pagination.totalPages - 4 + i
              } else {
                pageNum = pagination.page - 2 + i
              }

              const isCurrentPage = pageNum === pagination.page

              return (
                <Button
                  key={pageNum}
                  variant={isCurrentPage ? "default" : "ghost"}
                  size="sm"
                  onClick={() => onPageChange?.(pageNum)}
                  className="w-8 h-8 p-0"
                >
                  {pageNum}
                </Button>
              )
            })}
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={() => onPageChange?.(pagination.page + 1)}
            disabled={pagination.page >= pagination.totalPages}
          >
            Suivant
            <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </Button>
        </div>
      )}

      {/* Load more alternative (if no pagination) */}
      {!pagination && courses.length > 0 && (
        <div className="text-center">
          <Button variant="outline">
            Charger plus de courses
          </Button>
        </div>
      )}
    </div>
  )
}