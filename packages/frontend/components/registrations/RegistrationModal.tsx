/**
 * RegistrationModal Component - Coach IA Hugo
 * Modal d'inscription à une course avec sélection d'objectifs
 */

'use client'

import React, { useState, useEffect } from 'react'
import { Button } from '../ui/Button'
import { Input } from '../ui/Input'
import { Course } from '../../lib/services/courseService'
import { useRegistrations } from '../../lib/hooks/useRegistrations'
import { CreateRegistrationRequest, COMMON_RACE_GOALS } from '../../lib/services/registrationService'

interface RegistrationModalProps {
  course: Course
  isOpen: boolean
  onClose: () => void
  onSuccess?: () => void
}

export function RegistrationModal({ course, isOpen, onClose, onSuccess }: RegistrationModalProps) {
  const [formData, setFormData] = useState<CreateRegistrationRequest>({
    courseId: course.id,
    targetDate: '',
    goal: '',
    notes: ''
  })

  const [showCustomGoal, setShowCustomGoal] = useState(false)
  const [preparationWarnings, setPreparationWarnings] = useState<string[]>([])

  const { createRegistration, loadingCreate, createError, clearError } = useRegistrations()

  // Reset form when modal opens
  useEffect(() => {
    if (isOpen) {
      setFormData({
        courseId: course.id,
        targetDate: '',
        goal: '',
        notes: ''
      })
      setShowCustomGoal(false)
      setPreparationWarnings([])
      clearError('createError')
    }
  }, [isOpen, course.id, clearError])

  // Calculate preparation time warnings
  useEffect(() => {
    if (formData.targetDate) {
      const targetDate = new Date(formData.targetDate)
      const now = new Date()
      const diffTime = targetDate.getTime() - now.getTime()
      const diffWeeks = Math.ceil(diffTime / (1000 * 60 * 60 * 24 * 7))

      const warnings = []

      // Minimum preparation time based on course category
      const minWeeks = course.category === 'SHORT' ? 8 : course.category === 'LONG' ? 16 : 24

      if (diffWeeks < minWeeks) {
        warnings.push(`Temps de préparation insuffisant (${diffWeeks} semaines). Recommandé : ${minWeeks} semaines minimum.`)
      }

      if (diffWeeks < 4) {
        warnings.push('Attention: Moins de 4 semaines pour se préparer. Risque de blessure élevé.')
      }

      if (diffTime < 0) {
        warnings.push('La date sélectionnée est dans le passé.')
      }

      setPreparationWarnings(warnings)
    } else {
      setPreparationWarnings([])
    }
  }, [formData.targetDate, course.category])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.targetDate) {
      return
    }

    const registration = await createRegistration(formData)

    if (registration) {
      onSuccess?.()
      onClose()
    }
  }

  const handleGoalSelect = (goal: string) => {
    if (goal === 'custom') {
      setShowCustomGoal(true)
      setFormData(prev => ({ ...prev, goal: '' }))
    } else {
      setShowCustomGoal(false)
      setFormData(prev => ({ ...prev, goal }))
    }
  }

  const formatMinDate = () => {
    const tomorrow = new Date()
    tomorrow.setDate(tomorrow.getDate() + 1)
    return tomorrow.toISOString().split('T')[0]
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-background rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="px-6 py-4 border-b border-border">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-foreground">
              S'inscrire à une course
            </h2>
            <button
              onClick={onClose}
              className="p-2 hover:bg-accent rounded-md transition-colors"
            >
              <svg className="w-5 h-5 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Course info */}
        <div className="px-6 py-4 bg-accent/30 border-b border-border">
          <div className="flex items-start space-x-4">
            <div className="flex-1">
              <h3 className="font-semibold text-foreground">{course.name}</h3>
              <div className="flex items-center space-x-2 text-sm text-muted-foreground mt-1">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                <span>{course.location}</span>
              </div>
              <div className="flex flex-wrap gap-2 mt-2">
                <span className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-blue-50 text-blue-700">
                  {course.distance} km
                </span>
                <span className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-green-50 text-green-700">
                  +{course.elevationGain} m
                </span>
                <span className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-orange-50 text-orange-700">
                  {course.difficulty}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="px-6 py-4 space-y-6">
          {/* Target Date */}
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              Date objectif de la course *
            </label>
            <Input
              type="date"
              value={formData.targetDate}
              onChange={(e) => setFormData(prev => ({ ...prev, targetDate: e.target.value }))}
              min={formatMinDate()}
              required
              className="w-full"
            />
            {preparationWarnings.length > 0 && (
              <div className="mt-2 space-y-1">
                {preparationWarnings.map((warning, index) => (
                  <div key={index} className="flex items-start space-x-2">
                    <svg className="w-4 h-4 text-orange-500 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16c-.77.833.192 2.5 1.732 2.5z" />
                    </svg>
                    <span className="text-sm text-orange-700">{warning}</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Goal Selection */}
          <div>
            <label className="block text-sm font-medium text-foreground mb-3">
              Objectif personnel
            </label>
            <div className="grid grid-cols-2 gap-2 mb-3">
              {COMMON_RACE_GOALS.slice(0, 8).map((goal) => (
                <button
                  key={goal}
                  type="button"
                  onClick={() => handleGoalSelect(goal)}
                  className={`p-3 text-sm border rounded-md text-left transition-colors ${
                    formData.goal === goal && !showCustomGoal
                      ? 'border-primary-600 bg-primary-50 text-primary-700'
                      : 'border-border bg-background text-foreground hover:bg-accent'
                  }`}
                >
                  {goal}
                </button>
              ))}
            </div>
            <button
              type="button"
              onClick={() => handleGoalSelect('custom')}
              className={`w-full p-3 text-sm border rounded-md text-left transition-colors ${
                showCustomGoal
                  ? 'border-primary-600 bg-primary-50 text-primary-700'
                  : 'border-border bg-background text-foreground hover:bg-accent'
              }`}
            >
              Objectif personnalisé...
            </button>

            {showCustomGoal && (
              <div className="mt-3">
                <Input
                  type="text"
                  placeholder="Décrivez votre objectif personnel..."
                  value={formData.goal}
                  onChange={(e) => setFormData(prev => ({ ...prev, goal: e.target.value }))}
                  className="w-full"
                />
              </div>
            )}
          </div>

          {/* Notes */}
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              Notes personnelles (optionnel)
            </label>
            <textarea
              value={formData.notes}
              onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
              placeholder="Motivations, contraintes, informations utiles..."
              rows={3}
              className="w-full px-3 py-2 border border-border rounded-md bg-background text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary-600 focus:border-primary-600"
            />
          </div>

          {/* Error message */}
          {createError && (
            <div className="flex items-center space-x-2 p-3 bg-red-50 border border-red-200 rounded-md">
              <svg className="w-5 h-5 text-red-600 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
              <span className="text-sm text-red-700">{createError}</span>
            </div>
          )}

          {/* Actions */}
          <div className="flex justify-end space-x-3 pt-4 border-t border-border">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={loadingCreate}
            >
              Annuler
            </Button>
            <Button
              type="submit"
              disabled={loadingCreate || !formData.targetDate}
              className="min-w-[120px]"
            >
              {loadingCreate ? (
                <div className="flex items-center space-x-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>Inscription...</span>
                </div>
              ) : (
                "S'inscrire"
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}