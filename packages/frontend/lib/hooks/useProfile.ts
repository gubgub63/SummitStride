/**
 * Hook de Profil Utilisateur - Coach IA Hugo
 * Hook spécialisé pour la gestion des profils utilisateur
 */

import { useState, useEffect } from 'react'
import { useAuth } from './useAuth'
import { userService } from '../api/user'
import type { ProfileCompletion } from '../types/auth'

export function useProfile() {
  const { user, profile, createProfile, updateProfile, isLoading } = useAuth()
  const [completion, setCompletion] = useState<ProfileCompletion | null>(null)
  const [completionLoading, setCompletionLoading] = useState(false)

  // Charger les données de complétude du profil
  useEffect(() => {
    if (user && !completionLoading) {
      loadProfileCompletion()
    }
  }, [user, profile])

  const loadProfileCompletion = async () => {
    try {
      setCompletionLoading(true)
      const data = await userService.getProfileCompletion()
      setCompletion(data)
    } catch (error) {
      console.error('Erreur lors du chargement de la complétude:', error)
    } finally {
      setCompletionLoading(false)
    }
  }

  const hasProfile = !!profile
  const isProfileComplete = completion ? completion.completionPercentage >= 80 : false
  const needsOnboarding = !hasProfile || !isProfileComplete

  return {
    profile,
    completion,
    hasProfile,
    isProfileComplete,
    needsOnboarding,
    isLoading: isLoading || completionLoading,
    createProfile,
    updateProfile,
    refreshCompletion: loadProfileCompletion,
  }
}