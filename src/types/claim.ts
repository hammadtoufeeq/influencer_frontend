export type ClaimStatus = 'pending' | 'approved' | 'rejected'

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
  evidence: { contactEmail?: string; links: string[]; note: string }
  rejectionReason?: string
  reviewedAt?: string
  createdAt: string
}

export interface ClaimInput {
  personId: string
  contactEmail?: string
  links: string[]
  note: string
}
