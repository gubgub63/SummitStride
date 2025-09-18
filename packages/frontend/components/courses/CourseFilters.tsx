/**
 * CourseFilters Component - Coach IA Hugo
 * Panneau de filtres pour la recherche de courses
 */

'use client'

import React, { useState } from 'react'
import { CourseSearchFilters, CourseMetadata } from '../../lib/services/courseService'
import { Button } from '../ui/Button'

interface CourseFiltersProps {
  filters: CourseSearchFilters
  metadata: CourseMetadata | null
  availableLocations: string[]
  onFiltersChange: (filters: Partial<CourseSearchFilters>) => void
  onReset: () => void
  className?: string
}

export function CourseFilters({
  filters,
  metadata,
  availableLocations,
  onFiltersChange,
  onReset,
  className = ""
}: CourseFiltersProps) {
  const [isExpanded, setIsExpanded] = useState(false)

  const handleDifficultyChange = (difficulty: string, checked: boolean) => {
    const currentDifficulties = filters.difficulty || []
    if (checked) {
      onFiltersChange({
        difficulty: [...currentDifficulties, difficulty]
      })
    } else {
      onFiltersChange({
        difficulty: currentDifficulties.filter(d => d !== difficulty)
      })
    }
  }

  const handleCategoryChange = (category: string, checked: boolean) => {
    const currentCategories = filters.category || []
    if (checked) {
      onFiltersChange({
        category: [...currentCategories, category]
      })
    } else {
      onFiltersChange({
        category: currentCategories.filter(c => c !== category)
      })
    }
  }

  const handleRangeChange = (field: keyof CourseSearchFilters, value: string) => {
    const numValue = value === '' ? undefined : Number(value)
    onFiltersChange({ [field]: numValue })
  }

  const hasActiveFilters = () => {
    return !!(
      filters.difficulty?.length ||
      filters.category?.length ||
      filters.minDistance ||
      filters.maxDistance ||
      filters.minElevation ||
      filters.maxElevation ||
      filters.location
    )
  }

  const getDifficultyColor = (difficulty: string) => {
    const colors = {
      EASY: 'text-green-600 bg-green-50 border-green-200',
      MODERATE: 'text-blue-600 bg-blue-50 border-blue-200',
      HARD: 'text-orange-600 bg-orange-50 border-orange-200',
      EXTREME: 'text-red-600 bg-red-50 border-red-200'
    }
    return colors[difficulty as keyof typeof colors] || 'text-gray-600 bg-gray-50 border-gray-200'
  }

  const getCategoryColor = (category: string) => {
    const colors = {
      SHORT: 'text-green-600 bg-green-50 border-green-200',
      LONG: 'text-blue-600 bg-blue-50 border-blue-200',
      ULTRA: 'text-purple-600 bg-purple-50 border-purple-200'
    }
    return colors[category as keyof typeof colors] || 'text-gray-600 bg-gray-50 border-gray-200'
  }

  return (
    <div className={`bg-background border border-border rounded-lg ${className}`}>
      {/* Header with toggle */}
      <div className="px-6 py-4 border-b border-border">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <h3 className="text-lg font-semibold text-foreground">Filtres</h3>
            {hasActiveFilters() && (
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary-100 text-primary-800">
                Actifs
              </span>
            )}
          </div>
          <div className="flex items-center space-x-2">
            {hasActiveFilters() && (
              <Button variant="ghost" size="sm" onClick={onReset}>
                Effacer
              </Button>
            )}
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="md:hidden p-2 rounded-md hover:bg-accent transition-colors"
            >
              <svg
                className={`w-5 h-5 text-muted-foreground transition-transform ${
                  isExpanded ? 'rotate-180' : ''
                }`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Filters content */}
      <div className={`px-6 py-4 space-y-6 ${isExpanded ? 'block' : 'hidden md:block'}`}>
        {/* Difficulty filter */}
        {metadata?.difficulties && (
          <div>
            <h4 className="text-sm font-medium text-foreground mb-3">Difficulté</h4>
            <div className="space-y-2">
              {Object.entries(metadata.difficulties).map(([key, label]) => (
                <label key={key} className="flex items-center">
                  <input
                    type="checkbox"
                    checked={filters.difficulty?.includes(key) || false}
                    onChange={(e) => handleDifficultyChange(key, e.target.checked)}
                    className="rounded border-border text-primary-600 focus:ring-primary-600 focus:ring-offset-0"
                  />
                  <span className={`ml-3 px-2.5 py-1 rounded-full text-xs font-medium border ${getDifficultyColor(key)}`}>
                    {key}
                  </span>
                </label>
              ))}
            </div>
          </div>
        )}

        {/* Category filter */}
        {metadata?.categories && (
          <div>
            <h4 className="text-sm font-medium text-foreground mb-3">Catégorie</h4>
            <div className="space-y-2">
              {Object.entries(metadata.categories).map(([key, label]) => (
                <label key={key} className="flex items-center">
                  <input
                    type="checkbox"
                    checked={filters.category?.includes(key) || false}
                    onChange={(e) => handleCategoryChange(key, e.target.checked)}
                    className="rounded border-border text-primary-600 focus:ring-primary-600 focus:ring-offset-0"
                  />
                  <span className={`ml-3 px-2.5 py-1 rounded-full text-xs font-medium border ${getCategoryColor(key)}`}>
                    {key}
                  </span>
                </label>
              ))}
            </div>
          </div>
        )}

        {/* Distance range */}
        <div>
          <h4 className="text-sm font-medium text-foreground mb-3">Distance (km)</h4>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs text-muted-foreground mb-1">Min</label>
              <input
                type="number"
                min="0"
                value={filters.minDistance || ''}
                onChange={(e) => handleRangeChange('minDistance', e.target.value)}
                placeholder="0"
                className="w-full px-3 py-2 border border-border rounded-md bg-background text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary-600 focus:border-primary-600"
              />
            </div>
            <div>
              <label className="block text-xs text-muted-foreground mb-1">Max</label>
              <input
                type="number"
                min="0"
                value={filters.maxDistance || ''}
                onChange={(e) => handleRangeChange('maxDistance', e.target.value)}
                placeholder="∞"
                className="w-full px-3 py-2 border border-border rounded-md bg-background text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary-600 focus:border-primary-600"
              />
            </div>
          </div>
        </div>

        {/* Elevation range */}
        <div>
          <h4 className="text-sm font-medium text-foreground mb-3">Dénivelé positif (m)</h4>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs text-muted-foreground mb-1">Min</label>
              <input
                type="number"
                min="0"
                value={filters.minElevation || ''}
                onChange={(e) => handleRangeChange('minElevation', e.target.value)}
                placeholder="0"
                className="w-full px-3 py-2 border border-border rounded-md bg-background text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary-600 focus:border-primary-600"
              />
            </div>
            <div>
              <label className="block text-xs text-muted-foreground mb-1">Max</label>
              <input
                type="number"
                min="0"
                value={filters.maxElevation || ''}
                onChange={(e) => handleRangeChange('maxElevation', e.target.value)}
                placeholder="∞"
                className="w-full px-3 py-2 border border-border rounded-md bg-background text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary-600 focus:border-primary-600"
              />
            </div>
          </div>
        </div>

        {/* Location filter */}
        {availableLocations.length > 0 && (
          <div>
            <h4 className="text-sm font-medium text-foreground mb-3">Lieu</h4>
            <select
              value={filters.location || ''}
              onChange={(e) => onFiltersChange({ location: e.target.value || undefined })}
              className="w-full px-3 py-2 border border-border rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary-600 focus:border-primary-600"
            >
              <option value="">Tous les lieux</option>
              {availableLocations.map(location => (
                <option key={location} value={location}>
                  {location}
                </option>
              ))}
            </select>
          </div>
        )}

        {/* Sort options */}
        {metadata?.sortOptions && (
          <div>
            <h4 className="text-sm font-medium text-foreground mb-3">Tri</h4>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs text-muted-foreground mb-1">Critère</label>
                <select
                  value={filters.sortBy || 'name'}
                  onChange={(e) => onFiltersChange({ sortBy: e.target.value as any })}
                  className="w-full px-3 py-2 border border-border rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary-600 focus:border-primary-600"
                >
                  {metadata.sortOptions.map(option => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs text-muted-foreground mb-1">Ordre</label>
                <select
                  value={filters.sortOrder || 'asc'}
                  onChange={(e) => onFiltersChange({ sortOrder: e.target.value as 'asc' | 'desc' })}
                  className="w-full px-3 py-2 border border-border rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary-600 focus:border-primary-600"
                >
                  <option value="asc">Croissant</option>
                  <option value="desc">Décroissant</option>
                </select>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}