import type { ProfileStatus, SocialPlatform } from './person'

export interface AdminPersonRow {
  _id: string
  name: string
  slug: string
  headline?: string
  photoUrl?: string
  status: ProfileStatus
  verified: boolean
  visibility: 'visible' | 'hidden'
  isDemo: boolean
  claimedBy: string | null
  totalFollowers: number
  updatedAt: string
}

// Backend ko bheja jane wala data (taxonomy slugs ki shakal mein)
export interface PersonInput {
  name?: string
  headline?: string
  bio?: string
  photoUrl?: string
  websiteUrl?: string
  country?: string
  city?: string
  languages?: string[]
  professions?: string[]
  industries?: string[]
  topics?: string[]
  socialAccounts?: {
    platform: SocialPlatform
    url: string
    handle?: string
    followers?: number
    engagementRate?: number
  }[]
  status?: ProfileStatus
  verified?: boolean
  visibility?: 'visible' | 'hidden'
  sourceRecords?: { sourceType: string; url?: string; note?: string }[]
}
