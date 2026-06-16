'use client'

import { useEffect, type ReactNode } from 'react'
import { cn } from '@poc/_data/utils'

interface ModalProps {
  open: boolean
  onClose: () => void
  title?: string
  children: ReactNode
  className?: string
}

export function Modal({ open, onClose, title, children, className }: ModalProps) {
  useEffect(() => {
    if (open) {
      document.body.style.overflow = 'hidden'
      return () => {
        document.body.style.overflow = ''
      }
    }
  }, [open])

  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className={cn('relative glass p-6 max-w-md w-full max-h-[90vh] overflow-y-auto', className)}>
        {title && (
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-display font-semibold">{title}</h2>
            <button onClick={onClose} className="text-white/40 hover:text-white transition-colors text-xl">
              &times;
            </button>
          </div>
        )}
        {children}
      </div>
    </div>
  )
}
