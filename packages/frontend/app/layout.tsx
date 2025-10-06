import type { Metadata } from 'next'
import { Manrope, Space_Grotesk } from 'next/font/google'
import { ThemeProvider } from '../lib/theme'
import { AuthProvider } from '../lib/contexts/AuthContext'
import './globals.css'
import '../styles/mobile.css'

const brandSans = Manrope({
  variable: '--font-sans',
  subsets: ['latin'],
  display: 'swap',
})

const brandDisplay = Space_Grotesk({
  variable: '--font-display',
  subsets: ['latin'],
  display: 'swap',
})

export const metadata: Metadata = {
  title: 'SummitStride - Votre entraîneur ultra-trail intelligent',
  description: 'Application d\'entraînement ultra-trail personnalisée avec IA. Créez vos plans d\'entraînement optimisés, suivez vos progrès et atteignez vos objectifs.',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="fr" suppressHydrationWarning>
      <body className={`${brandSans.variable} ${brandDisplay.variable} antialiased`}>
        <ThemeProvider defaultTheme="system">
          <AuthProvider>
            {children}
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
