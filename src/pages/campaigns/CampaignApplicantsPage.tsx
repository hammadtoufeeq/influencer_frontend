import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { useMutation, useQuery } from '@tanstack/react-query'
import toast from 'react-hot-toast'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import {
  faArrowLeft,
  faArrowUpRightFromSquare,
  faCheck,
  faCircleCheck,
  faInbox,
  faLocationDot,
  faPen,
  faTrash,
  faUsers,
  faXmark,
} from '@fortawesome/free-solid-svg-icons'
import { deleteCampaign, respondApplication, updateCampaign } from '../../api/campaigns'
import ConfirmDialog from '../../components/admin-panel/ConfirmDialog'
import { campaignApplicationsQuery, myCampaignsQuery } from '../../api/queries'
import {
  ApplicationStatusBadge,
  CampaignFacts,
  CampaignStatusBadge,
} from '../../components/campaigns/campaignUi'
import { useCampaignFormat } from '../../components/campaigns/campaignFormat'
import type { ApplicationStatus, CampaignApplication, CampaignStatus } from '../../types/campaign'
import { getApiError } from '../../utils/apiError'
import { countryName, formatCount, initials } from '../../utils/format'

type Tab = 'all' | Exclude<ApplicationStatus, 'withdrawn'>
const TABS: Tab[] = ['all', 'pending', 'accepted', 'rejected']

function ApplicantCard({
  application,
  campaignId,
  canSelect,
}: {
  application: CampaignApplication
  campaignId: string
  canSelect: boolean
}) {
  const { t } = useTranslation()
  const format = useCampaignFormat()
  const person = application.person
  const respond = useMutation({
    mutationFn: (action: 'accept' | 'reject') =>
      respondApplication(campaignId, application._id, action),
    onSuccess: (_data, action) =>
      toast.success(
        action === 'accept' ? t('campaigns.acceptedToast') : t('campaigns.rejectedToast'),
      ),
    onError: (error) => toast.error(getApiError(error).message),
  })
  const location = [person?.city, countryName(person?.country)].filter(Boolean).join(', ')

  return (
    <li className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-gray-200/70">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="flex min-w-0 items-center gap-3">
          {person?.photoUrl ? (
            <img
              src={person.photoUrl}
              alt=""
              className="h-12 w-12 shrink-0 rounded-full object-cover"
            />
          ) : (
            <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-gray-900 text-sm font-semibold text-white">
              {initials(person?.name ?? '?')}
            </span>
          )}
          <div className="min-w-0">
            <p className="flex items-center gap-1.5 font-semibold text-gray-900">
              <span className="truncate">{person?.name ?? t('campaigns.removedProfile')}</span>
              {person?.verified && (
                <FontAwesomeIcon icon={faCircleCheck} className="text-blue-600" />
              )}
            </p>
            {person?.headline && (
              <p className="truncate text-sm text-gray-600">{person.headline}</p>
            )}
            <p className="mt-0.5 flex flex-wrap gap-x-3 text-xs text-gray-500">
              {location && (
                <span>
                  <FontAwesomeIcon icon={faLocationDot} className="me-1 text-gray-400" />
                  {location}
                </span>
              )}
              {Boolean(person?.totalFollowers) && (
                <span>
                  <FontAwesomeIcon icon={faUsers} className="me-1 text-gray-400" />
                  {t('campaigns.followers', { count: formatCount(person!.totalFollowers!) })}
                </span>
              )}
              <span>{t('campaigns.appliedOn', { date: format.date(application.createdAt) })}</span>
            </p>
          </div>
        </div>
        <ApplicationStatusBadge status={application.status} />
      </div>

      <p className="mt-4 rounded-xl bg-gray-50 p-3 text-sm whitespace-pre-line text-gray-700">
        {application.pitch}
      </p>

      <div className="mt-4 flex flex-wrap items-center gap-2">
        {person && (
          <Link
            to={`/people/${person.slug}`}
            target="_blank"
            className="inline-flex items-center gap-1.5 rounded-xl border border-gray-300 px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            {t('campaigns.viewProfile')}
            <FontAwesomeIcon icon={faArrowUpRightFromSquare} className="text-[10px]" />
          </Link>
        )}
        {application.status === 'pending' && (
          <>
            <button
              type="button"
              disabled={respond.isPending || !canSelect}
              title={canSelect ? undefined : t('campaigns.fullHint')}
              onClick={() => respond.mutate('accept')}
              className="inline-flex items-center gap-1.5 rounded-xl bg-gray-900 px-3 py-2 text-sm font-medium text-white hover:bg-gray-800 disabled:opacity-50"
            >
              <FontAwesomeIcon icon={faCheck} className="text-xs" />
              {t('campaigns.select')}
            </button>
            <button
              type="button"
              disabled={respond.isPending}
              onClick={() => respond.mutate('reject')}
              className="inline-flex items-center gap-1.5 rounded-xl border border-gray-300 px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
            >
              <FontAwesomeIcon icon={faXmark} className="text-xs" />
              {t('campaigns.reject')}
            </button>
          </>
        )}
        {application.status === 'accepted' && (
          <Link
            to="/dashboard/hire-requests"
            className="inline-flex items-center gap-1.5 rounded-xl bg-green-600 px-3 py-2 text-sm font-medium text-white hover:bg-green-700"
          >
            {t('campaigns.startAgreement')}
          </Link>
        )}
      </div>
    </li>
  )
}

