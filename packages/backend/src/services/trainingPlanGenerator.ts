/**
 * Service de génération de plans d'entraînement
 * Phase 5.2 - Personnalisation avancée des plans
 */

import { TrainingType, Intensity, TrainingPlanStatus } from '@coach-ia-hugo/shared'
import { PrismaClient } from '@prisma/client'
import { trainingCalculations } from '../utils/trainingCalculations.js'

interface UserProfileInput {
  id: string
  profile: {
    experienceLevel: string
    currentFitnessLevel: number
    vma?: number
    weight?: number
    weeklyTrainingHours?: number
    availableTrainingDays: string[]
    goals: string[]
    medicalConditions: string[]
  }
}

interface TargetRace {
  id: string
  name: string
  distance: number
  elevationGain: number
  difficulty: string
}

interface GenerationPreferences {
  sessionsPerWeek?: number
  preferredDays?: number[]
  maxSessionDuration?: number
  includeStrength?: boolean
  includeCrossTraining?: boolean
  // Phase 5.2 - Personnalisation avancée
  adaptToWeather?: boolean
  injuryHistory?: string[]
  focusAreas?: ('endurance' | 'strength' | 'technical' | 'speed')[]
  intensityPreference?: 'conservative' | 'moderate' | 'aggressive'
  recoveryNeeds?: 'low' | 'medium' | 'high'
  timeConstraints?: {
    workDays?: number[]
    maxWeekendDuration?: number
    vacationPeriods?: { start: Date; end: Date }[]
  }
}

interface GenerationInput {
  user: UserProfileInput
  targetRace: TargetRace
  startDate: Date
  endDate: Date
  preferences: GenerationPreferences
}

interface PlanAnalysis {
  totalSessions: number
  weeklyVolume: {
    distance: number
    duration: number
  }
  intensityDistribution: {
    [key in Intensity]: number
  }
  sessionTypeDistribution: {
    [key in TrainingType]: number
  }
  progressionRate: number
  peakWeek: Date
  recommendations: string[]
  // Phase 5.2 - Personnalisation avancée
  adaptationLevel: 'conservative' | 'moderate' | 'aggressive'
  recoveryRatio: number
  injuryRisk: 'low' | 'medium' | 'high'
}

interface SessionAlternative {
  original: {
    type: TrainingType
    duration: number
    intensity: Intensity
    description: string
  }
  alternatives: {
    weather?: string // 'rain', 'heat', 'cold'
    injury?: string // 'knee', 'ankle', 'back'
    equipment?: string // 'indoor', 'gym'
    alternative: {
      type: TrainingType
      duration: number
      intensity: Intensity
      description: string
      equipment?: string[]
    }
  }[]
}

export class TrainingPlanGenerator {
  constructor(private prisma: PrismaClient) {}

  /**
   * Génère un plan d'entraînement personnalisé
   */
  async generatePlan(input: GenerationInput) {
    const { user, targetRace, startDate, endDate, preferences } = input

    // 1. Analyse du profil utilisateur
    const userAnalysis = this.analyzeUserProfile(user.profile)

    // 2. Analyse de la course cible
    const raceAnalysis = this.analyzeTargetRace(targetRace)

    // 3. Calcul de la périodisation
    const periodization = this.calculatePeriodization(startDate, endDate, raceAnalysis)

    // 4. Génération du plan de base
    let planStructure = this.generatePlanStructure(
      userAnalysis,
      raceAnalysis,
      periodization,
      preferences
    )

    // 4.5. Phase 5.2 - Application de la personnalisation avancée
    planStructure = this.applyAdvancedPersonalization(planStructure, preferences)

    // 5. Création en base de données
    const plan = await this.prisma.trainingPlan.create({
      data: {
        userId: user.id,
        name: `Plan ${targetRace.name}`,
        description: `Plan d'entraînement personnalisé pour ${targetRace.name} (${targetRace.distance}km)`,
        startDate,
        endDate,
        targetRaceId: targetRace.id,
        status: TrainingPlanStatus.DRAFT,
      },
    })

    // 6. Création des séances
    const sessions = await this.createSessions(plan.id, user.id, planStructure)

    return {
      plan,
      sessions,
      analysis: this.generatePlanSummary(planStructure, userAnalysis, raceAnalysis),
    }
  }

