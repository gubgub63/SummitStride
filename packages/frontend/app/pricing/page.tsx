'use client'

import React, { useMemo, useState } from 'react'
import Link from 'next/link'
import { Button } from '../../components/ui/Button'
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card'
import { ThemeToggle } from '../../lib/theme'

interface Plan {
  name: string
  badge?: string
  description: string
  price: {
    monthly: number
    yearly: number
  }
  highlight?: boolean
  cta: string
  url: string
  features: string[]
  extras?: string[]
}

const plans: Plan[] = [
  {
    name: 'Starter',
    badge: 'Gratuit',
    description: 'Démarrez avec les fondamentaux SummitStride et importez vos premières données.',
    price: { monthly: 0, yearly: 0 },
    cta: "Créer un compte",
    url: '/register',
    features: [
      '1 objectif ultra-trail suivi',
      'Synchronisation montre quotidienne',
      'Score de charge IA simplifié',
      '2 simulations course / mois',
    ],
    extras: ['Support communautaire', 'Exports PDF plan'],
  },
  {
    name: 'Summit Pro',
    badge: 'Le plus populaire',
    highlight: true,
    description: 'Notre pack signature avec IA adaptative, nutrition dynamique et visualisations avancées.',
    price: { monthly: 29, yearly: 290 },
    cta: 'Activer Summit Pro',
    url: '/register?plan=pro',
    features: [
      'IA Horizon™ illimitée (recalculs instantanés)',
      'Nutrition Flavora avec macros course & récupération',
      'Profils 3D, split pacing & météo anticipée',
      'Alertes charge & prévention blessure (IA fatigue)',
      'Jusqu’à 3 objectifs ultra-trail simultanés',
    ],
    extras: ['Support coaching 24h', 'Intégration TrainingPeaks®'],
  },
  {
    name: 'Apex Team',
    description: 'Pensé pour les clubs et collectifs : centralisation des athlètes et staff collaboratif.',
    price: { monthly: 79, yearly: 790 },
    cta: 'Planifier une démo',
    url: 'mailto:hello@summitstride.ai?subject=Demande%20Apex%20Team',
    features: [
      'Jusqu’à 12 athlètes connectés',
      'Bibliothèque de blocs IA partagée',
      'Suivi staff : kiné, nutritionniste, coach multi-rôles',
      'Analytics avancés (chroniques charges, readiness, climat)',
      'Salles de briefing dynamiques pour chaque course',
    ],
    extras: ['Onboarding personnalisé', 'SLA 12h et canal Slack'],
  },
]

const comparisonMatrix = [
  {
    label: 'Plans IA recalculés',
    starter: 'Jusqu’à 1 / semaine',
    pro: 'Illimités + scénarios météo',
    team: 'Illimités + librairie partagée',
  },
  {
    label: 'Nutrition dynamique',
    starter: 'Checklist de base',
    pro: 'Macros Flavora temps réel',
    team: 'Macros + suivi collectif',
  },
  {
    label: 'Prévention blessure',
    starter: 'Score fatigue simplifié',
    pro: 'IA fatigue + alertes recovery',
    team: 'Analyse staff + relances automatiques',
  },
  {
    label: 'Simulations & pacing',
    starter: '2 / mois',
    pro: 'Illimités + plan B météo',
    team: 'Illimités + comparatif athlètes',
  },
  {
    label: 'Support',
    starter: 'Communauté',
    pro: 'Coachs SummitStride 24h',
    team: 'SLA 12h + canal Slack privé',
  },
]

