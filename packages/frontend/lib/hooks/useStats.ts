/**
 * Hook de Statistiques Utilisateur - Coach IA Hugo
 * Hook pour gérer les statistiques d'entraînement et de progression
 *
 * TODO: Replace with real API when backend statistics endpoints are available
 * Currently using mocked data for development
 */

import { useState, useEffect } from 'react'

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

// TODO: Replace with real API data
const MOCK_STATS: UserStats = {
  totalSessions: 127,
  totalDistance: 1254.8,
  totalDuration: 7890, // 131.5 heures
  completedRaces: 5,
  upcomingRaces: 2,
  currentWeekDistance: 45.2,
  currentWeekDuration: 280, // 4h40
  averagePace: 5.8, // 5:48 min/km
  lastActivityDate: new Date('2024-01-15T08:30:00')
}

// TODO: Replace with real API data
const MOCK_PROGRESS: ProgressData[] = [
  { week: 'S-11', distance: 32.5, duration: 240, sessions: 4 },
  { week: 'S-10', distance: 38.2, duration: 280, sessions: 5 },
  { week: 'S-9', distance: 35.1, duration: 260, sessions: 4 },
  { week: 'S-8', distance: 42.3, duration: 310, sessions: 5 },
  { week: 'S-7', distance: 39.8, duration: 295, sessions: 4 },
  { week: 'S-6', distance: 45.2, duration: 340, sessions: 6 },
  { week: 'S-5', distance: 41.7, duration: 315, sessions: 5 },
  { week: 'S-4', distance: 48.9, duration: 365, sessions: 6 },
  { week: 'S-3', distance: 46.3, duration: 350, sessions: 5 },
  { week: 'S-2', distance: 52.1, duration: 390, sessions: 6 },
  { week: 'S-1', distance: 49.7, duration: 375, sessions: 5 },
  { week: 'Cette semaine', distance: 45.2, duration: 280, sessions: 4 }
]

// TODO: Replace with real API data
const MOCK_RECENT_ACTIVITIES: RecentActivity[] = [
  {
    id: '1',
    date: new Date('2024-01-15T08:30:00'),
    type: 'run',
    name: 'Course longue matinale',
    distance: 18.5,
    duration: 105,
    intensity: 'moderate',
    completed: true
  },
  {
    id: '2',
    date: new Date('2024-01-13T18:00:00'),
    type: 'run',
    name: 'Fractionné 5x1000m',
    distance: 8.2,
    duration: 45,
    intensity: 'high',
    completed: true
  },
  {
    id: '3',
    date: new Date('2024-01-11T07:15:00'),
    type: 'run',
    name: 'Récupération active',
    distance: 6.5,
    duration: 40,
    intensity: 'low',
    completed: true
  },
  {
    id: '4',
    date: new Date('2024-01-09T19:30:00'),
    type: 'strength',
    name: 'Renforcement musculaire',
    duration: 60,
    intensity: 'moderate',
    completed: true
  },
  {
    id: '5',
    date: new Date('2024-01-07T09:00:00'),
    type: 'run',
    name: 'Tempo run',
    distance: 12.8,
    duration: 72,
    intensity: 'high',
    completed: true
  }
]

// TODO: Replace with real API data
const MOCK_UPCOMING_ACTIVITIES: UpcomingActivity[] = [
  {
    id: 'up1',
    date: new Date('2024-01-17T08:00:00'),
    type: 'run',
    name: 'Sortie longue',
    plannedDistance: 22,
    plannedDuration: 130,
    intensity: 'moderate'
  },
  {
    id: 'up2',
    date: new Date('2024-01-19T18:30:00'),
    type: 'run',
    name: 'Interval training',
    plannedDistance: 10,
    plannedDuration: 55,
    intensity: 'very-high'
  },
  {
    id: 'up3',
    date: new Date('2024-01-21T12:00:00'),
    type: 'cross-training',
    name: 'Vélo de route',
    plannedDistance: 40,
    plannedDuration: 120,
    intensity: 'moderate'
  }
]

export function useStats() {
  const [stats, setStats] = useState<UserStats | null>(null)
  const [progress, setProgress] = useState<ProgressData[]>([])
  const [recentActivities, setRecentActivities] = useState<RecentActivity[]>([])
  const [upcomingActivities, setUpcomingActivities] = useState<UpcomingActivity[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    loadStats()
  }, [])

  const loadStats = async () => {
    try {
      setLoading(true)
      setError(null)

      // TODO: Replace with real API calls when available
      // const [statsRes, progressRes, recentRes, upcomingRes] = await Promise.all([
      //   apiClient.get('/user/stats'),
      //   apiClient.get('/user/progress?period=12weeks'),
      //   apiClient.get('/training-sessions?limit=5&completed=true'),
      //   apiClient.get('/training-sessions?limit=3&upcoming=true')
      // ])

      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 800))

      setStats(MOCK_STATS)
      setProgress(MOCK_PROGRESS)
      setRecentActivities(MOCK_RECENT_ACTIVITIES)
      setUpcomingActivities(MOCK_UPCOMING_ACTIVITIES)
    } catch (error) {
      console.error('Erreur lors du chargement des statistiques:', error)
      setError('Impossible de charger les statistiques')
    } finally {
      setLoading(false)
    }
  }

  const refreshStats = async () => {
    await loadStats()
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