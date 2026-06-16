'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@poc/_data/utils'
import { Compass, Shuffle, User, Settings } from 'lucide-react'

const NAV_ITEMS = [
  { href: '/poc/discover', label: 'Discover', icon: Compass },
  { href: '/poc/queue', label: 'Queue', icon: Shuffle },
  { href: '/poc/profile', label: 'Profile', icon: User },
  { href: '/poc/settings', label: 'Settings', icon: Settings },
] as const

export function BottomNav() {
  const pathname = usePathname()

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 glass border-t border-white/10 safe-bottom">
      <div className="flex items-center justify-around max-w-lg mx-auto h-16">
        {NAV_ITEMS.map(({ href, label, icon: Icon }) => {
          const active = pathname.startsWith(href)
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                'flex flex-col items-center gap-0.5 px-3 py-1 rounded-lg transition-all duration-200',
                active ? 'text-qp-400' : 'text-white/40 hover:text-white/70'
              )}
            >
              <Icon size={22} strokeWidth={active ? 2.5 : 1.5} />
              <span className="text-[10px] font-medium">{label}</span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
