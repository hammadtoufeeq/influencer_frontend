import { useCallback, useState, type ReactNode } from 'react'
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
  faLock,
  faPaperPlane,
  faRotateRight,
  faTriangleExclamation,
  faUserCheck,
} from '@fortawesome/free-solid-svg-icons'
import {
  getAdminBusiness,
  resetBusinessOtp,
  reviewBusiness,
  sendBusinessCode,
  verifyBusinessManually,
} from '../../api/business'
import ConfirmDialog from '../../components/admin-panel/ConfirmDialog'
import DataState from '../../components/admin-panel/DataState'
import HistoryList from '../../components/admin-panel/HistoryList'
import StatusPill from '../../components/admin-panel/StatusPill'
import { MAX_BUSINESS_OTP_ATTEMPTS, isOpenBusiness } from '../../types/business'
import { adminErrorMessage, formatDateTime } from '../../utils/adminFormat'
import { countryName } from '../../utils/format'

const card = 'rounded-2xl bg-white p-5 shadow-sm'
const button =
  'inline-flex items-center justify-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition disabled:opacity-50'

type Dialog = 'approve' | 'reject' | 'verify'

function Row({ label, children }: { label: string; children?: ReactNode }) {
  if (!children) return null
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

// /admin/businesses/:id -> details dekho, code bhejo, code sahi hone pe approve (ya reject)
function AdminBusinessDetailPage() {
  const { id = '' } = useParams()
  const { t } = useTranslation()
  const queryClient = useQueryClient()
  const [dialog, setDialog] = useState<Dialog | null>(null)
  const [reason, setReason] = useState('')
  const [channel, setChannel] = useState('')
  // Naya code sirf ek dafa milta hai: admin ke "Done" dabane tak dikhao
  const [code, setCode] = useState<{ value: string; channel: string } | null>(null)
  // Stable rakho: ConfirmDialog har nayi onCancel pe focus Cancel button pe le jata hai
  const closeDialog = useCallback(() => setDialog(null), [])

  const { data, isLoading, isError, error, refetch } = useQuery({
    queryKey: ['admin', 'business', id],
    queryFn: () => getAdminBusiness(id),
  })

  const refresh = () => queryClient.invalidateQueries({ queryKey: ['admin'] })

  // pending pe naya code; waiting_for_business / otp_failed pe reset (lock khol kar naya code)
  const sendCode = useMutation({
    mutationFn: ({ to, reset }: { to: string; reset: boolean }) =>
      reset ? resetBusinessOtp(id, to) : sendBusinessCode(id, to),
    onSuccess: ({ code: value, business }, { reset }) => {
      setCode({ value, channel: business.verification?.channel ?? '' })
      if (reset) toast.success(t('businesses.resetDone'))
      refresh()
    },
    onError: (err) => toast.error(adminErrorMessage(err)),
  })

  const verifyManual = useMutation({
    mutationFn: () => verifyBusinessManually(id),
    onSuccess: () => {
      toast.success(t('businesses.manualDone'))
      setDialog(null)
      refresh()
    },
    onError: (err) => toast.error(adminErrorMessage(err)),
  })

  const review = useMutation({
    mutationFn: (input: { action: 'approve' | 'reject'; reason?: string }) =>
      reviewBusiness(id, input.action, input.reason),
    onSuccess: (business) => {
      toast.success(
        business.status === 'approved' ? t('businesses.approved') : t('businesses.rejected'),
      )
      setDialog(null)
      setReason('')
      refresh()
    },
    onError: (err) => toast.error(adminErrorMessage(err)),
  })

  async function copy(text: string) {
    try {
      await navigator.clipboard.writeText(text)
      toast.success(t('claims.copied'))
    } catch {
      toast.error(t('claims.copyFailed'))
    }
  }

  const business = data?.business
  const channels = data?.channels ?? []
  const selected = channel || business?.verification?.channel || channels[0] || ''

  return (
    <>
      <Link to="/admin/businesses" className="mb-4 inline-flex items-center gap-2 text-sm underline">
        <FontAwesomeIcon icon={faArrowLeft} className="rtl:rotate-180" />
        {t('common.back')}
      </Link>
      <DataState
        isLoading={isLoading}
        isError={isError && !data}
        error={error}
        isEmpty={!business}
        backTo="/admin/businesses"
        onRetry={() => refetch()}
      >
        {business && (
          <div className="space-y-5">
            <div className="flex flex-wrap items-center gap-3">
              <h1 className="text-2xl font-bold">{business.companyName}</h1>
              <StatusPill status={business.status} label={t(`businessStatus.${business.status}`)} />
            </div>

            <div className="grid gap-5 lg:grid-cols-[1fr_320px]">
              <section className={card}>
                <h2 className="font-semibold">{t('businesses.details')}</h2>
                <dl className="mt-2 divide-y divide-gray-100">
                  <Row label={t('business.fields.websiteUrl')}>
                    <ExternalLink href={business.websiteUrl} />
                  </Row>
                  <Row label={t('business.fields.industry')}>{business.industry}</Row>
                  <Row label={t('business.fields.companySize')}>
                    {business.companySize &&
                      t('business.fields.employees', { size: business.companySize })}
                  </Row>
                  <Row label={t('business.fields.registrationNumber')}>
                    {business.registrationNumber}
                  </Row>
                  <Row label={t('business.fields.country')}>
                    {[business.city, countryName(business.country)].filter(Boolean).join(', ')}
                  </Row>
                  <Row label={t('business.fields.contactPhone')}>{business.contactPhone}</Row>
                  <Row label={t('business.fields.description')}>
                    {business.description && (
                      <span className="whitespace-pre-line">{business.description}</span>
                    )}
                  </Row>
                  <Row label={t('business.fields.proofLinks')}>
                    {business.proofLinks.length > 0 && (
                      <ul className="space-y-1">
                        {business.proofLinks.map((link) => (
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
                {business.owner ? (
                  <>
                    <p className="mt-3 font-semibold">{business.owner.name}</p>
                    <p className="break-all text-sm text-gray-600">{business.owner.email}</p>
                    <p className="mt-1 text-xs text-gray-500">
                      {t('businesses.joined', { date: formatDateTime(business.owner.createdAt) })}
                    </p>
                  </>
                ) : (
                  <p className="mt-3 text-sm text-gray-500">{t('claims.deletedUser')}</p>
                )}
                <p className="mt-3 text-xs text-gray-500">
                  {t('businesses.submittedOn', { date: formatDateTime(business.submittedAt) })}
                </p>
              </section>
            </div>

            {/* Tasdeeq: code bhejo -> business daale -> approve */}
            <section className={card}>
              <h2 className="font-semibold">{t('businesses.verification')}</h2>

              {business.status === 'waiting_for_business' && business.verification?.codeSentAt && (
                <p className="mt-3 text-sm text-gray-700">
                  {t('claims.codeSentTo', {
                    url: business.verification.channel,
                    date: formatDateTime(business.verification.codeSentAt),
                  })}{' '}
                  {t('claimOtp.attemptsUsed', {
                    count: business.otpAttempts ?? 0,
                    max: MAX_BUSINESS_OTP_ATTEMPTS,
                  })}
                </p>
              )}
              {business.status === 'otp_failed' && (
                <div className="mt-3 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-800">
                  <p className="font-medium">
                    <FontAwesomeIcon icon={faLock} className="me-1.5" />
                    {t('businesses.lockedTitle')}
                  </p>
                  <p className="mt-1">
                    {t('businesses.lockedHint', {
                      date: formatDateTime(business.otpLockedAt),
                    })}
                  </p>
                </div>
              )}
              {business.verifiedAt && (
                <p className="mt-3 text-sm text-green-700">
                  {business.verificationMethod === 'admin_manual'
                    ? t('claimOtp.verifiedByAdmin', {
                        name: business.verifiedBy?.name ?? t('claimOtp.anAdmin'),
                        date: formatDateTime(business.verifiedAt),
                      })
                    : t('businesses.verifiedByOtp', {
                        date: formatDateTime(business.verifiedAt),
                      })}
                </p>
              )}
              {business.status === 'rejected' && business.rejectionReason && (
                <p className="mt-3 text-sm text-red-700">
                  {t('claims.rejectionReason', { reason: business.rejectionReason })}
                </p>
              )}
              {business.reviewedBy && business.reviewedAt && (
                <p className="mt-2 text-xs text-gray-500">
                  {t('claims.reviewed', {
                    name: business.reviewedBy.name,
                    date: formatDateTime(business.reviewedAt),
                  })}
                </p>
              )}

              {code ? (
                <div className="mt-4 space-y-3 rounded-xl border-2 border-dashed border-gray-900 p-4">
                  <p className="text-sm font-medium">{t('businesses.codeTitle')}</p>
                  <p className="break-all text-sm text-blue-700">{code.channel}</p>
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
                      onClick={() => setCode(null)}
                      className={`${button} ms-auto bg-brand text-on-brand hover:bg-brand-hover`}
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
                <div className="mt-4 space-y-3">
                  {isOpenBusiness(business.status) && business.status !== 'code_verified' && (
                    <div className="flex flex-wrap items-end gap-2">
                      <label className="min-w-0 flex-1 basis-56">
                        <span className="mb-1 block text-sm font-medium">
                          {t('claims.sendCodeTo')}
                        </span>
                        <select
                          value={selected}
                          onChange={(e) => setChannel(e.target.value)}
                          className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm"
                        >
                          {channels.map((option) => (
                            <option key={option} value={option}>
                              {option}
                            </option>
                          ))}
                        </select>
                      </label>
                      <button
                        onClick={() =>
                          sendCode.mutate({ to: selected, reset: business.status !== 'pending' })
                        }
                        disabled={sendCode.isPending || !selected}
                        className={`${button} bg-brand text-on-brand hover:bg-brand-hover`}
                      >
                        <FontAwesomeIcon
                          icon={business.status === 'pending' ? faKey : faRotateRight}
                        />
                        {business.status === 'pending'
                          ? t('claims.generateCode')
                          : t('claimOtp.resetAndResend')}
                      </button>
                    </div>
                  )}
                  <div className="flex flex-wrap gap-2 border-t border-gray-100 pt-4">
                    {business.status === 'code_verified' && (
                      <button
                        onClick={() => setDialog('approve')}
                        className={`${button} bg-green-600 text-white hover:bg-green-700`}
                      >
                        <FontAwesomeIcon icon={faCheck} />
                        {t('businesses.approve')}
                      </button>
                    )}
                    {(business.status === 'waiting_for_business' ||
                      business.status === 'otp_failed') && (
                      <button
                        onClick={() => setDialog('verify')}
                        className={`${button} border border-green-300 text-green-700 hover:bg-green-50`}
                      >
                        <FontAwesomeIcon icon={faUserCheck} />
                        {t('claimOtp.verifyManually')}
                      </button>
                    )}
                    {business.status !== 'rejected' && (
                      <button
                        onClick={() => setDialog('reject')}
                        className={`${button} border border-red-200 text-red-600 hover:bg-red-50`}
                      >
                        <FontAwesomeIcon icon={faBan} />
                        {business.status === 'approved'
                          ? t('businesses.revoke')
                          : t('businesses.reject')}
                      </button>
                    )}
                  </div>
                  {business.status === 'pending' && (
                    <p className="text-xs text-gray-500">{t('businesses.approveOnlyAfterCode')}</p>
                  )}
                </div>
              )}
            </section>

            <HistoryList history={data.history} />

            <ConfirmDialog
              open={dialog === 'approve'}
              title={t('businesses.approveTitle')}
              tone="success"
              confirmLabel={t('businesses.approve')}
              isBusy={review.isPending}
              onConfirm={() => review.mutate({ action: 'approve' })}
              onCancel={closeDialog}
            >
              {t('businesses.approveBody', { name: business.companyName })}
            </ConfirmDialog>
            <ConfirmDialog
              open={dialog === 'verify'}
              title={t('businesses.verifyTitle')}
              tone="success"
              confirmLabel={t('claimOtp.verifyManually')}
              isBusy={verifyManual.isPending}
              onConfirm={() => verifyManual.mutate()}
              onCancel={closeDialog}
            >
              {t('businesses.verifyBody', { name: business.companyName })}
            </ConfirmDialog>
            <ConfirmDialog
              open={dialog === 'reject'}
              title={t('businesses.rejectTitle')}
              tone="danger"
              confirmLabel={
                business.status === 'approved' ? t('businesses.revoke') : t('businesses.reject')
              }
              isBusy={review.isPending}
              onConfirm={() =>
                review.mutate({ action: 'reject', reason: reason.trim() || undefined })
              }
              onCancel={closeDialog}
            >
              <label htmlFor="reject-reason" className="mb-1 block font-medium text-gray-900">
                {t('businesses.rejectReason')}
              </label>
              <textarea
                id="reject-reason"
                rows={3}
                maxLength={500}
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder={t('businesses.rejectPlaceholder')}
                className="w-full rounded-lg border border-gray-300 px-3 py-2"
              />
            </ConfirmDialog>
          </div>
        )}
      </DataState>
    </>
  )
}

export default AdminBusinessDetailPage
