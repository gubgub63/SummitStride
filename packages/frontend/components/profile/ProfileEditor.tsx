/**
 * ProfileEditor Component - Coach IA Hugo
 * Composant pour éditer les données personnelles du profil utilisateur
 *
 * Uses existing API endpoints for profile management
 */

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

interface ProfileEditorProps {
  onClose?: () => void
  onSave?: () => void
}

export function ProfileEditor({ onClose, onSave }: ProfileEditorProps) {
  const { user, updateProfile } = useAuth()
  const { profile, refreshCompletion } = useProfile()
  const [loading, setLoading] = useState(false)
  const [optionsLoading, setOptionsLoading] = useState(true)
  const [errors, setErrors] = useState<string[]>([])

  // Options pour les formulaires
  const [experienceLevels, setExperienceLevels] = useState<ExperienceLevelOption[]>([])
  const [fitnessGoals, setFitnessGoals] = useState<FitnessGoalOption[]>([])
  const [daysOfWeek, setDaysOfWeek] = useState<DayOfWeekOption[]>([])

  // État du formulaire - données de base de l'utilisateur
  const [basicData, setBasicData] = useState({
    name: user?.name || ''
  })

  // État du formulaire - données du profil détaillé
  const [profileData, setProfileData] = useState<CreateProfileRequest>({
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

  // Mettre à jour les données quand le profil change
  useEffect(() => {
    if (profile) {
      setProfileData({
        dateOfBirth: profile.dateOfBirth || '',
        weight: profile.weight || undefined,
        height: profile.height || undefined,
        experienceLevel: profile.experienceLevel || undefined,
        fitnessGoals: profile.fitnessGoals || [],
        medicalConditions: profile.medicalConditions || [],
        preferredTrainingDays: profile.preferredTrainingDays || [],
        maxTrainingHoursPerWeek: profile.maxTrainingHoursPerWeek || undefined,
        vma: profile.vma || undefined,
      })
    }
  }, [profile])

  useEffect(() => {
    if (user) {
      setBasicData({
        name: user.name || ''
      })
    }
  }, [user])

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

  const updateBasicData = (field: keyof typeof basicData, value: string) => {
    setBasicData(prev => ({ ...prev, [field]: value }))
    setErrors([])
  }

  const updateProfileData = (field: keyof CreateProfileRequest, value: any) => {
    setProfileData(prev => ({ ...prev, [field]: value }))
    setErrors([])
  }

  const validateForm = (): boolean => {
    const formErrors: string[] = []

    // Validation des données de base
    if (!basicData.name.trim()) {
      formErrors.push('Le nom est requis')
    }

    // Validation du profil détaillé si certains champs sont remplis
    if (profileData.dateOfBirth) {
      const age = userService.calculateAge(profileData.dateOfBirth)
      if (age < 16 || age > 100) {
        formErrors.push('L\'âge doit être entre 16 et 100 ans')
      }
    }

    if (profileData.weight && (profileData.weight < 30 || profileData.weight > 300)) {
      formErrors.push('Le poids doit être entre 30 et 300 kg')
    }

    if (profileData.height && (profileData.height < 100 || profileData.height > 250)) {
      formErrors.push('La taille doit être entre 100 et 250 cm')
    }

    if (profileData.vma && (profileData.vma < 8 || profileData.vma > 25)) {
      formErrors.push('La VMA doit être entre 8 et 25 km/h')
    }

    if (profileData.maxTrainingHoursPerWeek && (profileData.maxTrainingHoursPerWeek < 1 || profileData.maxTrainingHoursPerWeek > 40)) {
      formErrors.push('Le nombre d\'heures d\'entraînement par semaine doit être entre 1 et 40')
    }

    setErrors(formErrors)
    return formErrors.length === 0
  }

  const handleSave = async () => {
    if (!validateForm()) return

    try {
      setLoading(true)

      // Mettre à jour les données de base de l'utilisateur
      if (basicData.name !== user?.name) {
        await userService.updateUserProfile({ name: basicData.name })
      }

      // Mettre à jour le profil détaillé si des champs sont remplis
      const hasProfileData = Object.values(profileData).some(value =>
        value !== undefined && value !== '' &&
        (Array.isArray(value) ? value.length > 0 : true)
      )

      if (hasProfileData) {
        if (profile) {
          await updateProfile(profileData)
        } else {
          // Créer le profil s'il n'existe pas
          await userService.createUserProfile(profileData)
        }
      }

      await refreshCompletion()
      onSave?.()
    } catch (error) {
      console.error('Erreur lors de la sauvegarde:', error)
      setErrors(['Erreur lors de la sauvegarde du profil'])
    } finally {
      setLoading(false)
    }
  }

  if (optionsLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Modifier le profil</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-4">
            {[...Array(6)].map((_, i) => (
              <div key={i}>
                <div className="h-4 bg-gray-200 rounded w-1/4 mb-2"></div>
                <div className="h-10 bg-gray-200 rounded"></div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Modifier le profil</CardTitle>
          {onClose && (
            <Button variant="ghost" size="sm" onClick={onClose}>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </Button>
          )}
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

        {/* Données de base */}
        <div>
          <h3 className="text-lg font-medium text-gray-900 mb-4">Informations générales</h3>
          <div>
            <label className="block text-sm font-medium mb-2">Nom complet</label>
            <Input
              type="text"
              value={basicData.name}
              onChange={(e) => updateBasicData('name', e.target.value)}
              placeholder="Votre nom complet"
            />
          </div>
        </div>

        {/* Données personnelles */}
        <div>
          <h3 className="text-lg font-medium text-gray-900 mb-4">Données personnelles</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">Date de naissance</label>
              <Input
                type="date"
                value={profileData.dateOfBirth}
                onChange={(e) => updateProfileData('dateOfBirth', e.target.value)}
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
                  value={profileData.weight || ''}
                  onChange={(e) => updateProfileData('weight', parseFloat(e.target.value) || undefined)}
                  placeholder="70"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Taille (cm)</label>
                <Input
                  type="number"
                  min="100"
                  max="250"
                  value={profileData.height || ''}
                  onChange={(e) => updateProfileData('height', parseFloat(e.target.value) || undefined)}
                  placeholder="175"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Expérience sportive */}
        <div>
          <h3 className="text-lg font-medium text-gray-900 mb-4">Expérience sportive</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-3">Niveau d'expérience</label>
              <div className="grid gap-3">
                {experienceLevels.map((level) => (
                  <label
                    key={level.value}
                    className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                      profileData.experienceLevel === level.value
                        ? 'border-primary-600 bg-primary-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <input
                      type="radio"
                      name="experienceLevel"
                      value={level.value}
                      checked={profileData.experienceLevel === level.value}
                      onChange={(e) => updateProfileData('experienceLevel', e.target.value as ExperienceLevel)}
                      className="sr-only"
                    />
                    <div className="font-medium">{level.label}</div>
                    <div className="text-sm text-gray-600">{level.description}</div>
                  </label>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">VMA (km/h) - optionnel</label>
              <Input
                type="number"
                min="8"
                max="25"
                step="0.1"
                value={profileData.vma || ''}
                onChange={(e) => updateProfileData('vma', parseFloat(e.target.value) || undefined)}
                placeholder="14.5"
              />
              <p className="text-sm text-gray-600 mt-1">
                Si vous ne connaissez pas votre VMA, laissez vide
              </p>
            </div>
          </div>
        </div>

        {/* Préférences d'entraînement */}
        <div>
          <h3 className="text-lg font-medium text-gray-900 mb-4">Préférences d'entraînement</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-3">Jours d'entraînement préférés</label>
              <div className="grid grid-cols-2 gap-2">
                {daysOfWeek.map((day) => (
                  <label key={day.value} className="flex items-center">
                    <input
                      type="checkbox"
                      checked={profileData.preferredTrainingDays!.includes(day.value)}
                      onChange={(e) => {
                        const days = profileData.preferredTrainingDays || []
                        if (e.target.checked) {
                          updateProfileData('preferredTrainingDays', [...days, day.value])
                        } else {
                          updateProfileData('preferredTrainingDays', days.filter(d => d !== day.value))
                        }
                      }}
                      className="mr-3"
                    />
                    {day.label}
                  </label>
                ))}
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
                value={profileData.maxTrainingHoursPerWeek || ''}
                onChange={(e) => updateProfileData('maxTrainingHoursPerWeek', parseFloat(e.target.value) || undefined)}
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
                value={profileData.medicalConditions?.join(', ') || ''}
                onChange={(e) => updateProfileData('medicalConditions',
                  e.target.value ? e.target.value.split(',').map(s => s.trim()) : []
                )}
                placeholder="Ex: Tendinite genou droit, Allergie au pollen..."
              />
            </div>
          </div>
        </div>

        {/* Objectifs fitness */}
        <div>
          <h3 className="text-lg font-medium text-gray-900 mb-4">Objectifs fitness</h3>
          <div className="grid gap-2">
            {fitnessGoals.map((goal) => (
              <label key={goal.value} className="flex items-center">
                <input
                  type="checkbox"
                  checked={profileData.fitnessGoals!.includes(goal.value)}
                  onChange={(e) => {
                    const goals = profileData.fitnessGoals || []
                    if (e.target.checked) {
                      updateProfileData('fitnessGoals', [...goals, goal.value])
                    } else {
                      updateProfileData('fitnessGoals', goals.filter(g => g !== goal.value))
                    }
                  }}
                  className="mr-3"
                />
                {goal.label}
              </label>
            ))}
          </div>
        </div>

        {/* Actions */}
        <div className="flex justify-end space-x-4 pt-6 border-t border-gray-200">
          {onClose && (
            <Button variant="outline" onClick={onClose}>
              Annuler
            </Button>
          )}
          <Button onClick={handleSave} loading={loading}>
            Enregistrer les modifications
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}