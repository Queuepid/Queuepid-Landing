'use client'

import { useMemo } from 'react'
import { cn } from '@poc/_data/utils'

interface RangeSliderProps {
  min: number
  max: number
  valueMin: number
  valueMax: number
  onChangeMin: (val: number) => void
  onChangeMax: (val: number) => void
  className?: string
}

export function RangeSlider({ min, max, valueMin, valueMax, onChangeMin, onChangeMax, className }: RangeSliderProps) {
  const range = max - min
  const progressMin = useMemo(() => ((valueMin - min) / range) * 100, [valueMin, min, range])
  const progressMax = useMemo(() => ((valueMax - min) / range) * 100, [valueMax, min, range])

  const handleTrackPointer = (e: React.PointerEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect()
    if (rect.width === 0) return
    const ratio = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width))
    const value = Math.round(min + ratio * range)
    const distToMin = Math.abs(value - valueMin)
    const distToMax = Math.abs(value - valueMax)
    if (distToMin <= distToMax) {
      onChangeMin(Math.min(Math.max(value, min), valueMax - 1))
    } else {
      onChangeMax(Math.max(Math.min(value, max), valueMin + 1))
    }
  }

  return (
    <div
      className={cn('relative h-6 w-full flex items-center group cursor-pointer', className)}
      onPointerDown={handleTrackPointer}
    >
      <div className="absolute inset-x-0 h-1.5 bg-white/10 rounded-full" />
      <div
        className="absolute h-1.5 bg-gradient-to-r from-qp-500 to-accent-500 rounded-full transition-all duration-75"
        style={{ left: `${progressMin}%`, width: `${progressMax - progressMin}%` }}
      />
      <input
        type="range"
        min={min}
        max={max}
        value={valueMin}
        onChange={(e) => onChangeMin(Math.min(Number(e.target.value), valueMax - 1))}
        className="range-thumb absolute w-full h-1.5 bg-transparent appearance-none pointer-events-none z-20"
      />
      <input
        type="range"
        min={min}
        max={max}
        value={valueMax}
        onChange={(e) => onChangeMax(Math.max(Number(e.target.value), valueMin + 1))}
        className="range-thumb absolute w-full h-1.5 bg-transparent appearance-none pointer-events-none z-10"
      />
    </div>
  )
}
