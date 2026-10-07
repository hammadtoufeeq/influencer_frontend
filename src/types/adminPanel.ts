import type { Role } from './user'
import type { ClaimStatus } from './claim'

export interface AdminStats {
  people: { total: number; hidden: number; claimed: number; verified: number }
  users: { total: number; suspended: number; byRole: Partial<Record<Role, number>> }
  claims: { needsAction: number; open: number }
  reports: { open: number; reviewing: number }
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
  targetType: 'person' | 'claim' | 'user' | 'report'
  targetId?: string
  targetLabel?: string
  before?: unknown
  after?: unknown
  createdAt: string
}

export interface ClaimDetail {
  _id: string
  status: ClaimStatus
  person: {
    _id: string
    name: string
    slug: string
    headline?: string
    photoUrl?: string
    visibility: string
  }
  user: { _id: string; name: string; email: string; role: Role; status: string; createdAt: string }
  evidence: { contactEmail?: string; links: string[]; note?: string }
  verification?: {
    channelUrl?: string
    codeSentAt?: string
    expiresAt?: string
    attempts: number
    verifiedAt?: string
  }
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
  status: ReportStatus
  adminNote?: string
  handledBy?: { name: string; email: string }
  handledAt?: string
  createdAt: string
}
