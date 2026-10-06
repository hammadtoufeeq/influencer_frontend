import type { ProfileStatus, SocialPlatform } from '../types/person'

export const STATUS_LABELS: Record<ProfileStatus, string> = {
  public: 'Public profile',
  contactable: 'Contactable',
  represented: 'Has representation',
  hireable: 'Available to hire',
}

export const PLATFORM_LABELS: Record<SocialPlatform, string> = {
  instagram: 'Instagram',
  youtube: 'YouTube',
  tiktok: 'TikTok',
  x: 'X (Twitter)',
  facebook: 'Facebook',
  linkedin: 'LinkedIn',
  snapchat: 'Snapchat',
  twitch: 'Twitch',
  podcast: 'Podcast',
  website: 'Website',
  other: 'Other',
}

// Pakistan pehle, phir Gulf (document Section 1)
export const COUNTRY_OPTIONS = ['PK', 'AE', 'SA', 'QA', 'KW', 'BH', 'OM', 'GB', 'US']

export const LANGUAGE_OPTIONS = ['en', 'ur', 'ar', 'pa', 'sd', 'ps', 'hi', 'fa', 'tr', 'fr']

export const FOLLOWER_OPTIONS = [
  { value: '10000', label: '10K+' },
  { value: '100000', label: '100K+' },
  { value: '500000', label: '500K+' },
  { value: '1000000', label: '1M+' },
]

export const SORT_OPTIONS = [
  { value: 'followers', label: 'Most followers' },
  { value: 'newest', label: 'Newest' },
  { value: 'name', label: 'Name (A-Z)' },
]
