'use client'

/**
 * Header Navigation - SummitStride
 * Composant de navigation principal pour les pages authentifiées
 */

import React from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { ThemeToggle } from '../../lib/theme'
import { UserMenu } from './UserMenu'
import { MobileNavigation } from './MobileNavigation'
import { useAuth } from '../../lib/hooks/useAuth'
import { useResponsive } from '../../lib/hooks/useResponsive'
import { Button } from '../ui/Button'

const navigationLinks = [
  { href: '/dashboard', label: 'Tableau de bord' },
  { href: '/training', label: 'Entraînement' },
  { href: '/courses', label: 'Courses' },
  { href: '/nutrition', label: 'Nutrition' },
  { href: '/registrations', label: 'Inscriptions' },
  { href: '/premium', label: 'Premium' },
]

export function Header() {
  const { isAuthenticated, user } = useAuth()
  const { isMobile } = useResponsive()
  const pathname = usePathname()

  // Sur mobile, utiliser MobileNavigation
  if (isMobile && isAuthenticated) {
    return <MobileNavigation />
  }

  return (
    <header className="sticky top-0 z-50 w-full">
      <div className="h-px w-full bg-gradient-to-r from-transparent via-primary-500/30 to-transparent" />
      <div className="border-b border-border/60 bg-background/70 backdrop-blur-xl supports-[backdrop-filter]:bg-background/40">
        <div className="container mx-auto px-4 h-20 flex items-center justify-between">
          {/* Logo et nom */}
          <Link
            href={isAuthenticated ? '/dashboard' : '/'}
            className="group flex items-center space-x-3"
          >
            <div className="relative flex h-11 w-11 items-center justify-center overflow-hidden rounded-2xl bg-gradient-to-br from-primary-600 via-primary-500 to-secondary-500 shadow-[0_18px_40px_-24px_rgba(90,93,253,0.75)] transition-transform duration-200 group-hover:scale-105">
              <span className="text-white font-semibold text-lg">S</span>
              <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-[radial-gradient(circle_at_20%_20%,rgba(255,255,255,0.45),transparent_65%)]" />
            </div>
            <div className="hidden sm:flex flex-col">
              <span className="text-lg font-semibold tracking-tight text-foreground">
                SummitStride
              </span>
              <span className="text-xs uppercase tracking-[0.24em] text-muted-foreground">
                Ultra-trail intelligence
              </span>
            </div>
          </Link>

          {/* Navigation */}
          {isAuthenticated && (
            <nav className="hidden lg:flex items-center gap-2 rounded-full border border-border/70 bg-surface/70 px-2 py-1 backdrop-blur-md">
              {navigationLinks.map(link => {
                const isActive = pathname?.startsWith(link.href)

                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={`relative flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium transition-all duration-200 ${
                      isActive
                        ? 'text-foreground shadow-[0_12px_28px_-22px_rgba(67,56,245,0.55)]'
                        : 'text-muted-foreground hover:text-foreground'
                    }`}
                  >
                    {isActive && (
                      <span className="absolute inset-0 -z-10 rounded-full bg-gradient-to-r from-primary-600/85 via-primary-500/75 to-primary-500/60 opacity-90" />
                    )}
                    {link.label}
                  </Link>
                )
              })}
            </nav>
          )}

          {/* Actions */}
          <div className="flex items-center space-x-3">
            <ThemeToggle size="sm" />

            {isAuthenticated ? (
              <div className="flex items-center space-x-2">
                <Button
                  asChild
                  variant="ghost"
                  size="sm"
                  className="hidden md:inline-flex text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground"
                >
                  <Link href="/progress">Progression</Link>
                </Button>
                <Button asChild variant="glow" size="sm">
                  <Link href="/premium">Boost IA</Link>
                </Button>
                <UserMenu user={user} />
              </div>
            ) : (
              <div className="flex items-center space-x-2">
                <Link
                  href="/login"
                  className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
                >
                  Connexion
                </Link>
                <Button asChild size="sm">
                  <Link href="/register">Commencer</Link>
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  )
}
