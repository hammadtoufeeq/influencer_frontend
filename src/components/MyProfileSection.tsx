import { useTranslation } from 'react-i18next'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import {
  faArrowRight,
  faArrowUpRightFromSquare,
  faPen,
  faPlus,
} from '@fortawesome/free-solid-svg-icons'
import { Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { myClaimsQuery, myProfileQuery } from '../api/queries'
import Avatar from './Avatar'
import ClaimProgress from './ClaimProgress'
import { claimPersonName, isOpenClaim } from '../types/claim'

// Talent dashboard ka sab se upar wala hissa: meri profile ki halat
function MyProfileSection() {
  const { t } = useTranslation()
  const { data: profile, isLoading: profileLoading } = useQuery(myProfileQuery)
  const { data: claims, isLoading: claimsLoading } = useQuery(myClaimsQuery)

  if (profileLoading || claimsLoading) {
    return <div className="h-28 animate-pulse rounded-2xl bg-white shadow-sm" />
  }

  const box = 'rounded-2xl border bg-white p-5 shadow-sm md:p-6'

  // 1. Profile mil chuki hai
  if (profile) {
    return (
      <section className={`${box} border-green-200`}>
        <p className="text-xs font-medium uppercase tracking-wide text-green-700">
          {t('myProfile.label')}
        </p>
        <div className="mt-3 flex flex-col gap-4 sm:flex-row sm:items-center">
          <Avatar name={profile.name} photoUrl={profile.photoUrl} />
          <div className="min-w-0 flex-1">
            <h2 className="truncate text-lg font-semibold">{profile.name}</h2>
            {profile.headline && (
              <p className="truncate text-sm text-gray-600">{profile.headline}</p>
            )}
          </div>
          <div className="flex gap-2">
            <Link
              to={`/people/${profile.slug}`}
              className="rounded-lg border border-gray-300 px-4 py-2 text-sm hover:bg-gray-100"
            >
              {t('myProfile.view')}{' '}
              <FontAwesomeIcon icon={faArrowUpRightFromSquare} className="ms-1 text-xs" />
            </Link>
            <Link
              to="/dashboard/profile/edit"
              className="rounded-lg bg-brand px-4 py-2 text-sm font-medium text-on-brand hover:bg-brand-hover"
            >
              <FontAwesomeIcon icon={faPen} className="me-1.5" />
              {t('claimAction.editProfile')}
            </Link>
          </div>
        </div>
      </section>
    )
  }

  const latest = claims?.[0]

  // 2. Claim chal raha hai (code bhejna / daalna / approval)
  if (latest && isOpenClaim(latest.status)) return <ClaimProgress claim={latest} />

  // 3. Koi profile nahi (ya pichla claim reject hua)
  return (
    <section className={`${box} border-gray-200`}>
      {latest?.status === 'rejected' && (
        <p className="mb-4 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">
          {t('myProfile.rejected', { name: claimPersonName(latest, t('claims.deletedProfile')), reason: latest.rejectionReason })}
        </p>
      )}
      <p className="text-xs font-medium uppercase tracking-wide text-gray-500">
        {t('myProfile.label')}
      </p>
      <h2 className="mt-2 text-lg font-semibold">{t('myProfile.findTitle')}</h2>
      <p className="mt-1 text-sm text-gray-600">
        {t('myProfile.findBody')}
      </p>
      <div className="mt-4 flex flex-wrap items-center gap-3">
        <Link
          to="/search"
          className="inline-block rounded-lg bg-brand px-4 py-2 text-sm font-medium text-on-brand hover:bg-brand-hover"
        >
          {t('myProfile.findButton')}{' '}
          <FontAwesomeIcon icon={faArrowRight} className="ms-1 rtl:rotate-180" />
        </Link>
        {/* Profile na mile to khud bhejo */}
        <Link
          to="/my-profile/new"
          className="inline-flex items-center gap-1.5 rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium hover:bg-gray-100"
        >
          <FontAwesomeIcon icon={faPlus} className="text-xs" />
          {t('newProfile.cta')}
        </Link>
      </div>
      <p className="mt-2 text-xs text-gray-500">{t('newProfile.ctaHint')}</p>
    </section>
  )
}

export default MyProfileSection
