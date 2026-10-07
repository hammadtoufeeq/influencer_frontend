import { useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import toast from 'react-hot-toast'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import {
  faArrowLeft,
  faArrowUpRightFromSquare,
  faBan,
  faCheck,
  faCopy,
  faKey,
  faPaperPlane,
  faTriangleExclamation,
} from '@fortawesome/free-solid-svg-icons'
import { getAdminClaim } from '../../api/adminPanel'
import { reviewClaim, sendClaimCode } from '../../api/claims'
import Avatar from '../../components/Avatar'
import ConfirmDialog from '../../components/admin-panel/ConfirmDialog'
import DataState from '../../components/admin-panel/DataState'
import HistoryList from '../../components/admin-panel/HistoryList'
import StatusPill from '../../components/admin-panel/StatusPill'
import { adminErrorMessage, formatDate, formatDateTime } from '../../utils/adminFormat'

const OPEN = ['pending', 'code_sent', 'code_verified']
const card = 'rounded-2xl bg-white p-5 shadow-sm'
const button =
  'inline-flex items-center justify-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition disabled:opacity-50'

function AdminClaimDetailPage() {
  const { id = '' } = useParams()
  const { t } = useTranslation()
  const queryClient = useQueryClient()
  const [channelUrl, setChannelUrl] = useState('')
  const [code, setCode] = useState<{ value: string; url: string } | null>(null)
  const [dialog, setDialog] = useState<'approve' | 'reject' | null>(null)
  const [reason, setReason] = useState('')

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ['admin', 'claim', id],
    queryFn: () => getAdminClaim(id),
    staleTime: 0,
  })

  const refresh = () => queryClient.invalidateQueries({ queryKey: ['admin'] })

  const sendCode = useMutation({
    mutationFn: (url: string) => sendClaimCode(id, url),
    onSuccess: ({ code: value, claim }) =>
      setCode({ value, url: claim.verification?.channelUrl ?? '' }),
    onError: (error) => toast.error(adminErrorMessage(error)),
  })

  const review = useMutation({
    mutationFn: (input: { action: 'approve' | 'reject'; reason?: string }) =>
      reviewClaim(id, input.action, input.reason),
    onSuccess: (claim) => {
      toast.success(claim.status === 'approved' ? t('claims.approved') : t('claims.rejected'))
      setDialog(null)
      setReason('')
      queryClient.invalidateQueries({ queryKey: ['person', claim.person.slug] })
      refresh()
    },
    onError: (error) => toast.error(adminErrorMessage(error)),
  })

  async function copy(text: string) {
    try {
      await navigator.clipboard.writeText(text)
      toast.success(t('claims.copied'))
    } catch {
      toast.error(t('claims.copyFailed'))
    }
  }

  const claim = data?.claim
  const selectedUrl =
    channelUrl || claim?.verification?.channelUrl || claim?.evidence.links[0] || ''

  return (
    <>
      <Link to="/admin/claims" className="mb-4 inline-flex items-center gap-2 text-sm underline">
        <FontAwesomeIcon icon={faArrowLeft} className="rtl:rotate-180" />
        {t('common.back')}
      </Link>
      <DataState
        isLoading={isLoading}
        isError={isError}
        isEmpty={!claim}
        emptyText={t('common.notFound')}
        onRetry={() => refetch()}
      >
        {claim && (
          <div className="space-y-5">
            <div className="flex flex-wrap items-center gap-3">
              <h1 className="text-2xl font-bold">
                {t('claims.detailTitle', { name: claim.person.name })}
              </h1>
              <StatusPill status={claim.status} label={t(`claimStatus.${claim.status}`)} />
            </div>

            <div className="grid gap-5 lg:grid-cols-2">
              <section className={card}>
                <h2 className="text-sm font-medium text-gray-500">{t('claims.colPerson')}</h2>
                <div className="mt-3 flex items-center gap-3">
                  <Avatar name={claim.person.name} photoUrl={claim.person.photoUrl} />
                  <div className="min-w-0">
                    <p className="font-semibold">{claim.person.name}</p>
                    {claim.person.headline && (
                      <p className="truncate text-sm text-gray-600">{claim.person.headline}</p>
                    )}
                  </div>
                </div>
                <Link
                  to={`/people/${claim.person.slug}`}
                  className="mt-3 inline-flex items-center gap-2 text-sm underline"
                >
                  {t('common.openPublicProfile')}
                  <FontAwesomeIcon icon={faArrowUpRightFromSquare} className="text-xs" />
                </Link>
              </section>

              <section className={card}>
                <h2 className="text-sm font-medium text-gray-500">{t('claims.claimant')}</h2>
                <div className="mt-3 flex items-center gap-3">
                  <Avatar name={claim.user.name} />
                  <div className="min-w-0">
                    <p className="font-semibold">{claim.user.name}</p>
                    <p className="break-all text-sm text-gray-600">{claim.user.email}</p>
                    <p className="text-xs text-gray-500">
                      {t(`roles.${claim.user.role}`)} ·{' '}
                      {t('claims.joined', { date: formatDate(claim.user.createdAt) })}
                    </p>
                  </div>
                </div>
              </section>
            </div>

            <section className={card}>
              <h2 className="font-semibold">{t('claims.evidence')}</h2>
              <dl className="mt-3 space-y-3 text-sm">
                <div>
                  <dt className="text-xs text-gray-500">{t('claims.officialAccounts')}</dt>
                  {claim.evidence.links.map((link) => (
                    <dd key={link} className="break-all">
                      <a
                        href={link}
                        target="_blank"
                        rel="noopener noreferrer nofollow"
                        className="text-blue-700 underline"
                      >
                        {link}
                      </a>
                    </dd>
                  ))}
                </div>
                {claim.evidence.contactEmail && (
                  <div>
                    <dt className="text-xs text-gray-500">{t('claims.officialEmail')}</dt>
                    <dd className="break-all">{claim.evidence.contactEmail}</dd>
                  </div>
                )}
                {claim.evidence.note && (
                  <div>
                    <dt className="text-xs text-gray-500">{t('claims.note')}</dt>
                    <dd className="whitespace-pre-line">{claim.evidence.note}</dd>
                  </div>
                )}
              </dl>
            </section>

            {/* Code verification aur faisla */}
            <section className={card}>
              <h2 className="font-semibold">{t('claims.verification')}</h2>
              {claim.verification?.codeSentAt && claim.status === 'code_sent' && (
                <p className="mt-3 rounded-lg bg-blue-50 p-3 text-sm text-blue-800">
                  {t('claims.codeSentTo', {
                    url: claim.verification.channelUrl,
                    date: formatDateTime(claim.verification.codeSentAt),
                  })}{' '}
                  {t('claims.attempts', { count: claim.verification.attempts })}
                </p>
              )}
              {claim.status === 'code_verified' && (
                <p className="mt-3 rounded-lg bg-green-50 p-3 text-sm text-green-800">
                  {t('claims.codeVerified', {
                    date: formatDateTime(claim.verification?.verifiedAt),
                  })}
                </p>
              )}
              {claim.status === 'rejected' && claim.rejectionReason && (
                <p className="mt-3 text-sm text-red-700">
                  {t('claims.rejectionReason', { reason: claim.rejectionReason })}
                </p>
              )}
              {claim.reviewedBy && claim.reviewedAt && (
                <p className="mt-2 text-xs text-gray-500">
                  {t('claims.reviewed', {
                    name: claim.reviewedBy.name,
                    date: formatDateTime(claim.reviewedAt),
                  })}
                </p>
              )}

              {code ? (
                <div className="mt-4 space-y-3 rounded-xl border-2 border-dashed border-gray-900 p-4">
                  <p className="text-sm font-medium">{t('claims.codeTitle')}</p>
                  <p className="break-all text-sm text-blue-700">{code.url}</p>
                  <p
                    dir="ltr"
                    className="text-center font-mono text-4xl font-bold tracking-[0.3em]"
                  >
                    {code.value}
                  </p>
                  <div className="flex flex-wrap gap-2">
                    <button
                      onClick={() => copy(code.value)}
                      className={`${button} border border-gray-300 hover:bg-gray-100`}
                    >
                      <FontAwesomeIcon icon={faCopy} />
                      {t('claims.copyCode')}
                    </button>
                    <button
                      onClick={() => {
                        setCode(null)
                        refresh()
                      }}
                      className={`${button} ms-auto bg-gray-900 text-white hover:bg-gray-800`}
                    >
                      <FontAwesomeIcon icon={faPaperPlane} className="rtl:-scale-x-100" />
                      {t('claims.codeDone')}
                    </button>
                  </div>
                  <p className="flex items-center gap-2 text-xs text-amber-700">
                    <FontAwesomeIcon icon={faTriangleExclamation} />
                    {t('claims.codeOnce')}
                  </p>
                </div>
              ) : (
                OPEN.includes(claim.status) && (
                  <div className="mt-4 space-y-3">
                    {(claim.status === 'pending' || claim.status === 'code_sent') && (
                      <div className="flex flex-wrap items-end gap-2">
                        <label className="min-w-0 flex-1">
                          <span className="mb-1 block text-sm font-medium">
                            {t('claims.sendCodeTo')}
                          </span>
                          <select
                            value={selectedUrl}
                            onChange={(e) => setChannelUrl(e.target.value)}
                            className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm"
                          >
                            {claim.evidence.links.map((link) => (
                              <option key={link} value={link}>
                                {link}
                              </option>
                            ))}
                          </select>
                        </label>
                        <button
                          onClick={() => sendCode.mutate(selectedUrl)}
                          disabled={sendCode.isPending || !selectedUrl}
                          className={`${button} bg-gray-900 text-white hover:bg-gray-800`}
                        >
                          <FontAwesomeIcon icon={faKey} />
                          {claim.status === 'pending'
                            ? t('claims.generateCode')
                            : t('claims.generateNewCode')}
                        </button>
                      </div>
                    )}
                    <div className="flex flex-wrap gap-2 border-t border-gray-100 pt-4">
                      <button
                        onClick={() => setDialog('approve')}
                        disabled={claim.status !== 'code_verified'}
                        title={
                          claim.status !== 'code_verified'
                            ? t('claims.approveOnlyAfterCode')
                            : undefined
                        }
                        className={`${button} bg-green-600 text-white hover:bg-green-700`}
                      >
                        <FontAwesomeIcon icon={faCheck} />
                        {t('claims.approve')}
                      </button>
                      <button
                        onClick={() => setDialog('reject')}
                        className={`${button} border border-red-200 text-red-600 hover:bg-red-50`}
                      >
                        <FontAwesomeIcon icon={faBan} />
                        {t('claims.reject')}
                      </button>
                    </div>
                    {claim.status !== 'code_verified' && (
                      <p className="text-xs text-gray-500">{t('claims.approveOnlyAfterCode')}</p>
                    )}
                  </div>
                )
              )}
            </section>

            <HistoryList history={data.history} />

            <ConfirmDialog
              open={dialog === 'approve'}
              title={t('claims.approveTitle')}
              tone="success"
              confirmLabel={t('claims.approve')}
              isBusy={review.isPending}
              onConfirm={() => review.mutate({ action: 'approve' })}
              onCancel={() => setDialog(null)}
            >
              {t('claims.approveBody', { claimant: claim.user.name, person: claim.person.name })}
            </ConfirmDialog>
            <ConfirmDialog
              open={dialog === 'reject'}
              title={t('claims.rejectTitle')}
              tone="danger"
              confirmLabel={t('claims.reject')}
              isBusy={review.isPending}
              onConfirm={() =>
                review.mutate({ action: 'reject', reason: reason.trim() || undefined })
              }
              onCancel={() => setDialog(null)}
            >
              <label htmlFor="reject-reason" className="mb-1 block font-medium text-gray-900">
                {t('claims.rejectReason')}
              </label>
              <textarea
                id="reject-reason"
                rows={3}
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder={t('claims.rejectPlaceholder')}
                className="w-full rounded-lg border border-gray-300 px-3 py-2"
              />
            </ConfirmDialog>
          </div>
        )}
      </DataState>
    </>
  )
}

export default AdminClaimDetailPage
