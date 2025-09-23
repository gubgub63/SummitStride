/**
 * Hook React pour la gestion des plans d'entraînement
 * Phase 5.1 - Intégration frontend-backend
 */

import { useState, useEffect, useCallback } from 'react'
import { TrainingPlan, TrainingSession } from '@coach-ia-hugo/shared'
import trainingService from '../services/trainingService'

interface UseTrainingPlansReturn {
  plans: TrainingPlan[]
  loading: boolean
  error: string | null
  refreshPlans: () => Promise<void>
  createPlan: (data: any) => Promise<TrainingPlan>
  generatePlan: (data: any) => Promise<any>
  deletePlan: (id: string) => Promise<void>
}

interface UseTrainingSessionsReturn {
  sessions: TrainingSession[]
  loading: boolean
  error: string | null
  refreshSessions: () => Promise<void>
  createSession: (data: any) => Promise<TrainingSession>
  updateSession: (id: string, data: any) => Promise<TrainingSession>
  completeSession: (id: string, completionData?: any) => Promise<TrainingSession>
}

interface UseTrainingStatsReturn {
  stats: {
    activePlans: number
    weeklySessionsCompleted: number
    weeklySessionsTotal: number
    monthlyDistance: number
    nextSession?: TrainingSession
    recentActivity: TrainingSession[]
  } | null
  loading: boolean
  error: string | null
  refreshStats: () => Promise<void>
}

/**
 * Hook pour gérer les plans d'entraînement
 */
