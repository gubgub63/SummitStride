/**
 * Registration Service - Coach IA Hugo
 * Service pour les appels API liés aux inscriptions aux courses
 */

export interface Registration {
  id: string
  userId: string
  courseId: string
  status: RegistrationStatus
  goal?: string
  notes?: string
  targetDate?: string
  registrationDate: string
  preparationTimeWeeks?: number
  preparationTimeDays?: number
  course: {
    id: string
    name: string
    location: string
    distance: number
    elevationGain: number
    difficulty: string
    category: string
  }
  preparationAnalysis?: PreparationAnalysis
  createdAt: string
  updatedAt: string
}

export interface CreateRegistrationRequest {
  courseId: string
  targetDate?: string
  goal?: string
  notes?: string
}

export interface UpdateRegistrationRequest {
  targetDate?: string
  goal?: string
  notes?: string
  status?: RegistrationStatus
}

export interface RegistrationListResponse {
  registrations: Registration[]
  summary: {
    total: number
    active: number
    completed: number
    upcoming: number
  }
}

export interface PreparationAnalysis {
  period: {
    weeks: number
    days: number
    totalDays: number
    isAdequate: boolean
    recommendations: string[]
  }
  userLevel: string
  courseCategory: string
  riskLevel: 'LOW' | 'MEDIUM' | 'HIGH'
  suggestions: string[]
}

export enum RegistrationStatus {
  REGISTERED = 'REGISTERED',
  PREPARATION = 'PREPARATION',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED',
  DNS = 'DNS', // Did Not Start
  DNF = 'DNF'  // Did Not Finish
}

export const REGISTRATION_STATUS_LABELS = {
  REGISTERED: 'Inscrit',
  PREPARATION: 'En préparation',
  COMPLETED: 'Terminé',
  CANCELLED: 'Annulé',
  DNS: 'Non-partant',
  DNF: 'Abandon'
} as const

export const COMMON_RACE_GOALS = [
  'Finir la course',
  'Sous les 4h',
  'Sous les 6h',
  'Sous les 10h',
  'Sous les 24h',
  'Top 10',
  'Top 50',
  'Première course',
  'Améliorer mon record personnel',
  'Découvrir le parcours'
] as const

class RegistrationService {
  private baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000'

  private async fetchWithAuth(url: string, options: RequestInit = {}) {
    const token = localStorage.getItem('auth_token')

    const response = await fetch(`${this.baseUrl}${url}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...(token && { Authorization: `Bearer ${token}` }),
        ...options.headers,
      },
    })

    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: 'Network error' }))
      throw new Error(error.error || `HTTP ${response.status}`)
    }

    return response.json()
  }

  /**
   * Créer une nouvelle inscription à une course
   */
  async createRegistration(data: CreateRegistrationRequest): Promise<{ registration: Registration; message: string }> {
    return this.fetchWithAuth('/api/registrations', {
      method: 'POST',
      body: JSON.stringify(data)
    })
  }

  /**
   * Récupérer toutes les inscriptions de l'utilisateur
   */
  async getRegistrations(): Promise<RegistrationListResponse> {
    return this.fetchWithAuth('/api/registrations')
  }

  /**
   * Récupérer une inscription spécifique par ID
   */
  async getRegistration(id: string): Promise<{ registration: Registration }> {
    return this.fetchWithAuth(`/api/registrations/${id}`)
  }

  /**
   * Mettre à jour une inscription
   */
  async updateRegistration(id: string, data: UpdateRegistrationRequest): Promise<{ registration: Registration; message: string }> {
    return this.fetchWithAuth(`/api/registrations/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data)
    })
  }

  /**
   * Supprimer une inscription
   */
  async deleteRegistration(id: string): Promise<{ message: string }> {
    return this.fetchWithAuth(`/api/registrations/${id}`, {
      method: 'DELETE'
    })
  }

  /**
   * Récupérer l'analyse de préparation pour une inscription
   */
  async getPreparationAnalysis(id: string): Promise<{ analysis: PreparationAnalysis }> {
    return this.fetchWithAuth(`/api/registrations/${id}/preparation-analysis`)
  }

  /**
   * Récupérer les libellés de statuts
   */
  async getStatusLabels(): Promise<{ statusLabels: typeof REGISTRATION_STATUS_LABELS }> {
    return this.fetchWithAuth('/api/registrations/meta/status-labels')
  }

  /**
   * Récupérer les objectifs communs
   */
  async getCommonGoals(): Promise<{ commonGoals: typeof COMMON_RACE_GOALS }> {
    return this.fetchWithAuth('/api/registrations/meta/common-goals')
  }

  /**
   * Fonctions utilitaires de formatage
   */

  getStatusLabel(status: RegistrationStatus): string {
    return REGISTRATION_STATUS_LABELS[status] || status
  }

  getStatusColor(status: RegistrationStatus): string {
    const colors = {
      REGISTERED: 'text-blue-600 bg-blue-50 border-blue-200',
      PREPARATION: 'text-orange-600 bg-orange-50 border-orange-200',
      COMPLETED: 'text-green-600 bg-green-50 border-green-200',
      CANCELLED: 'text-gray-600 bg-gray-50 border-gray-200',
      DNS: 'text-red-600 bg-red-50 border-red-200',
      DNF: 'text-red-600 bg-red-50 border-red-200'
    }
    return colors[status] || 'text-gray-600 bg-gray-50 border-gray-200'
  }

  getRiskLevelColor(level: 'LOW' | 'MEDIUM' | 'HIGH'): string {
    const colors = {
      LOW: 'text-green-600 bg-green-50',
      MEDIUM: 'text-orange-600 bg-orange-50',
      HIGH: 'text-red-600 bg-red-50'
    }
    return colors[level] || 'text-gray-600 bg-gray-50'
  }

  getRiskLevelLabel(level: 'LOW' | 'MEDIUM' | 'HIGH'): string {
    const labels = {
      LOW: 'Faible',
      MEDIUM: 'Modéré',
      HIGH: 'Élevé'
    }
    return labels[level] || level
  }

  formatPreparationTime(weeks?: number, days?: number): string {
    if (!weeks && !days) return 'Non défini'

    const parts = []
    if (weeks && weeks > 0) {
      parts.push(`${weeks} semaine${weeks > 1 ? 's' : ''}`)
    }
    if (days && days > 0) {
      parts.push(`${days} jour${days > 1 ? 's' : ''}`)
    }

    return parts.length > 0 ? parts.join(' et ') : 'Non défini'
  }

  formatTargetDate(dateString?: string): string {
    if (!dateString) return 'Non définie'

    const date = new Date(dateString)
    return date.toLocaleDateString('fr-FR', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  isUpcoming(registration: Registration): boolean {
    if (!registration.targetDate) return false

    const targetDate = new Date(registration.targetDate)
    const now = new Date()

    return targetDate > now && (registration.status === RegistrationStatus.REGISTERED || registration.status === RegistrationStatus.PREPARATION)
  }

  getDaysUntilRace(registration: Registration): number | null {
    if (!registration.targetDate) return null

    const targetDate = new Date(registration.targetDate)
    const now = new Date()
    const diffTime = targetDate.getTime() - now.getTime()
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))

    return diffDays > 0 ? diffDays : 0
  }
}

export const registrationService = new RegistrationService()