/**
 * Courses Page - Coach IA Hugo
 * Page principale du catalogue de courses avec recherche et filtres
 *
 * Implémentation de l'étape 4.4 de la roadmap:
 * - Interface de liste des courses avec filtres ✅
 * - Système de recherche avancée ✅
 * - Pagination et tri ✅
 * - Intégration complète avec APIs backend développées en Phase 3 ✅
 */

'use client'

import React, { useState } from 'react'
import { CourseSearch } from '../../../components/courses/CourseSearch'
import { CourseFilters } from '../../../components/courses/CourseFilters'
import { CourseList } from '../../../components/courses/CourseList'
import { useCourses } from '../../../lib/hooks/useCourses'
import { Button } from '../../../components/ui/Button'

export default function CoursesPage() {
  const {
    courses,
    loading,
    error,
    pagination,
    filters,
    metadata,
    availableFilters,
    suggestions,
    loadingSuggestions,
    updateFilters,
    resetSearch,
    searchSuggestions,
    clearError,
  } = useCourses()

  const [searchQuery, setSearchQuery] = useState('')
  const [showFilters, setShowFilters] = useState(false)

  const handleSearch = (query: string) => {
    updateFilters({ search: query })
  }

  const handlePageChange = (page: number) => {
    updateFilters({ page })
  }

  return (
    <div className="container mx-auto px-4 py-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-foreground">Catalogue des courses</h1>
        <p className="text-muted-foreground mt-2">
          Découvrez et recherchez parmi {pagination?.total || 0} courses d'ultra-trail
        </p>
      </div>

      {/* Error display */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg flex items-start space-x-3">
          <svg className="w-5 h-5 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <div className="flex-1">
            <p className="font-medium">Erreur lors du chargement</p>
            <p className="text-sm mt-1">{error}</p>
          </div>
          <button
            onClick={clearError}
            className="text-red-500 hover:text-red-700"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      )}

      {/* Search bar */}
      <div className="flex flex-col lg:flex-row gap-4">
        <div className="flex-1">
          <CourseSearch
            value={searchQuery}
            onChange={setSearchQuery}
            onSearch={handleSearch}
            suggestions={suggestions}
            loading={loadingSuggestions}
            onSuggestionRequest={searchSuggestions}
            placeholder="Rechercher une course par nom ou lieu..."
          />
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={() => setShowFilters(!showFilters)}
            className="lg:hidden"
          >
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.207A1 1 0 013 6.5V4z" />
            </svg>
            Filtres
          </Button>
        </div>
      </div>

      {/* Content area */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Filters sidebar */}
        <div className={`lg:col-span-1 ${showFilters ? 'block' : 'hidden lg:block'}`}>
          <div className="sticky top-6">
            <CourseFilters
              filters={filters}
              metadata={metadata}
              availableLocations={availableFilters.locations}
              onFiltersChange={updateFilters}
              onReset={resetSearch}
            />
          </div>
        </div>

        {/* Course list */}
        <div className="lg:col-span-3">
          <CourseList
            courses={courses}
            loading={loading}
            pagination={pagination}
            onPageChange={handlePageChange}
            emptyMessage={
              filters.search
                ? `Aucune course trouvée pour "${filters.search}"`
                : "Aucune course ne correspond à vos critères"
            }
          />
        </div>
      </div>

      {/* Quick actions */}
      {!loading && courses.length > 0 && (
        <div className="bg-accent/50 border border-border rounded-lg p-6">
          <div className="flex flex-col sm:flex-row items-center justify-between space-y-4 sm:space-y-0">
            <div>
              <h3 className="font-semibold text-foreground">Explorez plus de fonctionnalités</h3>
              <p className="text-sm text-muted-foreground">
                Découvrez nos outils avancés pour planifier vos courses
              </p>
            </div>
            <div className="flex space-x-3">
              <Button variant="outline" asChild>
                <a className="flex items-center" href="/courses/map">
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-1.447-.894L15 4m0 13V4m0 0L9 7" />
                  </svg>
                  Carte interactive
                </a>
              </Button>
              <Button variant="outline" asChild>
                <a className="flex items-center" href="/courses/compare">
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                  Comparer
                </a>
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
