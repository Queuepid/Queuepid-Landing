import type { ReactNode } from 'react'
import { BackgroundBlobs } from './_components/BackgroundBlobs'

export default function PocLayout({ children }: { children: ReactNode }) {
  return (
    <>
      <BackgroundBlobs />
      {children}
    </>
  )
}
