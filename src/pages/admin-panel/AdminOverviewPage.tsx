import { Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import {
  faFlag,
  faIdCard,
  faUserCheck,
  faUsers,
  type IconDefinition,
} from '@fortawesome/free-solid-svg-icons'
import { getAdminStats } from '../../api/adminPanel'
import DataState from '../../components/admin-panel/DataState'
import PageHeader from '../../components/admin-panel/PageHeader'
import type { Role } from '../../types/user'

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
      <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-gray-900 text-white">
        <FontAwesomeIcon icon={props.icon} />
      </span>
      <p className="mt-4 text-sm text-gray-500">{props.label}</p>
      <p className="text-3xl font-bold">{props.value}</p>
      <p className="mt-1 flex-1 text-xs text-gray-500">{props.detail}</p>
      <span className="mt-3 text-sm font-medium underline">{t('overview.open')}</span>
    </Link>
  )
}

function AdminOverviewPage() {
  const { t } = useTranslation()
  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ['admin', 'stats'],
    queryFn: getAdminStats,
    staleTime: 0,
  })

  return (
    <>
      <PageHeader title={t('overview.title')} subtitle={t('overview.subtitle')} />
      <DataState isLoading={isLoading} isError={isError} isEmpty={!data} onRetry={() => refetch()}>
        {data && (
          <div className="space-y-6">
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
              <StatCard
                to="/admin/claims?status=needs_action"
                icon={faUserCheck}
                label={t('overview.claimsNeedAction')}
                value={data.claims.needsAction}
                detail={t('overview.openClaims', { count: data.claims.open })}
                highlight={data.claims.needsAction > 0}
              />
              <StatCard
                to="/admin/reports?status=open"
                icon={faFlag}
                label={t('overview.openReports')}
                value={data.reports.open}
                detail={t('overview.reviewingReports', { count: data.reports.reviewing })}
                highlight={data.reports.open > 0}
              />
              <StatCard
                to="/admin/users"
                icon={faUsers}
                label={t('overview.users')}
                value={data.users.total}
                detail={t('overview.suspendedUsers', { count: data.users.suspended })}
              />
              <StatCard
                to="/dashboard"
                icon={faIdCard}
                label={t('overview.people')}
                value={data.people.total}
                detail={t('overview.peopleDetail', data.people)}
              />
            </div>
            <section className="rounded-2xl bg-white p-5 shadow-sm">
              <h2 className="font-semibold">{t('overview.usersByRole')}</h2>
              <ul className="mt-4 grid gap-3 sm:grid-cols-3">
                {(Object.entries(data.users.byRole) as [Role, number][]).map(([role, count]) => (
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
