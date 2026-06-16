// Core types ported from Queuepid-Web for the PoC

export const GENDERS = ['male', 'female', 'non-binary', 'other'] as const
export type Gender = (typeof GENDERS)[number]

export const INTENTIONS = ['competitive', 'casual', 'chill', 'gaming_partner', 'either'] as const
export type Intention = (typeof INTENTIONS)[number]

export const INTENTION_LABELS: Record<Intention, string> = {
  competitive: 'Competitive',
  casual: 'Casual',
  chill: 'Chill',
  gaming_partner: 'Gaming Partner',
  either: 'Either one',
}

export const SUBSCRIPTION_TIERS = [0, 1, 2, 3] as const
export type SubscriptionTier = (typeof SUBSCRIPTION_TIERS)[number]

export const REGIONS = ['na', 'sa', 'eu', 'af', 'as', 'oc'] as const
export type Region = (typeof REGIONS)[number]

export const REGION_LABELS: Record<Region, string> = {
  na: 'North America',
  sa: 'South America',
  eu: 'Europe',
  af: 'Africa',
  as: 'Asia',
  oc: 'Oceania',
}

export const MIC_PREFS = ['mic', 'no_mic', 'either'] as const
export type MicPref = (typeof MIC_PREFS)[number]

export const MIC_PREF_LABELS: Record<MicPref, string> = {
  mic: 'Mic on',
  no_mic: 'Mic off',
  either: 'Either',
}

export type GameMode = 'ranked' | 'unrated' | 'any'
export type RankWindow = 0 | 1 | 2 | 99

export const POPULAR_GAMES: readonly string[] = [
  'League of Legends',
  'Counter-Strike 2',
  'Minecraft',
  'Apex Legends',
  'Overwatch 2',
  'Fortnite',
  'Rocket League',
  'Marvel Rivals',
  'Dota 2',
  'Helldivers 2',
  'Destiny 2',
  'Roblox',
] as const

export const VALORANT_TIERS = [
  'iron', 'bronze', 'silver', 'gold', 'platinum',
  'diamond', 'ascendant', 'immortal', 'radiant',
] as const
export type ValorantTier = (typeof VALORANT_TIERS)[number]

export interface Interest {
  id: string
  name: string
  category: string
}

export interface Photo {
  id: string
  url: string
  is_primary: boolean
  order: number
  created_at: string
  avatar_type?: 'roblox' | 'minecraft'
  avatar_username?: string
}

export interface VoiceNote {
  id: string
  url: string
  duration_seconds: number
  is_profile: boolean
  created_at: string
}

export interface Badge {
  id: string
  name: string
  description: string
  icon_url: string
  earned_at: string
}

export interface UserProfile {
  id: string
  user_id: string
  display_name: string
  bio: string | null
  gender: Gender
  birth_date: string
  age: number
  intentions: Intention[]
  interests: Interest[]
  photos: Photo[]
  voice_notes: VoiceNote[]
  region: Region | null
  subscription_tier: SubscriptionTier
  cosmetic_id: string | null
  badges: Badge[]
  level: number
  xp: number
  feed_boost: number
  created_at: string
  updated_at: string
  last_active: string
}

export interface DiscoverCard {
  user_id: string
  display_name: string
  age: number
  bio: string | null
  gender: Gender
  intentions: Intention[]
  interests: Interest[]
  photos: Photo[]
  voice_notes: VoiceNote[]
  cosmetic: null
  badges: Badge[]
  level: number
  compatibility_score: number
  shared_interests: Interest[]
  distance_label: string | null
}

export interface GameRevealProfile {
  alias: string
  region: Region | null
  mic: MicPref
  intentions: Intention[]
  game_accounts: Array<{
    game: 'valorant'
    rank_tier: ValorantTier | null
    rank_division: number | null
    rr: number | null
    peak_rank_tier: ValorantTier | null
  }>
  untracked_games: string[]
}

export interface Message {
  id: string
  conversation_id: string
  sender_id: string
  type: 'text' | 'image' | 'voice_note'
  content: string
  reply_to: string | null
  edited_at: string | null
  deleted_at: string | null
  read_at: string | null
  created_at: string
  pending?: boolean
}

export interface SubscriptionPlan {
  tier: SubscriptionTier
  name: string
  monthly_price_cents: number
  annual_price_cents: number
  annual_discount_percent: number
  feed_boost_percent: number
  boost_is_public: boolean
  features: string[]
}

export const SUBSCRIPTION_PLANS: SubscriptionPlan[] = [
  {
    tier: 0,
    name: 'Free',
    monthly_price_cents: 0,
    annual_price_cents: 0,
    annual_discount_percent: 0,
    feed_boost_percent: 30,
    boost_is_public: false,
    features: ['Basic matching', 'Text chat', 'Voice notes', 'Queue chat'],
  },
  {
    tier: 1,
    name: 'Spark',
    monthly_price_cents: 100,
    annual_price_cents: 1000,
    annual_discount_percent: 17,
    feed_boost_percent: 20,
    boost_is_public: true,
    features: ['20% feed boost', 'Tier 1 badge', 'Priority queue matching'],
  },
  {
    tier: 2,
    name: 'Flame',
    monthly_price_cents: 300,
    annual_price_cents: 3000,
    annual_discount_percent: 17,
    feed_boost_percent: 30,
    boost_is_public: true,
    features: ['30% feed boost', 'Tier 2 badge', 'Animated cosmetics', 'Read receipts'],
  },
  {
    tier: 3,
    name: 'Inferno',
    monthly_price_cents: 700,
    annual_price_cents: 6500,
    annual_discount_percent: 23,
    feed_boost_percent: 40,
    boost_is_public: true,
    features: ['40% feed boost', 'Tier 3 badge', 'Exclusive cosmetics', 'Profile spotlight'],
  },
]
