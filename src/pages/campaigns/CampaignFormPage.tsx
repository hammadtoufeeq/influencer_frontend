import { useState, type FormEvent, type ReactNode } from 'react'
import { useTranslation } from 'react-i18next'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { useMutation, useQuery } from '@tanstack/react-query'
import toast from 'react-hot-toast'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faArrowLeft } from '@fortawesome/free-solid-svg-icons'
import { createCampaign, updateCampaign } from '../../api/campaigns'
import { campaignQuery, myCampaignsQuery } from '../../api/queries'
import { COUNTRY_OPTIONS } from '../../constants/people'
import { CURRENCIES, SERVICE_CATEGORIES } from '../../constants/services'
import type { Campaign, CampaignInput } from '../../types/campaign'
import type { Currency, ServiceCategory } from '../../types/services'
import { getApiError } from '../../utils/apiError'
import { countryName } from '../../utils/format'

const inputClass = (error?: string) =>
  `w-full rounded-lg border bg-white px-3 py-2 outline-none focus:ring-2 focus:ring-brand ${
    error ? 'border-red-500' : 'border-gray-300'
  }`
const digits = (value: string) => value.replace(/[^\d]/g, '')
const today = () => new Date().toISOString().slice(0, 10)

function Field({
  id,
  label,
  optional,
  error,
  hint,
  children,
}: {
  id: string
  label: string
  optional?: boolean
  error?: string
  hint?: string
  children: ReactNode
}) {
  const { t } = useTranslation()
  return (
    <div>
      <label htmlFor={id} className="mb-1 block text-sm font-medium">
        {label}
        {optional ? (
          <span className="ms-1 text-xs font-normal text-gray-400">({t('register.optional')})</span>
        ) : (
          <span className="ms-0.5 text-red-500" aria-hidden="true">
            *
          </span>
        )}
      </label>
      {children}
      {hint && !error && <p className="mt-1 text-xs text-gray-500">{hint}</p>}
      {error && <p className="mt-1 text-sm text-red-600">{error}</p>}
    </div>
  )
}

