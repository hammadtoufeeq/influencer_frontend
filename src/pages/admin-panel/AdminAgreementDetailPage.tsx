import { useCallback, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import toast from 'react-hot-toast'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faArrowLeft, faScaleBalanced, faTriangleExclamation } from '@fortawesome/free-solid-svg-icons'
import { adminGetAgreement, adminResolveDispute } from '../../api/agreements'
import TermsView from '../../components/agreements/TermsView'
import ConfirmDialog from '../../components/admin-panel/ConfirmDialog'
import DataState from '../../components/admin-panel/DataState'
import HistoryList from '../../components/admin-panel/HistoryList'
import StatusPill from '../../components/admin-panel/StatusPill'
import type { DisputeOutcome } from '../../types/agreement'
import { adminErrorMessage, formatDateTime } from '../../utils/adminFormat'

const card = 'rounded-2xl bg-white p-5 shadow-sm'
const OUTCOMES: DisputeOutcome[] = ['continue', 'complete', 'cancel']

// /admin/agreements/:id -> poora muahida; dispute ho to faisla
function AdminAgreementDetailPage() {
  const { id = '' } = useParams()
  const { t } = useTranslation()
  const queryClient = useQueryClient()
  const [outcome, setOutcome] = useState<DisputeOutcome>('continue')
  const [note, setNote] = useState('')
  const [confirming, setConfirming] = useState(false)
  // Stable rakho: ConfirmDialog har nayi onCancel pe focus Cancel button pe le jata hai
  const closeDialog = useCallback(() => setConfirming(false), [])

  const { data, isLoading, isError, error, refetch } = useQuery({
    queryKey: ['admin', 'agreement', id],
    queryFn: () => adminGetAgreement(id),
  })

  const resolve = useMutation({
    mutationFn: () => adminResolveDispute(id, outcome, note.trim()),
    onSuccess: () => {
      toast.success(t('adminAgreements.resolved'))
      setConfirming(false)
      setNote('')
      queryClient.invalidateQueries({ queryKey: ['admin'] })
    },
    onError: (err) => toast.error(adminErrorMessage(err)),
  })

  const agreement = data?.agreement

  return (
    <>
      <Link to="/admin/agreements" className="mb-4 inline-flex items-center gap-2 text-sm underline">
        <FontAwesomeIcon icon={faArrowLeft} className="rtl:rotate-180" />
        {t('common.back')}
      </Link>
      <DataState
        isLoading={isLoading}
        isError={isError && !data}
        error={error}
        isEmpty={!agreement}
        backTo="/admin/agreements"
        onRetry={() => refetch()}
      >
        {agreement && (
          <div className="space-y-5">
            <div className="flex flex-wrap items-center gap-3">
              <h1 className="text-2xl font-bold">{agreement.terms.title}</h1>
              <StatusPill status={agreement.status} label={t(`agreementStatus.${agreement.status}`)} />
            </div>

            <div className="grid gap-5 md:grid-cols-2">
              {(['business', 'talent'] as const).map((party) => {
                const user = party === 'business' ? agreement.business : agreement.talent
                const name =
                  party === 'business' ? agreement.businessProfile?.companyName : agreement.person?.name
                const signature = agreement.signatures[party]
                return (
                  <section key={party} className={card}>
                    <h2 className="text-sm font-medium text-gray-500">{t(`agreements.party.${party}`)}</h2>
                    <p className="mt-2 font-semibold">{name ?? '—'}</p>
                    {user && <p className="break-all text-sm text-gray-600">{user.name} · {user.email}</p>}
                    <p className="mt-2 text-xs text-gray-500">
                      {signature
                        ? t('adminAgreements.signedVersion', {
                            version: signature.version,
                            date: formatDateTime(signature.signedAt),
                            ip: signature.ip ?? '—',
                          })
                        : t('agreements.notSigned')}
                    </p>
                    {agreement.reviews?.[party] && (
                      <p className="mt-2 text-xs text-gray-600">
                        {t('adminAgreements.reviewGiven', { rating: agreement.reviews[party].rating })}
                        {agreement.reviews[party].comment && ` — ${agreement.reviews[party].comment}`}
                      </p>
                    )}
                  </section>
                )
              })}
            </div>

            {agreement.dispute && (
              <section className={`${card} ${agreement.status === 'disputed' ? 'ring-2 ring-red-200' : ''}`}>
                <h2 className="font-semibold text-red-700">
                  <FontAwesomeIcon icon={faTriangleExclamation} className="me-2" />
                  {t('agreements.disputeBy', {
                    party: t(`agreements.party.${agreement.dispute.openedBy}`),
                    date: formatDateTime(agreement.dispute.openedAt),
                  })}
                </h2>
                <p className="mt-2 whitespace-pre-line text-sm">{agreement.dispute.reason}</p>
                {agreement.dispute.outcome && (
                  <p className="mt-3 text-sm text-gray-700">
                    {t(`agreements.outcome.${agreement.dispute.outcome}`)} — {agreement.dispute.note}
                    {agreement.dispute.resolvedBy && (
                      <span className="block text-xs text-gray-500">
                        {t('claims.reviewed', {
                          name: agreement.dispute.resolvedBy.name,
                          date: formatDateTime(agreement.dispute.resolvedAt),
                        })}
                      </span>
                    )}
                  </p>
                )}
                {agreement.status === 'disputed' && (
                  <div className="mt-4 space-y-3 border-t border-gray-100 pt-4">
                    <fieldset>
                      <legend className="text-sm font-medium">{t('adminAgreements.decision')}</legend>
                      <div className="mt-2 space-y-2">
                        {OUTCOMES.map((option) => (
                          <label key={option} className="flex items-start gap-2 text-sm">
                            <input
                              type="radio"
                              name="outcome"
                              value={option}
                              checked={outcome === option}
                              onChange={() => setOutcome(option)}
                              className="mt-0.5"
                            />
                            <span>
                              <span className="font-medium">{t(`adminAgreements.outcomes.${option}`)}</span>
                              <span className="block text-xs text-gray-500">
                                {t(`adminAgreements.outcomeHints.${option}`)}
                              </span>
                            </span>
                          </label>
                        ))}
                      </div>
                    </fieldset>
                    <textarea
                      rows={3}
                      maxLength={2000}
                      value={note}
                      onChange={(e) => setNote(e.target.value)}
                      placeholder={t('adminAgreements.notePlaceholder')}
                      aria-label={t('adminAgreements.notePlaceholder')}
                      className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
                    />
                    <button
                      onClick={() => setConfirming(true)}
                      disabled={note.trim().length < 3}
                      className="inline-flex items-center gap-2 rounded-lg bg-brand px-4 py-2 text-sm font-medium text-on-brand hover:bg-brand-hover disabled:opacity-50"
                    >
                      <FontAwesomeIcon icon={faScaleBalanced} />
                      {t('adminAgreements.resolve')}
                    </button>
                  </div>
                )}
              </section>
            )}

            <section className={card}>
              <h2 className="mb-3 font-semibold">
                {t('agreements.terms')} ·{' '}
                <span className="font-normal text-gray-500">
                  {t('agreements.versionBy', {
                    version: agreement.version,
                    party: t(`agreements.party.${agreement.proposedBy}`),
                    date: formatDateTime(agreement.proposedAt),
                  })}
                </span>
              </h2>
              <TermsView
                terms={agreement.terms}
                work={agreement.status === 'negotiating' ? undefined : agreement.work}
              />
              {agreement.signedHash && (
                <p className="mt-3 break-all text-xs text-gray-500">
                  {t('agreements.fingerprint')}: <span className="font-mono">{agreement.signedHash}</span>
                </p>
              )}
            </section>

            <HistoryList history={data.history} />

            <ConfirmDialog
              open={confirming}
              title={t('adminAgreements.confirmTitle')}
              tone={outcome === 'cancel' ? 'danger' : 'default'}
              confirmLabel={t('adminAgreements.resolve')}
              isBusy={resolve.isPending}
              onConfirm={() => resolve.mutate()}
              onCancel={closeDialog}
            >
              <p>{t('adminAgreements.confirmBody', { outcome: t(`adminAgreements.outcomes.${outcome}`) })}</p>
            </ConfirmDialog>
          </div>
        )}
      </DataState>
    </>
  )
}

export default AdminAgreementDetailPage
