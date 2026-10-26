import { useEffect, useState } from 'react'
import { createPortal } from 'react-dom'
import { useTranslation } from 'react-i18next'
import { useInfiniteQuery, useQuery } from '@tanstack/react-query'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faXmark } from '@fortawesome/free-solid-svg-icons'
import { getPersonReviews } from '../../api/agreements'
import { personReviewsQuery } from '../../api/queries'
import { Link } from 'react-router-dom'
import Avatar from '../Avatar'
import { initials } from '../../utils/format'
import { formatDate } from '../../utils/adminFormat'
import RatingBadge from './RatingBadge'
import Stars from './Stars'

const ALL_PAGE_SIZE = 10

// Har jagah ki review isi shakal mein (talent, business ya manager ke baare mein)
export interface ReviewItemData {
  _id: string
  rating: number
  comment?: string
  createdAt: string
  // Likhne wala (business ya talent) aur us ka page (agar ho)
  name?: string
  href?: string
  photoUrl?: string
}

interface ReviewPage {
  rating: { average: number | null; count: number }
  reviews: ReviewItemData[]
  meta: { page: number; limit: number; total: number }
}

// Ek review: likhne wale ka naam, sitare, tareekh aur likhai
function ReviewItem({ review }: { review: ReviewItemData }) {
  const { t } = useTranslation()
  const name = review.name ?? t('reviews.removedBusiness')
  return (
    <li className="flex gap-3 py-4">
      {review.photoUrl ? (
        <Avatar name={name} photoUrl={review.photoUrl} size="sm" />
      ) : (
        <span
          aria-hidden="true"
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gray-900 text-xs font-semibold text-white"
        >
          {initials(name)}
        </span>
      )}
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center justify-between gap-x-3 gap-y-0.5">
          {review.href ? (
            <Link
              to={review.href}
              className="truncate text-sm font-medium text-gray-900 hover:underline"
            >
              {name}
            </Link>
          ) : (
            <span className="truncate text-sm font-medium text-gray-900">{name}</span>
          )}
          <span className="text-xs text-gray-500">{formatDate(review.createdAt)}</span>
        </div>
        <Stars value={review.rating} size="text-xs" />
        {review.comment && (
          <p className="mt-1.5 text-sm whitespace-pre-line text-gray-700">{review.comment}</p>
        )}
      </div>
    </li>
  )
}

