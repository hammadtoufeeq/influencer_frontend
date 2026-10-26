import { useState, type FormEvent } from 'react'
import { useTranslation } from 'react-i18next'
import { Link, useLocation, useParams } from 'react-router-dom'
import { useMutation, useQuery } from '@tanstack/react-query'
import toast from 'react-hot-toast'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import {
  faArrowLeft,
  faArrowUpRightFromSquare,
  faCircleCheck,
  faLock,
  faPaperPlane,
  faPen,
  faUsers,
} from '@fortawesome/free-solid-svg-icons'
import { applyToCampaign, withdrawApplication } from '../../api/campaigns'
import ConfirmDialog from '../../components/admin-panel/ConfirmDialog'
import { campaignQuery, myProfileQuery } from '../../api/queries'
import {
  ApplicationStatusBadge,
  CampaignBusiness,
  CampaignFacts,
  CampaignStatusBadge,
} from '../../components/campaigns/campaignUi'
import { useCampaignFormat } from '../../components/campaigns/campaignFormat'
import { categoryIcon } from '../../constants/services'
import { useAuth } from '../../hooks/useAuth'
import type { CampaignDetail } from '../../types/campaign'
import { getApiError } from '../../utils/apiError'

const MIN_PITCH = 20
const MAX_PITCH = 1000

