import React from 'react'
import Link from 'next/link'
import { ThemeToggle } from '../../lib/theme'

interface AuthLayoutProps {
  children: React.ReactNode
}

export default function AuthLayout({ children }: AuthLayoutProps) {
  return (
    <div className="relative min-h-screen overflow-hidden">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(90,93,253,0.2),transparent_60%)]" />
      <div className="pointer-events-none absolute inset-y-0 right-0 w-[40%] bg-[radial-gradient(circle_at_center,rgba(255,92,43,0.18),transparent_60%)]" />

      {/* Header minimal pour l'authentification */}
      <header className="relative z-10 border-b border-border/60 bg-background/70 backdrop-blur-lg">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/" className="group flex items-center space-x-3">
            <div className="relative flex h-10 w-10 items-center justify-center overflow-hidden rounded-2xl bg-gradient-to-br from-primary-600 via-primary-500 to-secondary-500 shadow-[0_18px_40px_-24px_rgba(90,93,253,0.75)]">
              <span className="text-white font-semibold">S</span>
              <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-[radial-gradient(circle_at_20%_20%,rgba(255,255,255,0.45),transparent_65%)]" />
            </div>
            <div className="hidden sm:flex flex-col">
              <span className="text-base font-semibold tracking-tight text-foreground">
                SummitStride
              </span>
              <span className="text-[11px] uppercase tracking-[0.28em] text-muted-foreground">
                Accès sécurisé
              </span>
            </div>
          </Link>

          <ThemeToggle size="sm" />
        </div>
      </header>

      {/* Contenu principal */}
      <main className="relative z-10 flex min-h-[calc(100vh-140px)] items-center justify-center px-4 py-16">
        <div className="w-full max-w-md rounded-3xl border border-border/70 bg-surface/95 p-8 shadow-[0_25px_65px_-45px_rgba(19,26,56,0.55)] backdrop-blur-2xl">
          <div className="mb-8 text-center">
            <p className="text-xs uppercase tracking-[0.3em] text-primary-600">
              SummitStride Access
            </p>
            <h1 className="mt-3 text-3xl font-bold text-foreground">
              Rejoignez l'expédition
            </h1>
            <p className="mt-2 text-sm text-muted-foreground">
              Un coaching ultra-trail personnalisé, une plateforme sécurisée.
            </p>
          </div>
          {children}
        </div>
      </main>

      {/* Footer minimal */}
      <footer className="relative z-10 border-t border-border/60 bg-background/70 backdrop-blur-lg">
        <div className="container mx-auto px-4 py-6 text-center">
          <p className="text-sm text-muted-foreground">
            © {new Date().getFullYear()} SummitStride • Ultra-trail IA unique
          </p>
        </div>
      </footer>
    </div>
  )
}
