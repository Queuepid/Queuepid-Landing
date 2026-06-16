'use client'

import { useState, useRef, useCallback } from 'react'
import { Heart, X, Star, RotateCcw, Zap } from 'lucide-react'
import { AppShell } from '../_components/layout/AppShell'
import { SwipeCard } from '../_components/discover/SwipeCard'
import { ExpBar } from '../_components/profile/ExpBar'
import { mockCards } from '../_data/mock-cards'
import { mockUser } from '../_data/mock-user'
import type { DiscoverCard } from '../_data/types'

export default function DiscoverPage() {
  const [cards, setCards] = useState<DiscoverCard[]>([...mockCards])
  const [superlikeCount] = useState(3)
  const [likeCount, setLikeCount] = useState(0)
  const [showMatchBanner, setShowMatchBanner] = useState(false)
  const [pendingExit, setPendingExit] = useState<'left' | 'right' | null>(null)
  const processingRef = useRef(false)

  const handleSwipe = useCallback((direction: 'left' | 'right', superlike = false) => {
    if (processingRef.current) return
    processingRef.current = true

    const newCards = cards.slice(1)
    setCards(newCards)
    setPendingExit(null)
    processingRef.current = false

    if (direction === 'right' || superlike) {
      const newLikeCount = likeCount + 1
      setLikeCount(newLikeCount)
      // Show match banner every 3rd like
      if (newLikeCount % 3 === 0) {
        setShowMatchBanner(true)
        setTimeout(() => setShowMatchBanner(false), 3000)
      }
    }
  }, [cards, likeCount])

  const handleExitStart = useCallback(() => {
    setPendingExit(null)
  }, [])

  const triggerButton = (dir: 'left' | 'right') => {
    if (processingRef.current || cards.length === 0) return
    setPendingExit(dir)
  }

  const triggerSuperlike = () => {
    if (processingRef.current || cards.length === 0 || superlikeCount === 0) return
    // superlike exits right with superlike flag
    setPendingExit('right')
  }

  const topCard = cards[0]

  return (
    <AppShell showLogo>
      <div className="flex flex-col h-[calc(100vh-3.5rem-5rem)] px-4 pt-3 pb-2 gap-3">
        {/* XP Bar */}
        <ExpBar level={mockUser.level} xp={mockUser.xp} className="shrink-0" />

        {/* Card stack */}
        <div className="flex-1 relative min-h-0">
          {cards.length === 0 ? (
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 text-center px-6">
              <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-qp-500/20 to-accent-500/20 border border-white/10 flex items-center justify-center">
                <span className="text-4xl font-display font-black gradient-text">Q</span>
              </div>
              <div>
                <h2 className="text-xl font-display font-bold mb-1">All caught up!</h2>
                <p className="text-sm text-white/50">You've seen everyone for now. Check back later or reset.</p>
              </div>
              <button
                onClick={() => setCards([...mockCards])}
                className="btn-secondary flex items-center gap-2"
              >
                <RotateCcw size={16} />
                Reset mock cards
              </button>
            </div>
          ) : (
            cards.slice(0, 3).map((card, i) => (
              <SwipeCard
                key={card.user_id}
                card={card}
                onSwipe={handleSwipe}
                stackIndex={i}
                exitDirection={i === 0 ? pendingExit : null}
                onExitStart={handleExitStart}
              />
            ))
          )}
        </div>

        {/* Action buttons */}
        {cards.length > 0 && (
          <div className="flex items-center justify-center gap-5 shrink-0 pb-1">
            {/* Nope */}
            <button
              onClick={() => triggerButton('left')}
              className="w-14 h-14 rounded-full glass border border-red-500/30 flex items-center justify-center text-red-400 hover:bg-red-500/10 active:scale-95 transition-all"
            >
              <X size={26} strokeWidth={2.5} />
            </button>

            {/* Superlike */}
            <button
              onClick={triggerSuperlike}
              disabled={superlikeCount === 0}
              className="w-12 h-12 rounded-full glass border border-accent-500/30 flex items-center justify-center text-accent-400 hover:bg-accent-500/10 active:scale-95 transition-all disabled:opacity-40"
            >
              <Star size={20} strokeWidth={2} />
            </button>

            {/* Like */}
            <button
              onClick={() => triggerButton('right')}
              className="w-14 h-14 rounded-full glass border border-green-500/30 flex items-center justify-center text-green-400 hover:bg-green-500/10 active:scale-95 transition-all"
            >
              <Heart size={26} strokeWidth={2.5} />
            </button>
          </div>
        )}

        {/* Superlike counter */}
        {cards.length > 0 && (
          <div className="flex items-center justify-center gap-1.5 shrink-0">
            <Zap size={12} className="text-accent-400" />
            <span className="text-xs text-white/40">{superlikeCount} superlikes remaining</span>
          </div>
        )}
      </div>

      {/* Match banner */}
      {showMatchBanner && (
        <div className="fixed inset-0 z-50 flex items-center justify-center pointer-events-none">
          <div className="glass border border-qp-500/30 px-8 py-6 rounded-3xl text-center animate-scale-in shadow-2xl shadow-qp-500/20">
            <p className="text-4xl mb-2">💫</p>
            <h2 className="text-2xl font-display font-black gradient-text mb-1">It's a Duo!</h2>
            <p className="text-sm text-white/60">You and {topCard?.display_name ?? 'someone'} liked each other</p>
          </div>
        </div>
      )}
    </AppShell>
  )
}
