import { useState, type CSSProperties, type ReactNode } from 'react'
import { useTranslation } from 'react-i18next'
import { taxName } from '../utils/taxonomy'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import {
  faArrowUpRightFromSquare,
  faExpand,
  faGlobe,
  faLanguage,
  faLocationDot,
  faStar,
  faUserTie,
  faUsers,
  faLayerGroup,
} from '@fortawesome/free-solid-svg-icons'
import { Link, useParams } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import axios from 'axios'
import { personQuery } from '../api/queries'
import ClaimAction from '../components/ClaimAction'
import HireAction from '../components/business/HireAction'
import SaveToShortlist from '../components/shortlists/SaveToShortlist'
import RepresentAction from '../components/manager/RepresentAction'
import ReportProfileLink from '../components/ReportProfileLink'
import UnclaimedBadge from '../components/UnclaimedBadge'
import PublicAvailability from '../components/services/PublicAvailability'
import PublicServices from '../components/services/PublicServices'
import PublicReviews from '../components/agreements/PublicReviews'
import RatingBadge from '../components/agreements/RatingBadge'
import VerifiedBadge from '../components/VerifiedBadge'
import PhotoLightbox from '../components/profile/PhotoLightbox'
import { PLATFORM_ICONS, PLATFORM_LABELS, STATUS_LABELS } from '../constants/people'
import type { SocialPlatform, TaxonomyItem } from '../types/person'
import { countryName, formatCount, initials, languageName } from '../utils/format'

// Har platform ka apna rang (icon ki tile ke liye)
const PLATFORM_TONES: Partial<Record<SocialPlatform, string>> = {
  instagram: 'bg-gradient-to-br from-amber-400 via-pink-500 to-purple-600 text-white',
  youtube: 'bg-red-600 text-white',
  tiktok: 'bg-gray-950 text-white',
  x: 'bg-gray-950 text-white',
  facebook: 'bg-blue-600 text-white',
  linkedin: 'bg-sky-700 text-white',
  snapchat: 'bg-yellow-300 text-gray-900',
  twitch: 'bg-violet-600 text-white',
}

// Sections ek ek kar ke neeche se aate hain
const rise = (i: number): CSSProperties => ({ animationDelay: `${120 + i * 90}ms` })
const card = 'rounded-3xl bg-white p-6 shadow-sm ring-1 ring-gray-200/70 motion-safe:animate-fade-up'

function TagList({ title, items, param }: { title: string; items: TaxonomyItem[]; param: string }) {
  if (items.length === 0) return null
  return (
    <div>
      <h3 className="text-xs font-semibold tracking-wider text-gray-500 uppercase">{title}</h3>
      <div className="mt-2.5 flex flex-wrap gap-2">
        {items.map((item) => (
          <Link
            key={item._id}
            to={`/search?${param}=${item.slug}`}
            className="rounded-full border border-gray-200 bg-gray-50 px-3.5 py-1.5 text-sm text-gray-700 transition hover:-translate-y-0.5 hover:border-gray-900 hover:bg-gray-900 hover:text-white"
          >
            {taxName(item)}
          </Link>
        ))}
      </div>
    </div>
  )
}

// Stats ki patti ka ek khana
function Stat({ icon, value, label }: { icon: typeof faUsers; value: ReactNode; label: string }) {
  return (
    <div className="flex min-w-0 items-center gap-3 px-3 py-4 sm:px-6">
      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gray-100 text-gray-700">
        <FontAwesomeIcon icon={icon} />
      </span>
      <div className="min-w-0">
        <p className="font-display text-base leading-tight font-bold break-words text-gray-900 sm:text-xl">{value}</p>
        <p className="mt-0.5 text-xs leading-tight text-gray-500">{label}</p>
      </div>
    </div>
  )
}

