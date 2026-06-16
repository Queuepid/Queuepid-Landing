'use client'

import Image from 'next/image'
import { cn } from '@poc/_data/utils'

type Size = 'sm' | 'md' | 'lg' | 'xl'

interface AvatarProps {
  src?: string | null
  alt: string
  size?: Size
  online?: boolean
  className?: string
}

const sizeMap: Record<Size, { container: string; indicator: string }> = {
  sm: { container: 'w-8 h-8', indicator: 'w-2.5 h-2.5' },
  md: { container: 'w-12 h-12', indicator: 'w-3 h-3' },
  lg: { container: 'w-16 h-16', indicator: 'w-3.5 h-3.5' },
  xl: { container: 'w-24 h-24', indicator: 'w-4 h-4' },
}

const pixelSizes: Record<Size, number> = { sm: 32, md: 48, lg: 64, xl: 96 }

export function Avatar({ src, alt, size = 'md', online, className }: AvatarProps) {
  const { container, indicator } = sizeMap[size]

  return (
    <div className={cn('relative shrink-0', container, className)}>
      {src ? (
        <Image
          src={src}
          alt={alt}
          width={pixelSizes[size]}
          height={pixelSizes[size]}
          className="w-full h-full rounded-full object-cover"
          unoptimized
        />
      ) : (
        <div className="w-full h-full rounded-full bg-gradient-to-br from-qp-500 to-accent-500 flex items-center justify-center">
          <span className="text-white font-semibold" style={{ fontSize: pixelSizes[size] / 2.5 }}>
            {alt.charAt(0).toUpperCase()}
          </span>
        </div>
      )}
      {online !== undefined && (
        <span
          className={cn(
            'absolute bottom-0 right-0 rounded-full border-2 border-surface',
            indicator,
            online ? 'bg-green-400' : 'bg-white/30'
          )}
        />
      )}
    </div>
  )
}
