import type { ReactNode } from 'react'
import { PocBackground } from './_components/PocBackground'

export default function PocLayout({ children }: { children: ReactNode }) {
  return (
    <>
      <PocBackground />
      {children}
    </>
  )
}
