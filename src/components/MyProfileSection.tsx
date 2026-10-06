import { Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { myClaimsQuery, myProfileQuery } from '../api/queries'
import Avatar from './Avatar'
import ClaimProgress from './ClaimProgress'
import { isOpenClaim } from '../types/claim'

// Talent dashboard ka sab se upar wala hissa: meri profile ki halat
function MyProfileSection() {
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
          Your public profile
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
              View ↗
            </Link>
            <Link
              to="/dashboard/profile/edit"
              className="rounded-lg bg-gray-900 px-4 py-2 text-sm font-medium text-white hover:bg-gray-800"
            >
              ✎ Edit profile
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
    <section className={box}>
      {latest?.status === 'rejected' && (
        <p className="mb-4 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">
          Your claim for <strong>{latest.person.name}</strong> was not approved:{' '}
          {latest.rejectionReason}
        </p>
      )}
      <p className="text-xs font-medium uppercase tracking-wide text-gray-500">
        Your public profile
      </p>
      <h2 className="mt-2 text-lg font-semibold">Find your profile and claim it</h2>
      <p className="mt-1 text-sm text-gray-600">
        Search for your name. On your profile page, click{' '}
        <strong>&quot;Is this you? Claim&quot;</strong>.
      </p>
      <Link
        to="/search"
        className="mt-4 inline-block rounded-lg bg-gray-900 px-4 py-2 text-sm font-medium text-white hover:bg-gray-800"
      >
        Find my profile →
      </Link>
    </section>
  )
}

export default MyProfileSection
