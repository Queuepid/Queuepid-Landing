'use client'

import { useState } from 'react'
import { ChevronRight, Crown, Zap, Check } from 'lucide-react'
import { AppShell } from '../_components/layout/AppShell'
import { SUBSCRIPTION_PLANS, type SubscriptionTier } from '../_data/types'
import { formatPrice } from '../_data/utils'

const CURRENT_TIER: SubscriptionTier = 0

export default function SettingsPage() {
  const [billingPeriod, setBillingPeriod] = useState<'monthly' | 'annually'>('monthly')
  const [showUpgradeNote, setShowUpgradeNote] = useState(false)

  const getPrice = (plan: (typeof SUBSCRIPTION_PLANS)[number]) => {
    if (plan.monthly_price_cents === 0) return 'Free'
    if (billingPeriod === 'annually') {
      const monthly = plan.annual_price_cents / 12
      return `${formatPrice(monthly)}/mo`
    }
    return `${formatPrice(plan.monthly_price_cents)}/mo`
  }

  const handleUpgrade = () => {
    setShowUpgradeNote(true)
    setTimeout(() => setShowUpgradeNote(false), 4000)
  }

  const paidPlans = SUBSCRIPTION_PLANS.filter((p) => p.tier > 0)

  return (
    <AppShell title="Settings">
      <div className="px-4 py-4 space-y-6">

        {/* ── Discovery ── */}
        <section>
          <h2 className="text-xs font-semibold text-white/40 uppercase tracking-wider mb-2 px-1">Discovery</h2>
          <div className="glass divide-y divide-white/5">
            <div className="flex items-center justify-between px-4 py-3.5 opacity-40">
              <div>
                <p className="text-sm font-medium">Match Preferences</p>
                <p className="text-xs text-white/40 mt-0.5">Age, gender, intentions</p>
              </div>
              <ChevronRight size={16} className="text-white/30" />
            </div>
            <div className="flex items-center justify-between px-4 py-3.5 opacity-40">
              <div>
                <p className="text-sm font-medium">Feed Boost</p>
                <p className="text-xs text-white/40 mt-0.5">30% — Free tier</p>
              </div>
              <ChevronRight size={16} className="text-white/30" />
            </div>
          </div>
        </section>

        {/* ── Account ── */}
        <section>
          <h2 className="text-xs font-semibold text-white/40 uppercase tracking-wider mb-2 px-1">Account</h2>
          <div className="glass divide-y divide-white/5">
            <div className="flex items-center justify-between px-4 py-3.5 opacity-40">
              <div>
                <p className="text-sm font-medium">Verification</p>
                <p className="text-xs text-white/40 mt-0.5">Not verified</p>
              </div>
              <ChevronRight size={16} className="text-white/30" />
            </div>
            <div className="flex items-center justify-between px-4 py-3.5 opacity-40">
              <div>
                <p className="text-sm font-medium">Subscription</p>
                <p className="text-xs text-white/40 mt-0.5">Free</p>
              </div>
              <ChevronRight size={16} className="text-white/30" />
            </div>
          </div>
        </section>

        {/* ── Upgrade ── */}
        <section>
          <h2 className="text-xs font-semibold text-white/40 uppercase tracking-wider mb-2 px-1">Upgrade</h2>

          {/* Billing toggle */}
          <div className="flex items-center justify-center gap-1 p-1 glass rounded-xl mb-4">
            {(['monthly', 'annually'] as const).map((period) => (
              <button
                key={period}
                onClick={() => setBillingPeriod(period)}
                className={`flex-1 py-2 rounded-lg text-sm font-medium transition-all ${
                  billingPeriod === period
                    ? 'bg-qp-500/20 text-qp-300'
                    : 'text-white/40 hover:text-white/70'
                }`}
              >
                {period === 'monthly' ? 'Monthly' : 'Annually'}
                {period === 'annually' && (
                  <span className="ml-1.5 text-[10px] bg-green-500/20 text-green-400 px-1.5 py-0.5 rounded-full">Save up to 23%</span>
                )}
              </button>
            ))}
          </div>

          {/* Plan cards */}
          <div className="space-y-3">
            {paidPlans.map((plan) => {
              const isCurrent = plan.tier === CURRENT_TIER
              const tierIcons = [null, Crown, Zap, Zap]
              const Icon = tierIcons[plan.tier]
              const gradients = [
                '',
                'from-qp-500/10 to-qp-600/10',
                'from-accent-500/10 to-accent-600/10',
                'from-orange-500/10 to-red-500/10',
              ]

              return (
                <div
                  key={plan.tier}
                  className={`glass bg-gradient-to-br ${gradients[plan.tier]} p-4`}
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-2">
                      {Icon && <Icon size={18} className="text-qp-400" />}
                      <div>
                        <h3 className="font-display font-bold">{plan.name}</h3>
                        <p className="text-2xl font-black gradient-text">{getPrice(plan)}</p>
                      </div>
                    </div>
                    {isCurrent && (
                      <span className="text-xs bg-white/10 text-white/60 px-2 py-0.5 rounded-full">Current</span>
                    )}
                  </div>

                  <ul className="space-y-1.5 mb-4">
                    {plan.features.map((feature) => (
                      <li key={feature} className="flex items-center gap-2 text-sm text-white/70">
                        <Check size={13} className="text-qp-400 shrink-0" />
                        {feature}
                      </li>
                    ))}
                  </ul>

                  {!isCurrent && (
                    <button
                      onClick={handleUpgrade}
                      className="btn-primary w-full text-sm"
                    >
                      Upgrade to {plan.name}
                    </button>
                  )}
                </div>
              )
            })}
          </div>

          {showUpgradeNote && (
            <div className="mt-3 p-3 glass border border-qp-500/30 rounded-xl text-sm text-center text-white/70 animate-slide-up">
              Sign up at <span className="text-qp-400 font-medium">queuepid.com</span> to unlock upgrades. This is a PoC demo.
            </div>
          )}
        </section>

        {/* ── Notifications & Privacy ── */}
        <section>
          <h2 className="text-xs font-semibold text-white/40 uppercase tracking-wider mb-2 px-1">Notifications & Privacy</h2>
          <div className="glass divide-y divide-white/5">
            <div className="flex items-center justify-between px-4 py-3.5 opacity-40">
              <p className="text-sm font-medium">Notifications</p>
              <ChevronRight size={16} className="text-white/30" />
            </div>
            <div className="flex items-center justify-between px-4 py-3.5 opacity-40">
              <p className="text-sm font-medium">Blocked Users</p>
              <ChevronRight size={16} className="text-white/30" />
            </div>
          </div>
        </section>

        <p className="text-center text-xs text-white/30 pb-4">
          PoC demo — full features available at{' '}
          <span className="text-qp-400">queuepid.com</span>
        </p>
      </div>
    </AppShell>
  )
}
