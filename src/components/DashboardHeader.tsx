import type { ReactNode } from 'react'
import { useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import { ROLE_LABELS } from '../constants/roles'
import { useAuth } from '../hooks/useAuth'
import Avatar from './Avatar'

// Har dashboard ke upar: naam, role, aur Log out
function DashboardHeader({ children }: { children?: ReactNode }) {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  if (!user) return null

  async function handleLogout() {
    await logout()
    toast.success('Logged out')
    navigate('/')
  }

  return (
    <section className="flex flex-col gap-4 rounded-2xl bg-white p-5 shadow-sm sm:flex-row sm:items-center md:p-6">
      <Avatar name={user.name} />
      <div className="min-w-0 flex-1">
        <h1 className="text-xl font-bold md:text-2xl">Hi, {user.name} 👋</h1>
        <p className="mt-0.5 truncate text-sm text-gray-500">
          {ROLE_LABELS[user.role]} · {user.email}
        </p>
      </div>
      <div className="flex flex-wrap items-center gap-2">
        {children}
        <button
          onClick={handleLogout}
          className="rounded-lg border border-gray-300 px-4 py-2 text-sm hover:bg-gray-100"
        >
          Log out
        </button>
      </div>
    </section>
  )
}

export default DashboardHeader
