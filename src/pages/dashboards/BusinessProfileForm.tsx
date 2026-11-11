import { useState, type FormEvent } from 'react'
import { useTranslation } from 'react-i18next'
import { Link, useNavigate } from 'react-router-dom'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import toast from 'react-hot-toast'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faArrowLeft, faPlus, faTrash } from '@fortawesome/free-solid-svg-icons'
import { saveMyBusiness } from '../../api/business'
import { myBusinessQuery } from '../../api/queries'
import FormField from '../../components/FormField'
import { COUNTRY_OPTIONS } from '../../constants/people'
import {
  COMPANY_SIZES,
  ORGANIZATION_TYPES,
  type BusinessInput,
  type BusinessProfile,
} from '../../types/business'
import { getApiError } from '../../utils/apiError'
import { useAuth } from '../../hooks/useAuth'
import PhotoUploader from '../../components/PhotoUploader'
import { removeAvatar, uploadAvatar } from '../../api/auth'
import type { User } from '../../types/user'
import { countryName } from '../../utils/format'

const MAX_LINKS = 5
const selectClass =
  'w-full rounded-lg border border-gray-300 bg-white px-3 py-2 outline-none focus:ring-2 focus:ring-brand'

// Pehli dafa: signup pe di gayi organization details se shuru (User.company)
function toForm(business: BusinessProfile | null, signup?: User['company']): BusinessInput {
  return {
    organizationType: business?.organizationType ?? signup?.organizationType ?? '',
    companyName: business?.companyName ?? signup?.companyName ?? '',
    industry: business?.industry ?? signup?.industry ?? '',
    companySize: business?.companySize ?? signup?.companySize ?? '',
    description: business?.description ?? signup?.description ?? '',
    websiteUrl: business?.websiteUrl ?? signup?.websiteUrl ?? '',
    registrationNumber: business?.registrationNumber ?? '',
    country: business?.country ?? signup?.country ?? 'PK',
    city: business?.city ?? '',
    contactPhone: business?.contactPhone ?? '',
    proofLinks: business?.proofLinks.length ? business.proofLinks : [''],
  }
}

