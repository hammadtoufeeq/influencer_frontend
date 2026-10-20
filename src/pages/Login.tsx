import { useTranslation } from 'react-i18next'
import { useState, type FormEvent } from 'react'
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faArrowRight, faLock } from '@fortawesome/free-solid-svg-icons'
import FormField from '../components/FormField'
import GoogleButton from '../components/GoogleButton'
import AuthShowcase from '../components/auth/AuthShowcase'
import { AUTH_BUTTON, AUTH_INPUT } from '../components/auth/authStyles'
import { googleLoginRequest } from '../api/auth'
import { useAuth } from '../hooks/useAuth'
import { getApiError } from '../utils/apiError'

function Login() {
  const { t } = useTranslation()
  const { user, login, updateUser } = useAuth()
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

  async function handleGoogle(credential: string) {
    setIsSubmitting(true)
    try {
      const loggedIn = await googleLoginRequest(credential)
      updateUser(loggedIn)
      toast.success(t('login.welcomeBack', { name: loggedIn.name }))
      navigate(from ?? homeFor(loggedIn.role), { replace: true })
    } catch (error) {
      const { code, message } = getApiError(error)
      if (code === 'GOOGLE_NO_ACCOUNT') {
        toast.error(t('login.googleNoAccount'))
        navigate('/register')
      } else {
        toast.error(message)
      }
    } finally {
      setIsSubmitting(false)
    }
  }

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
    <section className="mx-auto grid w-full max-w-6xl overflow-clip rounded-[28px] bg-white shadow-[0_30px_80px_rgb(23_23_23_/_12%)] ring-1 ring-gray-200/70 lg:grid-cols-[1.05fr_1fr]">
      <AuthShowcase
        eyebrow={t('login.eyebrow')}
        title={t('auth.loginTitle')}
        subtitle={t('auth.loginSubtitle')}
      />

      <div className="flex min-w-0 flex-col justify-center px-6 py-9 sm:px-12 sm:py-12">
        <div className="mx-auto w-full max-w-md">
        <div className="flex items-center gap-2 text-[11px] font-bold tracking-[0.12em] text-gray-500 uppercase motion-safe:animate-fade-up">
          <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-gray-900 text-white">
            <FontAwesomeIcon icon={faLock} className="text-[9px]" />
          </span>
          <span>{t('login.secure')}</span>
        </div>
        <h2
          className="mt-4 font-display text-3xl font-extrabold tracking-tight text-gray-900 motion-safe:animate-fade-up sm:text-4xl"
          style={{ animationDelay: '60ms' }}
        >
          {t('login.title')}
        </h2>
        <p
          className="mt-2 text-[15px] text-gray-600 motion-safe:animate-fade-up"
          style={{ animationDelay: '120ms' }}
        >
          {t('login.subtitle')}
        </p>

        <form
          onSubmit={handleSubmit}
          className="mt-8 space-y-5 motion-safe:animate-fade-up"
          style={{ animationDelay: '180ms' }}
          noValidate
        >
          <FormField
            id="email"
            label={t('login.email')}
            type="email"
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            error={errors.email}
            className={AUTH_INPUT}
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
            className={AUTH_INPUT}
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
          {/*
            ✅ INVERSE button — Tailwind v4 auto-invert se:
            - Light mode: bg-gray-900 (dark) + text-white (white)
            - Dark mode: bg-gray-900 invert → light + text-white invert → dark
            Koi `keep-dark` nahi — kyunke `keep-dark` lagaoge to hamesha dark rahega.
          */}
          <button
            type="submit"
            disabled={isSubmitting}
            className={AUTH_BUTTON}
          >
            {isSubmitting ? t('login.submitting') : t('login.submit')}
            {!isSubmitting && (
              <FontAwesomeIcon icon={faArrowRight} className="text-xs transition group-hover:translate-x-1 rtl:rotate-180 rtl:group-hover:-translate-x-1" />
            )}
          </button>
        </form>

        <div className="mt-5 motion-safe:animate-fade-up" style={{ animationDelay: '240ms' }}>
          <GoogleButton
            mode="signin"
            onCredential={handleGoogle}
            divider={t('login.or')}
            busy={isSubmitting}
          />
        </div>

        <p className="mt-7 text-center text-sm text-gray-600">
          {t('login.noAccount')}{' '}
          <Link to="/register" className="font-medium text-gray-900 underline">
            {t('login.signup')}
          </Link>
        </p>
        </div>
      </div>
    </section>
  )
}

export default Login