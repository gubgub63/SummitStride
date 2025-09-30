import type { Metadata } from 'next'
import { Geist, Geist_Mono } from 'next/font/google'
import { ThemeProvider } from '../lib/theme'
import { AuthProvider } from '../lib/contexts/AuthContext'
import './globals.css'
import '../styles/mobile.css'

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
})

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
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
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        <ThemeProvider defaultTheme="system">
          <AuthProvider>
            {children}
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
