import Link from 'next/link'
import { Compass, Shuffle, User, Settings, ArrowRight } from 'lucide-react'

const PAGES = [
  {
    href: '/poc/discover',
    icon: Compass,
    label: 'Discover',
    description: 'Swipe through profiles and find your duo',
  },
  {
    href: '/poc/queue',
    icon: Shuffle,
    label: 'Play Queue',
    description: 'Match with someone to game with right now',
  },
  {
    href: '/poc/profile',
    icon: User,
    label: 'Profile',
    description: 'Your profile card and XP progress',
  },
  {
    href: '/poc/settings',
    icon: Settings,
    label: 'Settings',
    description: 'Preferences, account, and privacy',
  },
] as const

export default function PocIndexPage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-6 py-12">
      <div className="w-full max-w-sm space-y-8">
        <div className="text-center">
          <h1 className="text-3xl font-display font-black gradient-text mb-2">Queuepid PoC</h1>
          <p className="text-sm text-white/50">Select a page to explore</p>
        </div>

        <nav className="space-y-3">
          {PAGES.map(({ href, icon: Icon, label, description }) => (
            <Link
              key={href}
              href={href}
              className="glass-hover flex items-center gap-4 px-4 py-4 group"
            >
              <div className="w-10 h-10 rounded-xl bg-qp-500/15 border border-qp-500/20 flex items-center justify-center shrink-0">
                <Icon size={18} className="text-qp-400" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-sm">{label}</p>
                <p className="text-xs text-white/40 mt-0.5 truncate">{description}</p>
              </div>
              <ArrowRight size={16} className="text-white/20 group-hover:text-white/50 transition-colors shrink-0" />
            </Link>
          ))}
        </nav>

        <p className="text-center text-xs text-white/20">
          All data is mocked — no backend, no auth
        </p>
      </div>
    </div>
  )
}
