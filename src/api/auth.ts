import api from './axios'
import type { ApiSuccess } from '../types/api'
import type { SignupRole, User } from '../types/user'

export interface RegisterInput {
  name: string
  email: string
  password: string
  role: SignupRole
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

export async function logoutUser() {
  await api.post('/auth/logout')
}

export async function getMe() {
  const res = await api.get<ApiSuccess<{ user: User }>>('/auth/me')
  return res.data.data.user
}
