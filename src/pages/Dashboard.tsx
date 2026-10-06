import { Link } from 'react-router-dom'
import { ROLE_LABELS } from '../constants/roles'
import { useAuth } from '../hooks/useAuth'

// Abhi sirf placeholder. Talent aur business dashboards baad mein banenge
function Dashboard() {
  const { user } = useAuth()
  if (!user) return null


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
          <dd className="font-medium">{ROLE_LABELS[user.role]}</dd>
        </div>
      </dl>
      {user.role === 'admin' && (
        <Link
          to="/admin"
          className="mt-6 inline-block rounded-lg bg-gray-900 px-4 py-2 text-sm font-medium text-white hover:bg-gray-800"
        >
          Open admin panel →
        </Link>
      )}
    </section>
  )
}

export default Dashboard
