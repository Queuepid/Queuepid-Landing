'use client'

import { cn } from '@poc/_data/utils'

interface ExpBarProps {
  level: number
  xp: number
  className?: string
}

export function ExpBar({ level, xp, className }: ExpBarProps) {
  const xpForNextLevel = level * 200
  const xpProgress = Math.min((xp / xpForNextLevel) * 100, 100)

  return (
    <div className={cn('glass p-4', className)}>
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs font-medium text-white/50">Level {level}</span>
        <span className="text-xs text-white/30">
          {xp}/{xpForNextLevel} XP
        </span>
      </div>
      <div className="w-full h-2 bg-white/10 rounded-full overflow-hidden">
        <div
          className="h-full bg-gradient-to-r from-qp-500 to-accent-500 rounded-full transition-all duration-500"
          style={{ width: `${xpProgress}%` }}
        />
      </div>
    </div>
  )
}
