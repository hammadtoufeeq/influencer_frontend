import { useTranslation } from 'react-i18next'
import { Link, useParams } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import {
  faArrowUpRightFromSquare,
  faCalendarDays,
  faLayerGroup,
  faStar,
  faUserTie,
  faUsers,
} from '@fortawesome/free-solid-svg-icons'
import { getDirectoryReviews } from '../../api/directory'
import { directoryReviewsQuery, managerDetailQuery } from '../../api/queries'
import { Photo } from '../../components/home/HomeSections'
import VerifiedBadge from '../../components/VerifiedBadge'
import { ReviewsSection } from '../../components/agreements/PublicReviews'
import { BackLink, DetailState, DirectoryHeader } from '../../components/directory/DirectoryDetail'
import { fromTalent } from '../../components/directory/directoryUtils'
import { DETAIL_CARD, PLATFORM_TONES, rise } from '../../components/profile/profileStyles'
import { PLATFORM_ICONS, PLATFORM_LABELS } from '../../constants/people'
import { formatCount } from '../../utils/format'

// /managers/:id -> ek manager / agent ki public tafseel aur jin talents ko represent karta hai
function ManagerDetailPage() {
  const { t, i18n } = useTranslation()
  const { id = '' } = useParams()
  const { data, isLoading } = useQuery(managerDetailQuery(id))
  const { data: reviews } = useQuery({ ...directoryReviewsQuery('managers', id), retry: false })

  if (!data) return <DetailState loading={isLoading} backTo="/managers" />
  const { manager, talents } = data

  return (
    <div className="space-y-6">
      <BackLink to="/managers" label={t('directory.backToManagers')} />
      <DirectoryHeader
        entry={manager}
        icon={faUserTie}
        subtitle={manager.agencyName || t('manager.independent')}
        stats={[
          { icon: faUsers, value: manager.talents, label: t('directory.talentsLabel', { count: manager.talents }) },
          {
            icon: faStar,
            value: manager.rating?.count ? manager.rating.average.toFixed(1) : '—',
            label: manager.rating?.count
              ? t('profile.reviewsCount', { count: manager.rating.count })
              : t('agreements.noRatings'),
            href: '#reviews',
          },
          { icon: faLayerGroup, value: manager.socialAccounts.length, label: t('profile.platforms') },
          {
            icon: faCalendarDays,
            value: new Date(manager.joinedAt).toLocaleDateString(i18n.language, {
              month: 'short',
              year: 'numeric',
            }),
            label: t('directory.memberSince'),
          },
        ]}
      />

      <div className="grid gap-6 md:grid-cols-[1fr_340px]">
        <div className="min-w-0 space-y-6">
          {manager.bio && (
            <section className={DETAIL_CARD} style={rise(2)}>
              <h2 className="font-display text-xl font-bold">{t('directory.aboutManager')}</h2>
              <p className="mt-3 whitespace-pre-line leading-relaxed text-gray-700">{manager.bio}</p>
            </section>
          )}

          <section className={DETAIL_CARD} style={rise(3)}>
            <h2 className="font-display text-xl font-bold">{t('directory.representedTalents')}</h2>
            {talents.length === 0 ? (
              <p className="mt-2 text-sm text-gray-500">{t('directory.noRepresentedTalents')}</p>
            ) : (
              <ul className="mt-4 grid gap-3 sm:grid-cols-2">
                {talents.map((person) => (
                  <li key={person._id}>
                    <Link
                      to={`/people/${person.slug}`}
                      className="group flex items-center gap-3 rounded-2xl border border-gray-200 p-3 transition duration-300 hover:-translate-y-0.5 hover:border-gray-900 hover:shadow-md"
                    >
                      <span className="relative shrink-0 rounded-full p-0.5">
                        <span
                          aria-hidden="true"
                          className="absolute inset-0 rounded-full bg-[conic-gradient(from_0deg,#111827,#9ca3af,#f9fafb,#6b7280,#111827)] opacity-0 transition group-hover:opacity-100"
                        />
                        <Photo
                          person={person}
                          className="relative h-12 w-12 rounded-full text-xs ring-2 ring-white"
                        />
                      </span>
                      <span className="min-w-0">
                        <span className="flex items-center gap-1.5 font-semibold text-gray-900">
                          <span className="truncate">{person.name}</span>
                          {person.verified && <VerifiedBadge />}
                        </span>
                        <span className="block truncate text-xs text-gray-500">
                          {[
                            person.headline,
                            person.totalFollowers
                              ? t('site.followers', { value: formatCount(person.totalFollowers) })
                              : null,
                          ]
                            .filter(Boolean)
                            .join(' · ')}
                        </span>
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </section>

          <div className="motion-safe:animate-fade-up" style={rise(4)}>
            <ReviewsSection
              title={t('directory.reviewsFromTalent')}
              firstPage={
                reviews && { rating: reviews.rating, reviews: reviews.reviews.map(fromTalent) }
              }
              allKey={['directory', 'managers', id, 'reviews', 'all']}
              loadPage={async (page, limit) => {
                const result = await getDirectoryReviews('managers', id, page, limit)
                return { ...result, reviews: result.reviews.map(fromTalent) }
              }}
            />
          </div>
          {reviews?.rating.count === 0 && (
            <section id="reviews" className={DETAIL_CARD} style={rise(4)}>
              <h2 className="font-display text-xl font-bold">{t('directory.reviewsFromTalent')}</h2>
              <p className="mt-2 text-sm text-gray-500">{t('directory.noReviewsManager')}</p>
            </section>
          )}
        </div>

        <aside className="min-w-0 space-y-6">
          {manager.socialAccounts.length > 0 && (
            <section className={DETAIL_CARD} style={rise(2)}>
              <h2 className="font-display text-xl font-bold">{t('personForm.social')}</h2>
              <ul className="mt-4 space-y-2">
                {manager.socialAccounts.map((account) => (
                  <li key={account.url}>
                    <a
                      href={account.url}
                      target="_blank"
                      rel="noopener noreferrer nofollow"
                      className="group flex items-center gap-3 rounded-2xl p-2 transition hover:bg-gray-50"
                    >
                      <span
                        className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl shadow-sm transition group-hover:scale-110 ${
                          PLATFORM_TONES[account.platform] ?? 'bg-gray-100 text-gray-700'
                        }`}
                      >
                        <FontAwesomeIcon icon={PLATFORM_ICONS[account.platform]} />
                      </span>
                      <span className="flex-1 text-sm font-medium text-gray-900">
                        {PLATFORM_LABELS[account.platform]}
                      </span>
                      <FontAwesomeIcon
                        icon={faArrowUpRightFromSquare}
                        className="text-[10px] text-gray-300 transition group-hover:text-gray-700"
                      />
                    </a>
                  </li>
                ))}
              </ul>
            </section>
          )}
        </aside>
      </div>
    </div>
  )
}

export default ManagerDetailPage
