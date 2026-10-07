import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faCircleCheck } from '@fortawesome/free-solid-svg-icons'
import { useState, type FormEvent } from 'react'
import { Link } from 'react-router-dom'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import toast from 'react-hot-toast'
import { verifyClaimCode } from '../api/claims'
import type { Claim } from '../types/claim'
import { getApiError } from '../utils/apiError'

const STEPS = ['Claim sent', 'Code sent to you', 'Code verified', 'Approved']

function stepIndex(status: Claim['status']) {
  return { pending: 0, code_sent: 1, code_verified: 2, approved: 3, rejected: 0 }[status]
}

// Talent dashboard pe khule claim ki halat + code daalne ka box
function ClaimProgress({ claim }: { claim: Claim }) {
  const queryClient = useQueryClient()
  const [code, setCode] = useState('')
  const [error, setError] = useState('')
  // Page khulne ka waqt (render mein baar baar new Date() nahi)
  const [openedAt] = useState(() => Date.now())
  const current = stepIndex(claim.status)
  const expiresAt = claim.verification?.expiresAt ? new Date(claim.verification.expiresAt) : null
  const isExpired = expiresAt ? expiresAt.getTime() < openedAt : false

  const verify = useMutation({
    mutationFn: () => verifyClaimCode(claim._id, code),
    onMutate: () => setError(''),
    onSuccess: () => {
      toast.success('Code verified! An admin will approve your claim soon.')
      queryClient.invalidateQueries({ queryKey: ['claims'] })
    },
    onError: (err) => {
      const { message, fields } = getApiError(err)
      setError(fields.code ?? message)
    },
  })

  function handleSubmit(e: FormEvent) {
    e.preventDefault()
    verify.mutate()
  }

  return (
    <section className="rounded-2xl border border-amber-200 bg-white p-5 shadow-sm md:p-6">
      <p className="text-xs font-medium uppercase tracking-wide text-amber-700">
        Profile claim in progress
      </p>
      <p className="mt-2">
        Claiming{' '}
        <Link to={`/people/${claim.person.slug}`} className="font-semibold underline">
          {claim.person.name}
        </Link>
      </p>

      {/* 4 qadam wali progress line */}
      <ol className="mt-4 grid grid-cols-4 gap-2">
        {STEPS.map((step, index) => (
          <li key={step} className="text-center">
            <div
              className={`h-1.5 rounded-full ${index <= current ? 'bg-gray-900' : 'bg-gray-200'}`}
            />
            <span
              className={`mt-1.5 block text-[11px] leading-tight sm:text-xs ${index <= current ? 'font-medium text-gray-900' : 'text-gray-400'}`}
            >
              {step}
            </span>
          </li>
        ))}
      </ol>

      {claim.status === 'pending' && (
        <p className="mt-4 rounded-xl bg-gray-50 p-4 text-sm text-gray-700">
          Our team will send a <strong>6-digit code</strong> as a message to one of your official
          accounts, usually within 1–2 days. Keep an eye on your inbox there.
        </p>
      )}

      {claim.status === 'code_sent' && (
        <div className="mt-4 rounded-xl bg-amber-50 p-4">
          <p className="text-sm text-gray-800">
            We sent a 6-digit code to{' '}
            <a
              href={claim.verification?.channelUrl}
              target="_blank"
              rel="noopener noreferrer nofollow"
              className="break-all font-medium underline"
            >
              {claim.verification?.channelUrl}
            </a>
            . Open your messages there and enter the code below.
          </p>
          {isExpired ? (
            <p className="mt-3 text-sm text-red-700">
              This code has expired. We will send you a new one.
            </p>
          ) : (
            <form onSubmit={handleSubmit} className="mt-3 flex flex-wrap gap-2" noValidate>
              <input
                inputMode="numeric"
                autoComplete="one-time-code"
                maxLength={6}
                aria-label="6-digit code"
                placeholder="______"
                value={code}
                onChange={(e) => setCode(e.target.value.replace(/\D/g, ''))}
                className={`w-40 rounded-lg border bg-white px-3 py-2 text-center font-mono text-lg tracking-[0.4em] ${error ? 'border-red-500' : 'border-gray-300'}`}
              />
              <button
                type="submit"
                disabled={code.length !== 6 || verify.isPending}
                className="rounded-lg bg-gray-900 px-5 py-2 text-sm font-medium text-white hover:bg-gray-800 disabled:opacity-50"
              >
                {verify.isPending ? 'Checking...' : 'Verify code'}
              </button>
            </form>
          )}
          {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
          {expiresAt && !isExpired && (
            <p className="mt-2 text-xs text-gray-500">
              Code expires on {expiresAt.toLocaleString()}.
            </p>
          )}
        </div>
      )}

      {claim.status === 'code_verified' && (
        <p className="mt-4 rounded-xl bg-green-50 p-4 text-sm text-green-800">
          <FontAwesomeIcon icon={faCircleCheck} className="mr-1.5" />
          Code verified. An admin will give final approval soon, then you can edit your profile.
        </p>
      )}
    </section>
  )
}

export default ClaimProgress
