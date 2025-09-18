'use client'

/**
 * Formulaire de Connexion - Coach IA Hugo
 * Composant pour l'authentification des utilisateurs existants
 */

import React from 'react'
import Link from 'next/link'
import { Button } from '../ui/Button'
import { Input } from '../ui/Input'
import { useForm, commonValidations } from '../../lib/hooks/useForm'
import { useAuth } from '../../lib/hooks/useAuth'
import type { LoginRequest } from '../../lib/types/auth'

interface LoginFormProps {
  onSuccess?: () => void
  redirectTo?: string
}

export function LoginForm({ onSuccess, redirectTo }: LoginFormProps) {
  const { login, error, clearError } = useAuth()

  const { values, errors, handleChange, handleBlur, handleSubmit, isSubmitting } =
    useForm<LoginRequest>({
      initialValues: {
        email: '',
        password: '',
      },
      validationRules: {
        email: commonValidations.email,
        password: commonValidations.password,
      },
      onSubmit: async formData => {
        clearError()
        await login(formData)
        if (onSuccess) {
          onSuccess()
        }
      },
    })

  return (
    <div className="w-full max-w-md mx-auto space-y-6">
      <div className="text-center space-y-2">
        <h1 className="text-2xl font-bold text-foreground">Connexion</h1>
        <p className="text-muted-foreground">Connectez-vous à votre compte Coach IA Hugo</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="p-3 text-sm text-red-600 bg-red-50 border border-red-200 rounded-md dark:bg-red-900/20 dark:border-red-800 dark:text-red-400">
            {error}
          </div>
        )}

        <Input
          label="Email"
          type="email"
          placeholder="votre@email.com"
          value={values.email}
          onChange={e => handleChange('email', e.target.value)}
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
          onChange={e => handleChange('password', e.target.value)}
          onBlur={() => handleBlur('password')}
          errorMessage={errors.password}
          isRequired
          autoComplete="current-password"
        />

        <div className="flex items-center justify-between">
          <Link
            href="/forgot-password"
            className="text-sm text-primary-600 hover:text-primary-500 dark:text-primary-400"
          >
            Mot de passe oublié ?
          </Link>
        </div>

        <Button
          type="submit"
          variant="default"
          size="lg"
          className="w-full"
          loading={isSubmitting}
          disabled={isSubmitting}
        >
          Se connecter
        </Button>

        <div className="text-center space-y-2">
          <p className="text-sm text-muted-foreground">
            Pas encore de compte ?{' '}
            <Link
              href="/register"
              className="text-primary-600 hover:text-primary-500 dark:text-primary-400 font-medium"
            >
              Créer un compte
            </Link>
          </p>
        </div>
      </form>
    </div>
  )
}
