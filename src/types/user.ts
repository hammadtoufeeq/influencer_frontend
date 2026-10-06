export type Role =
  | 'talent'
  | 'representative'
  | 'business'
  | 'agency'
  | 'organization'
  | 'admin'

export type SignupRole = Exclude<Role, 'admin'>

export interface User {
  _id: string
  name: string
  email: string
  role: Role
  isEmailVerified: boolean
  status: 'active' | 'suspended'
  createdAt: string
  updatedAt: string
}
