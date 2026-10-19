import api from './axios'
import type { ApiSuccess } from '../types/api'
import type { CompanySize, OrganizationType } from '../types/business'
import type { SignupRole, User } from '../types/user'

export interface RegisterInput {
  // Business ke liye nahi: us ka naam organization ka naam hota hai
  name?: string
  email: string
  password: string
  role: SignupRole
  // Manager aur business: mulk zaroori, website optional
  country?: string
  websiteUrl?: string
  // Sirf manager
  agencyName?: string
  // Sirf business
  organizationType?: OrganizationType
  companyName?: string
  industry?: string
  companySize?: CompanySize | ''
  description?: string
}

export interface LoginInput {
  email: string
  password: string
}

export async function registerUser(input: RegisterInput) {
  const res = await api.post<ApiSuccess<{ user: User }>>('/auth/register', input)
  return res.data.data.user
}

export async function loginUser(input: LoginInput) {
  const res = await api.post<ApiSuccess<{ user: User }>>('/auth/login', input)
  return res.data.data.user
}

// Google se login / signup. Server batata hai button dikhana hai ya nahi (aur client ID)
export async function getGoogleConfig() {
  const res = await api.get<ApiSuccess<{ enabled: boolean; clientId: string | null }>>(
    '/auth/google/config',
  )
  return res.data.data
}

export async function googleLoginRequest(credential: string) {
  const res = await api.post<ApiSuccess<{ user: User }>>('/auth/google/login', { credential })
  return res.data.data.user
}

// Signup form ki details (email / password ke baghair: woh Google se)
export async function googleRegisterRequest(
  credential: string,
  details: Omit<RegisterInput, 'email' | 'password'>,
) {
  const res = await api.post<ApiSuccess<{ user: User; existing: boolean }>>(
    '/auth/google/register',
    { ...details, credential },
  )
  return res.data.data
}

export async function logoutUser() {
  await api.post('/auth/logout')
}

export async function getMe() {
  const res = await api.get<ApiSuccess<{ user: User }>>('/auth/me')
  return res.data.data.user
}

export async function changePasswordRequest(input: {
  currentPassword: string
  newPassword: string
}) {
  await api.patch('/auth/password', input)
}

// Profile ka kya hua: wapas unclaimed, chhupi (admin dekhega), hatane ki request, ya mit gayi
export type DeletedProfileOutcome =
  | 'unclaimed'
  | 'hidden_for_review'
  | 'removal_requested'
  | 'deleted'

export async function deleteAccountRequest(confirm: string, removeProfile = false) {
  const res = await api.delete<
    ApiSuccess<{ deleted: boolean; profile: DeletedProfileOutcome | null }>
  >('/auth/account', { data: { confirm, removeProfile } })
  return res.data.data.profile
}

// Password bhool gaya: 1) email pe code  2) code check -> reset token  3) naya password
export async function requestPasswordReset(email: string) {
  const res = await api.post<ApiSuccess<{ sent: boolean; resendIn: number; expiresIn: number }>>(
    '/auth/forgot-password',
    { email },
  )
  return res.data.data
}

export async function verifyPasswordResetCode(email: string, code: string) {
  const res = await api.post<ApiSuccess<{ resetToken: string }>>('/auth/forgot-password/verify', {
    email,
    code,
  })
  return res.data.data.resetToken
}

export async function resetPasswordRequest(input: {
  email: string
  resetToken: string
  newPassword: string
}) {
  const res = await api.post<ApiSuccess<{ user: User }>>('/auth/reset-password', input)
  return res.data.data.user
}

// Photo / logo upload (multipart, field "photo")
function photoForm(file: File) {
  const form = new FormData()
  form.append('photo', file)
  return form
}

export async function uploadAvatar(file: File) {
  const res = await api.put<ApiSuccess<{ user: User }>>('/account/avatar', photoForm(file))
  return res.data.data.user
}

export async function removeAvatar() {
  const res = await api.delete<ApiSuccess<{ user: User }>>('/account/avatar')
  return res.data.data.user
}

// Talent ki public profile photo (talent khud, us ka manager ya admin)
export async function uploadPersonPhoto(personId: string, file: File) {
  const res = await api.put<ApiSuccess<{ photoUrl: string }>>(
    `/people/${personId}/photo`,
    photoForm(file),
  )
  return res.data.data.photoUrl
}

export async function removePersonPhoto(personId: string) {
  await api.delete(`/people/${personId}/photo`)
}
