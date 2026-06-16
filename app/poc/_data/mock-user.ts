import type { UserProfile } from './types'

export const MOCK_USER_ID = 'poc-self-user'

export const mockUser: UserProfile = {
  id: 'poc-self-profile',
  user_id: MOCK_USER_ID,
  display_name: 'You',
  bio: 'Casual gamer who loves co-op games and late-night sessions. Always down for a good ranked grind.',
  gender: 'non-binary',
  birth_date: '2001-03-15',
  age: 23,
  intentions: ['casual', 'chill'],
  interests: [
    { id: 'i1', name: 'Stardew Valley', category: 'games' },
    { id: 'i2', name: 'Anime', category: 'anime' },
    { id: 'i3', name: 'Lo-fi', category: 'music' },
    { id: 'i4', name: 'Photography', category: 'hobbies' },
    { id: 'i5', name: 'Cooking', category: 'food' },
  ],
  photos: [
    {
      id: 'p1',
      url: 'https://picsum.photos/seed/self1/400/600',
      is_primary: true,
      order: 0,
      created_at: '2024-01-01T00:00:00Z',
    },
    {
      id: 'p2',
      url: 'https://picsum.photos/seed/self2/400/600',
      is_primary: false,
      order: 1,
      created_at: '2024-01-01T00:00:00Z',
    },
    {
      id: 'p3',
      url: 'https://picsum.photos/seed/self3/400/600',
      is_primary: false,
      order: 2,
      created_at: '2024-01-01T00:00:00Z',
    },
  ],
  voice_notes: [],
  region: 'na',
  subscription_tier: 0,
  cosmetic_id: null,
  badges: [],
  level: 3,
  xp: 450,
  feed_boost: 0,
  created_at: '2024-01-01T00:00:00Z',
  updated_at: '2024-06-01T00:00:00Z',
  last_active: '2024-06-16T00:00:00Z',
}
