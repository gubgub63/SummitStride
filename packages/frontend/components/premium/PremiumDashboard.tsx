'use client'

import React, { useEffect, useMemo, useState } from 'react'
import { Card, CardHeader, CardTitle, CardContent } from '../ui/Card'
import { Button } from '../ui/Button'
import premiumService from '../../lib/services/premiumService'
import type {
  CreditBalanceSummary,
  CreditTransactionSummary,
  SubscriptionPlanSummary,
} from '@summitstride/shared'

interface FetchState<T> {
  data: T | null
  loading: boolean
  error: string | null
}

const TRANSACTION_TYPE_LABELS: Record<string, string> = {
  CREDIT_PURCHASE: 'Achat de crédits',
  CREDIT_CONSUMPTION: 'Consommation',
  CREDIT_ADJUSTMENT: 'Ajustement',
  SUBSCRIPTION_CHARGE: 'Abonnement',
  SUBSCRIPTION_BONUS: 'Bonus abonnement',
}

export function PremiumDashboard() {
  const [balanceState, setBalanceState] = useState<FetchState<CreditBalanceSummary>>({
    data: null,
    loading: true,
    error: null,
  })
  console.log(balanceState)
  const [transactionsState, setTransactionsState] = useState<
    FetchState<CreditTransactionSummary[]>
  >({
    data: null,
    loading: true,
    error: null,
  })
  const [plansState, setPlansState] = useState<FetchState<SubscriptionPlanSummary[]>>({
    data: null,
    loading: true,
    error: null,
  })
  const [checkoutLoadingSlug, setCheckoutLoadingSlug] = useState<string | null>(null)
  const [checkoutError, setCheckoutError] = useState<string | null>(null)

  const refreshData = async () => {
    setBalanceState(prev => ({ ...prev, loading: true, error: null }))
    setTransactionsState(prev => ({ ...prev, loading: true, error: null }))
    setPlansState(prev => ({ ...prev, loading: true, error: null }))

    try {
      const [balance, transactions, plans] = await Promise.all([
        premiumService.getBalance(),
        premiumService.getTransactions(25),
        premiumService.getSubscriptionPlans(),
      ])

      setBalanceState({ data: balance, loading: false, error: null })
      setTransactionsState({ data: transactions, loading: false, error: null })
      setPlansState({ data: plans, loading: false, error: null })
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Impossible de récupérer les données premium.'
      setBalanceState(prev => ({ ...prev, loading: false, error: message }))
      setTransactionsState(prev => ({ ...prev, loading: false, error: message }))
      setPlansState(prev => ({ ...prev, loading: false, error: message }))
    }
  }

  useEffect(() => {
    refreshData().catch(error => {
      console.error('Erreur lors du chargement des crédits premium', error)
    })
  }, [])

  const availableCredits = useMemo(() => {
    if (!balanceState.data) {
      return 0
    }
    return balanceState.data.balance + balanceState.data.bonusBalance
  }, [balanceState.data])

  const handleCheckout = async (slug: string) => {
    setCheckoutError(null)
    setCheckoutLoadingSlug(slug)

    try {
      const session = await premiumService.createCheckoutSession(slug)
      if (session.url) {
        window.location.href = session.url
        return
      }
      throw new Error('Session Stripe indisponible.')
    } catch (error) {
      setCheckoutError(
        error instanceof Error
          ? error.message
          : 'Impossible de créer la session de paiement Stripe.'
      )
    } finally {
      setCheckoutLoadingSlug(null)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="space-y-1">
          <h1 className="text-3xl font-bold text-foreground">Compte Premium</h1>
          <p className="text-sm text-muted-foreground">
            Gérez vos crédits, suivez vos transactions et explorez les offres premium.
          </p>
        </div>
        <Button size="sm" variant="outline" onClick={refreshData} disabled={balanceState.loading}>
          {balanceState.loading ? 'Actualisation…' : 'Rafraîchir'}
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Solde disponible</CardTitle>
            <span className="text-lg">💎</span>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {balanceState.loading ? '…' : `${availableCredits} crédits`}
            </div>
            {balanceState.data && (
              <p className="text-xs text-muted-foreground">
                {balanceState.data.balance} crédits standards • {balanceState.data.bonusBalance}{' '}
                bonus
              </p>
            )}
            {balanceState.error && (
              <p className="text-xs text-destructive mt-2">{balanceState.error}</p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Dernière opération</CardTitle>
            <span className="text-lg">⏱️</span>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {transactionsState.data && transactionsState.data.length > 0
                ? new Date(transactionsState.data[0]!.createdAt).toLocaleDateString('fr-FR')
                : '—'}
            </div>
            <p className="text-xs text-muted-foreground">
              {transactionsState.data && transactionsState.data.length > 0
                ? new Date(transactionsState.data[0]!.createdAt).toLocaleTimeString('fr-FR')
                : 'Aucune transaction'}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Recommandation</CardTitle>
            <span className="text-lg">💡</span>
          </CardHeader>
          <CardContent>
            {availableCredits < 20 ? (
              <p className="text-sm text-muted-foreground">
                Votre solde est inférieur à 20 crédits. Pensez à recharger pour continuer à
                exploiter les analyses IA.
              </p>
            ) : (
              <p className="text-sm text-muted-foreground">
                Solde confortable. Profitez des ajustements intelligents et analyses IA sans
                contrainte.
              </p>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Historique des transactions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {transactionsState.loading ? (
              <p className="text-sm text-muted-foreground">Chargement des transactions…</p>
            ) : transactionsState.error ? (
              <p className="text-sm text-destructive">{transactionsState.error}</p>
            ) : transactionsState.data && transactionsState.data.length > 0 ? (
              <div className="space-y-2">
                {transactionsState.data.map(transaction => (
                  <div
                    key={transaction.id}
                    className="flex items-center justify-between rounded-md border border-border bg-background px-3 py-2 text-sm"
                  >
                    <div className="space-y-1">
                      <p className="font-medium text-foreground">
                        {TRANSACTION_TYPE_LABELS[transaction.type] || transaction.type}
                      </p>
                      {transaction.description && (
                        <p className="text-xs text-muted-foreground">{transaction.description}</p>
                      )}
                    </div>
                    <div className="text-right space-y-1">
                      <p
                        className={`font-semibold ${
                          transaction.amount < 0 ? 'text-red-600' : 'text-emerald-600'
                        }`}
                      >
                        {transaction.amount > 0 ? '+' : ''}
                        {transaction.amount}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(transaction.createdAt).toLocaleString('fr-FR')}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">
                Aucune transaction enregistrée pour le moment.
              </p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Offres disponibles</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {plansState.loading ? (
              <p className="text-sm text-muted-foreground">Chargement des offres…</p>
            ) : plansState.error ? (
              <p className="text-sm text-destructive">{plansState.error}</p>
            ) : plansState.data && plansState.data.length > 0 ? (
              <div className="space-y-3">
                {plansState.data.map(plan => (
                  <div
                    key={plan.id}
                    className="rounded-md border border-border bg-background p-3 space-y-1 text-sm"
                  >
                    <div className="flex items-center justify-between">
                      <p className="font-semibold text-foreground">{plan.name}</p>
                      <span className="text-xs text-muted-foreground uppercase">
                        {plan.interval === 'YEARLY' ? 'Annuel' : 'Mensuel'}
                      </span>
                    </div>
                    {plan.description && (
                      <p className="text-xs text-muted-foreground">{plan.description}</p>
                    )}
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">
                        {(plan.priceInCents / 100).toLocaleString('fr-FR', {
                          style: 'currency',
                          currency: plan.currency,
                        })}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {plan.creditsIncluded} crédits + {plan.bonusCredits} bonus
                      </span>
                    </div>
                    <Button
                      size="sm"
                      variant="secondary"
                      onClick={() => handleCheckout(plan.slug)}
                      disabled={checkoutLoadingSlug === plan.slug}
                    >
                      {checkoutLoadingSlug === plan.slug ? 'Redirection...' : 'Choisir cette offre'}
                    </Button>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">
                Les offres premium seront bientôt disponibles.
              </p>
            )}
            {checkoutError && <p className="text-sm text-destructive">{checkoutError}</p>}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
