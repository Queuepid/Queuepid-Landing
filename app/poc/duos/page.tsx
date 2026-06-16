'use client'

import { useState, useEffect, useRef } from 'react'
import Image from 'next/image'
import { Send, ArrowLeft, Loader2 } from 'lucide-react'
import { AppShell } from '../_components/layout/AppShell'
import { Avatar } from '../_components/ui/Avatar'

const MOCK_SELF_ID = 'poc-self-user'
const MOCK_PARTNER_ID = 'poc-partner-aria'

const mockDuo = {
  id: MOCK_PARTNER_ID,
  display_name: 'Aria',
  age: 21,
  photo: 'https://picsum.photos/seed/aria1/400/600',
  bio: 'Valorant Platinum grinder by day, Minecraft builder by night.',
  online: true,
}

interface Message {
  id: string
  sender_id: string
  content: string
  created_at: string
}

const SEED_MESSAGES: Message[] = [
  { id: 's1', sender_id: MOCK_PARTNER_ID, content: 'hey!! glad we matched 😊', created_at: new Date(Date.now() - 3600000 * 3).toISOString() },
  { id: 's2', sender_id: MOCK_SELF_ID, content: 'same! your valorant rank is impressive', created_at: new Date(Date.now() - 3600000 * 2).toISOString() },
  { id: 's3', sender_id: MOCK_PARTNER_ID, content: 'haha thanks, been grinding ranked all week. what rank are you?', created_at: new Date(Date.now() - 3600000 * 1.5).toISOString() },
  { id: 's4', sender_id: MOCK_SELF_ID, content: 'gold 3 rn, slowly making my way up lol', created_at: new Date(Date.now() - 3600000).toISOString() },
  { id: 's5', sender_id: MOCK_PARTNER_ID, content: 'we should queue together sometime! i can help you rank up 😄', created_at: new Date(Date.now() - 1800000).toISOString() },
]

const BOT_RESPONSES = [
  'haha yeah that makes sense 😄',
  'omg same honestly',
  'wait really?? that\'s so cool',
  'lol i can relate to that',
  'we should play later tonight if you\'re free!',
  'honestly agreed, couldn\'t have said it better',
  'ok but that\'s actually hilarious 💀',
  'yesss exactly what i was thinking',
  'no way, how long have you been doing that?',
  'that\'s wild, okay now i\'m curious',
]

function timeLabel(iso: string) {
  const d = new Date(iso)
  const now = Date.now()
  const diff = now - d.getTime()
  if (diff < 60000) return 'just now'
  if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`
  if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`
  return d.toLocaleDateString()
}

