import { useTranslation } from 'react-i18next'
import { useState, type FormEvent, type ReactNode } from 'react'
import { Link, Navigate, useNavigate, useSearchParams } from 'react-router-dom'
import toast from 'react-hot-toast'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import type { IconDefinition } from '@fortawesome/fontawesome-svg-core'
import {
  faArrowLeft,
  faArrowRight,
  faBuilding,
  faStar,
  faUserTie,
} from '@fortawesome/free-solid-svg-icons'
import GoogleButton from '../components/GoogleButton'
import AuthShowcase from '../components/auth/AuthShowcase'
import { AUTH_BUTTON, AUTH_INPUT } from '../components/auth/authStyles'
import PasswordField from '../components/PasswordField'
import { COUNTRY_OPTIONS } from '../constants/people'
import { SIGNUP_ROLE_OPTIONS } from '../constants/roles'
import {
  COMPANY_SIZES,
  ORGANIZATION_TYPES,
  type CompanySize,
  type OrganizationType,
} from '../types/business'
import { googleRegisterRequest, type RegisterInput } from '../api/auth'
import { useAuth } from '../hooks/useAuth'
import type { SignupRole } from '../types/user'
import { getApiError } from '../utils/apiError'
import { countryName } from '../utils/format'

const ROLE_ICONS: Record<SignupRole, IconDefinition> = {
  talent: faStar,
  representative: faUserTie,
  business: faBuilding,
}
const MIN_PASSWORD = 8
const inputClass = (error?: string) =>
  `${AUTH_INPUT} ${error ? 'border-red-500 bg-red-50/40' : ''}`
const isUrl = (value: string) => /^https?:\/\/\S+\.\S+/i.test(value)

// Label ke saath "*" (zaroori) ya "(optional)"
function FieldLabel({
  htmlFor,
  children,
  optional,
}: {
  htmlFor: string
  children: ReactNode
  optional?: boolean
}) {
  const { t } = useTranslation()
  return (
    <label htmlFor={htmlFor} className="mb-1 block text-sm font-medium text-gray-700">
      {children}
      {optional ? (
        <span className="ms-1 text-xs font-normal text-gray-500">({t('register.optional')})</span>
      ) : (
        <span className="ms-0.5 text-red-500" aria-hidden="true">
          *
        </span>
      )}
    </label>
  )
}

function FieldError({ message }: { message?: string }) {
  return message ? <p className="mt-1 text-sm text-red-600">{message}</p> : null
}

// "1 —— 2" qadam: pehle account type, phir details
function Steps({ current, label }: { current: 1 | 2; label: string }) {
  const dot = (n: number) =>
    `inline-flex h-6 w-6 items-center justify-center rounded-full text-[11px] transition ${
      n <= current ? 'bg-gray-900 text-white' : 'border border-gray-300 text-gray-500'
    }`
  return (
    <div className="flex items-center gap-2 text-[11px] font-bold tracking-[0.12em] text-gray-500 uppercase motion-safe:animate-fade-up">
      <span className={dot(1)}>1</span>
      <span className="relative h-0.5 w-8 overflow-hidden rounded-full bg-gray-200">
        <span
          className={`absolute inset-y-0 start-0 bg-gray-900 transition-all duration-700 ${current === 2 ? 'w-full' : 'w-0'}`}
        />
      </span>
      <span className={dot(2)}>2</span>
      <span className="ms-1">{label}</span>
    </div>
  )
}

