export type ProfileStatus = 'public' | 'contactable' | 'represented' | 'hireable'

export type SocialPlatform =
  | 'instagram'
  | 'youtube'
  | 'tiktok'
  | 'x'
  | 'facebook'
  | 'linkedin'
  | 'snapchat'
  | 'twitch'
  | 'podcast'
  | 'website'
  | 'other'

export interface TaxonomyItem {
  _id: string
  name: string
  slug: string
}

export interface SocialAccount {
  platform: SocialPlatform
  handle?: string
  url: string
  followers?: number
  engagementRate?: number
}

// Search results mein aane wala chhota version
export interface PersonSummary {
  _id: string
  name: string
  slug: string
  headline?: string
  photoUrl?: string
  status: ProfileStatus
  professions: TaxonomyItem[]
  country?: string
  city?: string
  totalFollowers: number
  verified: boolean
  isDemo: boolean
}

// Profile page ka poora version
export interface Person extends PersonSummary {
  bio?: string
  industries: TaxonomyItem[]
  topics: TaxonomyItem[]
  languages: string[]
  websiteUrl?: string
  socialAccounts: SocialAccount[]
  claimedBy: string | null
  visibility: 'visible' | 'hidden'
  sourceRecords: { sourceType: string; url?: string; note?: string; retrievedAt: string }[]
  createdAt: string
  updatedAt: string
}

export type TaxonomyType = 'professions' | 'industries' | 'topics'
