'use client'

import { Edit3 } from 'lucide-react'
import { AppShell } from '../_components/layout/AppShell'
import { ProfileCard } from '../_components/profile/ProfileCard'
import { ExpBar } from '../_components/profile/ExpBar'
import { mockUser } from '../_data/mock-user'

export default function ProfilePage() {
  return (
    <AppShell title="Profile">
      <div className="px-4 py-4 space-y-4">
        <ExpBar level={mockUser.level} xp={mockUser.xp} />

        <ProfileCard profile={mockUser} isOwnProfile />

        <button className="btn-secondary flex items-center justify-center gap-2 w-full opacity-40 cursor-not-allowed">
          <Edit3 size={16} />
          Edit Profile
        </button>
      </div>
    </AppShell>
  )
}
