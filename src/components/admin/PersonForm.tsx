import { useTranslation } from 'react-i18next'
import { useEffect, useState, type FormEvent, type ReactNode } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import toast from 'react-hot-toast'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faArrowsRotate } from '@fortawesome/free-solid-svg-icons'
import FormField from '../FormField'
import PhotoUploader from '../PhotoUploader'
import { removePersonPhoto, uploadPersonPhoto } from '../../api/auth'
import { refreshFollowers } from '../../api/admin'
import TaxonomyPicker from './TaxonomyPicker'
import {
  COUNTRY_OPTIONS,
  LANGUAGE_OPTIONS,
  PLATFORM_LABELS,
  STATUS_LABELS,
} from '../../constants/people'
import { useTaxonomy } from '../../hooks/useTaxonomy'
import type { PersonInput } from '../../types/admin'
import type { Person, ProfileStatus, SocialAccount, SocialPlatform } from '../../types/person'
import { getApiError } from '../../utils/apiError'
import { countryName, formatCount, languageName } from '../../utils/format'
import { FOLLOWER_PLATFORMS, handleFromUrl } from '../../utils/socialHandle'

const SOURCE_TYPES = ['public_web', 'research_sheet', 'self_submitted', 'admin']

// Form ke andar sab kuch string mein rakhte hain (inputs strings dete hain)
interface SocialRow {
  platform: SocialPlatform
  url: string
  handle: string
  engagementRate: string
}

interface FormState {
  name: string
  headline: string
  bio: string
  photoUrl: string
  websiteUrl: string
  country: string
  city: string
  languages: string[]
  professions: string[]
  industries: string[]
  topics: string[]
  socialAccounts: SocialRow[]
  status: ProfileStatus
  visibility: 'visible' | 'hidden'
  sourceType: string
  sourceUrl: string
  sourceNote: string
}

const emptySocial = (): SocialRow => ({
  platform: 'instagram',
  url: '',
  handle: '',
  engagementRate: '',
})

// Form ki row ka saved account (wahi platform + handle, ya wahi link)
function savedAccount(person: Person | undefined, row: SocialRow): SocialAccount | undefined {
  const handle = row.handle.trim().replace(/^@+/, '').toLowerCase()
  return person?.socialAccounts.find(
    (a) =>
      a.platform === row.platform &&
      (handle ? a.handle?.toLowerCase() === handle : a.url === row.url.trim()),
  )
}

function toFormState(person?: Person, needsSocial = false): FormState {
  const socialAccounts =
    person?.socialAccounts.map((a) => ({
      platform: a.platform,
      url: a.url,
      handle: a.handle ?? '',
      engagementRate: a.engagementRate?.toString() ?? '',
    })) ?? []
  return {
    name: person?.name ?? '',
    headline: person?.headline ?? '',
    bio: person?.bio ?? '',
    photoUrl: person?.photoUrl ?? '',
    websiteUrl: person?.websiteUrl ?? '',
    country: person?.country ?? 'PK',
    city: person?.city ?? '',
    languages: person?.languages ?? [],
    professions: person?.professions.map((t) => t.slug) ?? [],
    industries: person?.industries.map((t) => t.slug) ?? [],
    topics: person?.topics.map((t) => t.slug) ?? [],
    // Talent ke liye ek social account zaroori: khali ho to ek khana pehle se khula
    socialAccounts: socialAccounts.length || !needsSocial ? socialAccounts : [emptySocial()],
    status: person?.status ?? 'public',
    visibility: person?.visibility ?? 'visible',
    sourceType: 'public_web',
    sourceUrl: '',
    sourceNote: '',
  }
}

// Form ki strings ko backend wali shakal mein badlo
function toInput(form: FormState, isNew: boolean, mode: PersonFormMode): PersonInput {
  const input: PersonInput = {
    headline: form.headline,
    bio: form.bio,
    photoUrl: form.photoUrl,
    websiteUrl: form.websiteUrl,
    city: form.city,
    languages: form.languages,
    professions: form.professions,
    industries: form.industries,
    topics: form.topics,
    socialAccounts: form.socialAccounts.map((row) => ({
      platform: row.platform,
      url: row.url.trim(),
      handle: row.handle.trim() || undefined,
      // Followers yahan se nahi jate: backend khud laata hai
      engagementRate: row.engagementRate ? Number(row.engagementRate) : undefined,
    })),
  }
  if (form.country) input.country = form.country

  // Owner sirf apne fields bhejta hai. Naam aur state admin ka kaam hai.
  // Verified yahan nahi: woh sirf claim ke baad card ke button se hota hai
  if (mode === 'owner') return input
  // Talent apni nayi profile bhej raha hai: naam bhi, baqi admin wali cheezein nahi
  if (mode === 'submit') {
    input.name = form.name
    return input
  }

  input.name = form.name
  input.status = form.status

  if (isNew) {
    input.sourceRecords = [
      {
        sourceType: form.sourceType,
        url: form.sourceUrl.trim() || undefined,
        note: form.sourceNote.trim() || undefined,
      },
    ]
  } else {
    input.visibility = form.visibility
  }
  return input
}

