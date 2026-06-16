'use client'

import { useState, useEffect, useRef } from 'react'
import {
  Shuffle, X, Eye, UserPlus, Send, ChevronDown, ChevronUp, Loader2
} from 'lucide-react'
import { AppShell } from '../_components/layout/AppShell'
import { Chip } from '../_components/ui/Chip'
import { RangeSlider } from '../_components/ui/RangeSlider'
import { Avatar } from '../_components/ui/Avatar'
import {
  mockPartnerGameProfile,
  mockPartnerRevealedProfile,
  mockInitialMessages,
  MOCK_SESSION_ID,
  MOCK_SELF_ID,
} from '../_data/mock-queue'
import {
  POPULAR_GAMES,
  REGIONS,
  REGION_LABELS,
  MIC_PREFS,
  MIC_PREF_LABELS,
  INTENTIONS,
  INTENTION_LABELS,
  type MicPref,
  type Region,
  type GameMode,
  type Intention,
} from '../_data/types'
import type { Message } from '../_data/types'

type QueueStatus = 'idle' | 'searching' | 'chatting'

export default function QueuePage() {
  const [status, setStatus] = useState<QueueStatus>('idle')

  // Preferences
  const [untrackedSelected, setUntrackedSelected] = useState<string[]>([])
  const [regions, setRegions] = useState<Region[]>(['na'])
  const [mode, setMode] = useState<GameMode>('any')
  const [mic, setMic] = useState<MicPref>('either')
  const [ageMin, setAgeMin] = useState(16)
  const [ageMax, setAgeMax] = useState(30)
  const [intentions, setIntentions] = useState<Intention[]>([])
  const [showFilters, setShowFilters] = useState(false)

  // Chat state
  const [messages, setMessages] = useState<Message[]>([])
  const [inputText, setInputText] = useState('')
  const [selfRevealed, setSelfRevealed] = useState(false)
  const [partnerRevealed, setPartnerRevealed] = useState(false)
  const [duoPending, setDuoPending] = useState(false)
  const [duoMatched, setDuoMatched] = useState(false)
  const messagesContainerRef = useRef<HTMLDivElement>(null)
  const searchTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  // Scroll the messages container only — never the window — so the input bar
  // stays pinned at the bottom of the viewport.
  useEffect(() => {
    const c = messagesContainerRef.current
    if (c) c.scrollTop = c.scrollHeight
  }, [messages, status])

  useEffect(() => {
    return () => {
      if (searchTimerRef.current) clearTimeout(searchTimerRef.current)
    }
  }, [])

  const startSearch = () => {
    setStatus('searching')
    searchTimerRef.current = setTimeout(() => {
      setMessages([...mockInitialMessages])
      setSelfRevealed(false)
      setPartnerRevealed(false)
      setDuoPending(false)
      setDuoMatched(false)
      setStatus('chatting')
    }, 3000)
  }

  const cancelSearch = () => {
    if (searchTimerRef.current) clearTimeout(searchTimerRef.current)
    setStatus('idle')
  }

  const leaveChat = () => {
    setStatus('idle')
  }

  const sendMessage = () => {
    if (!inputText.trim()) return
    const msg: Message = {
      id: `msg-${Date.now()}`,
      conversation_id: MOCK_SESSION_ID,
      sender_id: MOCK_SELF_ID,
      type: 'text',
      content: inputText.trim(),
      reply_to: null,
      edited_at: null,
      deleted_at: null,
      read_at: null,
      created_at: new Date().toISOString(),
    }
    setMessages((prev) => [...prev, msg])
    setInputText('')
  }

  const handleReveal = () => {
    setSelfRevealed(true)
    // Partner auto-reveals after 1s for demo purposes
    setTimeout(() => setPartnerRevealed(true), 1200)
  }

  const handleDuoRequest = () => {
    setDuoPending(true)
    setTimeout(() => setDuoMatched(true), 1500)
  }

  const toggleRegion = (r: Region) => {
    setRegions((prev) =>
      prev.includes(r) ? prev.filter((x) => x !== r) : [...prev, r]
    )
  }

  const toggleGame = (g: string) => {
    setUntrackedSelected((prev) =>
      prev.includes(g) ? prev.filter((x) => x !== g) : [...prev, g]
    )
  }

  const toggleIntention = (i: Intention) => {
    setIntentions((prev) =>
      prev.includes(i) ? prev.filter((x) => x !== i) : [...prev, i]
    )
  }

  const partner = partnerRevealed ? mockPartnerRevealedProfile : null
  const partnerAlias = mockPartnerGameProfile.alias

  // ── Idle view ─────────────────────────────────────────────────────────────
  if (status === 'idle') {
    return (
      <AppShell title="Play Queue">
        <div className="px-4 py-4 space-y-5">
          {/* Games */}
          <div>
            <h3 className="text-sm font-semibold text-white/70 mb-2">Games</h3>
            <div className="flex flex-wrap gap-2">
              {POPULAR_GAMES.map((game) => (
                <Chip
                  key={game}
                  label={game}
                  active={untrackedSelected.includes(game)}
                  onToggle={() => toggleGame(game)}
                />
              ))}
            </div>
          </div>

          {/* Regions */}
          <div>
            <h3 className="text-sm font-semibold text-white/70 mb-2">Regions</h3>
            <div className="flex flex-wrap gap-2">
              {REGIONS.map((r) => (
                <Chip
                  key={r}
                  label={REGION_LABELS[r]}
                  active={regions.includes(r)}
                  onToggle={() => toggleRegion(r)}
                />
              ))}
            </div>
          </div>

          {/* Advanced filters (collapsible) */}
          <div>
            <button
              onClick={() => setShowFilters((v) => !v)}
              className="flex items-center gap-2 text-sm text-white/50 hover:text-white/80 transition-colors"
            >
              {showFilters ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
              Advanced filters
            </button>

            {showFilters && (
              <div className="mt-4 space-y-5">
                {/* Mode */}
                <div>
                  <h3 className="text-sm font-semibold text-white/70 mb-2">Mode</h3>
                  <div className="flex gap-2">
                    {(['ranked', 'unrated', 'any'] as GameMode[]).map((m) => (
                      <Chip key={m} label={m} active={mode === m} onToggle={() => setMode(m)} />
                    ))}
                  </div>
                </div>

                {/* Mic */}
                <div>
                  <h3 className="text-sm font-semibold text-white/70 mb-2">Voice chat</h3>
                  <div className="flex gap-2">
                    {MIC_PREFS.map((m) => (
                      <Chip key={m} label={MIC_PREF_LABELS[m]} active={mic === m} onToggle={() => setMic(m)} />
                    ))}
                  </div>
                </div>

                {/* Age range */}
                <div>
                  <h3 className="text-sm font-semibold text-white/70 mb-3">
                    Age range: {ageMin}–{ageMax}
                  </h3>
                  <RangeSlider
                    min={16}
                    max={50}
                    valueMin={ageMin}
                    valueMax={ageMax}
                    onChangeMin={setAgeMin}
                    onChangeMax={setAgeMax}
                  />
                </div>

                {/* Intentions */}
                <div>
                  <h3 className="text-sm font-semibold text-white/70 mb-2">Looking for</h3>
                  <div className="flex flex-wrap gap-2">
                    {INTENTIONS.map((k) => (
                      <Chip
                        key={k}
                        label={INTENTION_LABELS[k]}
                        active={intentions.includes(k)}
                        onToggle={() => toggleIntention(k)}
                      />
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>

          <button onClick={startSearch} className="btn-primary w-full flex items-center justify-center gap-2">
            <Shuffle size={18} />
            Find Queue
          </button>
        </div>
      </AppShell>
    )
  }

  // ── Searching view ────────────────────────────────────────────────────────
  if (status === 'searching') {
    return (
      <AppShell title="Play Queue" hideNav>
        <div className="flex flex-col items-center justify-center h-[calc(100vh-3.5rem)] gap-8 px-6">
          {/* Radar animation */}
          <div className="relative w-40 h-40">
            <div className="absolute inset-0 rounded-full border-2 border-qp-500/20 animate-ping" />
            <div className="absolute inset-4 rounded-full border-2 border-qp-500/30 animate-ping" style={{ animationDelay: '0.3s' }} />
            <div className="absolute inset-8 rounded-full border-2 border-qp-500/40 animate-ping" style={{ animationDelay: '0.6s' }} />
            <div className="absolute inset-0 flex items-center justify-center">
              <Loader2 size={32} className="text-qp-400 animate-spin" />
            </div>
          </div>

          <div className="text-center">
            <h2 className="text-xl font-display font-bold mb-1">Finding your match…</h2>
            <p className="text-sm text-white/50">Scanning {regions.map((r) => REGION_LABELS[r]).join(', ')}</p>
          </div>

          <button onClick={cancelSearch} className="btn-ghost flex items-center gap-2">
            <X size={16} />
            Cancel
          </button>
        </div>
      </AppShell>
    )
  }

  // ── Chatting view ─────────────────────────────────────────────────────────
  return (
    <AppShell title={partner ? partner.display_name : partnerAlias} hideNav onBack={leaveChat} backLabel="Leave queue">
      <div className="flex flex-col h-[calc(100vh-3.5rem)]">
        {/* Partner game card */}
        <div className="px-4 pt-3 pb-2 shrink-0">
          <div className="glass p-3">
            <div className="flex items-start gap-3">
              <Avatar
                src={partner?.photos[0]?.url ?? null}
                alt={partner?.display_name ?? partnerAlias}
                size="lg"
              />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-0.5">
                  <h3 className="font-semibold truncate">
                    {partnerRevealed && partner ? partner.display_name : partnerAlias}
                  </h3>
                  {!partnerRevealed && (
                    <span className="text-xs text-white/30 bg-white/5 px-2 py-0.5 rounded-full">Anonymous</span>
                  )}
                </div>
                <p className="text-xs text-white/50">
                  {mockPartnerGameProfile.game_accounts[0]
                    ? `Valorant · ${mockPartnerGameProfile.game_accounts[0].rank_tier} ${mockPartnerGameProfile.game_accounts[0].rank_division ?? ''}`
                    : 'No tracked game'}
                </p>
                {mockPartnerGameProfile.untracked_games.length > 0 && (
                  <p className="text-xs text-white/40 mt-0.5">
                    Also plays: {mockPartnerGameProfile.untracked_games.join(', ')}
                  </p>
                )}
              </div>
            </div>

            {/* Action row */}
            <div className="flex gap-2 mt-3">
              {!selfRevealed ? (
                <button
                  onClick={handleReveal}
                  className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl bg-qp-500/15 border border-qp-500/30 text-qp-300 text-xs font-medium hover:bg-qp-500/25 transition-all active:scale-95"
                >
                  <Eye size={13} />
                  Reveal yourself
                </button>
              ) : !partnerRevealed ? (
                <div className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl bg-white/5 border border-white/10 text-white/40 text-xs">
                  <Loader2 size={12} className="animate-spin" />
                  Waiting for reveal…
                </div>
              ) : (
                <div className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl bg-green-500/10 border border-green-500/20 text-green-400 text-xs font-medium">
                  <Eye size={13} />
                  Both revealed!
                </div>
              )}

              {!duoMatched ? (
                <button
                  onClick={handleDuoRequest}
                  disabled={duoPending}
                  className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl border text-xs font-medium transition-all active:scale-95 ${
                    duoPending
                      ? 'bg-accent-500/10 border-accent-500/20 text-accent-400'
                      : 'bg-white/5 border-white/10 text-white/60 hover:bg-white/10'
                  }`}
                >
                  <UserPlus size={13} />
                  {duoPending ? 'Waiting…' : 'Add as Duo'}
                </button>
              ) : (
                <div className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl bg-green-500/10 border border-green-500/20 text-green-400 text-xs font-medium">
                  <UserPlus size={13} />
                  Duo matched! 🎉
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Messages */}
        <div ref={messagesContainerRef} className="flex-1 overflow-y-auto px-4 py-2 space-y-2 hide-scrollbar">
          {messages.map((msg) => {
            const isOwn = msg.sender_id === MOCK_SELF_ID
            return (
              <div key={msg.id} className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}>
                <div
                  className={`max-w-[75%] px-4 py-2.5 rounded-2xl text-sm leading-relaxed ${
                    isOwn
                      ? 'bg-qp-500/20 text-white rounded-br-sm'
                      : 'bg-white/10 text-white/90 rounded-bl-sm'
                  }`}
                >
                  {msg.content}
                </div>
              </div>
            )
          })}
        </div>

        {/* Input */}
        <div className="px-4 pb-4 pt-2 shrink-0 safe-bottom">
          <div className="flex gap-2 items-end">
            <input
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
              placeholder="Type a message…"
              className="input flex-1 py-2.5 text-sm"
            />
            <button
              onClick={sendMessage}
              disabled={!inputText.trim()}
              className="w-10 h-10 rounded-xl bg-qp-500 flex items-center justify-center text-white active:scale-95 transition-all disabled:opacity-40 disabled:cursor-not-allowed shrink-0"
            >
              <Send size={16} />
            </button>
          </div>
        </div>
      </div>
    </AppShell>
  )
}
