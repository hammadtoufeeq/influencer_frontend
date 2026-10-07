import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faHand } from '@fortawesome/free-solid-svg-icons'
import type { ReactNode } from 'react'
import { ROLE_LABELS } from '../constants/roles'
import { useAuth } from '../hooks/useAuth'
import Avatar from './Avatar'

// Har dashboard ke upar: naam aur role. children mein page ke apne buttons
function DashboardHeader({ children }: { children?: ReactNode }) {
  const { user } = useAuth()
  if (!user) return null

  return (
    <section className="flex flex-col gap-4 rounded-2xl bg-white p-5 shadow-sm sm:flex-row sm:items-center md:p-6">
      <Avatar name={user.name} />
      <div className="min-w-0 flex-1">
        <h1 className="text-xl font-bold md:text-2xl">
          Hi, {user.name} <FontAwesomeIcon icon={faHand} className="ml-1 text-amber-400" />
        </h1>
        <p className="mt-0.5 truncate text-sm text-gray-500">
          {ROLE_LABELS[user.role]} · {user.email}
        </p>
      </div>
      {children && <div className="flex flex-wrap items-center gap-2">{children}</div>}
    </section>
  )
}

export default DashboardHeader
