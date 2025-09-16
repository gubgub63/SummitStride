import { z } from 'zod'

// Common validation helpers
export const validateEmail = (email: string): boolean => {
  const emailSchema = z.string().email()
  return emailSchema.safeParse(email).success
}

export const validatePassword = (password: string): { valid: boolean; errors: string[] } => {
  const errors: string[] = []

  if (password.length < 8) {
    errors.push('Password must be at least 8 characters long')
  }

  if (!/[A-Z]/.test(password)) {
    errors.push('Password must contain at least one uppercase letter')
  }

  if (!/[a-z]/.test(password)) {
    errors.push('Password must contain at least one lowercase letter')
  }

  if (!/\d/.test(password)) {
    errors.push('Password must contain at least one number')
  }

  return {
    valid: errors.length === 0,
    errors,
  }
}

export const validateAge = (
  dateOfBirth: Date
): { valid: boolean; age?: number; error?: string } => {
  const today = new Date()
  const age = today.getFullYear() - dateOfBirth.getFullYear()
  const monthDiff = today.getMonth() - dateOfBirth.getMonth()

  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < dateOfBirth.getDate())) {
    const actualAge = age - 1

    if (actualAge < 13) {
      return { valid: false, error: 'Must be at least 13 years old' }
    }

    if (actualAge > 100) {
      return { valid: false, error: 'Age cannot exceed 100 years' }
    }

    return { valid: true, age: actualAge }
  }

  if (age < 13) {
    return { valid: false, error: 'Must be at least 13 years old' }
  }

  if (age > 100) {
    return { valid: false, error: 'Age cannot exceed 100 years' }
  }

  return { valid: true, age }
}

// Training validation
export const validateTrainingDuration = (duration: number): boolean => {
  return duration > 0 && duration <= 720 // Max 12 hours
}

export const validateHeartRate = (heartRate: number): boolean => {
  return heartRate >= 40 && heartRate <= 220
}

// Nutrition validation
export const validateCalorieIntake = (calories: number, userWeight?: number): boolean => {
  if (calories < 800) return false // Minimum safe calorie intake

  if (userWeight && calories > userWeight * 50) {
    return false // Extremely high calorie intake
  }

  return true
}

// Distance validation for ultra-trail
export const validateDistance = (distance: number, type: 'training' | 'race'): boolean => {
  if (type === 'training') {
    return distance > 0 && distance <= 200 // Max 200km for training
  }

  if (type === 'race') {
    return distance > 0 && distance <= 500 // Max 500km for races
  }

  return false
}
