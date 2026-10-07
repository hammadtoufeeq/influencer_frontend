import { Link, useSearchParams } from 'react-router-dom'
import { keepPreviousData, useQuery } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import { adminListClaims } from '../../api/claims'
import Avatar from '../../components/Avatar'
import AdminPager from '../../components/admin-panel/AdminPager'
import DataState from '../../components/admin-panel/DataState'
import PageHeader from '../../components/admin-panel/PageHeader'
import StatusPill from '../../components/admin-panel/StatusPill'
import type { ClaimFilter } from '../../types/claim'
import { formatDateTime } from '../../utils/adminFormat'

const FILTERS: ClaimFilter[] = [
  'open',
  'needs_action',
  'pending',
  'code_sent',
  'code_verified',
  'approved',
  'rejected',
]
const PAGE_SIZE = 20

function AdminClaimsPage() {
  const { t } = useTranslation()
  const [params, setParams] = useSearchParams()
  const status = (params.get('status') as ClaimFilter) || 'open'
  const page = Number(params.get('page')) || 1

  const { data, isLoading, isError, isFetching, refetch } = useQuery({
    queryKey: ['admin', 'claims', status, page],
    queryFn: () => adminListClaims(status, page),
    placeholderData: keepPreviousData,
    staleTime: 0,
  })

  const filterLabel = (f: ClaimFilter) =>
    f === 'open' || f === 'needs_action' ? t(`claimFilter.${f}`) : t(`claimStatus.${f}`)

  return (
    <>
      <PageHeader title={t('claims.title')} subtitle={t('claims.subtitle')}>
        <select
          aria-label={t('claims.colStatus')}
          value={status}
          onChange={(e) => setParams({ status: e.target.value })}
          className="rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm"
        >
          {FILTERS.map((f) => (
            <option key={f} value={f}>
              {filterLabel(f)}
            </option>
          ))}
        </select>
      </PageHeader>

      <DataState
        isLoading={isLoading}
        isError={isError}
        isEmpty={!!data && data.claims.length === 0}
        emptyText={t('claims.empty')}
        onRetry={() => refetch()}
      >
        <div
          className={`overflow-x-auto rounded-2xl bg-white shadow-sm ${isFetching ? 'opacity-70' : ''}`}
        >
          <table className="w-full min-w-[640px] text-sm">
            <thead className="border-b border-gray-100 text-xs uppercase text-gray-500">
              <tr>
                <th className="px-4 py-3 text-start font-medium">{t('claims.colPerson')}</th>
                <th className="px-4 py-3 text-start font-medium">{t('claims.colClaimant')}</th>
                <th className="px-4 py-3 text-start font-medium">{t('claims.colStatus')}</th>
                <th className="px-4 py-3 text-start font-medium">{t('claims.colSent')}</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {data?.claims.map((claim) => {
                const user = typeof claim.user === 'string' ? null : claim.user
                return (
                  <tr key={claim._id} className="hover:bg-gray-50">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <Avatar
                          name={claim.person.name}
                          photoUrl={claim.person.photoUrl}
                          size="sm"
                        />
                        <span className="font-medium">{claim.person.name}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <p>{user?.name}</p>
                      <p className="text-xs text-gray-500">{user?.email}</p>
                    </td>
                    <td className="px-4 py-3">
                      <StatusPill status={claim.status} label={t(`claimStatus.${claim.status}`)} />
                    </td>
                    <td className="px-4 py-3 text-gray-600">{formatDateTime(claim.createdAt)}</td>
                    <td className="px-4 py-3 text-end">
                      <Link
                        to={`/admin/claims/${claim._id}`}
                        className="rounded-lg border border-gray-300 px-3 py-1.5 text-xs font-medium hover:bg-gray-100"
                      >
                        {t('common.view')}
                      </Link>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
        {data && (
          <AdminPager
            page={page}
            limit={PAGE_SIZE}
            total={data.meta.total}
            onChange={(p) => setParams({ status, page: String(p) })}
          />
        )}
      </DataState>
    </>
  )
}

export default AdminClaimsPage