function Register() {
  const { t } = useTranslation()
  const { user, register, updateUser } = useAuth()
  const navigate = useNavigate()
  // /register?type=business -> account type pehle se chuna hua
  const [searchParams, setSearchParams] = useSearchParams()
  const typeParam = searchParams.get('type')
  const role = SIGNUP_ROLE_OPTIONS.some((o) => o.value === typeParam)
    ? (typeParam as SignupRole)
    : null

  // Sab ke liye
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  // Manager aur business
  const [country, setCountry] = useState('')
  const [websiteUrl, setWebsiteUrl] = useState('')
  // Sirf manager
  const [agencyName, setAgencyName] = useState('')
  // Sirf business
  const [organizationType, setOrganizationType] = useState<OrganizationType | ''>('')
  const [companyName, setCompanyName] = useState('')
  const [industry, setIndustry] = useState('')
  const [companySize, setCompanySize] = useState<CompanySize | ''>('')
  const [description, setDescription] = useState('')

  const [errors, setErrors] = useState<Record<string, string>>({})
  const [isSubmitting, setIsSubmitting] = useState(false)

  if (user) return <Navigate to="/dashboard" replace />

  const chooseRole = (next: SignupRole | null) => {
    setErrors({})
    setSearchParams(next ? { type: next } : {}, { replace: false })
  }

  const field =
    <T,>(key: string, setter: (value: T) => void) =>
    (value: T) => {
      setter(value)
      if (errors[key]) setErrors((prev) => ({ ...prev, [key]: '' }))
    }

  function validate(current: SignupRole) {
    const found: Record<string, string> = {}
    if (current === 'business') {
      if (!organizationType) found.organizationType = t('register.errors.orgType')
      if (companyName.trim().length < 2) found.companyName = t('register.errors.orgName')
    } else if (name.trim().length < 2) {
      found.name = t('register.errors.name')
    }
    if (current !== 'talent' && !country) found.country = t('register.errors.country')
    if (current !== 'talent' && websiteUrl.trim() && !isUrl(websiteUrl.trim())) {
      found.websiteUrl = t('register.errors.url')
    }
    if (!/^\S+@\S+\.\S+$/.test(email.trim())) found.email = t('register.errors.email')
    if (password.length < MIN_PASSWORD) {
      found.password = t('register.errors.password', { count: MIN_PASSWORD })
    }
    return found
  }

  function details(current: SignupRole): Omit<RegisterInput, 'email' | 'password'> {
    const base = { role: current }
    if (current === 'talent') return { ...base, name: name.trim() || undefined }
    if (current === 'representative') {
      return {
        ...base,
        name: name.trim() || undefined,
        country,
        agencyName: agencyName.trim() || undefined,
        websiteUrl: websiteUrl.trim() || undefined,
      }
    }
    return {
      ...base,
      organizationType: organizationType as OrganizationType,
      companyName: companyName.trim(),
      country,
      websiteUrl: websiteUrl.trim() || undefined,
      industry: industry.trim() || undefined,
      companySize,
      description: description.trim() || undefined,
    }
  }

  const payload = (current: SignupRole): RegisterInput => ({
    ...details(current),
    email: email.trim(),
    password,
  })

  async function handleGoogle(credential: string) {
    if (!role) return
    const found = validate(role)
    delete found.email
    delete found.password
    delete found.name
    setErrors(found)
    if (Object.keys(found).length) {
      toast.error(t('register.googleFillFirst'))
      document.getElementById(Object.keys(found)[0])?.focus()
      return
    }

    setIsSubmitting(true)
    try {
      const { user: created, existing } = await googleRegisterRequest(credential, details(role))
      updateUser(created)
      toast.success(
        existing
          ? t('login.welcomeBack', { name: created.name })
          : t('register.welcome', { name: created.name }),
      )
      navigate(created.role === 'admin' ? '/admin' : '/dashboard', { replace: true })
    } catch (error) {
      const { message, fields } = getApiError(error)
      setErrors(fields)
      toast.error(message)
    } finally {
      setIsSubmitting(false)
    }
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    if (!role) return
    const found = validate(role)
    setErrors(found)
    if (Object.keys(found).length) {
      document.getElementById(Object.keys(found)[0])?.focus()
      return
    }

    setIsSubmitting(true)
    try {
      const created = await register(payload(role))
      toast.success(t('register.welcome', { name: created.name }))
      navigate('/dashboard', { replace: true })
    } catch (error) {
      const { message, fields } = getApiError(error)
      setErrors(fields)
      toast.error(message)
    } finally {
      setIsSubmitting(false)
    }
  }

  // ✅ Qadam 1: role select
  if (!role) {
    return (
      <section className="mx-auto grid w-full max-w-6xl overflow-clip rounded-[28px] bg-white shadow-[0_30px_80px_rgb(23_23_23_/_12%)] ring-1 ring-gray-200/70 lg:grid-cols-[1fr_1.15fr]">
        <AuthShowcase
          eyebrow={t('auth.joinEyebrow')}
          title={t('auth.registerTitle')}
          subtitle={t('auth.registerSubtitle')}
        />

        <div className="flex min-w-0 flex-col justify-center px-6 py-9 sm:px-12 sm:py-12">
          <Steps current={1} label={t('register.title')} />
          <h2
            className="mt-4 font-display text-3xl font-extrabold tracking-tight text-gray-900 motion-safe:animate-fade-up sm:text-4xl"
            style={{ animationDelay: '60ms' }}
          >
            {t('register.title')}
          </h2>
          <p
            className="mt-2 text-[15px] text-gray-600 motion-safe:animate-fade-up"
            style={{ animationDelay: '120ms' }}
          >
            {t('register.subtitle')}
          </p>

          <div className="mt-8 grid gap-3">
            {SIGNUP_ROLE_OPTIONS.map((option, i) => (
              <button
                key={option.value}
                type="button"
                onClick={() => chooseRole(option.value)}
                style={{ animationDelay: `${180 + i * 80}ms` }}
                className="group relative flex items-center gap-4 overflow-hidden rounded-2xl border border-gray-200 bg-white p-4 text-start transition duration-300 hover:-translate-y-0.5 hover:border-gray-900 hover:shadow-[0_16px_36px_rgb(23_23_23_/_10%)] focus-visible:ring-4 focus-visible:ring-gray-900/15 focus-visible:outline-none motion-safe:animate-fade-up sm:p-5"
              >
                <span className="keep-dark flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-gray-700 to-gray-950 text-lg text-white shadow-md transition duration-300 group-hover:scale-110 group-hover:rotate-[-6deg]">
                  <FontAwesomeIcon icon={ROLE_ICONS[option.value]} />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block font-semibold text-gray-900">{option.label}</span>
                  <span className="mt-0.5 block text-sm text-gray-600">{option.description}</span>
                </span>
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gray-100 text-xs text-gray-700 transition duration-300 group-hover:translate-x-1 group-hover:bg-gray-900 group-hover:text-white rtl:group-hover:-translate-x-1">
                  <FontAwesomeIcon icon={faArrowRight} className="rtl:rotate-180" />
                </span>
              </button>
            ))}
          </div>

          <p className="mt-7 text-center text-sm text-gray-600">
            {t('register.haveAccount')}{' '}
            <Link to="/login" className="font-medium text-gray-900 underline">
              {t('register.login')}
            </Link>
          </p>
        </div>
      </section>
    )
  }

  const option = SIGNUP_ROLE_OPTIONS.find((o) => o.value === role)!
  const isBusiness = role === 'business'

  const countryField = (
    <div>
      <FieldLabel htmlFor="country">{t('business.fields.country')}</FieldLabel>
      <select
        id="country"
        value={country}
        onChange={(e) => field('country', setCountry)(e.target.value)}
        className={inputClass(errors.country)}
      >
        <option value="">{t('register.chooseCountry')}</option>
        {COUNTRY_OPTIONS.map((code) => (
          <option key={code} value={code}>
            {countryName(code)}
          </option>
        ))}
      </select>
      <FieldError message={errors.country} />
    </div>
  )

  const websiteField = (label: string) => (
    <div>
      <FieldLabel htmlFor="websiteUrl" optional>
        {label}
      </FieldLabel>
      <input
        id="websiteUrl"
        type="url"
        inputMode="url"
        dir="ltr"
        placeholder="https://..."
        value={websiteUrl}
        onChange={(e) => field('websiteUrl', setWebsiteUrl)(e.target.value)}
        className={inputClass(errors.websiteUrl)}
      />
      <FieldError message={errors.websiteUrl} />
    </div>
  )

  // ✅ Qadam 2: form
  return (
    <section className="mx-auto grid w-full max-w-6xl overflow-clip rounded-[28px] bg-white shadow-[0_30px_80px_rgb(23_23_23_/_12%)] ring-1 ring-gray-200/70 lg:grid-cols-[1fr_1.15fr]">
      <AuthShowcase
        eyebrow={t('auth.joinEyebrow')}
        title={t('register.signUpAs', { type: option.label })}
        subtitle={t(`register.note.${role}`)}
      />

      <div className="min-w-0 px-6 py-9 sm:px-12 sm:py-12">
        <button
          type="button"
          onClick={() => chooseRole(null)}
          className="inline-flex items-center gap-2 rounded-full border border-gray-200 px-3 py-1.5 text-sm font-medium text-gray-600 transition hover:border-gray-900 hover:text-gray-900"
        >
          <FontAwesomeIcon icon={faArrowLeft} className="text-xs rtl:rotate-180" />
          {t('register.changeType')}
        </button>

        <div className="mt-6">
          <Steps current={2} label={t('register.loginDetails')} />
        </div>

        <div className="mt-4 flex items-center gap-3 motion-safe:animate-fade-up">
          <span className="keep-dark flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-gray-700 to-gray-950 text-white shadow-md">
            <FontAwesomeIcon icon={ROLE_ICONS[role]} />
          </span>
          <h2 className="font-display text-2xl font-extrabold tracking-tight text-gray-900 sm:text-3xl">
            {t('register.signUpAs', { type: option.label })}
          </h2>
        </div>

        <form
          onSubmit={handleSubmit}
          className="mt-7 space-y-5 motion-safe:animate-fade-up"
          style={{ animationDelay: '120ms' }}
          noValidate
        >
          {isBusiness ? (
            <>
              <p className="text-sm font-semibold text-gray-900">{t('register.aboutOrganization')}</p>
              <div>
                <FieldLabel htmlFor="organizationType">{t('register.orgType')}</FieldLabel>
                <select
                  id="organizationType"
                  value={organizationType}
                  onChange={(e) =>
                    field(
                      'organizationType',
                      setOrganizationType,
                    )(e.target.value as OrganizationType | '')
                  }
                  className={inputClass(errors.organizationType)}
                >
                  <option value="">{t('register.chooseOrgType')}</option>
                  {ORGANIZATION_TYPES.map((type) => (
                    <option key={type} value={type}>
                      {t(`orgType.${type}`)}
                    </option>
                  ))}
                </select>
                <FieldError message={errors.organizationType} />
              </div>
              <div>
                <FieldLabel htmlFor="companyName">{t('register.orgName')}</FieldLabel>
                <input
                  id="companyName"
                  autoComplete="organization"
                  maxLength={120}
                  value={companyName}
                  onChange={(e) => field('companyName', setCompanyName)(e.target.value)}
                  className={inputClass(errors.companyName)}
                />
                <FieldError message={errors.companyName} />
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                {countryField}
                {websiteField(t('business.fields.websiteUrl'))}
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <FieldLabel htmlFor="industry" optional>
                    {t('business.fields.industry')}
                  </FieldLabel>
                  <input
                    id="industry"
                    maxLength={80}
                    placeholder={t('business.fields.industryPlaceholder')}
                    value={industry}
                    onChange={(e) => field('industry', setIndustry)(e.target.value)}
                    className={inputClass(errors.industry)}
                  />
                  <FieldError message={errors.industry} />
                </div>
                <div>
                  <FieldLabel htmlFor="companySize" optional>
                    {t('business.fields.companySize')}
                  </FieldLabel>
                  <select
                    id="companySize"
                    value={companySize}
                    onChange={(e) =>
                      field('companySize', setCompanySize)(e.target.value as CompanySize | '')
                    }
                    className={inputClass(errors.companySize)}
                  >
                    <option value="">{t('business.fields.chooseSize')}</option>
                    {COMPANY_SIZES.map((size) => (
                      <option key={size} value={size}>
                        {t('business.fields.employees', { size })}
                      </option>
                    ))}
                  </select>
                  <FieldError message={errors.companySize} />
                </div>
              </div>
              <div>
                <FieldLabel htmlFor="description" optional>
                  {t('business.fields.description')}
                </FieldLabel>
                <textarea
                  id="description"
                  rows={3}
                  maxLength={1000}
                  value={description}
                  onChange={(e) => field('description', setDescription)(e.target.value)}
                  placeholder={t('business.fields.descriptionPlaceholder')}
                  className={inputClass(errors.description)}
                />
                <FieldError message={errors.description} />
              </div>
            </>
          ) : (
            <>
              <p className="text-sm font-semibold text-gray-900">{t('register.aboutYou')}</p>
              <div>
                <FieldLabel htmlFor="name">{t('register.fullName')}</FieldLabel>
                <input
                  id="name"
                  autoComplete="name"
                  maxLength={100}
                  value={name}
                  onChange={(e) => field('name', setName)(e.target.value)}
                  className={inputClass(errors.name)}
                />
                <FieldError message={errors.name} />
              </div>
              {role === 'representative' && (
                <>
                  <div>
                    <FieldLabel htmlFor="agencyName" optional>
                      {t('register.agencyName')}
                    </FieldLabel>
                    <input
                      id="agencyName"
                      autoComplete="organization"
                      maxLength={120}
                      placeholder={t('register.agencyPlaceholder')}
                      value={agencyName}
                      onChange={(e) => field('agencyName', setAgencyName)(e.target.value)}
                      className={inputClass(errors.agencyName)}
                    />
                    <FieldError message={errors.agencyName} />
                  </div>
                  <div className="grid gap-4 sm:grid-cols-2">
                    {countryField}
                    {websiteField(t('register.managerWebsite'))}
                  </div>
                </>
              )}
            </>
          )}

          <p className="border-t border-gray-200 pt-5 text-sm font-semibold text-gray-900">
            {t('register.loginDetails')}
          </p>
          <div>
            <FieldLabel htmlFor="email">
              {isBusiness ? t('register.workEmail') : t('login.email')}
            </FieldLabel>
            <input
              id="email"
              type="email"
              autoComplete="email"
              dir="ltr"
              value={email}
              onChange={(e) => field('email', setEmail)(e.target.value)}
              className={inputClass(errors.email)}
            />
            <FieldError message={errors.email} />
          </div>
          <PasswordField
            id="password"
            label={
              <>
                {t('login.password')}
                <span className="ms-0.5 text-red-500" aria-hidden="true">
                  *
                </span>
              </>
            }
            autoComplete="new-password"
            value={password}
            onChange={field('password', setPassword)}
            error={errors.password}
            inputClassName={AUTH_INPUT}
          />
          <p className="text-xs text-gray-500">{t('register.passwordHint')}</p>
          <p className="text-xs text-gray-500">{t('register.requiredHint')}</p>

          <button type="submit" disabled={isSubmitting} className={AUTH_BUTTON}>
            {isSubmitting ? t('register.submitting') : t('register.submit')}
            {!isSubmitting && (
              <FontAwesomeIcon
                icon={faArrowRight}
                className="text-xs transition group-hover:translate-x-1 rtl:rotate-180 rtl:group-hover:-translate-x-1"
              />
            )}
          </button>

          <GoogleButton
            mode="signup"
            onCredential={handleGoogle}
            divider={t('login.or')}
            hint={role !== 'talent' ? t('register.googleHint') : undefined}
            busy={isSubmitting}
          />
        </form>

        <p className="mt-7 text-center text-sm text-gray-600">
          {t('register.haveAccount')}{' '}
          <Link to="/login" className="font-medium text-gray-900 underline">
            {t('register.login')}
          </Link>
        </p>
      </div>
    </section>
  )
}

export default Register