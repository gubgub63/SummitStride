let stripeClient: any = null
let stripeModule: any = null

function getEnv(key: string): string | undefined {
  const value = process.env[key]
  return value && value.length > 0 ? value : undefined
}

async function loadStripeModule() {
  if (!stripeModule) {
    try {
      const imported = await import('stripe')
      stripeModule = imported.default || imported
    } catch (error) {
      throw new Error(
        "Le SDK Stripe n'est pas installé. Exécutez `npm install stripe` pour activer les paiements."
      )
    }
  }
  return stripeModule
}

export async function getStripeClient() {
  if (!stripeClient) {
    const secretKey = getEnv('STRIPE_SECRET_KEY')
    if (!secretKey) {
      throw new Error("STRIPE_SECRET_KEY n'est pas configurée.")
    }

    const Stripe = await loadStripeModule()
    stripeClient = new Stripe(secretKey, {
      apiVersion: '2024-06-20',
    })
  }

  return stripeClient
}

export function getStripeSuccessUrl(): string {
  return (
    getEnv('STRIPE_SUCCESS_URL') ||
    `${getEnv('FRONTEND_URL') || 'http://localhost:3000'}/premium?status=success`
  )
}

export function getStripeCancelUrl(): string {
  return (
    getEnv('STRIPE_CANCEL_URL') ||
    `${getEnv('FRONTEND_URL') || 'http://localhost:3000'}/premium?status=cancel`
  )
}

export function getStripePriceIdForSlug(slug: string): string | undefined {
  const map: Record<string, string | undefined> = {
    'credits-20': getEnv('STRIPE_PRICE_ID_CREDITS_20'),
    'credits-50': getEnv('STRIPE_PRICE_ID_CREDITS_50'),
    'credits-100': getEnv('STRIPE_PRICE_ID_CREDITS_100'),
    'premium-annual': getEnv('STRIPE_PRICE_ID_PREMIUM_ANNUAL'),
    'premium-monthly': getEnv('STRIPE_PRICE_ID_PREMIUM_MONTHLY'),
  }

  return map[slug]
}

export function isSubscriptionSlug(slug: string): boolean {
  return slug.startsWith('premium-')
}
