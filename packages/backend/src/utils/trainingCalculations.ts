/**
 * Utilitaires de calculs pour les plans d'entraînement
 * Phase 5.1 - Algorithme de génération de base
 */

interface TrainingCapacityInput {
  experienceLevel: string
  fitnessLevel: number // 1-10
  weeklyHours: number
  availableDays: number
}

interface RaceTimeInput {
  distance: number // km
  elevationGain: number // m
  difficulty: number // 1-5
}

interface TrainingZone {
  name: string
  minHeartRate: number
  maxHeartRate: number
  description: string
}

export class TrainingCalculations {
  /**
   * Calcule la capacité d'entraînement d'un utilisateur
   */
  calculateTrainingCapacity(input: TrainingCapacityInput) {
    const { experienceLevel, fitnessLevel, weeklyHours, availableDays } = input

    // Facteurs multiplicateurs
    const experienceMultipliers: Record<string, number> = {
      BEGINNER: 0.7,
      INTERMEDIATE: 1.0,
      ADVANCED: 1.3,
      EXPERT: 1.5,
    }

    const experienceMultiplier = experienceMultipliers[experienceLevel] || 1.0
    const fitnessMultiplier = fitnessLevel / 10
    const timeConstraintMultiplier = Math.min(weeklyHours / 8, 1.5) // Base 8h/semaine
    const frequencyMultiplier = Math.min(availableDays / 5, 1.2) // Base 5 jours

    const baseCapacity = 1.0
    const adjustedCapacity = baseCapacity *
      experienceMultiplier *
      fitnessMultiplier *
      timeConstraintMultiplier *
      frequencyMultiplier

    return {
      score: Math.round(adjustedCapacity * 100) / 100,
      weeklyHours: Math.round(weeklyHours * adjustedCapacity),
      maxSessionsPerWeek: Math.min(availableDays, this.getMaxSessionsForExperience(experienceLevel)),
      recommendedIntensityDistribution: this.getIntensityDistribution(experienceLevel),
      factors: {
        experience: experienceMultiplier,
        fitness: fitnessMultiplier,
        time: timeConstraintMultiplier,
        frequency: frequencyMultiplier,
      },
    }
  }

  /**
   * Estime le temps de course pour une distance donnée
   */
  estimateRaceTime(input: RaceTimeInput): number {
    const { distance, elevationGain, difficulty } = input

    // Vitesse de base en km/h selon la distance
    let baseSpeed = 10 // km/h pour un coureur moyen

    // Ajustement pour la distance (les ultras sont plus lents)
    if (distance > 100) baseSpeed *= 0.6
    else if (distance > 50) baseSpeed *= 0.7
    else if (distance > 25) baseSpeed *= 0.8

    // Ajustement pour le dénivelé (règle: +1min par 100m D+)
    const elevationPenalty = elevationGain / 100 // minutes par km
    const elevationSpeedReduction = (elevationPenalty / 60) // réduction de vitesse en km/h

    // Ajustement pour la difficulté
    const difficultyMultiplier = 1 + (difficulty - 1) * 0.15

    const adjustedSpeed = (baseSpeed - elevationSpeedReduction) / difficultyMultiplier
    const estimatedTime = distance / Math.max(adjustedSpeed, 3) // Minimum 3 km/h

    return Math.round(estimatedTime * 60) // Retour en minutes
  }

  /**
   * Calcule les zones de fréquence cardiaque
   */
  calculateHeartRateZones(age: number, restingHR: number = 60, maxHR?: number): TrainingZone[] {
    const estimatedMaxHR = maxHR || (220 - age)
    const hrReserve = estimatedMaxHR - restingHR

    return [
      {
        name: 'Zone 1 - Récupération active',
        minHeartRate: Math.round(restingHR + hrReserve * 0.5),
        maxHeartRate: Math.round(restingHR + hrReserve * 0.6),
        description: 'Endurance de base, récupération active',
      },
      {
        name: 'Zone 2 - Endurance fondamentale',
        minHeartRate: Math.round(restingHR + hrReserve * 0.6),
        maxHeartRate: Math.round(restingHR + hrReserve * 0.7),
        description: 'Développement de la base aérobie',
      },
      {
        name: 'Zone 3 - Endurance active',
        minHeartRate: Math.round(restingHR + hrReserve * 0.7),
        maxHeartRate: Math.round(restingHR + hrReserve * 0.8),
        description: 'Amélioration de l\'efficacité aérobie',
      },
      {
        name: 'Zone 4 - Seuil lactique',
        minHeartRate: Math.round(restingHR + hrReserve * 0.8),
        maxHeartRate: Math.round(restingHR + hrReserve * 0.9),
        description: 'Puissance aérobie, seuil anaérobie',
      },
      {
        name: 'Zone 5 - Puissance anaérobie',
        minHeartRate: Math.round(restingHR + hrReserve * 0.9),
        maxHeartRate: estimatedMaxHR,
        description: 'Développement de la puissance maximale',
      },
    ]
  }

