import { useTranslation } from 'react-i18next'
import { taxName } from '../utils/taxonomy'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faCircle, faGlobe, faLanguage, faLocationDot, faUserTie } from '@fortawesome/free-solid-svg-icons'
import { Link, useParams } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import axios from 'axios'
import { personQuery } from '../api/queries'
import Avatar from '../components/Avatar'
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
import { PLATFORM_ICONS, PLATFORM_LABELS, STATUS_LABELS } from '../constants/people'
import type { TaxonomyItem } from '../types/person'
import { countryName, formatCount, languageName } from '../utils/format'

function TagList({ title, items, param }: { title: string; items: TaxonomyItem[]; param: string }) {
  if (items.length === 0) return null
  return (
    <div>
      <h3 className="text-sm font-medium text-gray-500">{title}</h3>
      <div className="mt-2 flex flex-wrap gap-2">
        {items.map((item) => (
          <Link
            key={item._id}
            to={`/search?${param}=${item.slug}`}
            className="rounded-full bg-gray-100 px-3 py-1 text-sm hover:bg-gray-200"
          >
            {taxName(item)}
          </Link>
        ))}
      </div>
    </div>
  )
}

function Profile() {
  const { t, i18n } = useTranslation()
  const { slug = '' } = useParams()

  const { data: person, isLoading, error } = useQuery({ ...personQuery(slug), retry: false })

  if (isLoading) return <p className="text-center text-gray-500">{t('common.loading')}</p>

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

  return (
    <div className="space-y-6">
      {person.isDemo && (
        <p className="rounded-xl bg-amber-50 px-4 py-3 text-sm text-amber-800">
          {t('profile.demo')}
        </p>
      )}

      {/* Identity */}
      <section className="rounded-2xl bg-white p-6 shadow-sm md:p-8">
        <div className="flex flex-col gap-5 sm:flex-row sm:items-start">
          <Avatar name={person.name} photoUrl={person.photoUrl} size="lg" />
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="text-2xl font-bold md:text-3xl">{person.name}</h1>
              {person.verified && <VerifiedBadge />}
              {!person.claimedBy && <UnclaimedBadge />}
            </div>
            {person.headline && <p className="mt-1 text-gray-600">{person.headline}</p>}
            {/* Sitare: click pe neeche reviews tak */}
            {person.rating && (
              <a href="#reviews" className="mt-2 inline-flex rounded-md hover:opacity-80">
                <RatingBadge rating={person.rating} size="md" />
              </a>
            )}
            {/* Verified manager ke zariye kaam karta hai */}
            {person.representedBy && (
              <p className="mt-2 inline-flex items-center gap-1.5 rounded-full bg-gray-100 px-3 py-1 text-xs text-gray-700">
                <FontAwesomeIcon icon={faUserTie} className="text-gray-500" />
                {person.representedBy.agencyName
                  ? t('manager.representedByAgency', person.representedBy)
                  : t('manager.representedBy', { name: person.representedBy.name })}
              </p>
            )}
            <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-sm text-gray-500">
              {location && (
                <span>
                  <FontAwesomeIcon icon={faLocationDot} className="me-1.5 text-gray-400" />
                  {location}
                </span>
              )}
              {person.languages.length > 0 && (
                <span>
                  <FontAwesomeIcon icon={faLanguage} className="me-1.5 text-gray-400" />
                  {person.languages.map(languageName).join(', ')}
                </span>
              )}
              <span>
                <FontAwesomeIcon
                  icon={faCircle}
                  className={`me-1.5 text-[8px] align-middle ${person.status === 'hireable' ? 'text-green-500' : 'text-gray-400'}`}
                />
                {STATUS_LABELS[person.status]}
              </span>
            </div>
          </div>

          {/* Verified business ke liye Hire, baqi sab ke liye Contact (agle phase mein) */}
          <div className="flex flex-col gap-2 sm:w-44">
            <HireAction person={person} />
            <SaveToShortlist personId={person._id} personName={person.name} variant="button" />
            <RepresentAction person={person} />
            <ClaimAction person={person} />
          </div>
        </div>
      </section>

      <div className="grid gap-6 md:grid-cols-[1fr_320px]">
        <div className="space-y-6">
          {person.bio && (
            <section className="rounded-2xl bg-white p-6 shadow-sm">
              <h2 className="text-lg font-semibold">{t('profile.about')}</h2>
              <p className="mt-3 whitespace-pre-line text-gray-700">{person.bio}</p>
            </section>
          )}

          <PublicServices services={person.services ?? []} />

          <PublicReviews slug={person.slug} />

          <section className="space-y-4 rounded-2xl bg-white p-6 shadow-sm">
            <TagList
              title={t('profile.professions')}
              items={person.professions}
              param="profession"
            />
            <TagList title={t('profile.industries')} items={person.industries} param="industry" />
            <TagList title={t('profile.topics')} items={person.topics} param="topic" />
          </section>
        </div>

        {/* Influence: har number alag, koi "mystery score" nahi */}
        <aside className="space-y-6">
          <PublicAvailability availability={person.availability} />
          <section className="rounded-2xl bg-white p-6 shadow-sm">
            <h2 className="text-lg font-semibold">{t('profile.influence')}</h2>
            {person.totalFollowers > 0 || person.socialAccounts.length > 0 ? (
              <>
                <p className="mt-3 text-3xl font-bold">{formatCount(person.totalFollowers)}</p>
                <p className="text-sm text-gray-500">{t('profile.totalFollowers')}</p>
              </>
            ) : (
              // Koi number ghar ke nahi likhte: claim / verify ke baad aate hain
              <p className="mt-3 text-sm text-gray-500">
                {person.claimedBy ? t('profile.noMetricsClaimed') : t('profile.noMetrics')}
              </p>
            )}

            {person.socialAccounts.length > 0 && (
              <ul className="mt-5 divide-y divide-gray-100">
                {person.socialAccounts.map((account) => (
                  <li
                    key={`${account.platform}-${account.url}`}
                    className="flex items-center justify-between py-2 text-sm"
                  >
                    <a
                      href={account.url}
                      target="_blank"
                      rel="noopener noreferrer nofollow"
                      className="inline-flex items-center gap-2 hover:underline"
                    >
                      <FontAwesomeIcon
                        icon={PLATFORM_ICONS[account.platform]}
                        className="w-4 text-base text-gray-700"
                      />
                      {PLATFORM_LABELS[account.platform]}
                    </a>
                    <span className="text-end text-gray-600">
                      {account.followers !== undefined && formatCount(account.followers)}
                      {account.engagementRate !== undefined && (
                        <span className="ms-2 text-xs text-gray-400">
                          {t('profile.engagement', { value: account.engagementRate })}
                        </span>
                      )}
                    </span>
                  </li>
                ))}
              </ul>
            )}
            {person.websiteUrl && (
              <a
                href={person.websiteUrl}
                target="_blank"
                rel="noopener noreferrer nofollow"
                className="mt-4 inline-flex items-center gap-2 text-sm underline"
              >
                <FontAwesomeIcon icon={faGlobe} />
                {t('profile.website')}
              </a>
            )}
          </section>

          <section className="text-xs text-gray-500">
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
    </div>
  )
}

export default Profile
