'use client'

import Link from 'next/link'
import { Crown, Edit3 } from 'lucide-react'
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

        <div className="space-y-3">
          <Link
            href="/poc/settings"
            className="btn-secondary flex items-center justify-center gap-2 w-full"
          >
            <Edit3 size={16} />
            Edit Profile
          </Link>

          {mockUser.subscription_tier === 0 && (
            <Link
              href="/poc/settings"
              className="btn-primary flex items-center justify-center gap-2 w-full"
            >
              <Crown size={16} />
              Upgrade to Spark
            </Link>
          )}
        </div>

        <p className="text-center text-xs text-white/30 pb-2">
          This is a PoC demo — sign up at{' '}
          <span className="text-qp-400">queuepid.com</span> for the real experience.
        </p>
      </div>
    </AppShell>
  )
}
