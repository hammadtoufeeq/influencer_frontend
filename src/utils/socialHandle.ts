import type { SocialPlatform } from '../types/person'

// In platforms ke followers khud aate hain (backend: YouTube API, baqi Tavily search)
export const FOLLOWER_PLATFORMS: SocialPlatform[] = [
  'instagram',
  'youtube',
  'facebook',
  'x',
  'tiktok',
]

const DOMAINS: Partial<Record<SocialPlatform, string[]>> = {
  instagram: ['instagram.com'],
  youtube: ['youtube.com'],
  facebook: ['facebook.com', 'fb.com'],
  x: ['x.com', 'twitter.com'],
  tiktok: ['tiktok.com'],
}

// Link ka pehla hissa ye ho to woh profile nahi (post, search waghera)
const NOT_PROFILES: Partial<Record<SocialPlatform, string[]>> = {
  instagram: ['p', 'reel', 'reels', 'stories', 'explore', 'tv', 'accounts'],
  facebook: ['profile.php', 'pages', 'people', 'groups', 'watch', 'share', 'events', 'story.php'],
  x: ['i', 'home', 'search', 'intent', 'hashtag', 'share'],
  tiktok: ['video', 'tag', 'discover', 'music'],
}

// Profile ke link se handle (backend ki tarah): instagram.com/babarazam -> babarazam,
// youtube.com/@ducky -> ducky. Na nikle (jaise facebook profile.php?id=) to ''
export function handleFromUrl(platform: SocialPlatform, raw: string): string {
  const domains = DOMAINS[platform]
  const text = raw.trim()
  if (!domains || !text) return ''
  let url: URL
  try {
    url = new URL(/^https?:\/\//i.test(text) ? text : `https://${text}`)
  } catch {
    return ''
  }
  const host = url.hostname.toLowerCase().replace(/^(www\.|m\.|mobile\.)/, '')
  if (!domains.some((domain) => host === domain || host.endsWith(`.${domain}`))) return ''

  const [first, second] = url.pathname.split('/').filter(Boolean)
  if (!first) return ''
  let handle = first
  if (platform === 'youtube') {
    if (['channel', 'c', 'user'].includes(first) && second) handle = second
    else if (!first.startsWith('@')) return ''
  } else if (NOT_PROFILES[platform]?.includes(first.toLowerCase())) {
    return ''
  }
  handle = handle.replace(/^@+/, '')
  return /^[a-z0-9._-]{1,100}$/i.test(handle) ? handle : ''
}
