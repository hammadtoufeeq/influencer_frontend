import { Fragment, useState, type FormEvent } from 'react'
import { useSearchParams } from 'react-router-dom'
import { keepPreviousData, useQuery } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faMagnifyingGlass } from '@fortawesome/free-solid-svg-icons'
import { listAuditLogs } from '../../api/adminPanel'
import AdminPager from '../../components/admin-panel/AdminPager'
import DataState from '../../components/admin-panel/DataState'
import PageHeader from '../../components/admin-panel/PageHeader'
import { formatDateTime } from '../../utils/adminFormat'

const TARGETS = ['person', 'claim', 'user', 'report'] as const
const PAGE_SIZE = 25

function Snapshot({ label, value }: { label: string; value: unknown }) {
  return (
    <div className="min-w-0 flex-1">
      <p className="mb-1 text-xs font-medium text-gray-500">{label}</p>
      <pre
        dir="ltr"
        className="max-h-64 overflow-auto rounded-lg bg-gray-900 p-3 text-start text-xs text-gray-100"
      >
        {value === undefined || value === null ? '—' : JSON.stringify(value, null, 2)}
      </pre>
    </div>
  )
}

// Sirf parhne ke liye: koi button yahan kuch badalta nahi
function AdminAuditLogPage() {
  const { t } = useTranslation()
  const [params, setParams] = useSearchParams()
  const [action, setAction] = useState(params.get('action') ?? '')
  const [open, setOpen] = useState<string | null>(null)
  const page = Number(params.get('page')) || 1

  const apiParams = new URLSearchParams(params)
  apiParams.set('limit', String(PAGE_SIZE))
  // Date input sirf din deta hai; "to" ko din ke aakhir tak le jao
  const to = params.get('to')
  if (to) apiParams.set('to', `${to}T23:59:59.999`)

  const { data, isLoading, isError, isFetching, refetch } = useQuery({
    queryKey: ['admin', 'audit-logs', apiParams.toString()],
    queryFn: () => listAuditLogs(apiParams),
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

  function handleAction(e: FormEvent) {
    e.preventDefault()
    setParam('action', action.trim())
  }

  const input = 'rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm'

  return (
    <>
      <PageHeader title={t('audit.title')} subtitle={t('audit.subtitle')} />

      <div className="mb-4 flex flex-wrap items-end gap-2">
        <form onSubmit={handleAction} className="flex w-full min-w-0 gap-2 sm:w-auto sm:min-w-[220px] sm:flex-1">
          <input
            value={action}
            onChange={(e) => setAction(e.target.value)}
            placeholder={t('audit.actionFilter')}
            aria-label={t('audit.actionFilter')}
            dir="ltr"
            className={`${input} min-w-0 flex-1`}
          />
          <button
            type="submit"
            aria-label={t('common.search')}
            className="rounded-lg bg-gray-900 px-4 py-2 text-sm text-white"
          >
            <FontAwesomeIcon icon={faMagnifyingGlass} />
          </button>
        </form>
        <select
          aria-label={t('audit.colTarget')}
          value={params.get('targetType') ?? ''}
          onChange={(e) => setParam('targetType', e.target.value)}
          className={input}
        >
          <option value="">{t('audit.allTargets')}</option>
          {TARGETS.map((target) => (
            <option key={target} value={target}>
              {t(`auditTarget.${target}`)}
            </option>
          ))}
        </select>
        <label className="text-xs text-gray-500">
          {t('audit.from')}
          <input
            type="date"
            value={params.get('from') ?? ''}
            onChange={(e) => setParam('from', e.target.value)}
            className={`${input} mt-1 block`}
          />
        </label>
        <label className="text-xs text-gray-500">
          {t('audit.to')}
          <input
            type="date"
            value={params.get('to') ?? ''}
            onChange={(e) => setParam('to', e.target.value)}
            className={`${input} mt-1 block`}
          />
        </label>
      </div>

      <DataState
        isLoading={isLoading}
        isError={isError}
        isEmpty={!!data && data.logs.length === 0}
        emptyText={t('audit.empty')}
        onRetry={() => refetch()}
      >
        <div
          className={`overflow-x-auto rounded-2xl bg-white shadow-sm ${isFetching ? 'opacity-70' : ''}`}
        >
          <table className="w-full min-w-[720px] text-sm">
            <thead className="border-b border-gray-100 text-xs uppercase text-gray-500">
              <tr>
                <th className="px-4 py-3 text-start font-medium">{t('audit.colTime')}</th>
                <th className="px-4 py-3 text-start font-medium">{t('audit.colActor')}</th>
                <th className="px-4 py-3 text-start font-medium">{t('audit.colAction')}</th>
                <th className="px-4 py-3 text-start font-medium">{t('audit.colTarget')}</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {data?.logs.map((log) => (
                <Fragment key={log._id}>
                  <tr className="hover:bg-gray-50">
                    <td className="whitespace-nowrap px-4 py-3 text-gray-600">
                      {formatDateTime(log.createdAt)}
                    </td>
                    <td className="px-4 py-3">{log.actor?.email ?? log.actorEmail}</td>
                    <td className="px-4 py-3">
                      <p>{t(`auditAction.${log.action}`, { defaultValue: log.action })}</p>
                      <p dir="ltr" className="text-start font-mono text-xs text-gray-400">
                        {log.action}
                      </p>
                    </td>
                    <td className="px-4 py-3">
                      <p className="text-xs text-gray-500">{t(`auditTarget.${log.targetType}`)}</p>
                      <p>{log.targetLabel ?? log.targetId}</p>
                    </td>
                    <td className="px-4 py-3 text-end">
                      <button
                        onClick={() => setOpen(open === log._id ? null : log._id)}
                        aria-expanded={open === log._id}
                        className="whitespace-nowrap rounded-lg border border-gray-300 px-3 py-1.5 text-xs hover:bg-gray-100"
                      >
                        {open === log._id ? t('audit.hideChanges') : t('audit.showChanges')}
                      </button>
                    </td>
                  </tr>
                  {open === log._id && (
                    <tr>
                      <td colSpan={5} className="bg-gray-50 px-4 py-4">
                        <div className="flex flex-col gap-3 md:flex-row">
                          <Snapshot label={t('audit.before')} value={log.before} />
                          <Snapshot label={t('audit.after')} value={log.after} />
                        </div>
                      </td>
                    </tr>
                  )}
                </Fragment>
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

export default AdminAuditLogPage
