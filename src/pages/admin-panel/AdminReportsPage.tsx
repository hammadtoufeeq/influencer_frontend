import { Link, useSearchParams } from 'react-router-dom'
import { keepPreviousData, useQuery } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import { listAdminReports } from '../../api/adminPanel'
import AdminPager from '../../components/admin-panel/AdminPager'
import DataState from '../../components/admin-panel/DataState'
import PageHeader from '../../components/admin-panel/PageHeader'
import StatusPill from '../../components/admin-panel/StatusPill'
import { REPORT_REASONS, type ReportStatus } from '../../types/adminPanel'
import { formatDateTime } from '../../utils/adminFormat'

const STATUSES: ReportStatus[] = ['open', 'reviewing', 'resolved', 'rejected']
const PAGE_SIZE = 20

function AdminReportsPage() {
  const { t } = useTranslation()
  const [params, setParams] = useSearchParams()
  const page = Number(params.get('page')) || 1
  const apiParams = new URLSearchParams(params)
  apiParams.set('limit', String(PAGE_SIZE))

  const { data, isLoading, isError, isFetching, refetch } = useQuery({
    queryKey: ['admin', 'reports', apiParams.toString()],
    queryFn: () => listAdminReports(apiParams),
    placeholderData: keepPreviousData,
    staleTime: 0,
  })

  function setParam(name: string, value: string) {
    const next = new URLSearchParams(params)
    if (value) next.set(name, value)
    else next.delete(name)
    if (name !== 'page') next.delete('page')
    setParams(next)
  }

  const select = 'rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm'

  return (
    <>
      <PageHeader title={t('reports.title')} subtitle={t('reports.subtitle')}>
        <div className="flex flex-wrap gap-2">
          <select
            aria-label={t('reports.colStatus')}
            value={params.get('status') ?? ''}
            onChange={(e) => setParam('status', e.target.value)}
            className={select}
          >
            <option value="">{t('reports.allStatuses')}</option>
            {STATUSES.map((s) => (
              <option key={s} value={s}>
                {t(`reportStatus.${s}`)}
              </option>
            ))}
          </select>
          <select
            aria-label={t('reports.colReason')}
            value={params.get('reason') ?? ''}
            onChange={(e) => setParam('reason', e.target.value)}
            className={select}
          >
            <option value="">{t('reports.allReasons')}</option>
            {REPORT_REASONS.map((r) => (
              <option key={r} value={r}>
                {t(`reportReason.${r}`)}
              </option>
            ))}
          </select>
        </div>
      </PageHeader>

      <DataState
        isLoading={isLoading}
        isError={isError}
        isEmpty={!!data && data.reports.length === 0}
        emptyText={t('reports.empty')}
        onRetry={() => refetch()}
      >
        <div
          className={`overflow-x-auto rounded-2xl bg-white shadow-sm ${isFetching ? 'opacity-70' : ''}`}
        >
          <table className="w-full min-w-[720px] text-sm">
            <thead className="border-b border-gray-100 text-xs uppercase text-gray-500">
              <tr>
                <th className="px-4 py-3 text-start font-medium">{t('reports.colPerson')}</th>
                <th className="px-4 py-3 text-start font-medium">{t('reports.colReason')}</th>
                <th className="px-4 py-3 text-start font-medium">{t('reports.colReporter')}</th>
                <th className="px-4 py-3 text-start font-medium">{t('reports.colStatus')}</th>
                <th className="px-4 py-3 text-start font-medium">{t('reports.colDate')}</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {data?.reports.map((report) => (
                <tr key={report._id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 font-medium">
                    {report.person?.name ?? '—'}
                    {report.person?.visibility === 'hidden' && (
                      <span className="ms-2 rounded-full bg-red-100 px-2 py-0.5 text-xs text-red-700">
                        {t('common.hidden')}
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3">{t(`reportReason.${report.reason}`)}</td>
                  <td className="px-4 py-3 text-gray-600">
                    {report.reporter?.email ?? report.reporterEmail ?? t('common.guest')}
                  </td>
                  <td className="px-4 py-3">
                    <StatusPill status={report.status} label={t(`reportStatus.${report.status}`)} />
                  </td>
                  <td className="px-4 py-3 text-gray-600">{formatDateTime(report.createdAt)}</td>
                  <td className="px-4 py-3 text-end">
                    <Link
                      to={`/admin/reports/${report._id}`}
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
          <AdminPager
            page={page}
            limit={PAGE_SIZE}
            total={data.meta.total}
            onChange={(p) => setParam('page', String(p))}
          />
        )}
      </DataState>
    </>
  )
}

export default AdminReportsPage
