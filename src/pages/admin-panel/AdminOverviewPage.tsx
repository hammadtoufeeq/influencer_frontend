import { Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import {
  faBuilding,
  faFileContract,
  faFlag,
  faIdCard,
  faUserCheck,
  faUserTie,
  faUsers,
  type IconDefinition,
} from '@fortawesome/free-solid-svg-icons'
import { getAdminStats } from '../../api/adminPanel'
import DataState from '../../components/admin-panel/DataState'
import PageHeader from '../../components/admin-panel/PageHeader'
import type { Role } from '../../types/user'
import type { AdminStats } from '../../types/adminPanel'

function StatCard(props: {
  to: string
  icon: IconDefinition
  label: string
  value: number
  detail: string
  highlight?: boolean
}) {
  const { t } = useTranslation()
  return (
    <Link
      to={props.to}
      className={`flex flex-col rounded-2xl border bg-white p-5 shadow-sm transition hover:shadow-md ${
        props.highlight ? 'border-amber-300' : 'border-gray-200'
      }`}
    >
      <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand text-on-brand">
        <FontAwesomeIcon icon={props.icon} />
      </span>
      <p className="mt-4 text-sm text-gray-500">{props.label}</p>
      <p className="text-3xl font-bold">{props.value}</p>
      <p className="mt-1 flex-1 text-xs text-gray-500">{props.detail}</p>
      <span className="mt-3 text-sm font-medium underline">{t('overview.open')}</span>
    </Link>
  )
}

function withDefaults(data: Partial<AdminStats>): AdminStats {
  return {
    people: { total: 0, hidden: 0, claimed: 0, verified: 0, ...data.people },
    users: { total: 0, suspended: 0, ...data.users, byRole: data.users?.byRole ?? {} },
    claims: { needsAction: 0, open: 0, ...data.claims },
    reports: { open: 0, reviewing: 0, ...data.reports },
    businesses: { needsAction: 0, approved: 0, ...data.businesses },
    agreements: { disputed: 0, active: 0, ...data.agreements },
    managers: { needsAction: 0, approved: 0, ...data.managers },
  }
}

function AdminOverviewPage() {
  const { t } = useTranslation()
  const { data, isLoading, isError, error, refetch } = useQuery({
    queryKey: ['admin', 'stats'],
    queryFn: getAdminStats,
  })

  // Backend ka koi hissa na aaye (purana deploy waghera) to 0 dikhao, page crash na ho
  const stats = data && withDefaults(data)

  return (
    <>
      <PageHeader title={t('overview.title')} subtitle={t('overview.subtitle')} />
      <DataState
        isLoading={isLoading}
        isError={isError && !data}
        error={error}
        isEmpty={!data}
        onRetry={() => refetch()}
      >
        {stats && (
          <div className="space-y-6">
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
              <StatCard
                to="/admin/claims?status=needs_action"
                icon={faUserCheck}
                label={t('overview.claimsNeedAction')}
                value={stats.claims.needsAction}
                detail={t('overview.openClaims', { count: stats.claims.open })}
                highlight={stats.claims.needsAction > 0}
              />
              <StatCard
                to="/admin/reports?status=open"
                icon={faFlag}
                label={t('overview.openReports')}
                value={stats.reports.open}
                detail={t('overview.reviewingReports', { count: stats.reports.reviewing })}
                highlight={stats.reports.open > 0}
              />
              <StatCard
                to="/admin/businesses?status=needs_action"
                icon={faBuilding}
                label={t('overview.businessesNeedAction')}
                value={stats.businesses.needsAction}
                detail={t('overview.businessesApproved', { count: stats.businesses.approved })}
                highlight={stats.businesses.needsAction > 0}
              />
              <StatCard
                to="/admin/agreements?status=disputed"
                icon={faFileContract}
                label={t('overview.disputes')}
                value={stats.agreements.disputed}
                detail={t('overview.activeAgreements', { count: stats.agreements.active })}
                highlight={stats.agreements.disputed > 0}
              />
              <StatCard
                to="/admin/managers?status=pending"
                icon={faUserTie}
                label={t('overview.managersNeedAction')}
                value={stats.managers.needsAction}
                detail={t('overview.managersApproved', { count: stats.managers.approved })}
                highlight={stats.managers.needsAction > 0}
              />
              <StatCard
                to="/admin/users"
                icon={faUsers}
                label={t('overview.users')}
                value={stats.users.total}
                detail={t('overview.suspendedUsers', { count: stats.users.suspended })}
              />
              <StatCard
                to="/dashboard"
                icon={faIdCard}
                label={t('overview.people')}
                value={stats.people.total}
                detail={t('overview.peopleDetail', stats.people)}
              />
            </div>
            <section className="rounded-2xl bg-white p-5 shadow-sm">
              <h2 className="font-semibold">{t('overview.usersByRole')}</h2>
              <ul className="mt-4 grid gap-3 sm:grid-cols-3">
                {(Object.entries(stats.users.byRole) as [Role, number][]).map(([role, count]) => (
                  <li key={role}>
                    <Link
                      to={`/admin/users?role=${role}`}
                      className="flex items-center justify-between rounded-xl bg-gray-50 px-4 py-3 text-sm hover:bg-gray-100"
                    >
                      <span>{t(`roles.${role}`)}</span>
                      <span className="font-semibold">{count}</span>
                    </Link>
                  </li>
                ))}
              </ul>
            </section>
          </div>
        )}
      </DataState>
    </>
  )
}

export default AdminOverviewPage