  /**
   * Analyse du profil utilisateur
   */
  private analyzeUserProfile(profile: UserProfileInput['profile']) {
    const experienceMultiplier = this.getExperienceMultiplier(profile.experienceLevel)
    const fitnessLevel = profile.currentFitnessLevel || 5
    const availableDays = profile.availableTrainingDays.length
    const weeklyHours = profile.weeklyTrainingHours || 4

    // Calcul de la capacité d'entraînement
    const trainingCapacity = trainingCalculations.calculateTrainingCapacity({
      experienceLevel: profile.experienceLevel,
      fitnessLevel,
      weeklyHours,
      availableDays,
    })

    return {
      experienceMultiplier,
      fitnessLevel,
      availableDays,
      weeklyHours,
      trainingCapacity,
      vma: profile.vma,
      weight: profile.weight,
      medicalLimitations: profile.medicalConditions.length > 0,
    }
  }

  /**
   * Analyse de la course cible
   */
  private analyzeTargetRace(race: TargetRace) {
    const category = this.getRaceCategory(race.distance)
    const difficultyScore = this.getDifficultyScore(race.difficulty)
    const elevationRatio = race.elevationGain / race.distance

    // Estimation du temps de course
    const estimatedDuration = trainingCalculations.estimateRaceTime({
      distance: race.distance,
      elevationGain: race.elevationGain,
      difficulty: difficultyScore,
    })

    return {
      category,
      difficultyScore,
      elevationRatio,
      estimatedDuration,
      targetIntensities: this.getTargetIntensities(category, elevationRatio),
    }
  }

  /**
   * Calcul de la périodisation
   */
  private calculatePeriodization(startDate: Date, endDate: Date, _raceAnalysis: any) {
    const totalWeeks = Math.ceil((endDate.getTime() - startDate.getTime()) / (7 * 24 * 60 * 60 * 1000))

    const phases = {
      base: Math.ceil(totalWeeks * 0.4), // 40% phase de base
      build: Math.ceil(totalWeeks * 0.35), // 35% phase de développement
      peak: Math.ceil(totalWeeks * 0.15), // 15% phase de pic
      taper: Math.ceil(totalWeeks * 0.1), // 10% affûtage
    }

    return {
      totalWeeks,
      phases,
      weeklyProgression: this.calculateWeeklyProgression(totalWeeks, phases),
    }
  }

  /**
   * Génération de la structure du plan
   */
  private generatePlanStructure(
    userAnalysis: any,
    raceAnalysis: any,
    periodization: any,
    preferences: GenerationPreferences
  ) {
    const sessionsPerWeek = Math.min(
      preferences.sessionsPerWeek || 4,
      userAnalysis.availableDays,
      this.getMaxSessionsForLevel(userAnalysis.experienceMultiplier)
    )

    const weeks = []

    for (let week = 0; week < periodization.totalWeeks; week++) {
      const weekData = this.generateWeekStructure({
        weekNumber: week + 1,
        phase: this.getCurrentPhase(week, periodization.phases),
        progressionFactor: periodization.weeklyProgression[week],
        sessionsPerWeek,
        userAnalysis,
        raceAnalysis,
        preferences,
      })

      weeks.push(weekData)
    }

    return weeks
  }

  /**
   * Génération d'une semaine d'entraînement
   */
  private generateWeekStructure(params: any) {
    const { weekNumber, phase, progressionFactor, sessionsPerWeek, userAnalysis, raceAnalysis } = params

    const sessions = []
    const baseVolume = userAnalysis.trainingCapacity.weeklyHours * progressionFactor

    // Distribution des types de séances selon la phase
    const sessionDistribution = this.getSessionDistribution(phase, raceAnalysis.category)
    if (!sessionDistribution) return { weekNumber, phase, sessions: [], totalDuration: 0, totalDistance: 0 }

    for (let i = 0; i < sessionsPerWeek; i++) {
      const sessionType = this.selectSessionType(sessionDistribution, i, sessionsPerWeek)
      const intensity = this.selectIntensity(sessionType, phase, raceAnalysis.targetIntensities)

      const session = {
        type: sessionType,
        intensity,
        duration: this.calculateSessionDuration(sessionType, baseVolume, sessionsPerWeek),
        distance: this.calculateSessionDistance(sessionType, intensity, raceAnalysis),
        name: this.generateSessionName(sessionType, intensity, weekNumber),
        description: this.generateSessionDescription(sessionType, intensity, phase),
      }

      sessions.push(session)
    }

    return {
      weekNumber,
      phase,
      sessions,
      totalDuration: sessions.reduce((sum, s) => sum + s.duration, 0),
      totalDistance: sessions.reduce((sum, s) => sum + (s.distance || 0), 0),
    }
  }

