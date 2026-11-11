import { useEffect, useState, type FormEvent } from 'react'
import { useTranslation } from 'react-i18next'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faArrowLeft, faEnvelopeOpenText, faKey, faLock } from '@fortawesome/free-solid-svg-icons'
import FormField from '../components/FormField'
import OtpInput from '../components/OtpInput'
import PasswordField from '../components/PasswordField'
import { requestPasswordReset, verifyPasswordResetCode } from '../api/auth'
import { useAuth } from '../hooks/useAuth'
import { getApiError } from '../utils/apiError'

type Step = 'email' | 'code' | 'password'

const STEPS: Step[] = ['email', 'code', 'password']
const STEP_ICONS = { email: faKey, code: faEnvelopeOpenText, password: faLock }
const CODE_LENGTH = 6
const MIN_PASSWORD = 8

// Har second dobara render taake "60s mein dobara bhejein" ginti chale
function useSecondsLeft(until: number) {
  const [now, setNow] = useState(() => Date.now())
  useEffect(() => {
    if (until <= Date.now()) return
    const timer = window.setInterval(() => setNow(Date.now()), 1000)
    return () => window.clearInterval(timer)
  }, [until])
  return Math.max(0, Math.ceil((until - now) / 1000))
}

// /forgot-password -> email pe support team ka code, code se naya password
function ForgotPassword() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const location = useLocation()
  const { user, resetPassword } = useAuth()

  const [step, setStep] = useState<Step>('email')
  const fromState = location.state as { email?: string; from?: string } | null
  const [typedEmail, setEmail] = useState(() => fromState?.email ?? '')
  // Login hai to email us account ka hi, badla nahi ja sakta (sirf apna password reset)
  const lockedEmail = user?.email
  const email = lockedEmail ?? typedEmail
  // Login hai (Settings se aaye) to wapas Settings, warna login page
  const backTo = lockedEmail || fromState?.from === '/settings' ? '/settings' : '/login'
  const [code, setCode] = useState('')
  const [resetToken, setResetToken] = useState('')
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [busy, setBusy] = useState(false)
  const [resendAt, setResendAt] = useState(0)
  const secondsLeft = useSecondsLeft(resendAt)

  async function sendCode() {
    setBusy(true)
    setErrors({})
    try {
      const { resendIn } = await requestPasswordReset(email.trim())
      setResendAt(Date.now() + resendIn * 1000)
      setCode('')
      setStep('code')
      toast.success(t('forgot.codeSent'), { id: 'forgot' })
    } catch (error) {
      const { message, fields } = getApiError(error)
      setErrors(fields)
      toast.error(message, { id: 'forgot' })
    } finally {
      setBusy(false)
    }
  }

  function handleEmail(e: FormEvent) {
    e.preventDefault()
    if (!/^\S+@\S+\.\S+$/.test(email.trim())) {
      setErrors({ email: t('forgot.errors.email') })
      return
    }
    sendCode()
  }

  async function verify(value = code) {
    if (value.length !== CODE_LENGTH || busy) return
    setBusy(true)
    setErrors({})
    try {
      const token = await verifyPasswordResetCode(email.trim(), value)
      setResetToken(token)
      setStep('password')
    } catch (error) {
      const { message, code: errorCode, details } = getApiError(error)
      const left = (details as { attemptsLeft?: number }).attemptsLeft
      // Claim wale paigham "hum naya code bhejenge" kehte hain; yahan user khud mangwata hai
      const byCode: Record<string, string> = {
        CODE_EXPIRED: t('forgot.errors.expired'),
        TOO_MANY_ATTEMPTS: t('forgot.errors.locked'),
      }
      setErrors({
        code:
          errorCode === 'INVALID_CODE' && left !== undefined
            ? t('forgot.attemptsLeft', { count: left })
            : (byCode[errorCode] ?? message),
      })
      // Ghalat ya expire: khane saaf, user dobara likhe (ya naya code mangwaye)
      setCode('')
    } finally {
      setBusy(false)
    }
  }

  async function handlePassword(e: FormEvent) {
    e.preventDefault()
    const found: Record<string, string> = {}
    if (password.length < MIN_PASSWORD)
      found.newPassword = t('settings.errors.tooShort', { count: MIN_PASSWORD })
    if (confirm !== password) found.confirmPassword = t('settings.errors.mismatch')
    setErrors(found)
    if (Object.keys(found).length) return

    setBusy(true)
    try {
      const user = await resetPassword(email.trim(), resetToken, password)
      toast.success(t('forgot.done', { name: user.name }), { id: 'forgot', duration: 6000 })
      navigate(user.role === 'admin' ? '/admin' : '/dashboard', { replace: true })
    } catch (error) {
      const { message, code: errorCode, fields } = getApiError(error)
      toast.error(message, { id: 'forgot' })
      if (errorCode === 'RESET_EXPIRED') {
        setStep('email')
        setPassword('')
        setConfirm('')
      } else setErrors(fields)
    } finally {
      setBusy(false)
    }
  }

  const stepIndex = STEPS.indexOf(step)

  return (
    <section className="mx-auto max-w-md">
      <div className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-gray-200/70 md:p-8">
        {/* Kitne qadam baqi hain */}
        <div className="flex items-center gap-2" aria-hidden="true">
          {STEPS.map((s, i) => (
            <span
              key={s}
              className={`h-1.5 flex-1 rounded-full transition-colors duration-300 ${
                i <= stepIndex ? 'bg-brand' : 'bg-gray-200'
              }`}
            />
          ))}
        </div>
        <p className="mt-3 text-xs font-medium tracking-wide text-gray-500 uppercase">
          {t('forgot.step', { current: stepIndex + 1, total: STEPS.length })}
        </p>

        <span className="mt-5 flex h-12 w-12 items-center justify-center rounded-2xl bg-gray-100 text-lg text-gray-800">
          <FontAwesomeIcon icon={STEP_ICONS[step]} />
        </span>
        <h1 className="mt-4 text-2xl font-bold tracking-tight">{t(`forgot.${step}Title`)}</h1>

        {step === 'email' && (
          <>
            <p className="mt-1 text-sm text-gray-500">{t('forgot.emailText')}</p>
            <form onSubmit={handleEmail} className="mt-6 space-y-4" noValidate>
              {lockedEmail ? (
                <div>
                  <label htmlFor="email" className="mb-1 block text-sm font-medium">
                    {t('login.email')}
                  </label>
                  <div className="relative">
                    <input
                      id="email"
                      type="email"
                      value={lockedEmail}
                      readOnly
                      aria-readonly="true"
                      dir="ltr"
                      className="w-full cursor-not-allowed rounded-lg border border-gray-200 bg-gray-50 py-2 ps-3 pe-9 text-gray-600 outline-none"
                    />
                    <FontAwesomeIcon
                      icon={faLock}
                      className="pointer-events-none absolute end-3 top-1/2 -translate-y-1/2 text-xs text-gray-400"
                    />
                  </div>
                  <p className="mt-1 text-xs text-gray-500">{t('forgot.emailLocked')}</p>
                  {errors.email && <p className="mt-1 text-sm text-red-600">{errors.email}</p>}
                </div>
              ) : (
                <FormField
                  id="email"
                  label={t('login.email')}
                  type="email"
                  autoComplete="email"
                  autoFocus
                  value={typedEmail}
                  onChange={(e) => setEmail(e.target.value)}
                  error={errors.email}
                />
              )}
              <button
                type="submit"
                disabled={busy}
                className="w-full rounded-lg bg-brand py-2.5 font-medium text-on-brand hover:bg-brand-hover disabled:opacity-60"
              >
                {busy ? t('forgot.sending') : t('forgot.sendCode')}
              </button>
            </form>
          </>
        )}

        {step === 'code' && (
          <>
            <p className="mt-1 text-sm text-gray-500">
              {t('forgot.codeText', { count: CODE_LENGTH })}{' '}
              <span dir="ltr" className="mt-0.5 block font-medium break-all text-gray-900">
                {email.trim()}
              </span>
            </p>
            <form
              onSubmit={(e) => {
                e.preventDefault()
                verify()
              }}
              className="mt-6"
              noValidate
            >
              <OtpInput
                value={code}
                onChange={(value) => {
                  setCode(value)
                  if (errors.code) setErrors({})
                }}
                onComplete={verify}
                disabled={busy}
                invalid={Boolean(errors.code)}
                label={t('forgot.codeLabel')}
              />
              {errors.code && (
                <p className="mt-3 text-center text-sm text-red-600" role="alert">
                  {errors.code}
                </p>
              )}
              <p className="mt-3 text-center text-xs text-gray-500">{t('forgot.spamHint')}</p>
              <button
                type="submit"
                disabled={busy || code.length !== CODE_LENGTH}
                className="mt-6 w-full rounded-lg bg-brand py-2.5 font-medium text-on-brand hover:bg-brand-hover disabled:opacity-60"
              >
                {busy ? t('forgot.verifying') : t('forgot.verify')}
              </button>
            </form>
            <div className="mt-5 flex flex-wrap items-center justify-between gap-2 text-sm">
              {/* Login hai to email badla nahi ja sakta; khali span taake "Resend" end pe rahe */}
              {lockedEmail ? (
                <span />
              ) : (
                <button
                  type="button"
                  onClick={() => {
                    setStep('email')
                    setErrors({})
                  }}
                  className="text-gray-600 underline-offset-4 hover:text-gray-900 hover:underline"
                >
                  {t('forgot.changeEmail')}
                </button>
              )}
              <button
                type="button"
                onClick={sendCode}
                disabled={busy || secondsLeft > 0}
                className="font-medium text-gray-900 underline-offset-4 hover:underline disabled:cursor-not-allowed disabled:text-gray-400 disabled:no-underline"
              >
                {secondsLeft > 0
                  ? t('forgot.resendIn', { seconds: secondsLeft })
                  : t('forgot.resend')}
              </button>
            </div>
          </>
        )}

        {step === 'password' && (
          <>
            <p className="mt-1 text-sm text-gray-500">{t('forgot.passwordText')}</p>
            <form onSubmit={handlePassword} className="mt-6 space-y-4" noValidate>
              <PasswordField
                id="newPassword"
                label={t('settings.newPassword')}
                autoComplete="new-password"
                value={password}
                onChange={setPassword}
                error={errors.newPassword}
              />
              <PasswordField
                id="confirmPassword"
                label={t('settings.confirmPassword')}
                autoComplete="new-password"
                value={confirm}
                onChange={setConfirm}
                error={errors.confirmPassword}
              />
              <p className="text-xs text-gray-500">
                {t('settings.passwordHint', { count: MIN_PASSWORD })}
              </p>
              <button
                type="submit"
                disabled={busy}
                className="w-full rounded-lg bg-brand py-2.5 font-medium text-on-brand hover:bg-brand-hover disabled:opacity-60"
              >
                {busy ? t('settings.saving') : t('forgot.savePassword')}
              </button>
            </form>
          </>
        )}
      </div>

      <p className="mt-6 text-center text-sm">
        <Link
          to={backTo}
          className="inline-flex items-center gap-2 font-medium text-gray-600 hover:text-gray-900"
        >
          <FontAwesomeIcon icon={faArrowLeft} className="text-xs rtl:rotate-180" />
          {backTo === '/settings' ? t('forgot.backToSettings') : t('forgot.backToLogin')}
        </Link>
      </p>
    </section>
  )
}

export default ForgotPassword
