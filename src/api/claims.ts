import api from './axios'
import type { ApiSuccess } from '../types/api'
import type { Claim, ClaimFilter, ClaimInput } from '../types/claim'
import type { Person } from '../types/person'

export async function createClaim(input: ClaimInput) {
  const res = await api.post<ApiSuccess<{ claim: Claim }>>('/claims', input)
  return res.data.data.claim
}

export async function listMyClaims() {
  const res = await api.get<ApiSuccess<{ claims: Claim[] }>>('/claims/mine')
  return res.data.data.claims
}

// Jo profile is talent ke naam hai (null agar koi nahi)
export async function getMyProfile() {
  const res = await api.get<ApiSuccess<{ person: Person | null }>>('/claims/my-profile')
  return res.data.data.person
}

export async function adminListClaims(status: ClaimFilter, page = 1) {
  const res = await api.get<ApiSuccess<{ claims: Claim[] }>>('/admin/claims', {
    params: { status, page, limit: 20 },
  })
  return { claims: res.data.data.claims, meta: res.data.meta! }
}

export async function reviewClaim(id: string, action: 'approve' | 'reject', reason?: string) {
  const res = await api.patch<ApiSuccess<{ claim: Claim }>>(`/admin/claims/${id}`, {
    action,
    reason,
  })
  return res.data.data.claim
}

// Talent woh 6-digit code daalta hai jo admin ne DM kiya
export async function verifyClaimCode(id: string, code: string) {
  const res = await api.post<ApiSuccess<{ claim: Claim }>>(`/claims/${id}/verify`, { code })
  return res.data.data.claim
}

// Admin naya code banata hai. Code sirf isi jawab mein ek dafa milta hai
export async function sendClaimCode(id: string, channelUrl: string) {
  const res = await api.post<ApiSuccess<{ claim: Claim; code: string }>>(
    `/admin/claims/${id}/code`,
    { channelUrl },
  )
  return res.data.data
}
