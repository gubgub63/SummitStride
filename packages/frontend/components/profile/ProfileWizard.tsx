'use client'

import React, { useState, useEffect } from 'react'
import { Button } from '../ui/Button'
import { Card, CardHeader, CardTitle, CardContent } from '../ui/Card'
import { Input } from '../ui/Input'
import { useAuth } from '../../lib/hooks/useAuth'
import { useProfile } from '../../lib/hooks/useProfile'
import { userService } from '../../lib/api/user'
import type {
  CreateProfileRequest,
  ExperienceLevel,
  ExperienceLevelOption,
  FitnessGoalOption,
  DayOfWeekOption
} from '../../lib/types/auth'

interface WizardStep {
  id: string
  title: string
  description: string
}

const WIZARD_STEPS: WizardStep[] = [
  {
    id: 'personal',
    title: 'Informations personnelles',
    description: 'Vos données de base pour personnaliser l\'entraînement'
  },
  {
    id: 'experience',
    title: 'Expérience sportive',
    description: 'Votre niveau et vos objectifs en ultra-trail'
  },
  {
    id: 'training',
    title: 'Préférences d\'entraînement',
    description: 'Vos disponibilités et contraintes'
  },
  {
    id: 'summary',
    title: 'Récapitulatif',
    description: 'Vérifiez vos informations avant validation'
  }
]

