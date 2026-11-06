import { useCallback, useState, type ReactNode } from 'react'
import { Link, useParams } from 'react-router-dom'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import toast from 'react-hot-toast'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faArrowLeft, faArrowUpRightFromSquare, faBan, faCheck } from '@fortawesome/free-solid-svg-icons'
import { getAdminManager, reviewManager } from '../../api/manager'
import Avatar from '../../components/Avatar'
import ConfirmDialog from '../../components/admin-panel/ConfirmDialog'
import DataState from '../../components/admin-panel/DataState'
import HistoryList from '../../components/admin-panel/HistoryList'
import StatusPill from '../../components/admin-panel/StatusPill'
import PermissionChips from '../../components/manager/PermissionChips'
import { adminErrorMessage, formatDateTime } from '../../utils/adminFormat'
import { countryName } from '../../utils/format'
import { PLATFORM_LABELS } from '../../constants/people'

const card = 'rounded-2xl bg-white p-5 shadow-sm'
const button =
  'inline-flex items-center justify-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition disabled:opacity-50'

function Row({ label, children }: { label: string; children?: ReactNode }) {
  if (children === undefined || children === null || children === '') return null
  return (
    <div className="grid gap-1 py-2 sm:grid-cols-[180px_1fr]">
      <dt className="text-sm text-gray-500">{label}</dt>
      <dd className="min-w-0 break-words text-sm">{children}</dd>
    </div>
  )
}

const ExternalLink = ({ href }: { href: string }) => (
  <a href={href} target="_blank" rel="noopener noreferrer nofollow" className="underline">
    {href}
    <FontAwesomeIcon icon={faArrowUpRightFromSquare} className="ms-1.5 text-xs" />
  </a>
)

