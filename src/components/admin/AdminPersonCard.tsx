import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import {
  faArrowUpRightFromSquare,
  faBan,
  faCircleCheck,
  faEye,
  faEyeSlash,
  faPen,
  faTrash,
  faTriangleExclamation,
} from '@fortawesome/free-solid-svg-icons'
import { useState, type ReactNode } from 'react'
import { Link } from 'react-router-dom'
import Avatar from '../Avatar'
import { STATUS_LABELS } from '../../constants/people'
import type { AdminPersonRow } from '../../types/admin'
import { formatCount } from '../../utils/format'

interface AdminPersonCardProps {
  person: AdminPersonRow
  isBusy: boolean
  onToggleVerified: () => void
  onToggleHidden: () => void
  onDelete: () => void
}

function Badge({ className, children }: { className: string; children: ReactNode }) {
  return (
    <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${className}`}>{children}</span>
  )
}

function AdminPersonCard({
  person,
  isBusy,
  onToggleVerified,
  onToggleHidden,
  onDelete,
}: AdminPersonCardProps) {
  const isHidden = person.visibility === 'hidden'
  const isClaimed = Boolean(person.claimedBy)
  // Delete se pehle card ke andar hi "Are you sure?" poochte hain
  const [confirmDelete, setConfirmDelete] = useState(false)
  const button =
    'inline-flex items-center justify-center gap-1 rounded-lg px-3 py-2 text-xs font-medium transition disabled:opacity-50'

  return (
    <article
      className={`flex flex-col rounded-2xl border bg-white shadow-sm transition hover:shadow-md ${
        isHidden ? 'border-red-200 bg-red-50/30' : 'border-gray-200'
      }`}
    >
      <div className="flex gap-4 p-5">
        <Avatar name={person.name} photoUrl={person.photoUrl} />
        <div className="min-w-0 flex-1">
          <h3 className="truncate font-semibold">{person.name}</h3>
          <p className="truncate text-xs text-gray-400">/{person.slug}</p>
          {person.headline && (
            <p className="mt-1 line-clamp-2 text-sm text-gray-600">{person.headline}</p>
          )}
          <div className="mt-3 flex flex-wrap gap-1.5">
            {person.verified && (
              <Badge className="bg-blue-50 text-blue-700">
                <FontAwesomeIcon icon={faCircleCheck} className="mr-1" />
                Verified
              </Badge>
            )}
            {isHidden && <Badge className="bg-red-100 text-red-700">Hidden</Badge>}
            {person.claimedBy && <Badge className="bg-green-50 text-green-700">Claimed</Badge>}
            {person.isDemo && <Badge className="bg-amber-50 text-amber-800">Demo</Badge>}
          </div>
        </div>
      </div>

      <dl className="mx-5 grid grid-cols-2 gap-3 rounded-xl bg-gray-50 p-3 text-xs">
        <div>
          <dt className="text-gray-500">Followers</dt>
          <dd className="mt-0.5 text-sm font-semibold">{formatCount(person.totalFollowers)}</dd>
        </div>
        <div>
          <dt className="text-gray-500">State</dt>
          <dd className="mt-0.5 text-sm font-semibold">{STATUS_LABELS[person.status]}</dd>
        </div>
      </dl>

      {confirmDelete ? (
        <div className="mx-5 mt-auto mb-5 rounded-xl border border-red-200 bg-red-50 p-4">
          <p className="text-sm font-medium text-red-800">
            <FontAwesomeIcon icon={faTriangleExclamation} className="mr-1.5" />
            Delete {person.name} permanently?
          </p>
          <p className="mt-1 text-xs text-red-700">
            This cannot be undone. To take a profile down temporarily, use Hide instead.
          </p>
          <div className="mt-3 flex gap-2">
            <button
              onClick={() => setConfirmDelete(false)}
              className={`${button} flex-1 border border-gray-300 bg-white text-gray-700 hover:bg-gray-100`}
            >
              Cancel
            </button>
            <button
              onClick={onDelete}
              disabled={isBusy}
              className={`${button} flex-1 bg-red-600 text-white hover:bg-red-700`}
            >
              Yes, delete
            </button>
          </div>
        </div>
      ) : (
        <div
          className={`mt-auto grid grid-cols-2 gap-2 p-5 ${isClaimed ? 'sm:grid-cols-4' : 'sm:grid-cols-5'}`}
        >
          {/* Claimed profile sirf uska maalik edit kar sakta hai: Edit button hi nahi */}
          {!isClaimed && (
            <Link
              to={`/dashboard/people/${person._id}/edit`}
              className={`${button} bg-gray-900 text-white hover:bg-gray-800`}
            >
              <FontAwesomeIcon icon={faPen} /> Edit
            </Link>
          )}
          <button
            onClick={onToggleVerified}
            disabled={isBusy}
            className={`${button} ${
              person.verified
                ? 'border border-blue-200 text-blue-700 hover:bg-blue-50'
                : 'bg-blue-600 text-white hover:bg-blue-700'
            }`}
          >
            <FontAwesomeIcon icon={person.verified ? faBan : faCircleCheck} />
            {person.verified ? 'Unverify' : 'Verify'}
          </button>
          <button
            onClick={onToggleHidden}
            disabled={isBusy}
            className={`${button} ${
              isHidden
                ? 'bg-green-600 text-white hover:bg-green-700'
                : 'border border-red-200 text-red-600 hover:bg-red-50'
            }`}
          >
            <FontAwesomeIcon icon={isHidden ? faEye : faEyeSlash} />
            {isHidden ? 'Show' : 'Hide'}
          </button>
          {isHidden ? (
            <span
              className={`${button} cursor-not-allowed border border-gray-200 text-gray-400`}
              title="Hidden profiles are not public"
            >
              View
            </span>
          ) : (
            <Link
              to={`/people/${person.slug}`}
              className={`${button} border border-gray-300 text-gray-700 hover:bg-gray-100`}
            >
              View <FontAwesomeIcon icon={faArrowUpRightFromSquare} className="text-[10px]" />
            </Link>
          )}
          <button
            onClick={() => setConfirmDelete(true)}
            disabled={isBusy}
            className={`${button} ${isClaimed ? '' : 'col-span-2 sm:col-span-1'} border border-red-200 text-red-600 hover:bg-red-600 hover:text-white`}
          >
            <FontAwesomeIcon icon={faTrash} /> Delete
          </button>
        </div>
      )}
    </article>
  )
}

export default AdminPersonCard
