'use client'

import dynamic from 'next/dynamic'
import { TypewriterText } from '@/components/ui/TypewriterText'

const HeroScene = dynamic(() => import('@/components/three/HeroScene'), {
  ssr: false,
})

export default function LandingHero() {
  return (
    <div className="relative h-screen overflow-hidden">
      {/* Static background */}
      <div className="fixed inset-0 -z-20 bg-[#0a0a1a] overflow-hidden">
        <div className="absolute top-1/4 left-1/3 w-[400px] h-[400px] rounded-full bg-qp-500/10 blur-[120px] animate-blob" />
        <div className="absolute bottom-1/4 right-1/4 w-[350px] h-[350px] rounded-full bg-accent-500/10 blur-[120px] animate-blob animation-delay-2000" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[200px] h-[200px] rounded-full bg-qp-400/5 blur-[80px] animate-blob animation-delay-4000" />
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: 'radial-gradient(circle, rgba(255,255,255,0.5) 1px, transparent 1px)',
            backgroundSize: '32px 32px',
          }}
        />
      </div>

      {/* 3D Canvas — background animation + controller model loading */}
      <HeroScene />

      {/* HERO */}
      <section className="relative min-h-screen flex flex-col items-center justify-center">
        <div className="relative z-10 max-w-lg mx-auto px-6 text-center">
          {/* Logo */}
          <div className="animate-slide-up-delay">
            <h1 className="font-display text-7xl sm:text-8xl font-black mb-3 leading-none tracking-tight">
              <span
                className="text-white"
                style={{
                  textShadow:
                    '0 0 22px rgba(6,182,212,0.7), 0 0 48px rgba(99,102,241,0.45), 0 0 90px rgba(99,102,241,0.25), 0 6px 28px rgba(2,6,23,0.7)',
                }}
              >
                Queuepid
              </span>
            </h1>
          </div>

          {/* Typewriter */}
          <div className="animate-slide-up-delay-2 mb-4 h-8">
            <p className="text-lg sm:text-xl text-white/60 font-display">
              Find someone who{' '}
              <TypewriterText
                phrases={[
                  'gets your humor.',
                  'mains your game.',
                  'shares your playlist.',
                  'watches the same anime.',
                  'vibes at 2am.',
                  'actually replies.',
                ]}
                className="text-qp-300 font-bold"
              />
            </p>
          </div>

          {/* Coming soon */}
          <div className="animate-slide-up-delay-3 mt-8">
            <p className="font-display font-black text-sm tracking-[0.3em] uppercase gradient-text">
              Coming Soon
            </p>
          </div>
        </div>
      </section>
    </div>
  )
}
