import { useState, type FormEvent } from 'react'
import { useTranslation } from 'react-i18next'
import { Link, useLocation, useParams } from 'react-router-dom'
import { useMutation, useQuery } from '@tanstack/react-query'
import toast from 'react-hot-toast'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import {
  faArrowLeft,
  faArrowRight,
  faBullhorn,
  faCalendarDays,
  faCircleCheck,
  faEarthAsia,
  faHourglassHalf,
  faLocationDot,
  faLock,
  faMoneyBillWave,
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
  CampaignStatusBadge,
} from '../../components/campaigns/campaignUi'
import { useCampaignFormat } from '../../components/campaigns/campaignFormat'
import ProfileHero, { HeroChip } from '../../components/profile/ProfileHero'
import { DETAIL_CARD, rise } from '../../components/profile/profileStyles'
import { categoryIcon } from '../../constants/services'
import { countryName } from '../../utils/format'
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

  const box = 'rounded-3xl bg-white p-6 shadow-sm ring-1 ring-gray-200/70'
  const button =
    'inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-xl bg-gray-900 px-4 py-2.5 text-sm font-semibold text-white shadow-[0_10px_24px_rgb(23_23_23_/_16%)] transition hover:-translate-y-0.5 hover:bg-gray-800 disabled:opacity-60'

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
        className={`w-full rounded-xl border bg-gray-50 px-4 py-3 text-sm outline-none transition focus:border-gray-900 focus:bg-white focus:ring-4 focus:ring-gray-900/10 ${
          error ? 'border-red-500' : 'border-gray-200'
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

// Aakhri tareekh tak kitne din (null = koi tareekh nahi)
function daysLeft(deadline?: string) {
  if (!deadline) return null
  const end = new Date(deadline)
  end.setHours(23, 59, 59, 999)
  return Math.ceil((end.getTime() - Date.now()) / 86400000)
}

// /campaigns/:id -> campaign ki poori tafseel aur apply (talent page jaisa design)
function CampaignDetailPage() {
  const { t } = useTranslation()
  const { id = '' } = useParams()
  const format = useCampaignFormat()
  const { data, isLoading, isError } = useQuery(campaignQuery(id))

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="h-80 animate-pulse rounded-3xl bg-gray-200/70" />
        <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
          <div className="h-64 animate-pulse rounded-3xl bg-gray-200/70" />
          <div className="h-64 animate-pulse rounded-3xl bg-gray-200/70" />
        </div>
      </div>
    )
  }
  if (isError || !data) {
    return (
      <div className="rounded-3xl bg-white px-6 py-14 text-center shadow-sm ring-1 ring-gray-200/70">
        <p className="font-semibold">{t('campaigns.notFound')}</p>
        <Link to="/campaigns" className="mt-4 inline-block text-sm font-medium underline">
          {t('campaigns.backToList')}
        </Link>
      </div>
    )
  }

  const { campaign } = data
  const business = campaign.business
  const days = daysLeft(campaign.deadline)
  const { applications, accepted } = campaign.counts
  const filled = campaign.slots > 0 ? Math.min(100, Math.round((accepted / campaign.slots) * 100)) : 0

  return (
    <div className="space-y-6">
      <Link
        to="/campaigns"
        className="inline-flex items-center gap-2 text-sm font-medium text-gray-600 hover:text-gray-900"
      >
        <FontAwesomeIcon icon={faArrowLeft} className="text-xs rtl:rotate-180" />
        {t('campaigns.backToList')}
      </Link>

      <ProfileHero
        name={campaign.title}
        photo={business?.logoUrl}
        shape="square"
        fallbackIcon={categoryIcon(campaign.category)}
        caption={business?.name}
        verified={business?.verified}
        coverTag={
          campaign.acceptingApplications ? (
            <span className="inline-flex items-center gap-2 rounded-full bg-white/90 px-3 py-1.5 text-xs font-semibold text-gray-900 shadow backdrop-blur">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-green-400 opacity-75" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-green-500" />
              </span>
              {t('campaigns.status.open')}
            </span>
          ) : undefined
        }
        badges={
          <>
            <span className="inline-flex items-center gap-1.5 rounded-full bg-gray-100 px-2.5 py-1 text-xs font-medium text-gray-700">
              <FontAwesomeIcon icon={categoryIcon(campaign.category)} className="text-[10px]" />
              {t(`services.category.${campaign.category}`)}
            </span>
            {!campaign.acceptingApplications && (
              <CampaignStatusBadge status={campaign.status} expired />
            )}
          </>
        }
        subtitle={
          business && (
            <Link
              to={`/businesses/${business._id}`}
              className="inline-flex items-center gap-1.5 font-medium text-gray-700 hover:text-gray-950 hover:underline"
            >
              {business.name}
              {business.verified && (
                <FontAwesomeIcon icon={faCircleCheck} className="text-sm text-blue-600" />
              )}
            </Link>
          )
        }
        chips={
          <>
            <HeroChip>
              <FontAwesomeIcon
                icon={campaign.country ? faLocationDot : faEarthAsia}
                className="text-gray-400"
              />
              {campaign.country ? countryName(campaign.country) : t('campaigns.anyCountry')}
            </HeroChip>
            <HeroChip>
              <FontAwesomeIcon icon={faCalendarDays} className="text-gray-400" />
              {campaign.deadline
                ? t('campaigns.applyBy', { date: format.date(campaign.deadline) })
                : t('campaigns.noDeadline')}
            </HeroChip>
            {campaign.publishedAt && (
              <HeroChip>
                <FontAwesomeIcon icon={faBullhorn} className="text-gray-400" />
                {t('campaigns.posted', { date: format.date(campaign.publishedAt) })}
              </HeroChip>
            )}
          </>
        }
        actions={
          data.isOwner && (
            <Link
              to={`/dashboard/campaigns/${campaign._id}/edit`}
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-gray-200 px-4 py-2.5 text-sm font-medium text-gray-800 transition hover:border-gray-900 hover:bg-gray-900 hover:text-white"
            >
              <FontAwesomeIcon icon={faPen} className="text-xs" />
              {t('campaigns.edit')}
            </Link>
          )
        }
        stats={[
          {
            icon: faMoneyBillWave,
            value: format.budget(campaign) ?? t('campaigns.budgetOpen'),
            label: t('campaigns.fields.budget'),
          },
          {
            icon: faUsers,
            value: `${accepted}/${campaign.slots}`,
            label: t('campaigns.selectedLabel'),
          },
          {
            icon: faPaperPlane,
            value: applications,
            label: t('campaigns.appliedLabel'),
          },
          {
            icon: faHourglassHalf,
            value:
              days === null
                ? '—'
                : days < 0
                  ? t('campaigns.deadlinePassed')
                  : days === 0
                    ? t('campaigns.lastDay')
                    : days === 1
                      ? t('campaigns.oneDayLeft')
                      : t('campaigns.daysLeft', { days }),
            label: t('campaigns.fields.deadline'),
          },
        ]}
      />

      <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
        <article className={`${DETAIL_CARD} min-w-0 md:p-8`} style={rise(2)}>
          <h2 className="font-display text-xl font-bold">{t('campaigns.fields.brief')}</h2>
          <p className="mt-3 leading-relaxed whitespace-pre-line text-gray-800">{campaign.brief}</p>

          {/* Kitne talent chune ja chuke: bharti hui patti */}
          <div className="mt-8 rounded-2xl bg-gray-50 p-5">
            <div className="flex items-center justify-between gap-3 text-sm">
              <span className="font-semibold text-gray-900">
                {t('campaigns.selectedOf', { accepted, slots: campaign.slots })}
              </span>
              <span className="text-gray-500">{t('campaigns.applied', { count: applications })}</span>
            </div>
            <div className="mt-3 h-2 overflow-hidden rounded-full bg-gray-200">
              <div
                className="h-full origin-left rounded-full bg-gray-900 motion-safe:animate-[grow_1.1s_ease-out_both] rtl:origin-right"
                style={{ width: `${Math.max(filled, accepted > 0 ? 6 : 0)}%` }}
              />
            </div>
          </div>
        </article>

        <aside className="min-w-0 space-y-6 lg:sticky lg:top-24 lg:self-start">
          <div className="motion-safe:animate-fade-up" style={rise(2)}>
            <ApplyBox detail={data} />
          </div>
          {business && (
            <Link
              to={`/businesses/${business._id}`}
              className={`${DETAIL_CARD} group block transition duration-300 hover:-translate-y-0.5 hover:shadow-md`}
              style={rise(3)}
            >
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
              <span className="mt-4 flex items-center justify-between border-t border-gray-100 pt-4 text-sm font-semibold text-gray-900">
                {t('directory.viewBusiness')}
                <span className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-100 text-xs transition duration-300 group-hover:translate-x-1 group-hover:bg-gray-900 group-hover:text-white rtl:group-hover:-translate-x-1">
                  <FontAwesomeIcon icon={faArrowRight} className="rtl:rotate-180" />
                </span>
              </span>
            </Link>
          )}
        </aside>
      </div>
    </div>
  )
}

export default CampaignDetailPage