// Naya ya maujooda campaign: ek hi form
function CampaignForm({ campaign, canPublish }: { campaign?: Campaign; canPublish: boolean }) {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const [title, setTitle] = useState(campaign?.title ?? '')
  const [brief, setBrief] = useState(campaign?.brief ?? '')
  const [category, setCategory] = useState<ServiceCategory>(campaign?.category ?? 'brand_campaign')
  const [amount, setAmount] = useState(campaign?.budget ? String(campaign.budget.amount) : '')
  const [currency, setCurrency] = useState<Currency>(campaign?.budget?.currency ?? 'PKR')
  const [country, setCountry] = useState(campaign?.country ?? '')
  const [deadline, setDeadline] = useState(campaign?.deadline?.slice(0, 10) ?? '')
  const [slots, setSlots] = useState(String(campaign?.slots ?? 1))
  const [errors, setErrors] = useState<Record<string, string>>({})

  const save = useMutation({
    mutationFn: (status?: 'draft' | 'open') => {
      const input: CampaignInput = {
        title: title.trim(),
        brief: brief.trim(),
        category,
        budget: amount ? { amount: Number(amount), currency } : null,
        country,
        deadline: deadline || null,
        slots: Number(slots),
        ...(status ? { status } : {}),
      }
      return campaign ? updateCampaign(campaign._id, input) : createCampaign(input)
    },
    onSuccess: (saved) => {
      toast.success(
        saved.status === 'open' && campaign?.status !== 'open'
          ? t('campaigns.published')
          : t('campaigns.saved'),
      )
      navigate(`/dashboard/campaigns/${saved._id}`)
    },
    onError: (error) => {
      const { message, fields } = getApiError(error)
      setErrors(fields)
      toast.error(message)
    },
  })

  function validate() {
    const found: Record<string, string> = {}
    if (title.trim().length < 3) found.title = t('campaigns.errors.title')
    if (brief.trim().length < 30) found.brief = t('campaigns.errors.brief', { count: 30 })
    const n = Number(slots)
    if (!Number.isInteger(n) || n < 1 || n > 100) found.slots = t('campaigns.errors.slots')
    if (deadline && deadline < today()) found.deadline = t('campaigns.errors.deadline')
    setErrors(found)
    return Object.keys(found).length === 0
  }

  function submit(status?: 'draft' | 'open') {
    if (validate()) save.mutate(status)
  }
  function handleSubmit(e: FormEvent) {
    e.preventDefault()
    // Naya: verified ho to seedha open, warna draft. Maujooda: halat wahi rehti hai
    submit(campaign ? undefined : canPublish ? 'open' : 'draft')
  }
  const clear = (key: string) => errors[key] && setErrors((prev) => ({ ...prev, [key]: '' }))

  return (
    <form
      onSubmit={handleSubmit}
      noValidate
      className="space-y-5 rounded-2xl bg-white p-5 shadow-sm ring-1 ring-gray-200/70 md:p-6"
    >
      {!canPublish && (
        <p className="rounded-xl bg-amber-50 px-4 py-3 text-sm text-amber-800">
          {t('campaigns.verifyToPublish')}{' '}
          <Link to="/dashboard/business" className="font-medium underline">
            {t('campaigns.verifyNow')}
          </Link>
        </p>
      )}
      <Field id="title" label={t('campaigns.fields.title')} error={errors.title}>
        <input
          id="title"
          maxLength={120}
          value={title}
          onChange={(e) => {
            setTitle(e.target.value)
            clear('title')
          }}
          placeholder={t('campaigns.fields.titlePlaceholder')}
          className={inputClass(errors.title)}
        />
      </Field>
      <Field id="category" label={t('campaigns.fields.category')} error={errors.category}>
        <select
          id="category"
          value={category}
          onChange={(e) => setCategory(e.target.value as ServiceCategory)}
          className={inputClass(errors.category)}
        >
          {SERVICE_CATEGORIES.map((c) => (
            <option key={c.value} value={c.value}>
              {t(`services.category.${c.value}`)}
            </option>
          ))}
        </select>
      </Field>
      <Field
        id="brief"
        label={t('campaigns.fields.brief')}
        error={errors.brief}
        hint={t('campaigns.fields.briefHint')}
      >
        <textarea
          id="brief"
          rows={7}
          maxLength={3000}
          value={brief}
          onChange={(e) => {
            setBrief(e.target.value)
            clear('brief')
          }}
          placeholder={t('campaigns.fields.briefPlaceholder')}
          className={`${inputClass(errors.brief)} resize-y`}
        />
      </Field>

      <div className="grid gap-4 sm:grid-cols-[110px_1fr]">
        <Field id="currency" label={t('services.fields.currency')} optional>
          <select
            id="currency"
            value={currency}
            onChange={(e) => setCurrency(e.target.value as Currency)}
            className={inputClass()}
          >
            {CURRENCIES.map((c) => (
              <option key={c}>{c}</option>
            ))}
          </select>
        </Field>
        <Field
          id="amount"
          label={t('campaigns.fields.budget')}
          optional
          error={errors['budget.amount'] ?? errors.budget}
          hint={t('campaigns.fields.budgetHint')}
        >
          <input
            id="amount"
            inputMode="numeric"
            value={amount}
            onChange={(e) => {
              setAmount(digits(e.target.value))
              clear('budget.amount')
            }}
            className={inputClass(errors['budget.amount'])}
          />
        </Field>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <Field id="country" label={t('campaigns.fields.country')} optional error={errors.country}>
          <select
            id="country"
            value={country}
            onChange={(e) => setCountry(e.target.value)}
            className={inputClass(errors.country)}
          >
            <option value="">{t('campaigns.anyCountry')}</option>
            {COUNTRY_OPTIONS.map((code) => (
              <option key={code} value={code}>
                {countryName(code)}
              </option>
            ))}
          </select>
        </Field>
        <Field
          id="deadline"
          label={t('campaigns.fields.deadline')}
          optional
          error={errors.deadline}
        >
          <input
            id="deadline"
            type="date"
            min={today()}
            value={deadline}
            onChange={(e) => {
              setDeadline(e.target.value)
              clear('deadline')
            }}
            className={inputClass(errors.deadline)}
          />
        </Field>
        <Field
          id="slots"
          label={t('campaigns.fields.slots')}
          error={errors.slots}
          hint={t('campaigns.fields.slotsHint')}
        >
          <input
            id="slots"
            inputMode="numeric"
            value={slots}
            onChange={(e) => {
              setSlots(digits(e.target.value).slice(0, 3))
              clear('slots')
            }}
            className={inputClass(errors.slots)}
          />
        </Field>
      </div>

      <div className="flex flex-col-reverse gap-2 border-t border-gray-100 pt-5 sm:flex-row sm:justify-end">
        {!campaign && canPublish && (
          <button
            type="button"
            disabled={save.isPending}
            onClick={() => submit('draft')}
            className="rounded-xl border border-gray-300 px-4 py-2.5 text-sm font-medium hover:bg-gray-50 disabled:opacity-60"
          >
            {t('campaigns.saveDraft')}
          </button>
        )}
        <button
          type="submit"
          disabled={save.isPending}
          className="rounded-xl bg-brand px-5 py-2.5 text-sm font-medium text-on-brand hover:bg-brand-hover disabled:opacity-60"
        >
          {save.isPending
            ? t('settings.saving')
            : campaign
              ? t('services.saveChanges')
              : canPublish
                ? t('campaigns.publish')
                : t('campaigns.saveDraft')}
        </button>
      </div>
    </form>
  )
}

// /dashboard/campaigns/new aur /dashboard/campaigns/:id/edit
function CampaignFormPage() {
  const { t } = useTranslation()
  const { id } = useParams()
  const mine = useQuery(myCampaignsQuery)
  const existing = useQuery({ ...campaignQuery(id ?? ''), enabled: Boolean(id) })
  const loading = mine.isLoading || (Boolean(id) && existing.isLoading)

  return (
    <div className="mx-auto max-w-3xl space-y-5">
      <Link
        to={id ? `/dashboard/campaigns/${id}` : '/dashboard/campaigns'}
        className="inline-flex items-center gap-2 text-sm font-medium text-gray-600 hover:text-gray-900"
      >
        <FontAwesomeIcon icon={faArrowLeft} className="text-xs rtl:rotate-180" />
        {t('campaigns.back')}
      </Link>
      <div>
        <h1 className="text-2xl font-bold tracking-tight">
          {id ? t('campaigns.edit') : t('campaigns.new')}
        </h1>
        <p className="mt-1 text-sm text-gray-500">{t('campaigns.formSubtitle')}</p>
      </div>
      {loading ? (
        <div className="h-96 animate-pulse rounded-2xl bg-gray-200/70" />
      ) : id && (!existing.data || !existing.data.isOwner) ? (
        <p className="rounded-2xl bg-white p-6 text-center shadow-sm">{t('campaigns.notFound')}</p>
      ) : (
        <CampaignForm
          key={existing.data?.campaign._id ?? 'new'}
          campaign={existing.data?.campaign}
          canPublish={mine.data?.canPublish ?? false}
        />
      )}
    </div>
  )
}

export default CampaignFormPage
