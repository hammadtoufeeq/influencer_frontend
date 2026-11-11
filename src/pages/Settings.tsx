import { useEffect, useRef, useState, type FormEvent, type ReactNode } from 'react'
import { createPortal } from 'react-dom'
import { useTranslation } from 'react-i18next'
import { Link } from 'react-router-dom'
import toast from 'react-hot-toast'
import { useQuery } from '@tanstack/react-query'
import { myClaimsQuery, myProfileQuery } from '../api/queries'
import type { IconDefinition } from '@fortawesome/fontawesome-svg-core'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import {
  faEnvelopeOpenText,
  faDisplay,
  faKey,
  faMoon,
  faPalette,
  faSun,
  faTrashCan,
  faTriangleExclamation,
  faXmark,
} from '@fortawesome/free-solid-svg-icons'
import PasswordField from '../components/PasswordField'
import { useAuth } from '../hooks/useAuth'
import { useTheme } from '../hooks/useTheme'
import { getApiError } from '../utils/apiError'
import type { ThemePreference } from '../utils/theme'
import PhotoUploader from '../components/PhotoUploader'
import { removeAvatar, uploadAvatar } from '../api/auth'

const MIN_PASSWORD = 8

// Backend wala hi qaida: faltu spaces aur bara/chota harf ignore
const normalize = (value: string) => value.trim().replace(/\s+/g, ' ').toLowerCase()

