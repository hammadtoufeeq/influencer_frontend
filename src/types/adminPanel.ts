import type { Role } from './user'
import type { ClaimStatus, VerificationMethod } from './claim'

export interface AdminStats {
  people: { total: number; hidden: number; claimed: number; verified: number }
  users: { total: number; suspended: number; byRole: Partial<Record<Role, number>> }
  claims: { needsAction: number; open: number }
  reports: { open: number; reviewing: number }
  businesses: { needsAction: number; approved: number }
  agreements: { disputed: number; active: number }
  managers: { needsAction: number; approved: number }
}

export interface AdminUser {
  _id: string
  name: string
  email: string
  role: Role
  status: 'active' | 'suspended'
  createdAt: string
}

export interface AuditLogEntry {
  _id: string
  actor: { _id: string; name: string; email: string } | null
  actorEmail: string
  action: string
  targetType: 'person' | 'claim' | 'user' | 'report' | 'business' | 'agreement' | 'manager'
  targetId?: string
  targetLabel?: string
  before?: unknown
  after?: unknown
  createdAt: string
}

export interface ClaimDetail {
  _id: string
  status: ClaimStatus
  // null = profile delete ho chuki hai
  person: {
    _id: string
    name: string
    slug: string
    headline?: string
    photoUrl?: string
    visibility: string
    isDraft?: boolean
    bio?: string
    websiteUrl?: string
    country?: string
    city?: string
    languages?: string[]
    socialAccounts?: { platform: string; url: string; handle?: string; followers?: number }[]
    professions?: { name: string; slug: string }[]
    industries?: { name: string; slug: string }[]
    topics?: { name: string; slug: string }[]
  } | null
  isNewProfile?: boolean
  requestedName?: string
  user: { _id: string; name: string; email: string; role: Role; status: string; createdAt: string } | null
  evidence: { contactEmail?: string; links: string[]; note?: string }
  verification?: {
    channelUrl?: string
    codeSentAt?: string
    expiresAt?: string
  }
  otpAttempts?: number
  otpLockedAt?: string
  lastOtpAttemptAt?: string
  verifiedAt?: string
  verifiedBy?: { _id: string; name: string; email: string } | null
  verificationMethod?: VerificationMethod
  rejectionReason?: string
  reviewedBy?: { name: string; email: string }
  reviewedAt?: string
  createdAt: string
}

export type ReportStatus = 'open' | 'reviewing' | 'resolved' | 'rejected'
export type ReportReason =
  | 'incorrect_info'
  | 'impersonation'
  | 'removal_request'
  | 'inappropriate'
  | 'copyright'
  | 'other'

export const REPORT_REASONS: ReportReason[] = [
  'incorrect_info',
  'impersonation',
  'removal_request',
  'inappropriate',
  'copyright',
  'other',
]

// Kisi talent ke baare mein sawal (guest bhi bhej sakta hai), sirf admin dekhta hai
export type InquiryStatus = 'new' | 'in_progress' | 'answered' | 'closed'
export const INQUIRY_STATUSES: InquiryStatus[] = ['new', 'in_progress', 'answered', 'closed']

export interface AdminInquiry {
  _id: string
  person: {
    _id: string
    name: string
    slug: string
    photoUrl?: string
    visibility: 'visible' | 'hidden'
  } | null
  name: string
  email: string
  phone?: string
  message: string
  // Login user ne bheja ho to us ka account
  user?: { name: string; email: string; role: Role }
  status: InquiryStatus
  adminNote?: string
  handledBy?: { name: string; email: string }
  handledAt?: string
  createdAt: string
}

export interface AdminReport {
  _id: string
  person: {
    _id: string
    name: string
    slug: string
    photoUrl?: string
    visibility: 'visible' | 'hidden'
  } | null
  reason: ReportReason
  details: string
  reporter?: { name: string; email: string; role: Role }
  reporterName?: string
  reporterEmail?: string
  // Profile ke maalik ne account mitate waqt khud hatane ko kaha
  fromOwner?: boolean
  status: ReportStatus
  adminNote?: string
  handledBy?: { name: string; email: string }
  handledAt?: string
  createdAt: string
}
