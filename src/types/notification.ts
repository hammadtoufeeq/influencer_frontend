import type { Role } from './user'

// Backend jo notification bhejta hai. Jumla frontend pe type + data se banta hai
export type NotificationType =
  | 'claim.new'
  | 'claim.new_profile'
  | 'claim.code_verified'
  | 'claim.otp_locked'
  | 'report.new'
  | 'inquiry.new'
  | 'claim.code_sent'
  | 'claim.approved'
  | 'claim.rejected'
  | 'business.new'
  | 'business.code_verified'
  | 'business.otp_locked'
  | 'agreement.disputed_admin'
  | 'agreement.proposed'
  | 'agreement.updated'
  | 'agreement.signed'
  | 'agreement.active'
  | 'agreement.cancelled'
  | 'agreement.delivered'
  | 'agreement.approved'
  | 'agreement.changes_requested'
  | 'agreement.completed'
  | 'agreement.disputed'
  | 'agreement.resolved'
  | 'agreement.reviewed'
  | 'business.code_sent'
  | 'business.approved'
  | 'business.rejected'
  | 'hire.new'
  | 'hire.cancelled'
  | 'hire.accepted'
  | 'hire.declined'
  | 'manager.new'
  | 'manager.approved'
  | 'manager.rejected'
  | 'manager.reviewed'
  | 'representation.requested'
  | 'representation.invited'
  | 'representation.accepted'
  | 'representation.declined'
  | 'representation.ended'
  | 'hire.new_managed'
  | 'hire.answered_by_manager'
  | 'campaign.application'
  | 'campaign.accepted'
  | 'campaign.rejected'

// Notifications page ke tabs (backend src/constants/notifications.ts jaisa)
export type NotificationCategory =
  | 'hiring'
  | 'campaigns'
  | 'agreements'
  | 'verification'
  | 'manager'
  | 'admin'

export const NOTIFICATION_CATEGORIES: NotificationCategory[] = [
  'hiring',
  'campaigns',
  'agreements',
  'verification',
  'manager',
  'admin',
]

// Har account type ke tabs: hamesha yahi dikhte hain (data aane ka intezar nahi)
export const CATEGORIES_BY_ROLE: Record<Role, NotificationCategory[]> = {
  talent: ['hiring', 'campaigns', 'agreements', 'verification', 'manager'],
  representative: ['hiring', 'verification', 'manager'],
  business: ['hiring', 'campaigns', 'agreements', 'verification'],
  admin: ['admin'],
}

export type CategoryCounts = Partial<
  Record<NotificationCategory, { total: number; unread: number }>
>

export interface AppNotification {
  _id: string
  type: NotificationType
  data: Record<string, string>
  // Click pe kahan jana hai, jaise /admin/claims/123
  link: string
  readAt: string | null
  createdAt: string
}