// /dashboard/campaigns/:id -> campaign ki halat aur aaye hue talents
function CampaignApplicantsPage() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const { id = '' } = useParams()
  const [tab, setTab] = useState<Tab>('all')
  // Kaunsa "pakka?" dialog khula hai (browser ke alert ki jagah)
  const [confirming, setConfirming] = useState<'close' | 'delete' | null>(null)
  const { data, isLoading, isError } = useQuery(campaignApplicationsQuery(id))
  const { data: mine } = useQuery(myCampaignsQuery)

  const setStatus = useMutation({
    mutationFn: (status: CampaignStatus) => updateCampaign(id, { status }),
    onSuccess: (saved) => {
      toast.success(t(`campaigns.statusToast.${saved.status}`))
      setConfirming(null)
    },
    onError: (error) => toast.error(getApiError(error).message),
  })
  const remove = useMutation({
    mutationFn: () => deleteCampaign(id),
    onSuccess: () => {
      toast.success(t('campaigns.deleted'))
      navigate('/dashboard/campaigns', { replace: true })
    },
    onError: (error) => toast.error(getApiError(error).message),
  })

  if (isLoading) return <div className="h-96 animate-pulse rounded-2xl bg-gray-200/70" />
  if (isError || !data) {
    return (
      <p className="rounded-2xl bg-white p-6 text-center shadow-sm">{t('campaigns.notFound')}</p>
    )
  }

  const { campaign, applications } = data
  const shown = tab === 'all' ? applications : applications.filter((a) => a.status === tab)
  const count = (status: Tab) =>
    status === 'all' ? applications.length : applications.filter((a) => a.status === status).length
  const canSelect = campaign.counts.accepted < campaign.slots
  const canPublish = mine?.canPublish ?? false
  const actionButton =
    'inline-flex items-center gap-1.5 rounded-xl border border-gray-300 bg-white px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50'

  return (
    <div className="space-y-5">
      <Link
        to="/dashboard/campaigns"
        className="inline-flex items-center gap-2 text-sm font-medium text-gray-600 hover:text-gray-900"
      >
        <FontAwesomeIcon icon={faArrowLeft} className="text-xs rtl:rotate-180" />
        {t('campaigns.back')}
      </Link>

      <section className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-gray-200/70 md:p-6">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="text-xl font-bold tracking-tight md:text-2xl">{campaign.title}</h1>
              <CampaignStatusBadge status={campaign.status} expired={!campaign.acceptingApplications} />
            </div>
            <p className="mt-1 text-sm text-gray-500">
              {t(`services.category.${campaign.category}`)} ·{' '}
              {t('campaigns.selectedOf', {
                accepted: campaign.counts.accepted,
                slots: campaign.slots,
              })}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            {campaign.status === 'draft' && (
              <button
                type="button"
                disabled={setStatus.isPending || !canPublish}
                title={canPublish ? undefined : t('campaigns.verifyToPublish')}
                onClick={() => setStatus.mutate('open')}
                className="rounded-xl bg-gray-900 px-4 py-2 text-sm font-medium text-white hover:bg-gray-800 disabled:opacity-50"
              >
                {t('campaigns.publish')}
              </button>
            )}
            {campaign.status === 'open' && (
              <button
                type="button"
                disabled={setStatus.isPending}
                onClick={() => setConfirming('close')}
                className={actionButton}
              >
                {t('campaigns.close')}
              </button>
            )}
            {campaign.status === 'closed' && (
              <button
                type="button"
                disabled={setStatus.isPending || !canPublish || !canSelect}
                title={!canSelect ? t('campaigns.fullHint') : undefined}
                onClick={() => setStatus.mutate('open')}
                className={actionButton}
              >
                {t('campaigns.reopen')}
              </button>
            )}
            {campaign.status !== 'draft' && (
              <Link to={`/campaigns/${campaign._id}`} className={actionButton}>
                {t('campaigns.viewPublic')}
                <FontAwesomeIcon icon={faArrowUpRightFromSquare} className="text-[10px]" />
              </Link>
            )}
            <Link to={`/dashboard/campaigns/${campaign._id}/edit`} className={actionButton}>
              <FontAwesomeIcon icon={faPen} className="text-xs" />
              {t('campaigns.edit')}
            </Link>
            <button
              type="button"
              disabled={remove.isPending}
              onClick={() => setConfirming('delete')}
              aria-label={t('campaigns.delete')}
              title={t('campaigns.delete')}
              className={`${actionButton} text-red-600 hover:bg-red-50`}
            >
              <FontAwesomeIcon icon={faTrash} className="text-xs" />
            </button>
          </div>
        </div>
        <div className="mt-4">
          <CampaignFacts campaign={campaign} />
        </div>
      </section>

      <div>
        <h2 className="text-lg font-semibold">{t('campaigns.applicants')}</h2>
        <div className="mt-3 flex flex-wrap gap-2" role="tablist">
          {TABS.map((key) => (
            <button
              key={key}
              type="button"
              role="tab"
              aria-selected={tab === key}
              onClick={() => setTab(key)}
              className={`rounded-full px-3 py-1.5 text-sm font-medium transition ${
                tab === key
                  ? 'bg-gray-900 text-white'
                  : 'bg-white text-gray-700 ring-1 ring-gray-200 hover:bg-gray-50'
              }`}
            >
              {t(`campaigns.tabs.${key}`)} ({count(key)})
            </button>
          ))}
        </div>
      </div>

      {shown.length === 0 ? (
        <div className="rounded-3xl border border-dashed border-gray-300 bg-white px-6 py-12 text-center">
          <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-gray-100 text-gray-500">
            <FontAwesomeIcon icon={faInbox} />
          </span>
          <p className="mt-4 font-semibold">{t('campaigns.noApplicants')}</p>
          <p className="mx-auto mt-1 max-w-md text-sm text-gray-500">
            {campaign.status === 'draft'
              ? t('campaigns.noApplicantsDraft')
              : t('campaigns.noApplicantsText')}
          </p>
        </div>
      ) : (
        <ul className="space-y-3">
          {shown.map((application) => (
            <ApplicantCard
              key={application._id}
              application={application}
              campaignId={campaign._id}
              canSelect={canSelect}
            />
          ))}
        </ul>
      )}

      <ConfirmDialog
        open={confirming === 'close'}
        title={t('campaigns.closeTitle')}
        confirmLabel={t('campaigns.close')}
        isBusy={setStatus.isPending}
        onConfirm={() => setStatus.mutate('closed')}
        onCancel={() => setConfirming(null)}
      >
        <p>{t('campaigns.closeConfirm')}</p>
      </ConfirmDialog>
      <ConfirmDialog
        open={confirming === 'delete'}
        title={t('campaigns.deleteTitle', { title: campaign.title })}
        tone="danger"
        confirmLabel={t('campaigns.delete')}
        isBusy={remove.isPending}
        onConfirm={() => remove.mutate()}
        onCancel={() => setConfirming(null)}
      >
        <p>{t('campaigns.deleteConfirm')}</p>
      </ConfirmDialog>
    </div>
  )
}

export default CampaignApplicantsPage
