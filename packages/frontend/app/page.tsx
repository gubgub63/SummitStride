'use client'

import React, { useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Button } from '../components/ui/Button'
import { Card, CardContent, CardHeader, CardTitle, StatsCard } from '../components/ui/Card'
import { ThemeToggle } from '../lib/theme'
import { useAuth } from '../lib/hooks/useAuth'

const heroStats = [
  {
    title: 'Plans IA générés',
    value: '12k',
    subtitle: 'en 2024',
    trend: { value: 38, isPositive: true },
    icon: (
      <svg className="h-7 w-7" viewBox="0 0 24 24" fill="none" stroke="currentColor">
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={1.7}
          d="M12 6v12m6-6H6"
        />
      </svg>
    ),
  },
  {
    title: 'Finishers ultra',
    value: '92%',
    subtitle: 'taux de réussite',
    trend: { value: 12, isPositive: true },
    icon: (
      <svg className="h-7 w-7" viewBox="0 0 24 24" fill="none" stroke="currentColor">
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={1.7}
          d="M3 7h4l2 9h8l2-9h2"
        />
      </svg>
    ),
  },
  {
    title: 'Minutes gagnées',
    value: '47 min',
    subtitle: 'par course préparée',
    icon: (
      <svg className="h-7 w-7" viewBox="0 0 24 24" fill="none" stroke="currentColor">
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={1.7}
          d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
        />
      </svg>
    ),
  },
]

const featureHighlights = [
  {
    title: 'Coaching IA adaptatif',
    description:
      "Notre moteur Horizon modélise 180 paramètres (VO2max, charges internes, sommeil, météo) et ajuste vos blocs d'entraînement en 32 secondes.",
    icon: '🧠',
    benefits: ['Plans recalculés en direct', 'Détection automatique de fatigue', 'Alertes météo & chaleur'],
  },
  {
    title: 'Nutrition intelligente',
    description:
      'Intégration Flavora™ avec macros dynamiques, recommandations de menus et gestion de vos préférences ou intolérances.',
    icon: '🥗',
    benefits: ['Plans nutritionnels personnalisés', 'Mode course et récupération', 'Checklist ravito ready'],
  },
  {
    title: 'Simulation terrain',
    description:
      'Visualisez vos efforts grâce aux profils d’altitude, segments critiques et pacing recommandé pour chaque portion.',
    icon: '🗻',
    benefits: ['Cartes 3D interactives', 'Gestion de la dérive cardiaque', 'Plan B météo en 1 clic'],
  },
]

const aiPipeline = [
  {
    step: '1. Analyse biométrique',
    title: 'Vos données, notre ADN',
    detail:
      'Synchronisez vos montres Garmin, Coros ou Suunto. Notre IA fusionne HRV, puissance, sommeil et sensation de fatigue pour créer votre empreinte de coureur.',
  },
  {
    step: '2. Stratégie dynamique',
    title: 'Micro-ajustements quotidiens',
    detail:
      'Chaque matin, un score de charge optimal et des recommandations de récupération. Les séances clés sont modulées selon votre énergie réelle.',
  },
  {
    step: '3. Anticipation course',
    title: 'Scénarios multi-météo',
    detail:
      'Nous simulons plusieurs scénarios de course et ajustons pacing, nutrition et fenêtres de sommeil pour sécuriser votre finish line.',
  },
]

const partnershipLogos = ['UTMB Index', 'Flavora', 'Suunto', 'Coros', 'Polar']

const testimonials = [
  {
    name: 'Lucie, finisher Diagonale des Fous',
    role: 'Ultra-traileuse & coach club',
    quote:
      "SummitStride a recalibré mon bloc choc après une blessure micro. L'IA a repositionné les intensités et j'ai signé mon meilleur chrono sur 170 km.",
  },
  {
    name: 'Nassim, Team Trail France',
    role: 'Athlète élite',
    quote:
      "La visualisation énergie/cadence en temps réel m'a permis d'optimiser mes descentes. J'ai gagné 6 minutes sur ma montée de référence.",
  },
]

