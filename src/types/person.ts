import type { Availability, Service } from './services'

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
  // Khud aate hain (YouTube API / public profile se andaza), haath se nahi
  followers?: number
  engagementRate?: number
  // Number kis page se mila, kab mila, aur aakhri koshish ka nateeja
  followersSourceUrl?: string
  followersUpdatedAt?: string
  followersCheckedAt?: string
  followersStatus?: 'ok' | 'not_found' | 'error'
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
  // null = abhi kisi ne claim nahi kiya
  claimedBy?: string | null
  // Card pe "Available" dikhane ke liye
  availability?: Pick<Availability, 'isOpen' | 'openTo'>
  // Businesses ki reviews ka average aur kitno ne di (koi review na ho to null)
  rating?: PersonRating | null
  // Accounts ka followers ke hisaab se average engagement % (pata na ho to null)
  engagementRate?: number | null
}

export interface PersonRating {
  average: number
  count: number
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
  // Sirf chalti services (public)
  services?: Service[]
  // Talent ka verified manager (agar koi hai)
  representedBy?: { name: string; agencyName: string | null } | null
  availability?: Availability
  // Photo kahan se aayi (jaise Wikimedia Commons) aur license
  photoCredit?: {
    provider: string
    author?: string
    license: string
    licenseUrl?: string
    sourceUrl: string
  }
  visibility: 'visible' | 'hidden'
  sourceRecords: { sourceType: string; url?: string; note?: string; retrievedAt: string }[]
  createdAt: string
  updatedAt: string
}

export type TaxonomyType = 'professions' | 'industries' | 'topics'
