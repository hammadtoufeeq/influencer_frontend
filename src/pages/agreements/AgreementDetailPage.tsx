import { useCallback, useState, type FormEvent } from 'react'
import { useTranslation } from 'react-i18next'
import { Link, useParams } from 'react-router-dom'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import toast from 'react-hot-toast'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import {
  faArrowLeft,
  faCheck,
  faClockRotateLeft,
  faFilePdf,
  faFlag,
  faPen,
  faTriangleExclamation,
  faTruckFast,
  faUserTie,
  faXmark,
} from '@fortawesome/free-solid-svg-icons'
import {
  approveMilestone,
  cancelAgreement,
  deliverMilestone,
  openDispute,
  reviewAgreement,
  updateAgreementTerms,
} from '../../api/agreements'
import { agreementQuery } from '../../api/queries'
import AgreementDocument from '../../components/agreements/AgreementDocument'
import SignPanel from '../../components/agreements/SignPanel'
import Stars from '../../components/agreements/Stars'
import TermsForm from '../../components/agreements/TermsForm'
import TermsView from '../../components/agreements/TermsView'
import ConfirmDialog from '../../components/admin-panel/ConfirmDialog'
import DataState from '../../components/admin-panel/DataState'
import StatusPill from '../../components/admin-panel/StatusPill'
import type { Agreement, AgreementParty, AgreementTerms } from '../../types/agreement'
import { getApiError } from '../../utils/apiError'
import { formatDateTime } from '../../utils/adminFormat'

const card = 'rounded-2xl bg-white p-5 shadow-sm'
const button =
  'inline-flex items-center justify-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition disabled:opacity-50'

// Ek milestone pe talent / business ka action (deliver, approve). Sign ke baad
// business kaam wapas "changes" ke liye nahi bhej sakta
type MilestoneDialog =
  | { kind: 'deliver'; index: number }
  | { kind: 'approve'; index: number }

function ReviewForm({ agreement }: { agreement: Agreement }) {
  const { t } = useTranslation()
  const queryClient = useQueryClient()
  const [rating, setRating] = useState(0)
  const [comment, setComment] = useState('')

  const save = useMutation({
    mutationFn: () => reviewAgreement(agreement._id, rating, comment.trim() || undefined),
    onSuccess: (updated) => {
      toast.success(t('agreements.reviewSaved'))
      queryClient.setQueryData(agreementQuery(agreement._id).queryKey, (old) =>
        old ? { ...old, agreement: updated } : old,
      )
    },
    onError: (err) => toast.error(getApiError(err).message),
  })

  function handleSubmit(e: FormEvent) {
    e.preventDefault()
    if (rating) save.mutate()
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <Stars value={rating} onChange={setRating} size="text-2xl" />
      <textarea
        rows={3}
        maxLength={1000}
        value={comment}
        onChange={(e) => setComment(e.target.value)}
        placeholder={t('agreements.reviewPlaceholder')}
        className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
      />
      <button
        type="submit"
        disabled={!rating || save.isPending}
        className={`${button} bg-brand text-on-brand hover:bg-brand-hover`}
      >
        {save.isPending ? t('common.saving') : t('agreements.submitReview')}
      </button>
    </form>
  )
}

