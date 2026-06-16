'use client'

import { ChevronRight } from 'lucide-react'
import { AppShell } from '../_components/layout/AppShell'

export default function SettingsPage() {
  return (
    <AppShell title="Settings">
      <div className="px-4 py-4 space-y-6">

        {/* ── Discovery ── */}
        <section>
          <h2 className="text-xs font-semibold text-white/40 uppercase tracking-wider mb-2 px-1">Discovery</h2>
          <div className="glass divide-y divide-white/5">
            <div className="flex items-center justify-between px-4 py-3.5 opacity-40">
              <div>
                <p className="text-sm font-medium">Match Preferences</p>
                <p className="text-xs text-white/40 mt-0.5">Age, gender, intentions</p>
              </div>
              <ChevronRight size={16} className="text-white/30" />
            </div>
            <div className="flex items-center justify-between px-4 py-3.5 opacity-40">
              <div>
                <p className="text-sm font-medium">Feed Boost</p>
                <p className="text-xs text-white/40 mt-0.5">30% boost active</p>
              </div>
              <ChevronRight size={16} className="text-white/30" />
            </div>
          </div>
        </section>

        {/* ── Account ── */}
        <section>
          <h2 className="text-xs font-semibold text-white/40 uppercase tracking-wider mb-2 px-1">Account</h2>
          <div className="glass divide-y divide-white/5">
            <div className="flex items-center justify-between px-4 py-3.5 opacity-40">
              <div>
                <p className="text-sm font-medium">Verification</p>
                <p className="text-xs text-white/40 mt-0.5">Not verified</p>
              </div>
              <ChevronRight size={16} className="text-white/30" />
            </div>
          </div>
        </section>

        {/* ── Notifications & Privacy ── */}
        <section>
          <h2 className="text-xs font-semibold text-white/40 uppercase tracking-wider mb-2 px-1">Notifications & Privacy</h2>
          <div className="glass divide-y divide-white/5">
            <div className="flex items-center justify-between px-4 py-3.5 opacity-40">
              <p className="text-sm font-medium">Notifications</p>
              <ChevronRight size={16} className="text-white/30" />
            </div>
            <div className="flex items-center justify-between px-4 py-3.5 opacity-40">
              <p className="text-sm font-medium">Blocked Users</p>
              <ChevronRight size={16} className="text-white/30" />
            </div>
          </div>
        </section>

      </div>
    </AppShell>
  )
}
