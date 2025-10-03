import { CourseDifficulty } from '@summitstride/shared'
import type { TrainingPlan, TrainingSession, Course, UserProfile } from '@prisma/client'
import type { AiPlanInsights } from '@summitstride/shared'
import { TrainingPlanAnalytics } from './trainingPlanAnalytics.js'

interface GeneratePlanInsightsInput {
  plan: TrainingPlan
  sessions: TrainingSession[]
  targetRace?: Course | null
  userProfile?: UserProfile | null
  metrics?: ReturnType<typeof TrainingPlanAnalytics.summarizeSessions>
}

type RiskLevel = 'LOW' | 'MEDIUM' | 'HIGH'

export class AiInsightsService {
  static generatePlanInsights(input: GeneratePlanInsightsInput): AiPlanInsights {
    const { plan, sessions, targetRace, userProfile } = input
    const metrics = input.metrics ?? TrainingPlanAnalytics.summarizeSessions(sessions)

    const totalDistance = metrics.totalDistance || 0
    const totalDuration = metrics.totalDuration || 0
    const totalSessions = sessions.length || 1
    const completedSessions = sessions.filter(session => session.completed).length
    const completionRate = completedSessions / totalSessions

    const basePaceMinutesPerKm = this.calculateBasePaceMinutes(totalDistance, totalDuration)
    const targetDistance = targetRace?.distance ?? totalDistance
    const difficultyModifier = this.getCourseDifficultyModifier(targetRace?.difficulty)
    const experienceModifier = this.getExperienceModifier(userProfile)

    const predictedFinishTimeMinutes = Math.round(
      targetDistance * basePaceMinutesPerKm * difficultyModifier * experienceModifier
    )

    const confidence = this.calculateConfidence(totalSessions, completionRate)
    const fatigueScore = this.calculateFatigueScore(metrics.weekly)
    const readinessScore = this.calculateReadinessScore(fatigueScore, completionRate)
    const injuryRisk = this.calculateInjuryRisk(sessions, metrics)

    const recommendations = this.buildRecommendations({
      completionRate,
      fatigueScore,
      injuryRisk,
      confidence,
      plan,
      targetRace,
    })

    return {
      planId: plan.id,
      predictedFinishTimeMinutes,
      predictedFinishTimeLabel: this.formatDuration(predictedFinishTimeMinutes),
      predictedPaceMinutesPerKm: parseFloat(basePaceMinutesPerKm.toFixed(2)),
      confidence,
      fatigueScore,
      readinessScore,
      injuryRisk,
      trainingLoadScore: metrics.loadScore ?? 0,
      completionRate,
      recommendedFocus: recommendations.focus,
      recommendedAdjustments: recommendations.adjustments,
      topRisks: recommendations.risks,
      targetRace: targetRace
        ? {
            id: targetRace.id,
            name: targetRace.name,
            distance: targetRace.distance,
            difficulty: targetRace.difficulty,
          }
        : undefined,
      generatedAt: new Date().toISOString(),
    }
  }

  private static calculateBasePaceMinutes(
    totalDistance: number,
    totalDurationMinutes: number
  ): number {
    if (!totalDistance || !totalDurationMinutes) {
      return 6.5
    }

    const pace = totalDurationMinutes / totalDistance
    return Math.min(Math.max(pace, 4), 12)
  }

  private static getCourseDifficultyModifier(difficulty?: CourseDifficulty | null): number {
    switch (difficulty) {
      case CourseDifficulty.EASY:
        return 0.95
      case CourseDifficulty.MODERATE:
        return 1
      case CourseDifficulty.HARD:
        return 1.1
      case CourseDifficulty.EXTREME:
        return 1.25
      default:
        return 1
    }
  }

  private static getExperienceModifier(profile?: UserProfile | null): number {
    if (!profile) {
      return 1.05
    }

    switch (profile.experienceLevel) {
      case 'BEGINNER':
        return 1.15
      case 'INTERMEDIATE':
        return 1.05
      case 'ADVANCED':
        return 1
      case 'EXPERT':
        return 0.95
      default:
        return 1.05
    }
  }

  private static calculateConfidence(totalSessions: number, completionRate: number): RiskLevel {
    if (totalSessions >= 30 && completionRate >= 0.8) {
      return 'HIGH'
    }

    if (totalSessions >= 12 && completionRate >= 0.6) {
      return 'MEDIUM'
    }

    return 'LOW'
  }

