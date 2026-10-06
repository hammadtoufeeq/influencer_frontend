import { useState } from 'react'
import { Link } from 'react-router-dom'
import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import toast from 'react-hot-toast'
import { adminListClaims, reviewClaim, sendClaimCode } from '../../api/claims'
import { isOpenClaim, type Claim, type ClaimFilter, type ClaimStatus } from '../../types/claim'
import { getApiError } from '../../utils/apiError'
import Avatar from '../Avatar'
import Pagination from '../Pagination'

const STATUS_LABELS: Record<ClaimStatus, string> = {
  pending: 'Send code',
  code_sent: 'Waiting for talent',
  code_verified: 'Ready to approve',
  approved: 'Approved',
  rejected: 'Rejected',
}

const STATUS_STYLES: Record<ClaimStatus, string> = {
  pending: 'bg-amber-50 text-amber-800',
  code_sent: 'bg-blue-50 text-blue-700',
  code_verified: 'bg-green-100 text-green-800',
  approved: 'bg-green-50 text-green-700',
  rejected: 'bg-red-50 text-red-700',
}

const FILTERS: { value: ClaimFilter; label: string }[] = [
  { value: 'open', label: 'All open' },
  { value: 'needs_action', label: 'Needs my action' },
  { value: 'pending', label: 'Send code' },
  { value: 'code_sent', label: 'Waiting for talent' },
  { value: 'code_verified', label: 'Ready to approve' },
  { value: 'approved', label: 'Approved' },
  { value: 'rejected', label: 'Rejected' },
]

const button = 'rounded-lg px-4 py-2 text-sm font-medium transition disabled:opacity-50'

// Admin ko code ek hi dafa dikhta hai. Copy karke talent ke account pe DM karna hai
function GeneratedCode({
  code,
  channelUrl,
  onDone,
}: {
  code: string
  channelUrl: string
  onDone: () => void
}) {
  const message = `Hi! To verify your profile on our platform, enter this code on your dashboard: ${code}. It expires in 48 hours.`

  async function copy(text: string, label: string) {
    try {
      await navigator.clipboard.writeText(text)
      toast.success(`${label} copied`)
    } catch {
      toast.error('Could not copy. Please select and copy it manually.')
    }
  }

  return (
    <div className="mt-4 space-y-3 rounded-xl border-2 border-dashed border-gray-900 p-4">
      <p className="text-sm font-medium">Send this code as a message to:</p>
      <a
        href={channelUrl}
        target="_blank"
        rel="noopener noreferrer nofollow"
        className="block break-all text-sm text-blue-700 underline"
      >
        {channelUrl} ↗
      </a>
      <p className="text-center font-mono text-4xl font-bold tracking-[0.3em]">{code}</p>
      <p className="rounded-lg bg-gray-50 p-3 text-xs text-gray-600">{message}</p>
      <div className="flex flex-wrap gap-2">
        <button
          onClick={() => copy(code, 'Code')}
          className={`${button} border border-gray-300 hover:bg-gray-100`}
        >
          Copy code
        </button>
        <button
          onClick={() => copy(message, 'Message')}
          className={`${button} border border-gray-300 hover:bg-gray-100`}
        >
          Copy message
        </button>
        <button
          onClick={onDone}
          className={`${button} ml-auto bg-gray-900 text-white hover:bg-gray-800`}
        >
          Done, I sent it
        </button>
      </div>
      <p className="text-xs text-amber-700">
        ⚠ This code is shown only once. If you lose it, send a new code.
      </p>
    </div>
  )
}