// Talent ka apply wala hissa: login, profile, pehle se apply, ya form
function ApplyBox({ detail }: { detail: CampaignDetail }) {
  const { t } = useTranslation()
  const location = useLocation()
  const { user } = useAuth()
  const format = useCampaignFormat()
  const { campaign, myApplication } = detail
  const isTalent = user?.role === 'talent'
  const { data: profile, isLoading: loadingProfile } = useQuery({
    ...myProfileQuery,
    enabled: isTalent,
  })
  const [pitch, setPitch] = useState('')
  const [error, setError] = useState('')

  const apply = useMutation({
    mutationFn: () => applyToCampaign(campaign._id, pitch.trim()),
    onSuccess: () => {
      toast.success(t('campaigns.applySent'))
      setPitch('')
    },
    onError: (err) => {
      const { message, fields } = getApiError(err)
      setError(fields.pitch ?? message)
    },
  })
  const [confirmWithdraw, setConfirmWithdraw] = useState(false)
  const withdraw = useMutation({
    mutationFn: () => withdrawApplication(myApplication!._id),
    onSuccess: () => {
      toast.success(t('campaigns.withdrawn'))
      setConfirmWithdraw(false)
    },
    onError: (err) => toast.error(getApiError(err).message),
  })

  function submit(e: FormEvent) {
    e.preventDefault()
    if (pitch.trim().length < MIN_PITCH) {
      setError(t('campaigns.errors.pitch', { count: MIN_PITCH }))
      return
    }
    setError('')
    apply.mutate()
  }

  const box = 'rounded-2xl bg-white p-5 shadow-sm ring-1 ring-gray-200/70'
  const button =
    'inline-flex w-full items-center justify-center gap-2 rounded-xl bg-gray-900 px-4 py-2.5 text-sm font-medium text-white hover:bg-gray-800 disabled:opacity-60'

  if (detail.isOwner) {
    return (
      <div className={box}>
        <p className="font-semibold">{t('campaigns.yourCampaign')}</p>
        <p className="mt-1 text-sm text-gray-500">
          {t('campaigns.applicantsSummary', {
            count: campaign.counts.applications,
            accepted: campaign.counts.accepted,
          })}
        </p>
        <Link to={`/dashboard/campaigns/${campaign._id}`} className={`${button} mt-4`}>
          <FontAwesomeIcon icon={faUsers} className="text-xs" />
          {t('campaigns.manage')}
        </Link>
      </div>
    )
  }

  if (myApplication && myApplication.status !== 'withdrawn') {
    return (
      <div className={box}>
        <div className="flex items-center justify-between gap-2">
          <p className="font-semibold">{t('campaigns.yourApplication')}</p>
          <ApplicationStatusBadge status={myApplication.status} />
        </div>
        <p className="mt-1 text-xs text-gray-500">
          {t('campaigns.appliedOn', { date: format.date(myApplication.createdAt) })}
        </p>
        <p className="mt-3 rounded-xl bg-gray-50 p-3 text-sm whitespace-pre-line text-gray-700">
          {myApplication.pitch}
        </p>
        <p className="mt-3 text-sm text-gray-600">
          {t(`campaigns.applicationHint.${myApplication.status}`)}
        </p>
        {myApplication.status === 'accepted' && (
          <Link to="/dashboard/hire-requests" className={`${button} mt-4`}>
            {t('campaigns.openHire')}
          </Link>
        )}
        {myApplication.status === 'pending' && (
          <button
            type="button"
            disabled={withdraw.isPending}
            onClick={() => setConfirmWithdraw(true)}
            className="mt-4 w-full rounded-xl border border-gray-300 px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-60"
          >
            {t('campaigns.withdraw')}
          </button>
        )}
        <ConfirmDialog
          open={confirmWithdraw}
          title={t('campaigns.withdrawTitle')}
          tone="danger"
          confirmLabel={t('campaigns.withdraw')}
          isBusy={withdraw.isPending}
          onConfirm={() => withdraw.mutate()}
          onCancel={() => setConfirmWithdraw(false)}
        >
          <p>{t('campaigns.withdrawConfirm')}</p>
        </ConfirmDialog>
      </div>
    )
  }

  if (!campaign.acceptingApplications) {
    return (
      <div className={box}>
        <p className="flex items-center gap-2 font-semibold">
          <FontAwesomeIcon icon={faLock} className="text-gray-400" />
          {t('campaigns.closedTitle')}
        </p>
        <p className="mt-1 text-sm text-gray-500">{t('campaigns.closedText')}</p>
      </div>
    )
  }

  if (!user) {
    return (
      <div className={box}>
        <p className="font-semibold">{t('campaigns.applyTitle')}</p>
        <p className="mt-1 text-sm text-gray-500">{t('campaigns.loginToApply')}</p>
        <Link to="/login" state={{ from: location.pathname }} className={`${button} mt-4`}>
          {t('site.nav.login')}
        </Link>
        <Link
          to="/register?type=talent"
          className="mt-2 block text-center text-sm font-medium text-gray-700 underline-offset-4 hover:underline"
        >
          {t('campaigns.joinAsTalent')}
        </Link>
      </div>
    )
  }

  if (!isTalent) {
    return (
      <div className={box}>
        <p className="font-semibold">{t('campaigns.applyTitle')}</p>
        <p className="mt-1 text-sm text-gray-500">{t('campaigns.onlyTalent')}</p>
      </div>
    )
  }

  if (!loadingProfile && !profile) {
    return (
      <div className={box}>
        <p className="font-semibold">{t('campaigns.applyTitle')}</p>
        <p className="mt-1 text-sm text-gray-500">{t('campaigns.profileFirst')}</p>
        <Link to="/my-profile/new" className={`${button} mt-4`}>
          {t('campaigns.createProfile')}
        </Link>
        <Link
          to="/search"
          className="mt-2 block text-center text-sm font-medium text-gray-700 underline-offset-4 hover:underline"
        >
          {t('campaigns.claimProfile')}
        </Link>
      </div>
    )
  }

  return (
    <form onSubmit={submit} className={box} noValidate>
      <p className="font-semibold">{t('campaigns.applyTitle')}</p>
      {profile && (
        <p className="mt-1 text-sm text-gray-500">
          {t('campaigns.applyingAs')}{' '}
          <Link
            to={`/people/${profile.slug}`}
            className="font-medium text-gray-900 hover:underline"
          >
            {profile.name}
          </Link>
        </p>
      )}
      <label htmlFor="pitch" className="mt-4 mb-1 block text-sm font-medium">
        {t('campaigns.fields.pitch')}
      </label>
      <textarea
        id="pitch"
        rows={5}
        maxLength={MAX_PITCH}
        value={pitch}
        onChange={(e) => {
          setPitch(e.target.value)
          if (error) setError('')
        }}
        placeholder={t('campaigns.fields.pitchPlaceholder')}
        className={`w-full rounded-lg border px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-gray-900 ${
          error ? 'border-red-500' : 'border-gray-300'
        }`}
      />
      <div className="mt-1 flex justify-between gap-2 text-xs">
        <span className="text-red-600">{error}</span>
        <span className="text-gray-400">
          {pitch.length}/{MAX_PITCH}
        </span>
      </div>
      <button type="submit" disabled={apply.isPending} className={`${button} mt-3`}>
        <FontAwesomeIcon icon={faPaperPlane} className="text-xs" />
        {apply.isPending ? t('campaigns.applying') : t('campaigns.apply')}
      </button>
    </form>
  )
}