  /**
   * Création des séances en base de données
   */
  private async createSessions(planId: string, userId: string, planStructure: any[]) {
    const sessions = []
    const startDate = new Date()

    for (const week of planStructure) {
      for (let sessionIndex = 0; sessionIndex < week.sessions.length; sessionIndex++) {
        const session = week.sessions[sessionIndex]
        const sessionDate = new Date(startDate)
        sessionDate.setDate(startDate.getDate() + (week.weekNumber - 1) * 7 + sessionIndex * 2)

        const createdSession = await this.prisma.trainingSession.create({
          data: {
            planId,
            userId,
            date: sessionDate,
            type: session.type,
            name: session.name,
            description: session.description,
            duration: session.duration,
            distance: session.distance,
            intensity: session.intensity,
            completed: false,
          },
        })

        sessions.push(createdSession)
      }
    }

    return sessions
  }

  /**
   * Analyse d'un plan existant
   */
  async analyzePlan(plan: any): Promise<PlanAnalysis> {
    const sessions = plan.sessions || []

    const analysis: PlanAnalysis = {
      totalSessions: sessions.length,
      weeklyVolume: {
        distance: this.calculateAverageWeeklyDistance(sessions),
        duration: this.calculateAverageWeeklyDuration(sessions),
      },
      intensityDistribution: this.calculateIntensityDistribution(sessions),
      sessionTypeDistribution: this.calculateSessionTypeDistribution(sessions),
      progressionRate: this.calculateProgressionRate(sessions),
      peakWeek: this.findPeakWeek(sessions),
      recommendations: this.generateRecommendations(sessions, plan),
      // Phase 5.2 - Analyse avancée
      adaptationLevel: this.assessAdaptationLevel(sessions),
      recoveryRatio: this.calculateRecoveryRatio(sessions),
      injuryRisk: this.assessInjuryRisk(sessions, plan),
    }

    return analysis
  }

  // ============================
  // MÉTHODES UTILITAIRES
  // ============================

  private getExperienceMultiplier(level: string): number {
    const multipliers: Record<string, number> = {
      BEGINNER: 0.7,
      INTERMEDIATE: 1.0,
      ADVANCED: 1.3,
      EXPERT: 1.5,
    }
    return multipliers[level] || 1.0
  }

  private getRaceCategory(distance: number): string {
    if (distance < 25) return 'SHORT_TRAIL'
    if (distance < 50) return 'LONG_TRAIL'
    if (distance < 100) return 'ULTRA_TRAIL'
    return 'ULTRA_LONG'
  }

  private getDifficultyScore(difficulty: string): number {
    const scores: Record<string, number> = {
      EASY: 1,
      MODERATE: 2,
      HARD: 3,
      VERY_HARD: 4,
      EXTREME: 5,
    }
    return scores[difficulty] || 2
  }

  private getTargetIntensities(category: string, _elevationRatio: number) {
    // Plus d'endurance pour les ultras, plus de seuil pour les courts
    if (category === 'SHORT_TRAIL') {
      return {
        [Intensity.LOW]: 0.3,
        [Intensity.MODERATE]: 0.4,
        [Intensity.HIGH]: 0.2,
        [Intensity.VERY_HIGH]: 0.1,
      }
    } else {
      return {
        [Intensity.LOW]: 0.5,
        [Intensity.MODERATE]: 0.3,
        [Intensity.HIGH]: 0.15,
        [Intensity.VERY_HIGH]: 0.05,
      }
    }
  }

  private getSessionDistribution(phase: string, _category: string) {
    const distributions: Record<string, Record<TrainingType, number>> = {
      base: {
        [TrainingType.ENDURANCE]: 0.5,
        [TrainingType.THRESHOLD]: 0.2,
        [TrainingType.INTERVAL]: 0.1,
        [TrainingType.RECOVERY]: 0.1,
        [TrainingType.STRENGTH]: 0.1,
        [TrainingType.CROSS_TRAINING]: 0.0,
      },
      build: {
        [TrainingType.ENDURANCE]: 0.4,
        [TrainingType.THRESHOLD]: 0.3,
        [TrainingType.INTERVAL]: 0.2,
        [TrainingType.RECOVERY]: 0.05,
        [TrainingType.STRENGTH]: 0.05,
        [TrainingType.CROSS_TRAINING]: 0.0,
      },
      peak: {
        [TrainingType.ENDURANCE]: 0.3,
        [TrainingType.THRESHOLD]: 0.3,
        [TrainingType.INTERVAL]: 0.3,
        [TrainingType.RECOVERY]: 0.05,
        [TrainingType.STRENGTH]: 0.05,
        [TrainingType.CROSS_TRAINING]: 0.0,
      },
      taper: {
        [TrainingType.ENDURANCE]: 0.4,
        [TrainingType.THRESHOLD]: 0.2,
        [TrainingType.INTERVAL]: 0.1,
        [TrainingType.RECOVERY]: 0.3,
        [TrainingType.STRENGTH]: 0.0,
        [TrainingType.CROSS_TRAINING]: 0.0,
      },
    }

    return distributions[phase] || distributions.base
  }

