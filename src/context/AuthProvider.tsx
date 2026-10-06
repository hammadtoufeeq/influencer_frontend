import type { ReactNode } from 'react'
import axios from 'axios'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { getMe, loginUser, logoutUser, registerUser } from '../api/auth'
import type { LoginInput, RegisterInput } from '../api/auth'
import type { User } from '../types/user'
import { AuthContext } from './authContext'

const ME_KEY = ['auth', 'me']

export function AuthProvider({ children }: { children: ReactNode }) {
  const queryClient = useQueryClient()

  // App khulte hi pata karo ke koi login hai ya nahi
  const { data: user, isLoading } = useQuery({
    queryKey: ME_KEY,
    queryFn: async () => {
      try {
        return await getMe()
      } catch (error) {
        // 401 ka matlab sirf "login nahi", error nahi
        if (axios.isAxiosError(error) && error.response?.status === 401) return null
        throw error
      }
    },
    retry: false,
    staleTime: Infinity,
  })

  async function login(input: LoginInput) {
    const loggedIn = await loginUser(input)
    queryClient.setQueryData<User | null>(ME_KEY, loggedIn)
    return loggedIn
  }

  async function register(input: RegisterInput) {
    const created = await registerUser(input)
    queryClient.setQueryData<User | null>(ME_KEY, created)
    return created
  }

  async function logout() {
    try {
      await logoutUser()
    } finally {
      queryClient.setQueryData<User | null>(ME_KEY, null)
      // Purane user ka baqi data cache mein na rahe
      queryClient.removeQueries({ predicate: (query) => query.queryKey[0] !== ME_KEY[0] })
    }
  }

  return (
    <AuthContext.Provider
      value={{ user: user ?? null, isLoading, login, register, logout }}
    >
      {children}
    </AuthContext.Provider>
  )
}