// /agreements/:id -> shartein, sign, milestones, dispute, review
function AgreementDetailPage() {
  const { id = '' } = useParams()
  const { t } = useTranslation()
  const queryClient = useQueryClient()
  const query = agreementQuery(id)
  const { data, isLoading, isError, error, refetch } = useQuery(query)
  const [editing, setEditing] = useState(false)
  const [termErrors, setTermErrors] = useState<Record<string, string>>({})
  const [showHistory, setShowHistory] = useState(false)
  const [milestoneDialog, setMilestoneDialog] = useState<MilestoneDialog | null>(null)
  const [dialog, setDialog] = useState<'cancel' | 'dispute' | null>(null)
  const [note, setNote] = useState('')
  const [link, setLink] = useState('')

  // Stable rakho: ConfirmDialog har nayi onCancel pe focus Cancel button pe le jata hai
  const closeDialogs = useCallback(() => {
    setMilestoneDialog(null)
    setDialog(null)
    setNote('')
    setLink('')
  }, [])

  // Server ka jawab hi naya sach: cache foran update
  const apply = (agreement: Agreement) => {
    queryClient.setQueryData(query.queryKey, (old) => (old ? { ...old, agreement } : old))
    queryClient.invalidateQueries({ queryKey: ['agreements', 'mine'] })
  }
  const fail = (err: unknown) => toast.error(getApiError(err).message)

  const counter = useMutation({
    mutationFn: (terms: AgreementTerms) => updateAgreementTerms(id, terms),
    onMutate: () => setTermErrors({}),
    onSuccess: (agreement) => {
      apply(agreement)
      setEditing(false)
      toast.success(t('agreements.counterSent'))
    },
    onError: (err) => {
      const { message, fields } = getApiError(err)
      setTermErrors(
        Object.fromEntries(Object.entries(fields).map(([k, v]) => [k.replace(/^terms\./, ''), v])),
      )
      toast.error(message)
    },
  })

  const milestone = useMutation({
    mutationFn: (action: MilestoneDialog) => {
      if (action.kind === 'deliver') return deliverMilestone(id, action.index, note.trim(), link.trim() || undefined)
      return approveMilestone(id, action.index)
    },
    onSuccess: (agreement, action) => {
      apply(agreement)
      closeDialogs()
      toast.success(
        agreement.status === 'completed'
          ? t('agreements.completedToast')
          : t(`agreements.toast.${action.kind}`),
      )
    },
    onError: fail,
  })

  const cancel = useMutation({
    mutationFn: () => cancelAgreement(id, note.trim() || undefined),
    onSuccess: (agreement) => {
      apply(agreement)
      closeDialogs()
      toast.success(t('agreements.cancelledToast'))
    },
    onError: fail,
  })

  const dispute = useMutation({
    mutationFn: () => openDispute(id, note.trim()),
    onSuccess: (agreement) => {
      apply(agreement)
      closeDialogs()
      toast.success(t('agreements.disputeOpened'))
    },
    onError: fail,
  })

  const agreement = data?.agreement
  const side: AgreementParty = data?.side ?? 'talent'
  const otherSide: AgreementParty = side === 'business' ? 'talent' : 'business'
  const otherName =
    side === 'business' ? agreement?.person?.name : agreement?.businessProfile?.companyName

  // Milestone ke neeche us waqt ke buttons
  const milestoneActions = (index: number) => {
    if (!agreement || agreement.status !== 'active') return null
    const work = agreement.work[index]
    if (side === 'talent' && work?.status === 'pending') {
      return (
        <div className="mt-2 flex justify-end">
          <button
            onClick={() => setMilestoneDialog({ kind: 'deliver', index })}
            className={`${button} bg-brand text-on-brand hover:bg-brand-hover`}
          >
            <FontAwesomeIcon icon={faTruckFast} />
            {t('agreements.deliver')}
          </button>
        </div>
      )
    }
    if (side === 'business' && work?.status === 'delivered') {
      return (
        <div className="mt-2 flex flex-wrap justify-end gap-2">
          <button
            onClick={() => setMilestoneDialog({ kind: 'approve', index })}
            className={`${button} bg-green-600 text-white hover:bg-green-700`}
          >
            <FontAwesomeIcon icon={faCheck} />
            {t('agreements.approve')}
          </button>
        </div>
      )
    }
    return null
  }

  return (
    <div className="mx-auto max-w-4xl">
      <Link to="/agreements" className="mb-4 inline-flex items-center gap-2 text-sm underline print:hidden">
        <FontAwesomeIcon icon={faArrowLeft} className="rtl:rotate-180" />
        {t('agreements.backToList')}
      </Link>
      <DataState
        isLoading={isLoading}
        isError={isError && !data}
        error={error}
        isEmpty={!agreement}
        backTo="/agreements"
        onRetry={() => refetch()}
      >
        {agreement && (
          <>
            <AgreementDocument agreement={agreement} />
            <div className="space-y-5 print:hidden">
              {data?.byManager && (
                <p className="flex items-center gap-2 rounded-xl bg-violet-50 px-4 py-3 text-sm text-violet-800">
                  <FontAwesomeIcon icon={faUserTie} />
                  {t('agreements.actingAsManager', { name: agreement.person?.name ?? '—' })}
                </p>
              )}
              {/* Upar: naam, halat, PDF */}
              <section className={card}>
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <h1 className="text-2xl font-bold">{agreement.terms.title}</h1>
                      <StatusPill
                        status={agreement.status}
                        label={t(`agreementStatus.${agreement.status}`)}
                      />
                    </div>
                    <p className="mt-1 text-sm text-gray-600">
                      {t(`agreements.with.${side}`, { name: otherName ?? '—' })} ·{' '}
                      {t('agreements.versionBy', {
                        version: agreement.version,
                        party: t(`agreements.party.${agreement.proposedBy}`),
                        date: formatDateTime(agreement.proposedAt),
                      })}
                    </p>
                  </div>
                  <button
                    onClick={() => window.print()}
                    className={`${button} border border-gray-300 hover:bg-gray-100`}
                  >
                    <FontAwesomeIcon icon={faFilePdf} />
                    {t('agreements.downloadPdf')}
                  </button>
                </div>

                {/* Halat ke hisaab se paigham */}
                {agreement.status === 'negotiating' && (
                  <p className="mt-4 rounded-xl bg-amber-50 p-3 text-sm text-amber-900">
                    {agreement.proposedBy === side
                      ? t('agreements.banner.waitingForOther', { name: otherName ?? '' })
                      : t('agreements.banner.reviewTerms', { name: otherName ?? '' })}
                  </p>
                )}
                {agreement.status === 'active' && (
                  <p className="mt-4 rounded-xl bg-green-50 p-3 text-sm text-green-800">
                    {t(`agreements.banner.active.${side}`, {
                      date: formatDateTime(agreement.activatedAt),
                    })}
                  </p>
                )}
                {agreement.status === 'completed' && (
                  <p className="mt-4 rounded-xl bg-green-50 p-3 text-sm text-green-800">
                    {t('agreements.banner.completed', { date: formatDateTime(agreement.completedAt) })}
                  </p>
                )}
                {agreement.status === 'cancelled' && (
                  <p className="mt-4 rounded-xl bg-gray-100 p-3 text-sm text-gray-700">
                    {t(`agreements.banner.cancelledBy.${agreement.cancelledBy ?? 'business'}`, {
                      date: formatDateTime(agreement.cancelledAt),
                    })}
                    {agreement.cancelReason && <> {t('agreements.reason', { reason: agreement.cancelReason })}</>}
                  </p>
                )}
                {agreement.dispute && (
                  <div
                    className={`mt-4 rounded-xl p-3 text-sm ${
                      agreement.status === 'disputed' ? 'bg-red-50 text-red-800' : 'bg-gray-50 text-gray-700'
                    }`}
                  >
                    <p className="font-medium">
                      <FontAwesomeIcon icon={faTriangleExclamation} className="me-1.5" />
                      {t('agreements.disputeBy', {
                        party: t(`agreements.party.${agreement.dispute.openedBy}`),
                        date: formatDateTime(agreement.dispute.openedAt),
                      })}
                    </p>
                    <p className="mt-1 whitespace-pre-line">{agreement.dispute.reason}</p>
                    {agreement.dispute.outcome ? (
                      <p className="mt-2">
                        {t(`agreements.outcome.${agreement.dispute.outcome}`)}{' '}
                        {agreement.dispute.note && `— ${agreement.dispute.note}`}
                      </p>
                    ) : (
                      <p className="mt-2">{t('agreements.disputeWaiting')}</p>
                    )}
                  </div>
                )}
              </section>

              {/* Shartein (ya counter-offer ka form) */}
              <section className={card}>
                <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
                  <h2 className="font-semibold">{t('agreements.terms')}</h2>
                  {agreement.status === 'negotiating' && !editing && (
                    <button
                      onClick={() => setEditing(true)}
                      className={`${button} border border-gray-300 hover:bg-gray-100`}
                    >
                      <FontAwesomeIcon icon={faPen} />
                      {t('agreements.proposeChanges')}
                    </button>
                  )}
                </div>
                {editing ? (
                  <>
                    <p className="mb-4 rounded-xl bg-gray-50 p-3 text-sm text-gray-700">
                      {t('agreements.counterHint')}
                    </p>
                    <TermsForm
                      initial={agreement.terms}
                      errors={termErrors}
                      isSaving={counter.isPending}
                      submitLabel={t('agreements.sendChanges')}
                      onSubmit={(terms) => counter.mutate(terms)}
                      onCancel={() => setEditing(false)}
                    />
                  </>
                ) : (
                  <>
                    <TermsView
                      terms={agreement.terms}
                      work={agreement.status === 'negotiating' ? undefined : agreement.work}
                      milestoneActions={milestoneActions}
                    />
                  </>
                )}
              </section>

              {agreement.status === 'negotiating' && !editing && (
                <SignPanel agreement={agreement} side={side} onSigned={apply} />
              )}

              {/* Sign ke baad: kis ne kab sign kiya + fingerprint */}
              {agreement.signedHash && (
                <section className={`${card} text-sm`}>
                  <h2 className="font-semibold">{t('agreements.signedRecord')}</h2>
                  <ul className="mt-2 space-y-1 text-gray-700">
                    {(['business', 'talent'] as const).map((party) => {
                      const signature = agreement.signatures[party]
                      return (
                        signature && (
                          <li key={party}>
                            {t(`agreements.party.${party}`)}:{' '}
                            {t('agreements.print.signature', {
                              name: signature.name,
                              email: signature.email,
                              date: formatDateTime(signature.signedAt),
                            })}
                          </li>
                        )
                      )
                    })}
                  </ul>
                  <p className="mt-3 break-all text-xs text-gray-500">
                    {t('agreements.fingerprint')}: <span className="font-mono">{agreement.signedHash}</span>
                  </p>
                  <p className="mt-1 text-xs text-gray-500">{t('agreements.fingerprintHint')}</p>
                </section>
              )}

              {/* Reviews: mukammal hone ke baad */}
              {agreement.status === 'completed' && (
                <section className={card}>
                  <h2 className="font-semibold">{t('agreements.reviews')}</h2>
                  {agreement.reviews?.[side] ? (
                    <div className="mt-2 text-sm">
                      <p className="text-gray-500">{t('agreements.yourReview')}</p>
                      <Stars value={agreement.reviews[side].rating} />
                      {agreement.reviews[side].comment && (
                        <p className="mt-1 text-gray-700">{agreement.reviews[side].comment}</p>
                      )}
                    </div>
                  ) : (
                    <div className="mt-2">
                      <p className="mb-2 text-sm text-gray-600">
                        {t(`agreements.reviewPrompt.${side}`, { name: otherName ?? '' })}
                      </p>
                      <ReviewForm agreement={agreement} />
                    </div>
                  )}
                  {agreement.reviews?.[otherSide] && (
                    <div className="mt-4 border-t border-gray-100 pt-3 text-sm">
                      <p className="text-gray-500">{t('agreements.theirReview', { name: otherName ?? '' })}</p>
                      <Stars value={agreement.reviews[otherSide].rating} />
                      {agreement.reviews[otherSide].comment && (
                        <p className="mt-1 text-gray-700">{agreement.reviews[otherSide].comment}</p>
                      )}
                    </div>
                  )}
                </section>
              )}

              {/* Purane versions: kis ne kya propose kiya */}
              {(agreement.history?.length ?? 0) > 1 && (
                <section className={card}>
                  <button
                    onClick={() => setShowHistory((v) => !v)}
                    className="flex w-full items-center justify-between font-semibold"
                    aria-expanded={showHistory}
                  >
                    <span>
                      <FontAwesomeIcon icon={faClockRotateLeft} className="me-2 text-gray-500" />
                      {t('agreements.history', { count: agreement.history!.length })}
                    </span>
                    <span className="text-sm font-normal underline">
                      {showHistory ? t('agreements.hide') : t('agreements.show')}
                    </span>
                  </button>
                  {showHistory && (
                    <ol className="mt-4 space-y-4">
                      {[...agreement.history!].reverse().map((version) => (
                        <li key={version.version} className="rounded-xl border border-gray-200 p-4">
                          <p className="mb-2 text-sm font-medium">
                            {t('agreements.versionBy', {
                              version: version.version,
                              party: t(`agreements.party.${version.proposedBy}`),
                              date: formatDateTime(version.proposedAt),
                            })}
                          </p>
                          <TermsView terms={version.terms} />
                        </li>
                      ))}
                    </ol>
                  )}
                </section>
              )}

              {/* Wapas lena (sign se pehle) ya masla uthana (kaam ke dauran) */}
              {(agreement.status === 'negotiating' || agreement.status === 'active') && (
                <div className="flex flex-wrap justify-end gap-2">
                  {agreement.status === 'negotiating' && (
                    <button
                      onClick={() => setDialog('cancel')}
                      className={`${button} border border-gray-300 text-gray-700 hover:bg-gray-100`}
                    >
                      <FontAwesomeIcon icon={faXmark} />
                      {t('agreements.cancel')}
                    </button>
                  )}
                  {agreement.status === 'active' && (
                    <button
                      onClick={() => setDialog('dispute')}
                      className={`${button} border border-red-200 text-red-600 hover:bg-red-50`}
                    >
                      <FontAwesomeIcon icon={faFlag} />
                      {t('agreements.reportProblem')}
                    </button>
                  )}
                </div>
              )}
            </div>

            <ConfirmDialog
              open={milestoneDialog?.kind === 'deliver'}
              title={t('agreements.deliverTitle')}
              confirmLabel={t('agreements.deliver')}
              isBusy={milestone.isPending}
              confirmDisabled={note.trim().length < 3}
              onConfirm={() => milestoneDialog && milestone.mutate(milestoneDialog)}
              onCancel={closeDialogs}
            >
              <label className="block">
                <span className="mb-1 block font-medium text-gray-900">{t('agreements.deliveryNote')}</span>
                <textarea
                  rows={3}
                  maxLength={1000}
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  placeholder={t('agreements.deliveryPlaceholder')}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2"
                />
              </label>
              <label className="mt-3 block">
                <span className="mb-1 block font-medium text-gray-900">{t('agreements.deliveryLink')}</span>
                <input
                  type="url"
                  value={link}
                  onChange={(e) => setLink(e.target.value)}
                  placeholder="https://..."
                  className="w-full rounded-lg border border-gray-300 px-3 py-2"
                />
              </label>
            </ConfirmDialog>
            <ConfirmDialog
              open={milestoneDialog?.kind === 'approve'}
              title={t('agreements.approveTitle')}
              tone="success"
              confirmLabel={t('agreements.approve')}
              isBusy={milestone.isPending}
              onConfirm={() => milestoneDialog && milestone.mutate(milestoneDialog)}
              onCancel={closeDialogs}
            >
              <p>{t('agreements.approveBody')}</p>
            </ConfirmDialog>
            <ConfirmDialog
              open={dialog === 'cancel'}
              title={t('agreements.cancelTitle')}
              tone="danger"
              confirmLabel={t('agreements.cancel')}
              isBusy={cancel.isPending}
              onConfirm={() => cancel.mutate()}
              onCancel={closeDialogs}
            >
              <p>{t('agreements.cancelBody')}</p>
              <textarea
                rows={2}
                maxLength={1000}
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder={t('agreements.reasonOptional')}
                aria-label={t('agreements.reasonOptional')}
                className="mt-3 w-full rounded-lg border border-gray-300 px-3 py-2"
              />
            </ConfirmDialog>
            <ConfirmDialog
              open={dialog === 'dispute'}
              title={t('agreements.disputeTitle')}
              tone="danger"
              confirmLabel={t('agreements.reportProblem')}
              isBusy={dispute.isPending}
              confirmDisabled={note.trim().length < 20}
              onConfirm={() => dispute.mutate()}
              onCancel={closeDialogs}
            >
              <p>{t('agreements.disputeBody')}</p>
              <textarea
                rows={4}
                maxLength={2000}
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder={t('agreements.disputePlaceholder')}
                aria-label={t('agreements.disputeTitle')}
                className="mt-3 w-full rounded-lg border border-gray-300 px-3 py-2"
              />
            </ConfirmDialog>
          </>
        )}
      </DataState>
    </div>
  )
}

export default AgreementDetailPage