// Form alag taake saved details aate hi un se shuru ho
function BusinessForm({ business }: { business: BusinessProfile | null }) {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const { user, updateUser } = useAuth()
  const [form, setForm] = useState<BusinessInput>(() => toForm(business, user?.company))
  const [errors, setErrors] = useState<Record<string, string>>({})

  const update = <K extends keyof BusinessInput>(key: K, value: BusinessInput[K]) => {
    setForm((prev) => ({ ...prev, [key]: value }))
    setErrors((prev) => ({ ...prev, [key]: '' }))
  }

  const save = useMutation({
    mutationFn: () =>
      saveMyBusiness({
        ...form,
        organizationType: form.organizationType || undefined,
        proofLinks: form.proofLinks.map((l) => l.trim()).filter(Boolean),
      }),
    onSuccess: (saved) => {
      queryClient.setQueryData(myBusinessQuery.queryKey, saved)
      // Pehli dafa, ya tasdeeq shuru se (pehchaan badli / reject ke baad) = "bhej diya"
      const restarted = saved.status === 'pending' && business?.status !== 'pending'
      toast.success(restarted ? t('business.submitted') : t('business.saved'))
      navigate('/dashboard')
    },
    onError: (error) => {
      const { message, fields } = getApiError(error)
      setErrors(fields)
      toast.error(message)
    },
  })

  function handleSubmit(e: FormEvent) {
    e.preventDefault()
    save.mutate()
  }

  const setLink = (index: number, value: string) =>
    update(
      'proofLinks',
      form.proofLinks.map((link, i) => (i === index ? value : link)),
    )

  return (
    <form onSubmit={handleSubmit} className="space-y-5 rounded-2xl bg-white p-5 shadow-sm md:p-6">
      {/* Sab se upar: apni photo / logo (foran save, cards aur page pe dikhta hai) */}
      {user && (
        <div className="border-b border-gray-100 pb-5">
          <PhotoUploader
            name={user.name}
            photoUrl={user.avatarUrl}
            shape="square"
            label={t('photo.logoLabel')}
            onUpload={async (file) => updateUser(await uploadAvatar(file))}
            onRemove={async () => updateUser(await removeAvatar())}
          />
        </div>
      )}
      {business && business.status !== 'rejected' && (
        <p className="rounded-xl bg-amber-50 px-4 py-3 text-sm text-amber-800">
          {t('business.identityWarning')}
        </p>
      )}
      {business?.status === 'rejected' && business.rejectionReason && (
        <p className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">
          {t('business.rejected', { reason: business.rejectionReason })}
        </p>
      )}

      <label className="block">
        <span className="mb-1 block text-sm font-medium">{t('register.orgType')}</span>
        <select
          value={form.organizationType}
          onChange={(e) =>
            update('organizationType', e.target.value as BusinessInput['organizationType'])
          }
          className={selectClass}
        >
          <option value="">{t('register.chooseOrgType')}</option>
          {ORGANIZATION_TYPES.map((type) => (
            <option key={type} value={type}>
              {t(`orgType.${type}`)}
            </option>
          ))}
        </select>
        {errors.organizationType && (
          <span className="mt-1 block text-sm text-red-600">{errors.organizationType}</span>
        )}
      </label>
      <FormField
        id="companyName"
        label={t('register.orgName')}
        value={form.companyName}
        onChange={(e) => update('companyName', e.target.value)}
        error={errors.companyName}
        required
      />
      <div className="grid gap-4 sm:grid-cols-2">
        <FormField
          id="industry"
          label={t('business.fields.industry')}
          placeholder={t('business.fields.industryPlaceholder')}
          value={form.industry}
          onChange={(e) => update('industry', e.target.value)}
          error={errors.industry}
        />
        <label className="block">
          <span className="mb-1 block text-sm font-medium">{t('business.fields.companySize')}</span>
          <select
            value={form.companySize}
            onChange={(e) => update('companySize', e.target.value as BusinessInput['companySize'])}
            className={selectClass}
          >
            <option value="">{t('business.fields.chooseSize')}</option>
            {COMPANY_SIZES.map((size) => (
              <option key={size} value={size}>
                {t('business.fields.employees', { size })}
              </option>
            ))}
          </select>
        </label>
      </div>
      <label className="block">
        <span className="mb-1 block text-sm font-medium">{t('business.fields.description')}</span>
        <textarea
          rows={4}
          maxLength={1000}
          value={form.description}
          onChange={(e) => update('description', e.target.value)}
          placeholder={t('business.fields.descriptionPlaceholder')}
          className="w-full rounded-lg border border-gray-300 px-3 py-2 outline-none focus:ring-2 focus:ring-brand"
        />
      </label>
      <div className="grid gap-4 sm:grid-cols-2">
        <FormField
          id="websiteUrl"
          type="url"
          label={t('business.fields.websiteUrl')}
          placeholder="https://..."
          value={form.websiteUrl}
          onChange={(e) => update('websiteUrl', e.target.value)}
          error={errors.websiteUrl}
          required
        />
        <FormField
          id="registrationNumber"
          label={t('business.fields.registrationNumber')}
          placeholder={t('business.fields.registrationPlaceholder')}
          value={form.registrationNumber}
          onChange={(e) => update('registrationNumber', e.target.value)}
          error={errors.registrationNumber}
        />
      </div>
      <div className="grid gap-4 sm:grid-cols-3">
        <label className="block">
          <span className="mb-1 block text-sm font-medium">{t('business.fields.country')}</span>
          <select
            value={form.country}
            onChange={(e) => update('country', e.target.value)}
            className={selectClass}
          >
            {COUNTRY_OPTIONS.map((code) => (
              <option key={code} value={code}>
                {countryName(code)}
              </option>
            ))}
          </select>
        </label>
        <FormField
          id="city"
          label={t('business.fields.city')}
          value={form.city}
          onChange={(e) => update('city', e.target.value)}
          error={errors.city}
        />
        <FormField
          id="contactPhone"
          type="tel"
          label={t('business.fields.contactPhone')}
          placeholder="+92 300 1234567"
          value={form.contactPhone}
          onChange={(e) => update('contactPhone', e.target.value)}
          error={errors.contactPhone}
        />
      </div>

      <fieldset>
        <legend className="text-sm font-medium">{t('business.fields.proofLinks')}</legend>
        <p className="mt-0.5 text-xs text-gray-500">{t('business.fields.proofLinksHint')}</p>
        <div className="mt-2 space-y-2">
          {form.proofLinks.map((link, index) => (
            <div key={index}>
              <div className="flex gap-2">
                <input
                  type="url"
                  aria-label={t('business.fields.proofLinks')}
                  placeholder="https://..."
                  value={link}
                  onChange={(e) => setLink(index, e.target.value)}
                  className={`w-full rounded-lg border px-3 py-2 outline-none focus:ring-2 focus:ring-brand ${
                    errors[`proofLinks.${index}`] ? 'border-red-500' : 'border-gray-300'
                  }`}
                />
                {form.proofLinks.length > 1 && (
                  <button
                    type="button"
                    aria-label={t('business.fields.removeLink')}
                    onClick={() =>
                      update(
                        'proofLinks',
                        form.proofLinks.filter((_, i) => i !== index),
                      )
                    }
                    className="rounded-lg border border-gray-300 px-3 text-gray-500 hover:bg-gray-100"
                  >
                    <FontAwesomeIcon icon={faTrash} />
                  </button>
                )}
              </div>
              {errors[`proofLinks.${index}`] && (
                <p className="mt-1 text-sm text-red-600">{errors[`proofLinks.${index}`]}</p>
              )}
            </div>
          ))}
        </div>
        {form.proofLinks.length < MAX_LINKS && (
          <button
            type="button"
            onClick={() => update('proofLinks', [...form.proofLinks, ''])}
            className="mt-2 inline-flex items-center gap-1.5 text-sm underline"
          >
            <FontAwesomeIcon icon={faPlus} className="text-xs" />
            {t('business.fields.addLink')}
          </button>
        )}
      </fieldset>

      <div className="flex flex-wrap justify-end gap-2 border-t border-gray-100 pt-5">
        <Link
          to="/dashboard"
          className="rounded-lg border border-gray-300 px-4 py-2 text-sm hover:bg-gray-100"
        >
          {t('common.cancel')}
        </Link>
        <button
          type="submit"
          disabled={save.isPending}
          className="rounded-lg bg-brand px-5 py-2 text-sm font-medium text-on-brand hover:bg-brand-hover disabled:opacity-60"
        >
          {save.isPending
            ? t('common.saving')
            : business && business.status !== 'rejected'
              ? t('common.save')
              : t('business.submit')}
        </button>
      </div>
    </form>
  )
}

// /dashboard/business -> business apni company ki details verification ke liye bhejta hai
function BusinessProfileForm() {
  const { t } = useTranslation()
  const { data: business, isLoading, isError } = useQuery(myBusinessQuery)

  return (
    <div className="mx-auto max-w-3xl space-y-5">
      <Link to="/dashboard" className="inline-flex items-center gap-2 text-sm underline">
        <FontAwesomeIcon icon={faArrowLeft} className="rtl:rotate-180" />
        {t('site.backToDashboard')}
      </Link>
      <div>
        <h1 className="text-2xl font-bold">
          {business ? t('business.editTitle') : t('business.formTitle')}
        </h1>
        <p className="mt-1 text-sm text-gray-500">{t('business.formSubtitle')}</p>
      </div>
      {isLoading && <div className="h-96 animate-pulse rounded-2xl bg-white shadow-sm" />}
      {isError && business === undefined && (
        <p className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">{t('common.error')}</p>
      )}
      {!isLoading && business !== undefined && <BusinessForm business={business ?? null} />}
    </div>
  )
}

export default BusinessProfileForm
