import type { Metadata } from 'next'
import type { ReactNode } from 'react'
import { PocBackground } from './_components/PocBackground'

// Keep the mock PoC out of search results — it's an internal demo, and we
// don't want it indexed alongside the real landing page. Applies to all
// /poc/* routes; / and /privacy stay indexable.
export const metadata: Metadata = {
  robots: { index: false, follow: false },
}

export default function PocLayout({ children }: { children: ReactNode }) {
  return (
    <>
      <PocBackground />
      {children}
    </>
  )
}
