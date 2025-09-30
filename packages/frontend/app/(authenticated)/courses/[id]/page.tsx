/**
 * Course Detail Page - SummitStride
 * Page de détail d'une course avec profil altimétrique et actions
 */

'use client'

import React, { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { Card, CardHeader, CardTitle, CardContent } from '../../../../components/ui/Card'
import { Button } from '../../../../components/ui/Button'
import { ElevationProfile } from '../../../../components/courses/ElevationProfile'
import { RegistrationModal } from '../../../../components/registrations/RegistrationModal'
import { useCourses } from '../../../../lib/hooks/useCourses'
import { courseService } from '../../../../lib/services/courseService'

export default function CourseDetailPage() {
  const params = useParams()
  const router = useRouter()
  const courseId = params.id as string

  const [isRegistrationModalOpen, setIsRegistrationModalOpen] = useState(false)

  const {
    selectedCourse,
    loadingCourse,
    courseError,
    getCourse,
    clearError
  } = useCourses()

  useEffect(() => {
    if (courseId) {
      getCourse(courseId)
    }
  }, [courseId, getCourse])

  if (loadingCourse) {
    return (
      <div className="container mx-auto px-4 py-6">
        <div className="animate-pulse space-y-6">
          {/* Breadcrumb skeleton */}
          <div className="h-4 bg-muted rounded w-64"></div>

          {/* Header skeleton */}
          <div className="space-y-4">
            <div className="h-8 bg-muted rounded w-96"></div>
            <div className="h-4 bg-muted rounded w-48"></div>
            <div className="flex space-x-4">
              <div className="h-6 bg-muted rounded-full w-20"></div>
              <div className="h-6 bg-muted rounded-full w-24"></div>
            </div>
          </div>

          {/* Content skeleton */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-6">
              <div className="h-64 bg-muted rounded-lg"></div>
              <div className="h-48 bg-muted rounded-lg"></div>
            </div>
            <div className="space-y-6">
              <div className="h-32 bg-muted rounded-lg"></div>
              <div className="h-40 bg-muted rounded-lg"></div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (courseError || !selectedCourse) {
    return (
      <div className="container mx-auto px-4 py-6">
        <div className="text-center py-12">
          <div className="mx-auto w-24 h-24 bg-red-50 rounded-full flex items-center justify-center mb-4">
            <svg className="w-12 h-12 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-foreground mb-2">
            Course introuvable
          </h3>
          <p className="text-muted-foreground mb-6">
            {courseError || "Cette course n'existe pas ou a été supprimée."}
          </p>
          <div className="flex justify-center space-x-3">
            <Button variant="outline" onClick={() => router.back()}>
              Retour
            </Button>
            <Button onClick={clearError} asChild>
              <Link href="/courses">
                Voir toutes les courses
              </Link>
            </Button>
          </div>
        </div>
      </div>
    )
  }

  const course = selectedCourse

  return (
    <div className="container mx-auto px-4 py-6 space-y-6">
      {/* Breadcrumb */}
      <nav className="flex items-center space-x-2 text-sm text-muted-foreground">
        <Link href="/courses" className="hover:text-foreground transition-colors">
          Courses
        </Link>
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
        </svg>
        <span className="text-foreground font-medium">{course.name}</span>
      </nav>

      {/* Header */}
      <div className="space-y-4">
        <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
          <div className="space-y-2">
            <h1 className="text-3xl font-bold text-foreground">{course.name}</h1>
            <div className="flex items-center space-x-2 text-muted-foreground">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              <span>{course.location}</span>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-2">
            <Button
              className="flex-1 sm:flex-initial"
              onClick={() => setIsRegistrationModalOpen(true)}
            >
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              S'inscrire à cette course
            </Button>
            <Button variant="outline">
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
              </svg>
              Favoris
            </Button>
          </div>
        </div>

        {/* Course badges */}
        <div className="flex flex-wrap gap-2">
          <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${courseService.getDifficultyColor(course.difficulty)}`}>
            {courseService.getDifficultyLabel(course.difficulty)}
          </span>
          <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${courseService.getCategoryColor(course.category)}`}>
            {courseService.getCategoryLabel(course.category)}
          </span>
          {course.registrationCount && (
            <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-50 text-blue-700">
              {course.registrationCount} participants
            </span>
          )}
        </div>
      </div>

      {/* Main content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left column - Main info */}
        <div className="lg:col-span-2 space-y-6">
          {/* Elevation profile */}
          <ElevationProfile
            courseId={course.id}
            routeData={course.routeData}
            distance={course.distance}
            elevationGain={course.elevationGain}
            elevationLoss={course.elevationLoss}
          />

          {/* Description */}
          {course.description && (
            <Card>
              <CardHeader>
                <CardTitle>Description</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="prose prose-sm max-w-none text-foreground">
                  {course.description.split('\n').map((paragraph, index) => (
                    <p key={index} className="mb-3 last:mb-0">
                      {paragraph}
                    </p>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Route information */}
          {course.routeData && (
            <Card>
              <CardHeader>
                <CardTitle>Informations sur le parcours</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
                  {course.routeData.segments && (
                    <div>
                      <div className="font-medium text-foreground">Segments</div>
                      <div className="text-muted-foreground">{course.routeData.segments.length}</div>
                    </div>
                  )}
                  {course.routeData.checkpoints && (
                    <div>
                      <div className="font-medium text-foreground">Points de contrôle</div>
                      <div className="text-muted-foreground">{course.routeData.checkpoints.length}</div>
                    </div>
                  )}
                  {course.routeData.metadata?.source && (
                    <div>
                      <div className="font-medium text-foreground">Source des données</div>
                      <div className="text-muted-foreground">{course.routeData.metadata.source}</div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Right column - Stats and actions */}
        <div className="space-y-6">
          {/* Course stats */}
          <Card>
            <CardHeader>
              <CardTitle>Caractéristiques</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Distance</span>
                  <span className="font-medium">{courseService.formatDistance(course.distance)}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Dénivelé positif</span>
                  <span className="font-medium text-green-600">+{course.elevationGain} m</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Dénivelé négatif</span>
                  <span className="font-medium text-red-600">-{course.elevationLoss} m</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Difficulté</span>
                  <span className={`px-2 py-1 rounded text-sm font-medium ${courseService.getDifficultyColor(course.difficulty)}`}>
                    {courseService.getDifficultyLabel(course.difficulty)}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Quick actions */}
          <Card>
            <CardHeader>
              <CardTitle>Actions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <Button className="w-full">
                  Créer un plan d'entraînement
                </Button>
                <Button variant="outline" className="w-full" asChild>
                  <Link href={`/courses/compare?courses=${course.id}`}>
                    Comparer avec d'autres courses
                  </Link>
                </Button>
                <Button variant="outline" className="w-full">
                  Partager cette course
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Related courses */}
          <Card>
            <CardHeader>
              <CardTitle>Courses similaires</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-sm text-muted-foreground text-center py-4">
                <p>Fonctionnalité à venir</p>
                <p className="text-xs mt-1">Recommandations basées sur la difficulté et la région</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Registration Modal */}
      {selectedCourse && (
        <RegistrationModal
          course={selectedCourse}
          isOpen={isRegistrationModalOpen}
          onClose={() => setIsRegistrationModalOpen(false)}
          onSuccess={() => {
            // Optionally show success message or redirect
            console.log('Registration successful!')
          }}
        />
      )}
    </div>
  )
}
