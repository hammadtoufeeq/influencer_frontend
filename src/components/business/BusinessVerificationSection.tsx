import { useState, type FormEvent } from 'react'
import { useTranslation } from 'react-i18next'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import {
  faArrowRight,
  faBuilding,
  faCircleCheck,
  faLock,
  faPen,
} from '@fortawesome/free-solid-svg-icons'
import { Link } from 'react-router-dom'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import toast from 'react-hot-toast'
import { verifyMyBusinessCode } from '../../api/business'
import { myBusinessQuery } from '../../api/queries'
import type { BusinessProfile, BusinessStatus } from '../../types/business'
import { getApiError } from '../../utils/apiError'
import { formatDate } from '../../utils/adminFormat'
import { countryName } from '../../utils/format'

const box = 'rounded-2xl border bg-white p-5 shadow-sm md:p-6'
const primary =
  'inline-flex items-center gap-1.5 rounded-lg bg-brand px-4 py-2 text-sm font-medium text-on-brand hover:bg-brand-hover'
const outline =
  'inline-flex items-center gap-1.5 rounded-lg border border-gray-300 px-4 py-2 text-sm hover:bg-gray-100'

const STEPS = ['business.step1', 'business.step2', 'business.step3', 'business.step4']

function stepIndex(status: BusinessStatus) {
  const steps: Record<BusinessStatus, number> = {
    pending: 0,
    waiting_for_business: 1,
    otp_failed: 1,
    code_verified: 2,
    approved: 3,
    rejected: 0,
  }
  return steps[status]
}

// Code kahan gaya: link ho to click ho sake, email / phone saada
function Channel({ value }: { value?: string }) {
  if (!value) return null
  return /^https?:\/\//.test(value) ? (
    <a
      href={value}
      target="_blank"
      rel="noopener noreferrer nofollow"
      className="break-all font-medium underline"
    >
      {value}
    </a>
  ) : (
    <span dir="ltr" className="break-all font-medium">
      {value}
    </span>
  )
}

