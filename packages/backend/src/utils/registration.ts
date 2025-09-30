import {
  CreateRaceRegistrationRequest,
  UpdateRaceRegistrationRequest,
  PreparationPeriod,
  PreparationAnalysis,
  RaceRegistrationStatus
} from '../types/registration.js'
import { TrailCategory } from '../types/course.js'
import { ExperienceLevel } from '@summitstride/shared'

export class RegistrationUtils {
  static validateRegistrationData(data: CreateRaceRegistrationRequest | UpdateRaceRegistrationRequest): string[] {
    const errors: string[] = []

    // Validate target date if provided
    if (data.targetDate !== undefined) {
      const targetDate = new Date(data.targetDate)
      const today = new Date()

      if (isNaN(targetDate.getTime())) {
        errors.push('Format de date objectif invalide')
      } else if (targetDate <= today) {
        errors.push('La date objectif doit être dans le futur')
      } else if (targetDate > new Date(today.getTime() + 2 * 365 * 24 * 60 * 60 * 1000)) {
        errors.push('La date objectif ne peut pas être à plus de 2 ans dans le futur')
      }
    }

    // Validate goal length
    if (data.goal !== undefined && data.goal !== null) {
      if (data.goal.length > 200) {
        errors.push('L\'objectif ne peut pas dépasser 200 caractères')
      }
    }

    // Validate notes length
    if (data.notes !== undefined && data.notes !== null) {
      if (data.notes.length > 1000) {
        errors.push('Les notes ne peuvent pas dépasser 1000 caractères')
      }
    }

    return errors
  }

  static calculatePreparationTime(targetDate: Date, currentDate: Date = new Date()): PreparationPeriod {
    const timeDiff = targetDate.getTime() - currentDate.getTime()
    const totalDays = Math.ceil(timeDiff / (1000 * 60 * 60 * 24))
    const weeks = Math.floor(totalDays / 7)
    const days = totalDays % 7

    // Determine if preparation time is adequate
    let isAdequate = true
    const recommendations: string[] = []

    if (totalDays < 7) {
      isAdequate = false
      recommendations.push('Temps de préparation très insuffisant (moins d\'une semaine)')
    } else if (totalDays < 28) {
      isAdequate = false
      recommendations.push('Temps de préparation court (moins de 4 semaines) - privilégier l\'entretien')
    } else if (totalDays < 84) {
      recommendations.push('Temps de préparation modéré (8-12 semaines) - plan d\'entraînement focalisé')
    } else if (totalDays > 365) {
      recommendations.push('Temps de préparation très long (plus d\'un an) - planification par cycles')
    }

    return {
      weeks,
      days,
      totalDays,
      isAdequate,
      recommendations
    }
  }

  static analyzePreparation(
    targetDate: Date,
    courseDistance: number,
    courseCategory: TrailCategory,
    userExperience: ExperienceLevel,
    currentDate: Date = new Date()
  ): PreparationAnalysis {
    const period = this.calculatePreparationTime(targetDate, currentDate)

    // Determine risk level based on multiple factors
    let riskLevel: 'LOW' | 'MEDIUM' | 'HIGH' = 'LOW'
    const suggestions: string[] = []

    // Risk factors
    const isShortPreparation = period.totalDays < 84 // less than 12 weeks
    const isBeginnerForDistance = userExperience === ExperienceLevel.BEGINNER && courseCategory !== TrailCategory.SHORT
    const isUltraWithShortPrep = courseCategory === TrailCategory.ULTRA && period.totalDays < 168 // less than 24 weeks

    // Calculate risk level
    if (isUltraWithShortPrep || (isBeginnerForDistance && isShortPreparation)) {
      riskLevel = 'HIGH'
      suggestions.push('Risque élevé - considérer une course plus courte ou reporter l\'objectif')
    } else if (isShortPreparation || isBeginnerForDistance) {
      riskLevel = 'MEDIUM'
      suggestions.push('Préparation à surveiller - plan d\'entraînement adapté nécessaire')
    }

    // Experience-based suggestions
    if (userExperience === ExperienceLevel.BEGINNER) {
      suggestions.push('Débutant: privilégier la régularité et l\'adaptation progressive')
    } else if (userExperience === ExperienceLevel.EXPERT && period.totalDays > 180) {
      suggestions.push('Expert: possibilité de planification par cycles avec pics de forme')
    }

    // Distance-based suggestions
    if (courseCategory === TrailCategory.SHORT && period.totalDays > 84) {
      suggestions.push('Trail court: focus sur la vitesse et l\'intensité')
    } else if (courseCategory === TrailCategory.ULTRA) {
      suggestions.push('Ultra: privilégier l\'endurance et l\'adaptation aux longues distances')
    }

    return {
      period,
      userLevel: userExperience,
      courseCategory,
      riskLevel,
      suggestions
    }
  }

  static getMinimumPreparationWeeks(courseCategory: TrailCategory, userExperience: ExperienceLevel): number {
    // Minimum recommended preparation time in weeks
    const minimumWeeks = {
      [TrailCategory.SHORT]: {
        [ExperienceLevel.BEGINNER]: 8,
        [ExperienceLevel.INTERMEDIATE]: 6,
        [ExperienceLevel.ADVANCED]: 4,
        [ExperienceLevel.EXPERT]: 4
      },
      [TrailCategory.LONG]: {
        [ExperienceLevel.BEGINNER]: 16,
        [ExperienceLevel.INTERMEDIATE]: 12,
        [ExperienceLevel.ADVANCED]: 8,
        [ExperienceLevel.EXPERT]: 6
      },
      [TrailCategory.ULTRA]: {
        [ExperienceLevel.BEGINNER]: 32,
        [ExperienceLevel.INTERMEDIATE]: 24,
        [ExperienceLevel.ADVANCED]: 16,
        [ExperienceLevel.EXPERT]: 12
      }
    }

    return minimumWeeks[courseCategory][userExperience]
  }

  static formatRegistrationResponse(registration: any, course: any): any {
    const response = { ...registration, course }

    // Calculate preparation time if target date is set
    if (registration.targetDate) {
      const prep = this.calculatePreparationTime(new Date(registration.targetDate))
      response.preparationTimeWeeks = prep.weeks
      response.preparationTimeDays = prep.totalDays
    }

    return response
  }

  static getRegistrationSummary(registrations: any[]) {
    const summary = {
      total: registrations.length,
      active: 0,
      completed: 0,
      upcoming: 0
    }

    const today = new Date()

    registrations.forEach(reg => {
      switch (reg.status) {
        case RaceRegistrationStatus.COMPLETED:
          summary.completed++
          break
        case RaceRegistrationStatus.PREPARATION:
        case RaceRegistrationStatus.REGISTERED:
          summary.active++
          if (reg.targetDate && new Date(reg.targetDate) > today) {
            summary.upcoming++
          }
          break
      }
    })

    return summary
  }

  static validateUniqueRegistration(existingRegistrations: any[], courseId: string): boolean {
    return !existingRegistrations.some(reg =>
      reg.courseId === courseId &&
      (reg.status === RaceRegistrationStatus.REGISTERED || reg.status === RaceRegistrationStatus.PREPARATION)
    )
  }

  static canRegisterForCourse(course: any, userExperience: ExperienceLevel): { canRegister: boolean, reasons: string[] } {
    const reasons: string[] = []
    let canRegister = true

    // Basic validation - could be extended with more business rules
    if (course.difficulty === 'EXTREME' && userExperience === ExperienceLevel.BEGINNER) {
      canRegister = false
      reasons.push('Course de difficulté extrême non recommandée pour les débutants')
    }

    return { canRegister, reasons }
  }
}
