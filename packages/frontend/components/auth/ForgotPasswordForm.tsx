'use client'

/**
 * Formulaire de Récupération de Mot de Passe - SummitStride
 * Composant pour la demande de réinitialisation de mot de passe
 */

import React, { useState } from 'react'
import Link from 'next/link'
import { Button } from '../ui/Button'
import { Input } from '../ui/Input'
import { useForm, commonValidations } from '../../lib/hooks/useForm'
import { useAuth } from '../../lib/hooks/useAuth'
import type { ForgotPasswordRequest } from '../../lib/types/auth'

export function ForgotPasswordForm() {
  const { forgotPassword, error, clearError } = useAuth()
  const [isSuccess, setIsSuccess] = useState(false)

  const {
    values,
    errors,
    handleChange,
    handleBlur,
    handleSubmit,
    isSubmitting,
  } = useForm<ForgotPasswordRequest>({
    initialValues: {
      email: '',
    },
    validationRules: {
      email: commonValidations.email,
    },
    onSubmit: async (formData) => {
      clearError()
      await forgotPassword(formData)
      setIsSuccess(true)
    },
  })

  if (isSuccess) {
    return (
      <div className="w-full max-w-md mx-auto space-y-6">
        <div className="text-center space-y-4">
          <div className="w-16 h-16 mx-auto bg-green-100 dark:bg-green-900/20 rounded-full flex items-center justify-center">
            <svg
              className="w-8 h-8 text-green-600 dark:text-green-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M5 13l4 4L19 7"
              />
            </svg>
          </div>

          <h1 className="text-2xl font-bold text-foreground">Email envoyé</h1>

          <div className="space-y-2">
            <p className="text-muted-foreground">
              Un email de récupération a été envoyé à <strong>{values.email}</strong>
            </p>
            <p className="text-sm text-muted-foreground">
              Vérifiez votre boîte de réception et suivez les instructions pour réinitialiser votre mot de passe.
            </p>
          </div>
        </div>

        <div className="space-y-3">
          <Button
            variant="default"
            size="lg"
            className="w-full"
            onClick={() => setIsSuccess(false)}
          >
            Renvoyer l'email
          </Button>

          <div className="text-center">
            <Link
              href="/login"
              className="text-sm text-primary-600 hover:text-primary-500 dark:text-primary-400"
            >
              Retour à la connexion
            </Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="w-full max-w-md mx-auto space-y-6">
      <div className="text-center space-y-2">
        <h1 className="text-2xl font-bold text-foreground">Mot de passe oublié</h1>
        <p className="text-muted-foreground">
          Entrez votre email pour recevoir un lien de réinitialisation
        </p>
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
          onChange={(e) => handleChange('email', e.target.value)}
          onBlur={() => handleBlur('email')}
          errorMessage={errors.email}
          isRequired
          autoComplete="email"
        />

        <Button
          type="submit"
          variant="default"
          size="lg"
          className="w-full"
          loading={isSubmitting}
          disabled={isSubmitting}
        >
          Envoyer le lien de récupération
        </Button>

        <div className="text-center space-y-2">
          <Link
            href="/login"
            className="text-sm text-primary-600 hover:text-primary-500 dark:text-primary-400"
          >
            Retour à la connexion
          </Link>
        </div>
      </form>
    </div>
  )
}