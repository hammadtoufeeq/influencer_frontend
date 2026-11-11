import { useTranslation } from 'react-i18next'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faCircleCheck, faLock } from '@fortawesome/free-solid-svg-icons'
import { useState, type FormEvent } from 'react'
import { Link } from 'react-router-dom'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import toast from 'react-hot-toast'
import { verifyClaimCode } from '../api/claims'
import { claimPersonName, type Claim } from '../types/claim'
import { getApiError } from '../utils/apiError'

const STEPS = ['claimProgress.step1', 'claimProgress.step2', 'claimProgress.step3', 'claimProgress.step4']

function stepIndex(status: Claim['status']) {
  const steps: Record<Claim['status'], number> = {
    pending: 0,
    waiting_for_talent: 1,
    otp_failed: 1,
    verified: 2,
    approved: 3,
    rejected: 0,
  }
  return steps[status]
}

// Talent dashboard pe khule claim ki halat + code daalne ka box
function ClaimProgress({ claim }: { claim: Claim }) {
  const { t, i18n } = useTranslation()
  const queryClient = useQueryClient()
  const [code, setCode] = useState('')
  const [error, setError] = useState('')
  // Page khulne ka waqt (render mein baar baar new Date() nahi)
  const [openedAt] = useState(() => Date.now())
  const current = stepIndex(claim.status)
  const expiresAt = claim.verification?.expiresAt ? new Date(claim.verification.expiresAt) : null
  const isExpired = expiresAt ? expiresAt.getTime() < openedAt : false

  const verify = useMutation({
    mutationFn: () => verifyClaimCode(claim._id, code),
    onMutate: () => setError(''),
    onSuccess: () => {
      toast.success(t('claimProgress.verifiedToast'))
      queryClient.invalidateQueries({ queryKey: ['claims'] })
    },
    onError: (err) => {
      const { message, code: errorCode, details } = getApiError(err)
      if (errorCode === 'OTP_LOCKED') {
        // Claim lock ho gaya: input hata kar lock wala paigham dikhao
        setError('')
        queryClient.invalidateQueries({ queryKey: ['claims'] })
        return
      }
      if (errorCode === 'INVALID_CODE' && typeof details.attemptsLeft === 'number') {
        setError(t('claimOtp.wrongCode', { count: details.attemptsLeft }))
        return
      }
      setError(message)
    },
  })

  function handleSubmit(e: FormEvent) {
    e.preventDefault()
    verify.mutate()
  }

  return (
    <section className="rounded-2xl border border-amber-200 bg-white p-5 shadow-sm md:p-6">
      <p className="text-xs font-medium uppercase tracking-wide text-amber-700">
        {claim.isNewProfile ? t('newProfile.inProgress') : t('claimProgress.inProgress')}
      </p>
      {claim.isNewProfile ? (
        // Nayi profile abhi chhupi hai: public page ka link nahi
        <>
          <p className="mt-2">
            {t('newProfile.yourProfile')}{' '}
            <span className="font-semibold">{claimPersonName(claim, '')}</span>
          </p>
          <p className="mt-1 text-sm text-gray-500">{t('newProfile.hiddenUntilApproved')}</p>
        </>
      ) : (
        <p className="mt-2">
          {t('claimProgress.claiming')}{' '}
          {claim.person ? (
            <Link to={`/people/${claim.person.slug}`} className="font-semibold underline">
              {claim.person.name}
            </Link>
          ) : (
            <span className="font-semibold">{t('claims.deletedProfile')}</span>
          )}
        </p>
      )}

      {/* 4 qadam wali progress line */}
      <ol className="mt-4 grid grid-cols-4 gap-2">
        {STEPS.map((step, index) => (
          <li key={step} className="text-center">
            <div
              className={`h-1.5 rounded-full ${index <= current ? 'bg-brand' : 'bg-gray-200'}`}
            />
            <span
              className={`mt-1.5 block text-[11px] leading-tight sm:text-xs ${index <= current ? 'font-medium text-gray-900' : 'text-gray-400'}`}
            >
              {t(step)}
            </span>
          </li>
        ))}
      </ol>

      {claim.status === 'pending' && (
        <p className="mt-4 rounded-xl bg-gray-50 p-4 text-sm text-gray-700">
          {t('claimProgress.pendingBody')}
        </p>
      )}

      {claim.status === 'waiting_for_talent' && (
        <div className="mt-4 rounded-xl bg-amber-50 p-4">
          <p className="text-sm text-gray-800">
            {t('claimProgress.sentBefore')}{' '}
            <a
              href={claim.verification?.channelUrl}
              target="_blank"
              rel="noopener noreferrer nofollow"
              className="break-all font-medium underline"
            >
              {claim.verification?.channelUrl}
            </a>
            . {t('claimProgress.sentAfter')}
          </p>
          {isExpired ? (
            <p className="mt-3 text-sm text-red-700">
              {t('claimProgress.expired')}
            </p>
          ) : (
            <form onSubmit={handleSubmit} className="mt-3 flex flex-wrap gap-2" noValidate>
              <input
                inputMode="numeric"
                autoComplete="one-time-code"
                maxLength={6}
                aria-label={t('claimProgress.codeLabel')}
                placeholder="______"
                value={code}
                onChange={(e) => setCode(e.target.value.replace(/\D/g, ''))}
                className={`w-40 rounded-lg border bg-white px-3 py-2 text-center font-mono text-lg tracking-[0.4em] ${error ? 'border-red-500' : 'border-gray-300'}`}
              />
              <button
                type="submit"
                disabled={code.length !== 6 || verify.isPending}
                className="rounded-lg bg-brand px-5 py-2 text-sm font-medium text-on-brand hover:bg-brand-hover disabled:opacity-50"
              >
                {verify.isPending ? t('claimProgress.checking') : t('claimProgress.verify')}
              </button>
            </form>
          )}
          {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
          {expiresAt && !isExpired && (
            <p className="mt-2 text-xs text-gray-500">
              {t('claimProgress.expiresOn', { date: expiresAt.toLocaleString(i18n.language) })}
            </p>
          )}
        </div>
      )}

      {/* 5 ghalat koshishein: ab koi input nahi, admin dekhega */}
      {claim.status === 'otp_failed' && (
        <p role="alert" className="mt-4 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-800">
          <FontAwesomeIcon icon={faLock} className="me-1.5" />
          {t('claimOtp.talentLocked')}
        </p>
      )}

      {claim.status === 'verified' && (
        <p className="mt-4 rounded-xl bg-green-50 p-4 text-sm text-green-800">
          <FontAwesomeIcon icon={faCircleCheck} className="me-1.5" />
          {t('claimProgress.verifiedBody')}
        </p>
      )}
    </section>
  )
}

export default ClaimProgress
