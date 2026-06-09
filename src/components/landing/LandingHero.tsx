export default function LandingHero() {
  return (
    <div className="relative h-screen overflow-hidden flex items-center justify-center bg-[#0a0a1a]">
      {/* Blobs */}
      <div className="absolute top-1/4 left-1/3 w-[600px] h-[600px] rounded-full bg-qp-500/15 blur-[140px] animate-blob pointer-events-none" />
      <div className="absolute bottom-1/3 right-1/4 w-[500px] h-[500px] rounded-full bg-accent-500/15 blur-[140px] animate-blob animation-delay-2000 pointer-events-none" />
      <div className="absolute top-2/3 left-1/4 w-[400px] h-[400px] rounded-full bg-qp-400/10 blur-[120px] animate-blob animation-delay-4000 pointer-events-none" />

      {/* Content */}
      <div className="relative z-10 text-center px-6">
        <h1
          className="font-display text-7xl sm:text-8xl font-black leading-none tracking-tight text-white animate-slide-up-delay"
          style={{
            textShadow:
              '0 0 22px rgba(6,182,212,0.7), 0 0 48px rgba(99,102,241,0.45), 0 0 90px rgba(99,102,241,0.25)',
          }}
        >
          Queuepid
        </h1>

        <p className="mt-4 text-lg text-white/50 font-display animate-slide-up-delay-2">
          Interest-based matchmaking for gamers.
        </p>

        <p className="mt-6 font-display font-black text-sm tracking-[0.3em] uppercase gradient-text animate-slide-up-delay-3">
          Coming Soon
        </p>
      </div>
    </div>
  )
}