  private selectSessionType(distribution: Record<TrainingType, number>, _sessionIndex: number, _totalSessions: number): TrainingType {
    // Logique simplifiée : sélection basée sur la distribution et l'index
    const types = Object.keys(distribution) as TrainingType[]
    const weights = Object.values(distribution)

    // Sélection pondérée
    const random = Math.random()
    let cumulative = 0

    for (let i = 0; i < types.length; i++) {
      cumulative += weights[i]!
      if (random <= cumulative) {
        return types[i]!
      }
    }

    return TrainingType.ENDURANCE
  }

  private selectIntensity(sessionType: TrainingType, _phase: string, _targetIntensities: any): Intensity {
    // Logique de sélection d'intensité basée sur le type de séance
    const intensityMaps: Record<TrainingType, Intensity[]> = {
      [TrainingType.ENDURANCE]: [Intensity.LOW, Intensity.MODERATE],
      [TrainingType.THRESHOLD]: [Intensity.MODERATE, Intensity.HIGH],
      [TrainingType.INTERVAL]: [Intensity.HIGH, Intensity.VERY_HIGH],
      [TrainingType.RECOVERY]: [Intensity.VERY_LOW, Intensity.LOW],
      [TrainingType.STRENGTH]: [Intensity.MODERATE],
      [TrainingType.CROSS_TRAINING]: [Intensity.LOW, Intensity.MODERATE],
    }

    const possibleIntensities = intensityMaps[sessionType] || [Intensity.MODERATE]
    return possibleIntensities[Math.floor(Math.random() * possibleIntensities.length)]!
  }

  private calculateSessionDuration(sessionType: TrainingType, baseVolume: number, sessionsPerWeek: number): number {
    const sessionVolume = baseVolume / sessionsPerWeek
    const typeMultipliers: Record<TrainingType, number> = {
      [TrainingType.ENDURANCE]: 1.5,
      [TrainingType.THRESHOLD]: 1.0,
      [TrainingType.INTERVAL]: 0.8,
      [TrainingType.RECOVERY]: 0.6,
      [TrainingType.STRENGTH]: 0.5,
      [TrainingType.CROSS_TRAINING]: 1.0,
    }

    return Math.round(sessionVolume * 60 * (typeMultipliers[sessionType] || 1.0))
  }

  private calculateSessionDistance(sessionType: TrainingType, intensity: Intensity, _raceAnalysis: any): number | undefined {
    if (sessionType === TrainingType.STRENGTH) return undefined

    const baseSpeed = 10 // km/h base
    const intensityMultipliers: Record<Intensity, number> = {
      [Intensity.VERY_LOW]: 0.7,
      [Intensity.LOW]: 0.8,
      [Intensity.MODERATE]: 1.0,
      [Intensity.HIGH]: 1.2,
      [Intensity.VERY_HIGH]: 1.4,
    }

    // Calcul simplifié basé sur l'intensité
    const duration = this.calculateSessionDuration(sessionType, 4, 4) / 60 // en heures
    const speed = baseSpeed * (intensityMultipliers[intensity] || 1.0)

    return Math.round(duration * speed * 10) / 10 // Arrondi à 0.1 km
  }

  private generateSessionName(sessionType: TrainingType, intensity: Intensity, weekNumber: number): string {
    const typeNames: Record<TrainingType, string> = {
      [TrainingType.ENDURANCE]: 'Endurance',
      [TrainingType.THRESHOLD]: 'Seuil',
      [TrainingType.INTERVAL]: 'Fractionné',
      [TrainingType.RECOVERY]: 'Récupération',
      [TrainingType.STRENGTH]: 'Renforcement',
      [TrainingType.CROSS_TRAINING]: 'Croisé',
    }

    const intensityLabels: Record<Intensity, string> = {
      [Intensity.VERY_LOW]: 'Très facile',
      [Intensity.LOW]: 'Facile',
      [Intensity.MODERATE]: 'Modéré',
      [Intensity.HIGH]: 'Intense',
      [Intensity.VERY_HIGH]: 'Très intense',
    }

    return `${typeNames[sessionType]} ${intensityLabels[intensity]} - S${weekNumber}`
  }

