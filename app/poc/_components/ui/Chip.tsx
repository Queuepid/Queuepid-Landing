'use client'

import { cn } from '@poc/_data/utils'

interface ChipProps {
  label: string
  active?: boolean
  onToggle?: () => void
  removable?: boolean
  onRemove?: () => void
  className?: string
}

export function Chip({ label, active, onToggle, removable, onRemove, className }: ChipProps) {
  return (
    <button
      type="button"
      onClick={onToggle}
      className={cn(active ? 'chip-active' : 'chip', 'transition-all duration-150', className)}
    >
      {label}
      {removable && (
        <span
          role="button"
          onClick={(e) => {
            e.stopPropagation()
            onRemove?.()
          }}
          className="ml-1 text-white/40 hover:text-white/80"
        >
          &times;
        </span>
      )}
    </button>
  )
}
