import { useTranslation } from 'react-i18next'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import {
  faArrowUpRightFromSquare,
  faCircleCheck,
  faEye,
  faEyeSlash,
  faPen,
  faTrash,
  faTriangleExclamation,
  faUserCheck,
  faUserClock,
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
  onToggleHidden: () => void
  onDelete: () => void
}

function Badge({ className, children }: { className: string; children: ReactNode }) {
  return (
    <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${className}`}>{children}</span>
  )
}

function AdminPersonCard({ person, isBusy, onToggleHidden, onDelete }: AdminPersonCardProps) {
  const { t } = useTranslation()
  const isHidden = person.visibility === 'hidden'
  const isClaimed = Boolean(person.claimedBy)
  // Verified haath se nahi: claim approve hote hi khud lagta hai
  const actionCount = (isClaimed ? 0 : 1) + 3
  const smCols = { 3: 'sm:grid-cols-3', 4: 'sm:grid-cols-4', 5: 'sm:grid-cols-5' }[actionCount]
  // Malikana haalat: unclaimed -> claimed (tasdeeq baqi) -> verified
  const ownership = person.verified
    ? { key: 'verified', icon: faCircleCheck, tone: 'bg-star-soft text-star-ink border-star/30' }
    : isClaimed
      ? { key: 'claimed', icon: faUserCheck, tone: 'bg-amber-50 text-amber-800 border-amber-100' }
      : { key: 'unclaimed', icon: faUserClock, tone: 'bg-gray-50 text-gray-600 border-gray-100' }
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
      {/* Card ke upar: profile kis ki hai aur tasdeeq hui ya nahi */}
      <div
        className={`flex items-center gap-2 rounded-t-2xl border-b px-5 py-2 text-xs ${ownership.tone}`}
        title={t(`oldAdmin.ownership.${ownership.key}Hint`)}
      >
        <FontAwesomeIcon icon={ownership.icon} />
        <span className="font-semibold">{t(`oldAdmin.ownership.${ownership.key}`)}</span>
        <span className="truncate opacity-80">
          · {t(`oldAdmin.ownership.${ownership.key}Hint`)}
        </span>
      </div>

      <div className="flex gap-4 p-5">
        <Avatar name={person.name} photoUrl={person.photoUrl} />
        <div className="min-w-0 flex-1">
          <h3 className="truncate font-semibold">{person.name}</h3>
          <p className="truncate text-xs text-gray-400">/{person.slug}</p>
          {person.headline && (
            <p className="mt-1 line-clamp-2 text-sm text-gray-600">{person.headline}</p>
          )}
          {(person.isDraft || isHidden || person.isDemo) && (
            <div className="mt-3 flex flex-wrap gap-1.5">
              {person.isDraft ? (
                <Badge className="bg-violet-50 text-violet-700">{t('newProfile.draftBadge')}</Badge>
              ) : (
                isHidden && (
                  <Badge className="bg-red-100 text-red-700">{t('oldAdmin.hidden')}</Badge>
                )
              )}
              {person.isDemo && (
                <Badge className="bg-amber-50 text-amber-800">{t('oldAdmin.demo')}</Badge>
              )}
            </div>
          )}
        </div>
      </div>

      <dl className="mx-5 grid grid-cols-2 gap-3 rounded-xl bg-gray-50 p-3 text-xs">
        <div>
          <dt className="text-gray-500">{t('oldAdmin.followers')}</dt>
          <dd className="mt-0.5 text-sm font-semibold">{formatCount(person.totalFollowers)}</dd>
        </div>
        <div>
          <dt className="text-gray-500">{t('oldAdmin.state')}</dt>
          <dd className="mt-0.5 text-sm font-semibold">{STATUS_LABELS[person.status]}</dd>
        </div>
      </dl>

      {confirmDelete ? (
        <div className="mx-5 mt-auto mb-5 rounded-xl border border-red-200 bg-red-50 p-4">
          <p className="text-sm font-medium text-red-800">
            <FontAwesomeIcon icon={faTriangleExclamation} className="me-1.5" />
            {t('oldAdmin.deleteConfirm', { name: person.name })}
          </p>
          <p className="mt-1 text-xs text-red-700">{t('oldAdmin.deleteWarning')}</p>
          <div className="mt-3 flex gap-2">
            <button
              onClick={() => setConfirmDelete(false)}
              className={`${button} flex-1 border border-gray-300 bg-white text-gray-700 hover:bg-gray-100`}
            >
              {t('common.cancel')}
            </button>
            <button
              onClick={onDelete}
              disabled={isBusy}
              className={`${button} flex-1 bg-red-600 text-white hover:bg-red-700`}
            >
              {t('oldAdmin.yesDelete')}
            </button>
          </div>
        </div>
      ) : (
        <div className={`mt-auto grid grid-cols-2 gap-2 p-5 ${smCols}`}>
          {/* Claimed profile sirf uska maalik edit kar sakta hai: Edit button hi nahi */}
          {!isClaimed && (
            <Link
              to={`/dashboard/people/${person._id}/edit`}
              className={`${button} bg-brand text-on-brand hover:bg-brand-hover`}
            >
              <FontAwesomeIcon icon={faPen} /> {t('oldAdmin.edit')}
            </Link>
          )}
          {/* Talent ki bheji hui profile claim approve hone pe hi public hoti hai */}
          {person.isDraft ? (
            <span
              className={`${button} cursor-not-allowed border border-violet-200 text-violet-700`}
              title={t('newProfile.draftHint')}
            >
              {t('newProfile.draftPending')}
            </span>
          ) : (
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
              {isHidden ? t('oldAdmin.show') : t('oldAdmin.hide')}
            </button>
          )}
          {isHidden ? (
            <span
              className={`${button} cursor-not-allowed border border-gray-200 text-gray-400`}
              title={t('oldAdmin.hiddenNotPublic')}
            >
              {t('oldAdmin.view')}
            </span>
          ) : (
            <Link
              to={`/people/${person.slug}`}
              className={`${button} border border-gray-300 text-gray-700 hover:bg-gray-100`}
            >
              {t('oldAdmin.view')}{' '}
              <FontAwesomeIcon icon={faArrowUpRightFromSquare} className="text-[10px]" />
            </Link>
          )}
          <button
            onClick={() => setConfirmDelete(true)}
            disabled={isBusy}
            className={`${button} ${actionCount % 2 === 1 ? 'col-span-2 sm:col-span-1' : ''} border border-red-200 text-red-600 hover:bg-red-600 hover:text-white`}
          >
            <FontAwesomeIcon icon={faTrash} /> {t('oldAdmin.delete')}
          </button>
          {!isClaimed && (
            <p className="col-span-full text-xs text-gray-500">{t('oldAdmin.autoVerifyHint')}</p>
          )}
        </div>
      )}
    </article>
  )
}

export default AdminPersonCard
