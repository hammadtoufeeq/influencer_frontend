// pending       -> admin ko code bhejna hai
// code_sent     -> talent ko code daalna hai
// code_verified -> admin ko final approve karna hai
export type ClaimStatus = 'pending' | 'code_sent' | 'code_verified' | 'approved' | 'rejected'

export const OPEN_CLAIM_STATUSES: ClaimStatus[] = ['pending', 'code_sent', 'code_verified']

export function isOpenClaim(status: ClaimStatus) {
  return OPEN_CLAIM_STATUSES.includes(status)
}

export interface ClaimPerson {
  _id: string
  name: string
  slug: string
  headline?: string
  photoUrl?: string
  claimedBy: string | null
}

export interface Claim {
  _id: string
  person: ClaimPerson
  // Admin list mein user ki details aati hain, "mine" mein sirf id
  user: string | { _id: string; name: string; email: string; role: string }
  status: ClaimStatus
  evidence: { contactEmail?: string; links: string[]; note?: string }
  verification?: {
    channelUrl?: string
    codeSentAt?: string
    expiresAt?: string
    attempts: number
    verifiedAt?: string
  }
  rejectionReason?: string
  reviewedAt?: string
  createdAt: string
}

export interface ClaimInput {
  personId: string
  contactEmail?: string
  links: string[]
  note?: string
}

// Admin list ke filters
export type ClaimFilter = ClaimStatus | 'open' | 'needs_action'