export function ProfileWizard({ onComplete }: { onComplete?: () => void }) {
  const { createProfile, updateProfile } = useAuth()
  const { profile, refreshCompletion } = useProfile()
  const [currentStep, setCurrentStep] = useState(0)
  const [loading, setLoading] = useState(false)
  const [optionsLoading, setOptionsLoading] = useState(true)
  const [errors, setErrors] = useState<string[]>([])

  // Options pour les formulaires
  const [experienceLevels, setExperienceLevels] = useState<ExperienceLevelOption[]>([])
  const [fitnessGoals, setFitnessGoals] = useState<FitnessGoalOption[]>([])
  const [daysOfWeek, setDaysOfWeek] = useState<DayOfWeekOption[]>([])

  // État du formulaire
  const [formData, setFormData] = useState<CreateProfileRequest>({
    dateOfBirth: profile?.dateOfBirth || '',
    weight: profile?.weight || undefined,
    height: profile?.height || undefined,
    experienceLevel: profile?.experienceLevel || undefined,
    fitnessGoals: profile?.fitnessGoals || [],
    medicalConditions: profile?.medicalConditions || [],
    preferredTrainingDays: profile?.preferredTrainingDays || [],
    maxTrainingHoursPerWeek: profile?.maxTrainingHoursPerWeek || undefined,
    vma: profile?.vma || undefined,
  })

  // Charger les options au montage
  useEffect(() => {
    loadFormOptions()
  }, [])

  const loadFormOptions = async () => {
    try {
      setOptionsLoading(true)
      const [levels, goals, days] = await Promise.all([
        userService.getExperienceLevels(),
        userService.getFitnessGoals(),
        userService.getDaysOfWeek(),
      ])

      setExperienceLevels(levels.experienceLevels)
      setFitnessGoals(goals.commonGoals)
      setDaysOfWeek(days.daysOfWeek)
    } catch (error) {
      console.error('Erreur lors du chargement des options:', error)
      setErrors(['Erreur lors du chargement des options du formulaire'])
    } finally {
      setOptionsLoading(false)
    }
  }

  const updateFormData = (field: keyof CreateProfileRequest, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    setErrors([])
  }

  const validateCurrentStep = (): boolean => {
    const stepErrors: string[] = []

    // Validation spécifique par étape
    switch (currentStep) {
      case 0: // Informations personnelles
        if (!formData.dateOfBirth) {
          stepErrors.push('La date de naissance est requise')
        }
        if (!formData.weight || formData.weight < 30 || formData.weight > 300) {
          stepErrors.push('Le poids doit être entre 30 et 300 kg')
        }
        if (!formData.height || formData.height < 100 || formData.height > 250) {
          stepErrors.push('La taille doit être entre 100 et 250 cm')
        }
        if (formData.dateOfBirth) {
          const age = userService.calculateAge(formData.dateOfBirth)
          if (age < 16 || age > 100) {
            stepErrors.push('L\'âge doit être entre 16 et 100 ans')
          }
        }
        break

      case 1: // Expérience
        if (!formData.experienceLevel) {
          stepErrors.push('Veuillez sélectionner votre niveau d\'expérience')
        }
        if (formData.vma !== undefined && (formData.vma < 8 || formData.vma > 25)) {
          stepErrors.push('La VMA doit être entre 8 et 25 km/h')
        }
        break

      case 2: // Entraînement
        if (!formData.preferredTrainingDays || formData.preferredTrainingDays.length === 0) {
          stepErrors.push('Veuillez sélectionner au moins un jour d\'entraînement')
        }
        if (!formData.maxTrainingHoursPerWeek || formData.maxTrainingHoursPerWeek < 1 || formData.maxTrainingHoursPerWeek > 40) {
          stepErrors.push('Le nombre d\'heures d\'entraînement par semaine doit être entre 1 et 40')
        }
        break

      case 3: // Récapitulatif
        const allErrors = userService.validateProfileData(formData)
        stepErrors.push(...allErrors)
        break

      default:
        break
    }

    setErrors(stepErrors)
    return stepErrors.length === 0
  }

  const nextStep = () => {
    if (optionsLoading) {
      setErrors(['Veuillez attendre le chargement des options...'])
      return
    }

    if (validateCurrentStep() && currentStep < WIZARD_STEPS.length - 1) {
      setCurrentStep(prev => prev + 1)
    }
  }

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1)
    }
  }

  const submitProfile = async () => {
    if (!validateCurrentStep()) return

    try {
      setLoading(true)

      if (profile) {
        await updateProfile(formData)
      } else {
        await createProfile(formData)
      }

      await refreshCompletion()
      onComplete?.()
    } catch (error) {
      console.error('Erreur lors de la sauvegarde:', error)
      setErrors(['Erreur lors de la sauvegarde du profil'])
    } finally {
      setLoading(false)
    }
  }

  const renderStepContent = () => {
    switch (currentStep) {
      case 0:
        return renderPersonalInfoStep()
      case 1:
        return renderExperienceStep()
      case 2:
        return renderTrainingStep()
      case 3:
        return renderSummaryStep()
      default:
        return null
    }
  }

  const renderPersonalInfoStep = () => (
    <div className="space-y-6">
      <div>
        <label className="block text-sm font-medium mb-2">Date de naissance</label>
        <Input
          type="date"
          value={formData.dateOfBirth}
          onChange={(e) => updateFormData('dateOfBirth', e.target.value)}
          max={new Date().toISOString().split('T')[0]}
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium mb-2">Poids (kg)</label>
          <Input
            type="number"
            min="30"
            max="300"
            value={formData.weight || ''}
            onChange={(e) => updateFormData('weight', parseFloat(e.target.value) || undefined)}
            placeholder="70"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-2">Taille (cm)</label>
          <Input
            type="number"
            min="100"
            max="250"
            value={formData.height || ''}
            onChange={(e) => updateFormData('height', parseFloat(e.target.value) || undefined)}
            placeholder="175"
          />
        </div>
      </div>
    </div>
  )

  const renderExperienceStep = () => (
    <div className="space-y-6">
      <div>
        <label className="block text-sm font-medium mb-3">Niveau d'expérience</label>
        <div className="grid gap-3">
          {experienceLevels && experienceLevels.length > 0 ? (
            experienceLevels.map((level) => (
              <label
                key={level.value}
                className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                  formData.experienceLevel === level.value
                    ? 'border-primary-600 bg-primary-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <input
                  type="radio"
                  name="experienceLevel"
                  value={level.value}
                  checked={formData.experienceLevel === level.value}
                  onChange={(e) => updateFormData('experienceLevel', e.target.value as ExperienceLevel)}
                  className="sr-only"
                />
                <div className="font-medium">{level.label}</div>
                <div className="text-sm text-gray-600">{level.description}</div>
              </label>
            ))
          ) : (
            <div className="text-center py-4 text-gray-500">
              Chargement des niveaux d'expérience...
            </div>
          )}
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium mb-3">Objectifs fitness</label>
        <div className="grid gap-2">
          {fitnessGoals && fitnessGoals.length > 0 ? (
            fitnessGoals.map((goal) => (
              <label key={goal.value} className="flex items-center">
                <input
                  type="checkbox"
                  checked={formData.fitnessGoals!.includes(goal.value)}
                  onChange={(e) => {
                    const goals = formData.fitnessGoals || []
                    if (e.target.checked) {
                      updateFormData('fitnessGoals', [...goals, goal.value])
                    } else {
                      updateFormData('fitnessGoals', goals.filter(g => g !== goal.value))
                    }
                  }}
                  className="mr-3"
                />
                {goal.label}
              </label>
            ))
          ) : (
            <div className="text-center py-4 text-gray-500">
              Chargement des objectifs...
            </div>
          )}
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium mb-2">VMA (km/h) - optionnel</label>
        <Input
          type="number"
          min="8"
          max="25"
          step="0.1"
          value={formData.vma || ''}
          onChange={(e) => updateFormData('vma', parseFloat(e.target.value) || undefined)}
          placeholder="14.5"
        />
        <p className="text-sm text-gray-600 mt-1">
          Si vous ne connaissez pas votre VMA, laissez vide
        </p>
      </div>
    </div>
  )

  const renderTrainingStep = () => (
    <div className="space-y-6">
      <div>
        <label className="block text-sm font-medium mb-3">Jours d'entraînement préférés</label>
        <div className="grid grid-cols-2 gap-2">
          {daysOfWeek && daysOfWeek.length > 0 ? (
            daysOfWeek.map((day) => (
              <label key={day.value} className="flex items-center">
                <input
                  type="checkbox"
                  checked={formData.preferredTrainingDays!.includes(day.value)}
                  onChange={(e) => {
                    const days = formData.preferredTrainingDays || []
                    if (e.target.checked) {
                      updateFormData('preferredTrainingDays', [...days, day.value])
                    } else {
                      updateFormData('preferredTrainingDays', days.filter(d => d !== day.value))
                    }
                  }}
                  className="mr-3"
                />
                {day.label}
              </label>
            ))
          ) : (
            <div className="text-center py-4 text-gray-500">
              Chargement des jours...
            </div>
          )}
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium mb-2">
          Heures d'entraînement par semaine (maximum)
        </label>
        <Input
          type="number"
          min="1"
          max="40"
          value={formData.maxTrainingHoursPerWeek || ''}
          onChange={(e) => updateFormData('maxTrainingHoursPerWeek', parseFloat(e.target.value) || undefined)}
          placeholder="8"
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-2">
          Conditions médicales ou blessures - optionnel
        </label>
        <textarea
          className="w-full p-3 border border-gray-300 rounded-md"
          rows={3}
          value={formData.medicalConditions?.join(', ') || ''}
          onChange={(e) => updateFormData('medicalConditions',
            e.target.value ? e.target.value.split(',').map(s => s.trim()) : []
          )}
          placeholder="Ex: Tendinite genou droit, Allergie au pollen..."
        />
      </div>
    </div>
  )

  const renderSummaryStep = () => (
    <div className="space-y-6">
      <div className="p-4 rounded-lg">
        <h3 className="font-medium mb-3">Récapitulatif de votre profil</h3>

        <div className="space-y-2 text-sm">
          {formData.dateOfBirth && (
            <div>
              <span className="font-medium">Âge:</span> {userService.calculateAge(formData.dateOfBirth)} ans
            </div>
          )}

          {formData.weight && formData.height && (
            <div>
              <span className="font-medium">IMC:</span> {userService.calculateBMI(formData.weight, formData.height)}
              ({userService.getBMICategory(userService.calculateBMI(formData.weight, formData.height))})
            </div>
          )}

          {formData.experienceLevel && (
            <div>
              <span className="font-medium">Niveau:</span> {userService.getExperienceLevelLabel(formData.experienceLevel)}
            </div>
          )}

          {formData.preferredTrainingDays && formData.preferredTrainingDays.length > 0 && (
            <div>
              <span className="font-medium">Jours d'entraînement:</span> {userService.formatTrainingDays(formData.preferredTrainingDays)}
            </div>
          )}

          {formData.maxTrainingHoursPerWeek && (
            <div>
              <span className="font-medium">Volume hebdomadaire:</span> {formData.maxTrainingHoursPerWeek}h
            </div>
          )}
        </div>
      </div>

      <p className="text-sm text-gray-600">
        Vous pourrez modifier ces informations à tout moment dans votre profil.
      </p>
    </div>
  )

  return (
    <Card className="max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>Complétez votre profil</CardTitle>

        {/* Progress bar */}
        <div className="flex items-center space-x-2">
          {WIZARD_STEPS.map((step, index) => (
            <div
              key={step.id}
              className={`flex-1 h-2 rounded ${
                index <= currentStep ? 'bg-primary-600' : 'bg-gray-200'
              }`}
            />
          ))}
        </div>

        <div className="text-center">
          <h2 className="text-lg font-medium">{WIZARD_STEPS[currentStep].title}</h2>
          <p className="text-gray-600">{WIZARD_STEPS[currentStep].description}</p>
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        {errors.length > 0 && (
          <div className="bg-red-50 border border-red-200 rounded-md p-3">
            <div className="text-red-800 text-sm">
              <ul className="list-disc list-inside space-y-1">
                {errors.map((error, index) => (
                  <li key={index}>{error}</li>
                ))}
              </ul>
            </div>
          </div>
        )}

        {renderStepContent()}

        <div className="flex justify-between pt-6">
          <Button
            variant="outline"
            onClick={prevStep}
            disabled={currentStep === 0}
          >
            Précédent
          </Button>

          {currentStep < WIZARD_STEPS.length - 1 ? (
            <Button
              onClick={nextStep}
              disabled={optionsLoading}
            >
              {optionsLoading ? 'Chargement...' : 'Suivant'}
            </Button>
          ) : (
            <Button
              onClick={submitProfile}
              loading={loading}
              disabled={optionsLoading}
            >
              Finaliser le profil
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
