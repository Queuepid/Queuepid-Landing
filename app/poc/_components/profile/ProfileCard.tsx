'use client'

import Image from 'next/image'
import { Camera, Mic, Star } from 'lucide-react'
import { Chip } from '../ui/Chip'
import { INTENTION_LABELS, type UserProfile } from '@poc/_data/types'

interface ProfileCardProps {
  profile: UserProfile
  isOwnProfile?: boolean
  onEditPhoto?: () => void
}

export function ProfileCard({ profile, isOwnProfile, onEditPhoto }: ProfileCardProps) {
  const primaryPhoto = profile.photos.find((p) => p.is_primary) ?? profile.photos[0]

  return (
    <div className="glass overflow-hidden">
      <div className="relative h-64">
        {primaryPhoto ? (
          <Image
            src={primaryPhoto.url}
            alt={profile.display_name}
            fill
            className="object-cover"
            unoptimized
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-qp-600 to-accent-600" />
        )}

        {isOwnProfile && (
          <button
            onClick={onEditPhoto}
            className="absolute top-3 right-3 p-2 rounded-full bg-black/50 backdrop-blur-sm border border-white/10 hover:bg-black/70 transition-colors"
          >
            <Camera size={16} className="text-white" />
          </button>
        )}
      </div>

      <div className="px-5 pb-5 pt-4">
        <div className="flex items-baseline gap-2 mb-3">
          <h2 className="text-2xl font-display font-bold">{profile.display_name}</h2>
          <span className="text-lg text-white/60">{profile.age}</span>
        </div>

        <div className="flex items-center gap-2 mb-3">
          <span className="text-xs bg-accent-500/20 text-accent-300 px-2 py-0.5 rounded-full border border-accent-500/20">
            Level {profile.level}
          </span>
          {profile.subscription_tier > 0 && (
            <span className="text-xs bg-qp-500/20 text-qp-300 px-2 py-0.5 rounded-full border border-qp-500/20 flex items-center gap-1">
              <Star size={10} />
              Tier {profile.subscription_tier}
            </span>
          )}
        </div>

        {profile.bio && <p className="text-sm text-white/70 mb-4 leading-relaxed">{profile.bio}</p>}

        <div className="flex items-center gap-1.5 mb-3 text-sm text-white/50">
          <span className="capitalize">{profile.gender}</span>
        </div>

        <div className="mb-3">
          <h4 className="text-xs font-medium text-white/40 uppercase tracking-wider mb-2">Looking for</h4>
          <div className="flex flex-wrap gap-1.5">
            {profile.intentions.map((intention) => (
              <span
                key={intention}
                className="text-xs px-3 py-1 rounded-full bg-qp-500/15 text-qp-300 border border-qp-500/20"
              >
                {INTENTION_LABELS[intention] ?? intention}
              </span>
            ))}
          </div>
        </div>

        <div className="mb-3">
          <h4 className="text-xs font-medium text-white/40 uppercase tracking-wider mb-2">Interests</h4>
          <div className="flex flex-wrap gap-1.5">
            {profile.interests.map((interest) => (
              <Chip key={interest.id} label={interest.name} />
            ))}
          </div>
        </div>

        {profile.voice_notes.filter((v) => v.is_profile).length > 0 && (
          <div className="mb-3">
            <h4 className="text-xs font-medium text-white/40 uppercase tracking-wider mb-2">Voice intro</h4>
            <button className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition-colors w-full">
              <div className="w-8 h-8 rounded-full bg-qp-500/20 flex items-center justify-center">
                <Mic size={14} className="text-qp-400" />
              </div>
              <div className="flex-1 h-1 bg-white/10 rounded-full" />
              <span className="text-xs text-white/40">
                {profile.voice_notes.find((v) => v.is_profile)?.duration_seconds}s
              </span>
            </button>
          </div>
        )}

        {profile.photos.length > 1 && (
          <div>
            <h4 className="text-xs font-medium text-white/40 uppercase tracking-wider mb-2">Photos</h4>
            <div className="grid grid-cols-3 gap-2">
              {profile.photos.map((photo) => (
                <div key={photo.id} className="relative aspect-square rounded-lg overflow-hidden">
                  <Image src={photo.url} alt="Photo" fill className="object-cover" unoptimized />
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
