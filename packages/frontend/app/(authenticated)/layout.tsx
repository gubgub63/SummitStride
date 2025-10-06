'use client'

/**
 * Layout Authentifié - SummitStride
 * Layout pour les pages protégées avec navigation complète
 */

import React, { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Header } from '../../components/navigation/Header'
import { useAuth } from '../../lib/hooks/useAuth'

interface AuthenticatedLayoutProps {
  children: React.ReactNode
}

export default function AuthenticatedLayout({ children }: AuthenticatedLayoutProps) {
  const { isAuthenticated, isLoading } = useAuth()
  const router = useRouter()

  // Rediriger vers la page de connexion si non authentifié
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/login')
    }
  }, [isAuthenticated, isLoading, router])

  // Afficher un loading pendant la vérification
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="flex flex-col items-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
          <p className="text-sm text-muted-foreground">Chargement...</p>
        </div>
      </div>
    )
  }

  // Ne pas afficher le contenu si non authentifié
  if (!isAuthenticated) {
    return null
  }

  return (
    <div className="relative min-h-screen bg-background">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_15%_15%,rgba(67,56,245,0.12),transparent_60%)]" />
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_80%_10%,rgba(255,92,43,0.12),transparent_55%)]" />
      <Header />
      <main className="relative z-10 container mx-auto px-4 py-10">
        {children}
      </main>
    </div>
  )
}
