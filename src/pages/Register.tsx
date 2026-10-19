import { useTranslation } from 'react-i18next'
import { useState, type FormEvent, type ReactNode } from 'react'
import { Link, Navigate, useNavigate, useSearchParams } from 'react-router-dom'
import toast from 'react-hot-toast'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import type { IconDefinition } from '@fortawesome/fontawesome-svg-core'
import { faArrowLeft, faBuilding, faStar, faUserTie } from '@fortawesome/free-solid-svg-icons'
import PasswordField from '../components/PasswordField'
import { COUNTRY_OPTIONS } from '../constants/people'
import { SIGNUP_ROLE_OPTIONS } from '../constants/roles'
import {
  COMPANY_SIZES,
  ORGANIZATION_TYPES,
  type CompanySize,
  type OrganizationType,
} from '../types/business'
import type { RegisterInput } from '../api/auth'
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
  `min-h-11 w-full rounded-lg border bg-white px-3 py-2 text-gray-900 outline-none transition placeholder:text-gray-400 focus:border-gray-900 focus:ring-2 focus:ring-gray-900/10 ${error ? 'border-red-500' : 'border-gray-300'
  }`
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

function Register() {
  const { t } = useTranslation()
  const { user, register } = useAuth()
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

  function payload(current: SignupRole): RegisterInput {
    const base = { email: email.trim(), password, role: current }
    if (current === 'talent') return { ...base, name: name.trim() }
    if (current === 'representative') {
      return {
        ...base,
        name: name.trim(),
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


  if (!role) {
    return (
      <section className="mx-auto grid w-full max-w-[1040px] overflow-hidden rounded-[28px] border border-gray-200 bg-white shadow-[0_24px_70px_rgb(23_23_23_/_9%)] md:grid-cols-[minmax(230px,0.72fr)_minmax(0,1.28fr)] max-md:block max-md:rounded-[22px]">
        
        <div className="keep-dark relative flex min-h-[580px] flex-col overflow-hidden bg-gray-900 px-[34px] py-[42px] text-white max-md:min-h-0 max-md:px-6 max-md:py-[26px] max-md:pb-[30px] before:absolute before:-right-[110px] before:-top-[90px] before:h-[290px] before:w-[290px] before:rounded-full before:bg-[#e85d3f] before:opacity-90 after:absolute after:-bottom-[110px] after:-right-[70px] after:h-[250px] after:w-[250px] after:rounded-full after:border after:border-white/20">
          
          
          <span className="relative z-10 mt-auto flex h-[54px] w-[54px] items-center justify-center rounded-[17px] bg-[#e85d3f] text-[1.2rem] max-md:mt-7">
            <FontAwesomeIcon icon={faStar} />
          </span>
         
          <h1 className="relative z-10 mt-6 max-w-[240px] font-display text-[clamp(2rem,4vw,3.25rem)] font-bold leading-[0.98] tracking-[-0.04em] max-md:mt-[34px] max-md:max-w-[330px] max-md:text-4xl">
            {t('register.title')}
          </h1>
          <p className="relative z-10 mt-[18px] max-w-[270px] text-[0.9rem] leading-[1.65] text-gray-300 max-md:mt-3">
            {t('register.subtitle')}
          </p>
          <div className="relative z-10 mt-8 flex gap-2 max-md:mt-5" aria-hidden="true">
            <span className="block h-[5px] w-[62px] animate-pulse rounded-[5px] bg-[#f8a08e]" />
            <span className="block h-[5px] w-[34px] rounded-[5px] bg-white/35" />
            <span className="block h-[5px] w-[34px] rounded-[5px] bg-white/35" />
          </div>
        </div>

        {/* Right content */}
        <div className="min-w-0 px-12 py-[42px] max-md:px-[22px] max-md:py-[30px]">
          <div className="flex items-center gap-[9px] text-[0.72rem] font-bold uppercase tracking-[0.04em] text-gray-500">
            <span className="inline-flex h-[25px] w-[25px] items-center justify-center rounded-full bg-gray-900 text-white">
              1
            </span>
            <span className="h-px w-[30px] bg-gray-300" />
            <span className="inline-flex h-[25px] w-[25px] items-center justify-center rounded-full border border-gray-300">
              2
            </span>
            <span>{t('register.title')}</span>
          </div>
          <h2 className="mt-5 font-display text-[clamp(1.75rem,3vw,2.35rem)] font-bold tracking-[-0.04em] text-gray-900">
            {t('register.title')}
          </h2>
          <p className="mt-2 text-[0.92rem] leading-[1.55] text-gray-600">{t('register.subtitle')}</p>

          <div className="mt-7 grid gap-3 md:grid-cols-3">
            {SIGNUP_ROLE_OPTIONS.map((option) => (
              <button
                key={option.value}
                type="button"
                onClick={() => chooseRole(option.value)}
                className="group flex flex-col items-start rounded-xl border border-gray-200 bg-white p-5 text-start transition hover:-translate-y-1 hover:border-gray-900 hover:shadow-[0_12px_24px_rgb(23_23_23_/_8%)] focus-visible:ring-2 focus-visible:ring-gray-900 focus-visible:outline-none"
              >
                <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-gray-900 text-white transition group-hover:bg-[#e85d3f]">
                  <FontAwesomeIcon icon={ROLE_ICONS[option.value]} />
                </span>
                <span className="mt-4 block font-semibold text-gray-900">{option.label}</span>
                <span className="mt-1 block flex-1 text-sm text-gray-600">{option.description}</span>
                <span className="mt-4 text-sm font-medium text-gray-900 underline-offset-4 group-hover:underline">
                  {t('register.continueAs', { type: option.label })}
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

  // ✅ Qadam 2: form — SAME structure as Step 1
  return (
    <section className="mx-auto grid w-full max-w-[1040px] overflow-hidden rounded-[28px] border border-gray-200 bg-white shadow-[0_24px_70px_rgb(23_23_23_/_9%)] md:grid-cols-[minmax(230px,0.72fr)_minmax(0,1.28fr)] max-md:block max-md:rounded-[22px]">
      {/* ✅ Left aside — keep-dark. SAME structure as Step 1 */}
      <div className="keep-dark relative flex min-h-[650px] flex-col overflow-hidden bg-gray-900 px-[34px] py-[42px] text-white max-md:min-h-0 max-md:px-6 max-md:py-[26px] max-md:pb-[30px] before:absolute before:-right-[110px] before:-top-[90px] before:h-[290px] before:w-[290px] before:rounded-full before:bg-[#e85d3f] before:opacity-90 after:absolute after:-bottom-[110px] after:-right-[70px] after:h-[250px] after:w-[250px] after:rounded-full after:border after:border-white/20">
       
        {/* ✅ Icon — mt-auto se bottom push */}
        <span className="relative z-10 mt-auto flex h-[54px] w-[54px] items-center justify-center rounded-[17px] bg-[#e85d3f] text-[1.2rem] max-md:mt-7">
          <FontAwesomeIcon icon={ROLE_ICONS[role]} />
        </span>
        {/* ✅ Title — mt-6 fixed gap (SAME as Step 1) */}
        <h1 className="relative z-10 mt-6 max-w-[240px] font-display text-[clamp(2rem,4vw,3.25rem)] font-bold leading-[0.98] tracking-[-0.04em] max-md:mt-[34px] max-md:max-w-[330px] max-md:text-4xl">
          {t('register.signUpAs', { type: option.label })}
        </h1>
        <p className="relative z-10 mt-[18px] max-w-[270px] text-[0.9rem] leading-[1.65] text-gray-300 max-md:mt-3">
          {t(`register.note.${role}`)}
        </p>
        <div className="relative z-10 mt-8 flex gap-2 max-md:mt-5" aria-hidden="true">
          <span className="block h-[5px] w-[62px] rounded-[5px] bg-[#f8a08e]" />
          <span className="block h-[5px] w-[34px] rounded-[5px] bg-white opacity-35" />
          <span className="block h-[5px] w-[34px] rounded-[5px] bg-white opacity-35" />
        </div>
      </div>

      {/* Right content */}
      <div className="min-w-0 px-12 py-[42px] max-md:px-[22px] max-md:py-[30px]">
        <button
          type="button"
          onClick={() => chooseRole(null)}
          className="inline-flex items-center gap-2 text-sm font-medium text-gray-500 hover:text-gray-900"
        >
          <FontAwesomeIcon icon={faArrowLeft} className="text-xs rtl:rotate-180" />
          {t('register.changeType')}
        </button>

        <div className="mt-6 flex items-center gap-[9px] text-[0.72rem] font-bold uppercase tracking-[0.04em] text-gray-500">
          <span className="inline-flex h-[25px] w-[25px] items-center justify-center rounded-full bg-gray-900 text-white">
            1
          </span>
          <span className="h-px w-[30px] bg-gray-900" />
          <span className="inline-flex h-[25px] w-[25px] items-center justify-center rounded-full bg-gray-900 text-white">
            2
          </span>
          <span>{t('register.loginDetails')}</span>
        </div>

        <h2 className="mt-5 font-display text-[clamp(1.75rem,3vw,2.35rem)] font-bold tracking-[-0.04em] text-gray-900">
          {t('register.signUpAs', { type: option.label })}
        </h2>
        <p className="mt-2 text-[0.92rem] leading-[1.55] text-gray-600">
          {t(`register.note.${role}`)}
        </p>

        <form onSubmit={handleSubmit} className="mt-7 space-y-5" noValidate>
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
          />
          <p className="text-xs text-gray-500">{t('register.passwordHint')}</p>
          <p className="text-xs text-gray-500">{t('register.requiredHint')}</p>
          <button
            type="submit"
            disabled={isSubmitting}
            className="keep-dark w-full rounded-lg bg-gray-900 py-3 font-medium text-white transition hover:-translate-y-px hover:bg-gray-800 hover:shadow-[0_10px_20px_rgb(23_23_23_/_18%)] disabled:opacity-60"
          >
            {isSubmitting ? t('register.submitting') : t('register.submit')}
          </button>
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