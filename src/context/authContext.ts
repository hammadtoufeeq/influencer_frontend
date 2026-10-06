import { createContext } from 'react'
import type { LoginInput, RegisterInput } from '../api/auth'
import type { User } from '../types/user'

export interface AuthContextValue {
  user: User | null
  isLoading: boolean
  login: (input: LoginInput) => Promise<User>
  register: (input: RegisterInput) => Promise<User>
  logout: () => Promise<void>
}

export const AuthContext = createContext<AuthContextValue | null>(null)
