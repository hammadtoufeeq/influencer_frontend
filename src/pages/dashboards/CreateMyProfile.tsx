import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Link, Navigate, useNavigate } from 'react-router-dom'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import toast from 'react-hot-toast'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import {
  faArrowLeft,
  faArrowRight,
  faCircleInfo,
  faKey,
  faMagnifyingGlass,
  faUserCheck,
} from '@fortawesome/free-solid-svg-icons'
import { uploadPersonPhoto } from '../../api/auth'
import { createNewProfileClaim } from '../../api/claims'
import { myClaimsQuery, myProfileQuery } from '../../api/queries'
import Avatar from '../../components/Avatar'
import PersonForm from '../../components/admin/PersonForm'
import type { PersonInput } from '../../types/admin'
import { isOpenClaim, type ProfileMatch } from '../../types/claim'
import { getApiError } from '../../utils/apiError'
import AccountEmailField from '../../components/AccountEmailField'

// /my-profile/new -> talent ko apni profile na mile to khud bheje.
// Profile chhupi rehti hai; official account pe code se tasdeeq ke baad public hoti hai
function CreateMyProfile() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [note, setNote] = useState('')
  // Form ke upar chuni hui photo: profile bante hi us pe upload
  const [photo, setPhoto] = useState<File | null>(null)
  // Milti julti profiles mili to yahan; talent "nayi hi banao" bhi chun sakta hai
  const [pending, setPending] = useState<{ input: PersonInput; matches: ProfileMatch[] } | null>(
    null,
  )

  const { data: profile, isLoading: profileLoading } = useQuery(myProfileQuery)
  const { data: claims, isLoading: claimsLoading } = useQuery(myClaimsQuery)

  const submit = useMutation({
    mutationFn: ({ input, force }: { input: PersonInput; force?: boolean }) =>
      createNewProfileClaim({
        ...input,
        note: note.trim() || undefined,
        force,
      }),
    onMutate: () => setErrors({}),
    onSuccess: async (claim) => {
      if (photo && claim.person) {
        try {
          await uploadPersonPhoto(claim.person._id, photo)
        } catch (error) {
          // Profile chali gayi; photo baad mein "Edit profile" se lag sakti hai
          toast.error(`${t('newProfile.photoFailed')} ${getApiError(error).message}`)
        }
      }
      toast.success(t('newProfile.sent'))
      queryClient.invalidateQueries({ queryKey: ['claims'] })
      navigate('/dashboard')
    },
    onError: (error, { input }) => {
      const { message, fields, code, details } = getApiError(error)
      if (code === 'POSSIBLE_DUPLICATE' && Array.isArray(details.matches)) {
        setPending({ input, matches: details.matches as ProfileMatch[] })
        window.scrollTo({ top: 0, behavior: 'smooth' })
        return
      }
      setErrors(fields)
      toast.error(message)
      window.scrollTo({ top: 0, behavior: 'smooth' })
    },
  })

  if (profileLoading || claimsLoading) return <p className="text-gray-500">{t('common.loading')}</p>
  // Pehle se profile hai ya koi claim chal raha hai: dashboard pe wapas
  if (profile || claims?.some((c) => isOpenClaim(c.status))) {
    return <Navigate to="/dashboard" replace />
  }

  const steps = [
    { icon: faUserCheck, text: t('newProfile.step1') },
    { icon: faKey, text: t('newProfile.step2') },
    { icon: faCircleInfo, text: t('newProfile.step3') },
  ]

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div>
        <Link to="/dashboard" className="text-sm underline">
          <FontAwesomeIcon icon={faArrowLeft} className="me-1.5 rtl:rotate-180" />
          {t('site.backToDashboard')}
        </Link>
        <h1 className="mt-2 text-2xl font-bold">{t('newProfile.title')}</h1>
        <p className="mt-1 text-sm text-gray-500">{t('newProfile.subtitle')}</p>
      </div>

      {/* Kya hoga: 3 qadam */}
      <ol className="grid gap-3 sm:grid-cols-3">
        {steps.map((step) => (
          <li key={step.text} className="flex gap-3 rounded-2xl bg-white p-4 text-sm shadow-sm">
            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-gray-900 text-xs text-white">
              <FontAwesomeIcon icon={step.icon} />
            </span>
            <span className="text-gray-600">{step.text}</span>
          </li>
        ))}
      </ol>

      {/* Milti julti profile mili */}
      {pending && (
        <section
          role="alert"
          className="space-y-4 rounded-2xl border border-amber-200 bg-amber-50 p-5"
        >
          <div>
            <h2 className="font-semibold text-amber-900">{t('newProfile.dupTitle')}</h2>
            <p className="mt-1 text-sm text-amber-800">{t('newProfile.dupBody')}</p>
          </div>
          <ul className="space-y-2">
            {pending.matches.map((match) => (
              <li
                key={match._id}
                className="flex flex-wrap items-center gap-3 rounded-xl bg-white p-3 shadow-sm"
              >
                <Avatar name={match.name} photoUrl={match.photoUrl} size="sm" />
                <div className="min-w-0 flex-1">
                  <p className="truncate font-medium">{match.name}</p>
                  {match.headline && (
                    <p className="truncate text-xs text-gray-500">{match.headline}</p>
                  )}
                </div>
                {match.claimed ? (
                  <span className="text-xs text-gray-500">{t('newProfile.alreadyClaimed')}</span>
                ) : (
                  <Link
                    to={`/people/${match.slug}`}
                    className="inline-flex items-center gap-1.5 rounded-lg bg-gray-900 px-3 py-1.5 text-xs font-medium text-white hover:bg-gray-800"
                  >
                    {t('newProfile.thisIsMe')}
                    <FontAwesomeIcon icon={faArrowRight} className="text-[10px] rtl:rotate-180" />
                  </Link>
                )}
              </li>
            ))}
          </ul>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => submit.mutate({ input: pending.input, force: true })}
              disabled={submit.isPending}
              className="rounded-lg border border-amber-300 bg-white px-4 py-2 text-sm font-medium text-amber-900 hover:bg-amber-100 disabled:opacity-60"
            >
              {t('newProfile.createAnyway')}
            </button>
            <button
              type="button"
              onClick={() => setPending(null)}
              className="px-2 text-sm text-amber-900 underline"
            >
              {t('common.cancel')}
            </button>
          </div>
        </section>
      )}

      <PersonForm
        mode="submit"
        isSaving={submit.isPending}
        errors={errors}
        submitLabel={t('newProfile.submit')}
        onPhotoChange={setPhoto}
        onSubmit={(input) => {
          setPending(null)
          submit.mutate({ input })
        }}
      >
        {/* Admin ke liye: rabta aur note */}
        <section className="space-y-4 rounded-2xl bg-white p-6 shadow-sm">
          <h2 className="text-lg font-semibold">{t('newProfile.forReview')}</h2>
          <p className="text-sm text-gray-500">{t('newProfile.forReviewHelp')}</p>
          <AccountEmailField />
          <label className="block">
            <span className="mb-1 block text-sm font-medium">{t('newProfile.note')}</span>
            <textarea
              rows={3}
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder={t('newProfile.notePlaceholder')}
              className="w-full rounded-lg border border-gray-300 px-3 py-2"
            />
          </label>
        </section>
      </PersonForm>

      <p className="flex items-center gap-2 text-xs text-gray-500">
        <FontAwesomeIcon icon={faMagnifyingGlass} />
        {t('newProfile.searchFirst')}{' '}
        <Link to="/search" className="underline">
          {t('newProfile.searchAgain')}
        </Link>
      </p>
    </div>
  )
}

export default CreateMyProfile
