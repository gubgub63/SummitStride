import React from 'react'
import Link from 'next/link'
import { ThemeToggle } from '../../lib/theme'

interface AuthLayoutProps {
  children: React.ReactNode
}

export default function AuthLayout({ children }: AuthLayoutProps) {
  return (
    <div className="min-h-screen bg-background">
      {/* Header minimal pour l'authentification */}
      <header className="absolute top-0 left-0 right-0 z-10">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center space-x-2">
            <div className="h-8 w-8 bg-gradient-to-br from-primary-600 to-primary-700 rounded-md flex items-center justify-center">
              <span className="text-white font-bold text-sm">C</span>
            </div>
            <span className="text-xl font-bold text-foreground hidden sm:block">
              Coach IA Hugo
            </span>
          </Link>

          <ThemeToggle size="sm" />
        </div>
      </header>

      {/* Contenu principal */}
      <main className="min-h-screen flex items-center justify-center px-4 py-12">
        {children}
      </main>

      {/* Footer minimal */}
      <footer className="absolute bottom-0 left-0 right-0">
        <div className="container mx-auto px-4 py-4 text-center">
          <p className="text-sm text-muted-foreground">
            © 2025 Coach IA Hugo - Votre entraîneur ultra-trail intelligent
          </p>
        </div>
      </footer>
    </div>
  )
}