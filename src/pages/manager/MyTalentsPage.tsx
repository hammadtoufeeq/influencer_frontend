import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Link } from 'react-router-dom'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import toast from 'react-hot-toast'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import {
  faArrowRight,
  faCircle,
  faFileContract,
  faHandshake,
  faMagnifyingGlass,
  faUsers,
} from '@fortawesome/free-solid-svg-icons'
import { managerEnd, managerRespond } from '../../api/manager'
import { myManagerProfileQuery, myRepresentationsQuery, myTalentsQuery } from '../../api/queries'
import Avatar from '../../components/Avatar'
import VerifiedBadge from '../../components/VerifiedBadge'
import ConfirmDialog from '../../components/admin-panel/ConfirmDialog'
import StatusPill from '../../components/admin-panel/StatusPill'
import PermissionChips from '../../components/manager/PermissionChips'
import type { Representation } from '../../types/manager'
import { getApiError } from '../../utils/apiError'
import { formatDate } from '../../utils/adminFormat'
import { formatCount } from '../../utils/format'

const talentName = (rep: Representation) => (typeof rep.talent === 'object' ? rep.talent.name : '')

// /talents -> manager ke talents (roster), aayi hui dawat aur bheji hui darkhwastein
function MyTalentsPage() {
  const { t } = useTranslation()
  const queryClient = useQueryClient()
  const { data: manager } = useQuery(myManagerProfileQuery)
  const { data: talents, isLoading } = useQuery(myTalentsQuery)
  const { data: reps } = useQuery(myRepresentationsQuery)
  const [toCancel, setToCancel] = useState<Representation | null>(null)

  const refresh = () => queryClient.invalidateQueries({ queryKey: ['manager'] })
  const respond = useMutation({
    mutationFn: ({ id, action }: { id: string; action: 'accept' | 'decline' }) => managerRespond(id, action),
    onSuccess: (_r, { action }) => {
      toast.success(action === 'accept' ? t('manager.inviteAccepted') : t('manager.inviteDeclined'))
      refresh()
    },
    onError: (err) => toast.error(getApiError(err).message),
  })
  const cancel = useMutation({
    mutationFn: (id: string) => managerEnd(id),
    onSuccess: () => {
      toast.success(t('manager.requestWithdrawn'))
      setToCancel(null)
      refresh()
    },
    onError: (err) => {
      toast.error(getApiError(err).message)
      setToCancel(null)
    },
  })

  const invites = reps?.filter((r) => r.status === 'invited') ?? []
  const requests = reps?.filter((r) => r.status === 'requested') ?? []
  const verified = manager?.status === 'approved'

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold">{t('manager.talentsTitle')}</h1>
        <p className="mt-1 text-sm text-gray-500">{t('manager.talentsSubtitle')}</p>
      </div>

      {!verified && (
        <p className="rounded-xl bg-amber-50 px-4 py-3 text-sm text-amber-800">
          {t('manager.verifyFirst')}{' '}
          <Link to="/dashboard/manager" className="font-medium underline">
            {t('manager.addDetails')}
          </Link>
        </p>
      )}

      {/* Talents ki dawat: jawab yahin */}
      {invites.length > 0 && (
        <section className="space-y-3">
          <h2 className="font-semibold">{t('manager.invitesTitle')}</h2>
          {invites.map((rep) => (
            <article key={rep._id} className="rounded-2xl border border-violet-200 bg-white p-4 shadow-sm">
              <div className="flex flex-wrap items-start gap-3">
                <Avatar name={rep.person?.name ?? '?'} photoUrl={rep.person?.photoUrl} />
                <div className="min-w-0 flex-1">
                  <p className="font-medium">
                    {t('manager.invitedYou', { name: rep.person?.name ?? talentName(rep) })}
                  </p>
                  <div className="mt-1">
                    <PermissionChips permissions={rep.permissions} />
                  </div>
                  {rep.message && <p className="mt-2 whitespace-pre-line text-sm text-gray-700">{rep.message}</p>}
                </div>
              </div>
              <div className="mt-3 flex flex-wrap justify-end gap-2">
                <button
                  type="button"
                  disabled={respond.isPending}
                  onClick={() => respond.mutate({ id: rep._id, action: 'decline' })}
                  className="rounded-lg border border-gray-300 px-4 py-2 text-sm hover:bg-gray-100"
                >
                  {t('hire.decline')}
                </button>
                <button
                  type="button"
                  disabled={respond.isPending || !verified}
                  onClick={() => respond.mutate({ id: rep._id, action: 'accept' })}
                  className="rounded-lg bg-brand px-4 py-2 text-sm font-medium text-on-brand hover:bg-brand-hover disabled:opacity-50"
                >
                  {t('hire.accept')}
                </button>
              </div>
            </article>
          ))}
        </section>
      )}

      <section className="space-y-3">
        <h2 className="font-semibold">{t('manager.rosterTitle')}</h2>
        {isLoading && <div className="h-32 animate-pulse rounded-2xl bg-white shadow-sm" />}
        {!isLoading && !talents?.length && (
          <div className="rounded-2xl border border-dashed border-gray-300 bg-white px-6 py-10 text-center">
            <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-gray-100 text-gray-500">
              <FontAwesomeIcon icon={faUsers} />
            </span>
            <p className="mt-3 font-medium">{t('manager.rosterEmptyTitle')}</p>
            <p className="mx-auto mt-1 max-w-md text-sm text-gray-500">{t('manager.rosterEmptyText')}</p>
            {verified && (
              <Link
                to="/search"
                className="mt-4 inline-flex items-center gap-2 rounded-lg bg-brand px-4 py-2 text-sm font-medium text-on-brand hover:bg-brand-hover"
              >
                <FontAwesomeIcon icon={faMagnifyingGlass} />
                {t('manager.findTalents')}
              </Link>
            )}
          </div>
        )}
        <ul className="grid gap-4 sm:grid-cols-2">
          {talents?.map((talent) => (
            <li key={talent.representationId}>
              <Link
                to={`/talents/${talent.person._id}`}
                className="flex h-full flex-col rounded-2xl border border-gray-200 bg-white p-5 shadow-sm transition hover:shadow-md"
              >
                <div className="flex items-start gap-3">
                  <Avatar name={talent.person.name} photoUrl={talent.person.photoUrl} />
                  <div className="min-w-0 flex-1">
                    <p className="flex flex-wrap items-center gap-2 font-semibold">
                      {talent.person.name}
                      {talent.person.verified && <VerifiedBadge />}
                    </p>
                    {talent.person.headline && (
                      <p className="line-clamp-1 text-sm text-gray-500">{talent.person.headline}</p>
                    )}
                  </div>
                </div>
                <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-xs text-gray-600">
                  <span>{t('manager.followers', { count: formatCount(talent.person.totalFollowers) })}</span>
                  <span className={talent.person.isOpen ? 'text-green-700' : ''}>
                    <FontAwesomeIcon icon={faCircle} className="me-1 text-[7px]" />
                    {talent.person.isOpen ? t('services.openForWork') : t('services.notTakingWork')}
                  </span>
                  <span>{t('manager.liveServices', { count: talent.person.liveServices })}</span>
                </div>
                <div className="mt-3 flex flex-wrap gap-2 text-xs">
                  {talent.pendingHires > 0 && (
                    <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2 py-0.5 font-medium text-amber-800">
                      <FontAwesomeIcon icon={faHandshake} />
                      {t('manager.pendingHires', { count: talent.pendingHires })}
                    </span>
                  )}
                  {talent.openAgreements > 0 && (
                    <span className="inline-flex items-center gap-1 rounded-full bg-blue-50 px-2 py-0.5 font-medium text-blue-700">
                      <FontAwesomeIcon icon={faFileContract} />
                      {t('manager.openAgreements', { count: talent.openAgreements })}
                    </span>
                  )}
                </div>
                <div className="mt-auto flex items-end justify-between gap-3 pt-4">
                  <PermissionChips permissions={talent.permissions} />
                  <FontAwesomeIcon icon={faArrowRight} className="text-gray-400 rtl:rotate-180" />
                </div>
              </Link>
            </li>
          ))}
        </ul>
      </section>

      {requests.length > 0 && (
        <section className="space-y-3">
          <h2 className="font-semibold">{t('manager.sentRequestsTitle')}</h2>
          <ul className="divide-y divide-gray-100 rounded-2xl border border-gray-200 bg-white">
            {requests.map((rep) => (
              <li key={rep._id} className="flex flex-wrap items-center gap-3 px-4 py-3">
                <Avatar name={rep.person?.name ?? '?'} photoUrl={rep.person?.photoUrl} size="sm" />
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium">{rep.person?.name}</p>
                  <p className="text-xs text-gray-500">
                    {t('manager.sentOn', { date: formatDate(rep.createdAt) })}
                  </p>
                </div>
                <StatusPill status="requested" label={t('manager.status.requested')} />
                <button
                  type="button"
                  onClick={() => setToCancel(rep)}
                  className="rounded-lg border border-gray-300 px-3 py-1.5 text-xs hover:bg-gray-100"
                >
                  {t('manager.withdraw')}
                </button>
              </li>
            ))}
          </ul>
        </section>
      )}

      <ConfirmDialog
        open={!!toCancel}
        title={t('manager.withdrawTitle')}
        tone="danger"
        isBusy={cancel.isPending}
        onConfirm={() => toCancel && cancel.mutate(toCancel._id)}
        onCancel={() => setToCancel(null)}
      >
        <p>{t('manager.withdrawBody', { name: toCancel?.person?.name ?? '' })}</p>
      </ConfirmDialog>
    </div>
  )
}

export default MyTalentsPage