// Saari reviews: 10-10 kar ke, neeche "Load more"
function AllReviewsDialog({
  allKey,
  loadPage,
  summary,
  onClose,
}: {
  allKey: readonly unknown[]
  loadPage: (page: number, limit: number) => Promise<ReviewPage>
  summary: ReviewPage['rating']
  onClose: () => void
}) {
  const { t } = useTranslation()
  const { data, isLoading, fetchNextPage, hasNextPage, isFetchingNextPage } = useInfiniteQuery({
    queryKey: allKey,
    queryFn: ({ pageParam }) => loadPage(pageParam, ALL_PAGE_SIZE),
    initialPageParam: 1,
    getNextPageParam: (last) =>
      last.meta.page * last.meta.limit < last.meta.total ? last.meta.page + 1 : undefined,
  })
  const reviews = data?.pages.flatMap((page) => page.reviews) ?? []

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose()
    document.addEventListener('keydown', onKey)
    // Peeche ka page scroll na ho
    const overflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', onKey)
      document.body.style.overflow = overflow
    }
  }, [onClose])

  return createPortal(
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 sm:items-center sm:p-4"
      onClick={onClose}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="all-reviews-title"
        onClick={(e) => e.stopPropagation()}
        className="flex max-h-[90vh] w-full max-w-xl flex-col rounded-t-2xl bg-white shadow-xl sm:rounded-2xl"
      >
        <div className="flex items-start justify-between gap-3 border-b border-gray-100 px-6 py-4">
          <div>
            <h2 id="all-reviews-title" className="text-lg font-semibold text-gray-900">
              {t('reviews.allTitle')}
            </h2>
            <div className="mt-1">
              <RatingBadge
                rating={summary.average === null ? null : { ...summary, average: summary.average }}
                size="md"
              />
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label={t('settings.close')}
            className="rounded-lg p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-700"
          >
            <FontAwesomeIcon icon={faXmark} />
          </button>
        </div>
        <div className="overflow-y-auto px-6">
          {isLoading ? (
            <div className="space-y-3 py-4">
              {Array.from({ length: 4 }, (_, i) => (
                <div key={i} className="h-16 animate-pulse rounded-xl bg-gray-100" />
              ))}
            </div>
          ) : (
            <ul className="divide-y divide-gray-100">
              {reviews.map((review) => (
                <ReviewItem key={review._id} review={review} />
              ))}
            </ul>
          )}
          {hasNextPage && (
            <div className="pb-5 text-center">
              <button
                type="button"
                onClick={() => fetchNextPage()}
                disabled={isFetchingNextPage}
                className="rounded-xl border border-gray-300 px-4 py-2 text-sm font-medium hover:bg-gray-50 disabled:opacity-60"
              >
                {isFetchingNextPage ? t('reviews.loading') : t('reviews.loadMore')}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>,
    document.body,
  )
}

// Reviews ka hissa: pehli 4, zyada hon to "Show all reviews" (koi na ho to kuch nahi).
// Talent, business aur manager teeno ke pages pe
export function ReviewsSection({
  title,
  firstPage,
  allKey,
  loadPage,
}: {
  title: string
  firstPage?: Omit<ReviewPage, 'meta'>
  allKey: readonly unknown[]
  loadPage: (page: number, limit: number) => Promise<ReviewPage>
}) {
  const { t } = useTranslation()
  const [showAll, setShowAll] = useState(false)
  if (!firstPage || firstPage.rating.count === 0) return null
  const { rating } = firstPage

  return (
    <section id="reviews" className="scroll-mt-24 rounded-3xl bg-white p-6 shadow-sm ring-1 ring-gray-200/70">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-lg font-semibold">{title}</h2>
        <RatingBadge
          rating={rating.average === null ? null : { ...rating, average: rating.average }}
          size="md"
        />
      </div>
      <ul className="mt-2 divide-y divide-gray-100">
        {firstPage.reviews.map((review) => (
          <ReviewItem key={review._id} review={review} />
        ))}
      </ul>
      {rating.count > firstPage.reviews.length && (
        <button
          type="button"
          onClick={() => setShowAll(true)}
          className="mt-2 w-full rounded-xl border border-gray-300 px-4 py-2.5 text-sm font-medium text-gray-800 hover:bg-gray-50"
        >
          {t('reviews.showAll', { count: rating.count })}
        </button>
      )}
      {showAll && (
        <AllReviewsDialog
          allKey={allKey}
          loadPage={loadPage}
          summary={rating}
          onClose={() => setShowAll(false)}
        />
      )}
    </section>
  )
}

// Talent ki reviews businesses ki taraf se
const fromBusiness = (review: {
  _id: string
  rating: number
  comment?: string
  createdAt: string
  business?: string
}): ReviewItemData => ({ ...review, name: review.business })

// Profile page: businesses ki talent ke baare mein reviews
function PublicReviews({ slug }: { slug: string }) {
  const { t } = useTranslation()
  const { data } = useQuery({ ...personReviewsQuery(slug), retry: false })
  return (
    <ReviewsSection
      title={t('agreements.publicReviews')}
      firstPage={data && { rating: data.rating, reviews: data.reviews.map(fromBusiness) }}
      allKey={['person', slug, 'reviews', 'all']}
      loadPage={async (page, limit) => {
        const result = await getPersonReviews(slug, page, limit)
        return { ...result, reviews: result.reviews.map(fromBusiness) }
      }}
    />
  )
}

export default PublicReviews