function Section({
  icon,
  title,
  text,
  danger,
  children,
}: {
  icon: IconDefinition
  title: string
  text: string
  danger?: boolean
  children: ReactNode
}) {
  return (
    <section
      className={`rounded-2xl bg-white p-5 shadow-sm ring-1 sm:p-6 ${
        danger ? 'ring-red-200' : 'ring-gray-200/70'
      }`}
    >
      <div className="flex items-start gap-3">
        <span
          className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${
            danger ? 'bg-red-50 text-red-700' : 'bg-gray-100 text-gray-700'
          }`}
        >
          <FontAwesomeIcon icon={icon} />
        </span>
        <div>
          <h2 className={`font-semibold ${danger ? 'text-red-700' : 'text-gray-900'}`}>{title}</h2>
          <p className="mt-0.5 text-sm text-gray-500">{text}</p>
        </div>
      </div>
      <div className="mt-5">{children}</div>
    </section>
  )
}

const THEMES: { value: ThemePreference; icon: IconDefinition }[] = [
  { value: 'light', icon: faSun },
  { value: 'dark', icon: faMoon },
  { value: 'system', icon: faDisplay },
]

function AppearanceSection() {
  const { t } = useTranslation()
  const { theme, setTheme } = useTheme()
  return (
    <Section icon={faPalette} title={t('settings.appearance')} text={t('settings.appearanceText')}>
      <div
        className="grid gap-3 sm:grid-cols-3"
        role="radiogroup"
        aria-label={t('settings.appearance')}
      >
        {THEMES.map(({ value, icon }) => {
          const active = theme === value
          return (
            <button
              key={value}
              type="button"
              role="radio"
              aria-checked={active}
              onClick={() => setTheme(value)}
              className={`flex items-center gap-3 rounded-xl border px-4 py-3 text-start transition ${
                active
                  ? 'border-gray-900 ring-1 ring-gray-900'
                  : 'border-gray-200 hover:border-gray-400'
              }`}
            >
              <FontAwesomeIcon icon={icon} className="text-gray-700" />
              <span className="min-w-0 flex-1">
                <span className="block text-sm font-semibold text-gray-900">
                  {t(`settings.theme.${value}`)}
                </span>
                <span className="block text-xs text-gray-500">
                  {t(`settings.theme.${value}Text`)}
                </span>
              </span>
              <span
                className={`h-4 w-4 shrink-0 rounded-full border-2 ${
                  active
                    ? 'border-brand bg-brand shadow-[inset_0_0_0_2px_var(--color-white)]'
                    : 'border-gray-300'
                }`}
              />
            </button>
          )
        })}
      </div>
    </Section>
  )
}

function PasswordSection() {
  const { t } = useTranslation()
  const { user, changePassword } = useAuth()
  const [current, setCurrent] = useState('')
  const [next, setNext] = useState('')
  const [confirm, setConfirm] = useState('')
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [isSubmitting, setIsSubmitting] = useState(false)

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    // Pehle yahin jaanch lo, server tak ghalat cheez na jaye
    const found: Record<string, string> = {}
    if (!current) found.currentPassword = t('settings.errors.currentRequired')
    if (next.length < MIN_PASSWORD)
      found.newPassword = t('settings.errors.tooShort', { count: MIN_PASSWORD })
    else if (next === current) found.newPassword = t('settings.errors.sameAsCurrent')
    if (confirm !== next) found.confirmPassword = t('settings.errors.mismatch')
    setErrors(found)
    if (Object.keys(found).length) return

    setIsSubmitting(true)
    try {
      await changePassword(current, next)
      toast.success(t('settings.passwordChanged'), { id: 'password' })
      setCurrent('')
      setNext('')
      setConfirm('')
    } catch (error) {
      const { message, fields, code } = getApiError(error)
      setErrors(code === 'WRONG_PASSWORD' ? { currentPassword: message } : fields)
      toast.error(message, { id: 'password' })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Section icon={faKey} title={t('settings.password')} text={t('settings.passwordText')}>
      <form onSubmit={handleSubmit} className="space-y-4" noValidate>
        <PasswordField
          id="currentPassword"
          label={t('settings.currentPassword')}
          autoComplete="current-password"
          value={current}
          onChange={setCurrent}
          error={errors.currentPassword}
        />
        <div className="grid gap-4 sm:grid-cols-2">
          <PasswordField
            id="newPassword"
            label={t('settings.newPassword')}
            autoComplete="new-password"
            value={next}
            onChange={setNext}
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
        </div>
        <p className="text-xs text-gray-500">
          {t('settings.passwordHint', { count: MIN_PASSWORD })}
        </p>
        <button
          type="submit"
          disabled={isSubmitting}
          className="rounded-xl bg-brand px-5 py-2.5 text-sm font-medium text-on-brand hover:bg-brand-hover disabled:opacity-60"
        >
          {isSubmitting ? t('settings.saving') : t('settings.updatePassword')}
        </button>
      </form>

      {/* Purana password yaad nahi: email pe code se naya password */}
      <div className="mt-6 flex flex-col gap-3 rounded-xl bg-gray-50 p-4 ring-1 ring-gray-200/70 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-start gap-3">
          <FontAwesomeIcon icon={faEnvelopeOpenText} className="mt-0.5 text-gray-500" />
          <div>
            <p className="text-sm font-semibold text-gray-900">{t('settings.forgotTitle')}</p>
            <p className="text-sm text-gray-500">
              {t('settings.forgotText')}{' '}
              <span dir="ltr" className="font-medium break-all text-gray-700">
                {user?.email}
              </span>
            </p>
          </div>
        </div>
        <Link
          to="/forgot-password"
          state={{ email: user?.email, from: '/settings' }}
          className="shrink-0 rounded-xl border border-gray-300 bg-white px-4 py-2 text-center text-sm font-medium hover:bg-gray-100"
        >
          {t('settings.forgotButton')}
        </Link>
      </div>
    </Section>
  )
}

// Talent ki profile ka kya hoga: khud banayi ho to mit jati hai, warna talent chunta hai
function ProfileChoice({
  removeProfile,
  onChange,
}: {
  removeProfile: boolean
  onChange: (remove: boolean) => void
}) {
  const { t } = useTranslation()
  const { data: profile } = useQuery(myProfileQuery)
  const { data: claims } = useQuery(myClaimsQuery)
  if (!profile) return null

  const selfCreated = claims?.some(
    (claim) => claim.status === 'approved' && claim.isNewProfile && claim.person?._id === profile._id,
  )
  if (selfCreated) {
    return (
      <p className="mt-4 rounded-xl bg-red-50 p-3 text-sm text-red-800">
        {t('settings.profileSelfCreated', { name: profile.name })}
      </p>
    )
  }

  const option = (remove: boolean) => (
    <label
      className={`flex cursor-pointer items-start gap-3 rounded-xl border p-3 text-sm ${
        removeProfile === remove ? 'border-gray-900 bg-gray-50' : 'border-gray-200'
      }`}
    >
      <input
        type="radio"
        name="profile-choice"
        checked={removeProfile === remove}
        onChange={() => onChange(remove)}
        className="mt-0.5"
      />
      <span>
        <span className="block font-medium text-gray-900">
          {t(remove ? 'settings.profileRemove' : 'settings.profileKeep')}
        </span>
        <span className="block text-gray-600">
          {t(remove ? 'settings.profileRemoveHint' : 'settings.profileKeepHint', { name: profile.name })}
        </span>
      </span>
    </label>
  )

  return (
    <fieldset className="mt-4">
      <legend className="text-sm font-medium text-gray-900">
        {t('settings.profileQuestion', { name: profile.name })}
      </legend>
      <div className="mt-2 space-y-2">
        {option(false)}
        {option(true)}
      </div>
    </fieldset>
  )
}

function DeleteAccountDialog({ onClose }: { onClose: () => void }) {
  const { t } = useTranslation()
  const { user, deleteAccount } = useAuth()
  const [removeProfile, setRemoveProfile] = useState(false)
  const [text, setText] = useState('')
  const [error, setError] = useState('')
  const [isDeleting, setIsDeleting] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  const phrase = `delete ${user?.name ?? ''}`
  const matches = normalize(text) === normalize(phrase)

  useEffect(() => {
    inputRef.current?.focus()
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && !isDeleting) onClose()
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [onClose, isDeleting])

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    if (!matches) return
    setIsDeleting(true)
    setError('')
    try {
      const profile = await deleteAccount(text, removeProfile)
      toast.success(profile ? t(`settings.deletedProfile.${profile}`) : t('settings.deleted'), {
        duration: 8000,
      })
    } catch (err) {
      const { message } = getApiError(err)
      setError(message)
      toast.error(message)
      setIsDeleting(false)
    }
  }

  // Portal: page ki animation (transform) ke andar fixed overlay poori screen nahi dhakta
  return createPortal(
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 p-4 sm:items-center"
      onClick={() => !isDeleting && onClose()}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="delete-title"
        className="max-h-[92vh] w-full max-w-md overflow-y-auto rounded-2xl bg-white p-6 shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-3">
          <span className="flex h-11 w-11 items-center justify-center rounded-full bg-red-50 text-red-700">
            <FontAwesomeIcon icon={faTriangleExclamation} />
          </span>
          <button
            type="button"
            onClick={onClose}
            disabled={isDeleting}
            aria-label={t('settings.close')}
            className="rounded-lg p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-700"
          >
            <FontAwesomeIcon icon={faXmark} />
          </button>
        </div>
        <h2 id="delete-title" className="mt-4 text-lg font-semibold text-gray-900">
          {t('settings.deleteTitle')}
        </h2>
        <p className="mt-1 text-sm text-gray-600">{t('settings.deleteWarning')}</p>
        <ul className="mt-3 list-disc space-y-1 ps-5 text-sm text-gray-600">
          <li>{t('settings.deletePoint1')}</li>
          <li>{t('settings.deletePoint2')}</li>
          {user?.role === 'talent' && <li>{t('settings.deletePoint3')}</li>}
        </ul>
        {user?.role === 'talent' && (
          <ProfileChoice removeProfile={removeProfile} onChange={setRemoveProfile} />
        )}

        <form onSubmit={handleSubmit} className="mt-5">
          <label htmlFor="delete-confirm" className="block text-sm text-gray-700">
            {t('settings.typeToConfirm')}{' '}
            <code
              dir="auto"
              className="rounded bg-gray-100 px-1.5 py-0.5 font-mono text-[13px] font-semibold text-gray-900 select-all"
            >
              {phrase}
            </code>
          </label>
          <input
            ref={inputRef}
            id="delete-confirm"
            dir="auto"
            autoComplete="off"
            spellCheck={false}
            value={text}
            onChange={(e) => setText(e.target.value)}
            onPaste={(e) => e.preventDefault()}
            placeholder={phrase}
            className={`mt-2 w-full rounded-lg border bg-white px-3 py-2 outline-none focus:ring-2 focus:ring-red-600 ${
              error ? 'border-red-500' : 'border-gray-300'
            }`}
          />
          {error && <p className="mt-1 text-sm text-red-600">{error}</p>}

          <div className="mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
            <button
              type="button"
              onClick={onClose}
              disabled={isDeleting}
              className="rounded-xl border border-gray-300 bg-white px-4 py-2.5 text-sm font-medium hover:bg-gray-100"
            >
              {t('common.cancel')}
            </button>
            <button
              type="submit"
              disabled={!matches || isDeleting}
              className="keep-dark inline-flex items-center justify-center gap-2 rounded-xl bg-red-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <FontAwesomeIcon icon={faTrashCan} />
              {isDeleting ? t('settings.deleting') : t('settings.deleteForever')}
            </button>
          </div>
        </form>
      </div>
    </div>,
    document.body,
  )
}

function DangerSection() {
  const { t } = useTranslation()
  const [open, setOpen] = useState(false)
  return (
    <Section
      icon={faTriangleExclamation}
      title={t('settings.dangerZone')}
      text={t('settings.dangerText')}
      danger
    >
      <div className="flex flex-col gap-3 rounded-xl border border-red-200 p-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm font-semibold text-gray-900">{t('settings.deleteAccount')}</p>
          <p className="text-sm text-gray-500">{t('settings.deleteAccountText')}</p>
        </div>
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="shrink-0 rounded-xl border border-red-300 bg-white px-4 py-2 text-sm font-medium text-red-700 hover:bg-red-50"
        >
          {t('settings.deleteAccount')}
        </button>
      </div>
      {open && <DeleteAccountDialog onClose={() => setOpen(false)} />}
    </Section>
  )
}

// /settings -> password (AuthContext), theme (ThemeContext) aur account delete
function Settings() {
  const { t } = useTranslation()
  const { user, updateUser } = useAuth()
  if (!user) return null
  const isBusiness = user.role === 'business'

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight md:text-3xl">{t('settings.title')}</h1>
        <p className="mt-1 text-sm text-gray-500">{t('settings.subtitle')}</p>
      </div>

      <div className="space-y-5 rounded-2xl bg-white p-5 shadow-sm ring-1 ring-gray-200/70 sm:p-6">
        <div className="flex flex-wrap items-center gap-3">
          <div className="min-w-0 flex-1">
            <p className="truncate font-semibold text-gray-900">{user.name}</p>
            <p className="truncate text-sm text-gray-500" dir="ltr">
              {user.email}
            </p>
          </div>
          <span className="rounded-full bg-gray-100 px-3 py-1 text-xs font-medium text-gray-700">
            {t(`roles.${user.role}`)}
          </span>
        </div>
        {/* Har account ki apni photo; business ka logo */}
        <PhotoUploader
          name={user.name}
          photoUrl={user.avatarUrl}
          shape={isBusiness ? 'square' : 'round'}
          label={isBusiness ? t('photo.logoLabel') : t('photo.accountLabel')}
          onUpload={async (file) => updateUser(await uploadAvatar(file))}
          onRemove={async () => updateUser(await removeAvatar())}
        />
      </div>

      <AppearanceSection />
      <PasswordSection />
      <DangerSection />
    </div>
  )
}

export default Settings
