import { useTranslation } from 'react-i18next'
import { Link, useParams } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import {
  faArrowRight,
  faBuilding,
  faBullhorn,
  faCalendarDays,
  faFileSignature,
  faStar,
  faUsers,
} from '@fortawesome/free-solid-svg-icons'
import { getDirectoryReviews } from '../../api/directory'
import { businessDetailQuery, directoryReviewsQuery } from '../../api/queries'
import { ReviewsSection } from '../../components/agreements/PublicReviews'
import { useCampaignFormat } from '../../components/campaigns/campaignFormat'
import { BackLink, DetailState, DirectoryHeader } from '../../components/directory/DirectoryDetail'
import { DETAIL_CARD, rise } from '../../components/profile/profileStyles'
import { categoryIcon } from '../../constants/services'
import { fromTalent } from '../../components/directory/directoryUtils'

// /businesses/:id -> ek business / organization ki public tafseel
function BusinessDetailPage() {
  const { t, i18n } = useTranslation()
  const { id = '' } = useParams()
  const format = useCampaignFormat()
  const { data, isLoading } = useQuery(businessDetailQuery(id))
  const { data: reviews } = useQuery({ ...directoryReviewsQuery('businesses', id), retry: false })

  if (!data) return <DetailState loading={isLoading} backTo="/businesses" />
  const { business, campaigns } = data
  const subtitle = [
    business.organizationType && t(`orgType.${business.organizationType}`),
    business.industry,
    business.companySize && t('directory.employees', { size: business.companySize }),
  ]
    .filter(Boolean)
    .join(' · ')

  return (
    <div className="space-y-6">
      <BackLink to="/businesses" label={t('directory.backToBusinesses')} />
      <DirectoryHeader
        entry={business}
        icon={faBuilding}
        shape="square"
        subtitle={subtitle}
        stats={[
          {
            icon: faStar,
            value: business.rating?.count ? business.rating.average.toFixed(1) : '—',
            label: business.rating?.count
              ? t('profile.reviewsCount', { count: business.rating.count })
              : t('agreements.noRatings'),
            href: '#reviews',
          },
          {
            icon: faFileSignature,
            value: business.completedWork,
            label: t('directory.completedLabel'),
          },
          { icon: faBullhorn, value: campaigns.length, label: t('directory.openCampaigns') },
          {
            icon: faCalendarDays,
            value: new Date(business.joinedAt).toLocaleDateString(i18n.language, {
              month: 'short',
              year: 'numeric',
            }),
            label: t('directory.memberSince'),
          },
        ]}
      />

      <div className="grid gap-6 md:grid-cols-[1fr_340px]">
        <div className="min-w-0 space-y-6">
          {business.description && (
            <section className={DETAIL_CARD} style={rise(2)}>
              <h2 className="font-display text-xl font-bold">{t('directory.aboutBusiness')}</h2>
              <p className="mt-3 whitespace-pre-line leading-relaxed text-gray-700">
                {business.description}
              </p>
            </section>
          )}

          <div className="motion-safe:animate-fade-up" style={rise(3)}>
            <ReviewsSection
              title={t('directory.reviewsFromTalent')}
              firstPage={
                reviews && { rating: reviews.rating, reviews: reviews.reviews.map(fromTalent) }
              }
              allKey={['directory', 'businesses', id, 'reviews', 'all']}
              loadPage={async (page, limit) => {
                const result = await getDirectoryReviews('businesses', id, page, limit)
                return { ...result, reviews: result.reviews.map(fromTalent) }
              }}
            />
          </div>
          {reviews?.rating.count === 0 && (
            <section id="reviews" className={DETAIL_CARD} style={rise(3)}>
              <h2 className="font-display text-xl font-bold">{t('directory.reviewsFromTalent')}</h2>
              <p className="mt-2 text-sm text-gray-500">{t('directory.noReviewsBusiness')}</p>
            </section>
          )}
        </div>

        <aside className="min-w-0 space-y-6">
          <section className={DETAIL_CARD} style={rise(2)}>
            <h2 className="flex items-center gap-2 font-display text-xl font-bold">
              <FontAwesomeIcon icon={faBullhorn} className="text-base text-gray-400" />
              {t('directory.openCampaigns')}
            </h2>
            {campaigns.length === 0 ? (
              <p className="mt-2 text-sm text-gray-500">{t('directory.noOpenCampaigns')}</p>
            ) : (
              <ul className="mt-4 space-y-3">
                {campaigns.map((campaign) => (
                  <li key={campaign._id}>
                    <Link
                      to={`/campaigns/${campaign._id}`}
                      className="group block rounded-2xl border border-gray-200 p-4 transition duration-300 hover:-translate-y-0.5 hover:border-gray-900 hover:shadow-md"
                    >
                      <p className="flex items-start justify-between gap-2 font-semibold text-gray-900">
                        <span className="min-w-0">{campaign.title}</span>
                        <FontAwesomeIcon
                          icon={faArrowRight}
                          className="mt-1 shrink-0 text-xs text-gray-300 transition group-hover:translate-x-1 group-hover:text-gray-900 rtl:rotate-180 rtl:group-hover:-translate-x-1"
                        />
                      </p>
                      {format.budget(campaign) && (
                        <p className="mt-1 font-display text-lg font-bold text-gray-900">
                          {format.budget(campaign)}
                        </p>
                      )}
                      <p className="mt-2 flex flex-wrap items-center gap-1.5 text-xs text-gray-600">
                        <span className="inline-flex items-center gap-1 rounded-full bg-gray-100 px-2.5 py-1">
                          <FontAwesomeIcon icon={categoryIcon(campaign.category)} className="text-gray-400" />
                          {t(`services.category.${campaign.category}`)}
                        </span>
                        <span className="inline-flex items-center gap-1 rounded-full bg-gray-100 px-2.5 py-1">
                          <FontAwesomeIcon icon={faUsers} className="text-gray-400" />
                          {t('campaigns.slots', { count: campaign.slots })}
                        </span>
                      </p>
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </section>
        </aside>
      </div>
    </div>
  )
}

export default BusinessDetailPage
