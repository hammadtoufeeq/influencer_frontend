import { useAuth } from '../hooks/useAuth'
import AdminDashboard from './admin/AdminDashboard'
import RoleDashboard from './dashboards/RoleDashboard'

// /dashboard: login ke baad har user ko uske account type ka dashboard
function Dashboard() {
  const { user } = useAuth()
  if (!user) return null

  if (user.role === 'admin') return <AdminDashboard />
  return <RoleDashboard role={user.role} />
}

export default Dashboard
