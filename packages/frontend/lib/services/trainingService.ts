/**
 * Service de gestion des plans d'entraînement
 * Phase 5.1 - Intégration frontend-backend
 */

import {
  TrainingPlan,
  TrainingPlanProgress,
  TrainingPlanTemplate,
  TrainingPlanStatus,
  TrainingSession,
  TrainingType,
  Intensity,
  PlanPhase,
} from '@summitstride/shared'

interface GeneratePlanRequest {
  targetRaceId: string
  startDate: string
  endDate: string
  preferences?: {
    sessionsPerWeek?: number
    preferredDays?: number[]
    maxSessionDuration?: number
    includeStrength?: boolean
    includeCrossTraining?: boolean
  }
}

interface CreatePlanRequest {
  name: string
  description?: string
  startDate: string
  endDate: string
  targetRaceId?: string
}

interface CreateSessionRequest {
  planId?: string
  date: string
  type: TrainingType
  name: string
  description?: string
  duration?: number
  distance?: number
  intensity: Intensity
}

interface TrainingPlanAnalysis {
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
  adaptationLevel: 'conservative' | 'moderate' | 'aggressive'
  recoveryRatio: number
  injuryRisk: 'low' | 'medium' | 'high'
  totals: TrainingPlanProgress
  weeklyProgression: TrainingPlanProgress['weekly']
}

interface CreateTemplateRequest {
  name: string
  description?: string
  targetCategory: string
  targetExperience?: string
  durationWeeks: number
  sessions: Array<{
    phase: PlanPhase
    weekOffset: number
    dayOfWeek: number
    type: TrainingType
    intensity: Intensity
    duration?: number
    distance?: number
    description?: string
    focusAreas?: string[]
  }>
}

type UpdateTemplateRequest = Partial<CreateTemplateRequest>

interface ApiResponse<T> {
  success: boolean
  data?: T
  error?: string
  message?: string
  details?: any
}

class TrainingService {
  private baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api'

  private async makeRequest<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    const token = this.getAuthToken()

    const config: RequestInit = {
      headers: {
        'Content-Type': 'application/json',
        ...(token && { Authorization: `Bearer ${token}` }),
        ...options.headers,
      },
      ...options,
    }

