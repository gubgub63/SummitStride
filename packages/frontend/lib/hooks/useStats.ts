/**
 * Hook de Statistiques Utilisateur - SummitStride
 * Récupère les statistiques d'entraînement en s'appuyant sur l'intégration Strava.
 */

import { useEffect, useState } from 'react'
import stravaService, { StravaActivity, StravaStatus } from '../services/stravaService'

interface StatsCacheData {
  stats: UserStats | null
  progress: ProgressData[]
  recentActivities: RecentActivity[]
  upcomingActivities: UpcomingActivity[]
  needsStravaConnection: boolean
  stravaStatus: StravaStatus | null
}

interface StatsCache {
  timestamp: number
  data: StatsCacheData
}

let statsCache: StatsCache | null = null

export interface UserStats {
  totalSessions: number
  totalDistance: number // en kilomètres
  totalDuration: number // en minutes
  completedRaces: number
  upcomingRaces: number
  currentWeekDistance: number
  currentWeekDuration: number
  averagePace: number // minutes par km
  lastActivityDate: Date | null
}

export interface ProgressData {
  week: string
  distance: number
  duration: number // en minutes
  sessions: number
}

export interface RecentActivity {
  id: string
  date: Date
  type: 'run' | 'bike' | 'strength' | 'cross-training'
  name: string
  distance?: number
  duration: number // en minutes
  intensity: 'low' | 'moderate' | 'high' | 'very-high'
  completed: boolean
}

export interface UpcomingActivity {
  id: string
  date: Date
  type: 'run' | 'bike' | 'strength' | 'cross-training'
  name: string
  plannedDistance?: number
  plannedDuration: number // en minutes
  intensity: 'low' | 'moderate' | 'high' | 'very-high'
}

