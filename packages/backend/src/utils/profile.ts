import {
  CreateUserProfileRequest,
  UpdateUserProfileRequest,
  ProfileCompletionResponse,
} from '../types/profile.js'

export class ProfileUtils {
  static validateProfileData(data: CreateUserProfileRequest | UpdateUserProfileRequest): string[] {
    const errors: string[] = []

    // Validate weight
    if (data.weight !== undefined) {
      if (data.weight <= 0 || data.weight > 300) {
        errors.push('Le poids doit être entre 1 et 300 kg')
      }
    }

    // Validate height
    if (data.height !== undefined) {
      if (data.height <= 0 || data.height > 250) {
        errors.push('La taille doit être entre 1 et 250 cm')
      }
    }

    // Validate VMA
    if (data.vma !== undefined) {
      if (data.vma <= 0 || data.vma > 30) {
        errors.push('La VMA doit être entre 1 et 30 km/h')
      }
    }

    // Validate maxTrainingHoursPerWeek
    if (data.maxTrainingHoursPerWeek !== undefined) {
      if (data.maxTrainingHoursPerWeek <= 0 || data.maxTrainingHoursPerWeek > 168) {
        errors.push("Les heures d'entraînement par semaine doivent être entre 1 et 168")
      }
    }

    // Validate preferredTrainingDays
    if (data.preferredTrainingDays !== undefined) {
      if (!Array.isArray(data.preferredTrainingDays)) {
        errors.push('Les jours préférés doivent être un tableau')
      } else {
        for (const day of data.preferredTrainingDays) {
          if (!Number.isInteger(day) || day < 0 || day > 6) {
            errors.push('Les jours doivent être des entiers entre 0 (dimanche) et 6 (samedi)')
            break
          }
        }
      }
    }

    // Validate dateOfBirth
    if (data.dateOfBirth !== undefined) {
      const birthDate = new Date(data.dateOfBirth)
      const today = new Date()
      const age = today.getFullYear() - birthDate.getFullYear()

      if (isNaN(birthDate.getTime())) {
        errors.push('Format de date de naissance invalide')
      } else if (age < 12 || age > 100) {
        errors.push("L'âge doit être entre 12 et 100 ans")
      }
    }

    // Validate fitness goals
    if (data.fitnessGoals !== undefined) {
      if (!Array.isArray(data.fitnessGoals)) {
        errors.push('Les objectifs de fitness doivent être un tableau')
      } else if (data.fitnessGoals.length > 10) {
        errors.push('Maximum 10 objectifs de fitness autorisés')
      }
    }

    // Validate medical conditions
    if (data.medicalConditions !== undefined) {
      if (!Array.isArray(data.medicalConditions)) {
        errors.push('Les conditions médicales doivent être un tableau')
      } else if (data.medicalConditions.length > 20) {
        errors.push('Maximum 20 conditions médicales autorisées')
      }
    }

    return errors
  }

  static calculateAge(dateOfBirth: Date): number {
    const today = new Date()
    const birthDate = new Date(dateOfBirth)
    let age = today.getFullYear() - birthDate.getFullYear()
    const monthDiff = today.getMonth() - birthDate.getMonth()

    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--
    }

    return age
  }

  static calculateBMI(weight: number, height: number): number {
    // BMI = weight (kg) / (height (m))^2
    const heightInMeters = height / 100
    return Math.round((weight / (heightInMeters * heightInMeters)) * 10) / 10
  }

  static calculateProfileCompletion(profile: any): ProfileCompletionResponse {
    const requiredFields = [
      'dateOfBirth',
      'weight',
      'height',
      'experienceLevel',
      'maxTrainingHoursPerWeek',
    ]

    const optionalFields = ['fitnessGoals', 'medicalConditions', 'preferredTrainingDays', 'vma']

    const allFields = [...requiredFields, ...optionalFields]
    const completedFields: string[] = []
    const missingFields: string[] = []

    // Check required fields
    for (const field of requiredFields) {
      if (profile[field] !== null && profile[field] !== undefined) {
        if (Array.isArray(profile[field]) && profile[field].length === 0) {
          missingFields.push(field)
        } else {
          completedFields.push(field)
        }
      } else {
        missingFields.push(field)
      }
    }

    // Check optional fields
    for (const field of optionalFields) {
      if (profile[field] !== null && profile[field] !== undefined) {
        if (Array.isArray(profile[field]) && profile[field].length > 0) {
          completedFields.push(field)
        } else if (!Array.isArray(profile[field])) {
          completedFields.push(field)
        }
      }
    }

    const completionPercentage = Math.round((completedFields.length / allFields.length) * 100)

    return {
      completionPercentage,
      completedFields,
      missingFields,
    }
  }

  static formatProfileResponse(profile: any): any {
    const response = { ...profile }

    // Calculate age if dateOfBirth exists
    if (profile.dateOfBirth) {
      response.age = this.calculateAge(profile.dateOfBirth)
    }

    // Calculate BMI if weight and height exist
    if (profile.weight && profile.height) {
      response.bmi = this.calculateBMI(profile.weight, profile.height)
    }

    return response
  }
}
