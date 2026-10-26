import type { CSSProperties } from 'react'
import type { SocialPlatform } from '../../types/person'

// Detail pages (talent, business, manager, campaign) ke sections ki ek jaisi shakal
export const DETAIL_CARD =
  'rounded-3xl bg-white p-6 shadow-sm ring-1 ring-gray-200/70 motion-safe:animate-fade-up'

// Sections ek ek kar ke neeche se aate hain
export const rise = (i: number): CSSProperties => ({ animationDelay: `${120 + i * 90}ms` })

// Har platform ka apna rang (icon ki tile ke liye)
export const PLATFORM_TONES: Partial<Record<SocialPlatform, string>> = {
  instagram: 'bg-gradient-to-br from-amber-400 via-pink-500 to-purple-600 text-white',
  youtube: 'bg-red-600 text-white',
  tiktok: 'bg-gray-950 text-white',
  x: 'bg-gray-950 text-white',
  facebook: 'bg-blue-600 text-white',
  linkedin: 'bg-sky-700 text-white',
  snapchat: 'bg-yellow-300 text-gray-900',
  twitch: 'bg-violet-600 text-white',
}
