import { NavLink, Outlet, Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import {
  faChartPie,
  faClipboardList,
  faFlag,
  faIdCard,
  faUserCheck,
  faUsers,
  type IconDefinition,
} from '@fortawesome/free-solid-svg-icons'
import AdminLanguageSwitch from './AdminLanguageSwitch'

const LINKS: { to: string; key: string; icon: IconDefinition; end?: boolean }[] = [
  { to: '/admin', key: 'nav.dashboard', icon: faChartPie, end: true },
  { to: '/admin/claims', key: 'nav.claims', icon: faUserCheck },
  { to: '/admin/users', key: 'nav.users', icon: faUsers },
  { to: '/admin/reports', key: 'nav.reports', icon: faFlag },
  { to: '/admin/audit-logs', key: 'nav.auditLog', icon: faClipboardList },
]

// /admin ka dhaancha: sidebar + page. dir se Urdu/Arabic mein layout ulta ho jata hai
function AdminLayout() {
  const { t, i18n } = useTranslation()

  const linkClass = ({ isActive }: { isActive: boolean }) =>
    `flex shrink-0 items-center gap-3 whitespace-nowrap rounded-lg px-3 py-2 text-sm transition ${
      isActive ? 'bg-gray-900 text-white' : 'text-gray-700 hover:bg-gray-100'
    }`

  return (
    <div
      dir={i18n.dir()}
      lang={i18n.language}
      className="grid grid-cols-1 gap-6 lg:grid-cols-[220px_minmax(0,1fr)]"
    >
      <aside className="min-w-0 space-y-4 lg:sticky lg:top-6 lg:self-start">
        <div className="rounded-2xl bg-white p-3 shadow-sm">
          <p className="px-3 pb-2 pt-1 text-xs font-semibold uppercase tracking-wide text-gray-500">
            {t('nav.title')}
          </p>
          {/* Mobile pe line mein scroll, desktop pe upar se neeche */}
          <nav className="-mx-1 flex gap-1 overflow-x-auto px-1 pb-1 lg:flex-col lg:overflow-visible">
            {LINKS.map((link) => (
              <NavLink key={link.to} to={link.to} end={link.end} className={linkClass}>
                <FontAwesomeIcon icon={link.icon} className="w-4" />
                {t(link.key)}
              </NavLink>
            ))}
          </nav>
        </div>
        <div className="flex flex-wrap items-center gap-2 lg:flex-col lg:items-stretch">
          <AdminLanguageSwitch />
          <Link
            to="/dashboard"
            className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm text-gray-600 hover:bg-white"
          >
            <FontAwesomeIcon icon={faIdCard} className="w-4" />
            {t('nav.manageProfiles')}
          </Link>
        </div>
      </aside>
      <section className="min-w-0">
        <Outlet />
      </section>
    </div>
  )
}

export default AdminLayout