export function useTrainingPlans(): UseTrainingPlansReturn {
  const [plans, setPlans] = useState<TrainingPlan[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const refreshPlans = useCallback(async () => {
    setLoading(true)
    setError(null)

    try {
      const data = await trainingService.getTrainingPlans()
      setPlans(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors de la récupération des plans')
    } finally {
      setLoading(false)
    }
  }, [])

  const createPlan = useCallback(async (data: any): Promise<TrainingPlan> => {
    setError(null)

    try {
      const newPlan = await trainingService.createTrainingPlan(data)
      setPlans(prev => [newPlan, ...prev])
      return newPlan
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erreur lors de la création du plan'
      setError(errorMessage)
      throw new Error(errorMessage)
    }
  }, [])

  const generatePlan = useCallback(async (data: any) => {
    setError(null)

    try {
      const result = await trainingService.generateTrainingPlan(data)
      setPlans(prev => [result.plan, ...prev])
      return result
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erreur lors de la génération du plan'
      setError(errorMessage)
      throw new Error(errorMessage)
    }
  }, [])

  const deletePlan = useCallback(async (id: string): Promise<void> => {
    setError(null)

    try {
      await trainingService.deleteTrainingPlan(id)
      setPlans(prev => prev.filter(plan => plan.id !== id))
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erreur lors de la suppression du plan'
      setError(errorMessage)
      throw new Error(errorMessage)
    }
  }, [])

  useEffect(() => {
    refreshPlans()
  }, [refreshPlans])

  return {
    plans,
    loading,
    error,
    refreshPlans,
    createPlan,
    generatePlan,
    deletePlan,
  }
}

/**
 * Hook pour gérer les séances d'entraînement
 */
export function useTrainingSessions(filters?: {
  planId?: string
  completed?: boolean
  startDate?: string
  endDate?: string
  limit?: number
}): UseTrainingSessionsReturn {
  const [sessions, setSessions] = useState<TrainingSession[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const refreshSessions = useCallback(async () => {
    setLoading(true)
    setError(null)

    try {
      const data = await trainingService.getTrainingSessions(filters)
      setSessions(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors de la récupération des séances')
    } finally {
      setLoading(false)
    }
  }, [filters])

  const createSession = useCallback(async (data: any): Promise<TrainingSession> => {
    setError(null)

    try {
      const newSession = await trainingService.createTrainingSession(data)
      setSessions(prev => [newSession, ...prev])
      return newSession
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erreur lors de la création de la séance'
      setError(errorMessage)
      throw new Error(errorMessage)
    }
  }, [])

  const updateSession = useCallback(async (id: string, data: any): Promise<TrainingSession> => {
    setError(null)

    try {
      const updatedSession = await trainingService.updateTrainingSession(id, data)
      setSessions(prev => prev.map(session =>
        session.id === id ? updatedSession : session
      ))
      return updatedSession
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erreur lors de la mise à jour de la séance'
      setError(errorMessage)
      throw new Error(errorMessage)
    }
  }, [])

  const completeSession = useCallback(async (id: string, completionData?: any): Promise<TrainingSession> => {
    setError(null)

    try {
      const completedSession = await trainingService.completeTrainingSession(id, completionData || {})
      setSessions(prev => prev.map(session =>
        session.id === id ? completedSession : session
      ))
      return completedSession
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erreur lors de la validation de la séance'
      setError(errorMessage)
      throw new Error(errorMessage)
    }
  }, [])

  useEffect(() => {
    refreshSessions()
  }, [refreshSessions])

  return {
    sessions,
    loading,
    error,
    refreshSessions,
    createSession,
    updateSession,
    completeSession,
  }
}

/**
 * Hook pour les statistiques d'entraînement
 */
export function useTrainingStats(period: 'week' | 'month' | '3months' = 'month'): UseTrainingStatsReturn {
  const [stats, setStats] = useState<any>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const refreshStats = useCallback(async () => {
    setLoading(true)
    setError(null)

    try {
      const data = await trainingService.getTrainingStats(period)
      setStats(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors de la récupération des statistiques')
    } finally {
      setLoading(false)
    }
  }, [period])

  useEffect(() => {
    refreshStats()
  }, [refreshStats])

  return {
    stats,
    loading,
    error,
    refreshStats,
  }
}

/**
 * Hook pour une seule séance d'entraînement
 */
export function useTrainingSession(id: string) {
  const [session, setSession] = useState<TrainingSession | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const refreshSession = useCallback(async () => {
    if (!id) return

    setLoading(true)
    setError(null)

    try {
      // Récupérer via les séances avec filtre (pas d'endpoint GET single session pour l'instant)
      const sessions = await trainingService.getTrainingSessions({ limit: 1 })
      const foundSession = sessions.find(s => s.id === id)
      setSession(foundSession || null)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors de la récupération de la séance')
    } finally {
      setLoading(false)
    }
  }, [id])

  useEffect(() => {
    refreshSession()
  }, [refreshSession])

  return {
    session,
    loading,
    error,
    refreshSession,
  }
}

/**
 * Hook pour un seul plan d'entraînement
 */
export function useTrainingPlan(id: string) {
  const [plan, setPlan] = useState<TrainingPlan | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const refreshPlan = useCallback(async () => {
    if (!id) return

    setLoading(true)
    setError(null)

    try {
      const data = await trainingService.getTrainingPlan(id)
      setPlan(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors de la récupération du plan')
    } finally {
      setLoading(false)
    }
  }, [id])

  const updatePlan = useCallback(async (data: any): Promise<TrainingPlan> => {
    if (!id) throw new Error('ID du plan requis')

    setError(null)

    try {
      const updatedPlan = await trainingService.updateTrainingPlan(id, data)
      setPlan(updatedPlan)
      return updatedPlan
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erreur lors de la mise à jour du plan'
      setError(errorMessage)
      throw new Error(errorMessage)
    }
  }, [id])

  const analyzePlan = useCallback(async () => {
    if (!id) throw new Error('ID du plan requis')

    try {
      const analysis = await trainingService.analyzeTrainingPlan(id)
      return analysis
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erreur lors de l\'analyse du plan'
      setError(errorMessage)
      throw new Error(errorMessage)
    }
  }, [id])

  useEffect(() => {
    refreshPlan()
  }, [refreshPlan])

  return {
    plan,
    loading,
    error,
    refreshPlan,
    updatePlan,
    analyzePlan,
  }
}

/**
 * Hook pour les séances de la semaine courante
 */
export function useCurrentWeekSessions(planId?: string) {
  const [sessions, setSessions] = useState<TrainingSession[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const refreshWeekSessions = useCallback(async () => {
    setLoading(true)
    setError(null)

    try {
      const data = await trainingService.getCurrentWeekSessions(planId)
      setSessions(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors de la récupération des séances de la semaine')
    } finally {
      setLoading(false)
    }
  }, [planId])

  useEffect(() => {
    refreshWeekSessions()
  }, [refreshWeekSessions])

  return {
    sessions,
    loading,
    error,
    refreshWeekSessions,
  }
}