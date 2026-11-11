import { useState, type FormEvent } from 'react'
import { useTranslation } from 'react-i18next'
import { Link } from 'react-router-dom'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import toast from 'react-hot-toast'
import axios from 'axios'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faCircleCheck, faGlobe, faUserTie } from '@fortawesome/free-solid-svg-icons'
import {
  inviteManager,
  reviewMyManager,
  talentEnd,
  talentRespond,
  updatePermissions,
} from '../../api/manager'
import { myManagerQuery } from '../../api/queries'
import FormField from '../../components/FormField'
import ConfirmDialog from '../../components/admin-panel/ConfirmDialog'
import StatusPill from '../../components/admin-panel/StatusPill'
import Stars from '../../components/agreements/Stars'
import PermissionPicker from '../../components/manager/PermissionPicker'
import type { Representation, RepresentationPermissions } from '../../types/manager'
import { getApiError } from '../../utils/apiError'
import { formatDate } from '../../utils/adminFormat'
import { countryName } from '../../utils/format'

const box = 'rounded-2xl bg-white p-5 shadow-sm md:p-6'

const managerOf = (rep: Representation) =>
  typeof rep.manager === 'object' ? rep.manager : { _id: '', name: '', email: '' }

// Manager ka naam, agency, website aur "verified" (har card pe)
function ManagerCard({ rep }: { rep: Representation }) {
  const { t } = useTranslation()
  const manager = managerOf(rep)
  const profile = rep.managerProfile
  return (
    <div className="flex flex-wrap items-start gap-3">
      <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-brand text-on-brand">
        <FontAwesomeIcon icon={faUserTie} />
      </span>
      <div className="min-w-0 flex-1">
        <p className="flex flex-wrap items-center gap-2 font-semibold">
          {manager.name}
          {profile?.verified && (
            <span className="inline-flex items-center gap-1 rounded-full bg-star-soft px-2 py-0.5 text-xs font-medium text-star-ink">
              <FontAwesomeIcon icon={faCircleCheck} />
              {t('manager.verifiedManager')}
            </span>
          )}
        </p>
        <p className="text-sm text-gray-600">
          {[profile?.agencyName, profile?.city, profile && countryName(profile.country)]
            .filter(Boolean)
            .join(' · ')}
        </p>
        {profile?.websiteUrl && (
          <a
            href={profile.websiteUrl}
            target="_blank"
            rel="noopener noreferrer nofollow"
            className="mt-0.5 inline-flex items-center gap-1.5 text-xs underline"
          >
            <FontAwesomeIcon icon={faGlobe} />
            {profile.websiteUrl.replace(/^https?:\/\//, '')}
          </a>
        )}
        {profile?.bio && <p className="mt-2 text-sm text-gray-600">{profile.bio}</p>}
      </div>
    </div>
  )
}

// Manager ki darkhwast: haan (ijazat chun kar) ya na
function RequestCard({ rep }: { rep: Representation }) {
  const { t } = useTranslation()
  const queryClient = useQueryClient()
  const [permissions, setPermissions] = useState<RepresentationPermissions>({ manageProfile: false, handleHires: true })
  const respond = useMutation({
    mutationFn: (action: 'accept' | 'decline') =>
      talentRespond(rep._id, action, action === 'accept' ? permissions : undefined),
    onSuccess: (_r, action) => {
      toast.success(action === 'accept' ? t('manager.requestAccepted') : t('manager.requestDeclined'))
      queryClient.invalidateQueries({ queryKey: ['me', 'manager'] })
    },
    onError: (err) => toast.error(getApiError(err).message),
  })
  return (
    <article className="space-y-4 rounded-2xl border border-violet-200 bg-white p-5 shadow-sm">
      <p className="text-sm font-medium text-violet-700">{t('manager.wantsToRepresent')}</p>
      <ManagerCard rep={rep} />
      {rep.message && <p className="whitespace-pre-line rounded-xl bg-gray-50 px-3 py-2 text-sm">{rep.message}</p>}
      <PermissionPicker value={permissions} onChange={setPermissions} />
      <div className="flex flex-wrap justify-end gap-2">
        <button
          type="button"
          disabled={respond.isPending}
          onClick={() => respond.mutate('decline')}
          className="rounded-lg border border-gray-300 px-4 py-2 text-sm hover:bg-gray-100"
        >
          {t('hire.decline')}
        </button>
        <button
          type="button"
          disabled={respond.isPending}
          onClick={() => respond.mutate('accept')}
          className="rounded-lg bg-brand px-4 py-2 text-sm font-medium text-on-brand hover:bg-brand-hover"
        >
          {t('manager.acceptManager')}
        </button>
      </div>
    </article>
  )
}

// Abhi ka manager: ijazat badlo ya rishta khatam karo
// Talent apne manager ko sitare aur do lafz (ek dafa). Pehle se di ho to wahi dikhao
function ManagerReview({ rep }: { rep: Representation }) {
  const { t } = useTranslation()
  const queryClient = useQueryClient()
  const [rating, setRating] = useState(0)
  const [comment, setComment] = useState('')
  const send = useMutation({
    mutationFn: () => reviewMyManager(rep._id, rating, comment.trim() || undefined),
    onSuccess: () => {
      toast.success(t('manager.reviewSent'))
      queryClient.invalidateQueries({ queryKey: ['me', 'manager'] })
    },
    onError: (err) => toast.error(getApiError(err).message),
  })

  if (rep.review) {
    return (
      <div className="flex flex-wrap items-center gap-2 text-sm text-gray-600">
        <span>{t('manager.yourReview')}</span>
        <Stars value={rep.review.rating} />
        {rep.review.comment && <span className="text-gray-500">“{rep.review.comment}”</span>}
      </div>
    )
  }
  return (
    <div className="space-y-2 rounded-xl bg-gray-50 p-4">
      <p className="text-sm font-medium">{t('manager.rateTitle', { name: managerOf(rep).name })}</p>
      <Stars value={rating} onChange={setRating} size="text-xl" />
      {rating > 0 && (
        <>
          <textarea
            rows={2}
            maxLength={1000}
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder={t('manager.reviewPlaceholder')}
            className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-brand"
          />
          <button
            type="button"
            disabled={send.isPending}
            onClick={() => send.mutate()}
            className="rounded-lg bg-brand px-4 py-2 text-sm font-medium text-on-brand hover:bg-brand-hover disabled:opacity-60"
          >
            {send.isPending ? t('common.saving') : t('manager.sendReview')}
          </button>
        </>
      )}
    </div>
  )
}

function ActiveManager({ rep }: { rep: Representation }) {
  const { t } = useTranslation()
  const queryClient = useQueryClient()
  const [permissions, setPermissions] = useState(rep.permissions)
  const [ending, setEnding] = useState(false)
  const changed =
    permissions.manageProfile !== rep.permissions.manageProfile || permissions.handleHires !== rep.permissions.handleHires
  const refresh = () => queryClient.invalidateQueries({ queryKey: ['me', 'manager'] })

  const save = useMutation({
    mutationFn: () => updatePermissions(rep._id, permissions),
    onSuccess: () => {
      toast.success(t('manager.permissionsSaved'))
      refresh()
    },
    onError: (err) => toast.error(getApiError(err).message),
  })
  const end = useMutation({
    mutationFn: () => talentEnd(rep._id),
    onSuccess: () => {
      toast.success(t('manager.ended'))
      setEnding(false)
      refresh()
    },
    onError: (err) => {
      toast.error(getApiError(err).message)
      setEnding(false)
    },
  })

  return (
    <section className={`${box} space-y-4 ring-1 ring-green-200`}>
      <p className="text-xs font-semibold uppercase tracking-wide text-green-700">
        {t('manager.yourManagerSince', { date: formatDate(rep.respondedAt ?? rep.updatedAt) })}
      </p>
      <ManagerCard rep={rep} />
      <ManagerReview rep={rep} />
      <PermissionPicker value={permissions} onChange={setPermissions} />
      <div className="flex flex-wrap justify-between gap-2 border-t border-gray-100 pt-4">
        <button
          type="button"
          onClick={() => setEnding(true)}
          className="rounded-lg border border-red-200 px-4 py-2 text-sm text-red-600 hover:bg-red-50"
        >
          {t('manager.removeManager')}
        </button>
        <button
          type="button"
          disabled={!changed || save.isPending}
          onClick={() => save.mutate()}
          className="rounded-lg bg-brand px-4 py-2 text-sm font-medium text-on-brand hover:bg-brand-hover disabled:opacity-50"
        >
          {save.isPending ? t('common.saving') : t('manager.savePermissions')}
        </button>
      </div>
      <ConfirmDialog
        open={ending}
        title={t('manager.removeTitle')}
        tone="danger"
        confirmLabel={t('manager.removeManager')}
        isBusy={end.isPending}
        onConfirm={() => end.mutate()}
        onCancel={() => setEnding(false)}
      >
        <p>{t('manager.removeBody', { name: managerOf(rep).name })}</p>
      </ConfirmDialog>
    </section>
  )
}

// Kisi verified manager ko us ke login email se bulao
function InviteForm() {
  const { t } = useTranslation()
  const queryClient = useQueryClient()
  const [email, setEmail] = useState('')
  const [message, setMessage] = useState('')
  const [permissions, setPermissions] = useState<RepresentationPermissions>({ manageProfile: false, handleHires: true })
  const [error, setError] = useState('')

  const invite = useMutation({
    mutationFn: () => inviteManager(email.trim(), permissions, message.trim() || undefined),
    onMutate: () => setError(''),
    onSuccess: () => {
      toast.success(t('manager.inviteSent'))
      setEmail('')
      setMessage('')
      queryClient.invalidateQueries({ queryKey: ['me', 'manager'] })
    },
    onError: (err) => {
      const { message: msg, fields } = getApiError(err)
      setError(fields.email ?? msg)
    },
  })

  function handleSubmit(e: FormEvent) {
    e.preventDefault()
    if (email.trim()) invite.mutate()
  }

  return (
    <form onSubmit={handleSubmit} className={`${box} space-y-4`}>
      <div>
        <h2 className="font-semibold">{t('manager.inviteTitle')}</h2>
        <p className="text-sm text-gray-500">{t('manager.inviteText')}</p>
      </div>
      <FormField
        id="managerEmail"
        type="email"
        label={t('manager.managerEmail')}
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        error={error}
        required
      />
      <label className="block">
        <span className="mb-1 block text-sm font-medium">{t('manager.messageOptional')}</span>
        <textarea
          rows={2}
          maxLength={1000}
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
        />
      </label>
      <PermissionPicker value={permissions} onChange={setPermissions} />
      <div className="flex justify-end">
        <button
          type="submit"
          disabled={!email.trim() || invite.isPending}
          className="rounded-lg bg-brand px-4 py-2 text-sm font-medium text-on-brand hover:bg-brand-hover disabled:opacity-50"
        >
          {invite.isPending ? t('common.saving') : t('manager.sendInvite')}
        </button>
      </div>
    </form>
  )
}

// /dashboard/my-manager -> talent ka manager: bulao, darkhwast ka jawab, ijazat, khatam
function MyManagerPage() {
  const { t } = useTranslation()
  const queryClient = useQueryClient()
  const { data, isLoading, error } = useQuery({ ...myManagerQuery, retry: false })
  const [toCancel, setToCancel] = useState<Representation | null>(null)
  const cancel = useMutation({
    mutationFn: (id: string) => talentEnd(id),
    onSuccess: () => {
      toast.success(t('manager.inviteWithdrawn'))
      setToCancel(null)
      queryClient.invalidateQueries({ queryKey: ['me', 'manager'] })
    },
    onError: (err) => {
      toast.error(getApiError(err).message)
      setToCancel(null)
    },
  })

  const noProfile = axios.isAxiosError(error) && error.response?.status === 404
  const requests = data?.pending.filter((r) => r.status === 'requested') ?? []
  const invites = data?.pending.filter((r) => r.status === 'invited') ?? []

  return (
    <div className="mx-auto max-w-3xl space-y-5">
      <div>
        <h1 className="text-2xl font-bold">{t('manager.myManagerTitle')}</h1>
        <p className="mt-1 text-sm text-gray-500">{t('manager.myManagerSubtitle')}</p>
      </div>

      {isLoading && <div className="h-48 animate-pulse rounded-2xl bg-white shadow-sm" />}
      {noProfile && (
        <p className="rounded-xl bg-amber-50 px-4 py-3 text-sm text-amber-800">
          {t('manager.claimFirst')}{' '}
          <Link to="/search" className="font-medium underline">
            {t('services.findProfile')}
          </Link>
        </p>
      )}

      {data && (
        <>
          {requests.map((rep) => (
            <RequestCard key={rep._id} rep={rep} />
          ))}
          {data.active ? <ActiveManager key={data.active._id} rep={data.active} /> : <InviteForm />}

          {invites.length > 0 && (
            <section className="space-y-2">
              <h2 className="font-semibold">{t('manager.sentInvitesTitle')}</h2>
              <ul className="divide-y divide-gray-100 rounded-2xl border border-gray-200 bg-white">
                {invites.map((rep) => (
                  <li key={rep._id} className="flex flex-wrap items-center gap-3 px-4 py-3">
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium">{managerOf(rep).name}</p>
                      <p className="text-xs text-gray-500">{t('manager.sentOn', { date: formatDate(rep.createdAt) })}</p>
                    </div>
                    <StatusPill status="invited" label={t('manager.status.invited')} />
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

          {data.history.length > 0 && (
            <section className="space-y-2">
              <h2 className="text-sm font-medium text-gray-500">{t('manager.historyTitle')}</h2>
              <ul className="divide-y divide-gray-100 rounded-2xl border border-gray-200 bg-white">
                {data.history.map((rep) => (
                  <li key={rep._id} className="space-y-2 px-4 py-2.5 text-sm">
                    <div className="flex flex-wrap items-center gap-3">
                      <span className="flex-1">{managerOf(rep).name}</span>
                      <StatusPill status={rep.status} label={t(`manager.status.${rep.status}`)} />
                      <span className="text-xs text-gray-500">{formatDate(rep.endedAt ?? rep.updatedAt)}</span>
                    </div>
                    {/* Jis manager ke saath kaam kiya (rishta khatam) us ko bhi review */}
                    {rep.status === 'ended' && <ManagerReview rep={rep} />}
                  </li>
                ))}
              </ul>
            </section>
          )}
        </>
      )}

      <ConfirmDialog
        open={!!toCancel}
        title={t('manager.withdrawTitle')}
        tone="danger"
        isBusy={cancel.isPending}
        onConfirm={() => toCancel && cancel.mutate(toCancel._id)}
        onCancel={() => setToCancel(null)}
      >
        <p>{t('manager.withdrawInviteBody', { name: toCancel ? managerOf(toCancel).name : '' })}</p>
      </ConfirmDialog>
    </div>
  )
}

export default MyManagerPage