  private generateSessionDescription(sessionType: TrainingType, intensity: Intensity, _phase: string): string {
    const descriptions: Record<TrainingType, Record<Intensity, string>> = {
      [TrainingType.ENDURANCE]: {
        [Intensity.VERY_LOW]: 'Course facile en endurance fondamentale',
        [Intensity.LOW]: 'Sortie longue en endurance de base',
        [Intensity.MODERATE]: 'Course d\'endurance avec variations d\'allure',
        [Intensity.HIGH]: 'Sortie longue avec passages soutenus',
        [Intensity.VERY_HIGH]: 'Endurance intensive',
      },
      [TrainingType.THRESHOLD]: {
        [Intensity.VERY_LOW]: 'Allure seuil facile',
        [Intensity.LOW]: 'Tempo run modéré',
        [Intensity.MODERATE]: 'Course au seuil lactique',
        [Intensity.HIGH]: 'Seuil intensif avec variations',
        [Intensity.VERY_HIGH]: 'Seuil maximal',
      },
      [TrainingType.INTERVAL]: {
        [Intensity.VERY_LOW]: 'Fractionné léger',
        [Intensity.LOW]: 'Intervalles courts faciles',
        [Intensity.MODERATE]: 'Fractionné modéré',
        [Intensity.HIGH]: 'Intervalles intenses',
        [Intensity.VERY_HIGH]: 'Fractionné maximal',
      },
      [TrainingType.RECOVERY]: {
        [Intensity.VERY_LOW]: 'Récupération active très légère',
        [Intensity.LOW]: 'Footing de récupération',
        [Intensity.MODERATE]: 'Course de récupération',
        [Intensity.HIGH]: 'Récupération dynamisée',
        [Intensity.VERY_HIGH]: 'Récupération active',
      },
      [TrainingType.STRENGTH]: {
        [Intensity.VERY_LOW]: 'Renforcement doux',
        [Intensity.LOW]: 'Musculation légère',
        [Intensity.MODERATE]: 'Renforcement musculaire',
        [Intensity.HIGH]: 'Musculation intense',
        [Intensity.VERY_HIGH]: 'Renforcement maximal',
      },
      [TrainingType.CROSS_TRAINING]: {
        [Intensity.VERY_LOW]: 'Activité croisée légère',
        [Intensity.LOW]: 'Cross-training facile',
        [Intensity.MODERATE]: 'Entraînement croisé',
        [Intensity.HIGH]: 'Cross-training intensif',
        [Intensity.VERY_HIGH]: 'Activité croisée maximale',
      },
    }

    return descriptions[sessionType]?.[intensity] || `Séance de ${sessionType.toLowerCase()}`
  }

  // Méthodes de calcul pour l'analyse
  private calculateAverageWeeklyDistance(sessions: any[]): number {
    if (sessions.length === 0) return 0
    const totalDistance = sessions.reduce((sum, s) => sum + (s.distance || 0), 0)
    const weeks = Math.ceil(sessions.length / 4) // Approximation
    return Math.round(totalDistance / weeks * 10) / 10
  }

  private calculateAverageWeeklyDuration(sessions: any[]): number {
    if (sessions.length === 0) return 0
    const totalDuration = sessions.reduce((sum, s) => sum + (s.duration || 0), 0)
    const weeks = Math.ceil(sessions.length / 4) // Approximation
    return Math.round(totalDuration / weeks)
  }

  private calculateIntensityDistribution(sessions: any[]): Record<Intensity, number> {
    const distribution: Record<Intensity, number> = {
      [Intensity.VERY_LOW]: 0,
      [Intensity.LOW]: 0,
      [Intensity.MODERATE]: 0,
      [Intensity.HIGH]: 0,
      [Intensity.VERY_HIGH]: 0,
    }

    sessions.forEach(session => {
      const key = session.intensity as Intensity
      distribution[key] = (distribution[key] || 0) + 1
    })

    return distribution
  }

  private calculateSessionTypeDistribution(sessions: any[]): Record<TrainingType, number> {
    const distribution: Record<TrainingType, number> = {
      [TrainingType.ENDURANCE]: 0,
      [TrainingType.THRESHOLD]: 0,
      [TrainingType.INTERVAL]: 0,
      [TrainingType.RECOVERY]: 0,
      [TrainingType.STRENGTH]: 0,
      [TrainingType.CROSS_TRAINING]: 0,
    }

    sessions.forEach(session => {
      const key = session.type as TrainingType
      distribution[key] = (distribution[key] || 0) + 1
    })

    return distribution
  }

  private calculateProgressionRate(sessions: any[]): number {
    // Calcul simplifié de la progression
    if (sessions.length < 4) return 0

    const firstWeekSessions = sessions.slice(0, 4)
    const lastWeekSessions = sessions.slice(-4)

    const firstWeekVolume = firstWeekSessions.reduce((sum, s) => sum + (s.duration || 0), 0)
    const lastWeekVolume = lastWeekSessions.reduce((sum, s) => sum + (s.duration || 0), 0)

    return lastWeekVolume > 0 ? ((lastWeekVolume - firstWeekVolume) / firstWeekVolume) * 100 : 0
  }