// Code daalne ka box (admin ne business ke kisi raabte pe bheja)
function CodeEntry({ business }: { business: BusinessProfile }) {
  const { t, i18n } = useTranslation()
  const queryClient = useQueryClient()
  const [code, setCode] = useState('')
  const [error, setError] = useState('')
  // Page khulne ka waqt (render mein baar baar new Date() nahi)
  const [openedAt] = useState(() => Date.now())
  const expiresAt = business.verification?.expiresAt
    ? new Date(business.verification.expiresAt)
    : null
  const isExpired = expiresAt ? expiresAt.getTime() < openedAt : false

  const verify = useMutation({
    mutationFn: () => verifyMyBusinessCode(code),
    onMutate: () => setError(''),
    onSuccess: (saved) => {
      toast.success(t('business.codeVerifiedToast'))
      queryClient.setQueryData(myBusinessQuery.queryKey, saved)
    },
    onError: (err) => {
      const { message, code: errorCode, details } = getApiError(err)
      if (errorCode === 'OTP_LOCKED') {
        // Lock ho gaya: input hata kar lock wala paigham dikhao
        queryClient.invalidateQueries({ queryKey: myBusinessQuery.queryKey })
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
    <div className="mt-4 rounded-xl bg-amber-50 p-4">
      <p className="text-sm text-gray-800">
        {t('claimProgress.sentBefore')} <Channel value={business.verification?.channel} />.{' '}
        {t('business.sentAfter')}
      </p>
      {isExpired ? (
        <p className="mt-3 text-sm text-red-700">{t('claimProgress.expired')}</p>
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
  )
}

// Business dashboard ka sab se upar wala hissa: company ki verification ki halat
function BusinessVerificationSection() {
  const { t } = useTranslation()
  const { data: business, isLoading } = useQuery(myBusinessQuery)

  if (isLoading) return <div className="h-28 animate-pulse rounded-2xl bg-white shadow-sm" />

  // 1. Abhi details nahi bheji
  if (!business) {
    return (
      <section className={`${box} border-gray-200`}>
        <p className="text-xs font-medium uppercase tracking-wide text-gray-500">
          {t('business.label')}
        </p>
        <h2 className="mt-2 text-lg font-semibold">{t('business.startTitle')}</h2>
        <p className="mt-1 text-sm text-gray-600">{t('business.startBody')}</p>
        <Link to="/dashboard/business" className={`${primary} mt-4`}>
          {t('business.startButton')}
          <FontAwesomeIcon icon={faArrowRight} className="ms-1 rtl:rotate-180" />
        </Link>
      </section>
    )
  }

  const location = [business.city, countryName(business.country)].filter(Boolean).join(', ')
  const header = (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
      <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-gray-100 text-gray-600">
        <FontAwesomeIcon icon={faBuilding} />
      </span>
      <div className="min-w-0 flex-1">
        <h2 className="truncate text-lg font-semibold">{business.companyName}</h2>
        <p className="truncate text-sm text-gray-600">
          {[business.industry, location].filter(Boolean).join(' · ')}
        </p>
      </div>
      <Link to="/dashboard/business" className={outline}>
        <FontAwesomeIcon icon={faPen} className="text-xs" />
        {business.status === 'rejected' ? t('business.fixAndResubmit') : t('business.edit')}
      </Link>
    </div>
  )

  // 2. Verified: ab hire kar sakta hai
  if (business.status === 'approved') {
    return (
      <section className={`${box} border-green-200`}>
        <p className="text-xs font-medium uppercase tracking-wide text-green-700">
          <FontAwesomeIcon icon={faCircleCheck} className="me-1.5" />
          {t('business.verifiedLabel')}
        </p>
        <div className="mt-3">{header}</div>
        <p className="mt-4 text-sm text-gray-600">{t('business.verifiedBody')}</p>
        <Link to="/search" className={`${primary} mt-3`}>
          {t('business.findTalents')}
          <FontAwesomeIcon icon={faArrowRight} className="ms-1 rtl:rotate-180" />
        </Link>
      </section>
    )
  }

  // 3. Reject: wajah dikhao, theek kar ke dobara bhejo
  if (business.status === 'rejected') {
    return (
      <section className={`${box} border-red-200`}>
        <p className="mb-4 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">
          {t('business.rejected', { reason: business.rejectionReason })}
        </p>
        {header}
      </section>
    )
  }

  // 4. Tasdeeq chal rahi hai: details bheji -> code mila -> code sahi -> approved
  const current = stepIndex(business.status)
  return (
    <section className={`${box} border-amber-200`}>
      <p className="text-xs font-medium uppercase tracking-wide text-amber-700">
        {t('business.inProgress')}
      </p>
      <div className="mt-3">{header}</div>

      <ol className="mt-5 grid grid-cols-4 gap-2">
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

      {business.status === 'pending' && (
        <p className="mt-4 rounded-xl bg-gray-50 p-4 text-sm text-gray-700">
          {t('business.pendingBody', { date: formatDate(business.submittedAt) })}
        </p>
      )}

      {business.status === 'waiting_for_business' && (
        <CodeEntry key={business.verification?.codeSentAt} business={business} />
      )}

      {/* 5 ghalat koshishein: ab koi input nahi, admin dekhega */}
      {business.status === 'otp_failed' && (
        <p
          role="alert"
          className="mt-4 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-800"
        >
          <FontAwesomeIcon icon={faLock} className="me-1.5" />
          {t('business.locked')}
        </p>
      )}

      {business.status === 'code_verified' && (
        <p className="mt-4 rounded-xl bg-green-50 p-4 text-sm text-green-800">
          <FontAwesomeIcon icon={faCircleCheck} className="me-1.5" />
          {t('business.codeVerifiedBody')}
        </p>
      )}
    </section>
  )
}

export default BusinessVerificationSection
