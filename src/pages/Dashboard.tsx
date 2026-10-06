import { SIGNUP_ROLE_OPTIONS } from '../constants/roles'
import { useAuth } from '../hooks/useAuth'

// Abhi sirf placeholder. Talent aur business dashboards baad mein banenge
function Dashboard() {
  const { user } = useAuth()
  if (!user) return null

  const roleLabel =
    SIGNUP_ROLE_OPTIONS.find((option) => option.value === user.role)?.label ?? user.role

  return (
    <section className="rounded-2xl bg-white p-6 shadow-sm md:p-8">
      <h1 className="text-2xl font-bold">Hi, {user.name} 👋</h1>
      <dl className="mt-6 grid gap-4 sm:grid-cols-2">
        <div>
          <dt className="text-sm text-gray-500">Email</dt>
          <dd className="font-medium break-all">{user.email}</dd>
        </div>
        <div>
          <dt className="text-sm text-gray-500">Account type</dt>
          <dd className="font-medium">{roleLabel}</dd>
        </div>
      </dl>
    </section>
  )
}

export default Dashboard