function ClaimCard({ claim }: { claim: Claim }) {
  const queryClient = useQueryClient()
  const [channelUrl, setChannelUrl] = useState(
    claim.verification?.channelUrl ?? claim.evidence.links[0] ?? '',
  )
  const [generated, setGenerated] = useState<{ code: string; channelUrl: string } | null>(null)
  const [rejecting, setRejecting] = useState(false)
  const [reason, setReason] = useState('')
  const requester = typeof claim.user === 'string' ? null : claim.user

  const refresh = () => queryClient.invalidateQueries({ queryKey: ['admin'] })

  const sendCode = useMutation({
    mutationFn: () => sendClaimCode(claim._id, channelUrl),
    onSuccess: ({ code, claim: updated }) => {
      setGenerated({ code, channelUrl: updated.verification?.channelUrl ?? channelUrl })
    },
    onError: (error) => toast.error(getApiError(error).message),
  })

  const review = useMutation({
    mutationFn: ({ action, reason }: { action: 'approve' | 'reject'; reason?: string }) =>
      reviewClaim(claim._id, action, reason),
    onSuccess: (updated) => {
      toast.success(
        updated.status === 'approved' ? `${updated.person.name} claim approved` : 'Claim rejected',
      )
      queryClient.invalidateQueries({ queryKey: ['person', updated.person.slug] })
      refresh()
    },
    onError: (error) => toast.error(getApiError(error).message),
  })

  const busy = sendCode.isPending || review.isPending
  const v = claim.verification

  return (
    <article className="flex flex-col rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
      <div className="flex flex-wrap items-start gap-4">
        <Avatar name={claim.person.name} photoUrl={claim.person.photoUrl} />
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <Link to={`/people/${claim.person.slug}`} className="font-semibold hover:underline">
              {claim.person.name}
            </Link>
            <span
              className={`rounded-full px-2 py-0.5 text-xs font-medium ${STATUS_STYLES[claim.status]}`}
            >
              {STATUS_LABELS[claim.status]}
            </span>
          </div>
          <p className="mt-0.5 text-sm text-gray-600">
            Claimed by <strong>{requester?.name}</strong>{' '}
            <span className="break-all text-gray-500">({requester?.email})</span>
          </p>
          <p className="text-xs text-gray-400">Sent {new Date(claim.createdAt).toLocaleString()}</p>
        </div>
      </div>

      {/* Talent ke diye hue official links aur maloomat */}
      <dl className="mt-4 space-y-2 rounded-xl bg-gray-50 p-4 text-sm">
        <div>
          <dt className="text-xs text-gray-500">Official accounts</dt>
          {claim.evidence.links.map((link) => (
            <dd key={link} className="break-all">
              <a
                href={link}
                target="_blank"
                rel="noopener noreferrer nofollow"
                className="text-blue-700 underline"
              >
                {link}
              </a>
            </dd>
          ))}
        </div>
        {claim.evidence.contactEmail && (
          <div>
            <dt className="text-xs text-gray-500">Official email</dt>
            <dd className="break-all">{claim.evidence.contactEmail}</dd>
          </div>
        )}
        {claim.evidence.note && (
          <div>
            <dt className="text-xs text-gray-500">Note</dt>
            <dd className="whitespace-pre-line">{claim.evidence.note}</dd>
          </div>
        )}
      </dl>

      {/* Halat ke hisaab se agla kaam */}
      {generated ? (
        <GeneratedCode
          code={generated.code}
          channelUrl={generated.channelUrl}
          onDone={() => {
            setGenerated(null)
            refresh()
          }}
        />
      ) : (
        <>
          {(claim.status === 'pending' || claim.status === 'code_sent') && (
            <div className="mt-4 space-y-2">
              {claim.status === 'code_sent' && v && (
                <p className="rounded-lg bg-blue-50 p-3 text-sm text-blue-800">
                  Code sent to <span className="break-all font-medium">{v.channelUrl}</span> on{' '}
                  {v.codeSentAt && new Date(v.codeSentAt).toLocaleString()}. Wrong attempts:{' '}
                  {v.attempts}/5.
                  {v.attempts >= 5 && ' Locked: send a new code.'}
                </p>
              )}
              <label className="block">
                <span className="mb-1 block text-sm font-medium">
                  {claim.status === 'pending' ? 'Send a code to' : 'Send a new code to'}
                </span>
                <select
                  value={channelUrl}
                  onChange={(e) => setChannelUrl(e.target.value)}
                  className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm"
                >
                  {claim.evidence.links.map((link) => (
                    <option key={link} value={link}>
                      {link}
                    </option>
                  ))}
                </select>
              </label>
              <button
                onClick={() => sendCode.mutate()}
                disabled={busy || !channelUrl}
                className={`${button} w-full bg-gray-900 text-white hover:bg-gray-800`}
              >
                {claim.status === 'pending' ? '🔑 Generate code' : '🔑 Generate new code'}
              </button>
            </div>
          )}

          {claim.status === 'code_verified' && (
            <div className="mt-4 space-y-2">
              <p className="rounded-lg bg-green-50 p-3 text-sm text-green-800">
                ✓ The talent entered the correct code sent to{' '}
                <span className="break-all font-medium">{v?.channelUrl}</span>
                {v?.verifiedAt && ` on ${new Date(v.verifiedAt).toLocaleString()}`}.
              </p>
              <button
                onClick={() => review.mutate({ action: 'approve' })}
                disabled={busy}
                className={`${button} w-full bg-green-600 text-white hover:bg-green-700`}
              >
                ✓ Approve claim
              </button>
            </div>
          )}

          {claim.status === 'rejected' && claim.rejectionReason && (
            <p className="mt-3 text-sm text-red-700">Reason: {claim.rejectionReason}</p>
          )}

          {isOpenClaim(claim.status) &&
            (rejecting ? (
              <div className="mt-3 space-y-2">
                <label htmlFor={`reason-${claim._id}`} className="block text-sm font-medium">
                  Reason (shown to the user)
                </label>
                <textarea
                  id={`reason-${claim._id}`}
                  rows={2}
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  placeholder="e.g. The account did not reply to our message"
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
                />
                <div className="flex gap-2">
                  <button
                    onClick={() => setRejecting(false)}
                    className={`${button} border border-gray-300 hover:bg-gray-100`}
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() =>
                      review.mutate({ action: 'reject', reason: reason.trim() || undefined })
                    }
                    disabled={busy}
                    className={`${button} bg-red-600 text-white hover:bg-red-700`}
                  >
                    Reject claim
                  </button>
                </div>
              </div>
            ) : (
              <button
                onClick={() => setRejecting(true)}
                disabled={busy}
                className={`${button} mt-2 w-full border border-red-200 text-red-600 hover:bg-red-50`}
              >
                Reject
              </button>
            ))}
        </>
      )}
    </article>
  )
}

