import { Sword } from 'lucide-react'
import { AppShell } from '../_components/layout/AppShell'

export default function DuosPage() {
  return (
    <AppShell title="Duos">
      <div className="flex flex-col items-center justify-center h-[calc(100vh-3.5rem-5rem)] gap-4 px-6 text-center">
        <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-qp-500/20 to-accent-500/20 border border-white/10 flex items-center justify-center">
          <Sword size={28} className="text-qp-400" />
        </div>
        <div>
          <h2 className="text-xl font-display font-bold mb-1">Duos</h2>
          <p className="text-sm text-white/50">
            Your matched duo partners and ongoing conversations will appear here.
          </p>
        </div>
        <span className="text-xs text-white/20 glass px-3 py-1.5 rounded-full">
          Not in this PoC
        </span>
      </div>
    </AppShell>
  )
}
