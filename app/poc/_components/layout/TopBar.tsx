'use client'

import Link from 'next/link'
import { Settings, Bell, ArrowLeft } from 'lucide-react'

interface TopBarProps {
  title?: string
  showLogo?: boolean
  /** When provided, renders a back arrow on the left that calls this instead
   *  of showing the bell/settings icons. Used to leave full-screen flows. */
  onBack?: () => void
  backLabel?: string
}

export function TopBar({ title, showLogo = false, onBack, backLabel = 'Leave' }: TopBarProps) {
  return (
    <header className="sticky top-0 z-30 glass border-b border-white/10 safe-top">
      <div className="flex items-center justify-between h-14 px-4 max-w-lg mx-auto">
        {onBack ? (
          <button
            onClick={onBack}
            className="flex items-center gap-1.5 -ml-2 p-2 rounded-lg text-white/70 hover:text-white hover:bg-white/5 transition-all"
          >
            <ArrowLeft size={20} />
            <span className="text-sm font-medium">{title}</span>
          </button>
        ) : showLogo ? (
          <Link href="/poc/discover" className="font-display font-bold text-xl gradient-text">
            Queuepid
          </Link>
        ) : (
          <h1 className="font-display font-semibold text-lg">{title}</h1>
        )}

        {onBack ? (
          <button
            onClick={onBack}
            className="text-xs font-medium text-white/50 hover:text-red-400 px-2 py-1.5 rounded-lg transition-all"
          >
            {backLabel}
          </button>
        ) : (
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
        )}
      </div>
    </header>
  )
}
