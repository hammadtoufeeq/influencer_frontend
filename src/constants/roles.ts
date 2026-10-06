import type { SignupRole } from '../types/user'

// Signup page pe dikhne wale account types
export const SIGNUP_ROLE_OPTIONS: {
  value: SignupRole
  label: string
  description: string
}[] = [
  {
    value: 'talent',
    label: 'Talent',
    description: 'Creator, journalist, speaker, expert or public figure',
  },
  {
    value: 'representative',
    label: 'Manager / Agent',
    description: 'I represent one or more talents',
  },
  {
    value: 'business',
    label: 'Business',
    description: 'I want to hire or collaborate with talent',
  },
  {
    value: 'agency',
    label: 'Agency',
    description: 'Marketing, PR or talent agency',
  },
  {
    value: 'organization',
    label: 'Organization',
    description: 'NGO, university, event organizer or government body',
  },
]
