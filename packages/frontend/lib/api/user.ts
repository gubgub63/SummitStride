/**
 * Service Utilisateur - SummitStride
 * API calls pour la gestion des profils utilisateur
 */

import { apiClient } from './client'
import type {
  ProfileResponse,
  UserProfile,
  CreateProfileRequest,
  UpdateProfileRequest,
  ProfileCompletion,
  ExperienceLevelOption,
  DayOfWeekOption,
  FitnessGoalOption,
} from '../types/auth'

export class UserService {
  async getProfile(): Promise<ProfileResponse> {
    return apiClient.get('/users/profile')
  }

  async updateBasicProfile(data: { name: string }): Promise<{ message: string; user: any }> {
    return apiClient.put('/users/profile', data)
  }

  async getDetailedProfile(): Promise<{ profile: UserProfile }> {
    return apiClient.get('/users/detailed-profile')
  }

  async createDetailedProfile(data: CreateProfileRequest): Promise<{ message: string; profile: UserProfile }> {
    return apiClient.post('/users/detailed-profile', data)
  }

  async updateDetailedProfile(data: UpdateProfileRequest): Promise<{ message: string; profile: UserProfile }> {
    return apiClient.put('/users/detailed-profile', data)
  }

  async getProfileCompletion(): Promise<ProfileCompletion> {
    return apiClient.get('/users/profile-completion')
  }

  // Endpoints utilitaires pour les options de formulaires
  async getExperienceLevels(): Promise<{ experienceLevels: ExperienceLevelOption[] }> {
    return apiClient.get('/users/experience-levels')
  }

  async getFitnessGoals(): Promise<{ commonGoals: FitnessGoalOption[] }> {
    return apiClient.get('/users/fitness-goals')
  }

  async getDaysOfWeek(): Promise<{ daysOfWeek: DayOfWeekOption[] }> {
    return apiClient.get('/users/days-of-week')
  }

  // Utilitaires pour les calculs côté client
  calculateAge(dateOfBirth: string): number {
    const today = new Date()
    const birthDate = new Date(dateOfBirth)
    let age = today.getFullYear() - birthDate.getFullYear()
    const monthDiff = today.getMonth() - birthDate.getMonth()

    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--
    }

    return age
  }

  calculateBMI(weight: number, height: number): number {
    // Height en centimètres, weight en kilogrammes
    const heightInMeters = height / 100
    return Math.round((weight / (heightInMeters * heightInMeters)) * 10) / 10
  }

  getBMICategory(bmi: number): string {
    if (bmi < 18.5) return 'Insuffisance pondérale'
    if (bmi < 25) return 'Poids normal'
    if (bmi < 30) return 'Surpoids'
    return 'Obésité'
  }

  getExperienceLevelLabel(level: string): string {
    const labels: Record<string, string> = {
      BEGINNER: 'Débutant',
      INTERMEDIATE: 'Intermédiaire',
      ADVANCED: 'Avancé',
      EXPERT: 'Expert',
    }
    return labels[level] || level
  }

  formatTrainingDays(days: number[]): string {
    const dayLabels = ['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi', 'Dimanche']
    return days.map(day => dayLabels[day]).join(', ')
  }

  validateProfileData(data: CreateProfileRequest | UpdateProfileRequest): string[] {
    const errors: string[] = []

    if (data.weight !== undefined && (data.weight < 30 || data.weight > 300)) {
      errors.push('Le poids doit être entre 30 et 300 kg')
    }

    if (data.height !== undefined && (data.height < 100 || data.height > 250)) {
      errors.push('La taille doit être entre 100 et 250 cm')
    }

    if (data.dateOfBirth) {
      const age = this.calculateAge(data.dateOfBirth)
      if (age < 16 || age > 100) {
        errors.push('L\'âge doit être entre 16 et 100 ans')
      }
    }

    if (data.maxTrainingHoursPerWeek !== undefined && (data.maxTrainingHoursPerWeek < 1 || data.maxTrainingHoursPerWeek > 40)) {
      errors.push('Le nombre d\'heures d\'entraînement par semaine doit être entre 1 et 40')
    }

    if (data.vma !== undefined && (data.vma < 8 || data.vma > 25)) {
      errors.push('La VMA doit être entre 8 et 25 km/h')
    }

    if (data.preferredTrainingDays && data.preferredTrainingDays.length === 0) {
      errors.push('Veuillez sélectionner au moins un jour d\'entraînement')
    }

    return errors
  }
}

export const userService = new UserService()