import { Routes, Route } from 'react-router-dom'
import Layout from './components/Layout'
import ProtectedRoute from './components/ProtectedRoute'
import Home from './pages/Home'
import Search from './pages/Search'
import Profile from './pages/Profile'
import ClaimProfile from './pages/ClaimProfile'
import EditMyProfile from './pages/dashboards/EditMyProfile'
import Login from './pages/Login'
import Register from './pages/Register'
import Dashboard from './pages/Dashboard'
import NotFound from './pages/NotFound'
import Browse from './pages/Browse'
import ComingSoon from './pages/ComingSoon'
import MyProfileRedirect from './pages/MyProfileRedirect'
import {
  faBell,
  faBriefcase,
  faEnvelope,
  faGear,
  faStar,
  faUsers,
} from '@fortawesome/free-solid-svg-icons'
import AdminPersonEditor from './pages/admin/AdminPersonEditor'
import AdminLayout from './components/admin-panel/AdminLayout'
import AdminOverviewPage from './pages/admin-panel/AdminOverviewPage'
import AdminClaimsPage from './pages/admin-panel/AdminClaimsPage'
import AdminClaimDetailPage from './pages/admin-panel/AdminClaimDetailPage'
import AdminUsersPage from './pages/admin-panel/AdminUsersPage'
import AdminReportsPage from './pages/admin-panel/AdminReportsPage'
import AdminReportDetailPage from './pages/admin-panel/AdminReportDetailPage'
import AdminAuditLogPage from './pages/admin-panel/AdminAuditLogPage'
import ReportProfile from './pages/ReportProfile'

function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route path="/" element={<Home />} />
        <Route path="/search" element={<Search />} />
        <Route path="/browse" element={<Browse />} />
        <Route
          path="/my-profile"
          element={
            <ProtectedRoute roles={['talent']}>
              <MyProfileRedirect />
            </ProtectedRoute>
          }
        />
        {/* Ye pages document mein hain, abhi "Coming soon" */}
        <Route
          path="/dashboard/services"
          element={
            <ProtectedRoute roles={['talent']}>
              <ComingSoon
                title="Services & availability"
                icon={faBriefcase}
                description="Tell businesses what you offer and what you are open to."
                features={[
                  'Add services like keynote talks, brand campaigns or podcast guesting',
                  'Set a fixed price, a price range or "ask for a quote"',
                  'Turn availability on or off: speaking, campaigns, podcasts, events',
                ]}
              />
            </ProtectedRoute>
          }
        />
        <Route
          path="/inbox"
          element={
            <ProtectedRoute>
              <ComingSoon
                title="Inbox"
                icon={faEnvelope}
                description="All your inquiries and conversations in one place."
                features={[
                  'Businesses send inquiries with a brief, budget and date',
                  'Talent and managers accept or decline',
                  'A message thread for every inquiry',
                ]}
              />
            </ProtectedRoute>
          }
        />
        <Route
          path="/notifications"
          element={
            <ProtectedRoute>
              <ComingSoon
                title="Notifications"
                icon={faBell}
                description="Stay updated without checking every page."
                features={[
                  'New inquiry received',
                  'Inquiry accepted or declined',
                  'Profile claim updates',
                ]}
              />
            </ProtectedRoute>
          }
        />
        <Route
          path="/shortlists"
          element={
            <ProtectedRoute roles={['business', 'agency', 'organization']}>
              <ComingSoon
                title="Shortlists"
                icon={faStar}
                description="Save people you like and plan who to contact."
                features={[
                  'Create lists for campaigns or events',
                  'Add or remove people from any profile',
                  'Share a list with your team using a link',
                ]}
              />
            </ProtectedRoute>
          }
        />
        <Route
          path="/talents"
          element={
            <ProtectedRoute roles={['representative']}>
              <ComingSoon
                title="My talents"
                icon={faUsers}
                description="Manage the people you represent."
                features={[
                  'Link the profiles you manage to your account',
                  'Edit their services and availability',
                  'See inquiries for all your talents together',
                ]}
              />
            </ProtectedRoute>
          }
        />
        <Route
          path="/settings"
          element={
            <ProtectedRoute>
              <ComingSoon
                title="Settings"
                icon={faGear}
                description="Manage your account."
                features={[
                  'Change your password',
                  'Verify your email address',
                  'Choose your language: English, Urdu or Arabic',
                ]}
              />
            </ProtectedRoute>
          }
        />
        <Route path="/people/:slug" element={<Profile />} />
        <Route
          path="/people/:slug/claim"
          element={
            <ProtectedRoute roles={['talent']}>
              <ClaimProfile />
            </ProtectedRoute>
          }
        />
        <Route
          path="/dashboard/profile/edit"
          element={
            <ProtectedRoute roles={['talent']}>
              <EditMyProfile />
            </ProtectedRoute>
          }
        />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/dashboard/people/new"
          element={
            <ProtectedRoute roles={['admin']}>
              <AdminPersonEditor />
            </ProtectedRoute>
          }
        />
        <Route
          path="/dashboard/people/:id/edit"
          element={
            <ProtectedRoute roles={['admin']}>
              <AdminPersonEditor />
            </ProtectedRoute>
          }
        />
        {/* Admin panel: sidebar ke saath, sirf admin */}
        <Route
          path="/admin"
          element={
            <ProtectedRoute roles={['admin']}>
              <AdminLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<AdminOverviewPage />} />
          <Route path="claims" element={<AdminClaimsPage />} />
          <Route path="claims/:id" element={<AdminClaimDetailPage />} />
          <Route path="users" element={<AdminUsersPage />} />
          <Route path="reports" element={<AdminReportsPage />} />
          <Route path="reports/:id" element={<AdminReportDetailPage />} />
          <Route path="audit-logs" element={<AdminAuditLogPage />} />
        </Route>
        <Route path="/people/:slug/report" element={<ReportProfile />} />
        <Route path="*" element={<NotFound />} />
      </Route>
    </Routes>
  )
}

export default App