  private findPeakWeek(sessions: any[]): Date {
    // Trouve la semaine avec le plus gros volume
    if (sessions.length === 0) return new Date()

    const weeks: Record<string, number> = {}
    sessions.forEach(session => {
      const weekKey = this.getWeekKey(session.date)
      weeks[weekKey] = (weeks[weekKey] || 0) + (session.duration || 0)
    })

    const peakWeekKey = Object.keys(weeks).reduce((a, b) => weeks[a]! > weeks[b]! ? a : b)
    return new Date(peakWeekKey)
  }

  private getWeekKey(date: Date): string {
    const week = new Date(date)
    week.setDate(week.getDate() - week.getDay()) // Début de semaine
    return week.toISOString().split('T')[0]!
  }

  private generateRecommendations(sessions: any[], _plan: any): string[] {
    const recommendations = []

    // Analyse du volume
    const totalSessions = sessions.length
    if (totalSessions < 20) {
      recommendations.push('Considérez ajouter plus de séances pour améliorer la progression')
    }

    // Analyse de la distribution d'intensité
    const intensityDist = this.calculateIntensityDistribution(sessions)
    const lowIntensityRatio = (intensityDist[Intensity.LOW] + intensityDist[Intensity.VERY_LOW]) / totalSessions

    if (lowIntensityRatio < 0.6) {
      recommendations.push('Augmentez le pourcentage de séances à faible intensité (règle 80/20)')
    }

    // Recommandations générales
    recommendations.push('Adaptez le plan selon vos sensations et votre récupération')
    recommendations.push('N\'hésitez pas à reporter une séance si vous ressentez de la fatigue')

    return recommendations
  }

  private generatePlanSummary(planStructure: any[], userAnalysis: any, raceAnalysis: any) {
    return {
      totalWeeks: planStructure.length,
      totalSessions: planStructure.reduce((sum, week) => sum + week.sessions.length, 0),
      averageWeeklyVolume: planStructure.reduce((sum, week) => sum + week.totalDuration, 0) / planStructure.length,
      peakWeek: Math.ceil(planStructure.length * 0.75),
      difficultyLevel: raceAnalysis.difficultyScore,
      userLevel: userAnalysis.experienceMultiplier,
    }
  }

  // Méthodes utilitaires supplémentaires
  private calculateWeeklyProgression(totalWeeks: number, phases: any): number[] {
    const progression = []
    let currentPhase = 'base'
    let weekInPhase = 0

    for (let week = 0; week < totalWeeks; week++) {
      // Déterminer la phase actuelle
      if (week < phases.base) {
        currentPhase = 'base'
        weekInPhase = week
      } else if (week < phases.base + phases.build) {
        currentPhase = 'build'
        weekInPhase = week - phases.base
      } else if (week < phases.base + phases.build + phases.peak) {
        currentPhase = 'peak'
        weekInPhase = week - phases.base - phases.build
      } else {
        currentPhase = 'taper'
        weekInPhase = week - phases.base - phases.build - phases.peak
      }

      // Calcul du facteur de progression
      let factor = 0.7 // Base
      switch (currentPhase) {
        case 'base':
          factor = 0.7 + (weekInPhase / phases.base) * 0.2 // 0.7 à 0.9
          break
        case 'build':
          factor = 0.9 + (weekInPhase / phases.build) * 0.2 // 0.9 à 1.1
          break
        case 'peak':
          factor = 1.1 + (weekInPhase / phases.peak) * 0.1 // 1.1 à 1.2
          break
        case 'taper':
          factor = 1.2 - (weekInPhase / phases.taper) * 0.5 // 1.2 à 0.7
          break
      }

      progression.push(factor)
    }

    return progression
  }

  private getCurrentPhase(weekNumber: number, phases: any): string {
    if (weekNumber < phases.base) return 'base'
    if (weekNumber < phases.base + phases.build) return 'build'
    if (weekNumber < phases.base + phases.build + phases.peak) return 'peak'
    return 'taper'
  }

  private getMaxSessionsForLevel(experienceMultiplier: number): number {
    if (experienceMultiplier <= 0.7) return 4 // Débutant
    if (experienceMultiplier <= 1.0) return 5 // Intermédiaire
    if (experienceMultiplier <= 1.3) return 6 // Avancé
    return 7 // Expert
  }

  // ============================
  // PHASE 5.2 - MÉTHODES DE PERSONNALISATION AVANCÉE
  // ============================

