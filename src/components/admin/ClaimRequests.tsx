import { useState } from 'react'
import { Link } from 'react-router-dom'
import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import toast from 'react-hot-toast'
import { adminListClaims, reviewClaim } from '../../api/claims'
import type { Claim, ClaimStatus } from '../../types/claim'
import { getApiError } from '../../utils/apiError'
import Avatar from '../Avatar'
import Pagination from '../Pagination'

const STATUS_STYLES: Record<ClaimStatus, string> = {
  pending: 'bg-amber-50 text-amber-800',
  approved: 'bg-green-50 text-green-700',
  rejected: 'bg-red-50 text-red-700',
}

function ClaimCard({
  claim,
  isBusy,
  onApprove,
  onReject,
}: {
  claim: Claim
  isBusy: boolean
  onApprove: () => void
  onReject: (reason: string) => void
}) {
  const [rejecting, setRejecting] = useState(false)
  const [reason, setReason] = useState('')
  const requester = typeof claim.user === 'string' ? null : claim.user
  const button = 'rounded-lg px-4 py-2 text-sm font-medium transition disabled:opacity-50'

  return (
    <article className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
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
              {claim.status}
            </span>
          </div>
          <p className="mt-0.5 text-sm text-gray-600">
            Claimed by <strong>{requester?.name}</strong>{' '}
            <span className="break-all text-gray-500">({requester?.email})</span>
          </p>
          <p className="text-xs text-gray-400">Sent {new Date(claim.createdAt).toLocaleString()}</p>
        </div>
      </div>

      {/* Saboot jo talent ne diya */}
      <dl className="mt-4 space-y-2 rounded-xl bg-gray-50 p-4 text-sm">
        {claim.evidence.contactEmail && (
          <div>
            <dt className="text-xs text-gray-500">Official email</dt>
            <dd className="break-all">{claim.evidence.contactEmail}</dd>
          </div>
        )}
        {claim.evidence.links.length > 0 && (
          <div>
            <dt className="text-xs text-gray-500">Proof links</dt>
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
        )}
        <div>
          <dt className="text-xs text-gray-500">How to verify</dt>
          <dd className="whitespace-pre-line">{claim.evidence.note}</dd>
        </div>
      </dl>

      {claim.status === 'rejected' && claim.rejectionReason && (
        <p className="mt-3 text-sm text-red-700">Reason: {claim.rejectionReason}</p>
      )}

      {claim.status === 'pending' &&
        (rejecting ? (
          <div className="mt-4 space-y-2">
            <label htmlFor={`reason-${claim._id}`} className="block text-sm font-medium">
              Reason (shown to the user)
            </label>
            <textarea
              id={`reason-${claim._id}`}
              rows={2}
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="e.g. Please send proof from your verified account"
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
                onClick={() => onReject(reason.trim())}
                disabled={isBusy}
                className={`${button} bg-red-600 text-white hover:bg-red-700`}
              >
                Reject claim
              </button>
            </div>
          </div>
        ) : (
          <div className="mt-4 flex gap-2">
            <button
              onClick={onApprove}
              disabled={isBusy}
              className={`${button} flex-1 bg-green-600 text-white hover:bg-green-700`}
            >
              ✓ Approve
            </button>
            <button
              onClick={() => setRejecting(true)}
              disabled={isBusy}
              className={`${button} flex-1 border border-red-200 text-red-600 hover:bg-red-50`}
            >
              Reject
            </button>
          </div>
        ))}
    </article>
  )
}

function ClaimRequests() {
  const [status, setStatus] = useState<ClaimStatus>('pending')
  const [page, setPage] = useState(1)
  const queryClient = useQueryClient()

  const { data, isLoading } = useQuery({
    queryKey: ['admin', 'claims', status, page],
    queryFn: () => adminListClaims(status, page),
    placeholderData: keepPreviousData,
    staleTime: 0,
  })

  const review = useMutation({
    mutationFn: ({
      id,
      action,
      reason,
    }: {
      id: string
      action: 'approve' | 'reject'
      reason?: string
    }) => reviewClaim(id, action, reason),
    onSuccess: (claim) => {
      toast.success(
        claim.status === 'approved' ? `${claim.person.name} claim approved` : 'Claim rejected',
      )
      queryClient.invalidateQueries({ queryKey: ['admin'] })
      queryClient.invalidateQueries({ queryKey: ['person', claim.person.slug] })
    },
    onError: (error) => toast.error(getApiError(error).message),
  })

  const total = data?.meta.total ?? 0

  return (
    <section className="space-y-4">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold">Claim requests</h2>
          <p className="text-sm text-gray-500">{data ? `${total} ${status}` : ' '}</p>
        </div>
        <select
          aria-label="Claim status"
          value={status}
          onChange={(e) => {
            setStatus(e.target.value as ClaimStatus)
            setPage(1)
          }}
          className="rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm"
        >
          <option value="pending">Pending</option>
          <option value="approved">Approved</option>
          <option value="rejected">Rejected</option>
        </select>
      </div>

      {isLoading && <p className="text-gray-500">Loading...</p>}
      {data && data.claims.length === 0 && (
        <p className="rounded-2xl border border-dashed border-gray-300 p-8 text-center text-gray-500">
          No {status} claims.
        </p>
      )}

      <div className="grid gap-4 lg:grid-cols-2">
        {data?.claims.map((claim) => (
          <ClaimCard
            key={claim._id}
            claim={claim}
            isBusy={review.isPending}
            onApprove={() => review.mutate({ id: claim._id, action: 'approve' })}
            onReject={(reason) =>
              review.mutate({ id: claim._id, action: 'reject', reason: reason || undefined })
            }
          />
        ))}
      </div>

      <Pagination page={page} totalPages={Math.ceil(total / 20)} onChange={setPage} />
    </section>
  )
}

export default ClaimRequests
