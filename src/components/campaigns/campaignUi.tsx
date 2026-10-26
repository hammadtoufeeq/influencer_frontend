import type { ReactNode } from 'react'
import { useTranslation } from 'react-i18next'
import { Link } from 'react-router-dom'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import type { IconDefinition } from '@fortawesome/fontawesome-svg-core'
import {
  faCalendarDays,
  faCircleCheck,
  faEarthAsia,
  faLocationDot,
  faMoneyBillWave,
  faUsers,
} from '@fortawesome/free-solid-svg-icons'
import { categoryIcon } from '../../constants/services'
import type { ApplicationStatus, Campaign, CampaignStatus } from '../../types/campaign'
import { countryName, initials } from '../../utils/format'
import { useCampaignFormat } from './campaignFormat'

const STATUS_TONE: Record<CampaignStatus, string> = {
  draft: 'bg-gray-100 text-gray-700',
  open: 'bg-green-50 text-green-700',
  closed: 'bg-gray-900 text-white',
}

// expired: "Open" hai magar "Apply by" guzar gayi -> "Deadline passed" (public page pe nahi dikhti)
export function CampaignStatusBadge({
  status,
  expired = false,
}: {
  status: CampaignStatus
  expired?: boolean
}) {
  const { t } = useTranslation()
  if (status === 'open' && expired) {
    return (
      <span
        title={t('campaigns.deadlinePassedHint')}
        className="rounded-full bg-amber-50 px-2.5 py-0.5 text-xs font-medium whitespace-nowrap text-amber-800 ring-1 ring-amber-200"
      >
        {t('campaigns.deadlinePassed')}
      </span>
    )
  }
  return (
    <span
      className={`rounded-full px-2.5 py-0.5 text-xs font-medium whitespace-nowrap ${STATUS_TONE[status]}`}
    >
      {t(`campaigns.status.${status}`)}
    </span>
  )
}

const APPLICATION_TONE: Record<ApplicationStatus, string> = {
  pending: 'bg-amber-50 text-amber-800',
  accepted: 'bg-green-50 text-green-700',
  rejected: 'bg-gray-100 text-gray-600',
  withdrawn: 'bg-gray-100 text-gray-500',
}

export function ApplicationStatusBadge({ status }: { status: ApplicationStatus }) {
  const { t } = useTranslation()
  return (
    <span
      className={`rounded-full px-2.5 py-0.5 text-xs font-medium whitespace-nowrap ${APPLICATION_TONE[status]}`}
    >
      {t(`campaigns.applicationStatus.${status}`)}
    </span>
  )
}

function Fact({ icon, children }: { icon: IconDefinition; children: ReactNode }) {
  return (
    <span className="inline-flex items-center gap-1.5">
      <FontAwesomeIcon icon={icon} className="text-gray-400" />
      {children}
    </span>
  )
}

// Budget, mulk, aakhri tareekh, kitne talent: card aur detail dono pe
export function CampaignFacts({ campaign }: { campaign: Campaign }) {
  const { t } = useTranslation()
  const format = useCampaignFormat()
  const budget = format.budget(campaign)
  return (
    <div className="flex flex-wrap gap-x-4 gap-y-1.5 text-sm text-gray-600">
      <Fact icon={faMoneyBillWave}>{budget ?? t('campaigns.budgetOpen')}</Fact>
      <Fact icon={campaign.country ? faLocationDot : faEarthAsia}>
        {campaign.country ? countryName(campaign.country) : t('campaigns.anyCountry')}
      </Fact>
      <Fact icon={faCalendarDays}>
        {campaign.deadline
          ? t('campaigns.applyBy', { date: format.date(campaign.deadline) })
          : t('campaigns.noDeadline')}
      </Fact>
      <Fact icon={faUsers}>{t('campaigns.slots', { count: campaign.slots })}</Fact>
    </div>
  )
}

// Kis business ki campaign: naam, qism, verified
export function CampaignBusiness({ campaign }: { campaign: Campaign }) {
  const { t } = useTranslation()
  const business = campaign.business
  if (!business) return null
  return (
    <div className="flex min-w-0 items-center gap-3">
      {business.logoUrl ? (
        <img
          src={business.logoUrl}
          alt=""
          loading="lazy"
          className="h-10 w-10 shrink-0 rounded-xl bg-gray-100 object-cover ring-1 ring-gray-200"
        />
      ) : (
        <span
          aria-hidden="true"
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gray-900 text-sm font-semibold text-white"
        >
          {initials(business.name)}
        </span>
      )}
      <div className="min-w-0">
        <p className="flex items-center gap-1.5 truncate text-sm font-semibold text-gray-900">
          <span className="truncate">{business.name}</span>
          {business.verified && (
            <FontAwesomeIcon
              icon={faCircleCheck}
              className="shrink-0 text-blue-600"
              title={t('site.verified')}
            />
          )}
        </p>
        {business.organizationType && (
          <p className="truncate text-xs text-gray-500">
            {t(`orgType.${business.organizationType}`)}
          </p>
        )}
      </div>
    </div>
  )
}

// Public list ka card
export function CampaignCard({ campaign }: { campaign: Campaign }) {
  const { t } = useTranslation()
  return (
    <Link
      to={`/campaigns/${campaign._id}`}
      className="group flex flex-col rounded-2xl border border-gray-200 bg-white p-5 transition hover:border-gray-300 hover:shadow-md"
    >
      <div className="flex items-start justify-between gap-3">
        <CampaignBusiness campaign={campaign} />
        <span className="inline-flex shrink-0 items-center gap-1.5 rounded-full bg-gray-100 px-2.5 py-1 text-xs font-medium text-gray-700">
          <FontAwesomeIcon icon={categoryIcon(campaign.category)} className="text-[10px]" />
          {t(`services.category.${campaign.category}`)}
        </span>
      </div>
      <h3 className="mt-4 text-lg leading-snug font-semibold text-gray-900 group-hover:underline">
        {campaign.title}
      </h3>
      <p className="mt-1 line-clamp-3 text-sm text-gray-600">{campaign.brief}</p>
      <div className="mt-auto pt-4">
        <CampaignFacts campaign={campaign} />
        <p className="mt-3 text-xs text-gray-500">
          {t('campaigns.applied', { count: campaign.counts.applications })}
        </p>
      </div>
    </Link>
  )
}
