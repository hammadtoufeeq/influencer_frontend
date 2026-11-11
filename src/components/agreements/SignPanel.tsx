import { useEffect, useState, type FormEvent } from 'react'
import { useTranslation } from 'react-i18next'
import { useMutation } from '@tanstack/react-query'
import toast from 'react-hot-toast'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faCircleCheck, faFileSignature, faHourglassHalf } from '@fortawesome/free-solid-svg-icons'
import { sendSignCode, signAgreement } from '../../api/agreements'
import type { Agreement, AgreementParty } from '../../types/agreement'
import { getApiError } from '../../utils/apiError'
import { formatDateTime } from '../../utils/adminFormat'

// Dono taraf ke sign ki halat + mera sign (email pe code -> code daalo)
function SignPanel({
  agreement,
  side,
  onSigned,
}: {
  agreement: Agreement
  side: AgreementParty
  onSigned: (agreement: Agreement) => void
}) {
  const { t } = useTranslation()
  const [code, setCode] = useState('')
  const [error, setError] = useState('')
  const [codeSent, setCodeSent] = useState(false)
  const [resendIn, setResendIn] = useState(0)

  // Resend ka ulta counter
  useEffect(() => {
    if (resendIn <= 0) return
    const timer = window.setTimeout(() => setResendIn((s) => s - 1), 1000)
    return () => window.clearTimeout(timer)
  }, [resendIn])

  const signedMine = agreement.signatures[side]?.version === agreement.version

  const send = useMutation({
    mutationFn: () => sendSignCode(agreement._id),
    onSuccess: (data) => {
      setCodeSent(true)
      setResendIn(data.resendIn)
      setError('')
      toast.success(t('agreements.codeSent'))
    },
    onError: (err) => {
      const { message, code: errorCode, details } = getApiError(err)
      if (errorCode === 'TOO_SOON' && typeof details.retryIn === 'number') {
        setCodeSent(true)
        setResendIn(details.retryIn)
        return
      }
      toast.error(message)
    },
  })

  const sign = useMutation({
    mutationFn: () => signAgreement(agreement._id, code),
    onMutate: () => setError(''),
    onSuccess: (updated) => {
      toast.success(updated.status === 'active' ? t('agreements.nowActive') : t('agreements.signedToast'))
      setCode('')
      setCodeSent(false)
      onSigned(updated)
    },
    onError: (err) => {
      const { message, code: errorCode, details } = getApiError(err)
      if (errorCode === 'INVALID_CODE' && typeof details.attemptsLeft === 'number') {
        setError(t('claimOtp.wrongCode', { count: details.attemptsLeft }))
        return
      }
      setError(message)
    },
  })

  function handleSubmit(e: FormEvent) {
    e.preventDefault()
    sign.mutate()
  }

  const row = (party: AgreementParty, name?: string) => {
    const signature = agreement.signatures[party]
    const current = signature?.version === agreement.version
    return (
      <li className="flex flex-wrap items-center justify-between gap-2 py-2 text-sm">
        <span>
          <span className="font-medium">{name ?? '—'}</span>{' '}
          <span className="text-gray-500">({t(`agreements.party.${party}`)})</span>
        </span>
        {current ? (
          <span className="text-green-700">
            <FontAwesomeIcon icon={faCircleCheck} className="me-1.5" />
            {t('agreements.signedOn', { date: formatDateTime(signature.signedAt) })}
            {signature.onBehalfOf && (
              <span className="ms-1 text-gray-500">
                {t('agreements.signedByManager', { name: signature.name })}
              </span>
            )}
          </span>
        ) : (
          <span className="text-gray-500">
            <FontAwesomeIcon icon={faHourglassHalf} className="me-1.5" />
            {t('agreements.notSigned')}
          </span>
        )}
      </li>
    )
  }

  return (
    <section className="rounded-2xl bg-white p-5 shadow-sm">
      <h2 className="font-semibold">
        <FontAwesomeIcon icon={faFileSignature} className="me-2 text-gray-500" />
        {t('agreements.signatures', { version: agreement.version })}
      </h2>
      <ul className="mt-2 divide-y divide-gray-100">
        {row('business', agreement.businessProfile?.companyName ?? agreement.business?.name)}
        {row('talent', agreement.person?.name ?? agreement.talent?.name)}
      </ul>

      {signedMine ? (
        <p className="mt-3 rounded-xl bg-green-50 p-3 text-sm text-green-800">
          {t('agreements.waitingOther')}
        </p>
      ) : (
        <div className="mt-3 rounded-xl bg-amber-50 p-4">
          <p className="text-sm text-gray-800">{t('agreements.signExplain')}</p>
          {!codeSent ? (
            <button
              type="button"
              onClick={() => send.mutate()}
              disabled={send.isPending}
              className="mt-3 rounded-lg bg-brand px-4 py-2 text-sm font-medium text-on-brand hover:bg-brand-hover disabled:opacity-60"
            >
              {send.isPending ? t('common.saving') : t('agreements.emailMeCode')}
            </button>
          ) : (
            <>
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
                  disabled={code.length !== 6 || sign.isPending}
                  className="rounded-lg bg-brand px-5 py-2 text-sm font-medium text-on-brand hover:bg-brand-hover disabled:opacity-50"
                >
                  {sign.isPending ? t('claimProgress.checking') : t('agreements.signButton')}
                </button>
              </form>
              {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
              <button
                type="button"
                onClick={() => send.mutate()}
                disabled={resendIn > 0 || send.isPending}
                className="mt-2 text-xs underline disabled:no-underline disabled:opacity-60"
              >
                {resendIn > 0 ? t('agreements.resendIn', { count: resendIn }) : t('agreements.resend')}
              </button>
            </>
          )}
        </div>
      )}
    </section>
  )
}

export default SignPanel
