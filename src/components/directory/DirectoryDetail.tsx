import type { ReactNode } from 'react'
import { useTranslation } from 'react-i18next'
import { Link } from 'react-router-dom'
import type { IconDefinition } from '@fortawesome/fontawesome-svg-core'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import {
  faArrowLeft,
  faArrowUpRightFromSquare,
  faCalendar,
  faCircleCheck,
  faHourglassHalf,
  faLocationDot,
} from '@fortawesome/free-solid-svg-icons'
import RatingBadge from '../agreements/RatingBadge'
import ProfileHero, { HeroChip, type HeroStat } from '../profile/ProfileHero'
import type { DirectoryBusiness, DirectoryManager } from '../../types/directory'
import { countryName } from '../../utils/format'
import { hostOf, imageOf } from './directoryUtils'

// Business / manager ke page ka upar wala hissa (talent page jaisa): cover, logo / photo,
// naam, tasdeeq, jagah, website aur neeche stats
export function DirectoryHeader({
  entry,
  icon,
  subtitle,
  facts,
  actions,
  stats,
  shape = 'round',
}: {
  entry: DirectoryBusiness | DirectoryManager
  icon: IconDefinition
  subtitle?: string
  facts?: ReactNode
  actions?: ReactNode
  stats?: HeroStat[]
  shape?: 'round' | 'square'
}) {
  const { t, i18n } = useTranslation()
  const location = [entry.city, countryName(entry.country)].filter(Boolean).join(', ')
  const joined = new Date(entry.joinedAt).toLocaleDateString(i18n.language, {
    month: 'short',
    year: 'numeric',
  })
  const badge = entry.verified
    ? { tone: 'bg-blue-50 text-blue-700', icon: faCircleCheck, label: t('site.verified') }
    : entry.inReview
      ? {
          tone: 'bg-amber-50 text-amber-800',
          icon: faHourglassHalf,
          label: t('directory.inReview'),
        }
      : {
          tone: 'bg-gray-100 text-gray-600',
          icon: faHourglassHalf,
          label: t('directory.notVerified'),
        }

  return (
    <ProfileHero
      name={entry.name}
      photo={imageOf(entry)}
      shape={shape}
      verified={entry.verified}
      caption={subtitle}
      badges={
        <span
          className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium ${badge.tone}`}
        >
          <FontAwesomeIcon icon={badge.icon} className="text-[10px]" />
          {badge.label}
        </span>
      }
      subtitle={
        subtitle && (
          <span className="flex items-center gap-2">
            <FontAwesomeIcon icon={icon} className="text-sm text-gray-400" />
            {subtitle}
          </span>
        )
      }
      chips={
        <>
          {entry.rating && (
            <a href="#reviews" className="inline-flex items-center rounded-full border border-gray-200 px-3 py-1 hover:border-gray-900">
              <RatingBadge rating={entry.rating} />
            </a>
          )}
          {location && (
            <HeroChip>
              <FontAwesomeIcon icon={faLocationDot} className="text-gray-400" />
              {location}
            </HeroChip>
          )}
          <HeroChip>
            <FontAwesomeIcon icon={faCalendar} className="text-gray-400" />
            {t('directory.joined', { date: joined })}
          </HeroChip>
          {facts}
          {entry.websiteUrl && (
            <a
              href={entry.websiteUrl}
              target="_blank"
              rel="noopener noreferrer nofollow"
              className="inline-flex items-center gap-1.5 rounded-full border border-gray-200 px-3 py-1 font-medium text-gray-800 transition hover:border-gray-900 hover:bg-gray-900 hover:text-white"
            >
              {hostOf(entry.websiteUrl)}
              <FontAwesomeIcon icon={faArrowUpRightFromSquare} className="text-[10px]" />
            </a>
          )}
        </>
      }
      actions={actions}
      stats={stats}
    />
  )
}

export function BackLink({ to, label }: { to: string; label: string }) {
  return (
    <Link
      to={to}
      className="inline-flex items-center gap-2 text-sm font-medium text-gray-600 hover:text-gray-900"
    >
      <FontAwesomeIcon icon={faArrowLeft} className="text-xs rtl:rotate-180" />
      {label}
    </Link>
  )
}

export function DetailState({ loading, backTo }: { loading: boolean; backTo: string }) {
  const { t } = useTranslation()
  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-80 animate-pulse rounded-3xl bg-gray-200/70" />
        <div className="grid gap-6 md:grid-cols-[1fr_340px]">
          <div className="h-64 animate-pulse rounded-3xl bg-gray-200/70" />
          <div className="h-64 animate-pulse rounded-3xl bg-gray-200/70" />
        </div>
      </div>
    )
  }
  return (
    <div className="rounded-2xl bg-white px-6 py-14 text-center shadow-sm ring-1 ring-gray-200/70">
      <p className="font-semibold">{t('directory.notFound')}</p>
      <Link to={backTo} className="mt-4 inline-block text-sm font-medium underline">
        {t('directory.backToList')}
      </Link>
    </div>
  )
}