export default function DuosPage() {
  const [view, setView] = useState<'list' | 'chat'>('list')
  const [messages, setMessages] = useState<Message[]>(SEED_MESSAGES)
  const [inputText, setInputText] = useState('')
  const [botTyping, setBotTyping] = useState(false)
  const responseIndexRef = useRef(0)
  const messagesContainerRef = useRef<HTMLDivElement>(null)

  // Scroll the messages container only — never the window — so the input bar
  // stays pinned at the bottom of the viewport.
  useEffect(() => {
    if (view === 'chat') {
      const c = messagesContainerRef.current
      if (c) c.scrollTop = c.scrollHeight
    }
  }, [messages, view, botTyping])

  const sendMessage = () => {
    if (!inputText.trim() || botTyping) return
    const content = inputText.trim()
    setInputText('')

    const sent: Message = {
      id: `m-${Date.now()}`,
      sender_id: MOCK_SELF_ID,
      content,
      created_at: new Date().toISOString(),
    }
    setMessages((prev) => [...prev, sent])
    setBotTyping(true)

    setTimeout(() => {
      const reply: Message = {
        id: `m-${Date.now() + 1}`,
        sender_id: MOCK_PARTNER_ID,
        content: BOT_RESPONSES[responseIndexRef.current % BOT_RESPONSES.length],
        created_at: new Date().toISOString(),
      }
      responseIndexRef.current += 1
      setMessages((prev) => [...prev, reply])
      setBotTyping(false)
    }, 1200 + Math.random() * 800)
  }

  // ── List view ──────────────────────────────────────────────────────────────
  if (view === 'list') {
    const lastMsg = messages[messages.length - 1]
    return (
      <AppShell title="Duos">
        <div className="px-4 py-4">
          <button
            onClick={() => setView('chat')}
            className="glass-hover w-full flex items-center gap-3 px-4 py-3.5 text-left"
          >
            <div className="relative shrink-0">
              <Image
                src={mockDuo.photo}
                alt={mockDuo.display_name}
                width={48}
                height={48}
                className="w-12 h-12 rounded-full object-cover"
                unoptimized
              />
              <span className="absolute bottom-0 right-0 w-3 h-3 rounded-full bg-green-400 border-2 border-surface" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between mb-0.5">
                <span className="font-semibold text-sm">{mockDuo.display_name}</span>
                <span className="text-[10px] text-white/30 shrink-0 ml-2">{timeLabel(lastMsg.created_at)}</span>
              </div>
              <p className="text-xs text-white/40 truncate">
                {lastMsg.sender_id === MOCK_SELF_ID ? 'You: ' : ''}{lastMsg.content}
              </p>
            </div>
          </button>
        </div>
      </AppShell>
    )
  }

  // ── Chat view ──────────────────────────────────────────────────────────────
  return (
    <AppShell
      title={mockDuo.display_name}
      hideNav
    >
      <div className="flex flex-col h-[calc(100vh-3.5rem)]">
        {/* Header */}
        <div className="px-4 py-3 glass border-b border-white/10 flex items-center gap-3 shrink-0">
          <button
            onClick={() => setView('list')}
            className="p-1.5 rounded-lg text-white/50 hover:text-white hover:bg-white/5 transition-all"
          >
            <ArrowLeft size={18} />
          </button>
          <Avatar src={mockDuo.photo} alt={mockDuo.display_name} size="sm" online />
          <div className="flex-1 min-w-0">
            <p className="font-semibold text-sm leading-none">{mockDuo.display_name}, {mockDuo.age}</p>
            <p className="text-[11px] text-green-400 mt-0.5">Online</p>
          </div>
        </div>

        {/* Messages */}
        <div ref={messagesContainerRef} className="flex-1 overflow-y-auto px-4 py-3 space-y-2 hide-scrollbar">
          {messages.map((msg) => {
            const isOwn = msg.sender_id === MOCK_SELF_ID
            return (
              <div key={msg.id} className={`flex flex-col ${isOwn ? 'items-end' : 'items-start'}`}>
                <div
                  className={`max-w-[78%] px-4 py-2.5 rounded-2xl text-sm leading-relaxed ${
                    isOwn
                      ? 'bg-qp-500/25 text-white rounded-br-sm'
                      : 'bg-white/10 text-white/90 rounded-bl-sm'
                  }`}
                >
                  {msg.content}
                </div>
                <span className="text-[10px] text-white/20 mt-1 px-1">{timeLabel(msg.created_at)}</span>
              </div>
            )
          })}

          {botTyping && (
            <div className="flex items-start">
              <div className="bg-white/10 rounded-2xl rounded-bl-sm px-4 py-3 flex items-center gap-1.5">
                <Loader2 size={12} className="text-white/40 animate-spin" />
                <span className="text-xs text-white/40">{mockDuo.display_name} is typing…</span>
              </div>
            </div>
          )}
        </div>

        {/* Input */}
        <div className="px-4 pb-4 pt-2 shrink-0 safe-bottom">
          <div className="flex gap-2 items-end">
            <input
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
              placeholder={`Message ${mockDuo.display_name}…`}
              className="input flex-1 py-2.5 text-sm"
              disabled={botTyping}
            />
            <button
              onClick={sendMessage}
              disabled={!inputText.trim() || botTyping}
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
