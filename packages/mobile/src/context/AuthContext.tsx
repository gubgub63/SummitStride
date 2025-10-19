import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import * as SecureStore from 'expo-secure-store'

import { login as loginRequest, register as registerRequest } from '../services/auth'
import { getUserProfile, type UserProfileResponse } from '../services/user'

const TOKEN_KEY = 'summitstride_token'

interface AuthUser {
  id: string
  email: string
  name: string
  createdAt: string
}

interface AuthState {
  user: AuthUser | null
  token: string | null
  profile: UserProfileResponse['user'] | null
  loading: boolean
}

interface AuthContextValue extends AuthState {
  login: (credentials: { email: string; password: string }) => Promise<void>
  register: (payload: { name: string; email: string; password: string }) => Promise<void>
  logout: () => Promise<void>
  refreshProfile: () => Promise<void>
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined)

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [state, setState] = useState<AuthState>({
    user: null,
    token: null,
    profile: null,
    loading: true,
  })

  const persistToken = useCallback(async (token: string | null) => {
    if (token) {
      await SecureStore.setItemAsync(TOKEN_KEY, token)
    } else {
      await SecureStore.deleteItemAsync(TOKEN_KEY)
    }
  }, [])

  const loadProfile = useCallback(
    async (token: string) => {
      try {
        const response = await getUserProfile(token)
        setState(prev => ({
          ...prev,
          user: {
            id: response.user.id,
            email: response.user.email,
            name: response.user.name,
            createdAt: response.user.createdAt,
          },
          profile: response.user,
          loading: false,
        }))
      } catch (error) {
        console.warn('Impossible de charger le profil utilisateur', error)
      }
    },
    []
  )

  useEffect(() => {
    let mounted = true
    ;(async () => {
      try {
        const storedToken = await SecureStore.getItemAsync(TOKEN_KEY)
        if (!mounted) return
        if (storedToken) {
          setState(prev => ({
            ...prev,
            token: storedToken,
            loading: false,
          }))
          await loadProfile(storedToken)
        } else {
          setState(prev => ({
            ...prev,
            loading: false,
          }))
        }
      } catch (error) {
        console.warn('Erreur chargement token', error)
        setState(prev => ({
          ...prev,
          loading: false,
        }))
      }
    })()
    return () => {
      mounted = false
    }
  }, [loadProfile])

  const handleLogin = useCallback(
    async ({ email, password }: { email: string; password: string }) => {
      const response = await loginRequest(email, password)
      setState({
        user: response.user,
        token: response.token,
        profile: null,
        loading: false,
      })
      await persistToken(response.token)
      await loadProfile(response.token)
    },
    [loadProfile, persistToken]
  )

  const handleRegister = useCallback(
    async ({ name, email, password }: { name: string; email: string; password: string }) => {
      const response = await registerRequest(name, email, password)
      setState({
        user: response.user,
        token: response.token,
        profile: null,
        loading: false,
      })
      await persistToken(response.token)
      await loadProfile(response.token)
    },
    [loadProfile, persistToken]
  )

  const handleLogout = useCallback(async () => {
    await persistToken(null)
    setState({
      user: null,
      token: null,
      profile: null,
      loading: false,
    })
  }, [persistToken])

  const refreshProfile = useCallback(async () => {
    if (!state.token) return
    await loadProfile(state.token)
  }, [loadProfile, state.token])

  const value = useMemo<AuthContextValue>(
    () => ({
      ...state,
      login: handleLogin,
      register: handleRegister,
      logout: handleLogout,
      refreshProfile,
    }),
    [handleLogin, handleLogout, handleRegister, refreshProfile, state]
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
