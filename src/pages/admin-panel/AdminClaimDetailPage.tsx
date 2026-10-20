import { useState } from 'react'
import { taxName } from '../../utils/taxonomy'
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
  faUserCheck,
  faTriangleExclamation,
} from '@fortawesome/free-solid-svg-icons'
import { getAdminClaim } from '../../api/adminPanel'
import { resetClaimOtp, reviewClaim, sendClaimCode, verifyClaimManually } from '../../api/claims'
import Avatar from '../../components/Avatar'
import ConfirmDialog from '../../components/admin-panel/ConfirmDialog'
import DataState from '../../components/admin-panel/DataState'
import HistoryList from '../../components/admin-panel/HistoryList'
import ClaimStatusPill from '../../components/ClaimStatusPill'
import { MAX_OTP_ATTEMPTS, isOpenClaim } from '../../types/claim'
import { adminErrorMessage, formatDate, formatDateTime } from '../../utils/adminFormat'
import { countryName, formatCount, languageName } from '../../utils/format'

const card = 'rounded-2xl bg-white p-5 shadow-sm'
const button =
  'inline-flex items-center justify-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition disabled:opacity-50'

function AdminClaimDetailPage() {
  const { id = '' } = useParams()
  const { t } = useTranslation()
  const queryClient = useQueryClient()
  const [channelUrl, setChannelUrl] = useState('')
  const [code, setCode] = useState<{ value: string; url: string } | null>(null)
  const [dialog, setDialog] = useState<'approve' | 'reject' | 'verify' | null>(null)
  const [reason, setReason] = useState('')

  const { data, isLoading, isError, error, refetch } = useQuery({
    queryKey: ['admin', 'claim', id],
    queryFn: () => getAdminClaim(id),
  })

  // Har action ke baad admin aur talent dono ke claims taaza
  const refresh = () => {
    queryClient.invalidateQueries({ queryKey: ['admin'] })
    queryClient.invalidateQueries({ queryKey: ['claims'] })
  }

  // pending pe naya code; waiting_for_talent / otp_failed pe reset (lock khol kar naya code)
  const sendCode = useMutation({
    mutationFn: ({ url, reset }: { url: string; reset: boolean }) =>
      reset ? resetClaimOtp(id, url) : sendClaimCode(id, url),
    onSuccess: ({ code: value, claim }, { reset }) => {
      setCode({ value, url: claim.verification?.channelUrl ?? '' })
      if (reset) toast.success(t('claimOtp.resetDone'))
      refresh()
    },
    onError: (error) => toast.error(adminErrorMessage(error)),
  })

  const verifyManual = useMutation({
    mutationFn: () => verifyClaimManually(id),
    onSuccess: (claim) => {
      toast.success(t('claimOtp.manualDone'))
      setDialog(null)
      if (claim.person) queryClient.invalidateQueries({ queryKey: ['person', claim.person.slug] })
      refresh()
    },
    onError: (error) => toast.error(adminErrorMessage(error)),
  })

  const review = useMutation({
    mutationFn: (input: { action: 'approve' | 'reject'; reason?: string }) =>
      reviewClaim(id, input.action, input.reason),
    onSuccess: (claim) => {
      toast.success(claim.status === 'approved' ? t('claims.approved') : t('claims.rejected'))
      setDialog(null)
      setReason('')
      if (claim.person) queryClient.invalidateQueries({ queryKey: ['person', claim.person.slug] })
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
  // Profile ya user delete ho chuka ho to bhi page chale
  const personName = claim?.person?.name ?? claim?.requestedName ?? t('claims.deletedProfile')
  const claimantName = claim?.user?.name ?? t('claims.deletedUser')
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
        isError={isError && !data}
        error={error}
        isEmpty={!claim}
        backTo="/admin/claims"
        onRetry={() => refetch()}
      >
        {claim && (
          <div className="space-y-5">
            <div className="flex flex-wrap items-center gap-3">
              <h1 className="text-2xl font-bold">
                {t('claims.detailTitle', { name: personName })}
              </h1>
              <ClaimStatusPill status={claim.status} />
              {claim.isNewProfile && (
                <span className="rounded-full bg-violet-50 px-2.5 py-0.5 text-xs font-medium text-violet-700 ring-1 ring-inset ring-violet-200">
                  {t('newProfile.badge')}
                </span>
              )}
            </div>

            <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
              <section className={card}>
                <h2 className="text-sm font-medium text-gray-500">{t('claims.colPerson')}</h2>
                <div className="mt-3 flex items-center gap-3">
                  <Avatar name={personName} photoUrl={claim.person?.photoUrl} />
                  <div className="min-w-0">
                    <p className="font-semibold">{personName}</p>
                    {claim.person?.headline && (
                      <p className="truncate text-sm text-gray-600">{claim.person.headline}</p>
                    )}
                  </div>
                </div>
                {claim.person?.isDraft ? (
                  <p className="mt-3 text-sm text-violet-700">
                    {t('newProfile.hiddenUntilApproved')}
                  </p>
                ) : claim.person ? (
                  <Link
                    to={`/people/${claim.person.slug}`}
                    className="mt-3 inline-flex items-center gap-2 text-sm underline"
                  >
                    {t('common.openPublicProfile')}
                    <FontAwesomeIcon icon={faArrowUpRightFromSquare} className="text-xs" />
                  </Link>
                ) : (
                  <p className="mt-3 text-sm text-gray-500">{t('claims.deletedProfileHint')}</p>
                )}
              </section>

              <section className={card}>
                <h2 className="text-sm font-medium text-gray-500">{t('claims.claimant')}</h2>
                <div className="mt-3 flex items-center gap-3">
                  <Avatar name={claimantName} />
                  <div className="min-w-0">
                    <p className="font-semibold">{claimantName}</p>
                    {claim.user && (
                      <>
                        <p className="break-all text-sm text-gray-600">{claim.user.email}</p>
                        <p className="text-xs text-gray-500">
                          {t(`roles.${claim.user.role}`)} ·{' '}
                          {t('claims.joined', { date: formatDate(claim.user.createdAt) })}
                        </p>
                      </>
                    )}
                  </div>
                </div>
              </section>
            </div>

            {/* Talent ki khud bheji hui profile: approve se pehle admin ise dekhe */}
            {claim.isNewProfile && claim.person && (
              <section className={`${card} ring-1 ring-violet-200`}>
                <h2 className="font-semibold">{t('newProfile.submittedTitle')}</h2>
                <p className="mt-1 text-sm text-gray-500">{t('newProfile.submittedHelp')}</p>
                <dl className="mt-4 grid gap-4 text-sm sm:grid-cols-2">
                  {[
                    [t('personForm.fullName'), claim.person.name],
                    [t('personForm.headline'), claim.person.headline],
                    [
                      t('newProfile.location'),
                      [claim.person.city, claim.person.country && countryName(claim.person.country)]
                        .filter(Boolean)
                        .join(', '),
                    ],
                    [
                      t('personForm.languages'),
                      claim.person.languages?.map((code) => languageName(code)).join(', '),
                    ],
                    [
                      t('personForm.professions'),
                      claim.person.professions?.map(taxName).join(', '),
                    ],
                    [
                      t('personForm.industries'),
                      claim.person.industries?.map(taxName).join(', '),
                    ],
                    [t('personForm.topics'), claim.person.topics?.map(taxName).join(', ')],
                    [t('personForm.website'), claim.person.websiteUrl],
                  ]
                    .filter(([, value]) => value)
                    .map(([label, value]) => (
                      <div key={label}>
                        <dt className="text-xs text-gray-500">{label}</dt>
                        <dd className="mt-0.5 break-words">{value}</dd>
                      </div>
                    ))}
                </dl>
                {claim.person.bio && (
                  <div className="mt-4 text-sm">
                    <p className="text-xs text-gray-500">{t('personForm.bio')}</p>
                    <p className="mt-0.5 whitespace-pre-line">{claim.person.bio}</p>
                  </div>
                )}
                {!!claim.person.socialAccounts?.length && (
                  <div className="mt-4 text-sm">
                    <p className="text-xs text-gray-500">{t('personForm.social')}</p>
                    <ul className="mt-1 space-y-1">
                      {claim.person.socialAccounts.map((account) => (
                        <li key={account.url} className="flex flex-wrap items-center gap-2">
                          <span className="font-medium">
                            {t(`platform.${account.platform}`, { defaultValue: account.platform })}
                          </span>
                          <a
                            href={account.url}
                            target="_blank"
                            rel="noopener noreferrer nofollow"
                            className="break-all text-blue-700 underline"
                          >
                            {account.url}
                          </a>
                          {account.followers !== undefined && (
                            <span className="text-gray-500">
                              · {t('site.followers', { value: formatCount(account.followers) })}
                            </span>
                          )}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </section>
            )}

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
              {claim.verification?.codeSentAt && claim.status === 'waiting_for_talent' && (
                <div className="mt-3 rounded-lg bg-yellow-50 p-3 text-sm text-yellow-900">
                  <p className="break-words">
                    {t('claims.codeSentTo', {
                      url: claim.verification.channelUrl,
                      date: formatDateTime(claim.verification.codeSentAt),
                    })}
                  </p>
                  {(claim.otpAttempts ?? 0) > 0 && (
                    <p className="mt-1 font-medium">
                      {t('claimOtp.attemptsUsed', {
                        count: claim.otpAttempts,
                        max: MAX_OTP_ATTEMPTS,
                      })}
                      {claim.lastOtpAttemptAt &&
                        ` · ${t('claimOtp.lastAttempt', { date: formatDateTime(claim.lastOtpAttemptAt) })}`}
                    </p>
                  )}
                </div>
              )}
              {claim.status === 'otp_failed' && (
                <div
                  role="alert"
                  className="mt-3 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-800"
                >
                  <p className="font-semibold">
                    <FontAwesomeIcon icon={faLock} className="me-1.5" />
                    {t('claimOtp.lockedTitle')}
                  </p>
                  <p className="mt-1">
                    {t('claimOtp.lockedBody', {
                      count: claim.otpAttempts ?? MAX_OTP_ATTEMPTS,
                      max: MAX_OTP_ATTEMPTS,
                      date: formatDateTime(claim.otpLockedAt),
                    })}
                  </p>
                  <p className="mt-1 text-xs">{t('claimOtp.lockedHint')}</p>
                </div>
              )}
              {(claim.status === 'verified' || claim.status === 'approved') && claim.verifiedAt && (
                <p className="mt-3 rounded-lg bg-green-50 p-3 text-sm text-green-800">
                  <FontAwesomeIcon icon={faUserCheck} className="me-1.5" />
                  {claim.verificationMethod === 'admin_manual'
                    ? t('claimOtp.verifiedByAdmin', {
                        name: claim.verifiedBy?.name ?? t('claimOtp.anAdmin'),
                        date: formatDateTime(claim.verifiedAt),
                      })
                    : t('claimOtp.verifiedByOtp', { date: formatDateTime(claim.verifiedAt) })}
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
                isOpenClaim(claim.status) && (
                  <div className="mt-4 space-y-3">
                    {claim.status !== 'verified' && claim.person && (
                      <div className="flex flex-wrap items-end gap-2">
                        <label className="min-w-0 flex-1 basis-56">
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
                          onClick={() =>
                            sendCode.mutate({ url: selectedUrl, reset: claim.status !== 'pending' })
                          }
                          disabled={sendCode.isPending || !selectedUrl}
                          className={`${button} bg-gray-900 text-white hover:bg-gray-800`}
                        >
                          <FontAwesomeIcon
                            icon={claim.status === 'pending' ? faKey : faRotateRight}
                          />
                          {claim.status === 'pending'
                            ? t('claims.generateCode')
                            : t('claimOtp.resetAndResend')}
                        </button>
                      </div>
                    )}
                    <div className="flex flex-wrap gap-2 border-t border-gray-100 pt-4">
                      {claim.status === 'verified' && claim.person && (
                        <button
                          onClick={() => setDialog('approve')}
                          className={`${button} bg-green-600 text-white hover:bg-green-700`}
                        >
                          <FontAwesomeIcon icon={faCheck} />
                          {t('claims.approve')}
                        </button>
                      )}
                      {claim.person &&
                        (claim.status === 'waiting_for_talent' ||
                          claim.status === 'otp_failed') && (
                          <button
                            onClick={() => setDialog('verify')}
                            className={`${button} border border-green-300 text-green-700 hover:bg-green-50`}
                          >
                            <FontAwesomeIcon icon={faUserCheck} />
                            {t('claimOtp.verifyManually')}
                          </button>
                        )}
                      <button
                        onClick={() => setDialog('reject')}
                        className={`${button} border border-red-200 text-red-600 hover:bg-red-50`}
                      >
                        <FontAwesomeIcon icon={faBan} />
                        {t('claims.reject')}
                      </button>
                    </div>
                    {claim.status === 'pending' && (
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
              {claim.isNewProfile
                ? t('newProfile.approveBody', { claimant: claimantName, person: personName })
                : t('claims.approveBody', { claimant: claimantName, person: personName })}
            </ConfirmDialog>
            <ConfirmDialog
              open={dialog === 'verify'}
              title={t('claimOtp.verifyTitle')}
              tone="success"
              confirmLabel={t('claimOtp.verifyManually')}
              isBusy={verifyManual.isPending}
              onConfirm={() => verifyManual.mutate()}
              onCancel={() => setDialog(null)}
            >
              {t('claimOtp.verifyBody', { claimant: claimantName, person: personName })}
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