function ClaimRequests() {
  const [filter, setFilter] = useState<ClaimFilter>('open')
  const [page, setPage] = useState(1)

  const { data, isLoading } = useQuery({
    queryKey: ['admin', 'claims', filter, page],
    queryFn: () => adminListClaims(filter, page),
    placeholderData: keepPreviousData,
    staleTime: 0,
  })

  const total = data?.meta.total ?? 0
  const filterLabel = FILTERS.find((f) => f.value === filter)?.label.toLowerCase()

  return (
    <section className="space-y-4">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold">Claim requests</h2>
          <p className="text-sm text-gray-500">{data ? `${total} · ${filterLabel}` : ' '}</p>
        </div>
        <select
          aria-label="Claim status"
          value={filter}
          onChange={(e) => {
            setFilter(e.target.value as ClaimFilter)
            setPage(1)
          }}
          className="rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm"
        >
          {FILTERS.map((f) => (
            <option key={f.value} value={f.value}>
              {f.label}
            </option>
          ))}
        </select>
      </div>

      {isLoading && <p className="text-gray-500">Loading...</p>}
      {data && data.claims.length === 0 && (
        <p className="rounded-2xl border border-dashed border-gray-300 p-8 text-center text-gray-500">
          No claims here.
        </p>
      )}

      <div className="grid gap-4 lg:grid-cols-2">
        {data?.claims.map((claim) => (
          <ClaimCard key={claim._id} claim={claim} />
        ))}
      </div>

      <Pagination page={page} totalPages={Math.ceil(total / 20)} onChange={setPage} />
    </section>
  )
}

export default ClaimRequests