// /campaigns/:id -> campaign ki poori tafseel aur apply
function CampaignDetailPage() {
  const { t } = useTranslation()
  const { id = '' } = useParams()
  const format = useCampaignFormat()
  const { data, isLoading, isError } = useQuery(campaignQuery(id))

  if (isLoading) {
    return <div className="h-96 animate-pulse rounded-3xl bg-gray-200/70" />
  }
  if (isError || !data) {
    return (
      <div className="rounded-2xl bg-white px-6 py-14 text-center shadow-sm ring-1 ring-gray-200/70">
        <p className="font-semibold">{t('campaigns.notFound')}</p>
        <Link to="/campaigns" className="mt-4 inline-block text-sm font-medium underline">
          {t('campaigns.backToList')}
        </Link>
      </div>
    )
  }

  const { campaign } = data
  const business = campaign.business

  return (
    <div className="space-y-5">
      <Link
        to="/campaigns"
        className="inline-flex items-center gap-2 text-sm font-medium text-gray-600 hover:text-gray-900"
      >
        <FontAwesomeIcon icon={faArrowLeft} className="text-xs rtl:rotate-180" />
        {t('campaigns.backToList')}
      </Link>

      <div className="grid gap-5 lg:grid-cols-[1fr_340px]">
        <article className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-gray-200/70 md:p-8">
          <div className="flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-gray-100 px-2.5 py-1 text-xs font-medium text-gray-700">
              <FontAwesomeIcon icon={categoryIcon(campaign.category)} className="text-[10px]" />
              {t(`services.category.${campaign.category}`)}
            </span>
            {!campaign.acceptingApplications && (
              <CampaignStatusBadge status={campaign.status} expired />
            )}
          </div>
          <h1 className="mt-3 text-2xl font-bold tracking-tight md:text-3xl">{campaign.title}</h1>
          {campaign.publishedAt && (
            <p className="mt-1 text-sm text-gray-500">
              {t('campaigns.posted', { date: format.date(campaign.publishedAt) })}
            </p>
          )}
          <div className="mt-5 rounded-xl bg-gray-50 p-4">
            <CampaignFacts campaign={campaign} />
          </div>
          <h2 className="mt-6 text-sm font-semibold tracking-wide text-gray-500 uppercase">
            {t('campaigns.fields.brief')}
          </h2>
          <p className="mt-2 leading-relaxed whitespace-pre-line text-gray-800">{campaign.brief}</p>
          {data.isOwner && (
            <Link
              to={`/dashboard/campaigns/${campaign._id}/edit`}
              className="mt-6 inline-flex items-center gap-2 text-sm font-medium text-gray-700 hover:text-gray-900"
            >
              <FontAwesomeIcon icon={faPen} className="text-xs" />
              {t('campaigns.edit')}
            </Link>
          )}
        </article>

        <aside className="space-y-4">
          <ApplyBox detail={data} />
          {business && (
            <div className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-gray-200/70">
              <p className="mb-3 text-xs font-semibold tracking-wide text-gray-500 uppercase">
                {t('campaigns.postedBy')}
              </p>
              <CampaignBusiness campaign={campaign} />
              {business.verified && (
                <p className="mt-3 flex items-center gap-2 text-xs text-blue-700">
                  <FontAwesomeIcon icon={faCircleCheck} />
                  {t('campaigns.verifiedBusiness')}
                </p>
              )}
              {business.websiteUrl && (
                <a
                  href={business.websiteUrl}
                  target="_blank"
                  rel="noopener noreferrer nofollow"
                  className="mt-3 inline-flex items-center gap-1.5 text-sm font-medium text-gray-700 hover:underline"
                >
                  {t('campaigns.website')}
                  <FontAwesomeIcon icon={faArrowUpRightFromSquare} className="text-[10px]" />
                </a>
              )}
            </div>
          )}
        </aside>
      </div>
    </div>
  )
}

export default CampaignDetailPage
