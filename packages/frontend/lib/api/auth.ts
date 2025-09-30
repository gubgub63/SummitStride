/**
 * Service d'Authentification - SummitStride
 * API calls pour l'authentification et la gestion des utilisateurs
 */

import { apiClient } from './client'
import type {
  LoginRequest,
  RegisterRequest,
  ForgotPasswordRequest,
  AuthResponse,
  User,
} from '../types/auth'

export class AuthService {
  async login(credentials: LoginRequest): Promise<AuthResponse> {
    const response = await apiClient.post<AuthResponse>('/auth/login', credentials)

    // Stocker le token après connexion réussie
    if (response.token) {
      apiClient.setToken(response.token)
    }

    return response
  }

  async register(userData: RegisterRequest): Promise<AuthResponse> {
    const response = await apiClient.post<AuthResponse>('/auth/register', userData)

    // Stocker le token après inscription réussie
    if (response.token) {
      apiClient.setToken(response.token)
    }

    return response
  }

  async forgotPassword(data: ForgotPasswordRequest): Promise<{ message: string }> {
    return apiClient.post('/auth/forgot-password', data)
  }

  async getCurrentUser(): Promise<{ user: User }> {
    return apiClient.get('/auth/me')
  }

  async logout(): Promise<void> {
    // Supprimer le token côté client
    apiClient.setToken(null)

    // Note: Ici on pourrait aussi appeler un endpoint de logout côté serveur
    // pour invalider le token si nécessaire
  }

  async refreshToken(): Promise<{ user: User; token: string } | null> {
    try {
      // Essayer de récupérer l'utilisateur actuel avec le token existant
      const response = await this.getCurrentUser()
      return { user: response.user, token: apiClient['token'] || '' }
    } catch (error) {
      // Si le token n'est plus valide, le supprimer
      apiClient.setToken(null)
      return null
    }
  }

  getStoredToken(): string | null {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('auth_token')
    }
    return null
  }

  isTokenExpired(token: string): boolean {
    if (!token) return true

    try {
      // Décoder le payload JWT pour vérifier l'expiration
      const payload = JSON.parse(atob(token.split('.')[1]))
      const currentTime = Date.now() / 1000

      return payload.exp < currentTime
    } catch (error) {
      // Si on ne peut pas décoder le token, considérer qu'il est expiré
      return true
    }
  }
}

export const authService = new AuthService()
