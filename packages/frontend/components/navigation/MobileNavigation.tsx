/**
 * MobileNavigation - Composant d'apprentissage React Phase 4.8
 *
 * 🎯 TON DÉFI : Créer une navigation mobile responsive !
 *
 * Concepts React à apprendre dans ce composant :
 * ✅ useState - Gérer l'état d'ouverture/fermeture du menu
 * ✅ useEffect - Gérer les événements de redimensionnement
 * ✅ useResponsive - Hook personnalisé pour la responsivité
 * ✅ Conditional rendering - Afficher/masquer selon l'état
 * ✅ Event handlers - Gérer les clics et interactions
 * ✅ CSS classes conditionnelles - Animations et transitions
 * ✅ Touch-friendly design - Optimisation pour mobile
 * ✅ Accessibility - Navigation accessible au clavier
 *
 * 📋 INSTRUCTIONS POUR TOI :
 *
 * 1. Utilise useState pour gérer l'état isMenuOpen (booléen)
 * 2. Utilise useResponsive pour détecter si on est sur mobile
 * 3. Crée le bouton hamburger avec animation vers X
 * 4. Implémente le menu déroulant avec overlay
 * 5. Ajoute les liens de navigation avec état actif
 * 6. Gère la fermeture du menu sur clic outside
 * 7. Optimise pour l'accessibilité (ARIA, focus)
 *
 * 💡 AIDE :
 * - Regarde les styles dans mobile.css
 * - Utilise les classes CSS prêtes (.hamburger-menu, .mobile-menu-panel)
 * - Inspire-toi de Header.tsx pour la structure des liens
 * - Les animations sont déjà définies dans le CSS !
 */

'use client'

import React, { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useResponsive } from '../../lib/hooks/useResponsive'
import { useAuth } from '../../lib/contexts/AuthContext'

interface MobileNavigationProps {
  className?: string
}

// 🎯 Types pour les liens de navigation
interface NavLink {
  href: string
  label: string
  icon?: string
}

// 🎯 Configuration des liens (comme dans Header.tsx)
const navigationLinks: NavLink[] = [
  { href: '/dashboard', label: 'Tableau de bord', icon: '📊' },
  { href: '/training', label: 'Entraînement', icon: '🏃' },
  { href: '/nutrition', label: 'Nutrition', icon: '🥗' },
  { href: '/premium', label: 'Premium', icon: '💎' },
  { href: '/profile', label: 'Profil', icon: '👤' },
]

export function MobileNavigation({ className = '' }: MobileNavigationProps) {
  const pathname = usePathname()
  const { isMobile } = useResponsive()
  const { logout } = useAuth()

  // 🎯 TON CODE ICI - useState pour l'état du menu
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  // Refs pour gérer les clics outside
  const menuRef = useRef<HTMLDivElement>(null)
  const buttonRef = useRef<HTMLButtonElement>(null)

  // 🎯 TON CODE ICI - useEffect pour gérer les événements
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        menuRef.current &&
        buttonRef.current &&
        !menuRef.current.contains(event.target as Node) &&
        !buttonRef.current.contains(event.target as Node)
      ) {
        setIsMenuOpen(false)
      }
    }

    const handleEscapeKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsMenuOpen(false)
      }
    }

    if (isMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside)
      document.addEventListener('keydown', handleEscapeKey)
      // Empêcher le scroll du body quand le menu est ouvert
      document.body.style.overflow = 'hidden'
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
      document.removeEventListener('keydown', handleEscapeKey)
      document.body.style.overflow = 'unset'
    }
  }, [isMenuOpen])

  // 🎯 TON CODE ICI - useEffect pour fermer le menu sur changement de route
  useEffect(() => {
    setIsMenuOpen(false)
  }, [pathname])

  // 🎯 TON CODE ICI - Fonction pour toggle le menu
  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen)
  }

  // 🎯 TON CODE ICI - Fonction pour fermer le menu
  const closeMenu = () => {
    setIsMenuOpen(false)
  }

  // Ne s'affiche que sur mobile
  if (!isMobile) {
    return null
  }

  return (
    <div className={`mobile-nav ${className}`}>
      <div className="flex items-center justify-between h-16 px-4">
        {/* Logo */}
        <Link href="/dashboard" className="flex items-center space-x-2">
          <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-green-500 rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-sm">S</span>
          </div>
          <span className="font-bold text-lg text-foreground">SummitStride</span>
        </Link>

        <button
          ref={buttonRef}
          onClick={toggleMenu}
          className={`hamburger-menu mobile-touch-target ${isMenuOpen ? 'open' : ''}`}
          aria-label={isMenuOpen ? 'Fermer le menu' : 'Ouvrir le menu'}
          aria-expanded={isMenuOpen}
          aria-controls="mobile-menu"
        >
          <span className="hamburger-line"></span>
          <span className="hamburger-line"></span>
          <span className="hamburger-line"></span>
        </button>
      </div>

      <div
        className={`mobile-menu-overlay ${isMenuOpen ? 'open' : ''}`}
        onClick={closeMenu}
        aria-hidden="true"
      />

      <nav
        ref={menuRef}
        id="mobile-menu"
        className={`mobile-menu-panel ${isMenuOpen ? 'open' : ''}`}
        aria-hidden={!isMenuOpen}
      >
        <div className="py-4">
          {navigationLinks.map(link => {
            const isActive = pathname === link.href

            return (
              <Link
                key={link.href}
                href={link.href}
                className={`mobile-nav-item ${isActive ? 'active' : ''}`}
                onClick={closeMenu}
              >
                <span className="mr-3">{link.icon}</span>
                <span>{link.label}</span>
                {isActive && (
                  <span className="ml-auto text-blue-600">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" />
                    </svg>
                  </span>
                )}
              </Link>
            )
          })}

          {/* Section supplémentaire */}
          <div className="mobile-nav-item border-t border-gray-200 mt-4 pt-4">
            <Link href="/settings" className="mobile-nav-item" onClick={closeMenu}>
              <span className="mr-3">⚙️</span>
              <span>Paramètres</span>
            </Link>

            <button
              className="mobile-nav-item w-full text-left text-red-600"
              onClick={() => {
                closeMenu()
                logout()
                console.log('Déconnexion')
              }}
            >
              <span className="mr-3">🚪</span>
              <span>Déconnexion</span>
            </button>
          </div>
        </div>
      </nav>
    </div>
  )
}