  /**
   * Évalue le niveau d'adaptation du plan
   */
  private assessAdaptationLevel(sessions: any[]): 'conservative' | 'moderate' | 'aggressive' {
    const totalSessions = sessions.length
    if (totalSessions === 0) return 'moderate'

    const highIntensitySessions = sessions.filter(s =>
      s.intensity === Intensity.HIGH || s.intensity === Intensity.VERY_HIGH
    ).length

    const highIntensityRatio = highIntensitySessions / totalSessions

    if (highIntensityRatio < 0.15) return 'conservative'
    if (highIntensityRatio > 0.25) return 'aggressive'
    return 'moderate'
  }

  /**
   * Calcule le ratio de récupération (sessions récupération vs intensives)
   */
  private calculateRecoveryRatio(sessions: any[]): number {
    const recoverySessions = sessions.filter(s =>
      s.type === TrainingType.RECOVERY || s.intensity === Intensity.VERY_LOW
    ).length

    return sessions.length > 0 ? recoverySessions / sessions.length : 0
  }

  /**
   * Évalue le risque de blessure basé sur la progression et l'intensité
   */
  private assessInjuryRisk(sessions: any[], plan: any): 'low' | 'medium' | 'high' {
    const progressionRate = this.calculateProgressionRate(sessions)
    const adaptationLevel = this.assessAdaptationLevel(sessions)
    const recoveryRatio = this.calculateRecoveryRatio(sessions)

    // Progression trop rapide = risque élevé
    if (progressionRate > 100 && adaptationLevel === 'aggressive') return 'high'

    // Manque de récupération = risque moyen à élevé
    if (recoveryRatio < 0.2 && adaptationLevel !== 'conservative') return 'medium'

    // Progression conservatrice = risque faible
    if (adaptationLevel === 'conservative' && recoveryRatio > 0.25) return 'low'

    return 'medium'
  }

  /**
   * Génère des alternatives de séances basées sur les contraintes
   */
  generateSessionAlternatives(session: any, constraints: {
    weather?: string
    injury?: string
    equipment?: string
  }): SessionAlternative {
    const original = {
      type: session.type,
      duration: session.duration,
      intensity: session.intensity,
      description: session.description
    }

    const alternatives = []

    // Alternatives météo
    if (constraints.weather === 'rain') {
      alternatives.push({
        weather: 'rain',
        alternative: {
          type: TrainingType.STRENGTH,
          duration: session.duration * 0.8,
          intensity: session.intensity,
          description: `Séance force en salle (remplace ${session.description})`,
          equipment: ['gym', 'weights']
        }
      })
    }

    if (constraints.weather === 'heat') {
      alternatives.push({
        weather: 'heat',
        alternative: {
          type: session.type,
          duration: session.duration * 0.7,
          intensity: session.intensity === Intensity.HIGH ? Intensity.MODERATE : session.intensity,
          description: `${session.description} - adaptée à la chaleur (durée réduite, intensité modérée)`,
          equipment: ['water', 'electrolytes']
        }
      })
    }

    // Alternatives blessure
    if (constraints.injury === 'knee') {
      alternatives.push({
        injury: 'knee',
        alternative: {
          type: TrainingType.CROSS_TRAINING,
          duration: session.duration,
          intensity: Intensity.MODERATE,
          description: `Aqua-jogging ou vélo (préservation genou)`,
          equipment: ['pool', 'bike']
        }
      })
    }

    if (constraints.injury === 'ankle') {
      alternatives.push({
        injury: 'ankle',
        alternative: {
          type: TrainingType.STRENGTH,
          duration: session.duration * 0.6,
          intensity: Intensity.MODERATE,
          description: `Renforcement haut du corps + proprioception cheville`,
          equipment: ['gym', 'balance_board']
        }
      })
    }

    // Alternatives équipement
    if (constraints.equipment === 'indoor') {
      alternatives.push({
        equipment: 'indoor',
        alternative: {
          type: session.type === TrainingType.ENDURANCE ? TrainingType.CROSS_TRAINING : session.type,
          duration: session.duration,
          intensity: session.intensity,
          description: `Tapis de course ou vélo d'appartement`,
          equipment: ['treadmill', 'indoor_bike']
        }
      })
    }

    return { original, alternatives }
  }

  /**
   * Adapte le plan selon les préférences d'intensité
   */
  private adaptPlanIntensity(
    planStructure: any[],
    preferences: GenerationPreferences
  ): any[] {
    if (!preferences.intensityPreference) return planStructure

    const modifier = {
      'conservative': 0.85,
      'moderate': 1.0,
      'aggressive': 1.15
    }[preferences.intensityPreference]

    return planStructure.map(week => ({
      ...week,
      sessions: week.sessions.map((session: any) => ({
        ...session,
        duration: Math.round(session.duration * modifier),
        // Ajuste l'intensité selon la préférence
        intensity: this.adjustIntensityLevel(session.intensity, preferences.intensityPreference!)
      }))
    }))
  }

