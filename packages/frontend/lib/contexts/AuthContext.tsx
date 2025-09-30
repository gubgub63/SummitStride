'use client'

/**
 * Context d'Authentification - SummitStride
 * Gestion globale de l'état d'authentification et des utilisateurs
 */

import React, { createContext, useContext, useReducer, useEffect } from 'react'
import { authService } from '../api/auth'
import { userService } from '../api/user'
import type {
  AuthState,
  User,
  UserProfile,
  LoginRequest,
  RegisterRequest,
  ForgotPasswordRequest,
  CreateProfileRequest,
  UpdateProfileRequest,
} from '../types/auth'

interface AuthActions {
  login: (credentials: LoginRequest) => Promise<void>
  register: (userData: RegisterRequest) => Promise<void>
  logout: () => void
  forgotPassword: (data: ForgotPasswordRequest) => Promise<{ message: string }>
  updateProfile: (data: UpdateProfileRequest) => Promise<void>
  createProfile: (data: CreateProfileRequest) => Promise<void>
  refreshUser: () => Promise<void>
  clearError: () => void
}

interface AuthContextType extends AuthState, AuthActions {}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

type AuthAction =
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: string | null }
  | { type: 'SET_USER'; payload: User | null }
  | { type: 'SET_PROFILE'; payload: UserProfile | null }
  | { type: 'LOGOUT' }

const initialState: AuthState = {
  user: null,
  profile: null,
  isAuthenticated: false,
  isLoading: true,
  error: null,
}

function authReducer(state: AuthState, action: AuthAction): AuthState {
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, isLoading: action.payload }
    case 'SET_ERROR':
      return { ...state, error: action.payload, isLoading: false }
    case 'SET_USER':
      return {
        ...state,
        user: action.payload,
        isAuthenticated: !!action.payload,
        isLoading: false,
        error: null,
      }
    case 'SET_PROFILE':
      return {
        ...state,
        profile: action.payload,
        isLoading: false,
      }
    case 'LOGOUT':
      return {
        ...initialState,
        isLoading: false,
      }
    default:
      return state
  }
}

interface AuthProviderProps {
  children: React.ReactNode
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [state, dispatch] = useReducer(authReducer, initialState)

  // Initialisation: vérifier si l'utilisateur est déjà connecté
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        const token = authService.getStoredToken()

        if (!token || authService.isTokenExpired(token)) {
          dispatch({ type: 'SET_LOADING', payload: false })
          return
        }

        // Récupérer les informations utilisateur
        const userResponse = await authService.getCurrentUser()
        dispatch({ type: 'SET_USER', payload: userResponse.user })

        // Essayer de récupérer le profil détaillé
        try {
          const profileResponse = await userService.getDetailedProfile()
          dispatch({ type: 'SET_PROFILE', payload: profileResponse.profile })
        } catch (profileError) {
          // Le profil détaillé n'existe pas encore, ce n'est pas une erreur
          dispatch({ type: 'SET_PROFILE', payload: null })
        }
      } catch (error) {
        // Token invalide, nettoyer l'état
        authService.logout()
        dispatch({ type: 'LOGOUT' })
      }
    }

    initializeAuth()
  }, [])

  const login = async (credentials: LoginRequest) => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true })
      dispatch({ type: 'SET_ERROR', payload: null })

      const response = await authService.login(credentials)
      dispatch({ type: 'SET_USER', payload: response.user })

      // Essayer de récupérer le profil détaillé
      try {
        const profileResponse = await userService.getDetailedProfile()
        dispatch({ type: 'SET_PROFILE', payload: profileResponse.profile })
      } catch (profileError) {
        dispatch({ type: 'SET_PROFILE', payload: null })
      }
    } catch (error: any) {
      dispatch({
        type: 'SET_ERROR',
        payload: error.response?.error || error.message || 'Erreur de connexion',
      })
      throw error
    }
  }

  const register = async (userData: RegisterRequest) => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true })
      dispatch({ type: 'SET_ERROR', payload: null })

      const response = await authService.register(userData)
      dispatch({ type: 'SET_USER', payload: response.user })
      dispatch({ type: 'SET_PROFILE', payload: null }) // Nouveau utilisateur sans profil détaillé
    } catch (error: any) {
      dispatch({
        type: 'SET_ERROR',
        payload: error.response?.error || error.message || 'Erreur d\'inscription',
      })
      throw error
    }
  }

  const logout = () => {
    authService.logout()
    dispatch({ type: 'LOGOUT' })
  }

  const forgotPassword = async (data: ForgotPasswordRequest) => {
    try {
      dispatch({ type: 'SET_ERROR', payload: null })
      return await authService.forgotPassword(data)
    } catch (error: any) {
      const errorMessage = error.response?.error || error.message || 'Erreur lors de la demande'
      dispatch({ type: 'SET_ERROR', payload: errorMessage })
      throw error
    }
  }

  const createProfile = async (data: CreateProfileRequest) => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true })
      dispatch({ type: 'SET_ERROR', payload: null })

      const response = await userService.createDetailedProfile(data)
      dispatch({ type: 'SET_PROFILE', payload: response.profile })
    } catch (error: any) {
      dispatch({
        type: 'SET_ERROR',
        payload: error.response?.error || error.message || 'Erreur lors de la création du profil',
      })
      throw error
    }
  }

  const updateProfile = async (data: UpdateProfileRequest) => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true })
      dispatch({ type: 'SET_ERROR', payload: null })

      const response = await userService.updateDetailedProfile(data)
      dispatch({ type: 'SET_PROFILE', payload: response.profile })
    } catch (error: any) {
      dispatch({
        type: 'SET_ERROR',
        payload: error.response?.error || error.message || 'Erreur lors de la mise à jour du profil',
      })
      throw error
    }
  }

  const refreshUser = async () => {
    try {
      const userResponse = await authService.getCurrentUser()
      dispatch({ type: 'SET_USER', payload: userResponse.user })

      // Rafraîchir aussi le profil
      try {
        const profileResponse = await userService.getDetailedProfile()
        dispatch({ type: 'SET_PROFILE', payload: profileResponse.profile })
      } catch (profileError) {
        dispatch({ type: 'SET_PROFILE', payload: null })
      }
    } catch (error) {
      // En cas d'erreur, déconnecter l'utilisateur
      logout()
    }
  }

  const clearError = () => {
    dispatch({ type: 'SET_ERROR', payload: null })
  }

  const value: AuthContextType = {
    ...state,
    login,
    register,
    logout,
    forgotPassword,
    createProfile,
    updateProfile,
    refreshUser,
    clearError,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}