import type { ReactNode } from 'react'
import { Link, NavLink, Outlet, useLocation } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useQuery } from '@tanstack/react-query'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import {
  faArrowUpRightFromSquare,
  faBriefcase,
  faBuilding,
  faBullhorn,
  faChartPie,
  faFileContract,
  faHandshake,
  faIdCard,
  faStar,
  faUserTie,
  faUsers,
  type IconDefinition,
} from '@fortawesome/free-solid-svg-icons'
import { useAuth } from '../../hooks/useAuth'
import {
  incomingHiresQuery,
  myCampaignsQuery,
  myHiresQuery,
  myManagerQuery,
  myProfileQuery,
  myRepresentationsQuery,
} from '../../api/queries'

interface SideLink {
  to: string
  key: string
  icon: IconDefinition
  end?: boolean
  // Is link ke neeche ke pages pe bhi active dikhe (jaise /my-profile/new)
  also?: string[]
  badge?: number
}

// Talent, business aur manager ke dashboard pages: admin panel jaisa sidebar + page.
// Baqi account types ke liye sirf page, sidebar nahi
function DashboardLayout() {
  const { user } = useAuth()
  const role = user?.role
  if (role === 'talent') return <TalentPanel />
  if (role === 'business') return <BusinessPanel />
  if (role === 'representative') return <ManagerPanel />
  return <Outlet />
}

function TalentPanel() {
  const { t } = useTranslation()
  const { data: profile } = useQuery(myProfileQuery)
  const { data: hires } = useQuery(incomingHiresQuery)
  const { data: manager } = useQuery({ ...myManagerQuery, retry: false })
  const pending = hires?.filter((hire) => hire.status === 'pending').length ?? 0
  const managerRequests = manager?.pending.filter((rep) => rep.status === 'requested').length ?? 0

  return (
    <Panel
      titleKey="dashNav.talentTitle"
      links={[
        { to: '/dashboard', key: 'dashNav.overview', icon: faChartPie, end: true },
        {
          // Profile claim nahi hui to banane wala page
          to: profile ? '/dashboard/profile/edit' : '/my-profile/new',
          key: 'dashNav.myProfile',
          icon: faIdCard,
          also: ['/dashboard/profile/edit', '/my-profile/new'],
        },
        { to: '/dashboard/services', key: 'dashNav.services', icon: faBriefcase },
        { to: '/dashboard/applications', key: 'dashNav.applications', icon: faBullhorn },
        { to: '/dashboard/hire-requests', key: 'dashNav.hireRequests', icon: faHandshake, badge: pending },
        { to: '/agreements', key: 'dashNav.agreements', icon: faFileContract },
        { to: '/dashboard/my-manager', key: 'dashNav.myManager', icon: faUserTie, badge: managerRequests },
      ]}
      extra={
        profile && (
          <Link
            to={`/people/${profile.slug}`}
            className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm text-gray-600 hover:bg-white"
          >
            <FontAwesomeIcon icon={faArrowUpRightFromSquare} className="w-4" />
            {t('dashNav.viewPublicProfile')}
          </Link>
        )
      }
    />
  )
}

function BusinessPanel() {
  const { data: hires } = useQuery(myHiresQuery)
  // Talent ne haan kar di, ab muahida banana business ka kaam hai
  const toDraft = hires?.filter((hire) => hire.status === 'accepted' && !hire.agreement).length ?? 0
  // Campaigns pe naye talents jin ka jawab baqi
  const { data: campaigns } = useQuery(myCampaignsQuery)
  const newApplicants = campaigns?.campaigns.reduce((sum, c) => sum + c.counts.pending, 0) ?? 0

  return (
    <Panel
      titleKey="dashNav.businessTitle"
      links={[
        { to: '/dashboard', key: 'dashNav.overview', icon: faChartPie, end: true },
        { to: '/dashboard/business', key: 'dashNav.businessDetails', icon: faBuilding },
        {
          to: '/dashboard/campaigns',
          key: 'dashNav.campaigns',
          icon: faBullhorn,
          badge: newApplicants,
          also: ['/dashboard/campaigns/new'],
        },
        { to: '/shortlists', key: 'dashNav.shortlists', icon: faStar },
        { to: '/dashboard/hire-requests', key: 'dashNav.hireRequests', icon: faHandshake, badge: toDraft },
        { to: '/agreements', key: 'dashNav.agreements', icon: faFileContract },
      ]}
    />
  )
}

// Manager: apni tasdeeq, talents (roster) aur un ki hire requests ek jagah
function ManagerPanel() {
  const { data: hires } = useQuery(incomingHiresQuery)
  const { data: reps } = useQuery(myRepresentationsQuery)
  const pending = hires?.filter((hire) => hire.status === 'pending').length ?? 0
  const invites = reps?.filter((rep) => rep.status === 'invited').length ?? 0

  return (
    <Panel
      titleKey="dashNav.managerTitle"
      links={[
        { to: '/dashboard', key: 'dashNav.overview', icon: faChartPie, end: true },
        { to: '/dashboard/manager', key: 'dashNav.managerDetails', icon: faUserTie },
        { to: '/talents', key: 'dashNav.myTalents', icon: faUsers, badge: invites },
        { to: '/dashboard/hire-requests', key: 'dashNav.hireRequests', icon: faHandshake, badge: pending },
        { to: '/agreements', key: 'dashNav.agreements', icon: faFileContract },
      ]}
    />
  )
}

function Panel({ titleKey, links, extra }: { titleKey: string; links: SideLink[]; extra?: ReactNode }) {
  const { t, i18n } = useTranslation()
  const { pathname } = useLocation()

  const linkClass = (link: SideLink) => ({ isActive }: { isActive: boolean }) => {
    const active = isActive || (link.also?.includes(pathname) ?? false)
    return `flex shrink-0 items-center gap-3 whitespace-nowrap rounded-lg px-3 py-2 text-sm transition ${
      active ? 'bg-brand text-on-brand' : 'text-gray-700 hover:bg-gray-100'
    }`
  }

  return (
    <div
      dir={i18n.dir()}
      lang={i18n.language}
      className="grid grid-cols-1 gap-6 lg:grid-cols-[220px_minmax(0,1fr)]"
    >
      {/* Print (muahide ki PDF) mein sidebar nahi */}
      <aside className="min-w-0 space-y-4 print:hidden lg:sticky lg:top-24 lg:self-start">
        <div className="rounded-2xl bg-white p-3 shadow-sm">
          <p className="px-3 pb-2 pt-1 text-xs font-semibold uppercase tracking-wide text-gray-500">
            {t(titleKey)}
          </p>
          {/* Mobile pe line mein scroll, desktop pe upar se neeche */}
          <nav className="-mx-1 flex gap-1 overflow-x-auto px-1 pb-1 lg:flex-col lg:overflow-visible">
            {links.map((link) => (
              <NavLink key={link.key} to={link.to} end={link.end} className={linkClass(link)}>
                <FontAwesomeIcon icon={link.icon} className="w-4" />
                <span className="flex-1">{t(link.key)}</span>
                {!!link.badge && (
                  <span className="rounded-full bg-red-600 px-1.5 py-0.5 text-[10px] font-semibold leading-none text-white">
                    {link.badge}
                  </span>
                )}
              </NavLink>
            ))}
          </nav>
        </div>
        {extra && <div className="flex flex-wrap items-center gap-2 lg:flex-col lg:items-stretch">{extra}</div>}
      </aside>
      <section className="min-w-0">
        <Outlet />
      </section>
    </div>
  )
}

export default DashboardLayout