const pricingTeasers = [
  {
    title: 'Starter - Gratuit',
    description: 'Plan découverte AI, 1 objectif et suivi forme hebdo.',
    price: '0€',
    url: '/register',
  },
  {
    title: 'Summit Pro',
    description: 'Coaching IA complet, nutrition Flavora et plan course premium.',
    price: '29€ / mois',
    url: '/pricing',
  },
]

export default function HomePage() {
  const router = useRouter()
  const { isAuthenticated, isLoading } = useAuth()

  useEffect(() => {
    if (!isLoading && isAuthenticated) {
      router.push('/dashboard')
    }
  }, [isAuthenticated, isLoading, router])

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="flex flex-col items-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
          <p className="text-sm text-muted-foreground">Préparation du cockpit...</p>
        </div>
      </div>
    )
  }

  if (isAuthenticated) {
    return null
  }

  return (
    <div className="relative min-h-screen overflow-hidden">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_10%_10%,rgba(67,56,245,0.12),transparent_60%)]" />
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_80%_0%,rgba(255,92,43,0.15),transparent_55%)]" />

      <header className="relative z-20 border-b border-border/60 bg-background/80 backdrop-blur-xl">
        <div className="container mx-auto flex h-20 items-center justify-between px-4">
          <Link href="/" className="group flex items-center space-x-3">
            <div className="relative flex h-10 w-10 items-center justify-center overflow-hidden rounded-2xl bg-gradient-to-br from-primary-600 via-primary-500 to-secondary-500 shadow-[0_18px_40px_-24px_rgba(90,93,253,0.75)]">
              <span className="text-white font-semibold">S</span>
              <div className="absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100 bg-[radial-gradient(circle_at_20%_20%,rgba(255,255,255,0.45),transparent_65%)]" />
            </div>
            <div className="flex flex-col">
              <span className="text-lg font-semibold tracking-tight text-foreground">SummitStride</span>
              <span className="text-xs uppercase tracking-[0.24em] text-muted-foreground">Ultra-trail intelligence</span>
            </div>
          </Link>

          <nav className="hidden md:flex items-center space-x-6 text-sm font-medium text-muted-foreground">
            <Link href="#features" className="transition hover:text-foreground">
              Capacités
            </Link>
            <Link href="#ia" className="transition hover:text-foreground">
              Pipeline IA
            </Link>
            <Link href="#temoignages" className="transition hover:text-foreground">
              Témoignages
            </Link>
            <Link href="/pricing" className="transition hover:text-foreground">
              Tarifs
            </Link>
          </nav>

          <div className="flex items-center space-x-3">
            <ThemeToggle size="sm" />
            <Button asChild variant="ghost" size="sm" className="hidden md:inline-flex">
              <Link href="/login">Connexion</Link>
            </Button>
            <Button asChild size="sm">
              <Link href="/register">Commencer</Link>
            </Button>
          </div>
        </div>
      </header>

      <main className="relative z-10">
        <section className="relative overflow-hidden">
          <div className="absolute inset-0 -z-10 bg-gradient-to-b from-primary-600/10 via-background to-background" />
          <div className="container mx-auto px-4 py-24 lg:py-32">
            <div className="grid gap-16 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
              <div className="space-y-8">
                <span className="inline-flex items-center rounded-full border border-primary-500/30 bg-primary-500/10 px-4 py-1 text-xs font-semibold uppercase tracking-[0.3em] text-primary-600">
                  IA de montagne nouvelle génération
                </span>
                <h1 className="text-balance text-4xl font-bold leading-tight text-foreground md:text-6xl">
                  Anticipez chaque dénivelé avec une
                  <span className="block bg-gradient-to-r from-primary-600 via-primary-500 to-secondary-500 bg-clip-text text-transparent">
                    intelligence de course proactive
                  </span>
                </h1>
                <p className="text-lg text-muted-foreground md:text-xl">
                  SummitStride orchestre votre saison ultra-trail : plans adaptés, nutrition synchronisée, simulations terrain et monitoring en temps réel.
                  Vous restez concentré sur l'essentiel — franchir la ligne au sommet.
                </p>
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
                  <Button size="xl" className="w-full sm:w-auto">
                    <Link href="/register" className="flex items-center gap-3">
                      <span>Lancer mon plan IA</span>
                      <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M5 12h13m0 0-6-6m6 6-6 6" />
                      </svg>
                    </Link>
                  </Button>
                  <Button asChild variant="glow" size="xl" className="w-full sm:w-auto">
                    <Link href="/pricing">Explorer les offres</Link>
                  </Button>
                </div>
                <div className="flex flex-wrap items-center gap-6 text-sm text-muted-foreground">
                  <div className="flex items-center gap-2">
                    <div className="flex -space-x-2">
                      {[0, 1, 2, 3, 4].map(i => (
                        <span
                          key={i}
                          className="inline-flex h-8 w-8 items-center justify-center overflow-hidden rounded-full border border-background bg-gradient-to-br from-primary-600 via-primary-500 to-secondary-500 text-xs font-semibold text-white"
                        >
                          {['L', 'N', 'S', 'A', 'M'][i]}
                        </span>
                      ))}
                    </div>
                    <span>3 200+ traileurs actifs</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <svg className="h-5 w-5 text-secondary-500" viewBox="0 0 20 20" fill="currentColor">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                    <span>Note 4.9/5 sur les courses > 100 km</span>
                  </div>
                </div>
              </div>

              <div className="relative">
                <div className="absolute -inset-6 rounded-[2.5rem] bg-gradient-to-br from-primary-500/15 to-secondary-500/15 blur-3xl" />
                <Card className="relative overflow-hidden border border-primary-500/20 bg-surface/90">
                  <CardHeader className="border-b border-border/70 pb-4">
                    <CardTitle className="flex items-center justify-between text-lg">
                      Prévisualisation du cockpit
                      <span className="text-sm font-normal text-primary-600">Mode course</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6 pt-6">
                    <div className="grid gap-4 sm:grid-cols-3">
                      {heroStats.map(item => (
                        <StatsCard
                          key={item.title}
                          title={item.title}
                          value={item.value}
                          subtitle={item.subtitle}
                          icon={item.icon}
                          trend={item.trend}
                        />
                      ))}
                    </div>
                    <div className="grid gap-4 sm:grid-cols-2">
                      <div className="rounded-2xl border border-border/60 bg-background/70 p-5">
                        <p className="text-xs uppercase tracking-[0.35em] text-muted-foreground">
                          Nutrition Flavora
                        </p>
                        <p className="mt-2 text-sm text-foreground">
                          Gel caféiné à T2 · Réserve solide 320 kcal · Hydro mix électrolytes toutes les 25 min.
                        </p>
                      </div>
                      <div className="rounded-2xl border border-primary-500/20 bg-primary-500/5 p-5">
                        <p className="text-xs uppercase tracking-[0.35em] text-primary-600">
                          Vigilance IA
                        </p>
                        <p className="mt-2 text-sm text-foreground">
                          Risque météo : orage à H+6 • Ajustement pacing -4% • Plan B nutrition hybride.
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </section>

        <section id="features" className="container mx-auto px-4 py-24">
          <div className="mb-16 flex flex-col items-center text-center">
            <span className="text-xs uppercase tracking-[0.3em] text-primary-600">
              Capacités SummitStride
            </span>
            <h2 className="mt-4 text-balance text-4xl font-bold text-foreground md:text-5xl">
              Une suite complète pour piloter votre saison ultra-trail
            </h2>
            <p className="mt-4 max-w-3xl text-lg text-muted-foreground">
              Chaque module est pensé avec des athlètes, préparateurs physiques et nutritionnistes pour délivrer un accompagnement unique.
            </p>
          </div>

          <div className="grid gap-8 lg:grid-cols-3">
            {featureHighlights.map(feature => (
              <Card key={feature.title} className="group border-border/60 bg-surface/80">
                <CardHeader className="pb-4">
                  <div className="flex items-center gap-3 text-2xl">
                    <span>{feature.icon}</span>
                    <CardTitle className="text-xl font-semibold text-foreground">
                      {feature.title}
                    </CardTitle>
                  </div>
                </CardHeader>
                <CardContent className="space-y-6 text-sm text-muted-foreground">
                  <p>{feature.description}</p>
                  <ul className="space-y-3">
                    {feature.benefits.map(item => (
                      <li key={item} className="flex items-start gap-3 text-foreground">
                        <span className="mt-1 h-2 w-2 rounded-full bg-gradient-to-br from-primary-500 to-secondary-500" />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        <section id="ia" className="relative overflow-hidden py-24">
          <div className="absolute inset-0 -z-10 bg-gradient-to-br from-primary-600/10 via-background to-background" />
          <div className="container mx-auto px-4">
            <div className="grid gap-12 lg:grid-cols-2 lg:items-center">
              <div className="space-y-6">
                <span className="text-xs uppercase tracking-[0.3em] text-primary-600">
                  Pipeline intelligent
                </span>
                <h2 className="text-4xl font-bold text-foreground md:text-5xl">
                  Une IA de terrain qui apprend de chaque sortie
                </h2>
                <p className="text-lg text-muted-foreground">
                  SummitStride n'est pas un plan statique. C'est une IA de montagne qui profile votre résilience, détecte les signaux faibles et ajuste votre stratégie.
                </p>
                <div className="mt-8 flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                  {partnershipLogos.map(logo => (
                    <span
                      key={logo}
                      className="rounded-full border border-border/50 bg-surface/80 px-4 py-2 uppercase tracking-[0.18em]"
                    >
                      {logo}
                    </span>
                  ))}
                </div>
              </div>

              <div className="space-y-6">
                {aiPipeline.map(stage => (
                  <Card key={stage.step} className="border-border/60 bg-surface/90">
                    <CardHeader className="pb-2">
                      <p className="text-xs uppercase tracking-[0.28em] text-primary-600">
                        {stage.step}
                      </p>
                      <CardTitle className="text-lg text-foreground">{stage.title}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-muted-foreground">{stage.detail}</p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section className="container mx-auto px-4 py-24">
          <div className="grid gap-10 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
            <div className="space-y-6">
              <span className="text-xs uppercase tracking-[0.3em] text-primary-600">
                Témoignages terrain
              </span>
              <h2 className="text-4xl font-bold text-foreground md:text-5xl">
                Des finishers qui transforment leurs limites
              </h2>
              <p className="text-lg text-muted-foreground">
                Des athlètes amateurs aux élites, SummitStride accompagne la progression, sécurise la charge et scénarise la course jusque dans les détails.
              </p>
              <div className="grid gap-5 sm:grid-cols-2">
                <Card variant="outline" className="border-primary-500/30 bg-primary-500/5">
                  <CardContent className="space-y-2 text-sm text-primary-600">
                    <p className="text-xs uppercase tracking-[0.32em]">Impact mesuré</p>
                    <p className="text-2xl font-semibold text-foreground">+28% de VO2max moyenne</p>
                    <p>chez les athlètes suivis 6 mois avec SummitStride Pro.</p>
                  </CardContent>
                </Card>
                <Card variant="outline" className="border-secondary-500/40 bg-secondary-500/5">
                  <CardContent className="space-y-2 text-sm text-secondary-600">
                    <p className="text-xs uppercase tracking-[0.32em]">Prévention</p>
                    <p className="text-2xl font-semibold text-foreground">-42% de blessures</p>
                    <p>grâce aux alertes de charge et à la modulation automatique.</p>
                  </CardContent>
                </Card>
              </div>
            </div>

            <div className="space-y-6">
              {testimonials.map(testimonial => (
                <Card key={testimonial.name} className="border-border/60 bg-surface/90">
                  <CardContent className="space-y-4 p-7">
                    <p className="text-lg font-medium text-foreground">“{testimonial.quote}”</p>
                    <div className="flex items-center gap-3 text-sm text-muted-foreground">
                      <div className="flex h-10 w-10 items-center justify-center rounded-full border border-border/60 bg-surface">
                        <span>{testimonial.name.charAt(0)}</span>
                      </div>
                      <div>
                        <p className="font-semibold text-foreground">{testimonial.name}</p>
                        <p>{testimonial.role}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        <section id="pricing" className="relative overflow-hidden py-24">
          <div className="absolute inset-0 -z-10 bg-gradient-to-br from-primary-600/15 via-primary-500/10 to-secondary-500/10" />
          <div className="container mx-auto px-4">
            <div className="mb-12 text-center">
              <span className="text-xs uppercase tracking-[0.3em] text-primary-600">
                Plans pour chaque sommet
              </span>
              <h2 className="mt-4 text-4xl font-bold text-foreground md:text-5xl">
                Choisissez votre intensité, nous gérons le reste
              </h2>
              <p className="mt-4 text-lg text-muted-foreground">
                Tarifs transparents, accès immédiat. Retrouvez le détail complet et les bonus sur la page tarifs.
              </p>
            </div>
            <div className="grid gap-6 lg:grid-cols-2">
              {pricingTeasers.map(plan => (
                <Card
                  key={plan.title}
                  variant={plan.title === 'Summit Pro' ? 'gradient' : 'default'}
                  className={plan.title === 'Summit Pro' ? 'text-white' : ''}
                >
                  <CardContent className="space-y-4 p-8">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-xs uppercase tracking-[0.3em]">
                          {plan.title}
                        </p>
                        <p className="mt-2 text-3xl font-bold">{plan.price}</p>
                      </div>
                      <Button asChild variant={plan.title === 'Summit Pro' ? 'default' : 'glow'} size="sm">
                        <Link href={plan.url}>
                          {plan.title === 'Summit Pro' ? 'Découvrir Pro' : 'Je commence'}
                        </Link>
                      </Button>
                    </div>
                    <p className="text-sm opacity-90">{plan.description}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        <section className="container mx-auto px-4 py-24">
          <div className="rounded-[2.5rem] border border-border/60 bg-surface/90 p-10 text-center shadow-[0_40px_120px_-70px_rgba(19,26,56,0.65)]">
            <span className="text-xs uppercase tracking-[0.35em] text-primary-600">
              Prêt pour votre prochain sommet ?
            </span>
            <h2 className="mt-4 text-4xl font-bold text-foreground md:text-5xl">
              Lancez votre saison ultra-trail avec SummitStride
            </h2>
            <p className="mt-4 text-lg text-muted-foreground">
              14 jours pour tester la plateforme, importer vos données et explorer les recommandations IA.
            </p>
            <div className="mt-8 flex flex-col justify-center gap-4 sm:flex-row">
              <Button size="xl">
                <Link href="/register">Créer mon compte gratuit</Link>
              </Button>
              <Button asChild variant="glow" size="xl">
                <Link href="/pricing">Comparer les offres</Link>
              </Button>
            </div>
          </div>
        </section>
      </main>

      <footer className="relative z-10 border-t border-border/60 bg-background/80 backdrop-blur-xl">
        <div className="container mx-auto flex flex-col gap-6 px-4 py-10 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-sm font-semibold text-foreground">SummitStride</p>
            <p className="text-sm text-muted-foreground">
              L'entraîneur ultra-trail qui anticipe chaque dénivelé avec vous.
            </p>
          </div>
          <div className="flex flex-wrap gap-6 text-sm text-muted-foreground">
            <Link href="/pricing" className="transition hover:text-foreground">
              Tarifs
            </Link>
            <Link href="/design-system" className="transition hover:text-foreground">
              Design System
            </Link>
            <Link href="/register" className="transition hover:text-foreground">
              S'inscrire
            </Link>
          </div>
          <p className="text-xs text-muted-foreground">
            © {new Date().getFullYear()} SummitStride. Tous droits réservés.
          </p>
        </div>
      </footer>
    </div>
  )
}
