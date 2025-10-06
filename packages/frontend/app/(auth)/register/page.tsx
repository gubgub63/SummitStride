'use client'

import React, { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { RegisterForm } from '../../../components/auth/RegisterForm'
import { useAuth } from '../../../lib/hooks/useAuth'

export default function RegisterPage() {
  const router = useRouter()
  const { isAuthenticated, isLoading } = useAuth()

  useEffect(() => {
    if (!isLoading && isAuthenticated) {
      router.push('/dashboard')
    }
  }, [isAuthenticated, isLoading, router])

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
      </div>
    )
  }

  if (isAuthenticated) {
    return null
  }

  const handleRegisterSuccess = () => {
    router.push('/onboarding')
  }

  return <RegisterForm onSuccess={handleRegisterSuccess} />
}