  /**
   * Calcule l'allure cible selon la VMA
   */
  calculatePaceTargets(vma: number) {
    // VMA en km/h
    const vmaSecondsPerKm = 3600 / vma // secondes par km à VMA

    return {
      vma100: this.formatPace(vmaSecondsPerKm), // 100% VMA
      vma95: this.formatPace(vmaSecondsPerKm * 1.05), // 95% VMA
      vma90: this.formatPace(vmaSecondsPerKm * 1.11), // 90% VMA
      vma85: this.formatPace(vmaSecondsPerKm * 1.18), // 85% VMA
      vma80: this.formatPace(vmaSecondsPerKm * 1.25), // 80% VMA
      vma75: this.formatPace(vmaSecondsPerKm * 1.33), // 75% VMA
      vma70: this.formatPace(vmaSecondsPerKm * 1.43), // 70% VMA
      enduranceBase: this.formatPace(vmaSecondsPerKm * 1.67), // 60% VMA
    }
  }

  /**
   * Calcule la charge d'entraînement (TRIMP)
   */
  calculateTrainingLoad(duration: number, intensity: string): number {
    const intensityFactors: Record<string, number> = {
      VERY_LOW: 1,
      LOW: 2,
      MODERATE: 3,
      HIGH: 4,
      VERY_HIGH: 5,
    }

    const factor = intensityFactors[intensity] || 2
    return Math.round(duration * factor / 60) // Charge en points
  }

  /**
   * Calcule la progression recommandée
   */
  calculateProgression(currentVolume: number, targetVolume: number, weeks: number) {
    const totalIncrease = targetVolume - currentVolume
    const weeklyIncrease = totalIncrease / weeks

    // Règle des 10% maximum d'augmentation par semaine
    const maxWeeklyIncrease = currentVolume * 0.1
    const safeWeeklyIncrease = Math.min(weeklyIncrease, maxWeeklyIncrease)

    const progression = []
    let currentVol = currentVolume

    for (let week = 0; week < weeks; week++) {
      currentVol += safeWeeklyIncrease
      progression.push({
        week: week + 1,
        volume: Math.round(currentVol),
        increasePercent: Math.round((safeWeeklyIncrease / currentVolume) * 100),
      })
    }

    return {
      progression,
      weeklyIncrease: safeWeeklyIncrease,
      totalWeeks: Math.ceil(totalIncrease / safeWeeklyIncrease),
      isSafe: weeklyIncrease <= maxWeeklyIncrease,
    }
  }

  /**
   * Calcule les besoins énergétiques
   */
  calculateEnergyNeeds(weight: number, duration: number, intensity: string) {
    // MET values pour différentes intensités de course
    const metValues: Record<string, number> = {
      VERY_LOW: 6, // Marche rapide
      LOW: 8, // Course légère
      MODERATE: 10, // Course modérée
      HIGH: 12, // Course intense
      VERY_HIGH: 15, // Course très intense
    }

    const met = metValues[intensity] || 8
    const durationHours = duration / 60
    const caloriesBurned = met * weight * durationHours

    return {
      calories: Math.round(caloriesBurned),
      carbohydrates: Math.round(caloriesBurned * 0.6 / 4), // 60% glucides, 4 cal/g
      fats: Math.round(caloriesBurned * 0.3 / 9), // 30% lipides, 9 cal/g
      proteins: Math.round(caloriesBurned * 0.1 / 4), // 10% protéines, 4 cal/g
      hydration: Math.round(durationHours * 500), // 500ml/h base
    }
  }

  /**
   * Analyse de la récupération
   */
  analyzeRecovery(sessions: any[], days: number = 7) {
    if (sessions.length === 0) return { score: 100, recommendations: [] }

    const recentSessions = sessions
      .filter(s => {
        const sessionDate = new Date(s.date)
        const cutoff = new Date()
        cutoff.setDate(cutoff.getDate() - days)
        return sessionDate >= cutoff
      })
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())

    const totalLoad = recentSessions.reduce((sum, s) => {
      return sum + this.calculateTrainingLoad(s.duration || 60, s.intensity)
    }, 0)

    const avgDailyLoad = totalLoad / days
    const lastSessionLoad = recentSessions[0] ?
      this.calculateTrainingLoad(recentSessions[0].duration || 60, recentSessions[0].intensity) : 0

    // Score de récupération (100 = excellent, 0 = épuisé)
    let recoveryScore = 100

    // Pénalités
    if (avgDailyLoad > 20) recoveryScore -= 30 // Charge excessive
    if (lastSessionLoad > 15) recoveryScore -= 20 // Dernière séance intense
    if (recentSessions.length > days) recoveryScore -= 25 // Trop de séances

    // Bonus pour les jours de repos
    const restDays = days - recentSessions.length
    recoveryScore += restDays * 5

    recoveryScore = Math.max(0, Math.min(100, recoveryScore))

