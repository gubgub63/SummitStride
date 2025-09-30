/**
 * Hook de Gestion de Formulaires - SummitStride
 * Hook générique pour la validation et gestion d'état des formulaires
 */

import { useState, useCallback } from 'react'
import type { FormErrors, ValidationRule } from '../types/auth'

interface UseFormOptions<T> {
  initialValues: T
  validationRules?: Partial<Record<keyof T, ValidationRule>>
  onSubmit: (values: T) => Promise<void> | void
}

export function useForm<T extends Record<string, any>>({
  initialValues,
  validationRules = {},
  onSubmit,
}: UseFormOptions<T>) {
  const [values, setValues] = useState<T>(initialValues)
  const [errors, setErrors] = useState<FormErrors>({})
  const [touched, setTouched] = useState<Record<keyof T, boolean>>({} as Record<keyof T, boolean>)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const validateField = useCallback(
    (name: keyof T, value: any): string | undefined => {
      const rule = validationRules[name]
      if (!rule) return undefined

      // Validation required
      if (rule.required && (!value || (typeof value === 'string' && value.trim() === ''))) {
        return 'Ce champ est requis'
      }

      // Si pas de valeur et pas required, pas d'erreur
      if (!value || (typeof value === 'string' && value.trim() === '')) {
        return undefined
      }

      // Validation minLength
      if (rule.minLength && value.length < rule.minLength) {
        return `Minimum ${rule.minLength} caractères requis`
      }

      // Validation maxLength
      if (rule.maxLength && value.length > rule.maxLength) {
        return `Maximum ${rule.maxLength} caractères autorisés`
      }

      // Validation pattern
      if (rule.pattern && !rule.pattern.test(value)) {
        return 'Format invalide'
      }

      // Validation custom
      if (rule.custom) {
        return rule.custom(value)
      }

      return undefined
    },
    [validationRules]
  )

  const validateAllFields = useCallback(() => {
    const newErrors: FormErrors = {}
    let isValid = true

    Object.keys(values).forEach(key => {
      const fieldName = key as keyof T
      const error = validateField(fieldName, values[fieldName])
      if (error) {
        newErrors[key] = error
        isValid = false
      }
    })

    setErrors(newErrors)
    return isValid
  }, [values, validateField])

  const handleChange = useCallback(
    (name: keyof T, value: any) => {
      setValues(prev => ({ ...prev, [name]: value }))

      // Validation en temps réel seulement si le champ a été touché
      if (touched[name]) {
        const error = validateField(name, value)
        setErrors(prev => ({ ...prev, [name as string]: error }))
      }
    },
    [touched, validateField]
  )

  const handleBlur = useCallback(
    (name: keyof T) => {
      setTouched(prev => ({ ...prev, [name]: true }))

      // Valider le champ au blur
      const error = validateField(name, values[name])
      setErrors(prev => ({ ...prev, [name as string]: error }))
    },
    [values, validateField]
  )

  const handleSubmit = useCallback(
    async (e?: React.FormEvent) => {
      if (e) {
        e.preventDefault()
      }

      // Marquer tous les champs comme touchés
      const allTouched = Object.keys(values).reduce(
        (acc, key) => ({ ...acc, [key]: true }),
        {} as Record<keyof T, boolean>
      )
      setTouched(allTouched)

      // Valider tous les champs
      if (!validateAllFields()) {
        return
      }

      try {
        setIsSubmitting(true)
        await onSubmit(values)
      } catch (error) {
        // L'erreur sera gérée par le composant parent ou le context
      } finally {
        setIsSubmitting(false)
      }
    },
    [values, validateAllFields, onSubmit]
  )

  const reset = useCallback(() => {
    setValues(initialValues)
    setErrors({})
    setTouched({} as Record<keyof T, boolean>)
    setIsSubmitting(false)
  }, [initialValues])

  const setFieldError = useCallback((name: keyof T, error: string) => {
    setErrors(prev => ({ ...prev, [name as string]: error }))
  }, [])

  const hasErrors = Object.values(errors).some(error => !!error)
  const isFormValid = !hasErrors && Object.keys(touched).length > 0

  return {
    values,
    errors,
    touched,
    isSubmitting,
    isFormValid,
    hasErrors,
    handleChange,
    handleBlur,
    handleSubmit,
    reset,
    setFieldError,
    validateField,
  }
}

// Règles de validation communes
export const commonValidations = {
  email: {
    required: true,
    pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  } as ValidationRule,

  password: {
    required: true,
    minLength: 6,
  } as ValidationRule,

  name: {
    required: true,
    minLength: 2,
    maxLength: 50,
  } as ValidationRule,

  required: {
    required: true,
  } as ValidationRule,

  optional: {} as ValidationRule,
}