// /admin/managers/:id -> manager ki details aur proof dekho, approve ya reject
function AdminManagerDetailPage() {
  const { id = '' } = useParams()
  const { t } = useTranslation()
  const queryClient = useQueryClient()
  const [dialog, setDialog] = useState<'approve' | 'reject' | null>(null)
  const [reason, setReason] = useState('')
  const closeDialog = useCallback(() => setDialog(null), [])

  const { data, isLoading, isError, error, refetch } = useQuery({
    queryKey: ['admin', 'manager', id],
    queryFn: () => getAdminManager(id),
  })

  const review = useMutation({
    mutationFn: (input: { action: 'approve' | 'reject'; reason?: string }) =>
      reviewManager(id, input.action, input.reason),
    onSuccess: ({ manager }) => {
      toast.success(manager.status === 'approved' ? t('adminManagers.approved') : t('adminManagers.rejected'))
      setDialog(null)
      setReason('')
      queryClient.invalidateQueries({ queryKey: ['admin'] })
    },
    onError: (err) => toast.error(adminErrorMessage(err)),
  })

  const manager = data?.manager
  const active = data?.representations.filter((r) => r.status === 'active') ?? []
  const name = manager?.owner?.name ?? t('claims.deletedUser')

  return (
    <>
      <Link to="/admin/managers" className="mb-4 inline-flex items-center gap-2 text-sm underline">
        <FontAwesomeIcon icon={faArrowLeft} className="rtl:rotate-180" />
        {t('common.back')}
      </Link>
      <DataState
        isLoading={isLoading}
        isError={isError && !data}
        error={error}
        isEmpty={!manager}
        backTo="/admin/managers"
        onRetry={() => refetch()}
      >
        {manager && (
          <div className="space-y-5">
            <div className="flex flex-wrap items-center gap-3">
              <h1 className="text-2xl font-bold">{name}</h1>
              <StatusPill status={manager.status} label={t(`managerStatus.${manager.status}`)} />
            </div>

            <div className="grid gap-5 lg:grid-cols-[1fr_320px]">
              <section className={card}>
                <h2 className="font-semibold">{t('dashNav.managerDetails')}</h2>
                <dl className="mt-2 divide-y divide-gray-100">
                  <Row label={t('manager.fields.agencyName')}>{manager.agencyName || '—'}</Row>
                  <Row label={t('personForm.social')}>
                    {manager.socialAccounts?.length > 0 && (
                      <ul className="space-y-1">
                        {manager.socialAccounts.map((account) => (
                          <li key={account.url}>
                            <span className="me-1.5 text-gray-500">{PLATFORM_LABELS[account.platform]}:</span>
                            <ExternalLink href={account.url} />
                          </li>
                        ))}
                      </ul>
                    )}
                  </Row>
                  <Row label={t('personForm.website')}>
                    {manager.websiteUrl && <ExternalLink href={manager.websiteUrl} />}
                  </Row>
                  <Row label={t('business.fields.country')}>
                    {[manager.city, countryName(manager.country)].filter(Boolean).join(', ')}
                  </Row>
                  <Row label={t('business.fields.contactPhone')}>{manager.contactPhone}</Row>
                  <Row label={t('manager.fields.talentsCount')}>
                    {manager.talentsCount !== undefined ? String(manager.talentsCount) : undefined}
                  </Row>
                  <Row label={t('manager.fields.bio')}>
                    {manager.bio && <span className="whitespace-pre-line">{manager.bio}</span>}
                  </Row>
                  <Row label={t('business.fields.proofLinks')}>
                    {manager.proofLinks.length > 0 && (
                      <ul className="space-y-1">
                        {manager.proofLinks.map((link) => (
                          <li key={link}>
                            <ExternalLink href={link} />
                          </li>
                        ))}
                      </ul>
                    )}
                  </Row>
                </dl>
              </section>

              <section className={card}>
                <h2 className="text-sm font-medium text-gray-500">{t('businesses.owner')}</h2>
                {manager.owner ? (
                  <>
                    <p className="mt-3 font-semibold">{manager.owner.name}</p>
                    <p className="break-all text-sm text-gray-600">{manager.owner.email}</p>
                    <p className="mt-1 text-xs text-gray-500">
                      {t('businesses.joined', { date: formatDateTime(manager.owner.createdAt) })}
                    </p>
                  </>
                ) : (
                  <p className="mt-3 text-sm text-gray-500">{t('claims.deletedUser')}</p>
                )}
                <p className="mt-3 text-xs text-gray-500">
                  {t('businesses.submittedOn', { date: formatDateTime(manager.submittedAt) })}
                </p>
              </section>
            </div>

            <section className={card}>
              <h2 className="font-semibold">{t('businesses.verification')}</h2>
              <p className="mt-2 text-sm text-gray-600">{t('adminManagers.checkHint')}</p>
              {manager.status === 'rejected' && manager.rejectionReason && (
                <p className="mt-3 text-sm text-red-700">
                  {t('claims.rejectionReason', { reason: manager.rejectionReason })}
                </p>
              )}
              {manager.reviewedBy && manager.reviewedAt && (
                <p className="mt-2 text-xs text-gray-500">
                  {t('claims.reviewed', { name: manager.reviewedBy.name, date: formatDateTime(manager.reviewedAt) })}
                </p>
              )}
              <div className="mt-4 flex flex-wrap gap-2">
                {manager.status !== 'approved' && (
                  <button onClick={() => setDialog('approve')} className={`${button} bg-green-600 text-white hover:bg-green-700`}>
                    <FontAwesomeIcon icon={faCheck} />
                    {t('adminManagers.approve')}
                  </button>
                )}
                {manager.status !== 'rejected' && (
                  <button
                    onClick={() => setDialog('reject')}
                    className={`${button} border border-red-200 text-red-600 hover:bg-red-50`}
                  >
                    <FontAwesomeIcon icon={faBan} />
                    {manager.status === 'approved' ? t('businesses.revoke') : t('businesses.reject')}
                  </button>
                )}
              </div>
            </section>

            <section className={card}>
              <h2 className="font-semibold">{t('adminManagers.talentsTitle', { count: active.length })}</h2>
              {data.representations.length === 0 ? (
                <p className="mt-2 text-sm text-gray-500">{t('adminManagers.noTalents')}</p>
              ) : (
                <ul className="mt-3 divide-y divide-gray-100">
                  {data.representations.map((rep) => (
                    <li key={rep._id} className="flex flex-wrap items-center gap-3 py-2.5">
                      <Avatar name={rep.person?.name ?? '?'} photoUrl={rep.person?.photoUrl} size="sm" />
                      <div className="min-w-0 flex-1">
                        {rep.person ? (
                          <Link to={`/people/${rep.person.slug}`} className="text-sm font-medium underline">
                            {rep.person.name}
                          </Link>
                        ) : (
                          <span className="text-sm text-gray-500">{t('claims.deletedProfile')}</span>
                        )}
                        {rep.status === 'active' && (
                          <div className="mt-1">
                            <PermissionChips permissions={rep.permissions} />
                          </div>
                        )}
                      </div>
                      <StatusPill status={rep.status} label={t(`manager.status.${rep.status}`)} />
                    </li>
                  ))}
                </ul>
              )}
            </section>

            <HistoryList history={data.history} />

            <ConfirmDialog
              open={dialog === 'approve'}
              title={t('adminManagers.approveTitle')}
              tone="success"
              confirmLabel={t('adminManagers.approve')}
              isBusy={review.isPending}
              onConfirm={() => review.mutate({ action: 'approve' })}
              onCancel={closeDialog}
            >
              {t('adminManagers.approveBody', { name })}
            </ConfirmDialog>
            <ConfirmDialog
              open={dialog === 'reject'}
              title={t('adminManagers.rejectTitle')}
              tone="danger"
              confirmLabel={manager.status === 'approved' ? t('businesses.revoke') : t('businesses.reject')}
              isBusy={review.isPending}
              onConfirm={() => review.mutate({ action: 'reject', reason: reason.trim() || undefined })}
              onCancel={closeDialog}
            >
              {manager.status === 'approved' && active.length > 0 && (
                <p className="mb-3 rounded-lg bg-amber-50 px-3 py-2 text-sm text-amber-800">
                  {t('adminManagers.revokeWarning', { count: active.length })}
                </p>
              )}
              <label htmlFor="reject-reason" className="mb-1 block font-medium text-gray-900">
                {t('businesses.rejectReason')}
              </label>
              <textarea
                id="reject-reason"
                rows={3}
                maxLength={500}
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder={t('adminManagers.rejectPlaceholder')}
                className="w-full rounded-lg border border-gray-300 px-3 py-2"
              />
            </ConfirmDialog>
          </div>
        )}
      </DataState>
    </>
  )
}

export default AdminManagerDetailPage
