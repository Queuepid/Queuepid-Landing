import type { GameRevealProfile, Message } from './types'

export const MOCK_SESSION_ID = 'poc-session-001'
export const MOCK_PARTNER_ID = 'poc-partner-user'
export const MOCK_SELF_ID = 'poc-self-user'

export const mockPartnerGameProfile: GameRevealProfile = {
  alias: 'Anonymous · Gold 2',
  region: 'na',
  mic: 'mic',
  intentions: ['competitive', 'casual'],
  game_accounts: [
    {
      game: 'valorant',
      rank_tier: 'gold',
      rank_division: 2,
      rr: 43,
      peak_rank_tier: 'platinum',
    },
  ],
  untracked_games: ['Apex Legends', 'Rocket League'],
}

export const mockPartnerRevealedProfile = {
  display_name: 'Aria',
  age: 21,
  bio: 'Valorant Platinum grinder by day, Minecraft builder by night.',
  gender: 'female' as const,
  photos: [
    {
      id: 'rp1',
      url: 'https://picsum.photos/seed/aria1/400/600',
      is_primary: true,
      order: 0,
      created_at: '2024-01-01T00:00:00Z',
    },
  ],
}

export const mockInitialMessages: Message[] = [
  {
    id: 'msg-1',
    conversation_id: MOCK_SESSION_ID,
    sender_id: MOCK_PARTNER_ID,
    type: 'text',
    content: 'hey! nice to match 👋 what rank are you currently?',
    reply_to: null,
    edited_at: null,
    deleted_at: null,
    read_at: null,
    created_at: new Date(Date.now() - 60000).toISOString(),
  },
  {
    id: 'msg-2',
    conversation_id: MOCK_SESSION_ID,
    sender_id: MOCK_SELF_ID,
    type: 'text',
    content: 'gold 3 rn, been grinding all week lol',
    reply_to: null,
    edited_at: null,
    deleted_at: null,
    read_at: null,
    created_at: new Date(Date.now() - 30000).toISOString(),
  },
  {
    id: 'msg-3',
    conversation_id: MOCK_SESSION_ID,
    sender_id: MOCK_PARTNER_ID,
    type: 'text',
    content: 'nice! i just hit plat last week. wanna queue?',
    reply_to: null,
    edited_at: null,
    deleted_at: null,
    read_at: null,
    created_at: new Date(Date.now() - 10000).toISOString(),
  },
]
