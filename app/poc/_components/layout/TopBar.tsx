'use client'

import Link from 'next/link'
import { Settings, Bell } from 'lucide-react'

interface TopBarProps {
  title?: string
  showLogo?: boolean
}

export function TopBar({ title, showLogo = false }: TopBarProps) {
  return (
    <header className="sticky top-0 z-30 glass border-b border-white/10 safe-top">
      <div className="flex items-center justify-between h-14 px-4 max-w-lg mx-auto">
        {showLogo ? (
          <Link href="/poc/discover" className="font-display font-bold text-xl gradient-text">
            Queuepid
          </Link>
        ) : (
          <h1 className="font-display font-semibold text-lg">{title}</h1>
        )}

        <div className="flex items-center gap-2">
          <button className="p-2 rounded-lg text-white/50 hover:text-white hover:bg-white/5 transition-all">
            <Bell size={20} />
          </button>
          <Link
            href="/poc/settings"
            className="p-2 rounded-lg text-white/50 hover:text-white hover:bg-white/5 transition-all"
          >
            <Settings size={20} />
          </Link>
        </div>
      </div>
    </header>
  )
}