  private static calculateFatigueScore(weeklyProgress: Array<{ loadScore: number }>): number {
    if (!weeklyProgress || weeklyProgress.length === 0) {
      return 40
    }

    const recentWeeks = weeklyProgress.slice(-3)
    const averageLoad =
      weeklyProgress.reduce((total, week) => total + (week.loadScore || 0), 0) /
      weeklyProgress.length
    const recentLoad =
      recentWeeks.reduce((total, week) => total + (week.loadScore || 0), 0) / recentWeeks.length

    const delta = recentLoad - averageLoad
    const score = 50 + delta * 0.5

    return Math.max(10, Math.min(90, Math.round(score)))
  }

  private static calculateReadinessScore(fatigueScore: number, completionRate: number): number {
    const completionImpact = completionRate * 40
    const fatiguePenalty = (fatigueScore - 40) * 0.6
    const score = 60 + completionImpact - fatiguePenalty
    return Math.max(0, Math.min(100, Math.round(score)))
  }

  private static calculateInjuryRisk(
    sessions: TrainingSession[],
    metrics: ReturnType<typeof TrainingPlanAnalytics.summarizeSessions>
  ): RiskLevel {
    const highIntensityCount = sessions.filter(session => session.intensity === 'HIGH').length
    const veryHighIntensityCount = sessions.filter(
      session => session.intensity === 'VERY_HIGH'
    ).length
    const totalSessions = sessions.length || 1
    const highIntensityRatio = (highIntensityCount + veryHighIntensityCount * 1.2) / totalSessions

    if (highIntensityRatio >= 0.25 || (metrics.loadScore ?? 0) > 1000) {
      return 'HIGH'
    }

    if (highIntensityRatio >= 0.15) {
      return 'MEDIUM'
    }

    return 'LOW'
  }

  private static buildRecommendations(params: {
    completionRate: number
    fatigueScore: number
    injuryRisk: RiskLevel
    confidence: RiskLevel
    plan: TrainingPlan
    targetRace?: Course | null
  }) {
    const focus: string[] = []
    const adjustments: string[] = []
    const risks: string[] = []

    if (params.completionRate < 0.6) {
      focus.push('Renforcer la constance hebdomadaire (objectif ≥ 80 % des séances planifiées).')
      risks.push('Taux de complétion insuffisant pour une progression optimale.')
    }

    if (params.fatigueScore > 70) {
      adjustments.push(
        'Prévoir une semaine de décharge ou réduire le volume de 20 % pour favoriser la récupération.'
      )
      risks.push('Fatigue cumulée importante détectée sur les 3 dernières semaines.')
    }

    if (params.injuryRisk === 'HIGH') {
      adjustments.push(
        'Réduire la densité de séances intenses : limiter à 2 high intensity par semaine et ajouter du travail de mobilité.'
      )
      risks.push('Risque de blessure élevé lié à la proportion de séances intenses.')
    }

    if (params.confidence === 'LOW') {
      focus.push(
        'Augmenter la durée du plan ou compléter davantage de séances clés pour fiabiliser la préparation.'
      )
    }

    if (!params.targetRace) {
      adjustments.push('Associer ce plan à une course cible pour des prévisions plus précises.')
    }

    if (focus.length === 0) {
      focus.push(
        'Maintenir la progression actuelle en surveillant la récupération et la constance.'
      )
    }

    if (adjustments.length === 0) {
      adjustments.push('Poursuivre le plan en respectant les blocs de récupération programmés.')
    }

    if (risks.length === 0) {
      risks.push(
        'Risques sous contrôle. Continuer à journaliser les sensations pour ajustements fins.'
      )
    }

    return { focus, adjustments, risks }
  }

  private static formatDuration(minutes: number): string {
    if (!Number.isFinite(minutes) || minutes <= 0) {
      return 'Non estimé'
    }

    const hours = Math.floor(minutes / 60)
    const remainingMinutes = Math.round(minutes % 60)
    const parts: string[] = []

    if (hours > 0) {
      parts.push(`${hours} h`)
    }

    if (remainingMinutes > 0) {
      parts.push(`${remainingMinutes.toString().padStart(2, '0')} min`)
    }

    return parts.join(' ')
  }
}