  /**
   * Ajuste le niveau d'intensité selon les préférences
   */
  private adjustIntensityLevel(
    currentIntensity: Intensity,
    preference: 'conservative' | 'moderate' | 'aggressive'
  ): Intensity {
    if (preference === 'conservative') {
      switch (currentIntensity) {
        case Intensity.VERY_HIGH: return Intensity.HIGH
        case Intensity.HIGH: return Intensity.MODERATE
        default: return currentIntensity
      }
    }

    if (preference === 'aggressive') {
      switch (currentIntensity) {
        case Intensity.LOW: return Intensity.MODERATE
        case Intensity.MODERATE: return Intensity.HIGH
        default: return currentIntensity
      }
    }

    return currentIntensity
  }

  /**
   * Adapte le plan selon l'historique de blessures
   */
  private adaptForInjuryHistory(
    planStructure: any[],
    injuryHistory: string[]
  ): any[] {
    if (!injuryHistory.length) return planStructure

    return planStructure.map(week => ({
      ...week,
      sessions: week.sessions.map((session: any) => {
        // Ajoute des séances de prévention
        if (injuryHistory.includes('knee') && session.type === TrainingType.ENDURANCE) {
          return {
            ...session,
            description: `${session.description} + renforcement genou`,
            preventionExercises: ['knee_strengthening', 'glute_activation']
          }
        }

        if (injuryHistory.includes('ankle') && session.type === TrainingType.INTERVAL) {
          return {
            ...session,
            description: `${session.description} + proprioception`,
            preventionExercises: ['ankle_stability', 'balance_work']
          }
        }

        return session
      })
    }))
  }

  /**
   * Adapte les séances selon les contraintes temporelles
   */
  private adaptForTimeConstraints(
    planStructure: any[],
    constraints: GenerationPreferences['timeConstraints']
  ): any[] {
    if (!constraints) return planStructure

    return planStructure.map(week => ({
      ...week,
      sessions: week.sessions.map((session: any, index: number) => {
        const dayOfWeek = index % 7

        // Adapte selon les jours de travail
        if (constraints.workDays?.includes(dayOfWeek)) {
          return {
            ...session,
            duration: Math.min(session.duration, 60), // Max 1h les jours de travail
            description: `${session.description} (version courte)`
          }
        }

        // Adapte les weekends
        if ([0, 6].includes(dayOfWeek) && constraints.maxWeekendDuration) {
          return {
            ...session,
            duration: Math.min(session.duration, constraints.maxWeekendDuration),
            description: `${session.description} (weekend adapté)`
          }
        }

        return session
      })
    }))
  }

  /**
   * Améliore la méthode principale generatePlan pour inclure la personnalisation avancée
   */
  private applyAdvancedPersonalization(
    planStructure: any[],
    preferences: GenerationPreferences
  ): any[] {
    let adaptedPlan = planStructure

    // Adaptation selon l'intensité préférée
    if (preferences.intensityPreference) {
      adaptedPlan = this.adaptPlanIntensity(adaptedPlan, preferences)
    }

    // Adaptation selon l'historique de blessures
    if (preferences.injuryHistory?.length) {
      adaptedPlan = this.adaptForInjuryHistory(adaptedPlan, preferences.injuryHistory)
    }

    // Adaptation selon les contraintes temporelles
    if (preferences.timeConstraints) {
      adaptedPlan = this.adaptForTimeConstraints(adaptedPlan, preferences.timeConstraints)
    }

    // Augmentation de la récupération si nécessaire
    if (preferences.recoveryNeeds === 'high') {
      adaptedPlan = this.increaseRecoveryFocus(adaptedPlan)
    }

    return adaptedPlan
  }

  /**
   * Augmente l'accent sur la récupération
   */
  private increaseRecoveryFocus(planStructure: any[]): any[] {
    return planStructure.map(week => ({
      ...week,
      sessions: week.sessions.map((session: any, index: number) => {
        // Ajoute une séance de récupération tous les 3 jours
        if (index % 3 === 2) {
          return {
            ...session,
            type: TrainingType.RECOVERY,
            intensity: Intensity.VERY_LOW,
            duration: Math.min(session.duration, 45),
            description: 'Récupération active - footing léger ou étirements'
          }
        }
        return session
      })
    }))
  }
}

// La classe sera instanciée dans les routes avec l'instance Prisma
// export const trainingPlanGenerator = new TrainingPlanGenerator()