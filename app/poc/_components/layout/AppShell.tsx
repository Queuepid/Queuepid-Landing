'use client'

import type { ReactNode } from 'react'
import { BottomNav } from './BottomNav'
import { TopBar } from './TopBar'

interface AppShellProps {
  children: ReactNode
  title?: string
  showLogo?: boolean
  hideNav?: boolean
  /** Renders a back arrow in the top bar that calls this. */
  onBack?: () => void
  backLabel?: string
}

export function AppShell({ children, title, showLogo, hideNav, onBack, backLabel }: AppShellProps) {
  return (
    <div className="min-h-screen flex flex-col">
      <TopBar title={title} showLogo={showLogo} onBack={onBack} backLabel={backLabel} />
      <main className={`flex-1 max-w-lg mx-auto w-full ${hideNav ? '' : 'pb-20'}`}>{children}</main>
      {!hideNav && <BottomNav />}
    </div>
  )
}