export function useStats() {
  const [stats, setStats] = useState<UserStats | null>(null)
  const [progress, setProgress] = useState<ProgressData[]>([])
  const [recentActivities, setRecentActivities] = useState<RecentActivity[]>([])
  const [upcomingActivities, setUpcomingActivities] = useState<UpcomingActivity[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [needsStravaConnection, setNeedsStravaConnection] = useState(false)
  const [stravaStatus, setStravaStatus] = useState<StravaStatus | null>(null)

  useEffect(() => {
    loadStats(false)

    const refreshListener = () => {
      statsCache = null
      loadStats(true).catch(err => console.error('Erreur refresh stats:', err))
    }

    if (typeof window !== 'undefined') {
      window.addEventListener('summitstride-stats-refresh', refreshListener)
    }

    return () => {
      if (typeof window !== 'undefined') {
        window.removeEventListener('summitstride-stats-refresh', refreshListener)
      }
    }
  }, [])

  const loadStats = async (force = false) => {
    try {
      setLoading(true)
      setError(null)
      setNeedsStravaConnection(false)

      if (!force && statsCache && Date.now() - statsCache.timestamp < 60_000) {
        const cached = statsCache.data
        setStats(cached.stats)
        setProgress(cached.progress)
        setRecentActivities(cached.recentActivities)
        setUpcomingActivities(cached.upcomingActivities)
        setNeedsStravaConnection(cached.needsStravaConnection)
        setStravaStatus(cached.stravaStatus)
        return
      }

      const status = await stravaService.getStatus()
      setStravaStatus(status)

      if (!status.connected) {
        const data: StatsCacheData = {
          stats: null,
          progress: [],
          recentActivities: [],
          upcomingActivities: [],
          needsStravaConnection: true,
          stravaStatus: status,
        }

        statsCache = {
          timestamp: Date.now(),
          data,
        }

        setStats(null)
        setProgress([])
        setRecentActivities([])
        setUpcomingActivities([])
        setNeedsStravaConnection(true)
        return
      }

      const activitiesResponse = await stravaService.getActivities({ perPage: 200, afterDays: 180 })
      const mappedActivities = mapStravaActivities(activitiesResponse.activities)

  const computedStats = computeStatsFromActivities(mappedActivities)
  const computedProgress = computeProgressFromActivities(mappedActivities)

      const data: StatsCacheData = {
        stats: computedStats,
        progress: computedProgress,
        recentActivities: mappedActivities.slice(0, 20),
        upcomingActivities: [],
        needsStravaConnection: false,
        stravaStatus: status,
      }

      statsCache = {
        timestamp: Date.now(),
        data,
      }

      setStats(computedStats)
      setProgress(computedProgress)
      setRecentActivities(mappedActivities.slice(0, 20))
      setUpcomingActivities([])
      setNeedsStravaConnection(false)
    } catch (error) {
      console.error('Erreur lors du chargement des statistiques:', error)
      setError('Impossible de charger les statistiques')
    } finally {
      setLoading(false)
    }
  }

  const refreshStats = async () => {
    statsCache = null
    await loadStats(true)
  }

  // Fonctions utilitaires pour formatter les données
  const formatDuration = (minutes: number): string => {
    const hours = Math.floor(minutes / 60)
    const mins = minutes % 60
    if (hours > 0) {
      return `${hours}h${mins > 0 ? mins.toString().padStart(2, '0') : ''}`
    }
    return `${mins}min`
  }

  const formatPace = (paceMinPerKm: number): string => {
    const minutes = Math.floor(paceMinPerKm)
    const seconds = Math.round((paceMinPerKm - minutes) * 60)
    return `${minutes}:${seconds.toString().padStart(2, '0')}/km`
  }

  const formatDistance = (km: number): string => {
    return `${km.toFixed(1)} km`
  }

  const getActivityTypeLabel = (type: RecentActivity['type'] | UpcomingActivity['type']): string => {
    const labels = {
      run: 'Course',
      bike: 'Vélo',
      strength: 'Renforcement',
      'cross-training': 'Entraînement croisé'
    }
    return labels[type] || type
  }

  const getIntensityLabel = (intensity: RecentActivity['intensity']): string => {
    const labels = {
      low: 'Faible',
      moderate: 'Modérée',
      high: 'Élevée',
      'very-high': 'Très élevée'
    }
    return labels[intensity] || intensity
  }

  const getIntensityColor = (intensity: RecentActivity['intensity']): string => {
    const colors = {
      low: 'text-green-600',
      moderate: 'text-blue-600',
      high: 'text-orange-600',
      'very-high': 'text-red-600'
    }
    return colors[intensity] || 'text-gray-600'
  }

  return {
    stats,
    progress,
    recentActivities,
    upcomingActivities,
    loading,
    error,
    needsStravaConnection,
    stravaStatus,
    refreshStats,
    // Utilities
    formatDuration,
    formatPace,
    formatDistance,
    getActivityTypeLabel,
    getIntensityLabel,
    getIntensityColor
  }
}

function mapStravaActivities(activities: StravaActivity[]): RecentActivity[] {
  return activities
    .map(activity => {
      const distanceKm = activity.distance ? activity.distance / 1000 : 0
      const movingMinutes = activity.moving_time ? Math.round(activity.moving_time / 60) : 0
      const intensity = determineIntensity(activity, distanceKm, movingMinutes)
      const type = normalizeActivityType(activity)
      const startDate = new Date(activity.start_date_local || activity.start_date)

      return {
        id: String(activity.id),
        date: startDate,
        type,
        name: activity.name,
        distance: distanceKm > 0 ? distanceKm : undefined,
        duration: movingMinutes,
        intensity,
        completed: true,
      } as RecentActivity
    })
    .sort((a, b) => b.date.getTime() - a.date.getTime())
}

function normalizeActivityType(activity: StravaActivity): RecentActivity['type'] {
  const sportType = (activity.sport_type || activity.type || '').toLowerCase()

  if (sportType.includes('run')) {
    return 'run'
  }

  if (sportType.includes('ride') || sportType.includes('bike')) {
    return 'bike'
  }

  if (sportType.includes('strength') || sportType.includes('workout')) {
    return 'strength'
  }

  return 'cross-training'
}

function determineIntensity(
  activity: StravaActivity,
  distanceKm: number,
  movingMinutes: number
): RecentActivity['intensity'] {
  if (typeof activity.suffer_score === 'number') {
    if (activity.suffer_score < 20) return 'low'
    if (activity.suffer_score < 40) return 'moderate'
    if (activity.suffer_score < 60) return 'high'
    return 'very-high'
  }

  if (distanceKm <= 0 || movingMinutes <= 0) {
    return 'moderate'
  }

  const pace = movingMinutes / distanceKm

  if (pace <= 4) return 'very-high'
  if (pace <= 5) return 'high'
  if (pace <= 6.5) return 'moderate'
  return 'low'
}

function computeStatsFromActivities(activities: RecentActivity[]): UserStats {
  const totalSessions = activities.length
  const totalDistance = activities.reduce((acc, activity) => acc + (activity.distance || 0), 0)
  const totalDuration = activities.reduce((acc, activity) => acc + activity.duration, 0)

  const completedRaces = activities.filter(activity => activity.type === 'run' && activity.intensity === 'very-high').length

  const currentWeekStart = startOfWeek(new Date())
  let currentWeekDistance = 0
  let currentWeekDuration = 0
  let lastActivityDate: Date | null = null

  activities.forEach(activity => {
    if (!lastActivityDate || activity.date > lastActivityDate) {
      lastActivityDate = activity.date
    }

    if (activity.date >= currentWeekStart) {
      currentWeekDistance += activity.distance || 0
      currentWeekDuration += activity.duration
    }
  })

  const averagePace = totalDistance > 0 ? totalDuration / totalDistance : 0

  return {
    totalSessions,
    totalDistance: Number.parseFloat(totalDistance.toFixed(1)),
    totalDuration,
    completedRaces,
    upcomingRaces: 0,
    currentWeekDistance: Number.parseFloat(currentWeekDistance.toFixed(1)),
    currentWeekDuration,
    averagePace,
    lastActivityDate,
  }
}

function computeProgressFromActivities(activities: RecentActivity[]): ProgressData[] {
  const weeklyMap = new Map<string, { distance: number; duration: number; sessions: number; start: Date }>()

  activities.forEach(activity => {
    const start = startOfWeek(activity.date)
    const key = start.toISOString()
    const current = weeklyMap.get(key) ?? { distance: 0, duration: 0, sessions: 0, start }

    current.distance += activity.distance || 0
    current.duration += activity.duration
    current.sessions += 1

    weeklyMap.set(key, current)
  })

  const sortedWeeks = Array.from(weeklyMap.values()).sort((a, b) => a.start.getTime() - b.start.getTime())

  const weeksWithLabels = sortedWeeks.map((week, index) => {
    const isLast = index === sortedWeeks.length - 1
    const label = isLast ? 'Cette semaine' : `S-${sortedWeeks.length - 1 - index}`

    return {
      week: label,
      distance: Number.parseFloat(week.distance.toFixed(1)),
      duration: Math.round(week.duration),
      sessions: week.sessions,
    }
  })

  return weeksWithLabels
}

function startOfWeek(date: Date): Date {
  const d = new Date(date)
  const day = d.getDay()
  const diff = day === 0 ? -6 : 1 - day
  d.setDate(d.getDate() + diff)
  d.setHours(0, 0, 0, 0)
  return d
}
