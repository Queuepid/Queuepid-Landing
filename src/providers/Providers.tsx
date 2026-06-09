'use client'

import { type ReactNode } from 'react'

/**
 * App-wide providers wrapper. Kept for future providers (theme, toast, etc.).
 */
export function Providers({ children }: { children: ReactNode }) {
  return <>{children}</>
}
