import { Link } from 'react-router-dom'
import DashboardHeader from '../components/DashboardHeader'
import { useAuth } from '../hooks/useAuth'
import AdminDashboard from './admin/AdminDashboard'

// /dashboard: har role ko apna dashboard. Admin ko seedha admin dashboard
function Dashboard() {
  const { user } = useAuth()
  if (!user) return null

  if (user.role === 'admin') return <AdminDashboard />

  // Talent aur business dashboards agle phases mein banenge
  return (
    <div className="space-y-6">
      <DashboardHeader />
      <section className="rounded-2xl border border-dashed border-gray-300 p-8 text-center">
        <p className="font-medium">Your dashboard is coming soon.</p>
        <p className="mt-1 text-sm text-gray-500">
          Meanwhile, discover people on the platform.
        </p>
        <Link
          to="/search"
          className="mt-4 inline-block rounded-lg bg-gray-900 px-4 py-2 text-sm text-white hover:bg-gray-800"
        >
          Explore people
        </Link>
      </section>
    </div>
  )
}

export default Dashboard
