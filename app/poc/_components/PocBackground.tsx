'use client'

import dynamic from 'next/dynamic'

// R3F can't SSR — the Canvas must load client-side only.
const BackgroundParticles = dynamic(
  () =>
    import('./three/BackgroundParticles').then((m) => ({
      default: m.BackgroundParticles,
    })),
  { ssr: false }
)

export function PocBackground() {
  return <BackgroundParticles />
}
