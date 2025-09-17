'use client'

import React from 'react'
import { useRouter } from 'next/navigation'
import { ProfileWizard } from '../../../../components/profile/ProfileWizard'

export default function CompleteProfilePage() {
  const router = useRouter()

  const handleComplete = () => {
    router.push('/dashboard')
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <ProfileWizard onComplete={handleComplete} />
    </div>
  )
}