// 'owner' = talent apni profile edit kar raha hai
// 'submit' = talent ko profile na mili, nayi khud bhej raha hai
type PersonFormMode = 'admin' | 'owner' | 'submit'

interface PersonFormProps {
  person?: Person
  mode?: PersonFormMode
  isSaving: boolean
  errors: Record<string, string>
  onSubmit: (input: PersonInput) => void
  // Submit button se pehle extra hissa (jaise admin ke liye note)
  children?: ReactNode
  submitLabel?: string
  // Nayi profile (abhi id nahi): photo yahin chuni jati hai, profile bhejne ke baad upload
  onPhotoChange?: (file: File | null) => void
}

const selectClass = 'w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm'
const sectionClass = 'space-y-4 rounded-2xl bg-white p-6 shadow-sm'

function PersonForm({
  person,
  mode = 'admin',
  isSaving,
  errors,
  onSubmit,
  children,
  submitLabel,
  onPhotoChange,
}: PersonFormProps) {
  const { t, i18n } = useTranslation()
  const isNew = !person
  const isOwner = mode === 'owner'
  const isAdmin = mode === 'admin'
  // Talent (apni profile / nayi profile): kam az kam ek social account zaroori, website optional
  const needsSocial = !isAdmin
  // Photo upload: maalik (ya us ka manager), ya admin unclaimed profile pe
  const canUploadPhoto = Boolean(person) && (isOwner || (isAdmin && !person?.claimedBy))
  const queryClient = useQueryClient()
  const [form, setForm] = useState<FormState>(() => toFormState(person, needsSocial))
  // Nayi profile ki chuni hui photo ka preview (browser ke andar ka link)
  const [photoPreview, setPhotoPreview] = useState('')
  useEffect(() => () => URL.revokeObjectURL(photoPreview), [photoPreview])
  // Yahin ki jaanch ke errors (server ke errors ke upar)
  const [localErrors, setLocalErrors] = useState<Record<string, string>>({})
  const shownErrors = { ...errors, ...localErrors }
  const { data: professions = [] } = useTaxonomy('professions')
  const { data: industries = [] } = useTaxonomy('industries')
  const { data: topics = [] } = useTaxonomy('topics')

  function update<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((prev) => ({ ...prev, [key]: value }))
  }

  function updateSocial(index: number, patch: Partial<SocialRow>) {
    update(
      'socialAccounts',
      form.socialAccounts.map((row, i) => {
        if (i !== index) return row
        const next = { ...row, ...patch }
        // Handle khali ho ya pichle link se bana ho to naye link se khud bharo
        const before = handleFromUrl(row.platform, row.url)
        if ((patch.url !== undefined || patch.platform) && (!row.handle || row.handle === before)) {
          next.handle = handleFromUrl(next.platform, next.url)
        }
        return next
      }),
    )
  }

  // Followers abhi dobara lao (ghante mein ek dafa)
  const refresh = useMutation({
    mutationFn: () => refreshFollowers(person!._id),
    onSuccess: ({ updated }) => {
      toast.success(t('personForm.followersRefreshed', { count: updated }))
      queryClient.invalidateQueries()
    },
    onError: (error) => toast.error(getApiError(error).message),
  })

  function followersNote(row: SocialRow) {
    if (!FOLLOWER_PLATFORMS.includes(row.platform)) return t('personForm.followersNotTracked')
    if (!row.handle.trim()) return t('personForm.followersNeedHandle')
    const saved = savedAccount(person, row)
    if (saved?.followers !== undefined) {
      const count = formatCount(saved.followers)
      return saved.followersUpdatedAt
        ? t('personForm.followersFound', {
            count,
            date: new Date(saved.followersUpdatedAt).toLocaleDateString(i18n.language, {
              day: 'numeric',
              month: 'short',
              year: 'numeric',
            }),
          })
        : t('personForm.followersCurrent', { count })
    }
    if (saved?.followersStatus === 'not_found') return t('personForm.followersNotFound')
    return t('personForm.followersPending')
  }

  function toggleLanguage(code: string) {
    update(
      'languages',
      form.languages.includes(code)
        ? form.languages.filter((c) => c !== code)
        : [...form.languages, code],
    )
  }

  function handleSubmit(e: FormEvent) {
    e.preventDefault()
    if (needsSocial) {
      const found: Record<string, string> = {}
      if (form.socialAccounts.length === 0) found.socialAccounts = t('personForm.socialRequired')
      form.socialAccounts.forEach((row, index) => {
        if (!row.url.trim()) found[`socialAccounts.${index}.url`] = t('personForm.socialUrlRequired')
      })
      setLocalErrors(found)
      if (Object.keys(found).length) {
        document.getElementById('social-accounts')?.scrollIntoView({ behavior: 'smooth', block: 'start' })
        return
      }
    }
    onSubmit(toInput(form, isNew, mode))
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="space-y-6">
      {/* Sab se upar: profile photo (foran save). Form ka photoUrl bhi saath badalta hai
          taake "Save" purana link wapas na likh de */}
      {canUploadPhoto && person && (
        <section className={sectionClass}>
          <PhotoUploader
            name={form.name || person.name}
            photoUrl={form.photoUrl}
            label={t('personForm.photo')}
            onUpload={async (file) => {
              update('photoUrl', await uploadPersonPhoto(person._id, file))
              queryClient.invalidateQueries({ queryKey: ['person'] })
            }}
            onRemove={async () => {
              await removePersonPhoto(person._id)
              update('photoUrl', '')
              queryClient.invalidateQueries({ queryKey: ['person'] })
            }}
          />
        </section>
      )}
      {/* Nayi profile: photo abhi chuno, profile bhejte hi upload hogi */}
      {!person && onPhotoChange && (
        <section className={sectionClass}>
          <PhotoUploader
            name={form.name || '?'}
            photoUrl={photoPreview}
            label={t('personForm.photo')}
            hint={t('photo.uploadOnSend')}
            savedMessage={t('photo.chosen')}
            onUpload={async (file) => {
              setPhotoPreview(URL.createObjectURL(file))
              onPhotoChange(file)
            }}
            onRemove={async () => {
              setPhotoPreview('')
              onPhotoChange(null)
            }}
          />
        </section>
      )}
      <section className={sectionClass}>
        <h2 className="text-lg font-semibold">{t('personForm.identity')}</h2>
        {isOwner ? (
          <div>
            <span className="mb-1 block text-sm font-medium">{t('personForm.fullName')}</span>
            <p className="rounded-lg bg-gray-50 px-3 py-2 text-gray-700">{form.name}</p>
            <p className="mt-1 text-xs text-gray-500">{t('personForm.nameSupport')}</p>
          </div>
        ) : (
          <FormField
            id="name"
            label={t('personForm.fullNameRequired')}
            value={form.name}
            onChange={(e) => update('name', e.target.value)}
            error={errors.name}
          />
        )}
        <FormField
          id="headline"
          label={t('personForm.headline')}
          placeholder={t('personForm.headlinePlaceholder')}
          value={form.headline}
          onChange={(e) => update('headline', e.target.value)}
          error={errors.headline}
        />
        <div>
          <label htmlFor="bio" className="mb-1 block text-sm font-medium">
            {t('personForm.bio')}
          </label>
          <textarea
            id="bio"
            rows={5}
            value={form.bio}
            onChange={(e) => update('bio', e.target.value)}
            className="w-full rounded-lg border border-gray-300 px-3 py-2"
          />
          {errors.bio && <p className="mt-1 text-sm text-red-600">{errors.bio}</p>}
        </div>
        {!canUploadPhoto && (
          <FormField
            id="photoUrl"
            label={t('personForm.photoUrl')}
            placeholder="https://..."
            value={form.photoUrl}
            onChange={(e) => update('photoUrl', e.target.value)}
            error={errors.photoUrl}
          />
        )}
        <FormField
          id="websiteUrl"
          label={needsSocial ? t('personForm.websiteOptional') : t('personForm.website')}
          placeholder="https://..."
          value={form.websiteUrl}
          onChange={(e) => update('websiteUrl', e.target.value)}
          error={errors.websiteUrl}
        />
        <div className="grid gap-4 sm:grid-cols-2">
          <label className="block">
            <span className="mb-1 block text-sm font-medium">{t('personForm.country')}</span>
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
            label={t('personForm.city')}
            value={form.city}
            onChange={(e) => update('city', e.target.value)}
            error={errors.city}
          />
        </div>
        <fieldset>
          <legend className="mb-2 text-sm font-medium">{t('personForm.languages')}</legend>
          <div className="flex flex-wrap gap-2">
            {LANGUAGE_OPTIONS.map((code) => (
              <label
                key={code}
                className={`cursor-pointer rounded-full border px-3 py-1 text-sm ${form.languages.includes(code) ? 'border-brand bg-brand text-on-brand' : 'border-gray-300'}`}
              >
                <input
                  type="checkbox"
                  className="sr-only"
                  checked={form.languages.includes(code)}
                  onChange={() => toggleLanguage(code)}
                />
                {languageName(code)}
              </label>
            ))}
          </div>
        </fieldset>
      </section>

      <section id="social-accounts" className={`${sectionClass} scroll-mt-24`}>
        <div className="flex items-center justify-between gap-3">
          <div>
            <h2 className="text-lg font-semibold">
              {t('personForm.social')}
              {needsSocial && (
                <span className="ms-0.5 text-red-500" aria-hidden="true">
                  *
                </span>
              )}
            </h2>
            {needsSocial && (
              <p className="text-sm text-gray-500">{t('personForm.socialRequiredHint')}</p>
            )}
            <p className="text-sm text-gray-500">{t('personForm.followersAutoHint')}</p>
          </div>
          <div className="flex shrink-0 flex-col items-end gap-2 sm:flex-row sm:items-center">
            {person && mode !== 'submit' && (
              <button
                type="button"
                onClick={() => refresh.mutate()}
                disabled={refresh.isPending}
                className="inline-flex items-center gap-1.5 rounded-lg border border-gray-300 px-3 py-1.5 text-sm hover:bg-gray-100 disabled:opacity-60"
              >
                <FontAwesomeIcon
                  icon={faArrowsRotate}
                  className={refresh.isPending ? 'animate-spin' : ''}
                />
                {t('personForm.refreshFollowers')}
              </button>
            )}
            <button
              type="button"
              onClick={() => {
                update('socialAccounts', [...form.socialAccounts, emptySocial()])
                setLocalErrors((prev) => ({ ...prev, socialAccounts: '' }))
              }}
              className="rounded-lg border border-gray-300 px-3 py-1.5 text-sm hover:bg-gray-100"
            >
              {t('personForm.addAccount')}
            </button>
          </div>
        </div>
        {form.socialAccounts.length === 0 && (
          <p className="text-sm text-gray-500">{t('personForm.noSocial')}</p>
        )}
        {shownErrors.socialAccounts && (
          <p className="text-sm text-red-600">{shownErrors.socialAccounts}</p>
        )}
        {form.socialAccounts.map((row, index) => (
          <div
            key={index}
            className="grid gap-3 rounded-xl border border-gray-200 p-4 sm:grid-cols-2"
          >
            <label className="block">
              <span className="mb-1 block text-sm font-medium">{t('personForm.platform')}</span>
              <select
                value={row.platform}
                onChange={(e) =>
                  updateSocial(index, { platform: e.target.value as SocialPlatform })
                }
                className={selectClass}
              >
                {Object.entries(PLATFORM_LABELS).map(([value, label]) => (
                  <option key={value} value={value}>
                    {label}
                  </option>
                ))}
              </select>
            </label>
            <FormField
              id={`social-url-${index}`}
              label={t('personForm.profileUrl')}
              placeholder="https://..."
              value={row.url}
              onChange={(e) => {
                updateSocial(index, { url: e.target.value })
                setLocalErrors((prev) => ({ ...prev, [`socialAccounts.${index}.url`]: '' }))
              }}
              error={shownErrors[`socialAccounts.${index}.url`]}
            />
            <FormField
              id={`social-handle-${index}`}
              label={t('personForm.handle')}
              placeholder="@name"
              value={row.handle}
              onChange={(e) => updateSocial(index, { handle: e.target.value })}
            />
            <FormField
              id={`social-eng-${index}`}
              label={t('personForm.engagement')}
              type="number"
              min={0}
              max={100}
              step="0.1"
              value={row.engagementRate}
              onChange={(e) => updateSocial(index, { engagementRate: e.target.value })}
              error={errors[`socialAccounts.${index}.engagementRate`]}
            />
            {/* Followers khud aate hain: yahan sirf dikhte hain */}
            <p className="self-end pb-2 text-sm text-gray-600">{followersNote(row)}</p>
            {/* Talent ka aakhri social account hataya nahi ja sakta */}
            {!(needsSocial && form.socialAccounts.length === 1) && (
              <button
                type="button"
                onClick={() =>
                  update(
                    'socialAccounts',
                    form.socialAccounts.filter((_, i) => i !== index),
                  )
                }
                className="justify-self-start text-sm text-red-600 hover:underline"
              >
                {t('personForm.removeAccount')}
              </button>
            )}
          </div>
        ))}
      </section>

      <section className={sectionClass}>
        <h2 className="text-lg font-semibold">{t('personForm.categories')}</h2>
        <TaxonomyPicker
          label={t('personForm.professions')}
          items={professions}
          selected={form.professions}
          onChange={(v) => update('professions', v)}
          error={errors.professions}
        />
        <TaxonomyPicker
          label={t('personForm.industries')}
          items={industries}
          selected={form.industries}
          onChange={(v) => update('industries', v)}
          error={errors.industries}
        />
        <TaxonomyPicker
          label={t('personForm.topics')}
          items={topics}
          selected={form.topics}
          onChange={(v) => update('topics', v)}
          error={errors.topics}
        />
      </section>

      {isAdmin && (
        <section className={sectionClass}>
          <h2 className="text-lg font-semibold">{t('personForm.adminSettings')}</h2>
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="block">
              <span className="mb-1 block text-sm font-medium">{t('personForm.profileState')}</span>
              <select
                value={form.status}
                onChange={(e) => update('status', e.target.value as ProfileStatus)}
                className={selectClass}
              >
                {Object.entries(STATUS_LABELS).map(([value, label]) => (
                  <option key={value} value={value}>
                    {label}
                  </option>
                ))}
              </select>
            </label>
            {!isNew && (
              <label className="block">
                <span className="mb-1 block text-sm font-medium">{t('personForm.visibility')}</span>
                <select
                  value={form.visibility}
                  onChange={(e) => update('visibility', e.target.value as 'visible' | 'hidden')}
                  className={selectClass}
                >
                  <option value="visible">{t('personForm.visible')}</option>
                  <option value="hidden">{t('personForm.hiddenOpt')}</option>
                </select>
              </label>
            )}
          </div>
        </section>
      )}

      {/* Document ka rule: har profile ke saath likha ho ke maloomat kahan se aayi */}
      {isNew && isAdmin && (
        <section className={sectionClass}>
          <h2 className="text-lg font-semibold">{t('personForm.source')}</h2>
          <p className="text-sm text-gray-500">
            {t('personForm.sourceHelp')}
          </p>
          <label className="block">
            <span className="mb-1 block text-sm font-medium">{t('personForm.sourceType')}</span>
            <select
              value={form.sourceType}
              onChange={(e) => update('sourceType', e.target.value)}
              className={selectClass}
            >
              {SOURCE_TYPES.map((s) => (
                <option key={s} value={s}>
                  {t(`personForm.src.${s}`)}
                </option>
              ))}
            </select>
          </label>
          <FormField
            id="sourceUrl"
            label={t('personForm.sourceUrl')}
            placeholder="https://..."
            value={form.sourceUrl}
            onChange={(e) => update('sourceUrl', e.target.value)}
            error={errors['sourceRecords.0.url']}
          />
          <FormField
            id="sourceNote"
            label={t('personForm.note')}
            placeholder={t('personForm.notePlaceholder')}
            value={form.sourceNote}
            onChange={(e) => update('sourceNote', e.target.value)}
          />
        </section>
      )}

      {children}

      <button
        type="submit"
        disabled={isSaving}
        className="w-full rounded-lg bg-brand py-3 font-medium text-on-brand hover:bg-brand-hover disabled:opacity-60 sm:w-auto sm:px-8"
      >
        {isSaving
          ? t('common.saving')
          : (submitLabel ?? (isNew ? t('personForm.create') : t('personForm.saveChanges')))}
      </button>
    </form>
  )
}

export default PersonForm
