'use client'

export function BackgroundBlobs() {
  return (
    <div className="fixed inset-0 -z-10 pointer-events-none overflow-hidden" style={{ background: '#1a1a2e' }}>
      {/* Top-left cyan blob */}
      <div
        className="absolute rounded-full bg-qp-500/20 blur-[120px] animate-blob"
        style={{ width: '50vw', height: '50vw', top: '-15%', left: '-15%' }}
      />
      {/* Bottom-right indigo blob */}
      <div
        className="absolute rounded-full bg-accent-500/20 blur-[120px] animate-blob animation-delay-2000"
        style={{ width: '55vw', height: '55vw', bottom: '-20%', right: '-20%' }}
      />
      {/* Center-top accent blob */}
      <div
        className="absolute rounded-full bg-qp-400/10 blur-[100px] animate-blob animation-delay-4000"
        style={{ width: '40vw', height: '40vw', top: '20%', left: '30%' }}
      />
      {/* Bottom-left subtle blob */}
      <div
        className="absolute rounded-full bg-accent-400/10 blur-[100px] animate-blob"
        style={{ width: '35vw', height: '35vw', bottom: '10%', left: '-5%', animationDelay: '3s' }}
      />
    </div>
  )
}
