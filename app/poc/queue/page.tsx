'use client'

import { useState, useEffect, useRef } from 'react'
import { Swords, X, Eye, UserPlus, Send, Loader2 } from 'lucide-react'
import { AppShell } from '../_components/layout/AppShell'
import { Button } from '../_components/ui/Button'
import { Chip } from '../_components/ui/Chip'
import { RangeSlider } from '../_components/ui/RangeSlider'
import { Avatar } from '../_components/ui/Avatar'
import { cn } from '../_data/utils'
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
  GENDERS,
  type MicPref,
  type Region,
  type Gender,
  type RankWindow,
} from '../_data/types'
import type { Message } from '../_data/types'

type QueueStatus = 'idle' | 'searching' | 'chatting'

const RANK_WINDOWS: { value: RankWindow; label: string }[] = [
  { value: 0, label: 'Same tier' },
  { value: 1, label: '±1' },
  { value: 2, label: '±2' },
  { value: 99, label: 'Any' },
]

export default function QueuePage() {
  const [status, setStatus] = useState<QueueStatus>('idle')

  // Preferences (ephemeral, per session) — mirrors Queuepid-Web's queue setup
  const [untrackedSelected, setUntrackedSelected] = useState<string[]>([])
  const [valorantSelected, setValorantSelected] = useState(false)
  const [rankWindow, setRankWindow] = useState<RankWindow>(1)
  const [regions, setRegions] = useState<Region[]>(['na'])
  const [mic, setMic] = useState<MicPref>('either')
  const [gendersWanted, setGendersWanted] = useState<Gender[]>([])
  const [excludeDuos, setExcludeDuos] = useState(false)
  const [ageMin, setAgeMin] = useState(16)
  const [ageMax, setAgeMax] = useState(99)
  const [ageMinText, setAgeMinText] = useState('16')
  const [ageMaxText, setAgeMaxText] = useState('99')
  const [ageMinFocused, setAgeMinFocused] = useState(false)
  const [ageMaxFocused, setAgeMaxFocused] = useState(false)

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
    setRegions((prev) => (prev.includes(r) ? prev.filter((x) => x !== r) : [...prev, r]))
  }
  const allRegionsSelected = regions.length === REGIONS.length
  const toggleAllRegions = () => setRegions(allRegionsSelected ? [] : [...REGIONS])

  const toggleUntracked = (name: string) => {
    setUntrackedSelected((prev) =>
      prev.includes(name) ? prev.filter((x) => x !== name) : [...prev, name]
    )
  }
  const allGamesSelected = valorantSelected && untrackedSelected.length === POPULAR_GAMES.length
  const toggleAllGames = () => {
    if (allGamesSelected) {
      setValorantSelected(false)
      setUntrackedSelected([])
    } else {
      setValorantSelected(true)
      setUntrackedSelected([...POPULAR_GAMES])
    }
  }

  const isValidAgeMin = (text: string) => {
    const n = parseInt(text)
    return !isNaN(n) && n >= 16 && n < ageMax
  }
  const isValidAgeMax = (text: string) => {
    const n = parseInt(text)
    return !isNaN(n) && n > ageMin && n <= 99
  }

  const partner = partnerRevealed ? mockPartnerRevealedProfile : null
  const partnerAlias = mockPartnerGameProfile.alias

  // ── Idle / setup view ─────────────────────────────────────────────────────
  if (status === 'idle') {
    return (
      <AppShell title="Play Queue">
        <div className="px-4 py-6 space-y-6 pb-32">
          {/* Header */}
          <div className="text-center">
            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-accent-500 to-qp-500 flex items-center justify-center mx-auto mb-4">
              <Swords size={28} className="text-white" />
            </div>
            <h2 className="font-display text-xl font-semibold mb-1">Find a duo</h2>
            <p className="text-sm text-white/40 max-w-xs mx-auto">
              Match with someone who plays what you play. Rank shows up front; names stay anonymous
              until you both reveal.
            </p>
          </div>

          {/* Preferences */}
          <div className="glass p-5 space-y-5">
            {/* Games */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="block text-sm font-medium text-white/60">Games to play</label>
                <button
                  onClick={toggleAllGames}
                  className="text-[11px] text-qp-300 hover:text-qp-200 transition-colors"
                >
                  {allGamesSelected ? 'Clear' : 'Select all'}
                </button>
              </div>
              <div className="flex flex-wrap gap-2">
                <Chip
                  label="Valorant"
                  active={valorantSelected}
                  onToggle={() => setValorantSelected((v) => !v)}
                />
                {POPULAR_GAMES.map((name) => (
                  <Chip
                    key={name}
                    label={name}
                    active={untrackedSelected.includes(name)}
                    onToggle={() => toggleUntracked(name)}
                  />
                ))}
              </div>
            </div>

            {/* Rank window — only when Valorant selected */}
            {valorantSelected && (
              <div>
                <label className="block text-sm font-medium text-white/60 mb-2">Rank window</label>
                <div className="grid grid-cols-4 gap-2">
                  {RANK_WINDOWS.map((w) => (
                    <button
                      key={w.value}
                      onClick={() => setRankWindow(w.value)}
                      className={`px-2 py-2 rounded-lg border text-xs transition-all ${
                        rankWindow === w.value
                          ? 'border-qp-500/50 bg-qp-500/10 text-white'
                          : 'border-white/10 bg-white/5 text-white/60 hover:border-white/20'
                      }`}
                    >
                      {w.label}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Region */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="block text-sm font-medium text-white/60">Region</label>
                <button
                  onClick={toggleAllRegions}
                  className="text-[11px] text-qp-300 hover:text-qp-200 transition-colors"
                >
                  {allRegionsSelected ? 'Clear' : 'Select all'}
                </button>
              </div>
              <div className="grid grid-cols-3 gap-2">
                {REGIONS.map((r) => (
                  <button
                    key={r}
                    onClick={() => toggleRegion(r)}
                    className={`px-3 py-2 rounded-lg border text-xs transition-all ${
                      regions.includes(r)
                        ? 'border-qp-500/50 bg-qp-500/10 text-white'
                        : 'border-white/10 bg-white/5 text-white/60 hover:border-white/20'
                    }`}
                  >
                    {REGION_LABELS[r]}
                  </button>
                ))}
              </div>
              {regions.length === 0 && (
                <p className="text-[10px] text-white/30 mt-1.5">No regions selected — matching any.</p>
              )}
            </div>

            {/* Mic preference */}
            <div>
              <label className="block text-sm font-medium text-white/60 mb-2">Voice chat</label>
              <div className="grid grid-cols-3 gap-2">
                {MIC_PREFS.map((p) => (
                  <button
                    key={p}
                    onClick={() => setMic(p)}
                    className={`px-2 py-2 rounded-lg border text-xs transition-all ${
                      mic === p
                        ? 'border-qp-500/50 bg-qp-500/10 text-white'
                        : 'border-white/10 bg-white/5 text-white/60 hover:border-white/20'
                    }`}
                  >
                    {MIC_PREF_LABELS[p]}
                  </button>
                ))}
              </div>
            </div>

            {/* Gender preference */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="block text-sm font-medium text-white/60">Match gender</label>
                <button
                  onClick={() =>
                    setGendersWanted(gendersWanted.length === GENDERS.length ? [] : [...GENDERS])
                  }
                  className="text-[11px] text-qp-300 hover:text-qp-200 transition-colors"
                >
                  {gendersWanted.length === GENDERS.length ? 'Clear' : 'Select all'}
                </button>
              </div>
              <div className="flex flex-wrap gap-2">
                {GENDERS.map((g) => (
                  <Chip
                    key={g}
                    label={g === 'non-binary' ? 'Non-binary' : g.charAt(0).toUpperCase() + g.slice(1)}
                    active={gendersWanted.includes(g)}
                    onToggle={() =>
                      setGendersWanted((prev) =>
                        prev.includes(g) ? prev.filter((x) => x !== g) : [...prev, g]
                      )
                    }
                  />
                ))}
              </div>
              {gendersWanted.length === 0 && (
                <p className="text-[10px] text-white/30 mt-1.5">No filter — matching any.</p>
              )}
            </div>

            {/* Age range */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <label className="text-sm font-medium text-white/60">Age range</label>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    inputMode="numeric"
                    value={ageMinFocused ? ageMinText : ageMin}
                    onChange={(e) => {
                      const raw = e.target.value.replace(/\D/g, '').slice(0, 2)
                      setAgeMinText(raw)
                      if (raw !== '') {
                        const val = parseInt(raw)
                        if (val >= 16 && val < ageMax) setAgeMin(val)
                      }
                    }}
                    onFocus={() => {
                      setAgeMinFocused(true)
                      setAgeMinText(String(ageMin))
                    }}
                    onBlur={() => {
                      setAgeMinFocused(false)
                      const val = parseInt(ageMinText) || 16
                      const clamped = Math.max(16, Math.min(val, ageMax - 1))
                      setAgeMin(clamped)
                      setAgeMinText(String(clamped))
                    }}
                    className={cn(
                      'w-10 h-8 bg-white/5 border rounded-lg text-center text-sm font-bold text-white focus:outline-none transition-all',
                      ageMinFocused && !isValidAgeMin(ageMinText)
                        ? 'border-white/5 text-white/30'
                        : 'border-white/10 focus:border-qp-500/50'
                    )}
                  />
                  <span className="text-white/20 text-xs">—</span>
                  <input
                    type="text"
                    inputMode="numeric"
                    value={ageMaxFocused ? ageMaxText : ageMax}
                    onChange={(e) => {
                      const raw = e.target.value.replace(/\D/g, '').slice(0, 2)
                      setAgeMaxText(raw)
                      if (raw !== '') {
                        const val = parseInt(raw)
                        if (val > ageMin && val <= 99) setAgeMax(val)
                      }
                    }}
                    onFocus={() => {
                      setAgeMaxFocused(true)
                      setAgeMaxText(String(ageMax))
                    }}
                    onBlur={() => {
                      setAgeMaxFocused(false)
                      const val = parseInt(ageMaxText) || 99
                      const clamped = Math.max(ageMin + 1, Math.min(val, 99))
                      setAgeMax(clamped)
                      setAgeMaxText(String(clamped))
                    }}
                    className={cn(
                      'w-10 h-8 bg-white/5 border rounded-lg text-center text-sm font-bold text-white focus:outline-none transition-all',
                      ageMaxFocused && !isValidAgeMax(ageMaxText)
                        ? 'border-white/5 text-white/30'
                        : 'border-white/10 focus:border-qp-500/50'
                    )}
                  />
                </div>
              </div>
              <RangeSlider
                min={16}
                max={99}
                valueMin={ageMin}
                valueMax={ageMax}
                onChangeMin={(v) => {
                  setAgeMin(v)
                  setAgeMinText(String(v))
                }}
                onChangeMax={(v) => {
                  setAgeMax(v)
                  setAgeMaxText(String(v))
                }}
              />
            </div>

            {/* Skip-existing-duos toggle */}
            <label className="flex items-center justify-between gap-3 cursor-pointer">
              <div className="min-w-0">
                <p className="text-sm font-medium text-white/80">Skip existing duos</p>
                <p className="text-[11px] text-white/40">
                  Don&apos;t match me with people I&apos;m already duos with.
                </p>
              </div>
              <span
                role="switch"
                aria-checked={excludeDuos}
                onClick={() => setExcludeDuos((v) => !v)}
                className={`relative inline-flex h-6 w-11 flex-shrink-0 rounded-full transition-colors ${
                  excludeDuos ? 'bg-qp-500' : 'bg-white/10'
                }`}
              >
                <span
                  className={`absolute top-0.5 h-5 w-5 rounded-full bg-white transition-transform ${
                    excludeDuos ? 'translate-x-[22px]' : 'translate-x-0.5'
                  }`}
                />
              </span>
            </label>
          </div>

          {/* Start button — no game filter is treated as "any game". */}
          <Button className="w-full" onClick={startSearch}>
            <span className="flex items-center gap-2 justify-center">
              <Swords size={18} />
              Find players
            </span>
          </Button>
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
    <AppShell title={partner ? partner.display_name : partnerAlias} hideNav onBack={leaveChat} backLabel="New queue">
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
