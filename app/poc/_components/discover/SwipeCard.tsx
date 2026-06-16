'use client'

import { useState, useRef, useCallback, useEffect, forwardRef, type PointerEvent } from 'react'
import Image from 'next/image'
import { Volume2, Sparkles, ChevronLeft, ChevronRight } from 'lucide-react'
import { cn } from '@poc/_data/utils'
import { Chip } from '../ui/Chip'
import type { DiscoverCard } from '@poc/_data/types'

interface SwipeCardProps {
  card: DiscoverCard
  onSwipe: (direction: 'left' | 'right', superlike?: boolean) => void
  stackIndex: number
  exitDirection?: 'left' | 'right' | null
  onExitStart?: () => void
}

const SWIPE_THRESHOLD = 120
const EXIT_X = 600
const TRANSITION = 'transform 0.35s cubic-bezier(0.2,0.8,0.2,1), opacity 0.35s ease, box-shadow 0.35s ease'

export const SwipeCard = forwardRef<HTMLDivElement, SwipeCardProps>(function SwipeCard(
  { card, onSwipe, stackIndex, exitDirection = null, onExitStart },
  forwardedRef
) {
  const isTop = stackIndex === 0
  const [photoIndex, setPhotoIndex] = useState(0)
  const [imageLoaded, setImageLoaded] = useState(false)
  const onImageLoad = useCallback(() => setImageLoaded(true), [])

  const cardRef = useRef<HTMLDivElement | null>(null)
  const likeRef = useRef<HTMLDivElement>(null)
  const nopeRef = useRef<HTMLDivElement>(null)
  const exitingRef = useRef(false)

  const drag = useRef({
    active: false,
    captured: false,
    startX: 0,
    startY: 0,
    x: 0,
    y: 0,
    pointerId: -1,
  })

  function applyVisuals(x: number, y: number, dragging: boolean) {
    const el = cardRef.current
    if (!el) return

    const rot = x / 20
    const tiltX = dragging ? -(y / 30) : 0
    const tiltY = dragging ? x / 30 : 0

    el.style.transform = `perspective(1200px) translateX(${x}px) translateY(${y}px) rotate(${rot}deg) rotateX(${tiltX}deg) rotateY(${tiltY}deg)`
    el.style.opacity = `${Math.max(0, 1 - Math.abs(x) / 400)}`

    const likeOp = Math.max(0, Math.min(1, x / SWIPE_THRESHOLD))
    const nopeOp = Math.max(0, Math.min(1, -x / SWIPE_THRESHOLD))

    const glow =
      x > 20
        ? `0 0 40px rgba(74,222,128,${likeOp * 0.4}), 0 20px 60px rgba(0,0,0,0.4)`
        : x < -20
          ? `0 0 40px rgba(248,113,113,${nopeOp * 0.4}), 0 20px 60px rgba(0,0,0,0.4)`
          : '0 20px 60px rgba(0,0,0,0.4)'
    el.style.boxShadow = glow

    if (likeRef.current) {
      likeRef.current.style.opacity = `${likeOp}`
      likeRef.current.style.boxShadow = `0 0 20px rgba(74,222,128,${likeOp * 0.3})`
    }
    if (nopeRef.current) {
      nopeRef.current.style.opacity = `${nopeOp}`
      nopeRef.current.style.boxShadow = `0 0 20px rgba(248,113,113,${nopeOp * 0.3})`
    }
  }

  function setTransition(on: boolean) {
    if (cardRef.current) cardRef.current.style.transition = on ? TRANSITION : 'none'
    if (likeRef.current)
      likeRef.current.style.transition = on ? 'opacity 0.35s ease, box-shadow 0.35s ease' : 'none'
    if (nopeRef.current)
      nopeRef.current.style.transition = on ? 'opacity 0.35s ease, box-shadow 0.35s ease' : 'none'
  }

  useEffect(() => {
    if (exitDirection && isTop && !exitingRef.current) {
      exitingRef.current = true
      onExitStart?.()
      setTransition(true)
      applyVisuals(exitDirection === 'right' ? EXIT_X : -EXIT_X, -40, false)
      const t = setTimeout(() => onSwipe(exitDirection), 350)
      return () => clearTimeout(t)
    }
  }, [exitDirection, isTop, onSwipe, onExitStart])

  const DRAG_DEAD_ZONE = 8

  function handlePointerDown(e: PointerEvent) {
    if (!isTop || exitingRef.current) return
    drag.current = {
      active: true,
      captured: false,
      startX: e.clientX,
      startY: e.clientY,
      x: 0,
      y: 0,
      pointerId: e.pointerId,
    }
  }

  function handlePointerMove(e: PointerEvent) {
    if (!drag.current.active) return
    drag.current.x = e.clientX - drag.current.startX
    drag.current.y = e.clientY - drag.current.startY

    if (
      !drag.current.captured &&
      (Math.abs(drag.current.x) > DRAG_DEAD_ZONE || Math.abs(drag.current.y) > DRAG_DEAD_ZONE)
    ) {
      drag.current.captured = true
      cardRef.current?.setPointerCapture(drag.current.pointerId)
      setTransition(false)
    }

    if (drag.current.captured) {
      applyVisuals(drag.current.x, drag.current.y, true)
    }
  }

  function endDrag(commit: boolean) {
    if (!drag.current.active) return
    const wasCaptured = drag.current.captured
    drag.current.active = false
    drag.current.captured = false

    if (!wasCaptured) return

    setTransition(true)

    const { x, y } = drag.current
    if (commit && Math.abs(x) > SWIPE_THRESHOLD) {
      const dir: 'left' | 'right' = x > 0 ? 'right' : 'left'
      exitingRef.current = true
      onExitStart?.()
      applyVisuals(dir === 'right' ? EXIT_X : -EXIT_X, y, false)
      setTimeout(() => onSwipe(dir), 350)
    } else {
      applyVisuals(0, 0, false)
    }
  }

  const currentPhoto = card.photos[photoIndex]

  return (
    <div
      ref={(el) => {
        cardRef.current = el
        if (typeof forwardedRef === 'function') forwardedRef(el)
        else if (forwardedRef) forwardedRef.current = el
      }}
      className={cn(
        'absolute inset-0 rounded-3xl overflow-hidden touch-none select-none will-change-transform',
        isTop ? 'cursor-grab active:cursor-grabbing' : ''
      )}
      style={{
        transform: isTop
          ? 'perspective(1200px)'
          : `perspective(1200px) scale(${1 - stackIndex * 0.03})`,
        opacity: isTop ? 1 : stackIndex === 1 ? 0.5 : 0,
        filter: isTop ? 'none' : 'blur(1px)',
        zIndex: 10 - stackIndex,
        boxShadow: isTop ? '0 20px 60px rgba(0,0,0,0.4)' : '0 10px 40px rgba(0,0,0,0.3)',
        transition: 'transform 0.2s ease, opacity 0.2s ease, filter 0.2s ease, box-shadow 0.2s ease',
      }}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={() => endDrag(true)}
      onPointerCancel={() => endDrag(false)}
      onDragStart={(e) => e.preventDefault()}
    >
      {isTop && (
        <div className="absolute inset-0 rounded-3xl gradient-border pointer-events-none z-20" />
      )}

      <div className="relative w-full h-full">
        {currentPhoto ? (
          <>
            {!imageLoaded && (
              <div className="absolute inset-0 bg-[#16132a] flex items-center justify-center">
                <div className="relative">
                  <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-qp-500/20 to-accent-500/20 border border-white/10 flex items-center justify-center animate-pulse">
                    <span className="text-4xl font-display font-black gradient-text">Q</span>
                  </div>
                  <div className="absolute -inset-2 rounded-3xl border-2 border-transparent border-t-qp-500/50 animate-spin" />
                </div>
              </div>
            )}
            <Image
              src={currentPhoto.url}
              alt={card.display_name}
              fill
              className={cn(
                'object-cover transition-opacity duration-500',
                imageLoaded ? 'opacity-100' : 'opacity-0'
              )}
              priority={isTop}
              unoptimized
              onLoad={onImageLoad}
            />
          </>
        ) : (
          <div className="w-full h-full relative overflow-hidden" style={{ background: '#16132a' }}>
            <div
              className="absolute inset-0"
              style={{ background: 'linear-gradient(135deg, #1e1338 0%, #16132a 30%, #1a1035 60%, #120e24 100%)' }}
            />
            <div className="absolute top-[-20%] left-[-10%] w-[60%] h-[60%] rounded-full bg-qp-500/20 blur-[100px] animate-blob" />
            <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] rounded-full bg-accent-500/20 blur-[100px] animate-blob animation-delay-2000" />
            <div className="absolute inset-0 flex items-center justify-center">
              <span
                className="text-[140px] font-display font-black leading-none"
                style={{
                  background: 'linear-gradient(135deg, rgba(236,72,153,0.08), rgba(168,85,247,0.08))',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                }}
              >
                {card.display_name.charAt(0)}
              </span>
            </div>
          </div>
        )}

        {card.photos.length > 1 && (
          <div className="absolute top-3 left-3 right-3 z-20 flex items-center gap-2">
            <button
              onPointerDown={(e) => e.stopPropagation()}
              onClick={() => { setImageLoaded(false); setPhotoIndex((i) => Math.max(0, i - 1)) }}
              className={cn(
                'w-7 h-7 rounded-full bg-black/40 backdrop-blur-sm flex items-center justify-center shrink-0 transition-opacity active:scale-90',
                photoIndex === 0 ? 'opacity-30 pointer-events-none' : 'opacity-80'
              )}
            >
              <ChevronLeft size={14} className="text-white" />
            </button>
            <div className="flex-1 flex gap-1">
              {card.photos.map((_, i) => (
                <div
                  key={i}
                  className={cn(
                    'flex-1 h-1 rounded-full transition-all',
                    i === photoIndex ? 'bg-white shadow-[0_0_6px_rgba(255,255,255,0.5)]' : 'bg-white/30'
                  )}
                />
              ))}
            </div>
            <button
              onPointerDown={(e) => e.stopPropagation()}
              onClick={() => { setImageLoaded(false); setPhotoIndex((i) => Math.min(card.photos.length - 1, i + 1)) }}
              className={cn(
                'w-7 h-7 rounded-full bg-black/40 backdrop-blur-sm flex items-center justify-center shrink-0 transition-opacity active:scale-90',
                photoIndex === card.photos.length - 1 ? 'opacity-30 pointer-events-none' : 'opacity-80'
              )}
            >
              <ChevronRight size={14} className="text-white" />
            </button>
          </div>
        )}

        <div
          ref={likeRef}
          className="absolute top-10 left-6 z-10 border-[3px] border-green-400 text-green-400 px-5 py-1.5 rounded-xl text-2xl font-black -rotate-12 tracking-wider"
          style={{ opacity: 0, textShadow: '0 0 20px rgba(74, 222, 128, 0.5)' }}
        >
          LIKE
        </div>
        <div
          ref={nopeRef}
          className="absolute top-10 right-6 z-10 border-[3px] border-red-400 text-red-400 px-5 py-1.5 rounded-xl text-2xl font-black rotate-12 tracking-wider"
          style={{ opacity: 0, textShadow: '0 0 20px rgba(248, 113, 113, 0.5)' }}
        >
          NOPE
        </div>

        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/90 via-black/60 to-transparent px-5 pb-5 pt-24">
          {card.compatibility_score > 0 && (
            <div className="flex items-center gap-2 mb-3">
              <div className="relative w-10 h-10 shrink-0">
                <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
                  <circle cx="18" cy="18" r="14" fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="3" />
                  <circle
                    cx="18" cy="18" r="14" fill="none"
                    stroke="url(#matchGrad)" strokeWidth="3" strokeLinecap="round"
                    strokeDasharray={`${card.compatibility_score * 0.88} 88`}
                  />
                  <defs>
                    <linearGradient id="matchGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                      <stop offset="0%" stopColor="#ec4899" />
                      <stop offset="100%" stopColor="#a855f7" />
                    </linearGradient>
                  </defs>
                </svg>
                <span className="absolute inset-0 flex items-center justify-center text-[10px] font-bold gradient-text">
                  {card.compatibility_score}
                </span>
              </div>
              <div>
                <p className="text-[10px] text-white/40 uppercase tracking-wider">Match Score</p>
                <div className="flex items-center gap-1">
                  <Sparkles size={10} className="text-qp-400" />
                  <span className="text-xs text-white/60">
                    {card.compatibility_score >= 80 ? 'Excellent match' : card.compatibility_score >= 60 ? 'Good match' : 'Potential match'}
                  </span>
                </div>
              </div>
            </div>
          )}

          <div className="flex items-baseline gap-2.5 mb-1">
            <h2 className="text-3xl font-display font-black tracking-tight">{card.display_name}</h2>
            <span className="text-xl text-white/60 font-light">{card.age}</span>
            {card.level > 1 && (
              <span className="text-[10px] bg-accent-500/20 text-accent-300 px-2 py-0.5 rounded-full border border-accent-500/20 font-bold">
                Lv.{card.level}
              </span>
            )}
          </div>

          <div className="flex items-center gap-1.5 mb-2">
            <span className="text-[11px] text-white/40 capitalize">{card.gender}</span>
          </div>

          {card.bio && (
            <p className="text-sm text-white/60 mb-3 line-clamp-2 leading-relaxed">{card.bio}</p>
          )}

          {card.shared_interests.length > 0 && (
            <div className="mb-2.5">
              <p className="text-[10px] text-white/30 uppercase tracking-wider mb-1.5">Shared interests</p>
              <div className="flex flex-wrap gap-1.5">
                {card.shared_interests.slice(0, 5).map((interest) => (
                  <Chip key={interest.id} label={interest.name} active />
                ))}
                {card.shared_interests.length > 5 && (
                  <span className="chip text-xs">+{card.shared_interests.length - 5}</span>
                )}
              </div>
            </div>
          )}

          {card.voice_notes.length > 0 && (
            <button className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 hover:bg-white/10 transition-colors">
              <Volume2 size={13} className="text-qp-400" />
              <span className="text-[11px] text-white/50">Voice intro</span>
              <span className="text-[10px] text-white/30">{card.voice_notes[0].duration_seconds}s</span>
            </button>
          )}
        </div>
      </div>
    </div>
  )
})