const faqs = [
  {
    question: 'Puis-je tester SummitStride avant de passer Pro ?',
    answer:
      'Oui, profitez de 14 jours d’essai complet de Summit Pro avec accès aux recalculs IA, visualisations premium et nutrition Flavora. Vous pouvez annuler à tout moment.',
  },
  {
    question: 'Comment fonctionne la facturation annuelle ?',
    answer:
      'Le paiement annuel applique deux mois offerts. Vous pouvez basculer entre mensuel et annuel sans frais supplémentaires à la date d’anniversaire.',
  },
  {
    question: 'Les plans conviennent-ils aux débutants ?',
    answer:
      'SummitStride s’adapte à tous les profils. L’IA modélise votre expérience, votre disponibilité et vos objectifs pour créer des blocs progressifs.',
  },
  {
    question: 'Quelles intégrations sont incluses ?',
    answer:
      'Garmin, Suunto, Coros, Polar, Strava et TrainingPeaks pour Summit Pro et Apex Team. Import CSV ouvert.',
  },
]

function formatPrice(price: number, cycle: 'monthly' | 'yearly') {
  if (price === 0) {
    return 'Gratuit'
  }
  return cycle === 'monthly' ? `${price} € / mois` : `${price} € / an`
}

export default function PricingPage() {
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('monthly')

  const savingsLabel = useMemo(() => (
    billingCycle === 'yearly' ? '2 mois offerts' : 'Facturation mensuelle flexible'
  ), [billingCycle])

  return (
    <div className="relative min-h-screen overflow-hidden">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_15%_10%,rgba(67,56,245,0.12),transparent_60%)]" />
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_85%_-10%,rgba(255,92,43,0.16),transparent_55%)]" />

      <header className="relative z-20 border-b border-border/60 bg-background/80 backdrop-blur-xl">
        <div className="container mx-auto flex h-20 items-center justify-between px-4">
          <Link href="/" className="group flex items-center space-x-3">
            <div className="relative flex h-10 w-10 items-center justify-center overflow-hidden rounded-2xl bg-gradient-to-br from-primary-600 via-primary-500 to-secondary-500 shadow-[0_18px_40px_-24px_rgba(90,93,253,0.75)]">
              <span className="text-white font-semibold">S</span>
              <div className="absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100 bg-[radial-gradient(circle_at_20%_20%,rgba(255,255,255,0.45),transparent_65%)]" />
            </div>
            <div className="flex flex-col">
              <span className="text-lg font-semibold tracking-tight text-foreground">SummitStride</span>
              <span className="text-xs uppercase tracking-[0.24em] text-muted-foreground">Plans & crédits</span>
            </div>
          </Link>
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
        <section className="container mx-auto px-4 py-20 lg:py-28">
          <div className="grid gap-12 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
            <div className="space-y-6">
              <span className="inline-flex items-center gap-2 rounded-full border border-primary-500/30 bg-primary-500/10 px-4 py-1 text-xs font-semibold uppercase tracking-[0.3em] text-primary-600">
                Tarifs transparents
                <span className="rounded-full bg-primary-600/10 px-2 py-0.5 text-[10px] text-primary-600">
                  {savingsLabel}
                </span>
              </span>
              <h1 className="text-4xl font-bold text-foreground md:text-6xl">
                Accédez à l'entraîneur ultra-trail qui scale avec vous
              </h1>
              <p className="text-lg text-muted-foreground md:text-xl">
                Choisissez votre intensité. SummitStride combine IA adaptative, nutrition dynamique et visualisations terrain pour transformer chaque préparation.
              </p>
              <div className="inline-flex items-center gap-2 rounded-full border border-border/60 bg-surface/80 p-2 backdrop-blur">
                <button
                  type="button"
                  onClick={() => setBillingCycle('monthly')}
                  className={`rounded-full px-4 py-2 text-sm font-medium transition ${
                    billingCycle === 'monthly'
                      ? 'bg-gradient-to-r from-primary-600 via-primary-500 to-secondary-500 text-white shadow-[0_12px_30px_-18px_rgba(90,93,253,0.6)]'
                      : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  Mensuel
                </button>
                <button
                  type="button"
                  onClick={() => setBillingCycle('yearly')}
                  className={`rounded-full px-4 py-2 text-sm font-medium transition ${
                    billingCycle === 'yearly'
                      ? 'bg-gradient-to-r from-primary-600 via-primary-500 to-secondary-500 text-white shadow-[0_12px_30px_-18px_rgba(90,93,253,0.6)]'
                      : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  Annuel
                </button>
              </div>
              <div className="flex flex-col gap-5 sm:flex-row">
                <div className="rounded-2xl border border-border/60 bg-surface/80 p-5 text-sm text-muted-foreground">
                  <p className="text-xs uppercase tracking-[0.32em] text-primary-600">Ce qui est inclus</p>
                  <p className="mt-2 text-foreground">
                    Synchronisation montres & plateformes, recalculs IA automatiques, nutrition paramétrique, scénarios météo, support humain.
                  </p>
                </div>
                <div className="rounded-2xl border border-primary-500/30 bg-primary-500/5 p-5 text-sm text-primary-600">
                  <p className="text-xs uppercase tracking-[0.32em]">Garantie finish line</p>
                  <p className="mt-2 text-foreground">
                    Si vous ne franchissez pas votre objectif, nous prolongeons Summit Pro gratuitement pour l'édition suivante.
                  </p>
                </div>
              </div>
            </div>

            <Card className="border-border/60 bg-surface/90">
              <CardHeader className="pb-4">
                <CardTitle className="text-lg text-foreground">Projection budget annuel</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 text-sm text-muted-foreground">
                <div className="flex items-center justify-between rounded-2xl border border-border/60 bg-background/70 p-4">
                  <div>
                    <p className="text-xs uppercase tracking-[0.3em]">Cycle</p>
                    <p className="text-base font-semibold text-foreground">
                      {billingCycle === 'monthly' ? 'Mensuel flexible' : 'Annuel - 2 mois offerts'}
                    </p>
                  </div>
                  <p className="text-xl font-bold text-primary-600">
                    {billingCycle === 'monthly' ? '29 €' : '290 €'}
                  </p>
                </div>
                <p>
                  Paiement 100% sécurisé. Annulation possible à tout moment directement depuis votre espace client. TVA incluse, facture automatique.
                </p>
                <Button asChild variant="glow" size="lg" className="w-full">
                  <Link href="/register?plan=pro">Tester Summit Pro pendant 14 jours</Link>
                </Button>
              </CardContent>
            </Card>
          </div>
        </section>

        <section className="container mx-auto px-4 pb-20">
          <div className="grid gap-6 lg:grid-cols-3">
            {plans.map(plan => {
              const price = billingCycle === 'monthly' ? plan.price.monthly : plan.price.yearly
              const isHighlight = Boolean(plan.highlight)
              return (
                <Card
                  key={plan.name}
                  variant={isHighlight ? 'gradient' : 'default'}
                  className={`${isHighlight ? 'text-white shadow-[0_35px_110px_-70px_rgba(90,93,253,0.85)]' : 'bg-surface/85'} ${
                    plan.name === 'Starter' ? 'border-border/60' : ''
                  }`}
                >
                  <CardContent className="space-y-6 p-8">
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-xs uppercase tracking-[0.3em] opacity-80">{plan.name}</p>
                          <p className={`text-3xl font-bold ${isHighlight ? 'text-white' : 'text-foreground'}`}>
                            {formatPrice(price, billingCycle)}
                          </p>
                        </div>
                        {plan.badge && (
                          <span className="rounded-full bg-background/20 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em]">
                            {plan.badge}
                          </span>
                        )}
                      </div>
                      <p className={`text-sm ${isHighlight ? 'text-white/90' : 'opacity-90'}`}>
                        {plan.description}
                      </p>
                    </div>

                    <Button
                      asChild
                      size="lg"
                      variant={isHighlight ? 'default' : 'glow'}
                      className="w-full"
                    >
                      <Link href={plan.url}>{plan.cta}</Link>
                    </Button>

                    <div className="space-y-3 text-sm">
                      <p className="text-xs uppercase tracking-[0.3em] opacity-70">Ce que vous obtenez</p>
                      <ul className="space-y-3">
                        {plan.features.map(feature => (
                          <li key={feature} className="flex items-start gap-3">
                            <span className={`mt-1 inline-flex h-2.5 w-2.5 rounded-full ${
                              isHighlight
                                ? 'bg-white'
                                : 'bg-gradient-to-br from-primary-500 to-secondary-500'
                            }`} />
                            <span className={`${isHighlight ? 'text-white/90' : 'text-foreground/90'}`}>
                              {feature}
                            </span>
                          </li>
                        ))}
                      </ul>
                      {plan.extras && (
                        <div className="mt-4 rounded-xl border border-border/40 bg-background/60 p-4 text-xs uppercase tracking-[0.24em] text-muted-foreground">
                          Bonus • {plan.extras.join(' • ')}
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        </section>

        <section className="container mx-auto px-4 py-16">
          <div className="rounded-3xl border border-border/60 bg-surface/90 p-8">
            <p className="text-xs uppercase tracking-[0.3em] text-primary-600">Comparer en détail</p>
            <div className="mt-6 overflow-hidden rounded-2xl border border-border/60">
              <table className="w-full border-collapse text-left text-sm">
                <thead className="bg-background/80 text-muted-foreground">
                  <tr>
                    <th className="px-6 py-4 text-xs uppercase tracking-[0.26em]">Fonctionnalité</th>
                    <th className="px-6 py-4 text-xs uppercase tracking-[0.26em]">Starter</th>
                    <th className="px-6 py-4 text-xs uppercase tracking-[0.26em]">Summit Pro</th>
                    <th className="px-6 py-4 text-xs uppercase tracking-[0.26em]">Apex Team</th>
                  </tr>
                </thead>
                <tbody>
                  {comparisonMatrix.map((row, index) => (
                    <tr key={row.label} className={index % 2 === 0 ? 'bg-background/40' : 'bg-background/60'}>
                      <td className="px-6 py-4 font-medium text-foreground">{row.label}</td>
                      <td className="px-6 py-4 text-muted-foreground">{row.starter}</td>
                      <td className="px-6 py-4 text-primary-600">{row.pro}</td>
                      <td className="px-6 py-4 text-muted-foreground">{row.team}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </section>

        <section className="container mx-auto px-4 pb-24">
          <div className="grid gap-6 md:grid-cols-2">
            {faqs.map(item => (
              <Card key={item.question} className="border-border/60 bg-surface/90">
                <CardContent className="space-y-3 p-6">
                  <p className="text-sm font-semibold text-foreground">{item.question}</p>
                  <p className="text-sm text-muted-foreground">{item.answer}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        <section className="container mx-auto px-4 pb-28">
          <div className="rounded-[2.5rem] border border-primary-500/30 bg-primary-500/10 p-10 text-center backdrop-blur">
            <span className="text-xs uppercase tracking-[0.32em] text-primary-600">Encore une hésitation ?</span>
            <h2 className="mt-4 text-4xl font-bold text-foreground md:text-5xl">
              Planifiez une session avec un coach SummitStride
            </h2>
            <p className="mt-4 text-lg text-muted-foreground">
              Nous analysons votre saison, vos courses clés et nous configurons la plateforme pour vous en 30 minutes.
            </p>
            <div className="mt-8 flex flex-col justify-center gap-4 sm:flex-row">
              <Button asChild size="xl">
                <Link href="https://cal.com/summitstride/demo" target="_blank">
                  Réserver une démo live
                </Link>
              </Button>
              <Button asChild variant="glow" size="xl">
                <Link href="mailto:hello@summitstride.ai?subject=Questions%20tarifs">Parler à l'équipe</Link>
              </Button>
            </div>
          </div>
        </section>
      </main>
    </div>
  )
}
