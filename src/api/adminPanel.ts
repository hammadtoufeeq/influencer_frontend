import api from './axios'
import type { ApiSuccess } from '../types/api'
import type {
  AdminReport,
  AdminStats,
  AdminUser,
  AuditLogEntry,
  ClaimDetail,
  ReportReason,
  ReportStatus,
} from '../types/adminPanel'
import type { Role } from '../types/user'

export async function getAdminStats() {
  const res = await api.get<ApiSuccess<AdminStats>>('/admin/stats')
  return res.data.data
}

export async function getAdminClaim(id: string) {
  const res = await api.get<ApiSuccess<{ claim: ClaimDetail; history: AuditLogEntry[] }>>(
    `/admin/claims/${id}`,
  )
  return res.data.data
}

export async function listAdminUsers(params: URLSearchParams) {
  const res = await api.get<ApiSuccess<{ users: AdminUser[] }>>('/admin/users', { params })
  return { users: res.data.data.users, meta: res.data.meta! }
}

export async function setUserStatus(id: string, status: AdminUser['status']) {
  const res = await api.patch<ApiSuccess<{ user: AdminUser }>>(`/admin/users/${id}/status`, {
    status,
  })
  return res.data.data.user
}

export async function setUserRole(id: string, role: Role) {
  const res = await api.patch<ApiSuccess<{ user: AdminUser }>>(`/admin/users/${id}/role`, { role })
  return res.data.data.user
}

export async function listAdminReports(params: URLSearchParams) {
  const res = await api.get<ApiSuccess<{ reports: AdminReport[] }>>('/admin/reports', { params })
  return { reports: res.data.data.reports, meta: res.data.meta! }
}

export async function getAdminReport(id: string) {
  const res = await api.get<ApiSuccess<{ report: AdminReport; history: AuditLogEntry[] }>>(
    `/admin/reports/${id}`,
  )
  return res.data.data
}

export async function updateAdminReport(
  id: string,
  input: { status: Exclude<ReportStatus, 'open'>; adminNote?: string; hidePerson?: boolean },
) {
  const res = await api.patch<ApiSuccess<{ report: AdminReport }>>(`/admin/reports/${id}`, input)
  return res.data.data.report
}

export async function listAuditLogs(params: URLSearchParams) {
  const res = await api.get<ApiSuccess<{ logs: AuditLogEntry[] }>>('/admin/audit-logs', { params })
  return { logs: res.data.data.logs, meta: res.data.meta! }
}

// Public: koi bhi profile report kar sakta hai
export async function createReport(input: {
  personId: string
  reason: ReportReason
  details: string
  reporterName?: string
  reporterEmail?: string
}) {
  const res = await api.post<ApiSuccess<{ report: { _id: string } }>>('/reports', input)
  return res.data.data.report
}
