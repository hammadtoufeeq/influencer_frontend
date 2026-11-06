import { useState, type FormEvent } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { keepPreviousData, useQuery } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import { faUserTie } from '@fortawesome/free-solid-svg-icons'
import { listAdminManagers } from '../../api/manager'
import AdminPager from '../../components/admin-panel/AdminPager'
import DataState from '../../components/admin-panel/DataState'
import PageHeader from '../../components/admin-panel/PageHeader'
import StatusPill from '../../components/admin-panel/StatusPill'
import type { ManagerStatus } from '../../types/manager'
import { formatDateTime } from '../../utils/adminFormat'
import { countryName } from '../../utils/format'

const PAGE_SIZE = 20
const STATUSES: ManagerStatus[] = ['pending', 'approved', 'rejected']

// /admin/managers -> manager / agent tasdeeq ki queue
function AdminManagersPage() {
  const { t } = useTranslation()
  const [params, setParams] = useSearchParams()
  const [q, setQ] = useState(params.get('q') ?? '')
  const page = Number(params.get('page')) || 1
  const apiParams = new URLSearchParams(params)
  apiParams.set('limit', String(PAGE_SIZE))

  const { data, isLoading, isError, error, refetch } = useQuery({
    queryKey: ['admin', 'managers', apiParams.toString()],
    queryFn: () => listAdminManagers(apiParams),
    placeholderData: keepPreviousData,
  })

  function setParam(name: string, value: string) {
    setParams((prev) => {
      const next = new URLSearchParams(prev)
      if (value) next.set(name, value)
      else next.delete(name)
      if (name !== 'page') next.delete('page')
      return next
    })
  }

  function handleSearch(e: FormEvent) {
    e.preventDefault()
    setParam('q', q.trim())
  }

  const filtered = [...params.keys()].some((key) => key !== 'page')

  return (
    <>
      <PageHeader title={t('adminManagers.title')} subtitle={t('adminManagers.subtitle')}>
        <div className="flex flex-wrap gap-2">
          <form onSubmit={handleSearch}>
            <input
              type="search"
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder={t('adminManagers.searchPlaceholder')}
              aria-label={t('common.search')}
              className="rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm"
            />
          </form>
          <select
            aria-label={t('businesses.colStatus')}
            value={params.get('status') ?? ''}
            onChange={(e) => setParam('status', e.target.value)}
            className="rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm"
          >
            <option value="">{t('businesses.allStatuses')}</option>
            {STATUSES.map((s) => (
              <option key={s} value={s}>
                {t(`managerStatus.${s}`)}
              </option>
            ))}
          </select>
        </div>
      </PageHeader>

      <DataState
        isLoading={isLoading}
        isError={isError && !data}
        error={error}
        isEmpty={!!data && data.managers.length === 0}
        emptyIcon={faUserTie}
        emptyTitle={filtered ? t('dataState.filteredTitle') : t('adminManagers.emptyTitle')}
        emptyText={filtered ? t('dataState.filteredText') : t('adminManagers.emptyText')}
        onRetry={() => refetch()}
      >
        <div className="overflow-x-auto rounded-2xl bg-white shadow-sm">
          <table className="w-full min-w-[720px] text-sm">
            <thead className="border-b border-gray-100 text-xs uppercase text-gray-500">
              <tr>
                <th className="px-4 py-3 text-start font-medium">{t('adminManagers.colManager')}</th>
                <th className="px-4 py-3 text-start font-medium">{t('adminManagers.colAgency')}</th>
                <th className="px-4 py-3 text-start font-medium">{t('businesses.colCountry')}</th>
                <th className="px-4 py-3 text-start font-medium">{t('businesses.colStatus')}</th>
                <th className="px-4 py-3 text-start font-medium">{t('businesses.colSubmitted')}</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {data?.managers.map((manager) => (
                <tr key={manager._id} className="hover:bg-gray-50">
                  <td className="px-4 py-3">
                    <p className="font-medium">{manager.owner?.name ?? t('claims.deletedUser')}</p>
                    <p className="truncate text-xs text-gray-500">{manager.owner?.email}</p>
                  </td>
                  <td className="px-4 py-3 text-gray-600">{manager.agencyName || '—'}</td>
                  <td className="px-4 py-3">{countryName(manager.country)}</td>
                  <td className="px-4 py-3">
                    <StatusPill status={manager.status} label={t(`managerStatus.${manager.status}`)} />
                  </td>
                  <td className="px-4 py-3 text-gray-600">{formatDateTime(manager.submittedAt)}</td>
                  <td className="px-4 py-3 text-end">
                    <Link
                      to={`/admin/managers/${manager._id}`}
                      className="rounded-lg border border-gray-300 px-3 py-1.5 text-xs font-medium hover:bg-gray-100"
                    >
                      {t('common.view')}
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {data && (
          <AdminPager page={page} limit={PAGE_SIZE} total={data.meta.total} onChange={(p) => setParam('page', String(p))} />
        )}
      </DataState>
    </>
  )
}

export default AdminManagersPage