function ProfileSkeleton() {
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

function Profile() {
  const { t, i18n } = useTranslation()
  const { slug = '' } = useParams()
  const [viewing, setViewing] = useState(false)
  const [photoFailed, setPhotoFailed] = useState(false)

  const { data: person, isLoading, error } = useQuery({ ...personQuery(slug), retry: false })

  if (isLoading) return <ProfileSkeleton />

  // Peeche ka refresh fail ho to purani profile dikhti rahe (jhapakti nahi)
  if (!person) {
    const notFound = axios.isAxiosError(error) && error.response?.status === 404
    return (
      <section className="text-center">
        <h1 className="text-2xl font-bold">
          {notFound ? t('profile.notFound') : t('profile.loadError')}
        </h1>
        <Link to="/search" className="mt-4 inline-block underline">
          {t('profile.backToSearch')}
        </Link>
      </section>
    )
  }

  const location = [person.city, countryName(person.country)].filter(Boolean).join(', ')
  const wikipedia = person.sourceRecords.find((record) => record.sourceType === 'wikipedia')?.url
  // Photo ka credit sirf jab wohi photo laga ho jis ka credit hai
  const credit = person.photoUrl ? person.photoCredit : undefined
  const photo = person.photoUrl && !photoFailed ? person.photoUrl : undefined
  const isOpen = person.status === 'hireable' || person.availability?.isOpen
  // Har platform ka hissa (bar ke liye)
  const biggest = Math.max(1, ...person.socialAccounts.map((a) => a.followers ?? 0))

  return (
    <div className="space-y-6">
      {person.isDemo && (
        <p className="rounded-xl bg-amber-50 px-4 py-3 text-sm text-amber-800">
          {t('profile.demo')}
        </p>
      )}

      {/* Identity: cover + gol photo + naam + buttons */}
      <section className="overflow-hidden rounded-3xl bg-white shadow-sm ring-1 ring-gray-200/70 motion-safe:animate-fade-up">
        {/* Cover: usi photo ka dhundla roop, chalti roshni */}
        <div className="keep-dark relative isolate h-36 overflow-hidden bg-brand-plum sm:h-52">
          {photo && (
            <img
              src={photo}
              alt=""
              aria-hidden="true"
              className="absolute inset-0 -z-10 h-full w-full scale-125 object-cover opacity-60 blur-2xl motion-safe:animate-hero-zoom"
            />
          )}
          <div className="absolute -start-16 -top-20 -z-10 h-64 w-64 rounded-full bg-white/15 blur-3xl motion-safe:animate-drift" />
          <div
            className="absolute -end-10 -bottom-24 -z-10 h-72 w-72 rounded-full bg-gray-400/25 blur-3xl motion-safe:animate-drift"
            style={{ animationDelay: '-6s' }}
          />
          <div className="absolute inset-0 -z-10 bg-gradient-to-t from-black/60 via-black/10 to-transparent" />
          {isOpen && (
            <span className="absolute end-4 top-4 inline-flex items-center gap-2 rounded-full bg-white/90 px-3 py-1.5 text-xs font-semibold text-gray-900 shadow backdrop-blur">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-green-400 opacity-75" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-green-500" />
              </span>
              {t('services.availableForHire')}
            </span>
          )}
        </div>

        <div className="relative px-5 pb-6 sm:px-8 sm:pb-8">
          <div className="flex flex-col gap-5 md:flex-row md:items-start md:justify-between">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:gap-6">
              {/* Gol photo, Instagram story jaisa ghoomta ring; click pe poori photo */}
              <button
                type="button"
                disabled={!photo}
                onClick={() => setViewing(true)}
                aria-label={photo ? t('profile.viewPhoto', { name: person.name }) : person.name}
                className="group relative -mt-16 w-fit shrink-0 rounded-full disabled:cursor-default sm:-mt-20"
              >
                <span
                  aria-hidden="true"
                  className="absolute -inset-1 rounded-full bg-[conic-gradient(from_0deg,#111827,#9ca3af,#f9fafb,#6b7280,#111827)] motion-safe:animate-spin-slow"
                />
                <span className="relative block h-32 w-32 overflow-hidden rounded-full bg-gray-200 ring-4 ring-white sm:h-40 sm:w-40">
                  {photo ? (
                    <img
                      src={photo}
                      alt={person.name}
                      onError={() => setPhotoFailed(true)}
                      className="h-full w-full object-cover object-[center_20%] transition duration-500 group-enabled:group-hover:scale-110"
                    />
                  ) : (
                    <span className="keep-dark flex h-full w-full items-center justify-center bg-gradient-to-br from-gray-600 to-gray-900 font-display text-4xl font-bold text-white">
                      {initials(person.name)}
                    </span>
                  )}
                  {photo && (
                    <span className="absolute inset-0 flex items-center justify-center bg-black/0 text-white opacity-0 transition duration-300 group-hover:bg-black/35 group-hover:opacity-100">
                      <FontAwesomeIcon icon={faExpand} className="text-xl" />
                    </span>
                  )}
                </span>
              </button>

              <div className="min-w-0 motion-safe:animate-fade-up sm:pt-5" style={rise(0)}>
                <div className="flex flex-wrap items-center gap-2">
                  <h1 className="font-display text-3xl font-extrabold tracking-tight text-gray-950 md:text-4xl">
                    {person.name}
                  </h1>
                  {person.verified && <VerifiedBadge />}
                  {!person.claimedBy && <UnclaimedBadge />}
                </div>
                {person.headline && (
                  <p className="mt-1 text-base text-gray-600 md:text-lg">{person.headline}</p>
                )}
                {person.representedBy && (
                  <p className="mt-2 inline-flex items-center gap-1.5 rounded-full bg-gray-100 px-3 py-1 text-xs text-gray-700">
                    <FontAwesomeIcon icon={faUserTie} className="text-gray-500" />
                    {person.representedBy.agencyName
                      ? t('manager.representedByAgency', person.representedBy)
                      : t('manager.representedBy', { name: person.representedBy.name })}
                  </p>
                )}
                <div className="mt-3 flex flex-wrap gap-2 text-sm text-gray-600">
                  {location && (
                    <span className="inline-flex items-center gap-1.5 rounded-full border border-gray-200 px-3 py-1">
                      <FontAwesomeIcon icon={faLocationDot} className="text-gray-400" />
                      {location}
                    </span>
                  )}
                  {person.languages.length > 0 && (
                    <span className="inline-flex items-center gap-1.5 rounded-full border border-gray-200 px-3 py-1">
                      <FontAwesomeIcon icon={faLanguage} className="text-gray-400" />
                      {person.languages.map(languageName).join(', ')}
                    </span>
                  )}
                  <span className="inline-flex items-center gap-1.5 rounded-full border border-gray-200 px-3 py-1">
                    <span
                      className={`h-2 w-2 rounded-full ${person.status === 'hireable' ? 'bg-green-500' : 'bg-gray-400'}`}
                    />
                    {STATUS_LABELS[person.status]}
                  </span>
                </div>
              </div>
            </div>

            {/* Verified business ke liye Hire, baqi sab ke liye Contact */}
            <div
              className="flex flex-col gap-2 motion-safe:animate-fade-up sm:flex-row sm:flex-wrap md:mt-5 md:w-52 md:flex-col"
              style={rise(1)}
            >
              <HireAction person={person} />
              <SaveToShortlist personId={person._id} personName={person.name} variant="button" />
              <RepresentAction person={person} />
              <ClaimAction person={person} />
            </div>
          </div>
        </div>

        {/* Stats ki patti */}
        <div className="grid grid-cols-2 divide-gray-100 border-t border-gray-100 md:grid-cols-4 md:divide-x rtl:md:divide-x-reverse">
          <Stat
            icon={faUsers}
            value={person.totalFollowers > 0 ? formatCount(person.totalFollowers) : '—'}
            label={t('profile.totalFollowers')}
          />
          <Stat
            icon={faLayerGroup}
            value={person.socialAccounts.length}
            label={t('profile.platforms')}
          />
          <a href="#reviews" className="transition hover:bg-gray-50">
            <Stat
              icon={faStar}
              value={person.rating?.count ? person.rating.average.toFixed(1) : '—'}
              label={
                person.rating?.count
                  ? t('profile.reviewsCount', { count: person.rating.count })
                  : t('agreements.noRatings')
              }
            />
          </a>
          <Stat
            icon={faUserTie}
            value={STATUS_LABELS[person.status]}
            label={t('profile.statusLabel')}
          />
        </div>
      </section>

      <div className="grid gap-6 md:grid-cols-[1fr_340px]">
        <div className="min-w-0 space-y-6">
          {person.bio && (
            <section className={card} style={rise(2)}>
              <h2 className="font-display text-xl font-bold">{t('profile.about')}</h2>
              <p className="mt-3 whitespace-pre-line leading-relaxed text-gray-700">{person.bio}</p>
              {person.rating && (
                <a href="#reviews" className="mt-4 inline-flex rounded-md hover:opacity-80">
                  <RatingBadge rating={person.rating} size="md" />
                </a>
              )}
            </section>
          )}

          <div className="motion-safe:animate-fade-up" style={rise(3)}>
            <PublicServices services={person.services ?? []} />
          </div>

          <div className="motion-safe:animate-fade-up" style={rise(4)}>
            <PublicReviews slug={person.slug} />
          </div>

          {person.professions.length + person.industries.length + person.topics.length > 0 && (
            <section className={`${card} space-y-5`} style={rise(5)}>
              <TagList title={t('profile.professions')} items={person.professions} param="profession" />
              <TagList title={t('profile.industries')} items={person.industries} param="industry" />
              <TagList title={t('profile.topics')} items={person.topics} param="topic" />
            </section>
          )}
        </div>

        {/* Influence: har number alag, koi "mystery score" nahi */}
        <aside className="min-w-0 space-y-6">
          <div className="motion-safe:animate-fade-up" style={rise(2)}>
            <PublicAvailability availability={person.availability} />
          </div>

          <section className={card} style={rise(3)}>
            <h2 className="font-display text-xl font-bold">{t('profile.influence')}</h2>
            {person.totalFollowers > 0 || person.socialAccounts.length > 0 ? (
              <div className="keep-dark mt-4 rounded-2xl bg-gradient-to-br from-gray-800 to-gray-950 p-4 text-white">
                <p className="font-display text-4xl font-extrabold">
                  {formatCount(person.totalFollowers)}
                </p>
                <p className="text-sm text-white/70">{t('profile.totalFollowers')}</p>
              </div>
            ) : (
              // Koi number ghar ke nahi likhte: claim / verify ke baad aate hain
              <p className="mt-3 text-sm text-gray-500">
                {person.claimedBy ? t('profile.noMetricsClaimed') : t('profile.noMetrics')}
              </p>
            )}

            {person.socialAccounts.length > 0 && (
              <ul className="mt-5 space-y-3">
                {person.socialAccounts.map((account) => {
                  const share = Math.round(((account.followers ?? 0) / biggest) * 100)
                  return (
                    <li key={`${account.platform}-${account.url}`}>
                      <a
                        href={account.url}
                        target="_blank"
                        rel="noopener noreferrer nofollow"
                        className="group flex items-center gap-3 rounded-2xl p-2 transition hover:bg-gray-50"
                      >
                        <span
                          className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-base shadow-sm transition group-hover:scale-110 ${
                            PLATFORM_TONES[account.platform] ?? 'bg-gray-100 text-gray-700'
                          }`}
                        >
                          <FontAwesomeIcon icon={PLATFORM_ICONS[account.platform]} />
                        </span>
                        <span className="min-w-0 flex-1">
                          <span className="flex items-center justify-between gap-2 text-sm">
                            <span className="truncate font-medium text-gray-900">
                              {PLATFORM_LABELS[account.platform]}
                            </span>
                            <span className="shrink-0 font-semibold text-gray-900">
                              {account.followers !== undefined ? formatCount(account.followers) : '—'}
                            </span>
                          </span>
                          {account.followers !== undefined && (
                            <span className="mt-1.5 block h-1.5 overflow-hidden rounded-full bg-gray-100">
                              <span
                                className="block h-full origin-left rounded-full bg-gray-900 motion-safe:animate-[grow_1.1s_ease-out_both] rtl:origin-right"
                                style={{ width: `${Math.max(share, 4)}%` }}
                              />
                            </span>
                          )}
                          {account.engagementRate !== undefined && (
                            <span className="mt-1 block text-xs text-gray-500">
                              {t('profile.engagement', { value: account.engagementRate })}
                            </span>
                          )}
                        </span>
                        <FontAwesomeIcon
                          icon={faArrowUpRightFromSquare}
                          className="shrink-0 text-[10px] text-gray-300 transition group-hover:text-gray-700"
                        />
                      </a>
                    </li>
                  )
                })}
              </ul>
            )}
            {person.websiteUrl && (
              <a
                href={person.websiteUrl}
                target="_blank"
                rel="noopener noreferrer nofollow"
                className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-xl border border-gray-200 px-4 py-2.5 text-sm font-medium text-gray-800 transition hover:border-gray-900 hover:bg-gray-900 hover:text-white"
              >
                <FontAwesomeIcon icon={faGlobe} />
                {t('profile.website')}
              </a>
            )}
          </section>

          <section className="px-1 text-xs text-gray-500">
            <p>
              {t('profile.sources', {
                date: new Date(person.updatedAt).toLocaleDateString(i18n.language),
              })}
            </p>
            {wikipedia && (
              <p className="mt-2">
                {t('profile.sourceLabel')}{' '}
                <a
                  href={wikipedia}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="underline hover:text-gray-700"
                >
                  Wikipedia
                </a>
              </p>
            )}
            {credit && (
              <p className="mt-2">
                {t('profile.photoLabel')}{' '}
                <a
                  href={credit.sourceUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="underline hover:text-gray-700"
                >
                  {credit.provider}
                </a>
                {credit.author && <> · {credit.author}</>}
                {' · '}
                {credit.licenseUrl ? (
                  <a
                    href={credit.licenseUrl}
                    target="_blank"
                    rel="noopener noreferrer license"
                    className="underline hover:text-gray-700"
                  >
                    {credit.license}
                  </a>
                ) : (
                  credit.license
                )}
              </p>
            )}
            <ReportProfileLink slug={person.slug} />
          </section>
        </aside>
      </div>

      {viewing && photo && (
        <PhotoLightbox
          src={photo}
          name={person.name}
          caption={person.headline}
          verified={person.verified}
          onClose={() => setViewing(false)}
        />
      )}
    </div>
  )
}

export default Profile
