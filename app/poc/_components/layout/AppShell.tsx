'use client'

import type { ReactNode } from 'react'
import { BottomNav } from './BottomNav'
import { TopBar } from './TopBar'

interface AppShellProps {
  children: ReactNode
  title?: string
  showLogo?: boolean
  hideNav?: boolean
}

export function AppShell({ children, title, showLogo, hideNav }: AppShellProps) {
  return (
    <div className="min-h-screen flex flex-col">
      <TopBar title={title} showLogo={showLogo} />
      <main className="flex-1 pb-20 max-w-lg mx-auto w-full">{children}</main>
      {!hideNav && <BottomNav />}
    </div>
  )
}
