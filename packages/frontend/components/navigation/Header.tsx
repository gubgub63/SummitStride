'use client'

/**
 * Header Navigation - SummitStride
 * Composant de navigation principal pour les pages authentifiées
 */

import React from 'react'
import Link from 'next/link'
import { ThemeToggle } from '../../lib/theme'
import { UserMenu } from './UserMenu'
import { MobileNavigation } from './MobileNavigation'
import { useAuth } from '../../lib/hooks/useAuth'
import { useResponsive } from '../../lib/hooks/useResponsive'

export function Header() {
  const { isAuthenticated, user } = useAuth()
  const { isMobile } = useResponsive()

  // Sur mobile, utiliser MobileNavigation
  if (isMobile && isAuthenticated) {
    return <MobileNavigation />
  }

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        {/* Logo et nom */}
        <Link href={isAuthenticated ? '/dashboard' : '/'} className="flex items-center space-x-2">
          <div className="h-8 w-8 bg-gradient-to-br from-primary-600 to-primary-700 rounded-md flex items-center justify-center">
            <span className="text-white font-bold text-sm">S</span>
          </div>
          <span className="text-xl font-bold text-foreground hidden sm:block">SummitStride</span>
        </Link>

        {/* Navigation centrale (seulement si authentifié) */}
        {isAuthenticated && (
          <nav className="hidden md:flex items-center space-x-6">
            <Link
              href="/dashboard"
              className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
            >
              Tableau de bord
            </Link>
            <Link
              href="/training"
              className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
            >
              Entraînement
            </Link>
            <Link
              href="/courses"
              className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
            >
              Courses
            </Link>
            <Link
              href="/registrations"
              className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
            >
              Inscriptions
            </Link>
            <Link
              href="/nutrition"
              className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
            >
              Nutrition
            </Link>
            <Link
              href="/progress"
              className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
            >
              Progrès
            </Link>
            <Link
              href="/premium"
              className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
            >
              Premium
            </Link>
          </nav>
        )}

        {/* Actions à droite */}
        <div className="flex items-center space-x-3">
          <ThemeToggle size="sm" />

          {isAuthenticated ? (
            <UserMenu user={user} />
          ) : (
            <div className="flex items-center space-x-2">
              <Link
                href="/login"
                className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
              >
                Connexion
              </Link>
              <Link
                href="/register"
                className="inline-flex items-center justify-center rounded-md text-sm font-medium bg-primary-600 text-white hover:bg-primary-700 h-9 px-3 transition-colors"
              >
                S'inscrire
              </Link>
            </div>
          )}
        </div>
      </div>
    </header>
  )
}