    const recommendations = []
    if (recoveryScore < 50) {
      recommendations.push('Réduisez l\'intensité et le volume d\'entraînement')
      recommendations.push('Augmentez le temps de récupération entre les séances')
    } else if (recoveryScore < 70) {
      recommendations.push('Surveillez vos sensations de fatigue')
      recommendations.push('Privilégiez les séances en endurance de base')
    }

    return {
      score: Math.round(recoveryScore),
      totalLoad,
      avgDailyLoad: Math.round(avgDailyLoad),
      recommendations,
    }
  }

  // ============================
  // MÉTHODES PRIVÉES
  // ============================

  private getMaxSessionsForExperience(level: string): number {
    const maxSessions: Record<string, number> = {
      BEGINNER: 4,
      INTERMEDIATE: 5,
      ADVANCED: 6,
      EXPERT: 7,
    }
    return maxSessions[level] || 4
  }

  private getIntensityDistribution(level: string) {
    const distributions: Record<string, Record<string, number>> = {
      BEGINNER: {
        LOW: 0.8,
        MODERATE: 0.15,
        HIGH: 0.05,
        VERY_HIGH: 0,
      },
      INTERMEDIATE: {
        LOW: 0.7,
        MODERATE: 0.2,
        HIGH: 0.08,
        VERY_HIGH: 0.02,
      },
      ADVANCED: {
        LOW: 0.65,
        MODERATE: 0.25,
        HIGH: 0.08,
        VERY_HIGH: 0.02,
      },
      EXPERT: {
        LOW: 0.6,
        MODERATE: 0.25,
        HIGH: 0.1,
        VERY_HIGH: 0.05,
      },
    }

    return distributions[level] || distributions.INTERMEDIATE
  }

  private formatPace(secondsPerKm: number): string {
    const minutes = Math.floor(secondsPerKm / 60)
    const seconds = Math.round(secondsPerKm % 60)
    return `${minutes}:${seconds.toString().padStart(2, '0')}`
  }

  /**
   * Calcule l'indice de difficulté d'une course
   */
  calculateRaceDifficultyIndex(distance: number, elevationGain: number, terrain: string = 'MIXED'): number {
    // Facteur de base selon la distance
    let difficultyIndex = distance * 1.0

    // Ajustement pour le dénivelé (1m D+ ≈ 10m de distance supplémentaire)
    difficultyIndex += elevationGain * 0.01

    // Facteur terrain
    const terrainMultipliers: Record<string, number> = {
      ROAD: 0.8,
      TRAIL: 1.0,
      MOUNTAIN: 1.3,
      TECHNICAL: 1.5,
    }

    difficultyIndex *= terrainMultipliers[terrain] || 1.0

    return Math.round(difficultyIndex * 10) / 10
  }

  /**
   * Recommandations d'équipement selon la course
   */
  getEquipmentRecommendations(distance: number, elevationGain: number, season: string) {
    const recommendations = []

    // Chaussures
    if (elevationGain > distance * 30) {
      recommendations.push('Chaussures de trail avec grip renforcé')
    } else {
      recommendations.push('Chaussures de trail polyvalentes')
    }

    // Hydratation
    if (distance > 50) {
      recommendations.push('Système d\'hydratation avec réservoir + gourdes')
    } else if (distance > 20) {
      recommendations.push('Ceinture porte-bidons ou gilet avec poches')
    }

    // Nutrition
    if (distance > 30) {
      recommendations.push('Gels énergétiques, barres, fruits secs')
    }

    // Vêtements selon saison
    if (season === 'WINTER') {
      recommendations.push('Couches multiples, gants, bonnet')
      recommendations.push('Crampons si conditions glacées')
    } else if (season === 'SUMMER') {
      recommendations.push('Vêtements techniques respirants')
      recommendations.push('Casquette, crème solaire')
    }

    // Sécurité
    if (distance > 40 || elevationGain > 2000) {
      recommendations.push('Lampe frontale + lampe de secours')
      recommendations.push('Couverture de survie')
      recommendations.push('Sifflet de détresse')
    }

    return recommendations
  }

  /**
   * Calcule le temps de récupération recommandé
   */
  calculateRecoveryTime(sessionDuration: number, intensity: string, userLevel: string): number {
    const baseRecovery = sessionDuration * 0.5 // 50% du temps d'effort

    const intensityMultipliers: Record<string, number> = {
      VERY_LOW: 0.5,
      LOW: 0.8,
      MODERATE: 1.0,
      HIGH: 1.5,
      VERY_HIGH: 2.0,
    }

    const levelMultipliers: Record<string, number> = {
      BEGINNER: 1.5,
      INTERMEDIATE: 1.2,
      ADVANCED: 1.0,
      EXPERT: 0.8,
    }

    const adjustedRecovery = baseRecovery *
      (intensityMultipliers[intensity] || 1.0) *
      (levelMultipliers[userLevel] || 1.2)

    return Math.round(adjustedRecovery)
  }
}

// Instance singleton
export const trainingCalculations = new TrainingCalculations()