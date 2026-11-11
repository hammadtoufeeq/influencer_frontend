import { useTranslation } from 'react-i18next'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faArrowLeft } from '@fortawesome/free-solid-svg-icons'
import { useState, type FormEvent } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import toast from 'react-hot-toast'
import { createClaim } from '../api/claims'
import { myClaimsQuery, myProfileQuery, personQuery } from '../api/queries'
import { claimPersonName, isOpenClaim } from '../types/claim'
import Avatar from '../components/Avatar'
import AccountEmailField from '../components/AccountEmailField'
import { getApiError } from '../utils/apiError'

// /people/:slug/claim -> talent saboot ke saath claim bhejta hai
function ClaimProfile() {
  const { t } = useTranslation()
  const { slug = '' } = useParams()
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  // Claim se pehle hamesha taaza data (cache wala purana ho sakta hai)
  const { data: person, isLoading } = useQuery({ ...personQuery(slug), retry: false })
  const myProfile = useQuery(myProfileQuery)
  const myClaims = useQuery(myClaimsQuery)

  const [links, setLinks] = useState(['', '', ''])
  const [note, setNote] = useState('')
  const [errors, setErrors] = useState<Record<string, string>>({})

  const submit = useMutation({
    mutationFn: createClaim,
    onMutate: () => setErrors({}),
    onSuccess: () => {
      toast.success(t('claimForm.sent'))
      queryClient.invalidateQueries({ queryKey: ['claims'] })
      navigate('/dashboard')
    },
    onError: (error) => {
      const { message, fields } = getApiError(error)
      setErrors(fields)
      toast.error(message)
    },
  })

  if (isLoading || myProfile.isLoading || myClaims.isLoading) {
    return <p className="text-center text-gray-500">{t('common.loading')}</p>
  }
  if (!person) return <p className="text-center">{t('profile.notFound')}</p>

  // Talent ki pehle se profile hai, ya claim pending hai: form mat dikhao
  const pending = myClaims.data?.find((claim) => isOpenClaim(claim.status))
  const blockMessage = myProfile.data
    ? t('claimForm.ownsProfile')
    : pending
      ? t('claimForm.pendingFor', { name: claimPersonName(pending, t('claims.deletedProfile')) })
      : null
  if (blockMessage) {
    return (
      <section className="mx-auto max-w-xl rounded-2xl bg-white p-6 text-center shadow-sm">
        <p className="font-medium">{blockMessage}</p>
        <Link to="/dashboard" className="mt-3 inline-block text-sm underline">
          {t('site.goToDashboard')}
        </Link>
      </section>
    )
  }

  if (person.claimedBy) {
    return (
      <section className="mx-auto max-w-xl rounded-2xl bg-white p-6 text-center shadow-sm">
        <p className="font-medium">{t('claimForm.alreadyClaimed')}</p>
        <Link to={`/people/${person.slug}`} className="mt-3 inline-block text-sm underline">
          {t('reportForm.backToProfile')}
        </Link>
      </section>
    )
  }

  function handleSubmit(e: FormEvent) {
    e.preventDefault()
    submit.mutate({
      personId: person!._id,
      links: links.map((l) => l.trim()).filter(Boolean),
      note,
    })
  }

  // Backend "links.0" jaisi key bhejta hai, lekin khali inputs filter ho chuke hote hain,
  // is liye link ka koi bhi error pehle input ke neeche dikhate hain
  const linkError = Object.entries(errors).find(([key]) => key.startsWith('links'))?.[1]

  return (
    <div className="mx-auto max-w-xl space-y-6">
      <Link to={`/people/${person.slug}`} className="text-sm underline">
        <FontAwesomeIcon icon={faArrowLeft} className="me-1.5 rtl:rotate-180" />
        {t('reportForm.backToProfile')}
      </Link>

      <section className="flex items-center gap-4 rounded-2xl bg-white p-5 shadow-sm">
        <Avatar name={person.name} photoUrl={person.photoUrl} />
        <div className="min-w-0">
          <p className="text-sm text-gray-500">{t('claimForm.youAreClaiming')}</p>
          <h1 className="truncate text-xl font-bold">{person.name}</h1>
        </div>
      </section>

      <form
        onSubmit={handleSubmit}
        noValidate
        className="space-y-4 rounded-2xl bg-white p-6 shadow-sm"
      >
        <div>
          <h2 className="text-lg font-semibold">{t('claimForm.verifyTitle')}</h2>
          <ol className="mt-3 space-y-1 text-sm text-gray-600">
            <li>{t('claimForm.step1')}</li>
            <li>{t('claimForm.step2')}</li>
            <li>{t('claimForm.step3')}</li>
          </ol>
        </div>

        <AccountEmailField />

        <div className="space-y-2">
          <span className="block text-sm font-medium">{t('claimForm.linksLabel')}</span>
          <p className="text-xs text-gray-500">{t('claimForm.linksHelp')}</p>
          {links.map((link, index) => (
            <input
              key={index}
              type="url"
              aria-label={t('claimForm.proofLink', { n: index + 1 })}
              placeholder={
                index === 0 ? 'https://instagram.com/yourname' : t('claimForm.optionalUrl')
              }
              value={link}
              onChange={(e) => setLinks(links.map((l, i) => (i === index ? e.target.value : l)))}
              className="w-full rounded-lg border border-gray-300 px-3 py-2"
            />
          ))}
          {linkError && <p className="text-sm text-red-600">{linkError}</p>}
        </div>

        <div>
          <label htmlFor="note" className="mb-1 block text-sm font-medium">
            {t('claimForm.noteLabel')}
          </label>
          <textarea
            id="note"
            rows={4}
            placeholder={t('claimForm.notePlaceholder')}
            value={note}
            onChange={(e) => setNote(e.target.value)}
            className={`w-full rounded-lg border px-3 py-2 ${errors.note ? 'border-red-500' : 'border-gray-300'}`}
          />
          {errors.note && <p className="mt-1 text-sm text-red-600">{errors.note}</p>}
        </div>

        <button
          type="submit"
          disabled={submit.isPending}
          className="w-full rounded-lg bg-brand py-2.5 font-medium text-on-brand hover:bg-brand-hover disabled:opacity-60"
        >
          {submit.isPending ? t('claimForm.sending') : t('claimForm.submit')}
        </button>
      </form>
    </div>
  )
}

export default ClaimProfile
