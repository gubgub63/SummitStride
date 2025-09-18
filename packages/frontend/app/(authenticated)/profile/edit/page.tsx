/**
 * Profile Edit Page - Coach IA Hugo
 * Page dédiée à l'édition du profil utilisateur
 */

'use client'

import React from 'react'
import { useRouter } from 'next/navigation'
import { ProfileEditor } from '../../../../components/profile/ProfileEditor'

export default function ProfileEditPage() {
  const router = useRouter()

  const handleSave = () => {
    router.push('/profile')
  }

  const handleClose = () => {
    router.push('/profile')
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <ProfileEditor onSave={handleSave} onClose={handleClose} />
    </div>
  )
}