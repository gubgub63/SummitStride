import { Intensity, PlanPhase, TrainingType, WeeklyPlanProgress, TrainingPlanProgress } from '@coach-ia-hugo/shared'

type SessionLike = {
  duration?: number | null
  distance?: number | null
  intensity: Intensity
  type: TrainingType
  weekNumber?: number | null
  phase?: PlanPhase | null
  plannedLoad?: number | null
}

type DetailedSessionLike = SessionLike & {
  dayOfWeek?: number | null
}

const INTENSITY_FACTORS: Record<Intensity, number> = {
  [Intensity.VERY_LOW]: 1,
  [Intensity.LOW]: 2,
  [Intensity.MODERATE]: 3,
  [Intensity.HIGH]: 4,
  [Intensity.VERY_HIGH]: 5,
}

const TYPE_MULTIPLIERS: Record<TrainingType, number> = {
  [TrainingType.ENDURANCE]: 1,
  [TrainingType.THRESHOLD]: 1.1,
  [TrainingType.INTERVAL]: 1.2,
  [TrainingType.RECOVERY]: 0.6,
  [TrainingType.STRENGTH]: 0.8,
  [TrainingType.CROSS_TRAINING]: 0.9,
}

const MIN_SESSION_DURATION = 0

function coerceWeekNumber(session: SessionLike, index: number): number {
  if (session.weekNumber && session.weekNumber > 0) {
    return session.weekNumber
  }

  // Default: four sessions per week fallback
  return Math.floor(index / 4) + 1
}

export const TrainingPlanAnalytics = {
  estimateSessionLoad(session: SessionLike): number {
    const duration = Math.max(session.duration ?? MIN_SESSION_DURATION, 0)
    if (!duration) return 0

    const intensityFactor = INTENSITY_FACTORS[session.intensity] ?? 1
    const typeFactor = TYPE_MULTIPLIERS[session.type] ?? 1

    return Math.max(Math.round((duration * intensityFactor * typeFactor) / 60), 0)
  },

  summarizeSessions(sessions: DetailedSessionLike[]): TrainingPlanProgress {
    let totalDuration = 0
    let totalDistance = 0
    let totalLoad = 0

    const weeklyMap = new Map<number, {
      totalDuration: number
      totalDistance: number
      loadScore: number
      sessionCount: number
      phase?: PlanPhase
    }>()

    sessions.forEach((session, index) => {
      const duration = Math.max(session.duration ?? 0, 0)
      const distance = Math.max(session.distance ?? 0, 0)
      const load = session.plannedLoad ?? this.estimateSessionLoad(session)
      const weekNumber = coerceWeekNumber(session, index)

      totalDuration += duration
      totalDistance += distance
      totalLoad += load

      const existing = weeklyMap.get(weekNumber) ?? {
        totalDuration: 0,
        totalDistance: 0,
        loadScore: 0,
        sessionCount: 0,
        phase: session.phase ?? undefined,
      }

      existing.totalDuration += duration
      existing.totalDistance += distance
      existing.loadScore += load
      existing.sessionCount += 1
      if (!existing.phase && session.phase) {
        existing.phase = session.phase
      }

      weeklyMap.set(weekNumber, existing)
    })

    const weekly: WeeklyPlanProgress[] = Array.from(weeklyMap.entries())
      .sort(([weekA], [weekB]) => weekA - weekB)
      .map(([weekNumber, values]) => ({
        weekNumber,
        phase: values.phase,
        totalDuration: Math.round(values.totalDuration),
        totalDistance: Math.round(values.totalDistance * 10) / 10,
        loadScore: Math.round(values.loadScore),
        sessionCount: values.sessionCount,
      }))

    return {
      totalDuration: Math.round(totalDuration),
      totalDistance: Math.round(totalDistance * 10) / 10,
      loadScore: Math.round(totalLoad),
      weekly,
    }
  },
}

export type TrainingPlanAnalyticsType = typeof TrainingPlanAnalytics
