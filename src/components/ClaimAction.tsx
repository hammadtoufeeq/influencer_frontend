import { useTranslation } from 'react-i18next'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faCircleCheck, faHourglassHalf, faPen } from '@fortawesome/free-solid-svg-icons'
import { Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import toast from 'react-hot-toast'
import { myClaimsQuery, myProfileQuery } from '../api/queries'
import { isOpenClaim } from '../types/claim'
import { useAuth } from '../hooks/useAuth'
import type { Person } from '../types/person'

const outline = 'rounded-lg border border-gray-300 px-4 py-2 text-center text-sm hover:bg-gray-100'

// Profile page pe Claim wala hissa. Faisla user ki apni TAAZA maloomat se hota hai
// (meri profile kaunsi hai, mera claim pending hai?), kyunke public profile ka data
// cache se aata hai aur thoda purana ho sakta hai
function ClaimAction({ person }: { person: Person }) {
  const { t } = useTranslation()
  const { user } = useAuth()
  const isTalent = user?.role === 'talent'
  const myProfile = useQuery({ ...myProfileQuery, enabled: isTalent })
  const myClaims = useQuery({ ...myClaimsQuery, enabled: isTalent })

  // Talent ki maloomat aane tak kuch na dikhao (button flash na ho)
  if (isTalent && (myProfile.isLoading || myClaims.isLoading)) return null

  // 1. Ye meri apni profile hai
  if (isTalent && myProfile.data?._id === person._id) {
    return (
      <>
        <span className="rounded-lg bg-green-50 px-4 py-2 text-center text-sm text-green-700">
          <FontAwesomeIcon icon={faCircleCheck} className="me-1.5" />
          {t('claimAction.yourProfile')}
        </span>
        <Link to="/dashboard/profile/edit" className={outline}>
          <FontAwesomeIcon icon={faPen} className="me-1.5" />
          {t('claimAction.editProfile')}
        </Link>
      </>
    )
  }

  // 2. Kisi aur ki claimed profile
  if (person.claimedBy) {
    return (
      <span className="rounded-lg bg-green-50 px-4 py-2 text-center text-sm text-green-700">
        <FontAwesomeIcon icon={faCircleCheck} className="me-1.5" />
        {t('claimAction.claimed')}
      </span>
    )
  }

  // 3. Login nahi: login ke baad seedha claim form
  if (!user) {
    return (
      <Link to="/login" state={{ from: `/people/${person.slug}/claim` }} className={outline}>
        {t('claimAction.claim')}
      </Link>
    )
  }

  // 4. Business / organization waghera claim nahi kar sakte
  if (!isTalent) {
    return (
      <button
        onClick={() => toast(t('claimAction.onlyTalent'))}
        className={`${outline} text-gray-500`}
      >
        {t('claimAction.claim')}
      </button>
    )
  }

  // 5. Talent ki pehle se apni profile hai: kahin bhi Claim nahi
  if (myProfile.data) return null

  // 6. Claim pending: sirf usi profile pe status, baqi sab pe kuch nahi
  const pending = myClaims.data?.find((claim) => isOpenClaim(claim.status))
  if (pending) {
    return pending.person?._id === person._id ? (
      <span className="rounded-lg bg-amber-50 px-4 py-2 text-center text-sm text-amber-800">
        <FontAwesomeIcon icon={faHourglassHalf} className="me-1.5" />
        {t('claimAction.underReview')}
      </span>
    ) : null
  }

  // 7. Talent jis ki koi profile nahi
  return (
    <Link to={`/people/${person.slug}/claim`} className={outline}>
      {t('claimAction.claim')}
    </Link>
  )
}

export default ClaimAction
