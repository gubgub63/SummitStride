/**
 * Course Compare Page - Coach IA Hugo
 * Comparateur de courses (STUB)
 *
 * TODO: Implémentation complète nécessitera:
 * - Système de sélection multiple de courses
 * - Tableaux de comparaison détaillés
 * - Graphiques comparatifs (profils altimétrique, difficultés, etc.)
 * - Export des comparaisons
 * - Recommandations basées sur les comparaisons
 * - Historique des comparaisons
 */

'use client'

import React, { useState, useEffect } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { Card, CardHeader, CardTitle, CardContent } from '../../../../components/ui/Card'
import { Button } from '../../../../components/ui/Button'
import { useCourses } from '../../../../lib/hooks/useCourses'
import { courseService } from '../../../../lib/services/courseService'

export default function CourseComparePage() {
  const searchParams = useSearchParams()
  const { courses, loading } = useCourses()

  const [selectedCourses, setSelectedCourses] = useState<string[]>([])
  const [comparisonMode, setComparisonMode] = useState<'overview' | 'detailed' | 'charts'>('overview')

  // Load pre-selected courses from URL params
  useEffect(() => {
    const coursesParam = searchParams.get('courses')
    if (coursesParam) {
      setSelectedCourses(coursesParam.split(',').filter(Boolean))
    }
  }, [searchParams])

  const addCourse = (courseId: string) => {
    if (selectedCourses.length < 4 && !selectedCourses.includes(courseId)) {
      setSelectedCourses([...selectedCourses, courseId])
    }
  }

  const removeCourse = (courseId: string) => {
    setSelectedCourses(selectedCourses.filter(id => id !== courseId))
  }

  const selectedCourseData = courses.filter(course => selectedCourses.includes(course.id))

  const comparisonModes = [
    {
      id: 'overview',
      name: 'Vue d\'ensemble',
      icon: (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
        </svg>
      )
    },
    {
      id: 'detailed',
      name: 'Détaillé',
      icon: (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
      )
    },
    {
      id: 'charts',
      name: 'Graphiques',
      icon: (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
        </svg>
      )
    }
  ]

  return (
    <div className="container mx-auto px-4 py-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Comparateur de courses</h1>
          <p className="text-muted-foreground mt-2">
            Comparez jusqu'à 4 courses pour faire le meilleur choix
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Button variant="outline" asChild>
            <Link href="/courses">
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
              </svg>
              Parcourir les courses
            </Link>
          </Button>
        </div>
      </div>

      {/* Development notice */}
      <div className="bg-orange-50 border border-orange-200 rounded-lg p-6">
        <div className="flex items-start space-x-4">
          <div className="flex-shrink-0">
            <svg className="w-8 h-8 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <div className="flex-1">
            <h3 className="text-lg font-medium text-orange-900 mb-2">
              Comparateur avancé en développement
            </h3>
            <p className="text-orange-800 mb-4">
              Le comparateur complet sera disponible prochainement avec des analyses détaillées,
              des graphiques interactifs et des recommandations personnalisées.
            </p>

            <div className="bg-white/50 rounded-lg p-4 space-y-3">
              <h4 className="font-medium text-orange-900">Fonctionnalités prévues :</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
                <div className="flex items-center space-x-2">
                  <span className="text-green-600">✓</span>
                  <span className="text-orange-800">Comparaison détaillée des caractéristiques</span>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="text-green-600">✓</span>
                  <span className="text-orange-800">Superposition des profils altimétrique</span>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="text-green-600">✓</span>
                  <span className="text-orange-800">Analyse de compatibilité avec votre profil</span>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="text-green-600">✓</span>
                  <span className="text-orange-800">Recommandations de préparation</span>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="text-green-600">✓</span>
                  <span className="text-orange-800">Export des comparaisons en PDF</span>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="text-green-600">✓</span>
                  <span className="text-orange-800">Historique des comparaisons</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Course selection */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Available courses */}
        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle>
                Sélectionner des courses
                <span className="text-sm font-normal text-muted-foreground ml-2">
                  ({selectedCourses.length}/4)
                </span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="space-y-3">
                  {[...Array(5)].map((_, i) => (
                    <div key={i} className="animate-pulse">
                      <div className="h-16 bg-muted rounded-lg"></div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="space-y-3 max-h-96 overflow-y-auto">
                  {courses.slice(0, 10).map((course) => (
                    <div
                      key={course.id}
                      className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                        selectedCourses.includes(course.id)
                          ? 'border-primary-600 bg-primary-50'
                          : 'border-border hover:bg-accent'
                      }`}
                      onClick={() => {
                        if (selectedCourses.includes(course.id)) {
                          removeCourse(course.id)
                        } else {
                          addCourse(course.id)
                        }
                      }}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h4 className="font-medium text-sm text-foreground truncate">
                            {course.name}
                          </h4>
                          <p className="text-xs text-muted-foreground">
                            {course.location}
                          </p>
                          <div className="flex items-center space-x-2 mt-1">
                            <span className="text-xs text-muted-foreground">
                              {course.distance}km
                            </span>
                            <span className="text-xs text-muted-foreground">
                              +{course.elevationGain}m
                            </span>
                          </div>
                        </div>
                        {selectedCourses.includes(course.id) && (
                          <svg className="w-5 h-5 text-primary-600" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                          </svg>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {selectedCourses.length > 0 && (
                <div className="mt-4 pt-4 border-t border-border">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setSelectedCourses([])}
                    className="w-full"
                  >
                    Effacer la sélection
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Comparison area */}
        <div className="lg:col-span-2">
          {selectedCourses.length === 0 ? (
            <Card>
              <CardContent className="p-12 text-center">
                <div className="text-6xl mb-4">🏃‍♂️</div>
                <h3 className="text-lg font-medium text-foreground mb-2">
                  Commencez votre comparaison
                </h3>
                <p className="text-muted-foreground mb-6">
                  Sélectionnez au moins 2 courses dans la liste de gauche pour commencer la comparaison.
                </p>
                <Button asChild>
                  <Link href="/courses">
                    Parcourir les courses
                  </Link>
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-6">
              {/* Comparison mode selector */}
              <Card>
                <CardContent className="p-0">
                  <div className="border-b border-border">
                    <nav className="flex space-x-8 px-6">
                      {comparisonModes.map((mode) => (
                        <button
                          key={mode.id}
                          onClick={() => setComparisonMode(mode.id as any)}
                          className={`flex items-center space-x-2 py-3 px-1 border-b-2 font-medium text-sm transition-colors ${
                            comparisonMode === mode.id
                              ? 'border-primary-600 text-primary-600'
                              : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                          }`}
                        >
                          {mode.icon}
                          <span>{mode.name}</span>
                        </button>
                      ))}
                    </nav>
                  </div>
                </CardContent>
              </Card>

              {/* Comparison table */}
              <Card>
                <CardHeader>
                  <CardTitle>Comparaison des courses</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b border-border">
                          <th className="text-left p-3 font-medium">Caractéristique</th>
                          {selectedCourseData.map((course) => (
                            <th key={course.id} className="text-left p-3 font-medium min-w-32">
                              <div className="space-y-1">
                                <div className="truncate">{course.name}</div>
                                <button
                                  onClick={() => removeCourse(course.id)}
                                  className="text-xs text-red-600 hover:text-red-800"
                                >
                                  Retirer
                                </button>
                              </div>
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        <tr className="border-b border-border">
                          <td className="p-3 font-medium">Distance</td>
                          {selectedCourseData.map((course) => (
                            <td key={course.id} className="p-3">{course.distance} km</td>
                          ))}
                        </tr>
                        <tr className="border-b border-border">
                          <td className="p-3 font-medium">Dénivelé +</td>
                          {selectedCourseData.map((course) => (
                            <td key={course.id} className="p-3 text-green-600">+{course.elevationGain} m</td>
                          ))}
                        </tr>
                        <tr className="border-b border-border">
                          <td className="p-3 font-medium">Dénivelé -</td>
                          {selectedCourseData.map((course) => (
                            <td key={course.id} className="p-3 text-red-600">-{course.elevationLoss} m</td>
                          ))}
                        </tr>
                        <tr className="border-b border-border">
                          <td className="p-3 font-medium">Difficulté</td>
                          {selectedCourseData.map((course) => (
                            <td key={course.id} className="p-3">
                              <span className={`px-2 py-1 rounded-full text-xs font-medium ${courseService.getDifficultyColor(course.difficulty)}`}>
                                {courseService.getDifficultyLabel(course.difficulty)}
                              </span>
                            </td>
                          ))}
                        </tr>
                        <tr className="border-b border-border">
                          <td className="p-3 font-medium">Lieu</td>
                          {selectedCourseData.map((course) => (
                            <td key={course.id} className="p-3">{course.location}</td>
                          ))}
                        </tr>
                        <tr>
                          <td className="p-3 font-medium">Action</td>
                          {selectedCourseData.map((course) => (
                            <td key={course.id} className="p-3">
                              <Button size="sm" asChild>
                                <Link href={`/courses/${course.id}`}>
                                  Voir détails
                                </Link>
                              </Button>
                            </td>
                          ))}
                        </tr>
                      </tbody>
                    </table>
                  </div>

                  {comparisonMode !== 'overview' && (
                    <div className="mt-6 p-6 bg-muted/50 rounded-lg text-center">
                      <div className="flex justify-center mb-4">
                        {comparisonMode === 'detailed' ? (
                          <svg className="w-12 h-12 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                          </svg>
                        ) : (
                          <svg className="w-12 h-12 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                          </svg>
                        )}
                      </div>
                      <h4 className="font-medium text-foreground mb-2">
                        {comparisonMode === 'detailed' ? 'Vue détaillée' : 'Graphiques comparatifs'}
                      </h4>
                      <p className="text-sm text-muted-foreground">
                        Cette fonctionnalité sera disponible avec la version complète du comparateur.
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Actions */}
              <div className="flex flex-col sm:flex-row gap-3">
                <Button disabled className="flex-1">
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                  </svg>
                  Exporter en PDF
                </Button>
                <Button variant="outline" disabled className="flex-1">
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.367 2.684 3 3 0 00-5.367-2.684z" />
                  </svg>
                  Partager la comparaison
                </Button>
                <Button variant="outline" disabled className="flex-1">
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
                  </svg>
                  Sauvegarder
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}