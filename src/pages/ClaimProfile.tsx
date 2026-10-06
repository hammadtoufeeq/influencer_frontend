import { useState, type FormEvent } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import toast from 'react-hot-toast'
import { createClaim } from '../api/claims'
import { personQuery } from '../api/queries'
import Avatar from '../components/Avatar'
import FormField from '../components/FormField'
import { getApiError } from '../utils/apiError'

// /people/:slug/claim -> talent saboot ke saath claim bhejta hai
function ClaimProfile() {
  const { slug = '' } = useParams()
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const { data: person, isLoading } = useQuery({ ...personQuery(slug), retry: false })

  const [contactEmail, setContactEmail] = useState('')
  const [links, setLinks] = useState(['', '', ''])
  const [note, setNote] = useState('')
  const [errors, setErrors] = useState<Record<string, string>>({})

  const submit = useMutation({
    mutationFn: createClaim,
    onMutate: () => setErrors({}),
    onSuccess: () => {
      toast.success('Claim sent! We will review it soon.')
      queryClient.invalidateQueries({ queryKey: ['claims'] })
      navigate('/dashboard')
    },
    onError: (error) => {
      const { message, fields } = getApiError(error)
      setErrors(fields)
      toast.error(message)
    },
  })

  if (isLoading) return <p className="text-center text-gray-500">Loading...</p>
  if (!person) return <p className="text-center">Profile not found.</p>

  if (person.claimedBy) {
    return (
      <section className="mx-auto max-w-xl rounded-2xl bg-white p-6 text-center shadow-sm">
        <p className="font-medium">This profile has already been claimed.</p>
        <Link to={`/people/${person.slug}`} className="mt-3 inline-block text-sm underline">
          Back to profile
        </Link>
      </section>
    )
  }

  function handleSubmit(e: FormEvent) {
    e.preventDefault()
    submit.mutate({
      personId: person!._id,
      contactEmail: contactEmail.trim(),
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
        ← Back to profile
      </Link>

      <section className="flex items-center gap-4 rounded-2xl bg-white p-5 shadow-sm">
        <Avatar name={person.name} photoUrl={person.photoUrl} />
        <div className="min-w-0">
          <p className="text-sm text-gray-500">You are claiming</p>
          <h1 className="truncate text-xl font-bold">{person.name}</h1>
        </div>
      </section>

      <form onSubmit={handleSubmit} noValidate className="space-y-4 rounded-2xl bg-white p-6 shadow-sm">
        <div>
          <h2 className="text-lg font-semibold">Help us verify it&apos;s you</h2>
          <p className="mt-1 text-sm text-gray-500">
            An admin will check your details. Once approved, you can edit this profile and start
            receiving inquiries.
          </p>
        </div>

        <FormField
          id="contactEmail"
          label="Official email (optional)"
          type="email"
          placeholder="e.g. you@yourwebsite.com"
          value={contactEmail}
          onChange={(e) => setContactEmail(e.target.value)}
          error={errors.contactEmail}
        />

        <div className="space-y-2">
          <span className="block text-sm font-medium">Links that prove it&apos;s you (optional)</span>
          <p className="text-xs text-gray-500">Your verified social accounts, website or press page.</p>
          {links.map((link, index) => (
            <input
              key={index}
              type="url"
              aria-label={`Proof link ${index + 1}`}
              placeholder="https://..."
              value={link}
              onChange={(e) => setLinks(links.map((l, i) => (i === index ? e.target.value : l)))}
              className="w-full rounded-lg border border-gray-300 px-3 py-2"
            />
          ))}
          {linkError && <p className="text-sm text-red-600">{linkError}</p>}
        </div>

        <div>
          <label htmlFor="note" className="mb-1 block text-sm font-medium">
            How can we verify you? *
          </label>
          <textarea
            id="note"
            rows={4}
            placeholder="e.g. You can message me on my verified Instagram, or call my manager."
            value={note}
            onChange={(e) => setNote(e.target.value)}
            className={`w-full rounded-lg border px-3 py-2 ${errors.note ? 'border-red-500' : 'border-gray-300'}`}
          />
          {errors.note && <p className="mt-1 text-sm text-red-600">{errors.note}</p>}
        </div>

        <button
          type="submit"
          disabled={submit.isPending}
          className="w-full rounded-lg bg-gray-900 py-2.5 font-medium text-white hover:bg-gray-800 disabled:opacity-60"
        >
          {submit.isPending ? 'Sending...' : 'Send claim'}
        </button>
      </form>
    </div>
  )
}

export default ClaimProfile