    try {
      const response = await fetch(`${this.baseUrl}${endpoint}`, config)
      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || `HTTP error! status: ${response.status}`)
      }

      return data
    } catch (error) {
      console.error('Training API Error:', error)
      throw error
    }
  }

  private getAuthToken(): string | null {
    if (typeof window === 'undefined') return null
    return localStorage.getItem('auth_token')
  }

  isAuthenticated(): boolean {
    return Boolean(this.getAuthToken())
  }

  // ============================
  // TRAINING PLANS
  // ============================

  /**
   * Récupère la liste des plans d'entraînement
   */
  async getTrainingPlans(): Promise<TrainingPlan[]> {
    const response = await this.makeRequest<TrainingPlan[]>('/training-plans')
    return response.data || []
  }

  /**
   * Récupère un plan d'entraînement par ID
   */
  async getTrainingPlan(id: string): Promise<TrainingPlan | null> {
    try {
      const response = await this.makeRequest<TrainingPlan>(`/training-plans/${id}`)
      return response.data || null
    } catch (error) {
      if (error instanceof Error && error.message.includes('404')) {
        return null
      }
      throw error
    }
  }

  /**
   * Crée un nouveau plan d'entraînement
   */
  async createTrainingPlan(data: CreatePlanRequest): Promise<TrainingPlan> {
    const response = await this.makeRequest<TrainingPlan>('/training-plans', {
      method: 'POST',
      body: JSON.stringify(data),
    })

    if (!response.data) {
      throw new Error('Erreur lors de la création du plan')
    }

    return response.data
  }

  /**
   * Met à jour un plan d'entraînement
   */
  async updateTrainingPlan(id: string, data: Partial<CreatePlanRequest>): Promise<TrainingPlan> {
    const response = await this.makeRequest<TrainingPlan>(`/training-plans/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    })

    if (!response.data) {
      throw new Error('Erreur lors de la mise à jour du plan')
    }

    return response.data
  }

  /**
   * Supprime un plan d'entraînement
   */
  async deleteTrainingPlan(id: string): Promise<void> {
    await this.makeRequest(`/training-plans/${id}`, {
      method: 'DELETE',
    })
  }

  /**
   * Génère automatiquement un plan d'entraînement
   */
  async generateTrainingPlan(data: GeneratePlanRequest): Promise<{
    plan: TrainingPlan
    sessions: TrainingSession[]
    analysis: TrainingPlanAnalysis
  }> {
    const response = await this.makeRequest<{
      plan: TrainingPlan
      sessions: TrainingSession[]
      analysis: TrainingPlanAnalysis
    }>('/training-plans/generate', {
      method: 'POST',
      body: JSON.stringify(data),
    })

    if (!response.data) {
      throw new Error('Erreur lors de la génération du plan')
    }

    return response.data
  }

  /**
   * Analyse un plan d'entraînement
   */
  async analyzeTrainingPlan(id: string): Promise<TrainingPlanAnalysis> {
    const response = await this.makeRequest<TrainingPlanAnalysis>(`/training-plans/${id}/analysis`)

    if (!response.data) {
      throw new Error('Erreur lors de l\'analyse du plan')
    }

    return response.data
  }

  /**
   * Récupère la progression agrégée d'un plan
   */
  async getTrainingPlanProgression(id: string): Promise<TrainingPlanProgress> {
    const response = await this.makeRequest<TrainingPlanProgress>(`/training-plans/${id}/progression`)

    if (!response.data) {
      throw new Error('Erreur lors du calcul de la progression')
    }

    return response.data
  }

  /**
   * Met à jour le statut d'un plan
   */
  async updateTrainingPlanStatus(id: string, status: TrainingPlanStatus): Promise<TrainingPlan> {
    const response = await this.makeRequest<TrainingPlan>(`/training-plans/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status }),
    })

    if (!response.data) {
      throw new Error('Erreur lors de la mise à jour du statut du plan')
    }

    return response.data
  }

  // ============================
  // TRAINING SESSIONS
  // ============================

  /**
   * Récupère la liste des séances d'entraînement
   */
  async getTrainingSessions(filters?: {
    planId?: string
    completed?: boolean
    startDate?: string
    endDate?: string
    limit?: number
  }): Promise<TrainingSession[]> {
    const params = new URLSearchParams()

    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined) {
          params.append(key, value.toString())
        }
      })
    }

    const endpoint = params.toString() ? `/training-sessions?${params}` : '/training-sessions'
    const response = await this.makeRequest<TrainingSession[]>(endpoint)

    return response.data || []
  }

  /**
   * Crée une nouvelle séance d'entraînement
   */
  async createTrainingSession(data: CreateSessionRequest): Promise<TrainingSession> {
    const response = await this.makeRequest<TrainingSession>('/training-sessions', {
      method: 'POST',
      body: JSON.stringify(data),
    })

    if (!response.data) {
      throw new Error('Erreur lors de la création de la séance')
    }

    return response.data
  }

  /**
   * Met à jour une séance d'entraînement
   */
  async updateTrainingSession(id: string, data: Partial<CreateSessionRequest>): Promise<TrainingSession> {
    const response = await this.makeRequest<TrainingSession>(`/training-sessions/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    })

    if (!response.data) {
      throw new Error('Erreur lors de la mise à jour de la séance')
    }

    return response.data
  }

  /**
   * Marque une séance comme complétée
   */
  async completeTrainingSession(
    id: string,
    completionData: {
      actualDuration?: number
      actualDistance?: number
      averageHeartRate?: number
      maxHeartRate?: number
      calories?: number
      elevationGain?: number
      averagePace?: number
      perceivedExertion?: number
    }
  ): Promise<TrainingSession> {
    const response = await this.makeRequest<TrainingSession>(`/training-sessions/${id}`, {
      method: 'PUT',
      body: JSON.stringify({
        completed: true,
        ...completionData,
      }),
    })

    if (!response.data) {
      throw new Error('Erreur lors de la validation de la séance')
    }

    return response.data
  }

  // ============================
  // PLAN TEMPLATES
  // ============================

  async listTrainingPlanTemplates(): Promise<TrainingPlanTemplate[]> {
    const response = await this.makeRequest<TrainingPlanTemplate[]>('/training-plan-templates')
    return response.data || []
  }

  async getTrainingPlanTemplate(id: string): Promise<TrainingPlanTemplate | null> {
    try {
      const response = await this.makeRequest<TrainingPlanTemplate>(`/training-plan-templates/${id}`)
      return response.data || null
    } catch (error) {
      if (error instanceof Error && error.message.includes('404')) {
        return null
      }
      throw error
    }
  }

  async createTrainingPlanTemplate(data: CreateTemplateRequest): Promise<TrainingPlanTemplate> {
    const response = await this.makeRequest<TrainingPlanTemplate>('/training-plan-templates', {
      method: 'POST',
      body: JSON.stringify(data),
    })

    if (!response.data) {
      throw new Error('Erreur lors de la création du template')
    }

    return response.data
  }

  async updateTrainingPlanTemplate(id: string, data: UpdateTemplateRequest): Promise<TrainingPlanTemplate> {
    const response = await this.makeRequest<TrainingPlanTemplate>(`/training-plan-templates/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    })

    if (!response.data) {
      throw new Error('Erreur lors de la mise à jour du template')
    }

    return response.data
  }

  async deleteTrainingPlanTemplate(id: string): Promise<void> {
    await this.makeRequest(`/training-plan-templates/${id}`, {
      method: 'DELETE',
    })
  }

  // ============================
  // UTILITAIRES
  // ============================

  /**
   * Récupère les séances de la semaine courante
   */
  async getCurrentWeekSessions(planId?: string): Promise<TrainingSession[]> {
    const now = new Date()
    const startOfWeek = new Date(now)
    startOfWeek.setDate(now.getDate() - now.getDay())
    startOfWeek.setHours(0, 0, 0, 0)

    const endOfWeek = new Date(startOfWeek)
    endOfWeek.setDate(startOfWeek.getDate() + 6)
    endOfWeek.setHours(23, 59, 59, 999)

    return this.getTrainingSessions({
      planId,
      startDate: startOfWeek.toISOString(),
      endDate: endOfWeek.toISOString(),
    })
  }

  /**
   * Récupère les statistiques d'entraînement
   */
  async getTrainingStats(period: 'week' | 'month' | '3months' = 'month'): Promise<{
    activePlans: number
    weeklySessionsCompleted: number
    weeklySessionsTotal: number
    monthlyDistance: number
    nextSession?: TrainingSession
    recentActivity: TrainingSession[]
  }> {
    const now = new Date()
    let startDate: Date

    switch (period) {
      case 'week':
        startDate = new Date(now)
        startDate.setDate(now.getDate() - 7)
        break
      case '3months':
        startDate = new Date(now)
        startDate.setMonth(now.getMonth() - 3)
        break
      default: // month
        startDate = new Date(now)
        startDate.setMonth(now.getMonth() - 1)
    }

    // Récupération des données en parallèle
    const [plans, recentSessions, allSessions] = await Promise.all([
      this.getTrainingPlans(),
      this.getTrainingSessions({
        startDate: startDate.toISOString(),
        limit: 10,
      }),
      this.getTrainingSessions({
        startDate: startDate.toISOString(),
      }),
    ])

    // Calcul des statistiques
    const activePlans = plans.filter(p => p.status === 'ACTIVE').length

    const weekStart = new Date(now)
    weekStart.setDate(now.getDate() - now.getDay())
    const weekSessions = allSessions.filter(s => new Date(s.date) >= weekStart)

    const weeklySessionsCompleted = weekSessions.filter(s => s.completed).length
    const weeklySessionsTotal = weekSessions.length

    const monthStart = new Date(now)
    monthStart.setMonth(now.getMonth() - 1)
    const monthSessions = allSessions.filter(s => new Date(s.date) >= monthStart && s.completed)
    const monthlyDistance = monthSessions.reduce((sum, s) => sum + (s.distance || 0), 0)

    // Prochaine séance
    const upcomingSessions = allSessions
      .filter(s => !s.completed && new Date(s.date) > now)
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())

    const nextSession = upcomingSessions[0]

    // Activité récente
    const recentActivity = recentSessions
      .filter(s => s.completed)
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .slice(0, 5)

    return {
      activePlans,
      weeklySessionsCompleted,
      weeklySessionsTotal,
      monthlyDistance: Math.round(monthlyDistance * 10) / 10,
      nextSession,
      recentActivity,
    }
  }

  /**
   * Formate la durée en heures et minutes
   */
  formatDuration(minutes: number): string {
    const hours = Math.floor(minutes / 60)
    const mins = minutes % 60

    if (hours > 0) {
      return `${hours}h${mins > 0 ? `${mins}min` : ''}`
    }
    return `${mins}min`
  }

  /**
   * Formate la distance
   */
  formatDistance(km: number): string {
    if (km < 1) {
      return `${Math.round(km * 1000)}m`
    }
    return `${km}km`
  }
}

// Instance singleton
export const trainingService = new TrainingService()
export default trainingService
