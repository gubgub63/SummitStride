/**
 * Profile Page - Coach IA Hugo
 * Page principale de gestion du profil utilisateur avec statistiques
 *
 * TODO: Replace mocked statistics with real API when backend endpoints are available
 * Currently using stubbed data for development
 */

'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { Card, CardHeader, CardTitle, CardContent } from '../../../components/ui/Card'
import { Button } from '../../../components/ui/Button'
import { ProfileStats } from '../../../components/profile/ProfileStats'
import { ProgressCharts } from '../../../components/profile/ProgressCharts'
import { ActivitySummary } from '../../../components/profile/ActivitySummary'
import { useProfile } from '../../../lib/hooks/useProfile'
import { useAuth } from '../../../lib/hooks/useAuth'

type ProfileSection = 'overview' | 'stats' | 'activity' | 'progress'

interface ProfileHeaderProps {
  user: any
  profile: any
  completion: any
}

function ProfileHeader({ user, profile, completion }: ProfileHeaderProps) {
  const getCompletionColor = (percentage: number) => {
    if (percentage >= 80) return 'text-green-600 bg-green-100'
    if (percentage >= 60) return 'text-yellow-600 bg-yellow-100'
    return 'text-red-600 bg-red-100'
  }

  const getExperienceBadge = (level: string) => {
    const badges = {
      BEGINNER: { label: 'Débutant', color: 'bg-green-100 text-green-800' },
      INTERMEDIATE: { label: 'Intermédiaire', color: 'bg-blue-100 text-blue-800' },
      ADVANCED: { label: 'Avancé', color: 'bg-purple-100 text-purple-800' },
      EXPERT: { label: 'Expert', color: 'bg-red-100 text-red-800' }
    }
    return badges[level as keyof typeof badges] || badges.BEGINNER
  }

  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-start justify-between">
          <div className="flex items-center space-x-4">
            <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center">
              <span className="text-2xl font-bold text-primary-600">
                {user?.name?.charAt(0)?.toUpperCase() || 'U'}
              </span>
            </div>

            <div>
              <h1 className="text-2xl font-bold">{user?.name}</h1>
              <p className="text-gray-600">{user?.email}</p>

              {profile && (
                <div className="flex items-center space-x-3 mt-2">
                  {profile.experienceLevel && (
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                      getExperienceBadge(profile.experienceLevel).color
                    }`}>
                      {getExperienceBadge(profile.experienceLevel).label}
                    </span>
                  )}

                  {profile.maxTrainingHoursPerWeek && (
                    <span className="text-sm text-gray-500">
                      {profile.maxTrainingHoursPerWeek}h/semaine
                    </span>
                  )}
                </div>
              )}
            </div>
          </div>

          <div className="text-right">
            <Link href="/profile/edit">
              <Button variant="outline" size="sm">
                Modifier le profil
              </Button>
            </Link>

            {completion && (
              <div className="mt-3">
                <div className="flex items-center space-x-2">
                  <span className="text-sm text-gray-600">Profil</span>
                  <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                    getCompletionColor(completion.completionPercentage)
                  }`}>
                    {completion.completionPercentage}% complété
                  </span>
                </div>

                <div className="w-32 bg-gray-200 rounded-full h-2 mt-2">
                  <div
                    className="bg-primary-600 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${completion.completionPercentage}%` }}
                  />
                </div>
              </div>
            )}
          </div>
        </div>

        {profile && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6 pt-6 border-t border-gray-200">
            {profile.dateOfBirth && (
              <div>
                <span className="text-sm text-gray-600">Âge</span>
                <div className="font-medium">
                  {Math.floor((new Date().getTime() - new Date(profile.dateOfBirth).getTime()) / (1000 * 60 * 60 * 24 * 365))} ans
                </div>
              </div>
            )}

            {profile.weight && profile.height && (
              <div>
                <span className="text-sm text-gray-600">IMC</span>
                <div className="font-medium">
                  {((profile.weight / ((profile.height / 100) ** 2)).toFixed(1))}
                </div>
              </div>
            )}

            {profile.vma && (
              <div>
                <span className="text-sm text-gray-600">VMA</span>
                <div className="font-medium">{profile.vma} km/h</div>
              </div>
            )}

            {profile.preferredTrainingDays && (
              <div>
                <span className="text-sm text-gray-600">Jours d'entraînement</span>
                <div className="font-medium">{profile.preferredTrainingDays.length} jours/semaine</div>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  )
}

interface SectionNavigationProps {
  activeSection: ProfileSection
  onSectionChange: (section: ProfileSection) => void
}

function SectionNavigation({ activeSection, onSectionChange }: SectionNavigationProps) {
  const sections = [
    {
      id: 'overview' as ProfileSection,
      label: 'Vue d\'ensemble',
      icon: (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
        </svg>
      )
    },
    {
      id: 'stats' as ProfileSection,
      label: 'Statistiques',
      icon: (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
        </svg>
      )
    },
    {
      id: 'progress' as ProfileSection,
      label: 'Progression',
      icon: (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
        </svg>
      )
    },
    {
      id: 'activity' as ProfileSection,
      label: 'Activité',
      icon: (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
        </svg>
      )
    }
  ]

  return (
    <div className="border-b border-gray-200">
      <nav className="-mb-px flex space-x-8">
        {sections.map((section) => (
          <button
            key={section.id}
            onClick={() => onSectionChange(section.id)}
            className={`flex items-center space-x-2 py-2 px-1 border-b-2 font-medium text-sm transition-colors ${
              activeSection === section.id
                ? 'border-primary-600 text-primary-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            {section.icon}
            <span>{section.label}</span>
          </button>
        ))}
      </nav>
    </div>
  )
}

export default function ProfilePage() {
  const { user } = useAuth()
  const { profile, completion, isLoading } = useProfile()
  const [activeSection, setActiveSection] = useState<ProfileSection>('overview')

  if (isLoading) {
    return (
      <div className="container mx-auto py-8 px-4">
        <div className="animate-pulse space-y-6">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center space-x-4">
                <div className="w-16 h-16 bg-gray-200 rounded-full"></div>
                <div className="space-y-2">
                  <div className="h-6 bg-gray-200 rounded w-48"></div>
                  <div className="h-4 bg-gray-200 rounded w-64"></div>
                </div>
              </div>
            </CardContent>
          </Card>
          <div className="h-12 bg-gray-200 rounded"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="h-64 bg-gray-200 rounded"></div>
            <div className="h-64 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    )
  }

  const renderSectionContent = () => {
    switch (activeSection) {
      case 'overview':
        return (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div>
              <ProfileStats />
            </div>
            <div>
              <ActivitySummary />
            </div>
          </div>
        )

      case 'stats':
        return <ProfileStats />

      case 'progress':
        return <ProgressCharts />

      case 'activity':
        return <ActivitySummary />

      default:
        return null
    }
  }

  return (
    <div className="container mx-auto py-8 px-4 space-y-6">
      <ProfileHeader user={user} profile={profile} completion={completion} />

      <SectionNavigation
        activeSection={activeSection}
        onSectionChange={setActiveSection}
      />

      {renderSectionContent()}

      {/* Section d'aide/info sur les stubs */}
      <Card className="border-blue-200 bg-blue-50">
        <CardContent className="p-4">
          <div className="flex items-start space-x-3">
            <div className="text-blue-600">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                      d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div>
              <h4 className="text-sm font-medium text-blue-900!">Données de développement</h4>
              <p className="text-sm text-blue-800 mt-1">
                Les statistiques et données d'activité affichées sont actuellement des données de démonstration.
                Elles seront remplacées par vos vraies données d'entraînement une fois les APIs backend développées.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
