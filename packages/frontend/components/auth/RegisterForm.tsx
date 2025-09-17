'use client'

/**
 * Formulaire d'Inscription - Coach IA Hugo
 * Composant pour l'inscription de nouveaux utilisateurs
 */

import React from 'react'
import Link from 'next/link'
import { Button } from '../ui/Button'
import { Input } from '../ui/Input'
import { useForm, commonValidations } from '../../lib/hooks/useForm'
import { useAuth } from '../../lib/hooks/useAuth'
import type { RegisterRequest } from '../../lib/types/auth'

interface RegisterFormProps {
  onSuccess?: () => void
}

export function RegisterForm({ onSuccess }: RegisterFormProps) {
  const { register, error, clearError } = useAuth()

  const {
    values,
    errors,
    handleChange,
    handleBlur,
    handleSubmit,
    isSubmitting,
  } = useForm<RegisterRequest & { confirmPassword: string }>({
    initialValues: {
      name: '',
      email: '',
      password: '',
      confirmPassword: '',
    },
    validationRules: {
      name: commonValidations.name,
      email: commonValidations.email,
      password: commonValidations.password,
      confirmPassword: {
        required: true,
        custom: (value) => {
          if (value !== values.password) {
            return 'Les mots de passe ne correspondent pas'
          }
          return undefined
        },
      },
    },
    onSubmit: async (formData) => {
      clearError()
      const { confirmPassword, ...registerData } = formData
      await register(registerData)
      if (onSuccess) {
        onSuccess()
      }
    },
  })

  return (
    <div className="w-full max-w-md mx-auto space-y-6">
      <div className="text-center space-y-2">
        <h1 className="text-2xl font-bold text-foreground">Créer un compte</h1>
        <p className="text-muted-foreground">
          Rejoignez Coach IA Hugo pour optimiser votre entraînement ultra-trail
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="p-3 text-sm text-red-600 bg-red-50 border border-red-200 rounded-md dark:bg-red-900/20 dark:border-red-800 dark:text-red-400">
            {error}
          </div>
        )}

        <Input
          label="Nom complet"
          type="text"
          placeholder="Jean Dupont"
          value={values.name}
          onChange={(e) => handleChange('name', e.target.value)}
          onBlur={() => handleBlur('name')}
          errorMessage={errors.name}
          isRequired
          autoComplete="name"
        />

        <Input
          label="Email"
          type="email"
          placeholder="votre@email.com"
          value={values.email}
          onChange={(e) => handleChange('email', e.target.value)}
          onBlur={() => handleBlur('email')}
          errorMessage={errors.email}
          isRequired
          autoComplete="email"
        />

        <Input
          label="Mot de passe"
          type="password"
          placeholder="••••••••"
          value={values.password}
          onChange={(e) => handleChange('password', e.target.value)}
          onBlur={() => handleBlur('password')}
          errorMessage={errors.password}
          helperText="Minimum 6 caractères"
          isRequired
          autoComplete="new-password"
        />

        <Input
          label="Confirmer le mot de passe"
          type="password"
          placeholder="••••••••"
          value={values.confirmPassword}
          onChange={(e) => handleChange('confirmPassword', e.target.value)}
          onBlur={() => handleBlur('confirmPassword')}
          errorMessage={errors.confirmPassword}
          isRequired
          autoComplete="new-password"
        />

        <div className="text-xs text-muted-foreground">
          En créant un compte, vous acceptez nos{' '}
          <Link href="/terms" className="text-primary-600 hover:text-primary-500 dark:text-primary-400">
            conditions d'utilisation
          </Link>{' '}
          et notre{' '}
          <Link href="/privacy" className="text-primary-600 hover:text-primary-500 dark:text-primary-400">
            politique de confidentialité
          </Link>
          .
        </div>

        <Button
          type="submit"
          variant="default"
          size="lg"
          className="w-full"
          loading={isSubmitting}
          disabled={isSubmitting}
        >
          Créer mon compte
        </Button>

        <div className="text-center space-y-2">
          <p className="text-sm text-muted-foreground">
            Déjà un compte ?{' '}
            <Link
              href="/login"
              className="text-primary-600 hover:text-primary-500 dark:text-primary-400 font-medium"
            >
              Se connecter
            </Link>
          </p>
        </div>
      </form>
    </div>
  )
}