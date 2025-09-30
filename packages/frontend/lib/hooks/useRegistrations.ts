/**
 * useRegistrations Hook - SummitStride
 * Hook pour gérer les inscriptions aux courses
 */

'use client'

import { useState, useCallback } from 'react'
import {
  registrationService,
  Registration,
  CreateRegistrationRequest,
  UpdateRegistrationRequest,
  RegistrationListResponse,
  PreparationAnalysis,
  RegistrationStatus
} from '../services/registrationService'

interface UseRegistrationsState {
  // Data state
  registrations: Registration[]
  selectedRegistration: Registration | null
  summary: RegistrationListResponse['summary'] | null
  preparationAnalysis: PreparationAnalysis | null

  // Loading states
  loading: boolean
  loadingCreate: boolean
  loadingUpdate: boolean
  loadingDelete: boolean
  loadingAnalysis: boolean

  // Error states
  error: string | null
  createError: string | null
  updateError: string | null
  deleteError: string | null
  analysisError: string | null
}

interface UseRegistrationsActions {
  // CRUD operations
  loadRegistrations: () => Promise<void>
  createRegistration: (data: CreateRegistrationRequest) => Promise<Registration | null>
  getRegistration: (id: string) => Promise<void>
  updateRegistration: (id: string, data: UpdateRegistrationRequest) => Promise<Registration | null>
  deleteRegistration: (id: string) => Promise<boolean>

  // Analysis
  loadPreparationAnalysis: (id: string) => Promise<void>

  // Filters and utilities
  getRegistrationsByStatus: (status?: RegistrationStatus) => Registration[]
  getUpcomingRegistrations: () => Registration[]
  getCompletedRegistrations: () => Registration[]

  // Error management
  clearErrors: () => void
  clearError: (field: keyof UseRegistrationsState) => void
}

const initialState: UseRegistrationsState = {
  registrations: [],
  selectedRegistration: null,
  summary: null,
  preparationAnalysis: null,
  loading: false,
  loadingCreate: false,
  loadingUpdate: false,
  loadingDelete: false,
  loadingAnalysis: false,
  error: null,
  createError: null,
  updateError: null,
  deleteError: null,
  analysisError: null
}

export function useRegistrations(): UseRegistrationsState & UseRegistrationsActions {
  const [state, setState] = useState<UseRegistrationsState>(initialState)

  // Helper function to update state
  const updateState = useCallback((updates: Partial<UseRegistrationsState>) => {
    setState(prevState => ({ ...prevState, ...updates }))
  }, [])

  // Clear errors
  const clearErrors = useCallback(() => {
    updateState({
      error: null,
      createError: null,
      updateError: null,
      deleteError: null,
      analysisError: null
    })
  }, [updateState])

  const clearError = useCallback((field: keyof UseRegistrationsState) => {
    updateState({ [field]: null })
  }, [updateState])

  // Load all registrations
  const loadRegistrations = useCallback(async () => {
    try {
      updateState({ loading: true, error: null })

      const response = await registrationService.getRegistrations()

      updateState({
        registrations: response.registrations,
        summary: response.summary,
        loading: false
      })
    } catch (error) {
      console.error('Failed to load registrations:', error)
      updateState({
        loading: false,
        error: error instanceof Error ? error.message : 'Failed to load registrations'
      })
    }
  }, [updateState])

  // Create registration
  const createRegistration = useCallback(async (data: CreateRegistrationRequest): Promise<Registration | null> => {
    try {
      updateState({ loadingCreate: true, createError: null })

      const response = await registrationService.createRegistration(data)

      // Refresh registrations list
      await loadRegistrations()

      updateState({ loadingCreate: false })
      return response.registration
    } catch (error) {
      console.error('Failed to create registration:', error)
      updateState({
        loadingCreate: false,
        createError: error instanceof Error ? error.message : 'Failed to create registration'
      })
      return null
    }
  }, [updateState, loadRegistrations])

  // Get specific registration
  const getRegistration = useCallback(async (id: string) => {
    try {
      updateState({ loading: true, error: null })

      const response = await registrationService.getRegistration(id)

      updateState({
        selectedRegistration: response.registration,
        loading: false
      })
    } catch (error) {
      console.error('Failed to get registration:', error)
      updateState({
        loading: false,
        error: error instanceof Error ? error.message : 'Failed to get registration'
      })
    }
  }, [updateState])

  // Update registration
  const updateRegistration = useCallback(async (id: string, data: UpdateRegistrationRequest): Promise<Registration | null> => {
    try {
      updateState({ loadingUpdate: true, updateError: null })

      const response = await registrationService.updateRegistration(id, data)

      // Update the registration in our state
      updateState(prevState => ({
        registrations: prevState.registrations.map(reg =>
          reg.id === id ? response.registration : reg
        ),
        selectedRegistration: prevState.selectedRegistration?.id === id
          ? response.registration
          : prevState.selectedRegistration,
        loadingUpdate: false
      }))

      return response.registration
    } catch (error) {
      console.error('Failed to update registration:', error)
      updateState({
        loadingUpdate: false,
        updateError: error instanceof Error ? error.message : 'Failed to update registration'
      })
      return null
    }
  }, [updateState])

  // Delete registration
  const deleteRegistration = useCallback(async (id: string): Promise<boolean> => {
    try {
      updateState({ loadingDelete: true, deleteError: null })

      await registrationService.deleteRegistration(id)

      // Remove registration from state
      updateState(prevState => ({
        registrations: prevState.registrations.filter(reg => reg.id !== id),
        selectedRegistration: prevState.selectedRegistration?.id === id
          ? null
          : prevState.selectedRegistration,
        loadingDelete: false
      }))

      return true
    } catch (error) {
      console.error('Failed to delete registration:', error)
      updateState({
        loadingDelete: false,
        deleteError: error instanceof Error ? error.message : 'Failed to delete registration'
      })
      return false
    }
  }, [updateState])

  // Load preparation analysis
  const loadPreparationAnalysis = useCallback(async (id: string) => {
    try {
      updateState({ loadingAnalysis: true, analysisError: null })

      const response = await registrationService.getPreparationAnalysis(id)

      updateState({
        preparationAnalysis: response.analysis,
        loadingAnalysis: false
      })
    } catch (error) {
      console.error('Failed to load preparation analysis:', error)
      updateState({
        loadingAnalysis: false,
        analysisError: error instanceof Error ? error.message : 'Failed to load preparation analysis'
      })
    }
  }, [updateState])

  // Filter utilities
  const getRegistrationsByStatus = useCallback((status?: RegistrationStatus): Registration[] => {
    if (!status) return state.registrations
    return state.registrations.filter(reg => reg.status === status)
  }, [state.registrations])

  const getUpcomingRegistrations = useCallback((): Registration[] => {
    return state.registrations.filter(reg => registrationService.isUpcoming(reg))
  }, [state.registrations])

  const getCompletedRegistrations = useCallback((): Registration[] => {
    return state.registrations.filter(reg =>
      reg.status === RegistrationStatus.COMPLETED ||
      reg.status === RegistrationStatus.DNS ||
      reg.status === RegistrationStatus.DNF
    )
  }, [state.registrations])

  return {
    // State
    ...state,

    // Actions
    loadRegistrations,
    createRegistration,
    getRegistration,
    updateRegistration,
    deleteRegistration,
    loadPreparationAnalysis,
    getRegistrationsByStatus,
    getUpcomingRegistrations,
    getCompletedRegistrations,
    clearErrors,
    clearError
  }
}