import { useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { keepPreviousData, useQuery } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import { faClipboardList } from '@fortawesome/free-solid-svg-icons'
import { listAuditLogs } from '../../api/adminPanel'
import ChangesDialog from '../../components/admin-panel/ChangesDialog'
import type { AuditLogEntry } from '../../types/adminPanel'
import AdminPager from '../../components/admin-panel/AdminPager'
import DataState from '../../components/admin-panel/DataState'
import PageHeader from '../../components/admin-panel/PageHeader'
import { formatDateTime } from '../../utils/adminFormat'

const TARGETS = ['person', 'claim', 'user', 'report', 'business', 'agreement', 'manager', 'inquiry'] as const
const PAGE_SIZE = 25

// Har target ke actions (auditAction.* mein inke naam hain)
const ACTIONS: Record<(typeof TARGETS)[number], string[]> = {
  person: ['create', 'update', 'verify', 'unverify', 'hide', 'unhide', 'delete'],
  claim: [
    'new_profile',
    'send_code',
    'reset_otp',
    'otp_locked',
    'verify_manual',
    'approve',
    'reject',
  ],
  user: ['suspend', 'unsuspend', 'role_change'],
  report: ['update'],
  inquiry: ['update'],
  agreement: ['sign', 'dispute', 'resolve'],
  business: ['send_code', 'reset_otp', 'otp_locked', 'verify_manual', 'approve', 'reject'],
  manager: ['approve', 'reject'],
}

// Sirf parhne ke liye: koi button yahan kuch badalta nahi
function AdminAuditLogPage() {
  const { t } = useTranslation()
  const [params, setParams] = useSearchParams()
  const [open, setOpen] = useState<AuditLogEntry | null>(null)
  const page = Number(params.get('page')) || 1

  const apiParams = new URLSearchParams(params)
  apiParams.set('limit', String(PAGE_SIZE))
  // Date input sirf din deta hai; "to" ko din ke aakhir tak le jao
  const to = params.get('to')
  if (to) apiParams.set('to', `${to}T23:59:59.999`)

  const { data, isLoading, isError, error, refetch } = useQuery({
    queryKey: ['admin', 'audit-logs', apiParams.toString()],
    queryFn: () => listAuditLogs(apiParams),
    placeholderData: keepPreviousData,
  })

  // Functional update: hamesha taaza URL params se shuru karo, purane snapshot se nahi
  function setParam(name: string, value: string) {
    setParams((prev) => {
      const next = new URLSearchParams(prev)
      if (value) next.set(name, value)
      else next.delete(name)
      if (name !== 'page') next.delete('page')
      return next
    })
  }

  const input = 'rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm'

  return (
    <>
      <PageHeader title={t('audit.title')} subtitle={t('audit.subtitle')} />

      <div className="mb-4 flex flex-wrap items-end gap-2">
        <select
          aria-label={t('audit.colAction')}
          value={params.get('action') ?? ''}
          onChange={(e) => setParam('action', e.target.value)}
          className={`${input} w-full sm:w-auto sm:min-w-[200px] sm:flex-1`}
        >
          <option value="">{t('audit.allActions')}</option>
          {TARGETS.map((target) => (
            <optgroup key={target} label={t(`auditTarget.${target}`)}>
              {ACTIONS[target].map((name) => (
                <option key={name} value={`${target}.${name}`}>
                  {t(`auditAction.${target}.${name}`)}
                </option>
              ))}
            </optgroup>
          ))}
        </select>
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
        isError={isError && !data}
        error={error}
        isEmpty={!!data && data.logs.length === 0}
        emptyIcon={faClipboardList}
        emptyTitle={
          [...params.keys()].some((key) => key !== 'page')
            ? t('dataState.filteredTitle')
            : t('dataState.auditEmptyTitle')
        }
        emptyText={
          [...params.keys()].some((key) => key !== 'page')
            ? t('dataState.filteredText')
            : t('dataState.auditEmptyText')
        }
        onRetry={() => refetch()}
      >
        <div className="overflow-x-auto rounded-2xl bg-white shadow-sm">
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
                <tr key={log._id} className="hover:bg-gray-50">
                  <td className="whitespace-nowrap px-4 py-3 text-gray-600">
                    {formatDateTime(log.createdAt)}
                  </td>
                  <td className="px-4 py-3">
                    <p className="font-medium">{log.actor?.name ?? log.actorEmail}</p>
                    {log.actor && <p className="text-xs text-gray-500">{log.actor.email}</p>}
                  </td>
                  <td className="px-4 py-3">
                    {t(`auditAction.${log.action}`, { defaultValue: log.action })}
                  </td>
                  <td className="px-4 py-3">
                    <p className="text-xs text-gray-500">{t(`auditTarget.${log.targetType}`)}</p>
                    <p>{log.targetLabel ?? log.targetId}</p>
                  </td>
                  <td className="px-4 py-3 text-end">
                    <button
                      onClick={() => setOpen(log)}
                      className="whitespace-nowrap rounded-lg border border-gray-300 px-3 py-1.5 text-xs hover:bg-gray-100"
                    >
                      {t('audit.showChanges')}
                    </button>
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

      {open && <ChangesDialog log={open} onClose={() => setOpen(null)} />}
    </>
  )
}

export default AdminAuditLogPage
