import type { IconDefinition } from '@fortawesome/fontawesome-svg-core'
import {
  faBell,
  faBriefcase,
  faCompass,
  faEnvelope,
  faGear,
  faIdCard,
  faLayerGroup,
  faPlus,
  faStar,
  faTableColumns,
  faUserCheck,
  faUsers,
} from '@fortawesome/free-solid-svg-icons'
import type { Role } from '../types/user'

export interface NavItem {
  to: string
  label: string
  icon: IconDefinition
  // Khali = sab ke liye (login ho ya na ho). 'auth' = har logged-in user
  roles?: Role[] | 'auth'
}

// Navbar ke beech wale links (document ke saare pages)
export const MAIN_NAV: NavItem[] = [
  { to: '/search', label: 'Explore', icon: faCompass },
  { to: '/browse', label: 'Browse', icon: faLayerGroup },
  { to: '/my-profile', label: 'My profile', icon: faIdCard, roles: ['talent'] },
  { to: '/dashboard/services', label: 'Services', icon: faBriefcase, roles: ['talent'] },
  { to: '/talents', label: 'My talents', icon: faUsers, roles: ['representative'] },
  {
    to: '/shortlists',
    label: 'Shortlists',
    icon: faStar,
    roles: ['business', 'agency', 'organization'],
  },
  { to: '/dashboard?tab=claims', label: 'Claims', icon: faUserCheck, roles: ['admin'] },
  { to: '/dashboard/people/new', label: 'Add profile', icon: faPlus, roles: ['admin'] },
]

// Right side ke chhote icon buttons (logged-in)
export const UTILITY_NAV: NavItem[] = [
  { to: '/inbox', label: 'Inbox', icon: faEnvelope, roles: 'auth' },
  { to: '/notifications', label: 'Notifications', icon: faBell, roles: 'auth' },
]

// Account menu ke andar
export const ACCOUNT_NAV: NavItem[] = [
  { to: '/dashboard', label: 'Dashboard', icon: faTableColumns, roles: 'auth' },
  { to: '/settings', label: 'Settings', icon: faGear, roles: 'auth' },
]

export function canSee(item: NavItem, role: Role | undefined) {
  if (!item.roles) return true
  if (!role) return false
  return item.roles === 'auth' || item.roles.includes(role)
}

// "/dashboard?tab=claims" jaise links ke liye query bhi match karni hai
export function isNavActive(item: NavItem, pathname: string, search: string) {
  const [path, query] = item.to.split('?')
  if (query) return pathname === path && new URLSearchParams(search).toString() === query
  if (path === '/dashboard') {
    return pathname === '/dashboard' && !new URLSearchParams(search).get('tab')
  }
  return pathname === path || pathname.startsWith(`${path}/`)
}
