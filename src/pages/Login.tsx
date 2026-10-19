import { useTranslation } from 'react-i18next'
import { useState, type FormEvent } from 'react'
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faArrowRight, faRightToBracket } from '@fortawesome/free-solid-svg-icons'
import FormField from '../components/FormField'
import { useAuth } from '../hooks/useAuth'
import { getApiError } from '../utils/apiError'

function Login() {
  const { t } = useTranslation()
  const { user, login } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const from = (location.state as { from?: string } | null)?.from
  // Admin seedha Admin panel pe, baqi sab apne dashboard pe
  const homeFor = (role?: string) => (role === 'admin' ? '/admin' : '/dashboard')

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [isSubmitting, setIsSubmitting] = useState(false)

  if (user) return <Navigate to={from ?? homeFor(user.role)} replace />

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setErrors({})
    setIsSubmitting(true)

    try {
      const loggedIn = await login({ email, password })
      toast.success(t('login.welcomeBack', { name: loggedIn.name }))
      navigate(from ?? homeFor(loggedIn.role), { replace: true })
    } catch (error) {
      const { message, fields } = getApiError(error)
      setErrors(fields)
      toast.error(message)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <section className="mx-auto grid w-full max-w-[1040px] overflow-hidden rounded-[28px] border  border-gray-200 bg-white shadow-[0_24px_70px_rgb(23_23_23_/_9%)] md:grid-cols-[minmax(230px,0.72fr)_minmax(0,1.28fr)] max-md:rounded-[22px]">
      <div className="keep-dark relative flex min-h-[540px] flex-col overflow-hidden bg-gray-900 px-[34px] py-[42px] text-white max-md:min-h-0 max-md:px-6 max-md:py-[26px] max-md:pb-[30px] before:absolute before:-right-[110px] before:-top-[90px] before:h-[290px] before:w-[290px] before:rounded-full before:bg-[#e85d3f] before:opacity-90 after:absolute after:-bottom-[110px] after:-right-[70px] after:h-[250px] after:w-[250px] after:rounded-full after:border after:border-white/20">
        <span className="relative z-10 text-[0.7rem] font-bold tracking-[0.2em] text-[#f8a08e]">WELCOME BACK</span>
        <span className="relative z-10 mt-auto flex h-[54px] w-[54px] items-center justify-center rounded-[17px] bg-[#e85d3f] text-[1.2rem] max-md:mt-7">
          <FontAwesomeIcon icon={faRightToBracket} />
        </span>
        <h1 className="relative z-10 mt-auto max-w-[240px] font-display text-[clamp(2rem,4vw,3.25rem)] font-bold leading-[0.98] tracking-[-0.04em] max-md:mt-[34px] max-md:max-w-[330px] max-md:text-4xl">{t('login.title')}</h1>
        <p className="relative z-10 mt-[18px] max-w-[270px] text-[0.9rem] leading-[1.65] text-gray-30 max-md:mt-3">{t('login.subtitle')}</p>
        <div className="relative z-10 mt-8 flex gap-2 max-md:mt-5" aria-hidden="true">
  <span className="block h-[5px] w-[62px] animate-pulse rounded-[5px] bg-[#f8a08e]" />
  <span className="block h-[5px] w-[34px] rounded-[5px] bg-white/35" />
  <span className="block h-[5px] w-[34px] rounded-[5px] bg-white/35" />
</div>
      </div>
      <div className="min-w-0 px-12 py-[42px] max-md:px-[22px] max-md:py-[30px]">
        <div className="flex items-center gap-[9px] text-[0.72rem] font-bold uppercase tracking-[0.04em] text-gray-500">
          <span className="inline-flex h-[25px] w-[25px] items-center justify-center rounded-full border border-neutral-900 bg-gray-900 text-white">
            <FontAwesomeIcon icon={faRightToBracket} className="text-[10px]" />
          </span>
          <span>SECURE SIGN IN</span>
        </div>
        <h2 className="mt-5 font-display text-[clamp(1.75rem,3vw,2.35rem)] font-bold tracking-[-0.04em] text-gray-900">{t('login.title')}</h2>
        <p className="mt-2 text-[0.92rem] leading-[1.55] text-gray-500">{t('login.subtitle')}</p>

        <form onSubmit={handleSubmit} className="mt-7 space-y-5" noValidate>
          <FormField
            id="email"
            label={t('login.email')}
            type="email"
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            error={errors.email}
            className="min-h-11 w-full rounded-lg border  border-gray-300 bg-white px-3 py-2 outline-none transition focus:border-neutral-900 focus:ring-2 focus:ring-neutral-900/10"
            required
          />
          <FormField
            id="password"
            label={t('login.password')}
            type="password"
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            error={errors.password}
            className="min-h-11 w-full rounded-lg border border-neutral-300 bg-white px-3 py-2 outline-none transition focus:border-neutral-900 focus:ring-2 focus:ring-neutral-900/10"
            required
          />
          <div className="-mt-2 text-end">
            <Link
              to="/forgot-password"
              state={{ email }}
              className="text-sm font-medium text-gray-600 underline-offset-4 hover:text-gray-900 hover:underline"
            >
              {t('forgot.link')}
            </Link>
          </div>
          <button
            type="submit"
            disabled={isSubmitting}
            className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-gray-900 py-3 font-medium text-white transition hover:-translate-y-px hover:bg-gray-800 hover:shadow-[0_10px_20px_rgb(23_23_23_/_18%)] disabled:opacity-60"
          >
            {isSubmitting ? t('login.submitting') : t('login.submit')}
            {!isSubmitting && <FontAwesomeIcon icon={faArrowRight} className="text-xs rtl:rotate-180" />}
          </button>
        </form>

        <p className="mt-7 text-center text-sm text-gray-600">
          {t('login.noAccount')}{' '}
          <Link to="/register" className="font-medium text-gray-900 underline">
            {t('login.signup')}
          </Link>
        </p>
      </div>
    </section>
  )
}

export default Login
